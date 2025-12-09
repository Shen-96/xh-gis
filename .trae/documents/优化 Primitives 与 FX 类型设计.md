## 目标
- 为 Rendering/Primitives 与 `src/types.ts#L867-929` 的 FX 选项提供更强/更一致的类型约束
- 消除 `any` 与不必要的默认联合，提升扩展性与 IDE 可发现性
- 不破坏现有 API 使用方式（渐进增强）

## 关键问题
- 默认 `XgFxStyleOptions` 未包含四面体，导致泛型默认值与新 FX 不匹配（src/types.ts:900-903 vs 913-919）
- `AppearanceRegistry` 的 `style: any` 与 `getAppearance(style: any)` 缺少类型安全（src/Rendering/Materials/Appearances/AppearanceRegistry.ts:25）
- `createCustomMaterialAppearance` 通过 `params?.startPosition` 猜测几何类型，易误判（src/Rendering/Materials/Appearances/createCustomMaterialAppearance.ts:23-28）
- Primitives 工厂函数签名分散，缺少统一类型约束与发现性（src/Rendering/Primitives/*）

## 设计方案
### 1) FX 选项统一与默认值修正
- 引入更通用的 FX 泛型：
```ts
// 统一的立体 FX 样式包裹：提供 orientation 为输入类型，内部仍以 UnitQuaternionValue 持久化
type OrientationLikeInput = UnitQuaternionValue | Quaternion; // 仅输入层，内部继续存 UnitQuaternionValue
export type StereoFxStyle<T extends object> = Omit<T, "orientation"> & { orientation?: OrientationLikeInput };

// 图形选项统一：保留 position，禁止显式 show
export type FxGraphicOptions<TStyle extends object> = Omit<TStyle, "show"> & { position?: PositionOptions };

// FX Options：不再用含不全的默认联合，强制显式传入 TStyle
export type FxOptions<TStyle extends object> = {
  id?: string; name?: string; show?: boolean; availability?: string | string[];
  graphics: FxGraphicOptions<TStyle>;
};
```
- 修正类型联合：将四面体并入统一联合或改为按需显式传入泛型，以避免默认值遗漏：
```ts
export type XgTetrahedronFxStyleOptions = StereoFxStyle<TetrahedronStyleOptions>;
export type XgConeFxStyleOptions = StereoFxStyle<ConeStyleOptions>;
export type XgEllipsoidFxStyleOptions = StereoFxStyle<EllipsoidStyleOptions>;
export type XgFrustumFxStyleOptions = StereoFxStyle<FrustumStyleOptions>;
export type XgSuperGifFxStyleOptions = BillboardStyleOptions & { delay?: number; loop?: boolean; iterations?: number };

// 如需保留联合，务必包含 Tetrahedron：
export type XgFxStyleOptions =
  | XgConeFxStyleOptions
  | XgEllipsoidFxStyleOptions
  | XgFrustumFxStyleOptions
  | XgTetrahedronFxStyleOptions
  | XgSuperGifFxStyleOptions;
```

### 2) Primitives 工厂统一类型
- 新增 `Rendering/Primitives/types.ts`，集中定义形状映射与工厂选项：
```ts
export type PrimitiveKind = "tetrahedron" | "frustum" | "cone" | "ellipsoid" | "polyline" | "sector" | "cylinder";

export type PrimitiveStyleMap = {
  tetrahedron: TetrahedronStyleOptions;
  frustum: FrustumStyleOptions;
  cone: ConeStyleOptions;
  ellipsoid: EllipsoidStyleOptions;
  polyline: PolylineStyleOptions;
  sector: SectorStyleOptions;
  cylinder: CylinderStyleOptions;
};

export type PrimitiveGraphicMap = {
  tetrahedron: TetrahedronGraphicOptions;
  frustum: FrustumGraphicOptions;
  // ... 其余同理
};

export type PrimitiveCreateOptions<K extends PrimitiveKind> = {
  id?: string;
  style: PrimitiveGraphicMap[K];
  modelMatrix?: Matrix4;
};
```
- 为各 `create*Primitive` 增加一致的泛型签名（不改动现有参数顺序）：
```ts
export function createTetrahedronPrimitive(
  id: string,
  style: PrimitiveGraphicMap["tetrahedron"],
  modelMatrix?: Matrix4
): Primitive | undefined;
// 其余 create* 保持同样风格
```

### 3) Appearance 注册类型安全
- 用 `MaterialType` → uniforms 的映射替换 `any`：
```ts
import type { SerializableUniformsMap } from "../types"; // 已存在

export type AppearanceStyle<M extends MaterialType> = {
  material?: { customTexture?: { type: M; uniforms?: SerializableUniformsMap[M] } };
  material?: { color?: string; fillColor?: string } & any; // 兼容 SolidColor 回退
};

export type AppearanceBuilder<M extends MaterialType> = (
  style: AppearanceStyle<M>,
  params?: { startPosition?: Cartesian3 }
) => Appearance;

const registry = new Map<MaterialType, AppearanceBuilder<any>>();
export function registerAppearance<M extends MaterialType>(type: M, builder: AppearanceBuilder<M>) { registry.set(type, builder); }
export function getAppearance<M extends MaterialType>(style: AppearanceStyle<M>, params?: { startPosition?: Cartesian3 }): Appearance | undefined {
  const type = style?.material?.customTexture?.type as M | undefined;
  if (!type) return undefined;
  const builder = registry.get(type) as AppearanceBuilder<M> | undefined;
  return builder ? builder(style, params) : undefined;
}
```

### 4) `createCustomMaterialAppearance` 显式几何判定
- 移除基于 `params?.startPosition` 的猜测，改为显式枚举：
```ts
export function createAppearance(
  style: AppearanceStyle<MaterialType>,
  params?: { startPosition?: Cartesian3 },
  options?: { geometry: "polyline" | "surface" }
): Appearance {
  const fromRegistry = getAppearance(style, params);
  if (fromRegistry) return fromRegistry;

  const fallback = defaultColorAppearance(style);
  return options?.geometry === "polyline"
    ? new PolylineMaterialAppearance({ material: (fallback as MaterialAppearance).material })
    : (fallback as Appearance);
}
```

### 5) 迁移与兼容
- 保留现有导出别名与结构；新增类型仅增强 IDE 推断，不影响运行时。
- `XgTetrahedronFX` 不需改动；仅因联合类型补全/泛型使用变更而获得更好的提示（src/FX/Effects/XgTetrahedronFX.ts）。
- 各 `create*Primitive` 暂以类型签名增强，不改动实现逻辑（如 `createTetrahedronPrimitive`：src/Rendering/Primitives/createTetrahedronPrimitive.ts:21-41）。

### 6) 验证
- 编译类型检查通过；随机抽取 Sandcastle 示例（Tetrahedron）确保无类型回归（packages/sandcastle/src/examples/basic/TetrahedronFxExample.tsx）。
- IDE 中 `FxOptions<...>`、`create*Primitive`、`registerAppearance` 的自动补全显著改善。

## 输出
- 更新 `src/types.ts#L867-929` 相关类型（StereoFxStyle/FxGraphicOptions/FxOptions、加入四面体）
- 新增 `src/Rendering/Primitives/types.ts`
- 优化 `AppearanceRegistry.ts` 与 `createCustomMaterialAppearance.ts` 的类型签名

确认后我将实施以上改动，并在关键文件处更新类型与轻量注释说明（不改动运行时行为）。