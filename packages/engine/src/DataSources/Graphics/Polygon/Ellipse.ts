/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 02:54:16
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:50
 */
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { Cartesian3, createGuid } from "cesium";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryStyleMap, Point } from "../../../types";
import { GeometryType, GraphicType } from "../../../enum";

export default class Ellipse extends AbstractPolygon {
  graphicType: GraphicType;

  minPointsForShape: number;

  constructor({
    core,
    style,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.POLYGON];
  }) {
    super({
      core,
      style,
    });

    this.graphicType = GraphicType.ELLIPSE;

    this.freehand = true;
    this.graphicName = "椭圆";
    this.minPointsForShape = 2;
    this.hintText = "单击开始绘制";
  }

  /**
   * Add points only on click events
   */
  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ) {
    this.points.set(createGuid(), cartesian);

    this.hintText = "单击结束绘制";
    if (this.points.size === 1) {
      this.onMouseMove();
    } else if (this.points.size > 1) {
      this.finishDrawing(callback);
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    const geometryPoints = this.generateGeometry(tempPoints);
    this.setGeometryPoints(geometryPoints);
  }

  protected generateGeometry(positions: Cartesian3[]) {
    const lnglatPoints = positions.map((pnt) => {
      return CoordinateUtils.car3ToPoint(pnt);
    });
    const pnt1 = lnglatPoints[0];
    const pnt2 = lnglatPoints[1];

    const center = MathUtils.mid(pnt1, pnt2);
    const majorRadius = Math.abs((pnt1[0] - pnt2[0]) / 2);
    const minorRadius = Math.abs((pnt1[1] - pnt2[1]) / 2);
    const res = this.generatePoints(center, majorRadius, minorRadius);
    const cartesianPoints = res.map((p) => CoordinateUtils.pointToCar3(p));
    return cartesianPoints;
  }

  private generatePoints(
    center: Point,
    majorRadius: number,
    minorRadius: number
  ) {
    let [x, y, angle] = [-1, -1, 0];
    const points = [] as Point[];
    for (let i = 0; i <= 100; i++) {
      angle = (Math.PI * 2 * i) / 100;
      x = center[0] + majorRadius * Math.cos(angle);
      y = center[1] + minorRadius * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  }
}
