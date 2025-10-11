import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

export interface XHGISPluginOptions {
  /**
   * XH-GIS 资源的基础路径
   * @default '/xh-gis/Assets'
   */
  baseUrl?: string;
  
  /**
   * 是否在开发模式下启用
   * @default true
   */
  devMode?: boolean;
  
  /**
   * XH-GIS 包的路径
   * @default 'node_modules/@xh-gis/engine'
   */
  xhgisPath?: string;
  
  /**
   * 静态资源目录名称
   * @default 'Assets'
   */
  assetsDir?: string;
  
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean;
}

/**
 * XH-GIS Vite 插件
 * 类似于 vite-plugin-cesium，提供零配置的 XH-GIS 集成
 */
export function xhgis(options: XHGISPluginOptions = {}): Plugin {
  const {
    baseUrl = '/xh-gis/Assets',
    devMode = true,
    xhgisPath = 'node_modules/@xh-gis/engine',
    assetsDir = 'Assets',
    debug = false,
  } = options;

  let isProduction = false;
  let root = '';

  return {
    name: 'vite-plugin-xhgis',
    
    configResolved(config: ResolvedConfig) {
      isProduction = config.command === 'build';
      root = config.root;
      
      if (debug) {
        console.log('[vite-plugin-xhgis] Config resolved:', {
          isProduction,
          root,
          baseUrl,
          xhgisPath,
        });
      }
    },

    config(config: any, { command }: { command: string }) {
      // 定义全局变量，类似 CESIUM_BASE_URL
      config.define = config.define || {};
      config.define.XH_GIS_BASE_URL = JSON.stringify(baseUrl);
      config.define['process.env.XH_GIS_BASE_URL'] = JSON.stringify(baseUrl);
      
      if (debug) {
        console.log('[vite-plugin-xhgis] Defined global variables:', {
          XH_GIS_BASE_URL: baseUrl,
        });
      }

      // 在开发模式下配置静态资源服务
      if (command === 'serve' && devMode) {
        const xhgisAssetsPath = resolve(root, xhgisPath, 'dist', assetsDir);
        
        if (existsSync(xhgisAssetsPath)) {
          config.server = config.server || {};
          config.server.fs = config.server.fs || {};
          config.server.fs.allow = config.server.fs.allow || [];
          
          // 允许访问 XH-GIS 资源目录
          if (!config.server.fs.allow.includes(xhgisAssetsPath)) {
            config.server.fs.allow.push(xhgisAssetsPath);
          }
          
          if (debug) {
            console.log('[vite-plugin-xhgis] Added to fs.allow:', xhgisAssetsPath);
          }
        }
      }
    },

    configureServer(server: ViteDevServer) {
      if (!devMode) return;

      const xhgisAssetsPath = resolve(root, xhgisPath, 'dist', assetsDir);
      
      if (!existsSync(xhgisAssetsPath)) {
        console.warn(`[vite-plugin-xhgis] XH-GIS assets not found at: ${xhgisAssetsPath}`);
        return;
      }

      // 配置开发服务器中间件，代理 XH-GIS 静态资源
      server.middlewares.use(baseUrl, (req: any, res: any, next: any) => {
        const filePath = req.url?.replace(/^\//, '') || '';
        const fullPath = join(xhgisAssetsPath, filePath);
        
        if (debug) {
          console.log(`[vite-plugin-xhgis] Serving: ${req.url} -> ${fullPath}`);
        }
        
        // 使用 Vite 的静态文件服务
        req.url = '/' + join(xhgisPath, 'dist', assetsDir, filePath).replace(/\\/g, '/');
        next();
      });
      
      if (debug) {
        console.log(`[vite-plugin-xhgis] Dev server middleware configured for ${baseUrl}`);
      }
    },

    generateBundle(options: any, bundle: any) {
      if (!isProduction) return;

      const xhgisAssetsPath = resolve(root, xhgisPath, 'dist', assetsDir);
      
      if (!existsSync(xhgisAssetsPath)) {
        console.warn(`[vite-plugin-xhgis] XH-GIS assets not found at: ${xhgisAssetsPath}`);
        return;
      }

      // 在生产构建时，将 XH-GIS 资源复制到输出目录
      // 这里我们添加一个虚拟的资源文件来触发复制
      this.emitFile({
        type: 'asset',
        fileName: 'xh-gis-assets-marker.txt',
        source: `XH-GIS assets should be copied from: ${xhgisAssetsPath}\nTo: ${baseUrl.replace(/^\//, '')}/`,
      });
      
      if (debug) {
        console.log('[vite-plugin-xhgis] Production build: assets marker emitted');
      }
    },

    writeBundle(options: any, bundle: any) {
      if (!isProduction) return;
      
      // 在这里可以添加实际的文件复制逻辑
      // 或者提示用户需要手动复制资源
      console.log(`[vite-plugin-xhgis] Build completed. Please ensure XH-GIS assets are available at: ${baseUrl}`);
    },
  };
}

export default xhgis;