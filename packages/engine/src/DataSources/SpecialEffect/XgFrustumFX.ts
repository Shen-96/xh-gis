/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-11-03 09:37:27
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-25 09:04:35
 */

import {
  Cartesian3,
  Math as CesiumMath,
  Matrix3,
  Matrix4,
  Quaternion,
} from "cesium";
import {
  FrustumStyleOptions,
  SpecialEffectOptions,
  XgFrustumFxStyleOptions,
} from "../../types";
import { SpecialEffectType } from "../../enum";
import CoordinateUtils from "../../Core/CoordinateUtils";
import MathUtils from "../../Core/MathUtils";
import createFrustumOutlinePrimitive from "../../Workers/createFrustumOutlinePrimitive";
import createFrustumPrimitive from "../../Workers/createFrustumPrimitive";
import AbstractStereoSpecialEffect from "./AbstractStereoSpecialEffect";

export default class XgFrustumFX extends AbstractStereoSpecialEffect<FrustumStyleOptions> {
  constructor({
    id,
    name,
    availability,
    show,
    graphics,
  }: SpecialEffectOptions<XgFrustumFxStyleOptions>) {
    super({
      id,
      name,
      availability,
      show,
      graphics,
      type: SpecialEffectType.FRUSTUM,
    });
    this.init();
  }

  protected init() {
    const { material } = this.graphics,
      fill = true,
      outline = true;

    const modelMatrix = this.computeModelMatrix(),
      fillPrimitive = createFrustumPrimitive(
        this.geometryInstanceIdType["3d-fill"],
        this.graphics,
        modelMatrix.clone()
      ),
      outlinePrimitive = createFrustumOutlinePrimitive(
        this.geometryInstanceIdType["3d-outline"],
        this.graphics,
        modelMatrix.clone()
      );

    /// 二维投影的图元
    // sectorPrimitive.show = projection;
    // specialEffect._specialEffect.add(sectorPrimitive);
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
    const { near, position, orientation, attitude } = this.graphics,
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
      /// 归化旋转
      // normRotationMx = Matrix4.fromRotation(Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(CesiumMath.toRadians(45), CesiumMath.toRadians(90)))),
      // zRotation = Matrix3.fromRotationZ(CesiumMath.toRadians(45)),
      yRotation = Matrix3.fromRotationY(CesiumMath.toRadians(90)),
      xRotation = Matrix3.fromRotationX(CesiumMath.toRadians(90)),
      // normRotation = Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(CesiumMath.toRadians(45), CesiumMath.toRadians(-90))),
      normRotation = Matrix3.multiply(xRotation, yRotation, new Matrix3()),
      norm2LocalRotation = Matrix3.multiply(
        originRotation,
        normRotation,
        new Matrix3()
      ),
      /// 向局部z轴负向平移
      zDirection = Cartesian3.negate(Cartesian3.UNIT_Z, new Cartesian3()),
      /// 平移距离
      distance = near ?? 1,
      /// 平移向量
      transVector = Cartesian3.multiplyByScalar(
        zDirection,
        distance,
        new Cartesian3()
      ),
      /// 旋转到x轴上的矩阵，用于计算平移量
      localTransRotation = Matrix3.multiply(
        originRotation,
        yRotation,
        new Matrix3()
      ),
      /// 局部平移量
      local2WorldTranslation = Matrix3.multiplyByVector(
        localTransRotation,
        transVector,
        new Cartesian3()
      ),
      /// 平移矩阵
      // translationMx = Matrix4.fromTranslation(local2WorldTranslation),
      /// 平移后坐标
      normPos = Cartesian3.add(
        originPos,
        local2WorldTranslation,
        new Cartesian3()
      ),
      /// 归化后的模型矩阵
      normalizeModelMx = Matrix4.fromRotationTranslation(
        norm2LocalRotation,
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
      // localRotation = Matrix3.multiply()
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
      /// 将旋转量作用到局部坐标系上
      // localRotation = Matrix4.getRotation(referenceModelMx, new Matrix3()),
      // newLocalRotation = Matrix3.multiply(localRotation, addRotation, new Matrix3()),
      /// 最终旋转量
      // endRotation = Matrix3.multiply(originRotation, Matrix3.fromHeadingPitchRoll(addHpr), new Matrix3()),
      // endRotation = Matrix3.multiply(norm2LocalRotation, addRotation, new Matrix3()),
      // endRotation = Matrix3.multiply(originRotation, normRotation, new Matrix3()),
      // endRotation = originRotation,
      // /// 初始旋转矩阵
      // originRotationMx = Matrix4.fromRotation(
      //     Matrix3.fromQuaternion(orientation ?? Quaternion.IDENTITY),
      //     new Matrix4()
      // ),
      /// 局部到世界坐标下平移量
      // local2WorldTranslation = Matrix4.multiplyByPointAsVector(Matrix4.fromRotation(rotation, new Matrix4()), transVector, new Cartesian3()),
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
    // modelMatrix = Matrix4.multiplyByMatrix3(referenceModelMx, addRotation, new Matrix4());
    // modelMatrix = normalizeModelMx;

    /// debug-坐标轴
    // debug ? (debug.modelMatrix = modelMatrix) : (debug = window.xgIntegrated?.earth?.scene.primitives.add(
    //     new DebugModelMatrixPrimitive({
    //         modelMatrix: modelMatrix,
    //         length: 30000.0,
    //         width: 3.0,
    //     })
    // ));

    return modelMatrix;
  }
}
