/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-10-29 11:56:21
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:49:08
 */

import {
  Cartesian3,
  Matrix4,
  PositionProperty,
  Primitive,
  PrimitiveCollection,
  TimeIntervalCollection,
  createGuid,
} from "cesium";
import {
  CoordinateUtils,
  MathUtils,
  SpecialEffectGraphicOptions,
  SpecialEffectOptions,
  SpecialEffectType,
  XgFxStyleOptions,
} from "../..";

type Options<T = XgFxStyleOptions> = SpecialEffectOptions<T> & {
  type: SpecialEffectType;
};
export default abstract class AbstractSpecialEffect<T = XgFxStyleOptions> {
  readonly #id: string;
  readonly #type: SpecialEffectType;
  #name?: string;
  #availability?: TimeIntervalCollection;
  readonly #graphics: SpecialEffectGraphicOptions<T>;
  #position?: Cartesian3 | PositionProperty;
  readonly #primitives: PrimitiveCollection;
  #show: boolean;
  #geometryInstanceIdType: {
    "2d": "2d";
    "3d-fill": "3d-fill";
    "3d-outline": "3d-outline";
  };

  constructor({ id, type, name, availability, show, graphics }: Options<T>) {
    this.#id = id ?? createGuid();
    this.#type = type;
    this.#name = name;
    this.#availability = this.initAvailability(availability);
    this.#graphics = graphics;
    this.#position = CoordinateUtils.positionOptionsToCar3(
      graphics.position ?? {}
    );
    this.#primitives = new PrimitiveCollection({ show });
    this.#show = show ?? true;
    this.#geometryInstanceIdType = {
      "2d": "2d",
      "3d-fill": "3d-fill",
      "3d-outline": "3d-outline",
    };
  }

  get id() {
    return this.#id;
  }

  get type() {
    return this.#type;
  }

  set name(val: string | undefined) {
    this.#name = val;
  }

  get name() {
    return this.#name;
  }

  set availability(val: undefined | TimeIntervalCollection) {
    this.#availability = val;
  }

  get availability() {
    return this.#availability;
  }

  _getGraphics() {
    return this.#graphics;
  }

  get graphics() {
    return { ...this.#graphics };
  }

  set position(val: undefined | Cartesian3 | PositionProperty) {
    this.#position = val;

    if (val == undefined || val instanceof Cartesian3) {
      // this._updatePosition(val);
    }
  }

  get position() {
    return this.#position;
  }

  _updatePosition(val?: Cartesian3): void {
    const prevPos = CoordinateUtils.positionOptionsToCar3(
      this._getGraphics().position ?? {}
    );

    /// 去重
    if (!Cartesian3.equals(prevPos, val)) {
      this._getGraphics().position = val && {
        cartesian: CoordinateUtils.car3ToCartesian3Value(val),
      };

      this._updateModelMatrix();
    }
  }

  _getPrimitives() {
    return this.#primitives;
  }

  set show(val: boolean) {
    this.#show = val;
  }

  get show() {
    return this.#show;
  }

  protected get geometryInstanceIdType() {
    return this.#geometryInstanceIdType;
  }

  protected abstract init(): void;

  abstract computeModelMatrix(): Matrix4;

  _updateModelMatrix(): void {
    const length = this.#primitives.length,
      modelMatrix = this.computeModelMatrix();

    for (let index = 0; index < length; index++) {
      const primitive: Primitive | undefined = this.#primitives.get(index);

      if (primitive) {
        primitive.modelMatrix = modelMatrix;
      }
    }
  }

  protected initAvailability(val?: string | Array<string>) {
    return Array.isArray(val)
      ? TimeIntervalCollection.fromIso8601DateArray({ iso8601Dates: val })
      : typeof val == "string"
      ? TimeIntervalCollection.fromIso8601({ iso8601: val })
      : undefined;
  }
}
