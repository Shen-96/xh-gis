/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 19:49:36
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 15:09:34
 */
import { Color, Material, MaterialAppearance, Appearance } from "cesium";
import type { SerializableUniformsMap } from "../types";

export type AppearanceStyle<M extends keyof SerializableUniformsMap> = {
  material?: {
    customTexture?: { type?: M; uniforms?: SerializableUniformsMap[M] };
    color?: string;
    fillColor?: string;
  };
};

export type AppearanceBuilder<M extends keyof SerializableUniformsMap> = (
  style: AppearanceStyle<M>
) => Appearance;

const registry = new Map<keyof SerializableUniformsMap, AppearanceBuilder<any>>();

export function registerAppearance<M extends keyof SerializableUniformsMap>(type: M, builder: AppearanceBuilder<M>) {
  registry.set(type, builder);
}

export function getAppearance<M extends keyof SerializableUniformsMap>(
  style: AppearanceStyle<M>
): Appearance | undefined {
  const customType = style?.material?.customTexture?.type as M | undefined;
  const fallbackType = (style as any)?.material?.materialType as M | undefined;
  const type = customType ?? fallbackType;
  if (!type) return undefined;

  const builder = registry.get(type) as AppearanceBuilder<M> | undefined;
  if (!builder) return undefined;

  const uniformsFromCustom = style?.material?.customTexture?.uniforms as
    | SerializableUniformsMap[M]
    | undefined;
  const uniformsFromFallback = (style as any)?.material?.uniforms as
    | SerializableUniformsMap[M]
    | undefined;

  // Normalize uniforms: convert common color fields from string to Cesium Color
  const rawUniforms = (uniformsFromCustom ?? uniformsFromFallback ?? {}) as any;
  const normalizedUniforms = { ...rawUniforms } as any;
  const colorKeys = [
    "color",
    "gapColor",
    "sliderColor",
    "fillColor",
  ];
  for (const key of colorKeys) {
    const val = normalizedUniforms[key];
    if (typeof val === "string") {
      normalizedUniforms[key] = Color.fromCssColorString(val);
    }
  }

  // Normalize style so builders can consistently read from material.customTexture
  const normalizedStyle: AppearanceStyle<M> = {
    material: {
      ...(style.material ?? {}),
      customTexture: {
        type,
        uniforms: normalizedUniforms as any,
      },
    },
  } as any;

  return builder(normalizedStyle);
}

export function defaultColorAppearance(style: { material?: { color?: string; fillColor?: string } }): MaterialAppearance {
  const colorStr =
    style?.material?.color ?? style?.material?.fillColor ?? "rgba(255,255,0,0.3)";
  return new MaterialAppearance({
    material: Material.fromType("Color", {
      color: Color.fromCssColorString(colorStr),
    }),
  });
}
