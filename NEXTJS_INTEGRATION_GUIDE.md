# Next.js 集成指南

本指南说明如何在 Next.js 项目中集成 xh-gis 引擎，并正确配置静态资源加载。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install @xh-gis/engine @xh-gis/widgets
# 或
pnpm add @xh-gis/engine @xh-gis/widgets
```

### 2. 基础配置

在你的 Next.js 组件中：

```typescript
import { useEffect } from 'react';
import { XgEarth, setResourceConfig } from '@xh-gis/engine';

export default function MapComponent() {
  useEffect(() => {
    // 配置资源加载
    setResourceConfig({
      isDevelopment: process.env.NODE_ENV === 'development',
      basePath: '/xh-gis-assets',
      // 或者使用 CDN
      urlResolver: (resourcePath) => {
        return `https://your-cdn.com/xh-gis-assets/${resourcePath}`;
      }
    });
  }, []);

  // 你的地图组件代码...
}
```

## 📁 资源配置方案

> **💡 内网环境用户请参考：** [内网环境集成指南](./INTRANET_INTEGRATION_GUIDE.md)

### 方案一：使用 CDN（推荐）

⚠️ **注意：** 此方案需要外网访问，内网环境请使用方案二或参考内网集成指南。

```typescript
setResourceConfig({
  urlResolver: (resourcePath) => {
    return `https://cdn.jsdelivr.net/npm/@xh-gis/engine@latest/dist/Assets/${resourcePath}`;
  }
});
```

**优点：**
- 无需手动管理资源文件
- 自动获取最新版本的资源
- 减少项目体积

### 方案二：本地静态资源（内网环境推荐）

**适用场景：** 内网环境、无法访问 CDN、需要更多控制权

如果需要离线使用或更好的性能控制：

1. **创建资源目录结构：**
```
your-nextjs-project/
├── public/
│   └── xh-gis-assets/
│       ├── globe.jpg
│       ├── SkyBox/
│       │   ├── skybox_px.jpg
│       │   ├── skybox_nx.jpg
│       │   └── ...
│       └── ...
```

2. **配置资源路径：**
```typescript
setResourceConfig({
  isDevelopment: process.env.NODE_ENV === 'development',
  basePath: '/xh-gis-assets'
});
```

3. **自动化资源拷贝（可选）：**

在 `package.json` 中添加脚本：
```json
{
  "scripts": {
    "copy-assets": "cp -r node_modules/@xh-gis/engine/dist/Assets public/xh-gis-assets",
    "prebuild": "npm run copy-assets"
  }
}
```

### 方案三：动态资源加载

```typescript
setResourceConfig({
  urlResolver: (resourcePath, config) => {
    // 开发环境从本地加载
    if (process.env.NODE_ENV === 'development') {
      return `/api/xh-gis-assets/${resourcePath}`;
    }
    // 生产环境从 CDN 加载
    return `https://your-cdn.com/assets/${resourcePath}`;
  }
});
```

然后创建 API 路由 `pages/api/xh-gis-assets/[...path].js`：
```javascript
import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { path: resourcePath } = req.query;
  const filePath = path.join(
    process.cwd(), 
    'node_modules/@xh-gis/engine/dist/Assets',
    ...resourcePath
  );
  
  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(filePath);
    res.setHeader('Content-Type', getContentType(filePath));
    res.send(file);
  } else {
    res.status(404).json({ error: 'Resource not found' });
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    // 添加更多类型...
  };
  return contentTypes[ext] || 'application/octet-stream';
}
```

## 🔧 高级配置

### 路径映射

如果你想要自定义资源路径：

```typescript
setResourceConfig({
  basePath: '/assets',
  pathMapping: {
    'SkyBox/': 'textures/skybox/',
    'globe.jpg': 'images/earth.jpg'
  }
});
```

### 环境特定配置

```typescript
const getResourceConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      isDevelopment: true,
      basePath: '/dev-assets'
    };
  }
  
  if (process.env.NEXT_PUBLIC_USE_CDN === 'true') {
    return {
      urlResolver: (path) => `https://cdn.example.com/xh-gis/${path}`
    };
  }
  
  return {
    isDevelopment: false,
    basePath: '/assets'
  };
};

setResourceConfig(getResourceConfig());
```

## 🚨 常见问题

### Q: 资源加载失败，返回 404
**A:** 检查资源配置是否正确，确保 `basePath` 或 `urlResolver` 指向正确的位置。

### Q: 开发环境正常，生产环境资源加载失败
**A:** 确保生产环境的资源路径配置正确，或者使用 CDN 方案。

### Q: 如何调试资源加载问题？
**A:** 在浏览器控制台查看网络请求，检查资源 URL 是否正确生成。

```typescript
import { getResourceUrl, getResourceConfig } from '@xh-gis/engine';

// 调试信息
console.log('当前资源配置:', getResourceConfig());
console.log('globe.jpg URL:', getResourceUrl('globe.jpg'));
```

## 📝 完整示例

```typescript
// components/XhGisMap.tsx
import { useEffect, useRef } from 'react';
import { XgEarth, setResourceConfig } from '@xh-gis/engine';

export default function XhGisMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 配置资源加载
    setResourceConfig({
      isDevelopment: process.env.NODE_ENV === 'development',
      urlResolver: (resourcePath) => {
        // 使用 jsDelivr CDN
        return `https://cdn.jsdelivr.net/npm/@xh-gis/engine@latest/dist/Assets/${resourcePath}`;
      }
    });

    // 初始化地图
    if (containerRef.current) {
      const earth = new XgEarth(containerRef.current);
      // 地图初始化完成后的操作...
    }
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '500px' }} />;
}
```

这样配置后，你就无需手动拷贝任何资源文件，xh-gis 引擎会自动从配置的位置加载所需的静态资源。