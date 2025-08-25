/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-10 10:36:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-01-12 17:38:20
 */
import {
  Cartesian3,
  GeometryInstance,
  createGuid,
  Primitive,
  Color,
  PolylineGeometry,
  PolylineMaterialAppearance,
  Material
} from 'cesium';
import { PolylineGraphicOptions } from '..';

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
  const { dashLength, dashPattern, color, gapColor } = this.style ?? {},
    appearance = new PolylineMaterialAppearance({
      material: new Material({
        fabric: {
          type:
            dashLength == undefined && dashPattern == undefined
              ? Material.PolylineOutlineType
              : Material.PolylineDashType,
          color: Color.fromCssColorString(color ?? '#ffff00'),
          gapColor: Color.fromCssColorString(gapColor ?? 'transparent'),
          dashLength: dashLength ?? 16,
          dashPattern:
            dashPattern != undefined ? parseInt(String(dashPattern), 2) : 255
        }
      })
    });

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
