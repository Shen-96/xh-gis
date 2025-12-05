/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2023-01-12 16:18:49
 */
import {
  Cartesian3,
  GeometryInstance,
  createGuid,
  PolylineGeometry
} from 'cesium';

function createPolylineInstance(
  id = createGuid(),
  positions: Array<Cartesian3>,
  width = 1
) {
  /// 圆锥
  const geometry = new PolylineGeometry({
    positions,
    width
  });

  const instance = new GeometryInstance({
    id,
    geometry
  });

  return instance;
}

export default createPolylineInstance;
