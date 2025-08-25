/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 03:07:44
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:42:28
 */
import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap } from "../../../types";

export default class FreehandPolygon extends AbstractPolygon {
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

    this.graphicType = GraphicType.FREEHAND_POLYGON;

    this.freehand = true;
    this.graphicName = "手绘面";
    this.minPointsForShape = 3;
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

    this.hintText = "再次单击结束绘制";
    if (this.points.size === 1) {
      this.onMouseMove();
    } else if (this.points.size > 2) {
      this.finishDrawing(callback);
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    this.points.set(createGuid(), cartesian);

    if (this.points.size > 2) {
      const tempPoints = this.generateGeometry(this.getPoints());
      this.setGeometryPoints(tempPoints);

      this.eventDispatcher.dispatchEvent("drawUpdate", cartesian);
    }
  }

  protected generateGeometry(points: Cartesian3[]): Cartesian3[] {
    return points.concat(points[0]);
  }
}
