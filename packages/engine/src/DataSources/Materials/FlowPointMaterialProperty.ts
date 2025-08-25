/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-02-16 17:02:52
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:46:20
 */
import {
  MaterialProperty,
  Event,
  JulianDate,
  defined,
  Property,
  Material,
} from "cesium";
import FlowPointFS from "../../Shaders/FlowPointFS";
import { MaterialType } from "../../index";

type Options = {
  background: string;
  point: string;
  speed?: number;
  reverse?: boolean;
};

type CustomMaterial = {
  type: MaterialType;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: MaterialType.FlowPoint,
  uniforms: {
    point: "",
    background: "",
    speed: 1,
    reverse: false,
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

export default class FlowPointMaterialProperty implements MaterialProperty {
  point: string;
  background: string;
  speed: number;
  reverse: boolean;
  #definitionChanged: Event<(...args: any[]) => void>;

  constructor(options: Options) {
    this.#definitionChanged = new Event();
    this.point = options.point;
    this.background = options.background;
    this.speed = options?.speed ?? customMaterial.uniforms.speed!;
    this.reverse = options.reverse ?? false;
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

    result.reverse = this.reverse;

    return result;
  }

  equals(other?: Property | undefined): boolean {
    return this === other;
  }
}
