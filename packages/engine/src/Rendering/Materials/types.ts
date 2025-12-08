/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-05 10:18:35
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-08 16:14:40
 */
import type { Color, Cartesian2, Cartesian3 } from "cesium";
import { MaterialType } from "../../enum";

// Ellipsoid family
export interface EllipsoidScanUniforms {
  color?: Color;
  speed?: number;
  smooth?: boolean;
}
export interface EllipsoidElectricUniforms {
  color?: Color;
  speed?: number;
}
export interface EllipsoidSpiralUniforms {
  color?: Color;
  speed?: number;
}
export interface EllipsoidWaveUniforms {
  color?: Color;
  speed?: number;
}

// Polyline effects
export interface PolylineDashUniforms {
  color?: Color;
  gapColor?: Color;
  dashLength?: number;
  dashPattern?: number;
}

export interface PolylineDashConvectionUniforms extends PolylineDashUniforms {
  sliderColor?: Color;
  sliderLength?: number;
  speed?: number;
  startPosition?: Cartesian3;
}

export interface PolylineDashSliderUniforms extends PolylineDashUniforms {
  sliderColor?: Color;
  sliderLength?: number;
  speed?: number;
  reverse?: boolean;
  sliderHeightRatio?: number;
  useCesiumTime?: boolean;
}

export interface PolylineDashFlowUniforms extends PolylineDashUniforms {
  reverse?: boolean;
  useCesiumTime?: boolean;
}

// Point/Line flow effects
export interface FlowLineUniforms {
  image?: string;
  speed?: number;
  repeat?: Cartesian2;
  sample1D?: boolean;
  vScale?: number;
}

export interface FlowLineAdaptiveUniforms {
  image?: string;
  speed?: number;
  repeat?: Cartesian2;
  lineWidthPx?: number;
  imageHeightPx?: number;
  modeIndex?: number;
  color?: Color;
}

export interface FlowLineMSDFUniforms {
  image?: string;
  color?: Color;
  speed?: number;
  repeat?: Cartesian2;
  range?: number;
  smooth?: number;
  center?: number;
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
  color?: Color;
  speed?: number;
  count?: number;
  gradient?: number;
}
export interface DynamicWallUniforms {
  color?: Color;
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
  | FlowLineAdaptiveUniforms
  | FlowLineMSDFUniforms
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
  [MaterialType.PolylineDashFlow]: PolylineDashFlowUniforms;
  [MaterialType.PolylineFlow]: FlowLineUniforms;
  [MaterialType.PolylineFlowAdaptive]: FlowLineAdaptiveUniforms;
  [MaterialType.PolylineFlowMSDF]: FlowLineMSDFUniforms;
  [MaterialType.PolylineFlowPoint]: FlowPointUniforms;
  [MaterialType.ConvectionPoint]: ConvectionPointUniforms;
  [MaterialType.CircleRipple]: CircleRippleUniforms;
  [MaterialType.DynamicWall]: DynamicWallUniforms;
};

// 序列化 Uniforms（用于公共 API 入参，不含 Cesium 实例）
export type SerializableUniformsMap = {
  [MaterialType.PolylineArrow]: { color?: string };
  [MaterialType.EllipsoidScan]: {
    color?: string;
    speed?: number;
    smooth?: boolean;
  };
  [MaterialType.EllipsoidElectric]: { color?: string; speed?: number };
  [MaterialType.EllipsoidSpiral]: { color?: string; speed?: number };
  [MaterialType.EllipsoidWave]: { color?: string; speed?: number };
  [MaterialType.PolylineDashConvection]: {
    color?: string;
    gapColor?: string;
    sliderColor?: string;
    sliderLength?: number;
    dashLength?: number;
    dashPattern?: number | string;
    speed?: number;
  };
  [MaterialType.PolylineDashSlider]: {
    color?: string;
    gapColor?: string;
    sliderColor?: string;
    sliderLength?: number;
    sliderHeightRatio?: number;
    dashLength?: number;
    dashPattern?: number | string;
    speed?: number;
    reverse?: boolean;
    useCesiumTime?: boolean;
  };
  [MaterialType.PolylineDashFlow]: {
    color?: string;
    gapColor?: string;
    sliderColor?: string;
    sliderLength?: number;
    dashLength?: number;
    dashPattern?: number | string;
    speed?: number;
    reverse?: boolean;
    useCesiumTime?: boolean;
  };
  [MaterialType.PolylineFlow]: {
    image?: string;
    speed?: number;
    repeat?: [number, number];
    sample1D?: boolean;
    vScale?: number;
  };
  [MaterialType.PolylineFlowAdaptive]: {
    image?: string;
    speed?: number;
    repeat?: [number, number];
    lineWidthPx?: number;
    imageHeightPx?: number;
    modeIndex?: number;
    mode?: number;
    color?: string;
  };
  [MaterialType.PolylineFlowMSDF]: {
    image?: string;
    color?: string;
    speed?: number;
    repeat?: [number, number];
    range?: number;
    smooth?: number;
    center?: number;
  };
  [MaterialType.MSDFStatic]: {
    image?: string;
    color?: string;
    speed?: number;
    repeat?: [number, number];
    range?: number;
    smooth?: number;
    center?: number;
  };
  [MaterialType.PolylineFlowPoint]: {
    point?: string;
    background?: string;
    speed?: number;
    reverse?: boolean;
  };
  [MaterialType.ConvectionPoint]: {
    point?: string;
    background?: string;
    speed?: number;
  };
  [MaterialType.CircleRipple]: {
    color?: string;
    speed?: number;
    count?: number;
    gradient?: number;
  };
  [MaterialType.DynamicWall]: {
    color?: string;
    image?: string;
    speed?: number;
  };
};
