/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-06 19:20:11
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 16:57:26
 */
import { Color, Cartesian3 } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { PolylineDashConvectionUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "PolylineDashConvection",
  uniforms: {
    color: Color.WHITE,
    gapColor: Color.TRANSPARENT,
    sliderColor: Color.RED,
    sliderLength: 8.0,
    sliderHeightRatio: 1.0,
    dashLength: 16.0,
    dashPattern: 255.0,
    speed: 1,
  },
};

export default class PolylineDashConvectionMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
