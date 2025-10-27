/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 07:00:31
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:43:35
 */
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { Cartesian3, createGuid } from "cesium";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap, Point3Deg } from "../../../types";
import GeometryUtils from "../../../Core/GeometryUtils";
import registry from "../../../Core/GraphicRegistry";

export default class Rectangle extends AbstractPolygon {
  readonly graphicType = GraphicType.RECTANGLE;
  readonly minPointsForShape = 2;

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

    this.graphicName = "矩形";
  }

  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ) {
    this.points.set(createGuid(), cartesian);

    if (this.points.size === 1) {
      this.hintText = "单击结束绘制";
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

  protected generateGeometry(positions: Cartesian3[]): Cartesian3[] {
    const [p1, p2] = CoordinateUtils.car3ArrToPointArr(positions);
    const coords = [...p1, p1[0], p2[1], ...p2, p2[0], p1[1], ...p1];
    const cartesianPoints = Cartesian3.fromDegreesArray(coords);
    return cartesianPoints;
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.RECTANGLE, Rectangle as any);
