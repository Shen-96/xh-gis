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
    dashLength: 16.0,
    dashPattern: 255.0,
    startPosition: Cartesian3.ZERO.clone(),
    speed: 1,
  },
};

export default class PolylineDashConvectionMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
