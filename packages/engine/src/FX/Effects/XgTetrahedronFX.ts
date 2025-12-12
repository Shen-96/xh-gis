/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-09 10:08:50
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 14:18:42
 * @WeChat: yingnan55
 * @Version: 1.0.0
 */
import { Matrix4, Quaternion } from "cesium";
import AbstractStereoSceneFx from "../Core/AbstractStereoSceneFx";
import createTetrahedronPrimitive from "../../Rendering/Primitives/createTetrahedronPrimitive";
import createTetrahedronOutlinePrimitive from "../../Rendering/Primitives/createTetrahedronOutlinePrimitive";
import CoordinateUtils from "../../Core/CoordinateUtils";
import {
  FxGraphicOptions,
  FxOptions,
  TetrahedronStyleOptions,
  XgTetrahedronFxGraphicOptions,
  XgTetrahedronFxStyleOptions,
} from "../../types";

// 使用内置 MaterialAppearance，避免异步几何与自定义 VS 管线带来的不兼容

export default class XgTetrahedronFX extends AbstractStereoSceneFx<TetrahedronStyleOptions> {
  constructor(opts: FxOptions<XgTetrahedronFxStyleOptions>) {
    super(opts);
    this.init();
  }

  protected init(): void {
    const gfx =
      this._getGraphics() as FxGraphicOptions<XgTetrahedronFxStyleOptions>;
    const edgeLength = Math.max(1e-6, gfx.edgeLength ?? 100);
    const outlineShow = gfx.material?.outline ?? true;

    const modelMatrix = this.computeModelMatrix();
    const solidPrimitive = createTetrahedronPrimitive(
      this.geometryInstanceIdType["3d-fill"],
      gfx,
      modelMatrix
    );
    solidPrimitive && this._getPrimitives().add(solidPrimitive);

    if (outlineShow) {
      const outlinePrimitive = createTetrahedronOutlinePrimitive(
        this.geometryInstanceIdType["3d-outline"],
        gfx,
        modelMatrix
      );
      outlinePrimitive && this._getPrimitives().add(outlinePrimitive);
    }
  }

  computeModelMatrix(): Matrix4 {
    const gfx =
      this._getGraphics() as FxGraphicOptions<XgTetrahedronFxGraphicOptions>;
    const originPos = gfx.position
      ? CoordinateUtils.positionOptionsToCar3(gfx.position)
      : undefined;
    if (!originPos) throw new Error("XgTetrahedronFX: invalid position");
    const q = gfx.orientation
      ? CoordinateUtils.unitQuaternionValueToQuaternion(gfx.orientation) ??
        Quaternion.IDENTITY
      : Quaternion.IDENTITY;
    return this.composePlacementModelMatrix(originPos, q);
  }
}
