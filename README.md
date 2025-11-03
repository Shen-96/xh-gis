# XH-GIS

一个基于 CesiumJS 的强大 GIS 开发框架，提供完整的三维地理可视化解决方案。

## 🚀 在线沙盒

- https://shen-96.github.io/xh-gis/

## 📦 包结构

XH-GIS 采用 monorepo 架构，包含以下三个 npm 包：

- **`xh-gis`** - 统一导入包，包含所有功能
- **`@xh-gis/engine`** - 核心引擎模块，提供基础 GIS 功能
- **`@xh-gis/widgets`** - React 组件库，基于 engine 构建

## 🚀 快速开始

### 安装

```bash
# 安装完整包（推荐）
npm install xh-gis

# 或者单独安装
npm install @xh-gis/engine @xh-gis/widgets
```

### 使用

```typescript
// 使用统一包
import { XgEarth, XgMap, WidgetEarth, WidgetMap } from 'xh-gis';

// 或者单独导入
import { XgEarth, XgMap } from '@xh-gis/engine';
import { WidgetEarth, WidgetMap } from '@xh-gis/widgets';
```

#### React 组件使用

```tsx
import React from 'react';
import { WidgetEarth } from 'xh-gis';

function App() {
  const handleInit = (core) => {
    console.log('XH-GIS 初始化完成', core);
    // 在这里可以进行各种 GIS 操作
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WidgetEarth
        onInit={handleInit}
        infoLine={true}
        timeLine={false}
        toolBox={true}
      />
    </div>
  );
}

export default App;
```

#### 直接使用引擎

```typescript
import { XgEarth } from 'xh-gis';

// 创建三维地球
const earth = new XgEarth('cesiumContainer');

// 添加图层
earth.layerManager.add('myLayer', myDataSource);

// 开始绘制
earth.graphicManager.setDrawEventHandler('point', (result) => {
  console.log('绘制完成', result);
});
```

#### 🔥 热力图使用

热力图通过 `HeatmapManager`/`HeatmapLayer` 提供，支持三种渲染方式：`imagery`（单瓦片影像，推荐）、`entity`、`primitive`。可选显示等值线（基于 `d3-contour`）。

- 核心 API
  - `heatmapManager.add(id, options)` 创建热力图
  - `heatmapManager.update(id, { heatmap, dataRange, radius, contour })` 更新配置
  - `heatmapManager.getById(id)` 获取实例
  - `heatmapManager.clearAll()` 清空

示例（仅使用引擎）：

```typescript
import { XgEarth, HeatmapOption } from 'xh-gis';

const earth = new XgEarth('cesiumContainer');

// 随机生成点（经纬度 + value）
const points: Array<{ x: number; y: number; value?: number }> = [];
for (let i = 0; i < 1000; i++) {
  const x = 115 + Math.random() * 3; // 经度
  const y = 39 + Math.random() * 2;  // 纬度
  const value = Math.round(Math.random() * 100);
  points.push({ x, y, value });
}

const options: HeatmapOption = {
  renderType: 'imagery',
  points,
  heatmapOptions: {
    radius: 30,
    maxOpacity: 0.8,
    minOpacity: 0.2,
    blur: 0.85,
    gradient: {
      0.25: 'rgb(0,0,255)',
      0.55: 'rgb(0,255,0)',
      0.85: 'yellow',
      1.0: 'rgb(255,0,0)'
    }
  },
  heatmapDataOptions: { min: 0, max: 100 },
  zoomToLayer: true,
  contourLineOption: { show: true, contourCount: 8, width: 2, color: '#ff0000' }
};

const id = 'demo-heatmap';
earth.heatmapManager.add(id, options);

// 动态更新
earth.heatmapManager.update(id, {
  radius: 50,
  heatmap: { opacity: 0.7 },
  dataRange: { min: 0, max: 120 },
  contour: { show: true, contourCount: 10 }
});

// 清空
earth.heatmapManager.clearAll();
```

示例（与 React 组件结合）：

```tsx
import React from 'react';
import { Earth } from 'xh-gis';
import type { XgEarth, HeatmapOption } from 'xh-gis';

export default function App() {
  const handleInit = (inst: XgEarth) => {
    const points = Array.from({ length: 500 }, () => ({
      x: 116 + Math.random() * 2,
      y: 39 + Math.random(),
      value: Math.round(Math.random() * 100)
    }));

    const options: HeatmapOption = {
      renderType: 'imagery',
      points,
      heatmapOptions: { radius: 30 },
      heatmapDataOptions: { min: 0, max: 100 },
      zoomToLayer: true
    };

    const id = 'demo-heatmap';
    if (!inst.heatmapManager.isExists(id)) {
      inst.heatmapManager.add(id, options);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Earth onInit={handleInit} />
    </div>
  );
}
```

提示：热力图无需额外静态资源；若需要统一静态资源路径，请参考下文“静态资源路径约定”。

## 🌟 主要功能

### 🗺️ 地理可视化
- 支持三维地球和二维地图模式
- 多种地图服务支持（天地图、ArcGIS、WMS等）
- 高性能 3D 地形渲染
- 多坐标系转换

### ✏️ 标绘绘图
- 基础几何图形（点、线、面）
- 军标符号绘制
- 各种箭头类型
- 自由手绘功能

### 🎬 特效渲染
- 粒子系统（火焰、烟雾、爆炸等）
- 3D 特效（圆锥、椭球、视椎体）
- 动态材质效果
- GIF 动画支持

### 📊 数据管理
- 多种数据源（GeoJSON、KML、CZML等）
- 图层分级管理
- 时间序列数据

### 🎮 交互功能
- 相机漫游
- 鼠标事件处理
- 场景事件监听
- 弹窗管理

## 📋 依赖要求

- **CesiumJS**: 1.108.0
- **React**: ^18.3.1（使用 widgets 包时）
- **TypeScript**: ^5.0.0

## 🗂️ 静态资源路径约定

- 统一基础路径：`/xh-gis/Assets`
- 放置方式：将 `node_modules/@xh-gis/engine/dist/Assets` 拷贝到应用的 `public/xh-gis/Assets`
- 零代码改动：无需在业务代码中调用 `setResourceConfig`，引擎默认解析到上述路径
- 子路径部署：如应用部署在 `'/app'`，在构建工具中注入 `XH_GIS_BASE_URL='/app/xh-gis/Assets'`
- 验证方式：
  - `console.log(getResourceUrl('SkyBox/tycho2t3_80_px.jpg')) // => '/xh-gis/Assets/SkyBox/tycho2t3_80_px.jpg'`
  - 浏览器 Network 中应看到 HTTP 请求（非 `file://`），返回 200

## 📖 文档

详细文档请访问：[XH-GIS 文档](https://github.com/Shen-96/xh-gis#readme)

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License

## 🔗 相关链接

- [GitHub](https://github.com/Shen-96/xh-gis)
- [NPM - xh-gis](https://www.npmjs.com/package/xh-gis)
- [NPM - @xh-gis/engine](https://www.npmjs.com/package/@xh-gis/engine)
- [NPM - @xh-gis/widgets](https://www.npmjs.com/package/@xh-gis/widgets)
- 在线沙盒（GitHub Pages）: https://shen-96.github.io/xh-gis/