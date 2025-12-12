/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 19:20:18
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 19:21:47
 */
import { Color } from "cesium";
import { getResourceUrl } from "../../../Core/ResourceConfig";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { DynamicWallUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options & {
    image: string;
  };
};

const customMaterial: CustomMaterial = {
  type: "DynamicWall",
  uniforms: {
    color: new Color(1, 1, 1, 1),
    image: getResourceUrl("Textures/wall.png"),
    speed: 1,
  },
};

export default class DynamicWallMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options?: Options) {
    super(customMaterial.type, options ?? {}, customMaterial.uniforms);
  }
}
