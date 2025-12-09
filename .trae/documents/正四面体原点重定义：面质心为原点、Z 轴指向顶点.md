## 目标
- 修改 `Rendering/Geometries/Tetrahedron/common.ts` 的顶点坐标生成与坐标系定义：将几何局部原点设置为“某一面的质心”，并使局部 `Z` 轴指向对角顶点（apex）。
- 保持两个几何类（填充/轮廓）与 FX 用法不变，只有几何的局部坐标基变更。

## 实现方案
1. 统一顶点顺序（约定 apex 为 `v0`、底面为 `v1,v2,v3`）
   - 维持现有 `getUnitVertices()` 返回：`v0=(+1,+1,+1)`，`v1=(+1,-1,-1)`，`v2=(-1,+1,-1)`，`v3=(-1,-1,+1)`。
2. 计算底面质心与局部坐标基
   - 质心 `C = (v1+v2+v3)/3`
   - `z = normalize(v0 - C)`（指向 apex）
   - 初始 `x0 = normalize(v2 - v1)`，`y = normalize(cross(z, x0))`，再正交化 `x = normalize(cross(y, z))`
   - 构造旋转矩阵 `R = [x, y, z]`（列向量），将顶点转到局部系：`p_local = R^T * (p - C)`
3. 缩放与打包
   - 缩放因子 `s = edgeLength / (2*sqrt(2))`
   - 对全部 `p_local` 乘以 `s`
   - 更新 `packPositions(...)` 使用变换后的坐标
4. 法线与半径
   - 顶点法线可继续用“单位化顶点方向”的平滑近似：`n = normalize(p_local)`
   - 包围球半径使用新坐标的最大模长 `max(|p_local|)`
5. 公共方法与调用改造
   - 在 `common.ts` 新增：`toFaceOriginFrame(verts) => { vertsLocal, basis }`
   - 在 `TetrahedronGeometry.createGeometry(...)`、`TetrahedronOutlineGeometry.createGeometry(...)`：
     - 先取单位顶点 → 应用 `toFaceOriginFrame` → 缩放 → 打包 → 索引
   - `indices` 不变（面与棱的拓扑不变）
6. FX 与模型矩阵
   - `XgTetrahedronFX` 不改：`computeModelMatrix()` 原样；外部位置现在锚到“底面质心”，局部 `Z` 指向顶点，视觉更直观（满足你的新放置要求）。

## 兼容性与影响
- 仅改变局部坐标系原点与朝向；对外 API、示例与材质管线不变。
- 旧场景若依赖“质心为原点”的摆放，将看到锚点位置改变（现在为底面质心），这是预期改变。

## 验证
- 检查填充与轮廓的渲染位置与姿态：底面质心对齐 `position`，顶点沿局部 `+Z` 指向。
- 示例页“正四面体特效”观察：旋转与绑定行为正常，透明/轮廓一致。