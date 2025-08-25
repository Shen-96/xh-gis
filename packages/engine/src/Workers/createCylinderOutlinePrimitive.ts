/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-10-13 10:05:11
 */
import {
  Matrix4,
  createGuid,
  Primitive,
  PerInstanceColorAppearance
} from 'cesium';
import createCylinderOutlineInstance from './createCylinderOutlineInstance';
import { CylinderGraphicOptions } from '..';

function createCylinderOutlinePrimitive(
  id = createGuid(),
  style: CylinderGraphicOptions,
  modelMatrix = Matrix4.IDENTITY,
  // attitude?: Attitude,
  // translation?: Cartesian3,
  maximumAliasedLineWidth = 1
) {
  const instance = createCylinderOutlineInstance(id, style);
  if (!instance) return undefined;

  const primitive = new Primitive({
    geometryInstances: instance,
    appearance: new PerInstanceColorAppearance({
      flat: true,
      renderState: {
        // lineWidth: Math.min(
        //   maximumAliasedLineWidth,
        //   style.?.outlineWidth ?? maximumAliasedLineWidth
        // )
      }
    }),
    modelMatrix
  });

  return primitive;
}

export default createCylinderOutlinePrimitive;
