# @xh-gis/widgets

基于 @xh-gis/engine 的 React GIS 组件库。

## 📦 安装

```bash
npm install @xh-gis/widgets @xh-gis/engine
```

## 📋 依赖要求

- **React**: >=16.8.0
- **@xh-gis/engine**: ^1.0.0
- **CesiumJS**: 1.108.0

## 🔗 相关链接

- 在线沙盒（GitHub Pages）: https://shen-96.github.io/xh-gis/

## 🚀 使用

### 三维地球组件

```tsx
import React from 'react';
import { Earth } from '@xh-gis/widgets';

function App() {
  const handleInit = (core) => {
    console.log('地球初始化完成', core);
    // 在这里可以使用 core 进行各种 GIS 操作
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

### 二维地图组件

```tsx
import React from 'react';
import { Map } from '@xh-gis/widgets';

function App() {
  const handleInit = (core) => {
    console.log('地图初始化完成', core);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Map
        onInit={handleInit}
        infoLine={true}
        timeLine={true}
        timeLineProps={{
          systemTime: true,
          shouldAnimate: false
        }}
      />
    </div>
  );
}

export default App;
```

## 🌟 组件功能

### 核心组件

- **Earth**: 三维地球组件
- **Map**: 二维地图组件

### 功能组件

- **TimeLine**: 时间轴控制组件
- **FootLine**: 状态信息栏组件
- **Toolbar**: 工具栏组件
- **PlotTools**: 标绘工具集

## ⚙️ 组件属性

### Earth / Map 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onInit` | `(core) => void` | - | 初始化完成回调，必填 |
| `infoLine` | `boolean` | `true` | 是否显示信息栏 |
| `timeLine` | `boolean` | `false` | 是否显示时间轴 |
| `timeLineProps` | `object` | `{}` | 时间轴组件属性 |
| `toolBox` | `boolean` | `false` | 是否显示工具栏 |

### TimeLineProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `systemTime` | `boolean` | `false` | 是否显示系统时间 |
| `shouldAnimate` | `boolean` | `false` | 是否自动播放动画 |

## 🎨 样式

组件自带默认样式，你也可以通过 CSS 类名自定义样式：

```css
.xh-gis-viewer {
  /* 视图容器样式 */
}

.xh-gis-viewer-scene {
  /* 场景容器样式 */
}

.xh-gis-popup-container {
  /* 弹窗容器样式 */
}
```

## 📖 API 文档

详细的 API 文档请参考主项目文档。

## 📄 许可证

MIT License