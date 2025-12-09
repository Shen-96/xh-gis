# @xh-gis/engine 架构解读

## 设计思想
- 基于 Cesium 的轻量引擎层：统一 Viewer 初始化与场景能力，避免业务直接耦合 Cesium 细节。
- 管理器模式解耦：时间、图层、标绘、特效、漫游等能力按 Manager 划分，彼此通过 Core 协作，降低耦合。
- 明确的数据与渲染分层：数据源与交互（DataSources/Graphics）、几何与材质（Rendering/*）、特效（FX/*）分层实现。
- 可扩展的注册机制：材质/Appearance 通过注册表统一管理；图元/符号通过副作用导入完成自注册。
- 强类型与统一选项：使用 TypeScript 定义统一的图形与特效样式/几何选项，便于序列化与外部调用。

## 模块划分
- Core：核心基类与各管理器，统一 Viewer 生命周期与能力
  - `src/Core/AbstractCore.ts`：Viewer 初始化、资源加载与 Manager 汇聚（/src/Core/AbstractCore.ts:164）
  - `src/Core/XgEarth.ts`、`src/Core/XgMap.ts`：三维/二维视图封装（/src/Core/XgEarth.ts:23、/src/Core/XgMap.ts:24）
  - 管理器：`LayerManager`、`GraphicManager`、`FxManager`、`RoamManager`、`TimeManager` 等（/src/index.ts:19-71）
- FX：特效体系
  - `AbstractFx` 家族：`AbstractSceneFx`、`AbstractStereoSceneFx` 提供位姿、模型矩阵、批量更新入口（/src/FX/Core/AbstractSceneFx.ts:147-160）
  - `FxManager`：集合管理与“绑定实体/模型/图元”的位姿更新（attach/pause/resume/batch）（/src/FX/Core/FxManager.ts:71-114,145-183,311-377,429-455）
  - 特效实现：如 `XgTetrahedronFX`、`XgFrustumFX` 等，按照样式/几何生成 Primitive（/src/FX/Effects/XgTetrahedronFX.ts:27-55）
- Rendering：渲染与材质体系
  - Geometries/Primitives：几何与原语的工厂（如四面体 Primitive）（/src/Rendering/Primitives/createTetrahedronPrimitive.ts:21-41）
  - Shaders：GLSL 片段着色器集合（Polyline/Ellipsoid 等）（/src/Rendering/Shaders）
  - Materials/Appearances：将自定义材质注册到 Cesium，提供 Appearance 构建（/src/Rendering/Materials/Appearances/register-builtins.ts:43-288,289-551）
- DataSources：数据与交互体系
  - Graphics 抽象：统一“绘制/编辑/拖拽/动画/序列化”生命周期（/src/DataSources/Graphics/Abstract/AbstractGraphic.ts:51-103,328-344,357-373,466-577,963-975）
  - GraphicManager：集合管理、事件分发与序列化/GeoJSON 导出（/src/Core/GraphicManager.ts:89-103,146-180,468-517,520-619）
  - Heatmap：热度图实现与等值线支持（基于本地 HeatmapJS 与 d3-contour）（/src/DataSources/Heatmap/HeatmapLayer.ts）
- types/enum：统一类型与枚举
  - 样式/几何/特效选项类型与 Layer/Graphic 映射（/src/types.ts）
  - 材质/图层/图形/符号等枚举（/src/enum.ts）

## 核心类与职责
- `AbstractCore`（/src/Core/AbstractCore.ts）
  - 负责 Viewer 初始化（资源路径、天空盒、单瓦片底图、渲染选项）（/src/Core/AbstractCore.ts:113-151,227-276）
  - 聚合各 Manager：`LayerManager`/`GraphicManager`/`FxManager` 等（构造器中实例化）（/src/Core/AbstractCore.ts:204-219）
  - 提供场景工具：选中实体、地形/像素距离计算、聚合距离、加载场景配置等（/src/Core/AbstractCore.ts:278-306,478-550,552-563）
- `XgEarth`/`XgMap`
  - 基于 `AbstractCore` 的三维/二维预置 viewerOptions（/src/Core/XgEarth.ts:14-39、/src/Core/XgMap.ts:14-41）
- `LayerManager`（/src/Core/LayerManager.ts）
  - 统一管理 Entity/DataSource/Primitive/Imagery/Terrain 等多类型图层的增删显隐（/src/Core/LayerManager.ts:207-401,765-807）
  - 事件分发与集合快照（added/removed/sizeChanged/collectionChanged）（/src/Core/LayerManager.ts:82-139）
  - 支持基础底图与天地图等加载器（/src/Core/LayerManager.ts:678-714,716-718）
- `GraphicManager`（/src/Core/GraphicManager.ts）
  - 标绘对象集合管理，事件分发，序列化与 GeoJSON 导出（/src/Core/GraphicManager.ts:468-619）
- `FxManager`（/src/FX/Core/FxManager.ts）
  - 特效集合管理与位姿绑定更新（支持扫角/锚点、批量/暂停）（/src/FX/Core/FxManager.ts:71-114,259-309,311-377,429-455）

## 数据流与交互
- 标绘交互（AbstractGraphic）
  - 绘制：点击采点→生成几何→显示关键点（/src/DataSources/Graphics/Abstract/AbstractGraphic.ts:220-293,354-373）
  - 编辑：命中实体进入编辑态→关键点拖拽/整体拖拽（/src/DataSources/Graphics/Abstract/AbstractGraphic.ts:274-291,372-444,466-577）
  - 动画：显隐动画/生长动画/闪烁动画（/src/DataSources/Graphics/Abstract/AbstractGraphic.ts:630-772,774-876,878-961）
  - 移除：释放事件与实体，并通知 Manager（/src/DataSources/Graphics/Abstract/AbstractGraphic.ts:963-975）
- 特效数据流（AbstractSceneFx → PrimitiveCollection）
  - `graphics` 持有样式与位姿数据，`computeModelMatrix` 生成模型矩阵后批量更新集合中的 Primitive（/src/FX/Core/AbstractSceneFx.ts:162-170）
  - `FxManager.attach` 按绑定目标（Entity/Model/Primitive）推导世界位姿后合成最终位姿（支持 anchor/sweep）（/src/FX/Core/FxManager.ts:185-233,231-257,259-309,145-183）

## 材质与渲染
- 自定义材质注册：在初始化阶段将多种材质写入 Cesium 的 `Material._materialCache`（/src/Rendering/Materials/Appearances/register-builtins.ts:43-288）
- Appearance 构建：通过注册表按 `type` 选择合适的 `MaterialAppearance`/`PolylineMaterialAppearance`（/src/Rendering/Materials/Appearances/AppearanceRegistry.ts:20-32,34-41；/src/Rendering/Materials/Appearances/createCustomMaterialAppearance.ts:14-29）
- Primitive 工厂：按样式/几何创建 `GeometryInstance` 与 `Primitive`，支持同步更新模型矩阵（/src/Rendering/Primitives/createTetrahedronPrimitive.ts:21-41）

## 资源与构建
- 构建：Rollup ESM 输出，`preserveModules` 保持 `src` 目录结构（/rollup.config.mjs:18-24）
- 外部依赖：`cesium`、`react`、`react-dom` 作为 peer（/package.json:24-28）
- 资源路径策略：支持环境变量 `XH_GIS_BASE_URL` 或默认 `/xh-gis/Assets`，并提供预加载器（/src/Core/ResourceConfig.ts:68-106,128-145,149-173,187-258,260-281）

## 对外 API（入口）
- 命名导出：`XgEarth`、`XgMap`、各 Manager 与工具类（/src/index.ts:58-91）
- 命名空间导出：`export * as FX` 统一特效入口（/src/index.ts:35-37）
- 侧效注册：图元/符号与材质在入口副作用导入完成注册（/src/index.ts:11-13）

## 典型用法
```ts
import { XgEarth, FX, MaterialType } from "@xh-gis/engine";

const earth = new XgEarth("#container");

// 设置视角
earth.viewer.scene.camera.setView({ /* ... */ });

// 创建并添加四面体特效
const fx = new FX.XgTetrahedronFX({
  id: "tetra-fx",
  graphics: {
    position: { cartesian: [x, y, z] },
    orientation: [qx, qy, qz, qw],
    edgeLength: 20000,
    material: {
      fill: true,
      color: "rgba(255,255,255,0.6)",
      materialType: MaterialType.SolidColor,
      outline: true,
      outlineColor: "rgba(255,128,0,0.95)",
      outlineWidth: 1,
      outlineMaterialType: MaterialType.SolidColor,
      uniforms: {},
    },
  },
});
earth.fxManager.add(fx);
```

## 扩展点速览
- 新增特效：继承 `AbstractSceneFx`/`AbstractStereoSceneFx`，实现 `init` 与 `computeModelMatrix`，并在入口暴露类型。
- 新增材质：在 `register-builtins.ts` 注册 `MaterialType` 与其 uniforms，必要时在 `AppearanceRegistry` 注册 builder。
- 新增图元/符号：在对应目录实现类并在 `DataSources/register-all.ts` 里副作用导入以完成自注册。

