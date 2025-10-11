# @xh-gis/engine

XH GIS 核心引擎模块，提供基础类型与功能。

## 📋 依赖要求

⚠️ **注意**：本包依赖 [CesiumJS](https://cesium.com/cesiumjs/)，你需要自行安装：

```bash
npm install cesium@1.108.0
```

## 📦 安装

```bash
npm install @xh-gis/engine
```

## 静态资源配置

从 v2.0 开始，xh-gis 引擎提供了灵活的静态资源配置系统，支持多种部署场景。

### 快速配置

```typescript
import { setResourceConfig } from '@xh-gis/engine';

// Next.js 项目配置
setResourceConfig({
  isDevelopment: process.env.NODE_ENV === 'development',
  basePath: '/Assets'  // 对应 public/Assets 目录
});

// 或使用 CDN
setResourceConfig({
  urlResolver: (resourcePath) => {
    return `https://cdn.jsdelivr.net/npm/@xh-gis/engine@latest/dist/Assets/${resourcePath}`;
  }
});
```

### Next.js 集成

**推荐方案：使用 CDN（无需拷贝资源）**

```typescript
import { useEffect } from 'react';
import { setResourceConfig } from '@xh-gis/engine';

export default function MapComponent() {
  useEffect(() => {
    setResourceConfig({
      urlResolver: (resourcePath) => {
        return `https://cdn.jsdelivr.net/npm/@xh-gis/engine@latest/dist/Assets/${resourcePath}`;
      }
    });
  }, []);
  
  // 你的地图组件...
}
```

**本地资源方案：**

1. 将资源放置在 `public/Assets/` 目录下
2. 配置资源路径：

```typescript
setResourceConfig({
  isDevelopment: process.env.NODE_ENV === 'development',
  basePath: '/Assets'
});
```

### 高级配置

```typescript
// 自定义路径映射
setResourceConfig({
  isDevelopment: true,
  basePath: '/static',
  pathMapping: {
    'SkyBox/': 'textures/skybox/',
    'globe.jpg': 'images/earth.jpg'
  }
});

// 自定义 URL 解析器
setResourceConfig({
  urlResolver: (resourcePath, config) => {
    if (resourcePath.startsWith('SkyBox/')) {
      return `/cdn/skybox/${resourcePath.substring(7)}`;
    }
    return `/assets/${resourcePath}`;
  }
});
```

### API 参考

#### `setResourceConfig(config: ResourceConfig)`
设置全局资源配置。

#### `getResourceUrl(resourcePath: string): string`
获取资源的完整 URL。

#### `getResourceConfig(): ResourceConfig`
获取当前的资源配置。

#### `ResourceConfig` 接口
```typescript
interface ResourceConfig {
  basePath?: string;           // 基础路径
  isDevelopment?: boolean;     // 是否为开发环境
  pathMapping?: Record<string, string>; // 路径映射
  urlResolver?: (resourcePath: string, config: ResourceConfig) => string; // 自定义解析器
}
```

> 💡 **提示**: 详细的 Next.js 集成指南请参考项目根目录的 `NEXTJS_INTEGRATION_GUIDE.md` 文件。

## 🚀 使用

### 创建三维地球

```typescript
import { XgEarth } from '@xh-gis/engine';

const earth = new XgEarth('cesiumContainer');
```

### 创建二维地图

```typescript
import { XgMap } from '@xh-gis/engine';

const map = new XgMap('cesiumContainer');
```

### 基础功能

```typescript
// 图层管理
earth.layerManager.add('myLayer', dataSource);

// 标绘绘图
earth.graphicManager.setDrawEventHandler('point', (result) => {
  console.log('绘制完成', result);
});

// 粒子效果
earth.particleManager.add('fire', {
  type: 'BURNING',
  position: [120, 30, 0]
});

// 特效管理
earth.specialEffectManager.add('cone', {
  type: 'CONE',
  position: [120, 30, 0],
  style: { radius: 1000, height: 2000 }
});
```

## 🌟 主要功能

- **双模式支持**：三维地球和二维地图
- **图层管理**：支持多种数据源和图层类型
- **标绘绘图**：丰富的几何图形和军标符号
- **粒子系统**：火焰、烟雾、爆炸等特效
- **材质系统**：动态墙、流光线等材质
- **相机漫游**：支持路径动画和飞行
- **时间管理**：时间轴控制和动画
- **坐标转换**：多种坐标系互转

## 📖 API 文档

详细的 API 文档请参考主项目文档。

## 📄 许可证

MIT License