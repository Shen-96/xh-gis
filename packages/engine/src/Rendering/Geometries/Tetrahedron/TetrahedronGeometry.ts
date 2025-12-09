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
  getSolidIndices,
  packPositions,
  computeSmoothNormals,
  computeBoundingRadius,
  toFaceOriginFrame,
} from "./common";

type TetrahedronOptions = { edgeLength: number };

export default class TetrahedronGeometry {
  readonly edgeLength: number;
  constructor(options: TetrahedronOptions) {
    this.edgeLength = Math.max(1e-6, options.edgeLength);
  }
  static createGeometry(instance: TetrahedronGeometry): Geometry {
    const s = getScale(instance.edgeLength);
    const { vertsLocal } = toFaceOriginFrame(getUnitVertices());
    const verts = scaleVertices(vertsLocal, s);
    const positions = packPositions(verts);
    const normals = computeSmoothNormals(verts);
    const indices = getSolidIndices();

    const attributes = new GeometryAttributes();
    attributes.position = new GeometryAttribute({
      componentDatatype: ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: positions,
    });
    attributes.normal = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: normals,
    });

    const radius = computeBoundingRadius(verts);
    return new Geometry({
      attributes,
      indices,
      primitiveType: PrimitiveType.TRIANGLES,
      boundingSphere: new BoundingSphere(Cartesian3.ZERO, radius),
    });
  }
}
