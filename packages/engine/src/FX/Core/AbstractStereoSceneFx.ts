/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-03 15:24:36
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-04 15:33:12
 */
/* */
import { Property, Quaternion, VelocityOrientationProperty, Matrix3, Matrix4, Cartesian3 } from "cesium";
import AbstractSceneFx from "./AbstractSceneFx";
import type { FxStereoStyleOptions, FxGraphicOptions } from "../../types";
import CoordinateUtils from "../../Core/CoordinateUtils";

/**
 * @internal
 * 抽象立体场景特效基类，仅供框架内部继承使用
 */
export default abstract class AbstractStereoSceneFx<T = unknown> extends AbstractSceneFx<
  FxStereoStyleOptions<T>
> {
  #orientation?: Quaternion | VelocityOrientationProperty | Property;

  constructor(opts: {
    id?: string;
    name?: string;
    availability?: string | Array<string>;
    show?: boolean;
    graphics: FxGraphicOptions<FxStereoStyleOptions<T>>;
  }) {
    super(opts);
    const orientation = (
      opts.graphics as FxGraphicOptions<FxStereoStyleOptions<T>>
    ).orientation;
    this.#orientation = orientation
      ? CoordinateUtils.unitQuaternionValueToQuaternion(orientation)
      : undefined;
  }

  set orientation(val: undefined | Quaternion | VelocityOrientationProperty | Property) {
    this.#orientation = val;
    if (val == undefined || val instanceof Quaternion) {
      this._updateOrientation(val);
    }
  }
  get orientation() {
    return this.#orientation;
  }

  _updateOrientation(val?: Quaternion) {
    const graphics = this._getGraphics() as FxGraphicOptions<FxStereoStyleOptions<any>>;
    const prev = graphics.orientation
      ? CoordinateUtils.unitQuaternionValueToQuaternion(graphics.orientation)
      : undefined;

    const isSame = (!prev && !val) || (prev && val && Quaternion.equals(prev, val));
    if (isSame) return;

    graphics.orientation = val
      ? CoordinateUtils.quaternionToUnitQuaternionValue(val)
      : undefined;

    // 若批量更新开关开启，则交由 setPose 统一触发一次重算
    if (!(this as any)._suppressModelMatrixUpdate) this._updateModelMatrix();
  }

  // 统一外部接口以设置四元数方向（触发矩阵重算）
  setOrientation(val?: Quaternion): void {
    this.orientation = val;
  }

  // 注意：已移除 attitude 支持；绑定后的微调统一走 anchor.rotation

  // ----- 放置策略辅助（默认不改变行为；子类可覆盖） -----
  /**
   * 返回用于规范化默认放置姿态的旋转矩阵（例如将局部前向/上轴对齐到人视觉更直观的方向）。
   * 默认返回单位矩阵，不改变 Cesium 的默认放置。子类可覆盖以提供特定 FX 的规范化旋转。
   */
  protected getPlacementRotation(): Matrix3 {
    return Matrix3.IDENTITY;
  }

  /**
   * 将 position + orientation 与放置策略旋转组合为基础的模型矩阵。
   * 子类可以调用该方法作为起点，再叠加局部偏移与样式旋转。
   */
  protected composePlacementModelMatrix(
    position?: Cartesian3,
    orientation?: Quaternion
  ): Matrix4 {
    const baseQ = orientation ?? Quaternion.IDENTITY;
    const baseR = Matrix3.fromQuaternion(baseQ);
    const rot = Matrix3.multiply(baseR, this.getPlacementRotation(), new Matrix3());
    const pos = position ?? Cartesian3.ZERO;
    return Matrix4.fromRotationTranslation(rot, pos);
  }

  /**
   * 在放置策略的基础上，应用一个局部坐标系下的平移偏移（例如沿局部 Z 轴移动半径/长度）。
   * - 先组合 orientation 与放置策略旋转得到最终旋转
   * - 再将局部偏移向量通过最终旋转变换到世界系，并叠加到位置
   */
  protected composePlacementModelMatrixWithLocalOffset(
    position?: Cartesian3,
    orientation?: Quaternion,
    localOffset?: Cartesian3
  ): Matrix4 {
    const baseQ = orientation ?? Quaternion.IDENTITY;
    const baseR = Matrix3.fromQuaternion(baseQ);
    const rot = Matrix3.multiply(baseR, this.getPlacementRotation(), new Matrix3());
    const pos = position ?? Cartesian3.ZERO;
    const offsetWorld = localOffset
      ? Matrix3.multiplyByVector(rot, localOffset, new Cartesian3())
      : Cartesian3.ZERO;
    const finalPos = Cartesian3.add(pos, offsetWorld, new Cartesian3());
    return Matrix4.fromRotationTranslation(rot, finalPos);
  }
}
