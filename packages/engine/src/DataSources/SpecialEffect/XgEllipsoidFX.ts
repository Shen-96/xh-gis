/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-11-01 17:04:27
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-25 09:04:32
 */

import {
  Cartesian3,
  Math as CesiumMath,
  Matrix3,
  Matrix4,
  Quaternion,
  defined,
} from "cesium";
import {
  EllipsoidStyleOptions,
  SpecialEffectOptions,
  XgEllipsoidFxStyleOptions,
} from "../../types";
import { SpecialEffectType } from "../../enum";
import CoordinateUtils from "../../Core/CoordinateUtils";
import MathUtils from "../../Core/MathUtils";
import createEllipsoidPrimitive from "../../Workers/createEllipsoidPrimitive";
import createEllipsoidOutlinePrimitive from "../../Workers/createEllipsoidOutlinePrimitive";
import AbstractStereoSpecialEffect from "./AbstractStereoSpecialEffect";

export default class XgEllipsoidFX extends AbstractStereoSpecialEffect<EllipsoidStyleOptions> {
  constructor({
    id,
    name,
    availability,
    show,
    graphics,
  }: SpecialEffectOptions<XgEllipsoidFxStyleOptions>) {
    super({
      id,
      name,
      availability,
      show,
      graphics,
      type: SpecialEffectType.ELLIPSOID,
    });
    this.init();
  }

  protected init() {
    const { radii, material } = this.graphics,
      fill = true,
      outline = true;

    if (!defined(radii))
      throw new Error(
        `create special effect failed , invaild style : ${JSON.stringify(
          this.graphics
        )}`
      );

    const modelMatrix = this.computeModelMatrix(),
      fillPrimitive = createEllipsoidPrimitive(
        this.geometryInstanceIdType["3d-fill"],
        this.graphics,
        modelMatrix
      ),
      outlinePrimitive = createEllipsoidOutlinePrimitive(
        this.geometryInstanceIdType["3d-outline"],
        this.graphics,
        modelMatrix
      );

    /// 三维填充图元
    if (fillPrimitive) {
      fillPrimitive.show = fill;
      this._getPrimitives().add(fillPrimitive);
    }
    /// 三维外框线图元
    if (outlinePrimitive) {
      outlinePrimitive.show = outline;
      this._getPrimitives().add(outlinePrimitive);
    }
  }

  computeModelMatrix(): Matrix4 {
    const { position, orientation, attitude } = this.graphics,
      { azimuth, elevation, roll } = attitude ?? {},
      /// 初始坐标
      originPos = position
        ? CoordinateUtils.positionOptionsToCar3(position)
        : Cartesian3.ZERO;

    if (!originPos) throw `无有效坐标，${this.graphics}`;

    /// 初始旋转量
    const originRotation = Matrix3.fromQuaternion(
        CoordinateUtils.unitQuaternionValueToQuaternion(orientation ?? []) ??
          Quaternion.IDENTITY,
        new Matrix3()
      ),
      originModelMx = Matrix4.fromRotationTranslation(
        originRotation,
        originPos
      ),
      /// 向局部z轴正向平移
      zDirection = Cartesian3.UNIT_Z,
      /// 平移距离
      distance = 0,
      /// 平移向量
      transVector = Cartesian3.multiplyByScalar(
        zDirection,
        distance,
        new Cartesian3()
      ),
      /// 旋转到x轴上的矩阵，用于计算平移量
      localTransRotation = Matrix3.multiply(
        originRotation,
        Matrix3.IDENTITY,
        new Matrix3()
      ),
      /// 局部平移量
      local2WorldTranslation = Matrix3.multiplyByVector(
        localTransRotation,
        transVector,
        new Cartesian3()
      ),
      /// 平移后坐标
      normPos = Cartesian3.add(
        originPos,
        local2WorldTranslation,
        new Cartesian3()
      ),
      /// 归化后的模型矩阵
      normalizeModelMx = Matrix4.fromRotationTranslation(
        originRotation,
        normPos
      ),
      /// 获取相对模型矩阵
      inverseOriginModelMx = Matrix4.inverseTransformation(
        originModelMx,
        new Matrix4()
      ),
      referenceModelMx = Matrix4.multiply(
        inverseOriginModelMx,
        normalizeModelMx,
        new Matrix4()
      ),
      /// 计算旋转量
      addZRotation = Matrix3.fromRotationZ(CesiumMath.toRadians(azimuth ?? 0)),
      addYRotation = Matrix3.fromRotationY(
        CesiumMath.toRadians(-(elevation ?? 0))
      ),
      addXRotation = Matrix3.fromRotationX(CesiumMath.toRadians(roll ?? 0)),
      addRotation = Matrix3.multiply(
        addZRotation,
        Matrix3.multiply(addXRotation, addYRotation, new Matrix3()),
        new Matrix3()
      ),
      /// 世界变换
      transformMx = Matrix4.multiplyByMatrix3(
        originModelMx,
        addRotation,
        new Matrix4()
      ),
      /// 模型矩阵
      modelMatrix = Matrix4.multiply(
        transformMx,
        referenceModelMx,
        new Matrix4()
      );

    return modelMatrix;
  }
}
