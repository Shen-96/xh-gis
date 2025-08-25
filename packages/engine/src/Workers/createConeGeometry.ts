/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-13 14:12:57
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-01-16 11:06:44
 */

import {
  BoundingSphere,
  Math as CesiumMath,
  Geometry,
  GeometryAttributes,
  PrimitiveType,
  VertexFormat,
  Cartesian3,
  Cartesian2,
  GeometryAttribute,
  ComponentDatatype,
} from "cesium";
import ConeGeometryLibrary from "./ConeGeometryLibrary";

function createTypedArray(numberOfVertices: number, indicesLengthOrArray: number): Uint16Array | Uint32Array {
  if (numberOfVertices >= CesiumMath.SIXTY_FOUR_KILOBYTES) {
    return new Uint32Array(indicesLengthOrArray);
  }

  return new Uint16Array(indicesLengthOrArray);
}

const radiusScratch = new Cartesian2();
const normalScratch = new Cartesian3();
const bitangentScratch = new Cartesian3();
const tangentScratch = new Cartesian3();
const positionScratch = new Cartesian3();

function createConeGeometry(options: {
  radius: number;
  height: number;
  slices?: number;
}) {
  const radius = options.radius;
  const vertexFormat = VertexFormat.DEFAULT;
  const slices = options.slices ?? 128;

  const twoSlices = slices + slices;
  const threeSlices = slices + twoSlices;
  const numVertices = twoSlices + twoSlices;

  const positions = ConeGeometryLibrary.computePositions(
    options.height,
    options.radius,
    options.slices
  );

  const st = vertexFormat.st ? new Float32Array(numVertices * 2) : undefined;
  const normals = vertexFormat.normal
    ? new Float32Array(numVertices * 3)
    : undefined;
  const tangents = vertexFormat.tangent
    ? new Float32Array(numVertices * 3)
    : undefined;
  const bitangents = vertexFormat.bitangent
    ? new Float32Array(numVertices * 3)
    : undefined;

  let i;
  const computeNormal =
    vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent;

  if (computeNormal) {
    const computeTangent = vertexFormat.tangent || vertexFormat.bitangent;

    let normalIndex = 0;
    let tangentIndex = 0;
    let bitangentIndex = 0;

    const theta = Math.atan2(-radius, length);
    const normal = normalScratch;
    normal.z = Math.sin(theta);
    const normalScale = Math.cos(theta);
    let tangent = tangentScratch;
    let bitangent = bitangentScratch;

    for (i = 0; i < slices; i++) {
      const angle = (i / slices) * CesiumMath.TWO_PI;
      const x = normalScale * Math.cos(angle);
      const y = normalScale * Math.sin(angle);
      if (computeNormal) {
        normal.x = x;
        normal.y = y;

        if (computeTangent) {
          tangent = Cartesian3.normalize(
            Cartesian3.cross(Cartesian3.UNIT_Z, normal, tangent),
            tangent
          );
        }

        if (vertexFormat.normal) {
          normals![normalIndex++] = normal.x;
          normals![normalIndex++] = normal.y;
          normals![normalIndex++] = normal.z;
          normals![normalIndex++] = normal.x;
          normals![normalIndex++] = normal.y;
          normals![normalIndex++] = normal.z;
        }

        if (vertexFormat.tangent) {
          tangents![tangentIndex++] = tangent.x;
          tangents![tangentIndex++] = tangent.y;
          tangents![tangentIndex++] = tangent.z;
          tangents![tangentIndex++] = tangent.x;
          tangents![tangentIndex++] = tangent.y;
          tangents![tangentIndex++] = tangent.z;
        }

        if (vertexFormat.bitangent) {
          bitangent = Cartesian3.normalize(
            Cartesian3.cross(normal, tangent, bitangent),
            bitangent
          );
          bitangents![bitangentIndex++] = bitangent.x;
          bitangents![bitangentIndex++] = bitangent.y;
          bitangents![bitangentIndex++] = bitangent.z;
          bitangents![bitangentIndex++] = bitangent.x;
          bitangents![bitangentIndex++] = bitangent.y;
          bitangents![bitangentIndex++] = bitangent.z;
        }
      }
    }

    for (i = 0; i < slices; i++) {
      if (vertexFormat.normal) {
        normals![normalIndex++] = 0;
        normals![normalIndex++] = 0;
        normals![normalIndex++] = -1;
      }
      if (vertexFormat.tangent) {
        tangents![tangentIndex++] = 1;
        tangents![tangentIndex++] = 0;
        tangents![tangentIndex++] = 0;
      }
      if (vertexFormat.bitangent) {
        bitangents![bitangentIndex++] = 0;
        bitangents![bitangentIndex++] = -1;
        bitangents![bitangentIndex++] = 0;
      }
    }

    for (i = 0; i < slices; i++) {
      if (vertexFormat.normal) {
        normals![normalIndex++] = 0;
        normals![normalIndex++] = 0;
        normals![normalIndex++] = 1;
      }
      if (vertexFormat.tangent) {
        tangents![tangentIndex++] = 1;
        tangents![tangentIndex++] = 0;
        tangents![tangentIndex++] = 0;
      }
      if (vertexFormat.bitangent) {
        bitangents![bitangentIndex++] = 0;
        bitangents![bitangentIndex++] = 1;
        bitangents![bitangentIndex++] = 0;
      }
    }
  }

  const numIndices = 12 * slices - 12;
  const indices = createTypedArray(numVertices, numIndices);
  let index = 0;
  let j = 0;
  for (i = 0; i < slices - 1; i++) {
    indices[index++] = j;
    indices[index++] = j + 2;
    indices[index++] = j + 3;

    indices[index++] = j;
    indices[index++] = j + 3;
    indices[index++] = j + 1;

    j += 2;
  }

  indices[index++] = twoSlices - 2;
  indices[index++] = 0;
  indices[index++] = 1;
  indices[index++] = twoSlices - 2;
  indices[index++] = 1;
  indices[index++] = twoSlices - 1;

  for (i = 1; i < slices - 1; i++) {
    indices[index++] = twoSlices + i + 1;
    indices[index++] = twoSlices + i;
    indices[index++] = twoSlices;
  }

  for (i = 1; i < slices - 1; i++) {
    indices[index++] = threeSlices;
    indices[index++] = threeSlices + i;
    indices[index++] = threeSlices + i + 1;
  }

  let textureCoordIndex = 0;
  if (vertexFormat.st) {
    const rad = radius;
    for (i = 0; i < numVertices; i++) {
      //@ts-expect-error
      const position = Cartesian3.fromArray(positions, i * 3, positionScratch);
      st![textureCoordIndex++] = (position.x + rad) / (2.0 * rad);
      st![textureCoordIndex++] = (position.y + rad) / (2.0 * rad);
    }
  }

  const attributes = new GeometryAttributes();
  if (vertexFormat.position) {
    attributes.position = new GeometryAttribute({
      componentDatatype: ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: positions,
    });
  }

  if (vertexFormat.normal) {
    attributes.normal = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: normals,
    });
  }

  if (vertexFormat.tangent) {
    attributes.tangent = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: tangents,
    });
  }

  if (vertexFormat.bitangent) {
    attributes.bitangent = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: bitangents,
    });
  }

  if (vertexFormat.st) {
    attributes.st = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 2,
      values: st,
    });
  }

  const boundingSphere = new BoundingSphere(
    Cartesian3.ZERO,
    Cartesian2.magnitude(radiusScratch)
  );

  radiusScratch.x = length * 0.5;
  radiusScratch.y = radius;

  return new Geometry({
    attributes: attributes,
    indices: indices,
    primitiveType: PrimitiveType.TRIANGLES,
    boundingSphere: boundingSphere,
  });
}

export default createConeGeometry;
