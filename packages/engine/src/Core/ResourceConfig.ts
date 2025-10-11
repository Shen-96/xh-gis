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
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') {
      // Node.js 环境
      if (this.config.basePath) {
        return `${this.config.basePath}/${path}`;
      }
      return path;
    }

    // 浏览器环境
    const { hostname, port } = window.location;
    
    // 检查是否为开发环境
    let isDevelopment = this.config.isDevelopment;
    if (isDevelopment === undefined) {
      // 自动检测开发环境
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const isDevelopmentPort = ['3000', '3001', '4000', '5000', '5173', '8000', '8080', '9000'].includes(port);
      isDevelopment = isLocalhost && (isDevelopmentPort || port !== '');
    }
    
    if (isDevelopment) {
      // 开发环境：从根路径或配置的基础路径访问资源
      const basePath = this.config.basePath || '/xh-gis/Assets';
      const cleanPath = path.startsWith('Assets/') ? path : `Assets/${path}`;
      return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
    }
    
    // 生产环境：使用 import.meta.url 构建相对路径
    try {
      const cleanPath = path.startsWith('Assets/') ? path.substring(7) : path;
      return new URL(`../Assets/${cleanPath}`, import.meta.url).href;
    } catch (error) {
      // 如果 import.meta.url 不可用，回退到相对路径
      console.warn('Failed to resolve resource URL using import.meta.url, falling back to relative path:', error);
      const basePath = this.config.basePath || '.';
      const cleanPath = path.startsWith('Assets/') ? path : `Assets/${path}`;
      return `${basePath}/${cleanPath}`;
    }
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
      'SkyBox/tycho2t3_80_px.jpg',
      'SkyBox/tycho2t3_80_mx.jpg',
      'SkyBox/tycho2t3_80_py.jpg',
      'SkyBox/tycho2t3_80_my.jpg',
      'SkyBox/tycho2t3_80_pz.jpg',
      'SkyBox/tycho2t3_80_mz.jpg',
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

// 导出便捷函数
export function setResourceConfig(config: ResourceConfig) {
  resourceManager.setConfig(config);
}

export function getResourceUrl(path: string): string {
  return resourceManager.getResourceUrl(path);
}

export function getResourceConfig(): ResourceConfig {
  return resourceManager.getConfig();
}