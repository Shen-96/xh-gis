/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 19:11:53
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 20:16:56
 */
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { FlowPointUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "FlowPoint",
  uniforms: {
    point: "",
    background: "",
    speed: 1,
    reverse: false,
  },
};

export default class FlowPointMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
