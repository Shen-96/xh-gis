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
import GeometryUtils from "../../../Core/GeometryUtils";
import { GeometryStyleMap, Point3Deg } from "../../../types";
import { GeometryType, GraphicType } from "../../../enum";
import registry from "../../../Core/GraphicRegistry";

export default class Ellipse extends AbstractPolygon {
  graphicType: GraphicType;
  
  minPointsForShape: number;

  constructor({
    core,
    style,
    positions,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.POLYGON];
    positions?: Point3Deg[];
  }) {
    super({ core, style, positions });

    this.graphicType = GraphicType.ELLIPSE;
    this.freehand = true;
    this.graphicName = "椭圆";
    this.minPointsForShape = 2;
    this.hintText = "单击确定中心点";
  }

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

  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    const geometryPoints = this.generateGeometry(tempPoints);
    this.setGeometryPoints(geometryPoints);
  }

  protected generateGeometry(positions: Cartesian3[]) {
    const projPoints = CoordinateUtils.car3ArrToProjectionPntArr(positions);
    const center = projPoints[0];
    const pnt2 = projPoints[1];

    const { semiMajorAxis, semiMinorAxis } = MathUtils.computeEllipseAxes(
      center,
      pnt2
    );

    const points = GeometryUtils.generateEllipsePoints(
      center,
      semiMajorAxis,
      semiMinorAxis
    );
    return CoordinateUtils.projPntArr2Cartesian3Arr(points);
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.ELLIPSE, Ellipse as any);
