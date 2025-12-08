/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: trae@example.com
 * @Date: 2025-12-07 20:08:05
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-08 10:52:40
 * @WeChat: yingnan55
 * @Version: 1.0.0
 */
import { Color, JulianDate } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { PolylineDashFlowUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "PolylineDashFlow",
  uniforms: {
    color: Color.WHITE,
    gapColor: Color.TRANSPARENT,
    dashLength: 16.0,
    dashPattern: 255.0,
    reverse: false,
  },
};

export default class PolylineDashFlowMaterialProperty extends BaseMaterialProperty<Options> {
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
      const ms = JulianDate.toDate(time).getTime();
      out.timeSeconds = ms / 1000.0;
    } else {
      const nowMs =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const secs = Math.max(0, (nowMs - this.#startMs) / 1000.0);
      out.timeSeconds = secs;
    }
    return out;
  }
}
