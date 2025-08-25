/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 02:21:59
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:43
 */
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { Cartesian3, createGuid } from "cesium";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap } from "../../../types";
import { GeometryUtils } from "../../../Core/GeometryUtils";

export default class Circle extends AbstractPolygon {
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

    this.graphicType = GraphicType.CIRCLE;

    this.freehand = true;
    this.graphicName = "圆";
    this.minPointsForShape = 2;
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
    const projPoints = CoordinateUtils.car3ArrToProjectionPntArr(positions);
    const center = projPoints[0];
    const pnt2 = projPoints[1];

    const radius = MathUtils.projectionDistance(center, pnt2);

    const points = GeometryUtils.generateCirclePoints(center, radius);
    return CoordinateUtils.projPntArr2Cartesian3Arr(points);
  }
}
