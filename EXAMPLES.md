# XH-GIS 使用示例

## 📦 三种安装方式

### 方式一：完整包安装（推荐）

```bash
npm install xh-gis
```

```typescript
// 导入所有功能
import { XgEarth, XgMap, Earth, Map } from 'xh-gis';

// 或者按需导入
import { XgEarth } from 'xh-gis';
```

### 方式二：分包安装

```bash
npm install @xh-gis/engine @xh-gis/widgets
```

```typescript
// 分别导入
import { XgEarth, XgMap } from '@xh-gis/engine';
import { Earth, Map } from '@xh-gis/widgets';
```

### 方式三：只使用引擎

```bash
npm install @xh-gis/engine
```

```typescript
import { XgEarth, XgMap } from '@xh-gis/engine';
```

## 🚀 快速开始

### 1. React 组件使用（推荐）

```tsx
import React from 'react';
import { Earth } from 'xh-gis';

function App() {
  const handleInit = (core) => {
    console.log('XH-GIS 初始化完成', core);
    
    // 添加图层
    core.layerManager.add('myLayer', myDataSource);
    
    // 开始绘制
    core.graphicManager.setDrawEventHandler('point', (result) => {
      console.log('绘制完成', result);
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Earth onInit={handleInit} />
    </div>
  );
}

export default App;
```

### 2. 直接使用引擎

```typescript
import { XgEarth } from 'xh-gis';

// 创建三维地球
const earth = new XgEarth('cesiumContainer');

// 使用各种管理器
earth.layerManager.add('layer1', dataSource);
earth.graphicManager.setDrawEventHandler('circle', callback);
earth.particleManager.add('fire', particleOptions);
```

## 📋 依赖要求

确保安装必要的依赖：

```bash
# 必需依赖
npm install cesium@1.108.0

# 如果使用 React 组件
npm install react@^18.3.1 react-dom@^18.3.1
```

## 🌟 功能示例

### 地图操作

```typescript
// 创建地球
const earth = new XgEarth('container');

// 飞行到指定位置
earth.viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 1000)
});

// 添加实体
const entity = earth.viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.4, 39.9),
  point: {
    pixelSize: 10,
    color: Cesium.Color.YELLOW
  }
});
```

### 标绘绘图

```typescript
// 绘制点
earth.graphicManager.setDrawEventHandler('point', (result) => {
  console.log('点绘制完成', result);
});

// 绘制线
earth.graphicManager.setDrawEventHandler('freehand_line', (result) => {
  console.log('线绘制完成', result);
});

// 绘制面
earth.graphicManager.setDrawEventHandler('polygon', (result) => {
  console.log('面绘制完成', result);
});
```

### 特效管理

```typescript
// 添加粒子效果
earth.particleManager.add('fire', {
  type: 'BURNING',
  position: [116.4, 39.9, 100],
  style: {
    /* 粒子样式 */
  }
});

// 添加3D特效
earth.specialEffectManager.add('cone', {
  type: 'CONE',
  position: [116.4, 39.9, 100],
  style: {
    radius: 1000,
    height: 2000
  }
});
```

### React 组件高级用法

```tsx
import { Earth, Map } from 'xh-gis';

function GISViewer() {
  const [viewMode, setViewMode] = useState('3d');
  
  const handleInit = (core) => {
    // 设置初始视角
    core.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(120, 30, 10000000)
    });
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <button onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}>
        切换视图模式
      </button>
      
      {viewMode === '3d' ? (
        <Earth onInit={handleInit} />
      ) : (
        <Map onInit={handleInit} />
      )}
    </div>
  );
}
```

## 🔧 构建配置

如果你需要自定义构建，可以参考以下 webpack 配置：

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  // ... 其他配置
  
  // 处理 Cesium
  resolve: {
    alias: {
      cesium: path.resolve(__dirname, 'node_modules/cesium/Source')
    }
  },
  
  module: {
    rules: [
      // 处理 CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      
      // 处理静态资源
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  }
};
```

## 📖 更多文档

- [Engine API 文档](./packages/engine/README.md)
- [Widgets 组件文档](./packages/widgets/README.md)
- [完整 API 参考](./docs/api.md)

## 🗂️ 静态资源配置与验证

为保证开发与生产环境都通过 HTTP 稳定访问，引擎默认将资源解析到 `'/xh-gis/Assets'`：

- 将 `node_modules/@xh-gis/engine/dist/Assets` 拷贝到应用的 `public/xh-gis/Assets`
- 不需要在代码里调用 `setResourceConfig`
- 若部署于子路径（如 `'/app'`），在构建工具中注入 `XH_GIS_BASE_URL='/app/xh-gis/Assets'`

验证方法：

```ts
import { getResourceUrl } from '@xh-gis/engine';
console.log(getResourceUrl('SkyBox/tycho2t3_80_px.jpg'));
// 期望输出：/xh-gis/Assets/SkyBox/tycho2t3_80_px.jpg
```

在浏览器 Network 面板中确认请求为 HTTP（非 `file://`），状态为 200。

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📄 许可证

MIT License