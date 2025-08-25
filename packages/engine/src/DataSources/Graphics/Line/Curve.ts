/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-20 09:45:37
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:33
 */

import AbstractCore from "../../../Core/AbstractCore";
import AbstractLine from "../Abstract/AbstractLine";
import { GeometryDrawEventCallbackMap } from "../types";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { Cartesian3, createGuid } from "cesium";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap } from "../../../types";

export default class Curve extends AbstractLine {
  graphicType: GraphicType;
  
  minPointsForShape: number;
  arrowLengthScale: number = 5;
  maxArrowLength: number = 3000000;
  t: number;

  constructor({
    core,
    style,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.LINE];
  }) {
    super({
      core,
      style,
    });

    this.graphicType = GraphicType.CURVE;
    this.graphicName = "曲线";
    this.minPointsForShape = 3;
    this.t = 0.3;
    this.hintText = "单击开始绘制";
  }

  /**
   * Points are only added upon click events.
   */
  protected addPoint(cartesian: Cartesian3) {
    this.points.set(createGuid(), cartesian);

    this.hintText = "单击继续添加点，双击结束绘制";
    if (this.points.size < 2) {
      this.onMouseMove();
    } else if (this.points.size === 2) {
      this.setGeometryPoints(this.getPoints());
      this.drawActive();
    }
  }

  /**
   * Draw the shape based on the mouse movement position during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];

    if (tempPoints.length === 2) {
      this.setGeometryPoints(tempPoints);
      // this.drawActive();
    } else {
      const geometryPoints = this.generateGeometry(tempPoints);
      this.setGeometryPoints(geometryPoints);
    }
  }

  /**
   * Generate geometric shape points based on key points..
   */
  protected generateGeometry(positions: Cartesian3[]) {
    const projPoints = positions.map((pnt) => {
      return CoordinateUtils.car3ToProjectionPnt(pnt);
    });

    const curvePoints = MathUtils.getCurvePoints(this.t, projPoints);

    const temp = [...curvePoints];
    const cartesianPoints = temp.map((t) =>
      CoordinateUtils.projPnt2Cartesian3(t)
    );
    return cartesianPoints;
  }

  beginDraw(callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]): void {
    this.setState("drawing");

    this.onLeftClick();
    this.onLeftDoubleClick(callback);
  }
}
