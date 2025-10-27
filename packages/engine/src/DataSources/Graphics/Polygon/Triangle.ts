/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 09:43:36
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:43:38
 */
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { Cartesian3, createGuid } from "cesium";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap, Point3Deg } from "../../../types";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import registry from "../../../Core/GraphicRegistry";

export default class Triangle extends AbstractPolygon {
  readonly graphicType = GraphicType.TRIANGLE;
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

    this.graphicName = "三角形";
  }

  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ) {
    this.points.set(createGuid(), cartesian);

    if (this.points.size === 1) {
      this.hintText = "单击添加第二个点";
      this.onMouseMove();
    } else if (this.points.size === 2) {
      this.hintText = "单击结束绘制";
    } else if (this.points.size >= 3) {
      this.finishDrawing(callback);
    }
  }

  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    const geometryPoints = this.generateGeometry(tempPoints);
    this.setGeometryPoints(geometryPoints);
  }

  protected generateGeometry(positions: Cartesian3[]): Cartesian3[] {
    if (positions.length < 3) {
      return positions;
    }
    
    const points = CoordinateUtils.car3ArrToPointArr(positions.slice(0, 3));
    const coords = [...points[0], ...points[1], ...points[2], ...points[0]];
    return Cartesian3.fromDegreesArray(coords);
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.TRIANGLE, Triangle as any);
