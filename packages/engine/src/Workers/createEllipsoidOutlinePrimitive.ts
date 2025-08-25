/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-25 09:10:08
 */
import {
  Matrix4,
  createGuid,
  Primitive,
  PerInstanceColorAppearance
} from 'cesium';
import { EllipsoidGraphicOptions } from '..';
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
