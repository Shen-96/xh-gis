/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-12 11:35:12
 */
import { Cartesian3, GeometryInstance, createGuid, Primitive, PolylineGeometry, Matrix4 } from 'cesium';
import type { PolylineStyleOptions } from '../../types';
import { createAppearance } from '../Materials/Appearances/createCustomMaterialAppearance';

function createPolylinePrimitive(
  id = createGuid(),
  style: PolylineStyleOptions,
  positions: Array<Cartesian3>,
  modelMatrix = Matrix4.IDENTITY
) {
  const geometry = new PolylineGeometry({
    positions,
    width: style?.width ?? 1
  });

  const appearance = createAppearance(style as any, { geometry: 'polyline' });

  const geometryInstance = new GeometryInstance({
    id,
    geometry
  });

  const primitive = new Primitive({
    geometryInstances: geometryInstance,
    appearance,
    modelMatrix
  });

  return primitive;
}

export default createPolylinePrimitive;
