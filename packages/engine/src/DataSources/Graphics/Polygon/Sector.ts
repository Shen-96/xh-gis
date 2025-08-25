/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 07:09:41
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:43:33
 */
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import { Cartesian3, createGuid } from "cesium";
import MathUtils from "../../../Core/MathUtils";
import AbstractCore from "../../../Core/AbstractCore";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap } from "../../../types";

export default class Sector extends AbstractPolygon {
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

    this.graphicType = GraphicType.SECTOR;

    this.graphicName = "扇形";
    this.minPointsForShape = 3;
    this.hintText = "单击确定中心点";
  }

  /**
   * Add points only on click events
   */
  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ) {
    this.points.set(createGuid(), cartesian);

    if (this.points.size === 1) {
      this.hintText = "单击确定半径";
      this.onMouseMove();
    } else if (this.points.size === 3) {
      this.finishDrawing(callback);
    } else {
      this.hintText = "单击结束绘制";
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    this.setGeometryPoints(tempPoints);

    if (tempPoints.length === 2) {
      this.addTempLine();
    } else {
      this.removeTempLine();
      const geometryPoints = this.generateGeometry(tempPoints);
      this.setGeometryPoints(geometryPoints);
    }
  }

  protected generateGeometry(positions: Cartesian3[]) {
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);
    const [center, pnt2, pnt3] = [
      projectionPoints[0],
      projectionPoints[1],
      projectionPoints[2],
    ];
    const radius = MathUtils.projectionDistance(pnt2, center);
    const startAngle = MathUtils.getAzimuth(center, pnt2);
    const endAngle = MathUtils.getAzimuth(center, pnt3);

    const res = MathUtils.getArcPoints(center, radius, startAngle, endAngle);
    res.push(center, res[0]);

    const cartesianPoints = CoordinateUtils.projPntArr2Cartesian3Arr(res);
    return cartesianPoints;
  }
}
