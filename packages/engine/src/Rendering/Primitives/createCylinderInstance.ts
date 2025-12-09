/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-04 16:30:05
 */
import {
  CylinderGeometry,
  Cartesian3,
  createGuid,
  Matrix4,
  GeometryInstance,
  VertexFormat,
  Color,
  ColorGeometryInstanceAttribute,
} from "cesium";
import type { CylinderStyleOptions } from "../../types";

function createCylinderInstance(
  id = createGuid(),
  style: CylinderStyleOptions
  // modelMatrix = Matrix4.IDENTITY,
  // attitude: Attitude = { elevation: -90 },
  // translation?: Cartesian3
): GeometryInstance | undefined {
  try {
    /// 初始参数
    const { length, slices, topRadius, bottomRadius, material } = style;
    const color = material?.color;
    /// 局部偏移量
    /// 将原点平移到底面中心
    // localTranslation = new Cartesian3(0, 0, length * 0.5);

    /// 圆锥
    const geometry = new CylinderGeometry({
        topRadius,
        bottomRadius,
        length,
        slices,
      }),
      // const geometry = createConeGeometry({
      //     radius,
      //     height,
      // }),
      /// 最终偏移量
      // lastModelMx = computeModelMatrix(modelMatrix, attitude, localTranslation),
      instance = new GeometryInstance({
        id,
        geometry,
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(
            Color.fromCssColorString(color ?? "#a8eb0e8a")
          ),
        },
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
