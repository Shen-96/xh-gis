import { Color } from "cesium";
import BaseMaterialProperty from "./BaseMaterialProperty";
import type { CircleRippleUniforms as Options } from "../types";

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "CircleRipple",
  uniforms: {
    color: new Color(1, 1, 1, 1),
    speed: 1,
    count: 5,
    gradient: 0.2,
  },
};

export default class CircleRippleMaterialProperty extends BaseMaterialProperty<Options> {
  constructor(options?: Options) {
    super(customMaterial.type, options ?? {}, customMaterial.uniforms);
  }
}
