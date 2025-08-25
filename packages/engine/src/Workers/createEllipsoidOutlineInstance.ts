/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-25 09:10:04
 */
import {
  createGuid,
  GeometryInstance,
  EllipsoidOutlineGeometry,
  ColorGeometryInstanceAttribute,
  Color,
  Cartesian3
} from 'cesium';
import { EllipsoidGraphicOptions } from '..';

function createEllipsoidOutlineInstance(
  id = createGuid(),
  style: EllipsoidGraphicOptions
): GeometryInstance | undefined {
  try {
    /// 初始参数
    const {
      radii,
      innerRadii,
      minimumClock,
      maximumClock,
      minimumCone,
      maximumCone,
      material
    } = style;

    /// 圆锥
    const geometry = new EllipsoidOutlineGeometry({
        radii: Cartesian3.fromArray(radii),
        /// 坑爹，inner半径没有的话只能给undefined
        innerRadii: innerRadii && Cartesian3.fromArray(innerRadii),
        minimumClock,
        maximumClock,
        minimumCone,
        maximumCone
      }),
      instance = new GeometryInstance({
        id,
        geometry,
        attributes: {
          // color: ColorGeometryInstanceAttribute.fromColor(
          //   material?.outlineColor
          //     ? Color.fromCssColorString(material.outlineColor)
          //     : Color.WHEAT
          // )
        }
      });

    return instance;
  } catch (error) {
    console.error(`failed to createConeInstance, style:`, style);
    return undefined;
  }
}

export default createEllipsoidOutlineInstance;
