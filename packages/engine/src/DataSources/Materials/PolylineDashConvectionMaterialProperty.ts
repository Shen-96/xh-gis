/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-02-16 17:02:52
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:46:27
 */
import {
  MaterialProperty,
  Event,
  JulianDate,
  defined,
  Property,
  Material,
  Color,
  Cartesian3,
} from "cesium";
import PolylineDashConvectionFS from "../../Shaders/PolylineDashConvectionFS";

type Options = {
  color?: Color;
  gapColor?: Color;
  sliderColor?: Color;
  sliderLength?: number;
  dashLength?: number;
  dashPattern?: number;
  startPosition: Cartesian3;
  speed?: number;
};

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

Object.getOwnPropertyDescriptor(Material, "_materialCache")?.value.addMaterial(
  customMaterial.type,
  {
    fabric: {
      ...customMaterial,
      source: PolylineDashConvectionFS,
    },
    translucent: function (_material: Material) {
      return true;
    },
  }
);

export default class PolylineDashConvectionMaterialProperty
  implements MaterialProperty
{
  color?: Color;
  gapColor?: Color;
  sliderColor?: Color;
  sliderLength?: number;
  dashLength?: number;
  dashPattern?: number;
  startPosition: Cartesian3;
  speed?: number;
  #definitionChanged: Event<(...args: any[]) => void>;

  constructor(options: Options) {
    this.#definitionChanged = new Event();
    this.color = options.color;
    this.gapColor = options.gapColor;
    this.sliderColor = options.sliderColor;
    this.sliderLength = options.sliderLength;
    this.dashLength = options.dashLength;
    this.dashPattern = options.dashPattern;
    this.startPosition = options.startPosition;
    this.speed = options?.speed;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this.#definitionChanged;
  }

  getType(time: JulianDate): string {
    return customMaterial.type;
  }

  getValue(time: JulianDate, result?: any) {
    if (!defined(result)) {
      result = {};
    }

    result.color = this.color ?? customMaterial.uniforms.color!;
    result.gapColor = this.gapColor ?? customMaterial.uniforms.gapColor!;
    result.sliderColor =
      this.sliderColor ?? customMaterial.uniforms.sliderColor!;
    result.sliderLength =
      this.sliderLength ?? customMaterial.uniforms.sliderLength!;
    result.dashLength = this.dashLength ?? customMaterial.uniforms.dashLength!;
    result.dashPattern =
      this.dashPattern ?? customMaterial.uniforms.dashPattern!;
    result.startPosition =
      this.startPosition ?? customMaterial.uniforms.startPosition!;
    result.speed = this.speed ?? customMaterial.uniforms.speed!;

    return result;
  }

  equals(other?: Property | undefined): boolean {
    return this === other;
  }
}
