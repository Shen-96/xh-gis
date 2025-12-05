/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-05 10:18:35
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-05 10:18:56
 */
import type { Color, Cartesian2, Cartesian3 } from "cesium";
import { MaterialType } from "../../enum";

// Common aliases
export type ColorLike = Color | string;

// Ellipsoid family
export interface EllipsoidScanUniforms {
  color?: ColorLike;
  speed?: number;
  smooth?: boolean;
}
export interface EllipsoidElectricUniforms {
  color?: ColorLike;
  speed?: number;
}
export interface EllipsoidSpiralUniforms {
  color?: ColorLike;
  speed?: number;
}
export interface EllipsoidWaveUniforms {
  color?: ColorLike;
  speed?: number;
}

// Polyline effects
export interface PolylineDashConvectionUniforms {
  color?: ColorLike;
  gapColor?: ColorLike;
  sliderColor?: ColorLike;
  sliderLength?: number;
  dashLength?: number;
  dashPattern?: number | string;
  startPosition?: Cartesian3;
  speed?: number;
}
export interface PolylineDashSliderUniforms extends PolylineDashConvectionUniforms {
  reverse?: boolean;
}

// Point/Line flow effects
export interface FlowLineUniforms {
  image?: string;
  speed?: number;
  repeat?: Cartesian2;
}
export interface FlowPointUniforms {
  point?: string;
  background?: string;
  speed?: number;
  reverse?: boolean;
}
export interface ConvectionPointUniforms {
  point?: string;
  background?: string;
  speed?: number;
}

// Surface effects
export interface CircleRippleUniforms {
  color?: ColorLike;
  speed?: number;
  count?: number;
  gradient?: number;
}
export interface DynamicWallUniforms {
  color?: ColorLike;
  image?: string;
  speed?: number;
}

// Optional helper union for consumers
export type MaterialUniforms =
  | EllipsoidScanUniforms
  | EllipsoidElectricUniforms
  | EllipsoidSpiralUniforms
  | EllipsoidWaveUniforms
  | PolylineDashConvectionUniforms
  | PolylineDashSliderUniforms
  | FlowLineUniforms
  | FlowPointUniforms
  | ConvectionPointUniforms
  | CircleRippleUniforms
  | DynamicWallUniforms;

// Hints for mapping MaterialType to uniforms shape
export type MaterialTypeUniformsMap = {
  [MaterialType.EllipsoidScan]: EllipsoidScanUniforms;
  [MaterialType.EllipsoidElectric]: EllipsoidElectricUniforms;
  [MaterialType.EllipsoidSpiral]: EllipsoidSpiralUniforms;
  [MaterialType.EllipsoidWave]: EllipsoidWaveUniforms;
  [MaterialType.PolylineDashConvection]: PolylineDashConvectionUniforms;
  [MaterialType.PolylineDashSlider]: PolylineDashSliderUniforms;
  [MaterialType.FlowLine]: FlowLineUniforms;
  [MaterialType.FlowPoint]: FlowPointUniforms;
  [MaterialType.ConvectionPoint]: ConvectionPointUniforms;
  [MaterialType.CircleRipple]: CircleRippleUniforms;
  [MaterialType.DynamicWall]: DynamicWallUniforms;
};