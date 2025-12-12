/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-11-01 17:04:27
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-12 10:21:52
 */

import { Cartesian3, Matrix3, Matrix4, Quaternion, defined } from "cesium";
import {
  EllipsoidStyleOptions,
  FxOptions,
  XgEllipsoidFxStyleOptions,
  FxGraphicOptions,
} from "../../types";
import CoordinateUtils from "../../Core/CoordinateUtils";
import createEllipsoidPrimitive from "../../Rendering/Primitives/createEllipsoidPrimitive";
import createEllipsoidOutlinePrimitive from "../../Rendering/Primitives/createEllipsoidOutlinePrimitive";
import AbstractStereoSceneFx from "../Core/AbstractStereoSceneFx";

export default class XgEllipsoidFX extends AbstractStereoSceneFx<EllipsoidStyleOptions> {
  constructor({
    id,
    name,
    availability,
    show,
    graphics,
  }: FxOptions<XgEllipsoidFxStyleOptions>) {
    super({
      id,
      name,
      availability,
      show,
      graphics,
    });
    this.init();
  }

  protected init() {
    const gfx =
        this._getGraphics() as FxGraphicOptions<XgEllipsoidFxStyleOptions>,
      { radii, material } = gfx,
      fill = material?.fill ?? true,
      outline = material?.outline ?? true;

    if (!defined(radii))
      throw new Error(
        `create special effect failed , invaild style : ${JSON.stringify(
          this.graphics
        )}`
      );

    const modelMatrix = this.computeModelMatrix(),
      fillPrimitive = createEllipsoidPrimitive(
        this.geometryInstanceIdType["3d-fill"],
        gfx,
        modelMatrix
      ),
      outlinePrimitive = createEllipsoidOutlinePrimitive(
        this.geometryInstanceIdType["3d-outline"],
        gfx,
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
    const gfx =
        this._getGraphics() as FxGraphicOptions<XgEllipsoidFxStyleOptions>,
      { position, orientation } = gfx,
      /// 初始坐标
      originPos = position
        ? CoordinateUtils.positionOptionsToCar3(position)
        : undefined;

    if (!position || !originPos)
      throw new Error(`create ellipsoid effect failed: invalid position`);

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
      // 注：移除 attitude 的附加旋转，局部样式旋转请改由绑定侧 anchor/sweep 控制
      addRotation = Matrix3.IDENTITY,
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
