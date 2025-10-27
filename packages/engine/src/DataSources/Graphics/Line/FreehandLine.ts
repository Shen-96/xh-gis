/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 01:59:14
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:36
 */
import { Cartesian3, createGuid } from "cesium";
import AbstractLine from "../Abstract/AbstractLine";
import AbstractCore from "../../../Core/AbstractCore";
import { GeometryDrawEventCallbackMap } from "../types";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap, Point3Deg } from "../../../types";
import registry from "../../../Core/GraphicRegistry";

export default class FreehandLine extends AbstractLine {
  graphicType: GraphicType;
  
  minPointsForShape: number;

  constructor({
    core,
    style,
    positions,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.LINE];
    positions?: Point3Deg[];
  }) {
    super({
      core,
      style,
      positions,
    });

    this.graphicType = GraphicType.FREEHAND_LINE;
    this.freehand = true;
    this.graphicName = "手绘线";
    this.hintText = "单击开始绘制";
    this.minPointsForShape = 2;
  }

  /**
   * Add points only on click events
   */
  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]
  ) {
    this.points.set(createGuid(), cartesian);

    this.hintText = "再次单击结束绘制";
    if (this.points.size < 2) {
      this.onMouseMove();
    } else {
      this.finishDrawing(callback);
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    this.points.set(createGuid(), cartesian);
    this.setGeometryPoints(this.getPoints());
  }

  protected generateGeometry(points: Cartesian3[]): Cartesian3[] {
    return points;
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.FREEHAND_LINE, FreehandLine as any);
