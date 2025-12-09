/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
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
  const type = style?.material?.customTexture?.type as M | undefined;
  if (!type) return undefined;
  const builder = registry.get(type) as AppearanceBuilder<M> | undefined;
  return builder ? builder(style) : undefined;
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
