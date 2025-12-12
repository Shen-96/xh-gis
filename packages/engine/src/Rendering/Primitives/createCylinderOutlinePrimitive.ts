/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2023-10-13 10:05:11
 */
import {
  Matrix4,
  createGuid,
  Primitive,
  GeometryInstance,
  PerInstanceColorAppearance,
  CylinderOutlineGeometry,
  ColorGeometryInstanceAttribute,
  Color
} from 'cesium';
import type { CylinderStyleOptions } from '../../types';

function createCylinderOutlinePrimitive(
  id = createGuid(),
  style: CylinderStyleOptions,
  modelMatrix = Matrix4.IDENTITY,
  // attitude?: Attitude,
  // translation?: Cartesian3,
  maximumAliasedLineWidth = 1
) {
  const { length, slices, topRadius, bottomRadius, material } = style;
  const geometry = new CylinderOutlineGeometry({
    topRadius,
    bottomRadius,
    length,
    slices,
  });
  const instance = new GeometryInstance({
    id,
    geometry,
    attributes: {
      color: ColorGeometryInstanceAttribute.fromColor(
        Color.fromCssColorString(material?.outlineColor ?? '#fffb00ff')
      ),
    },
  });

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
