/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-10-29 13:45:16
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-04 16:10:00
 */

import { Cartesian3, Matrix3, Matrix4, Quaternion } from "cesium";
import {
  ConeStyleOptions,
  FxOptions,
  XgConeFxStyleOptions,
  FxGraphicOptions,
} from "../../types";
import CoordinateUtils from "../../Core/CoordinateUtils";
import MathUtils from "../../Core/MathUtils";
import createCylinderOutlinePrimitive from "../../Workers/createCylinderOutlinePrimitive";
import createCylinderPrimitive from "../../Workers/createCylinderPrimitive";
import AbstractStereoSceneFx from "../Core/AbstractStereoSceneFx";

export default class XgConeFX extends AbstractStereoSceneFx<ConeStyleOptions> {
  // 将局部坐标系规范化为更贴近人视觉的默认姿态：先绕 X 旋转 45°，再绕 Y 旋转 90°
  protected getPlacementRotation(): Matrix3 {
    const y = Matrix3.fromRotationY(Math.PI / 2);
    const x = Matrix3.fromRotationX(Math.PI / 4);
    return Matrix3.multiply(x, y, new Matrix3());
  }

  constructor({
    id,
    name,
    availability,
    show,
    graphics,
  }: FxOptions<XgConeFxStyleOptions>) {
    super({ id, name, availability, show, graphics });
    this.init();
  }

  protected init() {
    const gfx = this._getGraphics() as FxGraphicOptions<XgConeFxStyleOptions>;
    const { length, bottomRadius, material } = gfx;
    const fill = material?.fill ?? true;
    const outline = material?.outline ?? true;

    if (!(MathUtils.isPositiveNumber(length) && MathUtils.isPositiveNumber(bottomRadius))) {
      throw new Error(
        `create special effect failed , invaild style : ${JSON.stringify(this.graphics)}`
      );
    }

    const modelMatrix = this.computeModelMatrix();
    const coneFillPrimitive = createCylinderPrimitive(
      this.geometryInstanceIdType["3d-fill"],
      { ...gfx, topRadius: bottomRadius, bottomRadius: 0 },
      modelMatrix
    );
    const coneOutlinePrimitive = createCylinderOutlinePrimitive(
      this.geometryInstanceIdType["3d-outline"],
      { ...gfx, topRadius: bottomRadius, bottomRadius: 0 },
      modelMatrix
    );

    if (coneFillPrimitive) {
      coneFillPrimitive.show = fill;
      this._getPrimitives().add(coneFillPrimitive);
    }
    if (coneOutlinePrimitive) {
      coneOutlinePrimitive.show = outline;
      this._getPrimitives().add(coneOutlinePrimitive);
    }
  }

  computeModelMatrix(): Matrix4 {
    const gfx = this._getGraphics() as FxGraphicOptions<XgConeFxStyleOptions>;
    const { length, position, orientation } = gfx;
    const originPos = position ? CoordinateUtils.positionOptionsToCar3(position) : undefined;

    if (!position || !originPos)
      throw new Error(`create cone effect failed: invalid position`);

    // 锥体尖端置于原点：沿局部 +Z 方向平移 length/2
    const localOffset = Cartesian3.multiplyByScalar(Cartesian3.UNIT_Z, length / 2, new Cartesian3());

    return this.composePlacementModelMatrixWithLocalOffset(
      originPos,
      CoordinateUtils.unitQuaternionValueToQuaternion(orientation ?? []) ?? Quaternion.IDENTITY,
      localOffset
    );
  }
}