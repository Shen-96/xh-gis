/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-07 13:32:47
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-07 13:46:31
 */
import { Cartesian2, Color } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { FlowLineMSDFUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "MSDFStatic",
  uniforms: {
    image: "",
    repeat: new Cartesian2(1, 1),
    range: 0.5,
    smooth: 1.0,
    center: 0.5,
    color: new Color(1, 1, 1, 1),
  },
};

export default class MSDFStaticMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
