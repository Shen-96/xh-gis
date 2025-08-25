/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:44:12
 */
import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractCore from "../../../Core/AbstractCore";
import AbstractLine from "../Abstract/AbstractLine";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap } from "../../../types";
import { GeometryUtils } from "../../../Core/GeometryUtils";

export default class StraightArrow extends AbstractLine {
  graphicType: GraphicType;
  
  arrowLengthScale: number = 5;
  maxArrowLength: number = 3000000;
  minPointsForShape: number;

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

    this.graphicType = GraphicType.STRAIGHT_ARROW;
    this.graphicName = "直线箭头";
    this.minPointsForShape = 2;
    this.hintText = "单击开始绘制";
  }

  /**
   * Add points only on click events
   */
  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]
  ) {
    if (this.points.size < 2) {
      this.points.set(createGuid(), cartesian);

      if (this.points.size == 1) {
        this.hintText = "再次单击结束绘制";
      }
      this.onMouseMove();
    }
    if (this.points.size === 2) {
      const geometryPoints = this.generateGeometry(this.getPoints());
      this.setGeometryPoints(geometryPoints);
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

  /**
   * Generate geometric shapes based on key points.
   */
  protected generateGeometry(positions: Cartesian3[]) {
    const [pnt1, pnt2] = CoordinateUtils.car3ArrToProjectionPntArr(positions);

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateStraightArrow(pnt1, pnt2)
    );
  }
}
