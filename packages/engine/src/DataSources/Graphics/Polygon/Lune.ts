/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 03:12:36
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:43:23
 */
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { Cartesian3, createGuid } from "cesium";
import MathUtils from "../../../Core/MathUtils";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import { GeometryType, GraphicType } from "../../../enum";
import { GeometryStyleMap, Point3Deg } from "../../../types";
import registry from "../../../Core/GraphicRegistry";

export default class Lune extends AbstractPolygon {
  readonly graphicType = GraphicType.LUNE;
  readonly minPointsForShape = 3;

  constructor({
    core,
    style,
    positions,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.POLYGON];
    positions?: Point3Deg[];
  }) {
    super({
      core,
      style,
      positions,
    });

    this.freehand = true;
    this.graphicName = "半月形";
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

    if (this.points.size === 1) {
      this.hintText = "单击确定直径";
      this.onMouseMove();
    } else if (this.points.size === 2) {
      this.hintText = "单击结束绘制";
    } else if (this.points.size > 2) {
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
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    if (projectionPoints.length === 2) {
      const mid = MathUtils.mid(projectionPoints[0], projectionPoints[1]);

      const d = MathUtils.projectionDistance(projectionPoints[0], mid);
      const pnt = MathUtils.getThirdPoint(
        projectionPoints[0],
        mid,
        Math.PI / 2,
        d,
        false
      );
      projectionPoints.push(pnt);
    }
    const pnt1 = projectionPoints[0],
      pnt2 = projectionPoints[1],
      pnt3 = projectionPoints[2];
    let startAngle: number, endAngle: number;

    const center = MathUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
    const radius = MathUtils.projectionDistance(pnt1, center);
    const angle1 = MathUtils.getAzimuth(center, pnt1);
    const angle2 = MathUtils.getAzimuth(center, pnt2);
    if (!MathUtils.isPathClockwise(pnt1, pnt2, pnt3)) {
      startAngle = angle1;
      endAngle = angle2;
    } else {
      startAngle = angle2;
      endAngle = angle1;
    }

    const points = MathUtils.getArcPoints(center, radius, startAngle, endAngle);

    const cartesianPoints = CoordinateUtils.projPntArr2Cartesian3Arr(points);
    return cartesianPoints;
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.LUNE, Lune as any);
