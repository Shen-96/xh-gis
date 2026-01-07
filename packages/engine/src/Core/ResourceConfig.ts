/*
 * @Description: 静态资源配置管理
 * @Author: xh-gis
 * @Date: 2025-01-16
 */

export interface ResourceConfig {
  /** 资源基础路径 */
  basePath?: string;
  /** 是否为开发环境 */
  isDevelopment?: boolean;
  /** 自定义资源路径映射 */
  pathMapping?: Record<string, string>;
  /** 资源URL解析器 */
  urlResolver?: (path: string, config: ResourceConfig) => string;
}

/**
 * 获取环境变量中的XH-GIS配置
 * 支持类似Cesium的零配置方案
 */
function getEnvironmentConfig(): Partial<ResourceConfig> {
  const config: Partial<ResourceConfig> = {};
  
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined') {
    // 浏览器环境：检查全局变量
    const globalThis = window as any;
    
    // 检查 XH_GIS_BASE_URL 环境变量（类似 CESIUM_BASE_URL）
    if (typeof globalThis.XH_GIS_BASE_URL === 'string') {
      config.basePath = globalThis.XH_GIS_BASE_URL.replace(/\/$/, ''); // 移除末尾斜杠
    }
    
    // 检查 process.env（webpack DefinePlugin 注入）
    if (typeof globalThis.process !== 'undefined' && globalThis.process.env) {
      const env = globalThis.process.env;
      
      if (typeof env.XH_GIS_BASE_URL === 'string') {
        config.basePath = env.XH_GIS_BASE_URL.replace(/\/$/, '');
      }
      
      if (typeof env.NODE_ENV === 'string') {
        config.isDevelopment = env.NODE_ENV === 'development';
      }
    }
  } else {
    // Node.js 环境：检查 process.env
    try {
      // 使用 try-catch 避免 process 未定义的错误
      const processEnv = (globalThis as any).process?.env || {};
      
      if (typeof processEnv.XH_GIS_BASE_URL === 'string') {
        config.basePath = processEnv.XH_GIS_BASE_URL.replace(/\/$/, '');
      }
      
      if (typeof processEnv.NODE_ENV === 'string') {
        config.isDevelopment = processEnv.NODE_ENV === 'development';
      }
    } catch (error) {
      // 忽略 process 不存在的错误
    }
  }
  
  return config;
}

class ResourceManager {
  private config: ResourceConfig = {};

  constructor() {
    // 自动加载环境配置
    this.loadEnvironmentConfig();
  }

  /**
   * 加载环境配置
   * 自动检测并应用环境变量中的配置
   */
  private loadEnvironmentConfig() {
    const envConfig = getEnvironmentConfig();
    if (Object.keys(envConfig).length > 0) {
      this.config = { ...this.config, ...envConfig };
    }
  }

  /**
   * 设置资源配置
   */
  setConfig(config: ResourceConfig) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取资源配置
   */
  getConfig(): ResourceConfig {
    return { ...this.config };
  }

  /**
   * 预加载关键资源
   * 提升应用启动性能
   */
  async preloadResources(): Promise<void> {
    const basePath = this.config.basePath || '';
    if (basePath) {
      await globalPreloader.preloadCriticalResources(basePath);
    }
  }

  /**
   * 获取预加载进度
   */
  getPreloadProgress(): { loaded: number; total: number } {
    return globalPreloader.getPreloadProgress();
  }

  /**
   * 检查资源是否已预加载
   */
  isResourcePreloaded(resourcePath: string): boolean {
    const basePath = this.config.basePath || '';
    const fullUrl = `${basePath}/${resourcePath}`;
    return globalPreloader.isPreloaded(fullUrl);
  }

  /**
   * 获取资源URL
   */
  getResourceUrl(path: string): string {
    // 如果有自定义解析器，优先使用
    if (this.config.urlResolver) {
      return this.config.urlResolver(path, this.config);
    }

    // 检查路径映射
    if (this.config.pathMapping && this.config.pathMapping[path]) {
      return this.config.pathMapping[path];
    }

    // 使用默认解析逻辑
    return this.defaultUrlResolver(path);
  }

  /**
   * 默认URL解析器
   */
  private defaultUrlResolver(path: string): string {
    const configuredBase = (this.config.basePath || '').replace(/\/$/, '');
    const defaultBase = '/xh-gis/Assets';
    const basePath = configuredBase || defaultBase;

    // 统一清洗 path，移除开头的斜杠，避免 // 双斜杠
    const normalizedPath = path.replace(/^\/+/, '');

    // 如果 basePath 不以 /Assets 结尾，且传入路径未包含 Assets/ 前缀，则自动补齐
    const needAssetsPrefix = !basePath.endsWith('/Assets') && !normalizedPath.startsWith('Assets/');
    const finalPath = needAssetsPrefix ? `Assets/${normalizedPath}` : normalizedPath;

    const primaryUrl = `${basePath}/${finalPath}`;

    // 兜底：如果 primaryUrl 以 /xh-gis/Assets 开头但静态服务未开启子路径
    // 则提供 CDN/根路径回退（以 window.location.origin 为前缀）
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (primaryUrl.startsWith('/xh-gis/Assets/') && origin) {
        return primaryUrl; // 仍然返回主 URL，加载失败时由调用方控制
      }
    } catch {}

