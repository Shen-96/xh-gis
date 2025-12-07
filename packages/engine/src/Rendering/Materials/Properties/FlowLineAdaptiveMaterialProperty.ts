/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 23:21:58
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 23:22:19
 */
import { Cartesian2, Color } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { FlowLineAdaptiveUniforms as Options } from "../types";
import { ensureCartesian2 } from "../utils";

type CustomMaterial = {
  type: string;
  uniforms: Options & { mode: number };
};

const customMaterial: CustomMaterial = {
  type: "FlowLineAdaptive",
  uniforms: {
    color: Color.WHITE,
    image: "",
    speed: 1,
    repeat: new Cartesian2(1, 1),
    lineWidthPx: 1,
    imageHeightPx: 64,
    mode: 0,
  },
};

export default class FlowLineAdaptiveMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    const merged = { ...options } as any;
    const norm: any = {
      image: merged.image ?? customMaterial.uniforms.image,
      speed: merged.speed ?? customMaterial.uniforms.speed,
      repeat: ensureCartesian2(merged.repeat ?? customMaterial.uniforms.repeat, customMaterial.uniforms.repeat as Cartesian2),
      lineWidthPx: merged.lineWidthPx ?? customMaterial.uniforms.lineWidthPx,
      imageHeightPx: merged.imageHeightPx ?? customMaterial.uniforms.imageHeightPx,
      mode: merged.modeIndex ?? merged.mode ?? customMaterial.uniforms.mode,
      color: (merged.color as Color) ?? Color.fromCssColorString("white"),
    };
    super(customMaterial.type, norm, customMaterial.uniforms);
  }
}
