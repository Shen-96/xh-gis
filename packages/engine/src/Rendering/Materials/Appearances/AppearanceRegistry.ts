/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 19:49:36
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 20:22:07
 */
import { Color, Material, MaterialAppearance, Cartesian3, Appearance } from "cesium";

export type AppearanceBuilder = (
  style: any,
  params?: { startPosition?: Cartesian3 }
) => Appearance;

const registry = new Map<string, AppearanceBuilder>();

export function registerAppearance(type: string, builder: AppearanceBuilder) {
  registry.set(type, builder);
}

export function getAppearance(
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

