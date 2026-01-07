import type { Plugin, PluginOption, ResolvedConfig, ConfigEnv, ViteDevServer, UserConfig } from 'vite';
import { resolve, join, normalize } from 'path';
import { existsSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, createReadStream } from 'fs';

export interface XHGISPluginOptions {
  /**
   * XH-GIS 资源的基础路径
   * @default '/xh-gis/Assets'
   */
  baseUrl?: string;
  
  /**
   * XH-GIS 包的路径
   * @default 'node_modules/xh-gis'
   */
  xhgisPath?: string;
  
  /**
   * 静态资源目录名称
   * @default 'Assets'
   */
  assetsDir?: string;
  
  /**
   * 指定 public 目录，默认读取 Vite 配置中的 publicDir
   */
  publicDir?: string;
  
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean;
}

function copyDirSync(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory() || (!entry.isFile() && statSync(srcPath).isDirectory())) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * XH-GIS Vite 插件
 * 开发模式：通过 Vite dev server 中间件直接从 node_modules 提供静态资源（类似 vite-plugin-cesium）
 * 构建模式：将资源复制到 public 目录，由 Vite 构建流程处理
 */
function xhgis(options: XHGISPluginOptions = {}): PluginOption {
  const {
    baseUrl = '/xh-gis/Assets',
    xhgisPath = 'node_modules/xh-gis',
    assetsDir = 'Assets',
    publicDir,
    debug = false,
  } = options;

  let root = '';
  let resolvedPublicDir = '';
  let xhgisAssetsPath = '';

  // 自动检测资源路径：优先从 xh-gis 根包，如果不存在则从 @xh-gis/engine 包（workspace 依赖场景）
  function findAssetsPath(rootPath: string, customPath?: string): string {
    // 1. 如果指定了自定义路径且不是默认值，优先使用
    if (customPath && customPath !== 'node_modules/xh-gis') {
      const customAssetsPath = resolve(rootPath, customPath, 'dist', assetsDir);
      if (existsSync(customAssetsPath)) {
        return customAssetsPath;
      }
    }

    // 2. 尝试从 xh-gis 根包获取
    const rootPackagePath = resolve(rootPath, 'node_modules/xh-gis/dist', assetsDir);
    if (existsSync(rootPackagePath)) {
      return rootPackagePath;
    }

    // 3. 尝试从 @xh-gis/engine 包获取（workspace 依赖场景，如 sandcastle）
    const enginePackagePath = resolve(rootPath, 'node_modules/@xh-gis/engine/dist', assetsDir);
    if (existsSync(enginePackagePath)) {
      return enginePackagePath;
    }

    // 4. 回退到默认路径
    return resolve(rootPath, xhgisPath, 'dist', assetsDir);
  }

  return {
    name: 'vite-plugin-xhgis',

    configResolved(config: ResolvedConfig) {
      root = config.root;
      // Vite 7: publicDir 可能是 false | string，需要正确处理
      const vitePublicDir = typeof config.publicDir === 'string' ? config.publicDir : false;
      resolvedPublicDir = publicDir || vitePublicDir || join(root, 'public');
      
      // 自动检测资源路径（支持 workspace 依赖）
      xhgisAssetsPath = findAssetsPath(root, xhgisPath);
      
      if (debug) {
        console.log('[vite-plugin-xhgis] Config resolved:', {
          root,
          baseUrl,
          xhgisPath,
          assetsDir,
          publicDir: resolvedPublicDir,
          assetsPath: xhgisAssetsPath,
          assetsExists: existsSync(xhgisAssetsPath),
        });
      }

      // 只在构建模式下复制资源到 public 目录
      // 开发模式下通过 configureServer 中间件提供资源
      if (config.command === 'build') {
        if (!existsSync(xhgisAssetsPath)) {
          console.warn(`[vite-plugin-xhgis] XH-GIS assets not found at: ${xhgisAssetsPath}`);
          return;
        }
        const targetDir = join(resolvedPublicDir, baseUrl.replace(/^\//, ''));
        try {
          rmSync(targetDir, { recursive: true, force: true });
          mkdirSync(targetDir, { recursive: true });
          copyDirSync(xhgisAssetsPath, targetDir);
          if (debug) {
            console.log(`[vite-plugin-xhgis] Assets copied to public: ${xhgisAssetsPath} -> ${targetDir}`);
          }
        } catch (e) {
          console.error('[vite-plugin-xhgis] Failed to copy assets:', e);
        }
      }
    },

    // 开发模式下通过中间件提供静态资源（类似 vite-plugin-cesium）
    configureServer(server: ViteDevServer) {
      if (!existsSync(xhgisAssetsPath)) {
        console.warn(`[vite-plugin-xhgis] XH-GIS assets not found at: ${xhgisAssetsPath}`);
        return;
      }

      // 设置中间件，将 /xh-gis/Assets/* 请求映射到资源目录
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        // 移除查询参数和 hash，只保留路径部分
        const pathname = url.split('?')[0].split('#')[0];
        
        // 匹配 baseUrl 路径（例如 /xh-gis/Assets/...）
        const baseUrlPath = baseUrl.replace(/^\//, '');
        if (pathname.startsWith(`/${baseUrlPath}/`)) {
          // 移除 baseUrl 前缀，获取相对路径
          const relativePath = pathname.replace(`/${baseUrlPath}/`, '');
          const filePath = resolve(xhgisAssetsPath, relativePath);
          
          // 安全检查：确保文件路径在资源目录内（防止路径遍历攻击）
          const normalizedPath = normalize(filePath);
          const normalizedAssetsPath = normalize(xhgisAssetsPath);
          if (!normalizedPath.startsWith(normalizedAssetsPath)) {
            next();
            return;
          }
          
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            // 设置正确的 Content-Type
            const ext = filePath.split('.').pop()?.toLowerCase();
            const contentTypeMap: Record<string, string> = {
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
              'png': 'image/png',
              'gif': 'image/gif',
              'webp': 'image/webp',
              'svg': 'image/svg+xml',
              'json': 'application/json',
              'txt': 'text/plain',
              'xml': 'application/xml',
            };
            res.setHeader('Content-Type', contentTypeMap[ext || ''] || 'application/octet-stream');
            
            // 流式传输文件，添加错误处理
            const stream = createReadStream(filePath);
            stream.on('error', (err) => {
              if (!res.headersSent) {
                res.statusCode = 500;
                res.end('Internal Server Error');
              }
            });
            stream.pipe(res);
            return;
          }
        }
        next();
      });

      if (debug) {
        console.log(`[vite-plugin-xhgis] Dev server middleware configured for: ${baseUrl}`);
      }
    },

    config(config: UserConfig, env: ConfigEnv) {
      // 定义全局变量，类似 CESIUM_BASE_URL
      const define = config.define || {};
      return {
        define: {
          ...define,
          XH_GIS_BASE_URL: JSON.stringify(baseUrl),
          'process.env.XH_GIS_BASE_URL': JSON.stringify(baseUrl),
        },
      };
    },
  };
}

// 默认导出
export default xhgis;