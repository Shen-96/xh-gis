/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 18:56:22
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-08 10:23:57
 */
import { Event, JulianDate, defined, Property, MaterialProperty } from "cesium";

export default class BaseMaterialProperty<T extends object> implements MaterialProperty {
  protected readonly type: string;
  protected uniforms: Partial<T>;
  protected defaults: Partial<T>;
  #definitionChanged: Event<(...args: any[]) => void>;

  constructor(type: string, uniforms?: Partial<T>, defaults?: Partial<T>) {
    this.type = type;
    this.uniforms = uniforms ?? {};
    this.defaults = defaults ?? {};
    this.#definitionChanged = new Event();
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this.#definitionChanged;
  }

  getType(_time: JulianDate): string {
    return this.type;
  }

  getValue(_time: JulianDate, result?: any) {
    if (!defined(result)) {
      result = {};
    }
    const u: any = { ...this.defaults, ...this.uniforms };
    for (const k of Object.keys(u)) {
      result[k] = u[k];
    }
    return result;
  }

  equals(other?: Property | undefined): boolean {
    return this === other;
  }
}
