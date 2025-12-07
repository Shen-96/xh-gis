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
  FrustumGeometry,
  Cartesian3,
  GeometryInstance,
  PerspectiveFrustum,
  Quaternion
} from 'cesium';
import type { FrustumGraphicOptions } from '../../types';
import { createAppearance } from '../Materials/Appearances/createCustomMaterialAppearance';

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
    appearance: createAppearance(style),
    modelMatrix,
    allowPicking: false,
    releaseGeometryInstances: true
  });

  return primitive;
}

export default createFrustumPrimitive;
