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

## 🔗 相关链接

- 在线沙盒（GitHub Pages）: https://shen-96.github.io/xh-gis/

## 静态资源配置

xh-gis 引擎提供了灵活的静态资源配置系统，支持多种部署场景。

### 默认行为（零配置）

不做任何配置时，引擎会将所有资源解析到 `'/xh-gis/Assets'` 路径下：

- 将引擎的静态资源拷贝到 `public/xh-gis/Assets`（推荐约定）
- 运行时 `getResourceUrl('SkyBox/skybox_px.jpg')` 将输出 `'/xh-gis/Assets/SkyBox/skybox_px.jpg'`

这样在开发与生产环境中均通过 HTTP 访问，避免浏览器阻止的 `file://` 路径。

### Vite 项目集成（推荐）

使用官方插件 `vite-plugin-xhgis`，实现零配置集成：

#### 1. 安装插件

```bash
npm install vite-plugin-xhgis --save-dev
```

#### 2. 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // 或 vue()
import { xhgis } from 'vite-plugin-xhgis';

export default defineConfig({
  plugins: [
    react(), // 或 vue()
    xhgis({
      baseUrl: '/xh-gis/Assets', // 默认值，可省略
    }),
  ],
});
```

#### 3. 使用（无需额外配置）

```tsx
// App.tsx
import { useEffect, useRef } from 'react';
import { XgEarth } from '@xh-gis/engine';

function App() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      // 无需调用 setResourceConfig，插件已自动配置
      const earth = new XgEarth(mapRef.current);
    }
  }, []);

  return <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />;
}
```

**插件功能：**
- ✅ 自动将资源拷贝到 `public/xh-gis/Assets`
- ✅ 自动注入 `XH_GIS_BASE_URL` 全局变量
- ✅ 开发和生产环境自动处理
- ✅ 零代码配置，开箱即用

### Next.js 项目集成

#### 1. 配置 Webpack

```javascript
// next.config.mjs
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // 只在客户端构建时添加插件
    if (!isServer) {
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
        
        // 定义全局变量（XH-GIS 会自动检测）
        new webpack.DefinePlugin({
          XH_GIS_BASE_URL: JSON.stringify(xhGisBaseUrl),
        })
      );
    }

    return config;
  },
};

export default nextConfig;
```

#### 2. 安装依赖

```bash
npm install copy-webpack-plugin --save-dev
```

#### 3. 使用（无需额外配置）

```tsx
// components/MapComponent.tsx
'use client';
import { useEffect, useRef } from 'react';
import { XgEarth } from '@xh-gis/engine';

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      // 无需调用 setResourceConfig，webpack 已自动配置
      const earth = new XgEarth(mapRef.current);
    }
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
```

### 手动配置（高级场景）

如果使用其他构建工具或需要自定义配置，可以手动调用 `setResourceConfig`：

```typescript
import { setResourceConfig } from '@xh-gis/engine';

// 基本配置
setResourceConfig({
  basePath: '/xh-gis/Assets' // 对应 public/xh-gis/Assets 目录
});
```

### CDN 方案（备选）

仅在无法使用本地资源的场景下使用：

```typescript
import { setResourceConfig } from '@xh-gis/engine';

