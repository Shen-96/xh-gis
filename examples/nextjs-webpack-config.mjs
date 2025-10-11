/**
 * Next.js Webpack 配置示例
 * 类似 Cesium 的集成方式，支持零配置使用 XH-GIS
 * 
 * 使用方法：
 * 1. 安装依赖：npm install copy-webpack-plugin
 * 2. 将此配置添加到 next.config.mjs
 * 3. 无需调用 setResourceConfig，XH-GIS 会自动检测 XH_GIS_BASE_URL
 */

import CopyWebpackPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 只在客户端构建时添加插件
    if (!isServer) {
      // 定义 XH-GIS 资源基础路径（类似 CESIUM_BASE_URL）
      const xhGisBaseUrl = '/xh-gis/Assets';
      
      config.plugins.push(
        // 拷贝 XH-GIS 静态资源
        new CopyWebpackPlugin({
          patterns: [
            {
              from: join(__dirname, 'node_modules/@xh-gis/engine/dist/Assets'),
              to: join(__dirname, 'public/xh-gis/Assets'),
              globOptions: {
                ignore: ['**/.DS_Store'],
              },
            },
          ],
        }),
        
        // 定义全局变量（类似 Cesium 的 CESIUM_BASE_URL）
        new webpack.DefinePlugin({
          // 定义全局变量，XH-GIS 会自动检测并使用
          XH_GIS_BASE_URL: JSON.stringify(xhGisBaseUrl),
          // 也可以通过 process.env 注入
          'process.env.XH_GIS_BASE_URL': JSON.stringify(xhGisBaseUrl),
        })
      );
    }

    return config;
  },
  
  // 其他 Next.js 配置...
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;