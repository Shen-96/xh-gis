/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-03-25 09:10:37
 */
import {
  Primitive,
  Matrix4,
  GeometryInstance,
  Cartesian3,
  EllipsoidGeometry,
  PerInstanceColorAppearance,
  Math as CesiumMath,
  PerspectiveFrustum,
  Quaternion,
  FrustumOutlineGeometry,
  Color,
  ColorGeometryInstanceAttribute,
  createGuid,
} from "cesium";
import type { FrustumGraphicOptions } from "../../types";

function createFrustumOutlinePrimitive(
  id = createGuid(),
  style: FrustumGraphicOptions,
  modelMatrix = Matrix4.IDENTITY,
  // attitude?: Attitude,
  // translation?: Cartesian3
  maximumAliasedLineWidth = 1
) {
  /// 初始参数
  const { material } = style;
  // { outlineColor } = material ?? {};

  const frustum = new PerspectiveFrustum({
      fov: CesiumMath.toRadians(60.0),
      aspectRatio: 16 / 9,
      ...style,
    }),
    geometry = new FrustumOutlineGeometry({
      frustum: frustum,
      origin: Cartesian3.ZERO,
      orientation: Quaternion.IDENTITY,
    }),
    instance = new GeometryInstance({
      id,
      geometry: geometry,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(
          Color.fromCssColorString(style.material?.outlineColor ?? "#ffff")
        ),
      },
    });

  if (!instance) return undefined;

  const primitive = new Primitive({
    geometryInstances: instance,
    appearance: new PerInstanceColorAppearance({
      flat: true,
      renderState: {
        lineWidth: Math.min(
          maximumAliasedLineWidth,
          style.material?.outlineWidth ?? maximumAliasedLineWidth
        ),
      },
    }),
    modelMatrix,
    allowPicking: false,
    releaseGeometryInstances: true,
  });

  return primitive;
}

export default createFrustumOutlinePrimitive;
