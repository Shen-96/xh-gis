/**
 * Vite 配置示例 - 使用 vite-plugin-xhgis
 * 类似于 vite-plugin-cesium 的使用方式
 * 
 * 安装依赖：
 * npm install vite-plugin-xhgis --save-dev
 */

/*
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // 或者 vue()
import { xhgis } from 'vite-plugin-xhgis';

export default defineConfig({
  plugins: [
    react(), // 或者 vue() 等其他框架插件
    
    // XH-GIS 插件 - 零配置使用
    xhgis({
      // 可选配置项
      baseUrl: '/xh-gis/Assets',     // XH-GIS 资源基础路径
      devMode: true,                 // 开发模式
      debug: false,                  // 调试模式
    }),
  ],
  
  // 其他 Vite 配置...
  server: {
    port: 3000,
    open: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
*/

/**
 * 使用说明：
 * 
 * 1. 开发模式：
 *    - 插件会自动从 node_modules 服务 XH-GIS 资源
 *    - 无需手动配置 setResourceConfig
 *    - XH-GIS 会自动检测 XH_GIS_BASE_URL 环境变量
 * 
 * 2. 生产构建：
 *    - 插件会注入 XH_GIS_BASE_URL 全局变量
 *    - 需要确保生产环境中 XH-GIS 资源可访问
 *    - 可以通过 CDN 或静态文件服务器提供资源
 * 
 * 3. 在组件中使用：
 *    ```typescript
 *    import { AbstractCore } from '@xh-gis/engine';
 *    
 *    // 无需调用 setResourceConfig
 *    const core = new AbstractCore(container, options);
 *    ```
 */