/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-04-29 17:09:47
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:48:10
 */
import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractLine from "../Abstract/AbstractLine";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import { GeometryType, GraphicType, SymbolType } from "../../../enum";
import { GeometryStyleMap } from "../../../types";
import { GeometryUtils } from "../../../Core/GeometryUtils";
import { ISymbol } from "../Abstract/ISymbol";

const ArrowParams = {
  [SymbolType.不标示突破地段的作战行动]: {
    arrowAngle: Math.PI / 3,
    arrowLengthFactor: 0.1,
    maxArrowLength: 1500,
    curveSmoothnessFactor: 0.3,
  },
};

export default abstract class BaseCurvedArrow
  extends AbstractLine
  implements ISymbol
{
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

    this.hintText = "单击开始绘制";
  }

  graphicType = GraphicType.SYMBOL;
  abstract symbolType: SymbolType;
  minPointsForShape = 2;

  /**
   * Add points only on click events
   */
  protected addPoint(cartesian: Cartesian3) {
    this.points.set(createGuid(), cartesian);

    this.hintText = "单击继续添加点，双击结束绘制";
    if (this.points.size < 2) {
      this.onMouseMove();
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

  private createStraightArrow(positions: Cartesian3[]) {
    const [pnt1, pnt2] = CoordinateUtils.car3ArrToProjectionPntArr(positions);
    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateStraightArrow(
        pnt1,
        pnt2,
        // @ts-ignore
        ArrowParams[this.symbolType]
      )
    );
  }

  /**
   * Generate geometric shapes based on key points.
   */
  protected generateGeometry(positions: Cartesian3[]) {
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    if (positions.length === 2) {
      // If there are only two points, draw a fine straight arrow.
      return this.createStraightArrow(positions);
    }

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateCurveArrow(
        projectionPoints,
        // @ts-ignore
        ArrowParams[this.symbolType]
      )
    );
  }

  beginDraw(callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]): void {
    this.setState("drawing");

    this.onLeftClick();
    this.onLeftDoubleClick(callback);
  }
}
