import type { Plugin, PluginOption, ResolvedConfig } from 'vite';
import { resolve, join } from 'path';
import { existsSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from 'fs';

export interface XHGISPluginOptions {
  /**
   * XH-GIS 资源的基础路径
   * @default '/xh-gis/Assets'
   */
  baseUrl?: string;
  
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
  const entries = readdirSync(src, { withFileTypes: true } as any);
  for (const entry of entries as any[]) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if ((entry.isDirectory && entry.isDirectory()) || (!entry.isFile && statSync(srcPath).isDirectory())) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * XH-GIS Vite 插件
 * 统一方案：始终将引擎资源复制到项目的 public 目录下
 */
export function xhgis(options: XHGISPluginOptions = {}): PluginOption {
  const {
    baseUrl = '/xh-gis/Assets',
    xhgisPath = 'node_modules/@xh-gis/engine',
    assetsDir = 'Assets',
    publicDir,
    debug = false,
  } = options;

  let root = '';
  let resolvedPublicDir = '';

  return {
    name: 'vite-plugin-xhgis',

    configResolved(config: ResolvedConfig) {
      root = config.root;
      resolvedPublicDir = publicDir || (config.publicDir as string) || join(root, 'public');
      if (debug) {
        console.log('[vite-plugin-xhgis] Config resolved:', {
          root,
          baseUrl,
          xhgisPath,
          assetsDir,
          publicDir: resolvedPublicDir,
        });
      }
      // 统一在这里拷贝资源到绝对 publicDir，避免相对路径落到 project 根目录
      const xhgisAssetsPath = resolve(root, xhgisPath, 'dist', assetsDir);
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
          console.log(`[vite-plugin-xhgis] Assets copied: ${xhgisAssetsPath} -> ${targetDir}`);
        }
      } catch (e) {
        console.error('[vite-plugin-xhgis] Failed to copy assets:', e);
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
    },
  };
}

export default xhgis;