/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-04 17:30:56
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-04 17:37:38
 */
/*
 * @Descripttion: Material registry for custom shaders
 * @Author: Xiaohu.Shen (refactor by assistant)
 */
import { Color, Material, MaterialAppearance, Cartesian3, Appearance } from "cesium";

export type MaterialBuilder = (
  style: any,
  params?: { startPosition?: Cartesian3 }
) => Appearance;

const registry = new Map<string, MaterialBuilder>();

export function registerMaterial(type: string, builder: MaterialBuilder) {
  registry.set(type, builder);
}

export function getMaterialAppearance(
  style: any,
  params?: { startPosition?: Cartesian3 }
): Appearance | undefined {
  const type = style?.material?.customTexture?.type as string | undefined;
  if (!type) return undefined;
  const builder = registry.get(type);
  return builder ? builder(style, params) : undefined;
}

export function defaultColorAppearance(style: any): MaterialAppearance {
  const colorStr =
    style?.material?.color ?? style?.material?.fillColor ?? "rgba(255,255,0,0.3)";
  return new MaterialAppearance({
    material: Material.fromType("Color", {
      color: Color.fromCssColorString(colorStr),
    }),
  });
}