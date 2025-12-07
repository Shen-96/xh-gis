/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 19:20:00
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 20:02:19
 */
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { ConvectionPointUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "ConvectionPoint",
  uniforms: {
    point: "",
    background: "",
    speed: 1,
  },
};

export default class ConvectionPointMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
