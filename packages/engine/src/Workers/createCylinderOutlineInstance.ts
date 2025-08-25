/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-25 09:11:21
 */
import {
  createGuid,
  GeometryInstance,
  CylinderOutlineGeometry,
  ColorGeometryInstanceAttribute,
  Color
} from 'cesium';
import { CylinderGraphicOptions } from '..';

function createCylinderOutlineInstance(
  id = createGuid(),
  style: CylinderGraphicOptions
  // modelMatrix = Matrix4.IDENTITY,
  // attitude: Attitude = { elevation: -90 },
  // translation?: Cartesian3
): GeometryInstance | undefined {
  try {
    /// 初始参数
    const { length, slices, topRadius, bottomRadius, material } = style;
      // height = range,
      // radius = Math.tan(CesiumMath.toRadians(angle)) * height,
      // outlineColor = material?.outlineColor;
      // outlineColor = material?.outlineColor;
    /// 局部偏移量
    /// 将原点平移到底面中心
    // localTranslation = translation?.clone() ?? new Cartesian3(length * 0.5 + 20, 0, 0),
    // localTranslation = new Cartesian3(0, 0, length * 0.5);

    /// 更新模型矩阵
    // computeModelMatrix(lastMx, attitude, localTranslation, lastMx);
    /// 圆锥
    const geometry = new CylinderOutlineGeometry({
        topRadius,
        bottomRadius,
        length,
        slices
      }),
      instance = new GeometryInstance({
        id,
        geometry,
        // modelMatrix: Matrix4.fromTranslation(localTranslation),
        // modelMatrix,
        // attributes: {
        //   color: ColorGeometryInstanceAttribute.fromColor(
        //     Color.fromCssColorString(outlineColor ?? '#ffff')
        //   )
        // }
      });

    return instance;
  } catch (error) {
    console.error(`failed to createConeOutlineInstance, style:`, style);
    return undefined;
  }
}

export default createCylinderOutlineInstance;
