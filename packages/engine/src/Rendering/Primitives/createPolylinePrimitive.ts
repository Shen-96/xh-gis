/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2023-01-12 17:38:20
 */
import {
  Cartesian3,
  GeometryInstance,
  createGuid,
  Primitive,
  PolylineGeometry,
} from 'cesium';
import type { PolylineGraphicOptions } from '../../types';
import { createCustomMaterialAppearance } from '../Materials/createCustomMaterialAppearance';

function createPolylinePrimitive(
  this: any,
  id = createGuid(),
  style: PolylineGraphicOptions,
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
  const appearance = createCustomMaterialAppearance(
    this.style,
    { startPosition: this.positions?.[0] }
  );

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
