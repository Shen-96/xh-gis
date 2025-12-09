## 问题研判
- 报错信息：Cannot assign to read only property '0' of object '[object Object]'，定位到 `XgTetrahedronFX.ts:28-72` 的构建流程。
- 可疑点：
  1) 两个几何类的 `BoundingSphere` 使用了 `new BoundingSphere(undefined as any, radius)`，Cesium 后续在计算或写入中心时会访问 `center[0]`，若中心对象非法/冻结会触发只读错误。
  2) `createAppearance(style)` 入参目前包含 `edgeLength` 等非材质字段，虽不必然报错，但建议只传材质子对象以规避潜在写入。

## 修复方案
1. 将两个几何类的包围球中心改为 `Cartesian3.ZERO`：
   - `Rendering/Geometries/Tetrahedron/TetrahedronGeometry.ts` → `new BoundingSphere(Cartesian3.ZERO, radius)`
   - `Rendering/Geometries/Tetrahedron/TetrahedronOutlineGeometry.ts` → 同上
2. 规范工厂入参：
   - `createTetrahedronPrimitive(...)` 调用 `createAppearance(style.material)`，不传入包含非材质参数的对象
   - 保持轮廓工厂不变（使用 `PerInstanceColorAppearance`）

## 验证步骤
- 重新运行 Sandcastle 示例“正四面体特效”，确认不再出现只读属性错误；
- 观察 DebugModelMatrixPrimitive 的坐标轴是否正常显示（面质心为原点、Z 指向顶点）。

## 影响范围
- 改动局限于正四面体几何与工厂/FX，其他效果与几何不受影响；
- API 不变，示例无需修改调用参数。