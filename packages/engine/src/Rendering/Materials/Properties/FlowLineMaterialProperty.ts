/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 19:20:04
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 22:52:45
 */
import { Cartesian2 } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { FlowLineUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "FlowLine",
  uniforms: {
    image: "",
    speed: 1,
    repeat: new Cartesian2(1, 1),
    sample1D: true,
    vScale: 1,
  },
};

export default class FlowLineMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