setResourceConfig({
  urlResolver: (resourcePath) => {
    return `https://cdn.jsdelivr.net/npm/@xh-gis/engine@latest/dist/Assets/${resourcePath}`;
  }
});
```

> ⚠️ **注意**：CDN 方案需要网络连接，不适用于离线环境。

### 高级配置

```typescript
// 自定义路径映射
setResourceConfig({
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

#### `setResourceConfig(config: ResourceConfig)`（高级用法）

设置全局资源配置。大多数场景不需要调用，推荐使用框架插件或环境变量。

#### `getResourceUrl(resourcePath: string): string`

获取资源的完整 URL，主要用于调试和验证。

#### `getResourceConfig(): ResourceConfig`

获取当前的资源配置，主要用于调试。

#### `ResourceConfig` 接口

```typescript
interface ResourceConfig {
  basePath?: string;           // 基础路径
  isDevelopment?: boolean;     // 是否为开发环境
  pathMapping?: Record<string, string>; // 路径映射
  urlResolver?: (resourcePath: string, config: ResourceConfig) => string; // 自定义解析器
}
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

// 特效管理（已迁移至 FX 命名空间）
// 旧的 DataSources/SpecialEffect 已废弃，请使用 FxManager + Xg*FX
import { FxManager, XgConeFX } from '@xh-gis/engine/FX';
const fxManager = new FxManager(earth);
const cone = fxManager.create(XgConeFX, {
  id: 'cone-1',
  graphics: {
    position: { cartographicDegrees: [120, 30, 0] },
    style: { length: 2000, bottomRadius: 1000, material: { fill: true, outline: true } },
    orientation: [1, 0, 0, 0],
    attitude: { azimuth: 30, elevation: -10, roll: 0 }
  },
  show: true
});
// 绑定到实体/模型（可选）
// fxManager.attach(cone.id, entity, { mode: 'position_and_orientation' });
```

### XgPopup 弹窗使用

`XgPopup` 用于在场景中展示弹窗内容，支持三种内容类型：`string`（HTML 字符串）、`HTMLElement`、以及 React 元素（JSX）。从当前版本起，弹窗对 React 内容采用宽松识别策略：只要传入内容不是 `string`、不是 `HTMLElement`，即尝试用 `react-dom/client` 渲染；渲染失败会降级为文本显示，避免空白。

#### 快速示例

```typescript
import { XgEarth, XgPopup } from '@xh-gis/engine';

const earth = new XgEarth('cesiumContainer');

// 1) 以 HTML 字符串渲染
new XgPopup({
  id: 'html-popup',
  xgCore: earth,
  position: [116.39, 39.9, 0],
  element: '<div style="color:#fff">Hello XgPopup</div>'
});

// 2) 以 HTMLElement 渲染
const dom = document.createElement('div');
dom.textContent = 'DOM 内容';
new XgPopup({ id: 'dom-popup', xgCore: earth, position: [116.4, 39.9], element: dom });

// 3) 以 React 元素渲染（推荐在客户端环境中创建）
// 注意：React 元素请在浏览器端创建并传入（Next.js 中建议在 Client 组件 + useEffect 中使用）
```

```tsx
'use client';
import React, { useEffect } from 'react';
import { XgEarth, XgPopup } from '@xh-gis/engine';

export default function PopupDemo() {
  useEffect(() => {
    const earth = new XgEarth('cesiumContainer');
    const content = (
      <div style={{ minWidth: 200, padding: 8, color: '#fff' }}>
        <div style={{ fontWeight: 600 }}>责任区详情</div>
        <div>统计项 A: 10</div>
        <div>统计项 B: 20</div>
      </div>
    );

    new XgPopup({
      id: 'react-popup',
      xgCore: earth,
      position: [116.41, 39.92, 0],
      element: content
    });
  }, []);
  return <div id="cesiumContainer" style={{ width: '100vw', height: '100vh' }} />;
}
```

#### Next.js 使用建议（React 模式）

- 将创建弹窗与 JSX 的代码置于 Client 组件文件，并在文件顶部使用 `use client`。
- 对包含地图/弹窗的大组件使用 `next/dynamic(() => import(...), { ssr: false })`，确保在客户端渲染。
- 在 `useEffect` 中创建 React 元素并传给 `XgPopup`，避免在服务端生成 JSX。

#### 更新与销毁

```typescript
const popup = new XgPopup({ id: 'p1', xgCore: earth, position: [116.39, 39.9], element: '初始内容' });

// 更新内容：赋值到 element 即可触发更新
popup.element = '<div>更新后的内容</div>';

// 更新位置
popup.position = [116.40, 39.91, 0];

// 可选：设置图标及大小
popup.icon = '/path/icon.png';
popup.iconSize = [24, 24];

// 可选：最大显示距离（超过则自动隐藏）
popup.maxRange = 200000; // 米

// 销毁
popup.destroy();
```

#### 容器说明

- 使用 `@xh-gis/widgets` 的 `WidgetEarth/WidgetMap` 时，会自动渲染弹窗容器（`.xh-gis-popup-container`）。
- 若仅使用引擎且未引入 Widgets，建议配合 Widgets 或自行在 `xgCore.container` 的父节点中提供一个 `.xh-gis-popup-container` 容器，以便弹窗正确挂载。

#### 常见问题

- JSX 在 Next.js 中必须在客户端创建并传入，否则可能无法被识别为 React 元素；本引擎采用宽松策略进行尝试渲染并兜底为文本。
- 若希望更“严格”判断，可在项目层确保统一的 React 引用（避免多实例），并按需使用 `React.isValidElement` 在业务侧先行判定。

### LayerManager 使用指南

LayerManager 统一管理图层注册、查询、可见性与删除，支持常见数据源与便捷入口。

#### 快速添加图层（统一 `add(...)`）

```typescript
import { LayerType } from '@xh-gis/engine';
import { GeoJsonDataSource, CustomDataSource, ImageryLayer, UrlTemplateImageryProvider } from 'cesium';

// 添加数据源
await earth.layerManager.add('geo', await GeoJsonDataSource.load('/data/demo.geojson'));
await earth.layerManager.add('graphics', new CustomDataSource('graphics'));

// 添加影像图层（提供者）
const provider = new UrlTemplateImageryProvider({ url: 'https://tiles/{z}/{x}/{y}.png' });
const imagery = await earth.layerManager.add('base', provider);

// 添加影像图层（实例）
earth.layerManager.add('labels', imagery as ImageryLayer);
```

#### 获取或创建（含 GEOJSON/KML 便捷加载）

```typescript
import { LayerType } from '@xh-gis/engine';

// GeoJSON：存在则返回；否则按入参决定加载或空实例
const geoDs = await earth.layerManager.getOrCreate(
  'geo1',
  LayerType.GEOJSON_DATASOURCE,
  { data: '/data/china.geojson', options: { clampToGround: true } }
);

// KML：同上
const kmlDs = await earth.layerManager.getOrCreate(
  'kml1',
  LayerType.KML_DATASOURCE,
  { data: '/data/line.kml', options: { camera: earth.viewer.camera } }
);

// 获取或创建空数据源（无加载）
const czmlDs = await earth.layerManager.getOrCreate('czml1', LayerType.CZML_DATASOURCE);
```

#### 天地图便捷入口（`addTdtLayer`）

```typescript
// 支持自定义 token 或异步解析器；可配置层级范围与子域
await earth.layerManager.addTdtLayer('img', 'tdt_img', {
  token: 'your-token',
  // 或者使用解析器
  tokenResolver: async () => fetch('/api/tdt-token').then(r => r.text()),
  minimumLevel: 0,
  maximumLevel: 18,
  tileMatrixSetID: 'w',
  subdomains: ['t0','t1','t2','t3','t4','t5','t6','t7']
});
```

#### 通过配置添加底图组合（`addBasemapLayers`）

```typescript
// 依据 BasemapConfig[] 添加底图与分组
earth.layerManager.addBasemapLayers([
  { name: 'base', type: 'xyz', url: 'https://tiles/{z}/{x}/{y}.png', show: true },
  { name: 'tdt_vec', type: 'tdt', layer: 'vec', maximumLevel: 18 },
  { name: 'group', type: 'group', layers: [
    { name: 'tdt_img', type: 'tdt', layer: 'img' },
    { name: 'tdt_label', type: 'tdt', layer: 'cia' }
  ]}
]);
```

#### 通过配置添加图层（`addLayersFromConfig`）

```typescript
// 依据 LayerConfig[] 批量添加图层（例如图形图层）
earth.layerManager.addLayersFromConfig([
  {
    id: 'graphics1',
    name: '标绘图层',
    type: 'graphic',
    show: true,
    data: [
      { type: GraphicType.POINT, position: [120, 30], style: { pixelSize: 8 } },
      { type: GraphicType.POLYLINE, positions: [[120, 30], [121, 31]], style: { width: 3 } },
      { type: GraphicType.LABEL, position: [120, 30], style: { text: 'Hello' } }
    ]
  }
]);
```

#### 查询方法

```typescript
import { LayerType } from '@xh-gis/engine';

// 获取完整记录（含 id/type/item/pid）
const record = earth.layerManager.getLayerRecord('base');

// 按类型列出
const imageryList = earth.layerManager.listByType(LayerType.IMAGERY);

// 列出全部
const allLayers = earth.layerManager.listAll();

// 按分组（pid）列出（预留：pid 当前为内部分组标识）
const groupLayers = earth.layerManager.listByPid('demo');
```

#### 可见性控制

```typescript
// 指定类型控制（旧接口）
earth.layerManager.setVisible('base', LayerType.IMAGERY, true);

// 便捷控制（自动匹配类型）
earth.layerManager.setLayerVisible('base', true);
```

#### 删除方法

```typescript
// 删除单个
earth.layerManager.removeById('base', /* destroy */ true);

// 批量按类型删除
const removedImagery = earth.layerManager.removeByType(LayerType.IMAGERY, true);

// 批量按分组删除
const removedGroup = earth.layerManager.removeByPid('demo', false);
```

> 注意：`TerrainProvider` 为全局地形；当前 `removeById/removeByType/removeByPid` 删除记录后不会自动切换全局地形。如需隐藏或切换，请使用 `setVisible(id, LayerType.TERRAIN, false)`（会切换为 `EllipsoidTerrainProvider`）。


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

## Heatmap 与等值线

XH-GIS Engine 提供 `HeatmapLayer` 支持基于 Canvas 的热度图渲染，并可叠加等值线（使用 d3-contour）。

### 快速使用

```typescript
import { Viewer } from "cesium";
import { HeatmapLayer, HeatmapOption } from "@xh-gis/engine";

const viewer = new Viewer("container");

const points = [
  { x: 116.1, y: 39.9, value: 50 },
  { x: 116.3, y: 40.1, value: 80 },
];

const options: HeatmapOption = {
  renderType: "imagery",
  points,
  heatmapOptions: {
    radius: 30,
    maxOpacity: 0.8,
    minOpacity: 0.2,
    gradient: {
      0.25: "rgb(0,0,255)",
      0.55: "rgb(0,255,0)",
      0.85: "yellow",
      1.0: "rgb(255,0,0)",
    },
  },
  heatmapDataOptions: { min: 0, max: 100 },
  zoomToLayer: true,
  contourLineOption: {
    show: true,
    // 默认：等值线数量与热度图梯度停靠数一致
    // 默认：线宽 1，颜色随色带，可用 color 覆盖
    color: "#fff",
    thresholdMode: "equalInterval", // 或 "quantile" | "custom"
    smooth: true,
    // 自定义阈值（alpha 值 0-255），仅在 thresholdMode = "custom" 时使用
    // customThresholds: [64, 128, 192],
  },
};

const layer = new HeatmapLayer(viewer, options);
```

### 等值线选项（ContourLineOption）
- `show`：是否显示等值线
- `contourCount`：分层数量（默认与热度图梯度停靠数一致；无梯度时为 5）
- `width`：线宽（默认 1）
- `color`：等值线统一颜色（默认随热度图色带；设置后覆盖）
- `thresholdMode`：阈值生成模式
  - `equalInterval`：等距分段（包含最高阈值）
  - `quantile`：分位数分段（基于 256-bin 直方图，面积更均衡）
  - `custom`：自定义阈值（使用 `customThresholds` 数组）
- `epsilonLowRatio` / `epsilonHighRatio`：低/高端裁剪比例（0-0.2，默认 0.01）
- `smooth`：平滑曲线（d3-contour），默认 `false`
- `customThresholds`：自定义阈值（alpha 0-255，仅在 `custom` 模式生效）

### 默认行为与可视性
- 等值线透明度基于色带 alpha 计算，并进行增强：最低不低于 `0.4`，上限 `1`，并有适度增益，提升白色线等在浅色底上的可见性。
- 始终包含最高阈值，保证红色高值区域的边界可见。
- 默认分层数量与热度图梯度停靠数一致，确保视觉层级与色带一致。

### 动态更新
```typescript
// 更新热度图配置（半径、透明度、梯度等）
layer.updateHeatmap({ radius: 40, maxOpacity: 0.9 });

// 更新半径（同步刷新）
layer.updateRadius(50);

// 更新等值线配置（支持增量覆盖）
layer.updateContourLineOption({
  thresholdMode: "quantile",
  contourCount: 7,
  color: "#fff",
});

// 移除图层
layer.remove();
```

### 适用建议
- 一般场景：`thresholdMode = equalInterval`，默认分层与线宽即可。
- 数据分布不均：使用 `quantile` 改善视觉均衡。
- 业务特定阈值：使用 `custom` 并提供 `customThresholds`。
- 线条对比度不足：设置统一 `color`（如 `#fff`），保持可见性增强逻辑。
## 绑定规则（选项 A）

当 FX 绑定到目标（实体/模型/图元）后，位姿计算遵循以下约定，以减少心智负担并避免双重旋转：

- 忽略图形参数中的 `orientation`（它仅用于未绑定情况下的初始姿态）。
- 微调与偏移统一通过绑定选项中的 `anchor` 完成：
  - `anchor.rotation`：局部旋转（支持 `Quaternion` 或 `HeadingPitchRoll`）。
  - `anchor.translation`：沿局部坐标系的偏移（米）。
- 扫角动画通过 `sweep` 控制，按 `axis/speed/min/max` 进行累积或往返旋转。
- FX 层的放置策略（`getPlacementRotation`）用于规范化默认放置姿态，保持视觉直觉；各 FX 可按需覆盖。

此外：

- `graphics.attitude` 已废弃（deprecated），请改用 `anchor.rotation` 作为微调入口。
- 绑定时，如果 FX 在创建时设置了 `orientation` 且未显式提供 `anchor.rotation`，管理器会将该初始 `orientation` 迁移为 `anchor.rotation`，作为一次性种子值；之后仍遵循“绑定后忽略 orientation”的规则。

示例（伪代码）：

```ts
// 创建 FX（未绑定时 orientation 用作初始姿态）
const fx = fxManager.create(XgConeFX, { graphics: { position, orientation } });

// 绑定到目标后：最终姿态来自目标 + anchor + sweep，忽略 graphics.orientation
fxManager.attach(fx.id, target, {
  mode: "position_and_orientation",
  anchor: {
    rotation: new Quaternion(...),
    translation: new Cartesian3(0, 0, 2),
  },
  sweep: { axis: "z", speed: 0.5 },
});
```