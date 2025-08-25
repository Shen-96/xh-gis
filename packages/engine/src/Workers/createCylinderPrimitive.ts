/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-25 09:11:37
 */
import {
  Matrix4,
  createGuid,
  Primitive,
  Color,
  MaterialAppearance,
  Material
} from 'cesium';
import createCylinderInstance from './createCylinderInstance';
import { CylinderGraphicOptions } from '..';

function createCylinderPrimitive(
  id = createGuid(),
  style: CylinderGraphicOptions,
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
    appearance: new MaterialAppearance({
      flat: true,
      translucent: true,
      // material: Material.fromType('Color', {
      //   color: Color.fromCssColorString(
      //     material?.fillColor ?? 'rgba(255,255,0,0.3)'
      //   )
      // })
    }),
    modelMatrix
  });

  return primitive;
}

export default createCylinderPrimitive;
