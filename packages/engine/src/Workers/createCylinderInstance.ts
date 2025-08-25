/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-10-30 18:37:07
 */
import {
  CylinderGeometry,
  Cartesian3,
  createGuid,
  Matrix4,
  GeometryInstance
} from 'cesium';
import { CylinderGraphicOptions } from '..';

function createCylinderInstance(
  id = createGuid(),
  style: CylinderGraphicOptions
  // modelMatrix = Matrix4.IDENTITY,
  // attitude: Attitude = { elevation: -90 },
  // translation?: Cartesian3
): GeometryInstance | undefined {
  try {
    /// 初始参数
    const { length, slices, topRadius, bottomRadius } = style;
    /// 局部偏移量
    /// 将原点平移到底面中心
    // localTranslation = new Cartesian3(0, 0, length * 0.5);

    /// 圆锥
    const geometry = new CylinderGeometry({
        topRadius,
        bottomRadius,
        length,
        slices
      }),
      // const geometry = createConeGeometry({
      //     radius,
      //     height,
      // }),
      /// 最终偏移量
      // lastModelMx = computeModelMatrix(modelMatrix, attitude, localTranslation),
      instance = new GeometryInstance({
        id,
        geometry
        // modelMatrix: Matrix4.fromTranslation(localTranslation)
        // modelMatrix
      });

    return instance;
  } catch (error) {
    console.error(`failed to createConeInstance, style:`, style);
    return undefined;
  }
}

export default createCylinderInstance;
