/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-03-25 09:10:08
 */
import {
  Matrix4,
  createGuid,
  Primitive,
  GeometryInstance,
  PerInstanceColorAppearance,
  EllipsoidOutlineGeometry,
  ColorGeometryInstanceAttribute,
  Color,
  Cartesian3
} from 'cesium';
import type { EllipsoidStyleOptions } from '../../types';

function createEllipsoidOutlinePrimitive(
  id = createGuid(),
  style: EllipsoidStyleOptions,
  modelMatrix = Matrix4.IDENTITY,
  // attitude?: Attitude,
  // translation?: Cartesian3
  maximumAliasedLineWidth = 1
) {
  /// 初始参数

  const { radii, innerRadii, minimumClock, maximumClock, minimumCone, maximumCone, material } = style;
  const geometry = new EllipsoidOutlineGeometry({
    radii: Cartesian3.fromArray(radii),
    innerRadii: innerRadii && Cartesian3.fromArray(innerRadii),
    minimumClock,
    maximumClock,
    minimumCone,
    maximumCone,
  });
  const colorStr = material?.outlineColor ?? 'rgba(255,255,255,0.95)';
  const instance = new GeometryInstance({
    id,
    geometry,
    attributes: {
      color: ColorGeometryInstanceAttribute.fromColor(
        Color.fromCssColorString(colorStr)
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
        //   style.material?.outlineWidth ?? maximumAliasedLineWidth
        // )
      }
    }),
    modelMatrix
  });

  return primitive;
}

export default createEllipsoidOutlinePrimitive;
