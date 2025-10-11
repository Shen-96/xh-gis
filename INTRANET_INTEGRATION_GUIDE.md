# XH-GIS 内网环境集成指南

本指南专门针对内网环境，无法使用 CDN 的情况下如何集成 XH-GIS。

## 🎯 方案一：Next.js API 路由（推荐）

### 1. 创建 API 路由

创建文件 `pages/api/xh-gis-assets/[...path].js`：

```javascript
import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { path: resourcePath } = req.query;
  
  // 构建资源文件路径
  const filePath = path.join(
    process.cwd(), 
    'node_modules/@xh-gis/engine/dist/Assets',
    ...resourcePath
  );
  
  try {
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath);
      
      // 设置正确的 Content-Type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = getContentType(ext);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存一年
      res.send(file);
    } else {
      res.status(404).json({ error: 'Resource not found', path: resourcePath });
    }
  } catch (error) {
    console.error('Error serving XH-GIS asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function getContentType(ext) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json'
  };
  return types[ext] || 'application/octet-stream';
}
```

### 2. 配置资源路径

在你的组件中配置：

```typescript
// components/MapComponent.tsx
import { useEffect } from 'react';
import { setResourceConfig } from '@xh-gis/engine';

export default function MapComponent() {
  useEffect(() => {
    setResourceConfig({
      isDevelopment: process.env.NODE_ENV === 'development',
      basePath: '/api/xh-gis-assets'
    });
  }, []);

  // 你的地图组件逻辑...
}
```

## 🎯 方案二：Webpack 插件拷贝（类似 Cesium 方案）

这个方案类似于 Cesium 在 Next.js 中的集成方式，使用 CopyWebpackPlugin 自动拷贝静态资源。

### 1. 安装依赖

```bash
npm install --save-dev copy-webpack-plugin
```

### 2. 配置 next.config.mjs

创建或更新 `next.config.mjs`：

```javascript
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathBuilder = (relativePath) => path.resolve(__dirname, relativePath);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 只在客户端构建时添加插件
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: pathBuilder("node_modules/@xh-gis/engine/dist/Assets"),
              to: "../public/xh-gis/Assets",
              info: { minimized: true },
            },
          ],
        }),
        new webpack.DefinePlugin({
          XH_GIS_BASE_URL: JSON.stringify("/xh-gis")
        })
      );
    }

    return config;
  },
};

export default nextConfig;
```

### 3. 配置资源路径

在你的组件中：

```typescript
import { useEffect } from 'react';
import { setResourceConfig } from '@xh-gis/engine';

export default function MapComponent() {
  useEffect(() => {
    setResourceConfig({
      isDevelopment: process.env.NODE_ENV === 'development',
      basePath: '/xh-gis/Assets'  // 对应 public/xh-gis/Assets
    });
  }, []);

  // 你的地图组件逻辑...
}
```

### 4. 环境变量支持

你也可以使用环境变量来配置：

```javascript
// next.config.mjs 中
new webpack.DefinePlugin({
  XH_GIS_BASE_URL: JSON.stringify(process.env.XH_GIS_BASE_URL || "/xh-gis")
})
```

然后在 `.env.local` 中：

```bash
XH_GIS_BASE_URL=/xh-gis
```

## 🎯 方案三：脚本拷贝方式

如果你不想修改 webpack 配置，也可以使用脚本方式：

### 1. 创建拷贝脚本

创建 `scripts/copy-xh-gis-assets.js`：

```javascript
const fs = require('fs-extra');
const path = require('path');

async function copyAssets() {
  const sourceDir = path.join(process.cwd(), 'node_modules/@xh-gis/engine/dist/Assets');
  const targetDir = path.join(process.cwd(), 'public/xh-gis/Assets');
  
  try {
    // 确保目标目录存在
    await fs.ensureDir(targetDir);
    
    // 拷贝资源文件
    await fs.copy(sourceDir, targetDir);
    
    console.log('✅ XH-GIS assets copied successfully!');
    console.log(`📁 From: ${sourceDir}`);
    console.log(`📁 To: ${targetDir}`);
  } catch (error) {
    console.error('❌ Error copying XH-GIS assets:', error);
    process.exit(1);
  }
}

copyAssets();
```

### 2. 更新 package.json

```json
{
  "scripts": {
    "postinstall": "node scripts/copy-xh-gis-assets.js",
    "dev": "node scripts/copy-xh-gis-assets.js && next dev",
    "build": "node scripts/copy-xh-gis-assets.js && next build"
  }
}
```

### 3. 配置资源路径

```typescript
useEffect(() => {
  setResourceConfig({
    isDevelopment: process.env.NODE_ENV === 'development',
    basePath: '/xh-gis/Assets'
  });
}, []);
```

## 🎯 方案三：自定义静态服务器

对于更复杂的内网环境，你可以创建专门的静态资源服务器：

### 1. 创建静态服务器

创建 `server/static-server.js`：

