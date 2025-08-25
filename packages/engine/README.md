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