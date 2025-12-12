/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-03-25 09:11:37
 */
import { Matrix4, createGuid, Primitive, GeometryInstance, CylinderGeometry } from 'cesium';
import type { CylinderStyleOptions } from '../../types';
import { createAppearance } from '../Materials/Appearances/createCustomMaterialAppearance';

function createCylinderPrimitive(
  id = createGuid(),
  style: CylinderStyleOptions,
  modelMatrix = Matrix4.IDENTITY
  // attitude?: Attitude,
  // translation?: Cartesian3
) {
  /// 初始参数
  const { material } = style;

  const { length, slices, topRadius, bottomRadius } = style;
  const geometry = new CylinderGeometry({
    topRadius,
    bottomRadius,
    length,
    slices,
  });
  const instance = new GeometryInstance({ id, geometry });

  const primitive = new Primitive({
    geometryInstances: instance,
    appearance: createAppearance(style, { geometry: 'surface' }),
    modelMatrix
  });

  return primitive;
}

export default createCylinderPrimitive;
