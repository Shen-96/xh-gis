## 目标
- 在 `TetrahedronFxExample.tsx` 创建正四面体 FX 后，新增一个 `DebugModelMatrixPrimitive` 展示其模型矩阵坐标轴，便于直观检查“面质心为原点、Z 指向顶点”的放置。

## 变更点
- 引入 `DebugModelMatrixPrimitive`：`import { DebugModelMatrixPrimitive } from 'cesium'`
- 在创建并添加 FX 后，读取其第一个图元的 `modelMatrix`：`const m = fx.getPrimitives().get(0)?.modelMatrix`
- 添加调试原语：`viewer.scene.primitives.add(new DebugModelMatrixPrimitive({ modelMatrix: m, length: 30000 }))`

## 验证
- 打开示例页面，看到红/绿/蓝三轴从底面质心出发，蓝轴（Z）应指向顶点方向
- 与 FX 同步移动时，坐标轴随模型矩阵更新而变化