    return primaryUrl;
  }

  /**
   * 重置配置
   */
  reset() {
    this.config = {};
  }
}

/**
 * 资源预加载器
 * 提升应用启动性能
 */
class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private preloadPromises = new Map<string, Promise<void>>();

  /**
   * 预加载关键资源
   */
  async preloadCriticalResources(basePath: string): Promise<void> {
    const criticalResources = [
      'globe.jpg',
      'SkyBox/skybox_px.jpg',
      'SkyBox/skybox_nx.jpg',
      'SkyBox/skybox_py.jpg',
      'SkyBox/skybox_ny.jpg',
      'SkyBox/skybox_pz.jpg',
      'SkyBox/skybox_nz.jpg',
    ];

    const preloadPromises = criticalResources.map(resource => 
      this.preloadResource(basePath, resource)
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * 预加载单个资源
   */
  private async preloadResource(basePath: string, resourcePath: string): Promise<void> {
    const fullUrl = `${basePath}/${resourcePath}`;
    
    if (this.preloadedResources.has(fullUrl)) {
      return this.preloadPromises.get(fullUrl) || Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.preloadedResources.add(fullUrl);
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`[XH-GIS] Failed to preload resource: ${fullUrl}`);
        resolve(); // 不阻塞其他资源的加载
      };
      
      img.src = fullUrl;
    });

    this.preloadPromises.set(fullUrl, promise);
    return promise;
  }

  /**
   * 检查资源是否已预加载
   */
  isPreloaded(url: string): boolean {
    return this.preloadedResources.has(url);
  }

  /**
   * 获取预加载进度
   */
  getPreloadProgress(): { loaded: number; total: number } {
    return {
      loaded: this.preloadedResources.size,
      total: this.preloadPromises.size,
    };
  }
}

// 全局预加载器实例
const globalPreloader = new ResourcePreloader();

// 导出预加载相关功能
export { ResourcePreloader };
export const resourcePreloader = globalPreloader;

// 导出单例实例
export const resourceManager = new ResourceManager();

/**
 * 设置全局资源配置（高级用法）
 * 
 * @description
 * 大多数场景下不需要调用此方法。推荐使用零配置方案：
 * - 将静态资源拷贝到 `public/xh-gis/Assets` 目录
 * - 使用环境变量 `XH_GIS_BASE_URL` 配置基础路径
 * - 引擎会自动检测并应用配置
 * 
 * @param config - 资源配置对象
 * 
 * @example
 * // 一般场景：无需调用，使用默认配置即可
 * // 默认路径：/xh-gis/Assets
 * 
 * @example
 * // 高级场景：使用 CDN
 * setResourceConfig({
 *   urlResolver: (path) => `https://cdn.example.com/assets/${path}`
 * });
 * 
 * @example
 * // 高级场景：自定义路径映射
 * setResourceConfig({
 *   pathMapping: {
 *     'SkyBox/': 'textures/skybox/',
 *     'globe.jpg': 'images/earth.jpg'
 *   }
 * });
 * 
 * @remarks
 * 此方法主要用于以下场景：
 * - 使用 CDN 托管资源
 * - 资源路径与约定不一致
 * - 需要动态修改配置
 * 
 * @see {@link getResourceConfig} 获取当前配置
 * @see {@link getResourceUrl} 获取资源 URL
 */
export function setResourceConfig(config: ResourceConfig) {
  resourceManager.setConfig(config);
}

/**
 * 获取资源的完整 URL（调试/验证用途）
 * 
 * @description
 * 用于获取资源路径的完整 URL，主要用于调试、验证资源路径是否正确。
 * 一般场景不需要调用此方法，引擎会自动处理资源路径。
 * 
 * @param path - 资源路径（如 'SkyBox/skybox_px.jpg'）
 * @returns 完整的资源 URL（如 '/xh-gis/Assets/SkyBox/skybox_px.jpg'）
 * 
 * @example
 * // 调试资源路径
 * const url = getResourceUrl('SkyBox/skybox_px.jpg');
 * console.log('资源 URL:', url); // '/xh-gis/Assets/SkyBox/skybox_px.jpg'
 * 
 * @remarks
 * 此方法主要用于：
 * - 调试资源路径是否正确
 * - 验证资源配置是否生效
 * - 在自定义代码中使用资源（高级场景）
 */
export function getResourceUrl(path: string): string {
  return resourceManager.getResourceUrl(path);
}

/**
 * 获取当前的资源配置（调试用途）
 * 
 * @description
 * 用于获取当前的资源配置，主要用于调试和验证。
 * 一般场景不需要调用此方法。
 * 
 * @returns 当前的资源配置对象
 * 
 * @example
 * // 调试资源配置
 * const config = getResourceConfig();
 * console.log('当前配置:', config);
 * // { basePath: '/xh-gis/Assets', isDevelopment: false }
 * 
 * @remarks
 * 此方法主要用于：
 * - 调试资源配置是否正确
 * - 验证环境变量是否生效
 */
export function getResourceConfig(): ResourceConfig {
  return resourceManager.getConfig();
}
