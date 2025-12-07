/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-04-25 15:57:38
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 19:40:30
 */

import { Cartesian3, MaterialAppearance, Appearance, PolylineMaterialAppearance } from "cesium";
import { defaultColorAppearance, getAppearance } from "./AppearanceRegistry";
import "./register-builtins";

export function createAppearance(
  style: any,
  params?: { startPosition?: Cartesian3 },
  options?: { geometry?: "polyline" | "surface" }
): Appearance {
  const fromRegistry = getAppearance(style, params);
  if (fromRegistry) return fromRegistry as Appearance;

  const fallback = defaultColorAppearance(style);
  const isPolyline = options?.geometry
    ? options.geometry === "polyline"
    : !!params?.startPosition;
  return isPolyline
    ? new PolylineMaterialAppearance({ material: (fallback as MaterialAppearance).material })
    : (fallback as Appearance);
}
