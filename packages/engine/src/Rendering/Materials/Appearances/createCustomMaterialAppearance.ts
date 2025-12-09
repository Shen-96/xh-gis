/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-04-25 15:57:38
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 15:01:33
 */

import { MaterialAppearance, Appearance, PolylineMaterialAppearance } from "cesium";
import { defaultColorAppearance, getAppearance, AppearanceStyle } from "./AppearanceRegistry";
import type { SerializableUniformsMap } from "../types";
import "./register-builtins";

export function createAppearance(
  style: AppearanceStyle<keyof SerializableUniformsMap>,
  options?: { geometry?: "polyline" | "surface" }
): Appearance {
  const fromRegistry = getAppearance(style);
  if (fromRegistry) return fromRegistry as Appearance;

  const fallback = defaultColorAppearance(style);
  const isPolyline = options?.geometry === "polyline";
  return isPolyline
    ? new PolylineMaterialAppearance({ material: (fallback as MaterialAppearance).material })
    : (fallback as Appearance);
}
