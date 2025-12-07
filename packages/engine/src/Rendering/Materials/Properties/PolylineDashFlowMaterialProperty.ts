import { Color } from "cesium";
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
    sliderColor: Color.YELLOW,
    sliderLength: 8.0,
    dashLength: 16.0,
    dashPattern: 255.0,
    speed: 1,
    reverse: false,
  },
};

export default class PolylineDashFlowMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}

