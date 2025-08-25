# XH-GIS

一个基于 CesiumJS 的强大 GIS 开发框架，提供完整的三维地理可视化解决方案。

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
import { XgEarth, XgMap, Earth, Map } from 'xh-gis';

// 或者单独导入
import { XgEarth, XgMap } from '@xh-gis/engine';
import { Earth, Map } from '@xh-gis/widgets';
```

#### React 组件使用

```tsx
import React from 'react';
import { Earth } from 'xh-gis';

function App() {
  const handleInit = (core) => {
    console.log('XH-GIS 初始化完成', core);
    // 在这里可以进行各种 GIS 操作
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Earth
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