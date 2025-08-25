/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-02-16 17:02:52
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:46:13
 */
import {
  MaterialProperty,
  Event,
  JulianDate,
  defined,
  Property,
  Material,
  Cartesian2,
} from "cesium";
import FlowLineFS from "../../Shaders/FlowLineFS";
import { MaterialType } from "../../index";

type Options = {
  image: string;
  speed?: number;
  repeat?: Cartesian2;
};

type CustomMaterial = {
  type: MaterialType;
  uniforms: Options;
};

const customMaterial: CustomMaterial = {
  type: MaterialType.FlowLine,
  uniforms: {
    image: "",
    speed: 1,
    repeat: new Cartesian2(1, 1),
  },
};

Object.getOwnPropertyDescriptor(Material, "_materialCache")?.value.addMaterial(
  customMaterial.type,
  {
    fabric: {
      ...customMaterial,
      source: FlowLineFS,
    },
    translucent: function (_material: Material) {
      return true;
    },
  }
);

export default class FlowLineMaterialProperty implements MaterialProperty {
  image: string;
  speed: number;
  repeat: Cartesian2;
  #definitionChanged: Event<(...args: any[]) => void>;

  constructor(options: Options) {
    this.#definitionChanged = new Event();
    this.image = options.image;
    this.speed = options?.speed ?? customMaterial.uniforms.speed!;
    this.repeat = options.repeat ?? customMaterial.uniforms.repeat!;
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

    this.image && (result.image = this.image);

    this.speed >= 0 && (result.speed = this.speed);

    result.repeat = this.repeat;

    return result;
  }

  equals(other?: Property | undefined): boolean {
    return this === other;
  }
}
