## 交付内容
- 一份面向开发者的架构解读文档（ARCHITECTURE.md），涵盖设计思想、模块划分、核心类职责、数据流、扩展点与典型用法
- 附带模块关系图（Mermaid）与关键代码跳转引用

## 实施步骤
1. 目录映射：梳理 `src` 下 Core/FX/Rendering/DataSources/types/enum 的层次结构与依赖关系
2. 核心类解析：逐条总结 `AbstractCore`/`XgEarth`/`XgMap`/各 Manager 的职责、协作与生命周期
3. 渲染体系：说明 Materials/Shaders/Appearances 注册机制与 Primitives/Geometries 的构造流程
4. 标绘体系：解释 Graphics 抽象、交互流程（绘制/编辑/拖拽/动画）与序列化/GeoJSON 导出
5. 特效体系：说明 `AbstractFx` 家族、`FxManager` 绑定/批量/暂停能力与示例（如四面体）
6. 资源与构建：记录 Rollup 输出、`peerDependencies` 与 ResourceConfig 的资源路径策略
7. 对外 API：整理 `index.ts` 的 re-export 面向使用者的入口（Earth/Map/Managers/FX 等）
8. 典型用法：提供最小示例（初始化 Earth、添加底图、创建并绑定 FX）

## 可选增强
- 添加 Mermaid 模块图与数据流示意
- 对应 Sandcastle 示例的“引擎调用路径”说明

确认后我将生成并提交 ARCHITECTURE.md（不涉及代码变更），供团队长期参考。