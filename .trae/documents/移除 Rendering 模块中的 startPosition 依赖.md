## 优化后的方案
- 以 `PolylineDashSliderFS.ts` 为参照，重写 `PolylineDashConvectionFS.ts` 的流动逻辑，完全移除 `startPosition` 依赖，改用统一的 time/sliderLength/sliderColor 等 uniforms 实现单向（或可选双向）流动。

## 具体改动
1) Shader
- `Shaders/PolylineDashConvectionFS.ts`
  - 删除 `startPosition` uniform 与相关窗口坐标计算
  - 按 `PolylineDashSliderFS` 的实现改写：使用 `czm_frameNumber` 或 `u_time` 与 `sliderLength/speed` 控制滑块位置，基于线段纹理坐标计算遮罩，与 dashPattern/gapColor 兼容

2) 类型与属性
- `Materials/types.ts`
  - 从 `PolylineDashConvectionUniforms` 移除 `startPosition`
- `Materials/Properties/PolylineDashConvectionMaterialProperty.ts`
  - 删除默认 `startPosition`，更新 `getValue`/`equals` 逻辑以匹配新 uniforms

3) Appearance 体系
- `Materials/Appearances/AppearanceRegistry.ts`
  - 移除 `params?: { startPosition?: Cartesian3 }` 及所有引用
- `createCustomMaterialAppearance.ts`
  - 移除 `params` 参数，只保留 `style` 与 `{ geometry }`
- `register-builtins.ts`
  - 取消对 `params?.startPosition` 的读取与传递，统一从 `style.material.customTexture.uniforms` 获取配置

4) 调用点
- `Primitives/createPolylinePrimitive.ts` 已改为 `{ geometry: 'polyline' }`；确认其他地方不再传 `startPosition`

## 验证
- TypeScript 编译通过；IDE 无红线
- 对比 `PolylineDashSliderFS` 示例，确保 Convection 效果按滑块长度/速度流动，表现与预期一致

## 交付
- 提交上述文件的修改，确保去除 `startPosition` 后渲染正确且 API 简化