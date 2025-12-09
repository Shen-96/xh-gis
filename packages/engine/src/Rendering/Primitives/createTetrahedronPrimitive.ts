/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: trae@example.com
 * @Date: 2025-12-09 10:36:10
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 14:19:44
 * @Version: 1.0.0
 */
/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 */
import { Matrix4, createGuid, Primitive, GeometryInstance } from "cesium";
import { createAppearance } from "../Materials/Appearances/createCustomMaterialAppearance";
import TetrahedronGeometry from "../Geometries/Tetrahedron/TetrahedronGeometry";
import { TetrahedronGraphicOptions } from "../../types";

function createTetrahedronPrimitive(
  id = createGuid(),
  style: TetrahedronGraphicOptions,
  modelMatrix = Matrix4.IDENTITY
) {
  const geom = TetrahedronGeometry.createGeometry(
    new TetrahedronGeometry({ edgeLength: style.edgeLength })
  );
  const instance = new GeometryInstance({ id, geometry: geom });
  if (!instance) return undefined;

  const primitive = new Primitive({
    geometryInstances: instance,
    appearance: createAppearance(style ?? {}),
    modelMatrix,
    allowPicking: false,
    releaseGeometryInstances: true,
    asynchronous: false,
  });

  return primitive;
}

export default createTetrahedronPrimitive;
