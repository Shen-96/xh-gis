## 原点与坐标系定义

* 几何局部坐标系的原点设置为“正四面体的几何中心（质心）”，即四个顶点的平均点在 `[0,0,0]`

* 顶点坐标采用标准正四面体构型：

  * `(+1, +1, +1)`、`(+1, -1, -1)`、`(-1, +1, -1)`、`(-1, -1, +1)`

  * 以上坐标的质心为原点，四个顶点等距，构成正四面体；法线按三角面右手法则计算

* 边长缩放：目标边长 `a` 与标准构型边长 `a0 = 2*sqrt(2)` 的比例 `s = a / a0`，局部坐标按 `s` 统一缩放

* 放置与姿态：世界放置通过 `modelMatrix` 完成，FX 中按 `position+orientation` 计算；若需“某一顶点贴地”，可在 FX 中叠加局部偏移 `composePlacementModelMatrixWithLocalOffset`

## 文件与拆分

* `Rendering/Primitives/TetrahedronGeometry.ts`：类 `TetrahedronGeometry`（TRIANGLES），以质心为原点

* `Rendering/Primitives/TetrahedronOutlineGeometry.ts`：类 `TetrahedronOutlineGeometry`（LINES），共享同一顶点集与缩放

## FX 渲染

* `XgTetrahedronFX` 内联 VS/FS，`gl_Position = czm_modelViewProjection * vec4(position, 1.0)`；支持简易光照与透明

* `computeModelMatrix()` 按 `position/orientation`（质心对齐世界坐标），可选局部偏移将某顶点（或重心到基面）贴地

## 示例与验证

* Sandcastle 中演示：质心放置、顶点贴地偏移两种模式；显示填充+outline

## 请确认

* 原点采用质心（[0,0,0]），并据此实现两类几何与 FX；确认后开始编码