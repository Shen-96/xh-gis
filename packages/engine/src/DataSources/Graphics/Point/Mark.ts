/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-28 06:16:24
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:39
 */
import { Cartesian3, createGuid } from "cesium";
import AbstractPoint from "../Abstract/AbstractPoint";
import { MarkStyle } from "../types";
import AbstractCore from "../../../Core/AbstractCore";
import { Point3Deg } from "../../../types";
import AbstractGraphic from "../Abstract/AbstractGraphic";
import { GeometryType, GraphicType } from "../../../enum";;

export class Mark extends AbstractPoint {
  graphicType: GraphicType;
  

  constructor(core: AbstractCore, style?: MarkStyle) {
    super({ core, style });

    this.graphicType = GraphicType.POINT;
    this.graphicName = "点标牌";
    this.hintText = "单击确定位置";
  }

  protected addPoint(
    cartesian: Cartesian3,
    callback?: (
      position: Point3Deg,
      self: AbstractGraphic<GeometryType.POINT>
    ) => void
  ): void {
    this.points.set(createGuid(), cartesian);

    if (this.points.size === 1) {
      this.finishDrawing(callback);
    }
  }

  protected updateMovingPoint(cartesian: Cartesian3): void {
    this.setGeometryPoints([cartesian]);
  }

  protected generateGeometry(points: Cartesian3[]): Cartesian3[] {
    return points;
  }
}
