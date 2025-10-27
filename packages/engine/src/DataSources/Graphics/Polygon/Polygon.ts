/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-19 09:25:11
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:43:28
 */
import { Cartesian3, createGuid } from "cesium";
import AbstractCore from "../../../Core/AbstractCore";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import { GeometryDrawEventCallbackMap } from "../types";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap, Point3Deg } from "../../../types";
import registry from "../../../Core/GraphicRegistry";

export default class Polygon extends AbstractPolygon {
  readonly graphicType = GraphicType.POLYGON;
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

    this.graphicName = "面";
    this.hintText = "单击开始绘制";
  }

  protected addPoint(cartesian: Cartesian3) {
    this.points.set(createGuid(), cartesian);

    this.hintText = "单击继续添加点，双击结束绘制";
    if (this.points.size === 1) {
      this.onMouseMove();
    }
  }

  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    const geometryPoints = this.generateGeometry(tempPoints);
    this.setGeometryPoints(geometryPoints);

    if (tempPoints.length === 2) {
      this.addTempLine();
    } else {
      this.removeTempLine();
    }
  }

  protected generateGeometry(points: Cartesian3[]): Cartesian3[] {
    return points.concat(points[0]);
  }

  beginDraw(
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void {
    this.setState("drawing");

    this.onLeftClick();
    this.onLeftDoubleClick(callback);
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.POLYGON, Polygon as any);
