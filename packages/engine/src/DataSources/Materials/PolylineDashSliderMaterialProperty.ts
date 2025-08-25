/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-02-16 17:02:52
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:46:35
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
import PolylineDashSliderFS from "../../Shaders/PolylineDashSliderFS";
import { MaterialType } from "../../index";

type Options = {
  color?: Color;
  gapColor?: Color;
  sliderColor?: Color;
  sliderLength?: number;
  dashLength?: number;
  dashPattern?: number;
  startPosition: Cartesian3;
  speed?: number;
  reverse?: boolean;
};

type CustomMaterial = {
  type: MaterialType;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: MaterialType.PolylineDashSlider,
  uniforms: {
    color: Color.WHITE,
    gapColor: Color.TRANSPARENT,
    sliderColor: Color.RED,
    sliderLength: 8.0,
    dashLength: 16.0,
    dashPattern: 255.0,
    startPosition: Cartesian3.ZERO.clone(),
    speed: 1,
    reverse: false,
  },
};

Object.getOwnPropertyDescriptor(Material, "_materialCache")?.value.addMaterial(
  customMaterial.type,
  {
    fabric: {
      ...customMaterial,
      source: PolylineDashSliderFS,
    },
    translucent: function (_material: Material) {
      return true;
    },
  }
);

export default class PolylineDashSliderMaterialProperty
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
  reverse?: boolean;
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
    this.reverse = options.reverse;
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
    result.reverse = this.reverse ?? customMaterial.uniforms.reverse!;

    return result;
  }

  equals(other?: Property | undefined): boolean {
    return this === other;
  }
}
