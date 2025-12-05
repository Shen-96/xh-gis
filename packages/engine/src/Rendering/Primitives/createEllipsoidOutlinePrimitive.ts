/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-03-25 09:10:08
 */
import {
  Matrix4,
  createGuid,
  Primitive,
  PerInstanceColorAppearance
} from 'cesium';
import type { EllipsoidGraphicOptions } from '../../types';
import createEllipsoidOutlineInstance from './createEllipsoidOutlineInstance';

function createEllipsoidOutlinePrimitive(
  id = createGuid(),
  style: EllipsoidGraphicOptions,
  modelMatrix = Matrix4.IDENTITY,
  // attitude?: Attitude,
  // translation?: Cartesian3
  maximumAliasedLineWidth = 1
) {
  /// 初始参数

  const instance = createEllipsoidOutlineInstance(id, style);
  if (!instance) return undefined;

  const primitive = new Primitive({
    geometryInstances: instance,
    appearance: new PerInstanceColorAppearance({
      flat: true,
      renderState: {
        // lineWidth: Math.min(
        //   maximumAliasedLineWidth,
        //   style.material?.outlineWidth ?? maximumAliasedLineWidth
        // )
      }
    }),
    modelMatrix
  });

  return primitive;
}

export default createEllipsoidOutlinePrimitive;
