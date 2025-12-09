/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: trae@example.com
 * @Date: 2025-12-09 10:32:22
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 10:36:38
 * @WeChat: yingnan55
 * @Version: 1.0.0
 */
import { Cartesian3 } from "cesium";

export function getUnitVertices(): Cartesian3[] {
  return [
    new Cartesian3(1, 1, 1),
    new Cartesian3(1, -1, -1),
    new Cartesian3(-1, 1, -1),
    new Cartesian3(-1, -1, 1),
  ];
}

export function getScale(edgeLength: number): number {
  const a0 = 2 * Math.SQRT2;
  return Math.max(1e-6, edgeLength) / a0;
}

export function scaleVertices(unitVerts: Cartesian3[], s: number): Cartesian3[] {
  return unitVerts.map((v) => Cartesian3.multiplyByScalar(v, s, v.clone()));
}

export function toFaceOriginFrame(verts: Cartesian3[]): { vertsLocal: Cartesian3[] } {
  const v0 = verts[0];
  const v1 = verts[1];
  const v2 = verts[2];
  const v3 = verts[3];

  const C = new Cartesian3(
    (v1.x + v2.x + v3.x) / 3,
    (v1.y + v2.y + v3.y) / 3,
    (v1.z + v2.z + v3.z) / 3
  );

  const z = Cartesian3.normalize(Cartesian3.subtract(v0, C, new Cartesian3()), new Cartesian3());
  const x0 = Cartesian3.normalize(Cartesian3.subtract(v2, v1, new Cartesian3()), new Cartesian3());
  const y = Cartesian3.normalize(Cartesian3.cross(z, x0, new Cartesian3()), new Cartesian3());
  const x = Cartesian3.normalize(Cartesian3.cross(y, z, new Cartesian3()), new Cartesian3());

  const vertsLocal = verts.map((p) => {
    const q = Cartesian3.subtract(p, C, new Cartesian3());
    const lx = q.x * x.x + q.y * x.y + q.z * x.z;
    const ly = q.x * y.x + q.y * y.y + q.z * y.z;
    const lz = q.x * z.x + q.y * z.y + q.z * z.z;
    return new Cartesian3(lx, ly, lz);
  });

  return { vertsLocal };
}

export function getSolidIndices(): Uint16Array {
  return new Uint16Array([
    0, 1, 2,
    0, 1, 3,
    0, 2, 3,
    1, 2, 3,
  ]);
}

export function getOutlineIndices(): Uint16Array {
  return new Uint16Array([
    0, 1,
    0, 2,
    0, 3,
    1, 2,
    1, 3,
    2, 3,
  ]);
}

export function packPositions(verts: Cartesian3[]): Float64Array {
  const arr = new Float64Array(verts.length * 3);
  let i = 0;
  for (const v of verts) {
    arr[i++] = v.x;
    arr[i++] = v.y;
    arr[i++] = v.z;
  }
  return arr;
}

export function computeSmoothNormals(verts: Cartesian3[]): Float32Array {
  const arr = new Float32Array(verts.length * 3);
  let i = 0;
  for (const v of verts) {
    const n = Cartesian3.normalize(v.clone(), new Cartesian3());
    arr[i++] = n.x;
    arr[i++] = n.y;
    arr[i++] = n.z;
  }
  return arr;
}

export function computeBoundingRadius(verts: Cartesian3[]): number {
  let r = 0;
  for (const v of verts) {
    r = Math.max(r, Cartesian3.magnitude(v));
  }
  return r;
}
