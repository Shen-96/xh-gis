/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-02-16 17:02:52
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:45:02
 */
import {
  MaterialProperty,
  Event,
  JulianDate,
  defined,
  Property,
  Material,
} from "cesium";
import FlowPointFS from "../../Shaders/PolylineDashSliderFS";

type Options = {
  background: string;
  point: string;
  speed?: number;
};

type CustomMaterial = {
  type: string;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: "ConvectionPoint",
  uniforms: {
    point: "",
    background: "",
    speed: 1,
  },
};

Object.getOwnPropertyDescriptor(Material, "_materialCache")?.value.addMaterial(
  customMaterial.type,
  {
    fabric: {
      ...customMaterial,
      source: FlowPointFS,
    },
    translucent: function (_material: Material) {
      return true;
    },
  }
);

export default class ConvectionPointMaterialProperty
  implements MaterialProperty
{
  point: string;
  background: string;
  speed: number;
  #definitionChanged: Event<(...args: any[]) => void>;

  constructor(options: Options) {
    this.#definitionChanged = new Event();
    this.point = options.point;
    this.background = options.background;
    this.speed = options?.speed ?? customMaterial.uniforms.speed!;
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

    this.point && (result.point = this.point);

    this.background && (result.background = this.background);

    this.speed >= 0 && (result.speed = this.speed);

    return result;
  }

  equals(other?: Property | undefined): boolean {
    return this === other;
  }
}
