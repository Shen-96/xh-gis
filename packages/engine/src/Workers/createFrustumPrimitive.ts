/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-03-25 09:10:49
 */
import {
  Math as CesiumMath,
  Matrix4,
  createGuid,
  Primitive,
  Color,
  MaterialAppearance,
  Material,
  FrustumGeometry,
  Cartesian3,
  GeometryInstance,
  PerspectiveFrustum,
  Quaternion
} from 'cesium';
import { FrustumGraphicOptions } from '..';

function createFrustumPrimitive(
  id = createGuid(),
  style: FrustumGraphicOptions,
  modelMatrix = Matrix4.IDENTITY
  // attitude?: Attitude,
  // translation?: Cartesian3
) {
  /// 初始参数
  const { material } = style;

  const frustum = new PerspectiveFrustum({
      fov: CesiumMath.toRadians(60.0),
      aspectRatio: 16 / 9,
      ...style
    }),
    geometry = new FrustumGeometry({
      frustum: frustum,
      origin: Cartesian3.ZERO,
      orientation: Quaternion.IDENTITY
    }),
    instance = new GeometryInstance({
      id,
      geometry: geometry
    });

  if (!instance) return undefined;

  const primitive = new Primitive({
    geometryInstances: instance,
    appearance: new MaterialAppearance({
      flat: true,
      translucent: true,
      material: Material.fromType('Color', {
        color: Color.fromCssColorString(
          material?.color ?? 'rgba(255,255,0,0.3)'
        )
      })
    }),
    modelMatrix,
    allowPicking: false,
    releaseGeometryInstances: true
  });

  return primitive;
}

export default createFrustumPrimitive;
