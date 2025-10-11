/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-10-29 13:45:16
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:50:27
 */

import { Property, Quaternion, VelocityOrientationProperty } from "cesium";
import {
  ConeStyleOptions,
  EllipsoidStyleOptions,
  FrustumStyleOptions,
  SpecialEffectOptions,
  SpecialEffectStereoStyleOptions,
  Attitude,
} from "../../types";
import { SpecialEffectType } from "../../enum";
import CoordinateUtils from "../../Core/CoordinateUtils";
import MathUtils from "../../Core/MathUtils";
import AbstractSpecialEffect from "./AbstractSpecialEffect";

type StereoStyleOptions =
  | ConeStyleOptions
  | EllipsoidStyleOptions
  | FrustumStyleOptions;
type Options<T = StereoStyleOptions> = SpecialEffectOptions<
  SpecialEffectStereoStyleOptions<T>
> & {
  type: SpecialEffectType;
};
export default abstract class AbstractStereoSpecialEffect<
  T = StereoStyleOptions
> extends AbstractSpecialEffect<SpecialEffectStereoStyleOptions<T>> {
  #orientation?: Quaternion | VelocityOrientationProperty | Property;

  constructor({ id, name, availability, show, graphics, type }: Options<T>) {
    super({ id, name, availability, show, graphics, type });
    this.#orientation =
      graphics.orientation &&
      CoordinateUtils.unitQuaternionValueToQuaternion(graphics.orientation);
  }

  set orientation(
    val: undefined | Quaternion | VelocityOrientationProperty | Property
  ) {
    this.#orientation = val;

    if (val == undefined || val instanceof Quaternion) {
      // this._updateOrientation(val);
    }
  }

  get orientation() {
    return this.#orientation;
  }

  _updateOrientation(val?: Quaternion) {
    const prev = CoordinateUtils.unitQuaternionValueToQuaternion(
      this._getGraphics().orientation ?? []
    );

    /// 去重
    if (!Quaternion.equals(prev, val)) {
      Object.assign(
        {
          orientation:
            val && CoordinateUtils.quaternionToUnitQuaternionValue(val),
        },
        this._getGraphics()
      );

      this._updateModelMatrix();
    }
  }

  set attitude(val: Attitude) {
    Object.assign(val, this._getGraphics().attitude);

    this._updateModelMatrix();
  }
}
