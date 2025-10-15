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

### 弹窗（XgPopup）

XgPopup 用于在场景中的某个地理位置展示信息窗。支持三种内容类型：`string`、`HTMLElement`、`ReactElement`（含数组）。

基本 DOM 布局要求：在 `viewer.container` 的父元素中提供一个承载容器（用于放置弹窗与连线）：

```html
<div id="app">
  <div id="cesiumContainer"></div>
  <div class="xh-gis-popup-container"></div>
  <!-- 其他页面内容 -->
  
</div>
```

创建与使用示例：

```typescript
import { XgEarth } from '@xh-gis/engine';
import { XgPopup } from '@xh-gis/engine/DataSources/XgPopup';

const earth = new XgEarth('cesiumContainer');

// 1) 字符串内容
new XgPopup({
  xgCore: earth,
  position: [120, 30, 0],
  element: '<div style="padding:8px">Hello Popup</div>',
  icon: '/icons/pin.png',
  iconSize: [16, 16],
  maxRange: 300000, // 超出距离自动隐藏
  offset: [10, -20], // 屏幕偏移
});

// 2) 原生 HTMLElement
const el = document.createElement('div');
el.textContent = 'DOM Node Content';
new XgPopup({ xgCore: earth, position: [120.1, 29.9, 0], element: el });

// 3) ReactElement（需要宿主项目已安装 React 18）
import React from 'react';
const node = (<div style={{ padding: 8 }}>React Node</div>);
new XgPopup({ xgCore: earth, position: [121, 30, 0], element: node });

// 4) ReactElement 数组（如列表展开）
const nodes = [<span key="a">A</span>, <span key="b">B</span>];
new XgPopup({ xgCore: earth, position: [121.1, 30.1, 0], element: nodes as any });

// 动态更新内容（会安全卸载旧的 React 根并刷新显示）
// popup.element = '<b>updated</b>';
```

样式类名：
- 容器：`xh-gis-popup-container`
- 弹窗：`xh-gis-popup`
- 图标：`xh-gis-popup-icon`
- 连线：`xh-gis-popup-link`

若需销毁：

```typescript
popup.destroy();
```

### React 集成与轻量化

- 运行时按需加载：仅当传入内容为 `ReactElement`（或数组）时才动态导入 `react-dom/client` 并渲染；非 React 项目完全不包含 React 代码路径。
- 依赖管理：`react`、`react-dom` 设为 `peerDependencies` 并在打包配置中标记为 `external`，React 工程自行提供安装版本（推荐 React 18）。
- 类型与检测：仅使用 `import type` 引入 React 类型；运行时通过 `element.$$typeof === Symbol.for('react.element')` 严格判定 React 节点；支持 `ReactElement[]`。
- SSR 提示：在服务端渲染场景请确保相关逻辑仅在浏览器侧执行（例如通过 `typeof window !== 'undefined'` 保护）。

### 常见错误与排查

- 错误：`Objects are not valid as a React child`
  - 原因：传入了普通对象或组件类型而非 JSX 元素，或列表 `map` 未返回 JSX。
  - 解决：使用 `<Comp />` 而非 `Comp`；不要直接渲染普通对象，改为 `{JSON.stringify(obj)}` 或映射为元素；列表应返回元素：`items.map(i => <Item key={i.id} {...i} />)`。
- 动态导入失败：控制台警告 `Failed to import react-dom/client`
  - 原因：宿主项目未安装 `react-dom` 或在非浏览器环境尝试渲染。
  - 解决：确认安装 React 18 与 `react-dom`；在浏览器环境中调用弹窗渲染逻辑。
- 弹窗不显示：未提供承载容器
  - 解决：在 `viewer.container` 的父元素中添加 `.xh-gis-popup-container`，参见示例 DOM 结构。
- 更新/销毁：
  - 引擎在更新内容时会卸载旧的 React 根并使用 `replaceChildren` 更新 DOM，减少抖动；在 `destroy()` 中也会安全清理。

> 说明：XgPopup 的渲染与样式为通用默认，推荐根据产品需求定制 CSS 以实现更好的视觉效果。

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