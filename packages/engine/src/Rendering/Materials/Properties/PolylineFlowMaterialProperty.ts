import { Cartesian2 } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { FlowLineUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "PolylineFlow",
  uniforms: {
    image: "",
    speed: 1,
    repeat: new Cartesian2(1, 1),
    sample1D: true,
    vScale: 1,
  },
};

export default class PolylineFlowMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
