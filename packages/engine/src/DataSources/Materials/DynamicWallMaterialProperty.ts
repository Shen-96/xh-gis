/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-02-16 17:02:52
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:45:11
 */
import {
  MaterialProperty,
  Event,
  Color,
  JulianDate,
  defined,
  Property,
  Material,
} from "cesium";
import DynamicWallFS from "../../Shaders/DynamicWallFS";
import { getResourceUrl } from "../../Core/ResourceConfig";

type Options = {
  color?: Color;
  speed?: number;
};

type CustomMaterial = {
  type: string;
  uniforms: Options & {
    image: string;
  };
};

const customMaterial: CustomMaterial = {
  type: "DynamicWall",
  uniforms: {
    color: new Color(1, 1, 1, 1),
    image: getResourceUrl("Textures/wall.png"),
    speed: 1,
  },
};

Object.getOwnPropertyDescriptor(Material, "_materialCache")?.value.addMaterial(
  customMaterial.type,
  {
    fabric: {
      ...customMaterial,
      source: DynamicWallFS,
    },
    translucent: function (_material: any) {
      return true;
    },
  }
);

export default class DynamicWallMaterialProperty implements MaterialProperty {
  color: Color;
  speed: number;
  #definitionChanged: Event<(...args: any[]) => void>;

  constructor(options?: Options) {
    this.#definitionChanged = new Event();
    this.color = options?.color ?? customMaterial.uniforms.color!;
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

    this.color && (result.color = this.color);

    this.speed >= 0 && (result.speed = this.speed);

    return result;
  }

  equals(other?: Property | undefined): boolean {
    return this === other;
  }
}
