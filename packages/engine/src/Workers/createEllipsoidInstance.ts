/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-11-05 21:27:45
 */
import {
  createGuid,
  GeometryInstance,
  EllipsoidGeometry,
  Cartesian3
} from 'cesium';
import { EllipsoidGraphicOptions } from '..';

function createEllipsoidInstance(
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
      maximumCone
    } = style;

    /// 圆锥
    const geometry = new EllipsoidGeometry({
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
        geometry
      });

    return instance;
  } catch (error) {
    console.error(`failed to createConeInstance, style:`, style);
    return undefined;
  }
}

export default createEllipsoidInstance;
