import BaseMaterialProperty from "./BaseMaterialProperty";
import type { FlowPointUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "PolylineFlowPoint",
  uniforms: {
    point: "",
    background: "",
    speed: 1,
    reverse: false,
  },
};

export default class PolylineFlowPointMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
