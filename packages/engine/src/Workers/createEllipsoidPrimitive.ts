/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-10-13 10:06:41
 */
import { Matrix4, createGuid, Primitive } from 'cesium';
import createEllipsoidInstance from './createEllipsoidInstance';
import { createCustomMaterialAppearance } from './createCustomMaterialAppearance';
import { EllipsoidGraphicOptions } from '..';

function createEllipsoidPrimitive(
  id = createGuid(),
  style: EllipsoidGraphicOptions,
  modelMatrix = Matrix4.IDENTITY
) {
  /// 初始参数
  // const { material } = style;

  const instance = createEllipsoidInstance(id, style);
  if (!instance) return undefined;

  const primitive = new Primitive({
    geometryInstances: instance,
    // appearance: new MaterialAppearance({
    //     flat: true,
    //     translucent: true,
    //     material: Material.fromType("Color", {
    //         color: Color.fromCssColorString(
    //             material?.fillColor ?? "rgba(255,255,0,0.6)"
    //         ),
    //     }),
    // }),
    appearance: createCustomMaterialAppearance(style),
    modelMatrix
  });

  return primitive;
}

export default createEllipsoidPrimitive;
