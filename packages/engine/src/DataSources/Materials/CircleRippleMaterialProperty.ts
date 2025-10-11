/*
 * @Description: 波纹圆效果（和水波纹扩散类似，参考开源代码）
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-03 21:59:17
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:44:51
 */

import {
  Material,
  defined,
  Property,
  Event,
  Color,
  MaterialProperty,
} from "cesium";
import CircleRippleFS from "../../Shaders/CircleRippleFS";

type Options = {
  color?: Color;
  speed?: number;
  count?: number;
  gradient?: number;
};

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

Object.getOwnPropertyDescriptor(Material, "_materialCache")?.value.addMaterial(
  customMaterial.type,
  {
    fabric: {
      ...customMaterial,
      source: CircleRippleFS,
    },
    translucent: function (_material: Material) {
      return true;
    },
  }
);

export default class CircleRippleMaterialProperty implements MaterialProperty {
  color: Color | undefined;
  speed: number | undefined;
  count: number | undefined;
  gradient: number | undefined;
  #definitionChanged: Event<(...args: any[]) => void>;

  constructor(options?: Options) {
    this.#definitionChanged = new Event();
    this.color = options?.color ?? customMaterial.uniforms.color;
    this.speed = options?.speed ?? customMaterial.uniforms.speed;
    this.count = options?.count ?? customMaterial.uniforms.count;
    this.gradient = options?.gradient ?? customMaterial.uniforms.gradient;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this.#definitionChanged;
  }

  getType(time: any) {
    return customMaterial.type;
  }

  getValue(time: any, result?: any) {
    if (!defined(result)) {
      result = {};
    }

    result.color = this.color;
    result.speed = this.speed;
    result.count = this.count;
    result.gradient = this.gradient;

    return result;
  }

  equals(other?: Property | undefined): boolean {
    return this === other;
  }
}
