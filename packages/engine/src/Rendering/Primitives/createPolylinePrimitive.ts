/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 16:09:25
 */
import {
  Cartesian3,
  GeometryInstance,
  createGuid,
  Primitive,
  PolylineGeometry,
} from 'cesium';
import type { PolylineStyleOptions } from '../../types';
import { createAppearance } from '../Materials/Appearances/createCustomMaterialAppearance';

function createPolylinePrimitive(
  this: any,
  id = createGuid(),
  style: PolylineStyleOptions,
  positions: Array<Cartesian3>
) {
  this.id = id;
  this.style = style;
  this.positions = positions;
}

createPolylinePrimitive.prototype.getGeometry = function () {
  /// 初始参数
  const { width } = this.style ?? {};

  return new PolylineGeometry({
    positions: this.positions,
    width: width ?? 1
  });
};

createPolylinePrimitive.prototype.update = function (
  context: any,
  frameState: any,
  commandList: any
) {
  const geometry = this.getGeometry();
  if (!geometry) {
    return;
  }

  /// 初始参数
  const appearance = createAppearance(this.style, { geometry: 'polyline' });

  const geometryInstance = new GeometryInstance({
    id: this.id,
    geometry
  });

  this._primitive = new Primitive({
    geometryInstances: geometryInstance,
    appearance
  });

  const primitive = this._primitive;

  primitive.update(context, frameState, commandList);
};

export default createPolylinePrimitive;
