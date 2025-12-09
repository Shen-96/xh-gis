## 方案建议

* 推荐“集成型 Playground”：一个页面集中展示所有材质，可在左侧选择材质，中间画布实时预览，右侧动态参数面板。优点：一致的操作与展示、参数面板可复用、快速对比；避免多个示例散落难以维护。

* 补充“对比模式”：允许在同一场景中并排加载两条或多条折线，分别应用不同材质/参数以便对比；默认关闭，面板一键开启。

## 页面结构

* 左侧：材质导航

  * 分组（Flow、Dash、Point、Surface 等），列出 PolylineFlow、PolylineFlowAdaptive、PolylineFlowMSDF、PolylineFlowPoint、PolylineDashConvection、PolylineDashSlider、PolylineDashFlow 等

  * 支持搜索与快速切换预设

* 中间：预览画布

  * 复用当前 Earth 组件；为每个材质提供“最佳展示场景”预设（线型、长度、摄像机视角）

  * 可多线对比（最多 3 条，避免拥挤）

* 右侧：动态参数面板

  * 根据选中材质的 uniforms schema 自动生成控件（数字、开关、颜色、向量、字符串）

  * 支持重置默认、应用预设、复制当前配置为新线

## 参数面板生成规则

* 以 `SerializableUniformsMap[MaterialType.*]` 为 schema 源，自动映射控件：

  * number → 滑条 + 输入框（范围根据业务：speed、length 等给默认范围）

  * boolean → 开关

  * string（颜色）→ 颜色选择器；普通字符串 → 文本框

  * tuple（如 `[number, number]`）→ 两个数值控件

* 特殊字段约定：

  * `color/gapColor/sliderColor` → 颜色选择器（支持透明）

  * `repeat`（Flow 系列）→ X/Y 数值对

  * `dashPattern` → 数字或字符串，字符串时保留原值

  * `useCesiumTime`（支持的材质）→ 时间源切换（独立/场景）

  * `sliderLength/sliderHeightRatio/speed/reverse` 等 → 常规控件

## 数据与状态

* 统一的“材质项”模型：`{ id, materialType, uniforms }`

* 维护一个列表（默认 1 条线），对比模式下增至 2–3 条

* 参数修改实时更新所选材质项并调用 `graphicManager.update(entity)`，画布立即反映

* 提供“重置到默认”与“保存为预设”功能（本地存储或内存）

## 预设与场景

* 每个材质内置 2–3 个“展示预设”：

  * PolylineFlow：不同 repeat 与速度组合（平滑流动）

  * PolylineFlowAdaptive：fit/fill/repeatY 三模式切换与宽度关系

  * PolylineFlowMSDF：不同 range/smooth 展示边缘过渡

  * PolylineFlowPoint：reverse、速度与点图变化

  * PolylineDashConvection/Slider/Flow：常见 dashLength、sliderLength、速度与方向

* 进入材质时自动应用“最佳预设”，并可切换其他预设

## 交互增强

* 复制当前材质为第二条线（对比模式）

* 快速分享：导出当前 `materialType + uniforms` 为 JSON 文本

* 相机工具：一键重置视角到材质最佳展示视角

## 技术实现

* 抽象参数面板组件：接收 `materialType` 与 `uniforms`，基于 `SerializableUniformsMap` 自动绘制控件

* 示例页面管理器：维护材质项列表、预设应用、对比模式开关

* 与引擎交互：封装 `applyMaterial(entity, type, uniforms)` 与 `updateMaterial(entity, uniforms)`，确保安全更新

## 分步实施

1. 引入材质导航与参数面板框架；保留现有单页结构，改造为“集成型 Playground”
2. 实现基于 `SerializableUniformsMap` 的参数控件自动生成
3. 为每个材质补充 2–3 个展示预设，并设置最佳视角
4. 添加对比模式（第二条折线）与复制/重置/分享功能
5. 打磨交互细节：范围提示、单位标注（速度：秒）、透明颜色选择等

## 取舍与理由

* 一个材质一个示例：清爽但重复代码多，切换成本高，难对比

* 集成在一起：维护成本低，体验一致，方便扩展“对比模式”；推荐

* 更优扩展：未来可加路由，每个材质有子路由，同时保留集成 Playground 作为总入口

