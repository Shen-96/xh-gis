/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2023-10-13 10:06:41
 */
import { Matrix4, createGuid, Primitive, GeometryInstance, EllipsoidGeometry, Cartesian3, VertexFormat } from 'cesium';
import { createAppearance } from '../Materials/Appearances/createCustomMaterialAppearance';
import type { EllipsoidStyleOptions } from '../../types';

function createEllipsoidPrimitive(
  id = createGuid(),
  style: EllipsoidStyleOptions,
  modelMatrix = Matrix4.IDENTITY
) {
  /// 初始参数
  // const { material } = style;

  const { radii, innerRadii, minimumClock, maximumClock, minimumCone, maximumCone } = style;
  const geometry = new EllipsoidGeometry({
    radii: Cartesian3.fromArray(radii),
    innerRadii: innerRadii && Cartesian3.fromArray(innerRadii),
    vertexFormat: VertexFormat.POSITION_NORMAL_AND_ST,
    minimumClock,
    maximumClock,
    minimumCone,
    maximumCone,
  });
  const instance = new GeometryInstance({ id, geometry });

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
    appearance: createAppearance(style, { geometry: 'surface' }),
    modelMatrix
  });

  return primitive;
}

export default createEllipsoidPrimitive;
