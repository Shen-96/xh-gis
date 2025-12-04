/* */

import {
  Cartesian3,
  Matrix4,
  PositionProperty,
  Primitive,
  PrimitiveCollection,
  TimeIntervalCollection,
  createGuid,
  Quaternion,
} from "cesium";
import CoordinateUtils from "../../Core/CoordinateUtils";
import AbstractFx from "./AbstractFx";
import type { PositionOptions, SpecialEffectGraphicOptions } from "../../types";

// A minimal scene-centric options expected for FX implementations.
// Note: legacy SceneFxGraphicOptions is replaced by flattened SpecialEffectGraphicOptions

export default abstract class AbstractSceneFx<T = unknown> extends AbstractFx {
  #name?: string;
  #availability?: TimeIntervalCollection;
  readonly #graphics: SpecialEffectGraphicOptions<T>;
  #position?: Cartesian3 | PositionProperty;
  readonly #primitives: PrimitiveCollection;
  #geometryInstanceIdType: {
    "2d": "2d";
    "3d-fill": "3d-fill";
    "3d-outline": "3d-outline";
  };

  // 批量位姿更新开关：开启时位置/姿态更新不触发矩阵重算，结束后统一重算一次
  protected _suppressModelMatrixUpdate = false;

  constructor({
    id,
    name,
    availability,
    show,
    graphics,
  }: {
    id?: string;
    name?: string;
    availability?: string | Array<string> | TimeIntervalCollection;
    show?: boolean;
    graphics: SpecialEffectGraphicOptions<T>;
  }) {
    super(id ?? createGuid(), show ?? true);
    this.#name = name;
    this.#availability = this.initAvailability(availability);
    this.#graphics = graphics;
    this.#position = graphics.position
      ? CoordinateUtils.positionOptionsToCar3(graphics.position)
      : undefined;
    this.#primitives = new PrimitiveCollection({ show: show ?? true });
    this.#geometryInstanceIdType = {
      "2d": "2d",
      "3d-fill": "3d-fill",
      "3d-outline": "3d-outline",
    };
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
  }
  get position() {
    return this.#position;
  }

  // 提供统一入口以设置位置并触发矩阵重算；等价于 _updatePosition
  setPosition(val?: Cartesian3): void {
    this._updatePosition(val);
  }

  _updatePosition(val?: Cartesian3): void {
    const posOptions = this._getGraphics().position;
    const prevPos = posOptions
      ? CoordinateUtils.positionOptionsToCar3(posOptions)
      : undefined;
    if (!prevPos || !val) {
      if (val)
        this._getGraphics().position = {
          cartesian: CoordinateUtils.car3ToCartesian3Value(val),
        };
      if (!this._suppressModelMatrixUpdate) this._updateModelMatrix();
      return;
    }
    if (!Cartesian3.equals(prevPos, val)) {
      this._getGraphics().position = val && {
        cartesian: CoordinateUtils.car3ToCartesian3Value(val),
      };
      if (!this._suppressModelMatrixUpdate) this._updateModelMatrix();
    }
  }

  _getPrimitives() {
    return this.#primitives;
  }

  // 对外只读访问集合（避免误改集合本身），仍可通过集合 API 操作内容
  getPrimitives(): PrimitiveCollection {
    return this.#primitives;
  }

  setVisible(show: boolean): void {
    super.setVisible(show);
    this.#primitives.show = show;
  }

  onAttach(): void {}
  onDetach(): void {}

  dispose(): void {
    if (this.disposed) return;
    try {
      const length = this.#primitives.length;
      for (let i = length - 1; i >= 0; i--) this.#primitives.remove(this.#primitives.get(i));
    } catch {}
    super.dispose();
  }

  protected get geometryInstanceIdType() {
    return this.#geometryInstanceIdType;
  }

  protected abstract init(): void;
  abstract computeModelMatrix(): Matrix4;

  // 批量位姿更新：一次性设置位置与姿态并仅重算一次模型矩阵
  setPose(position?: Cartesian3, orientation?: Quaternion): void {
    this._suppressModelMatrixUpdate = true;
    try {
      this._updatePosition(position);
      this._updateOrientation(orientation);
    } finally {
      this._suppressModelMatrixUpdate = false;
    }
    this._updateModelMatrix();
  }

  _updateModelMatrix(): void {
    const length = this.#primitives.length;
    if (length === 0) return; // 无图元时早退，避免不必要计算
    const modelMatrix = this.computeModelMatrix();
    for (let index = 0; index < length; index++) {
      const primitive: Primitive | undefined = this.#primitives.get(index);
      if (primitive) primitive.modelMatrix = modelMatrix;
    }
  }

  protected initAvailability(val?: string | Array<string> | TimeIntervalCollection) {
    if (val instanceof TimeIntervalCollection) return val;
    return Array.isArray(val)
      ? TimeIntervalCollection.fromIso8601DateArray({ iso8601Dates: val })
      : typeof val == "string"
      ? TimeIntervalCollection.fromIso8601({ iso8601: val })
      : undefined;
  }
}