/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-13 14:22:01
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-01-13 14:31:56
 */
import { Math as CesiumMath } from 'cesium';

/**
 * @private
 */
class ConeGeometryLibrary {
  static computePositions(
    length: number,
    radius: number,
    slices = 128,
    fill = true
  ) {
    const topZ = length * 0.5;

    const twoSlice = slices + slices;
    const size = fill ? 2 * twoSlice : twoSlice;
    const positions = new Float64Array(size * 3);
    let i;
    let index = 0;
    let tbIndex = 0;
    const topOffset = fill ? (twoSlice + slices) * 3 : slices * 3;

    for (i = 0; i < slices; i++) {
      const angle = (i / slices) * CesiumMath.TWO_PI;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      const bottomX = x * radius;
      const bottomY = y * radius;

      positions[tbIndex + topOffset] = bottomX;
      positions[tbIndex + topOffset + 1] = bottomY;
      positions[tbIndex + topOffset + 2] = topZ;
      tbIndex += 3;
      if (fill) {
        positions[index++] = bottomX;
        positions[index++] = bottomY;
        positions[index++] = topZ;
      }
    }

    return positions;
  }
}

export default ConeGeometryLibrary;
