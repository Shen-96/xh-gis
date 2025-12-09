/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-09 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 14:18:08
 */
/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 */
import {
  Matrix4,
  createGuid,
  Primitive,
  GeometryInstance,
  PerInstanceColorAppearance,
  Color,
  ColorGeometryInstanceAttribute,
} from "cesium";
import TetrahedronOutlineGeometry from "../Geometries/Tetrahedron/TetrahedronOutlineGeometry";
import { TetrahedronStyleOptions } from "../../types";

function createTetrahedronOutlinePrimitive(
  id = createGuid(),
  style: TetrahedronStyleOptions,
  modelMatrix = Matrix4.IDENTITY,
  maximumAliasedLineWidth = 1
) {
  const geom = TetrahedronOutlineGeometry.createGeometry(
    new TetrahedronOutlineGeometry({ edgeLength: style.edgeLength })
  );
  const colorStr = style.material?.outlineColor ?? "rgba(255,255,0,0.95)";
  const instance = new GeometryInstance({
    id,
    geometry: geom,
    attributes: {
      color: ColorGeometryInstanceAttribute.fromColor(
        Color.fromCssColorString(colorStr)
      ),
    },
  });
  if (!instance) return undefined;

  const primitive = new Primitive({
    geometryInstances: instance,
    appearance: new PerInstanceColorAppearance({
      flat: true,
      renderState: {
        // lineWidth 受平台限制，这里与 cylinder outline 保持一致的占位。
        // lineWidth: Math.min(
        //   maximumAliasedLineWidth,
        //   style.material?.outlineWidth ?? maximumAliasedLineWidth
        // )
      },
    }),
    modelMatrix,
    allowPicking: false,
    releaseGeometryInstances: true,
    asynchronous: false,
  });

  return primitive;
}

export default createTetrahedronOutlinePrimitive;