```javascript
const express = require('express');
const path = require('path');
const app = express();

// 提供 XH-GIS 静态资源
app.use('/xh-gis-assets', express.static(
  path.join(__dirname, '../node_modules/@xh-gis/engine/dist/Assets'),
  {
    maxAge: '1y', // 缓存一年
    etag: true
  }
));

const PORT = process.env.STATIC_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Static server running on http://localhost:${PORT}`);
});
```

### 2. 配置资源路径

```typescript
useEffect(() => {
  setResourceConfig({
    isDevelopment: process.env.NODE_ENV === 'development',
    urlResolver: (resourcePath) => {
      const staticServerUrl = process.env.NEXT_PUBLIC_STATIC_SERVER_URL || 'http://localhost:3002';
      return `${staticServerUrl}/xh-gis-assets/${resourcePath}`;
    }
  });
}, []);
```

## 🔧 环境变量配置

创建 `.env.local`：

```bash
# 开发环境
NEXT_PUBLIC_XH_GIS_BASE_PATH=/api/xh-gis-assets

# 如果使用独立静态服务器
NEXT_PUBLIC_STATIC_SERVER_URL=http://your-internal-server:3002
```

## 📝 最佳实践

### 最佳实践推荐

基于对各种方案的分析和实际应用场景的考虑，我们推荐使用 **Webpack 插件拷贝方案**，这与 Cesium 的集成方式完全一致：

#### 推荐方案：零配置 Webpack 插件方案

类似于 Cesium 的 `CESIUM_BASE_URL`，XH-GIS 现在支持零配置集成：

```javascript
// next.config.mjs
import CopyWebpackPlugin from 'copy-webpack-plugin';

const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      const xhGisBaseUrl = '/xh-gis/Assets';
      
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [{
            from: 'node_modules/@xh-gis/engine/dist/Assets',
            to: 'public/xh-gis/Assets',
          }],
        }),
        new webpack.DefinePlugin({
          XH_GIS_BASE_URL: JSON.stringify(xhGisBaseUrl),
          'process.env.XH_GIS_BASE_URL': JSON.stringify(xhGisBaseUrl),
        })
      );
    }
    return config;
  },
};
```

**使用时无需手动配置**：
```typescript
// 无需调用 setResourceConfig，XH-GIS 会自动检测环境变量
import { AbstractCore } from '@xh-gis/engine';

const core = new AbstractCore(container, options);
```

**优势**：
- ✅ **零配置**：类似 Cesium，无需手动调用配置函数
- ✅ **自动化**：构建时自动拷贝和配置
- ✅ **环境变量支持**：支持不同环境的配置
- ✅ **框架集成**：与 Next.js、Vite 等现代构建工具完美集成
- ✅ **开发体验**：与 Cesium 使用体验一致

### 1. 推荐使用方案二（Webpack 插件拷贝）
- ✅ **类似 Cesium 方案** - 与现有 Cesium 集成方式一致
- ✅ **自动化构建** - 构建时自动拷贝，无需手动操作
- ✅ **环境变量支持** - 支持不同环境配置
- ✅ **开发体验好** - 与 Next.js 构建流程完美集成

### 2. 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| API 路由 | 无需拷贝文件，自动更新 | 运行时开销 | 小型项目，快速原型 |
| Webpack 插件 | 构建时拷贝，性能好，类似 Cesium | 需要配置 webpack | 生产项目，已有 Cesium 集成 |
| 脚本拷贝 | 简单直接，易理解 | 需要手动执行 | 简单项目，不想修改配置 |
| 静态服务器 | 完全独立，高性能 | 额外服务器维护 | 大型项目，微服务架构 |

### 2. 生产环境优化

```typescript
// 根据环境自动选择配置
useEffect(() => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  setResourceConfig({
    isDevelopment: !isProduction,
    basePath: process.env.NEXT_PUBLIC_XH_GIS_BASE_PATH || '/api/xh-gis-assets',
    // 生产环境启用更多优化
    ...(isProduction && {
      // 可以添加生产环境特定配置
    })
  });
}, []);
```

### 3. 错误处理

```typescript
useEffect(() => {
  setResourceConfig({
    isDevelopment: process.env.NODE_ENV === 'development',
    basePath: '/api/xh-gis-assets',
    // 添加错误处理
    urlResolver: (resourcePath) => {
      const basePath = '/api/xh-gis-assets';
      console.log(`Loading XH-GIS resource: ${basePath}/${resourcePath}`);
      return `${basePath}/${resourcePath}`;
    }
  });
}, []);
```

## 🚀 快速开始

1. 选择方案一（API 路由）
2. 创建 `pages/api/xh-gis-assets/[...path].js` 文件
3. 在组件中配置 `setResourceConfig({ basePath: '/api/xh-gis-assets' })`
4. 开始使用！

这样你就可以在内网环境中无缝使用 XH-GIS，无需担心 CDN 访问问题。