/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: trae@example.com
 * @Date: 2025-12-06 19:20:07
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-08 17:09:51
 * @WeChat: yingnan55
 * @Version: 1.0.0
 */
import { Color, Cartesian3, JulianDate } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { PolylineDashSliderUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "PolylineDashSlider",
  uniforms: {
    color: Color.WHITE,
    gapColor: Color.TRANSPARENT,
    sliderColor: Color.RED,
    sliderLength: 8.0,
    sliderHeightRatio: 1.0,
    dashLength: 16.0,
    dashPattern: 255.0,
    speed: 1,
    reverse: false,
    useCesiumTime: false,
  },
};

export default class PolylineDashSliderMaterialProperty extends BaseMaterialProperty<Options> {
  #startMs: number;
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
    this.#startMs =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }
  getValue(time: JulianDate, result?: any) {
    const out = super.getValue(time, result);
    const useCesiumTime = !!out.useCesiumTime;
    if (useCesiumTime) {
      out.timeSeconds = JulianDate.toDate(time).getTime() / 1000.0;
    } else {
      const nowMs =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      out.timeSeconds = Math.max(0, (nowMs - this.#startMs) / 1000.0);
    }
    return out;
  }
}
