/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-09 10:32:43
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 10:43:42
 * @WeChat: yingnan55
 * @Version: 1.0.0
 */
import {
  BoundingSphere,
  Geometry,
  GeometryAttributes,
  GeometryAttribute,
  ComponentDatatype,
  PrimitiveType,
  Cartesian3,
} from "cesium";
import {
  getUnitVertices,
  getScale,
  scaleVertices,
  getOutlineIndices,
  packPositions,
  computeBoundingRadius,
  toFaceOriginFrame,
} from "./common";

type TetrahedronOutlineOptions = { edgeLength: number };

export default class TetrahedronOutlineGeometry {
  readonly edgeLength: number;
  constructor(options: TetrahedronOutlineOptions) {
    this.edgeLength = Math.max(1e-6, options.edgeLength);
  }
  static createGeometry(instance: TetrahedronOutlineGeometry): Geometry {
    const s = getScale(instance.edgeLength);
    const { vertsLocal } = toFaceOriginFrame(getUnitVertices());
    const verts = scaleVertices(vertsLocal, s);
    const positions = packPositions(verts);
    const indices = getOutlineIndices();

    const attributes = new GeometryAttributes();
    attributes.position = new GeometryAttribute({
      componentDatatype: ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: positions,
    });

    const radius = computeBoundingRadius(verts);
    return new Geometry({
      attributes,
      indices,
      primitiveType: PrimitiveType.LINES,
      boundingSphere: new BoundingSphere(Cartesian3.ZERO, radius),
    });
  }
}
