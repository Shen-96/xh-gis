import { Cartesian2 } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { FlowLineMSDFUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "FlowLineMSDF",
  uniforms: {
    image: "",
    speed: 1,
    repeat: new Cartesian2(1, 1),
    range: 0.5,
    smooth: 1.0,
  },
};

export default class FlowLineMSDFMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options: Options) {
    super(customMaterial.type, options, customMaterial.uniforms);
  }
}
