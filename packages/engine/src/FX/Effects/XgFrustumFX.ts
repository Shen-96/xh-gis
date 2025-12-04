/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-11-03 09:37:27
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-04 16:33:35
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
  FxOptions,
  XgFrustumFxStyleOptions,
  FxGraphicOptions,
} from "../../types";
import CoordinateUtils from "../../Core/CoordinateUtils";
import MathUtils from "../../Core/MathUtils";
import createFrustumOutlinePrimitive from "../../Workers/createFrustumOutlinePrimitive";
import createFrustumPrimitive from "../../Workers/createFrustumPrimitive";
import AbstractStereoSceneFx from "../Core/AbstractStereoSceneFx";

export default class XgFrustumFX extends AbstractStereoSceneFx<FrustumStyleOptions> {
  // 将局部坐标系规范化：使底面朝向目标运动方向，顶点位于原点
  protected getPlacementRotation(): Matrix3 {
    const y = Matrix3.fromRotationY(CesiumMath.toRadians(90));
    const x = Matrix3.fromRotationX(CesiumMath.toRadians(90));
    return Matrix3.multiply(x, y, new Matrix3());
  }
  constructor({
    id,
    name,
    availability,
    show,
    graphics,
  }: FxOptions<XgFrustumFxStyleOptions>) {
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
        this._getGraphics() as FxGraphicOptions<XgFrustumFxStyleOptions>,
      { material } = gfx,
      fill = material?.fill ?? true,
      outline = material?.outline ?? true;

    const modelMatrix = this.computeModelMatrix();
    const fillPrimitive = createFrustumPrimitive(
      this.geometryInstanceIdType["3d-fill"],
      gfx,
      modelMatrix
    );
    const outlinePrimitive = createFrustumOutlinePrimitive(
      this.geometryInstanceIdType["3d-outline"],
      gfx,
      modelMatrix
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
    const gfx =
      this._getGraphics() as FxGraphicOptions<XgFrustumFxStyleOptions>;
    const { near, position, orientation } = gfx;
    const originPos = position
      ? CoordinateUtils.positionOptionsToCar3(position)
      : undefined;

    if (!position || !originPos)
      throw new Error(`create frustum effect failed: invalid position`);

    // 顶点置于原点：沿局部 -Z 方向平移 near 距离
    const localOffset = Cartesian3.multiplyByScalar(
      Cartesian3.negate(Cartesian3.UNIT_Z, new Cartesian3()),
      near ?? 1,
      new Cartesian3()
    );

    return this.composePlacementModelMatrixWithLocalOffset(
      originPos,
      CoordinateUtils.unitQuaternionValueToQuaternion(orientation ?? []) ??
        Quaternion.IDENTITY,
      localOffset
    );
  }
}
