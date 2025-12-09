/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-03-25 09:11:37
 */
import { Matrix4, createGuid, Primitive } from 'cesium';
import createCylinderInstance from './createCylinderInstance';
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

  const instance = createCylinderInstance(id, style);
  if (!instance) return undefined;

  const primitive = new Primitive({
    geometryInstances: instance,
    appearance: createAppearance(style, { geometry: 'surface' }),
    modelMatrix
  });

  return primitive;
}

export default createCylinderPrimitive;
