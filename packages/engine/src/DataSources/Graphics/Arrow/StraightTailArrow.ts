import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import AbstractCore from "../../../Core/AbstractCore";
import {
  GeometryType,
  GraphicType,
  SymbolType,
} from "../../../enum";
import { GeometryStyleMap } from "../../../types";
import GeometryUtils from "../../../Core/GeometryUtils";

export default class StraightTailArrow extends AbstractPolygon {
  graphicType: GraphicType;
  
  arrowLengthScale: number = 5;
  maxArrowLength: number = 2;
  tailWidthFactor: number;
  neckWidthFactor: number;
  headWidthFactor: number;
  headAngle: number;
  neckAngle: number;
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

    this.graphicType = GraphicType.STRAIGHT_TAIL_ARROW;
    this.graphicName = "直线带尾箭头";
    this.tailWidthFactor = 0.1;
    this.neckWidthFactor = 0.2;
    this.headWidthFactor = 0.25;
    this.headAngle = Math.PI / 8.5;
    this.neckAngle = Math.PI / 13;
    this.minPointsForShape = 2;
    this.hintText = "单击开始绘制";
  }

  /**
   * Add points only on click events
   */
  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
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
    // const [p1, p2] = CoordinateUtils.car3ArrToProjectionPntArr(positions);
    // const len = MathUtils.wholeProjectionDistance([p1, p2]);
    // const tailWidth = len * this.tailWidthFactor;
    // const neckWidth = len * this.neckWidthFactor;
    // const headWidth = len * this.headWidthFactor;
    // const tailLeft = MathUtils.getThirdPoint(
    //   p2,
    //   p1,
    //   Math.PI / 2,
    //   tailWidth,
    //   true
    // );
    // const tailRight = MathUtils.getThirdPoint(
    //   p2,
    //   p1,
    //   Math.PI / 2,
    //   tailWidth,
    //   false
    // );
    // const headLeft = MathUtils.getThirdPoint(
    //   p1,
    //   p2,
    //   Math.PI - this.headAngle,
    //   headWidth,
    //   false
    // );
    // const headRight = MathUtils.getThirdPoint(
    //   p1,
    //   p2,
    //   Math.PI - this.headAngle,
    //   headWidth,
    //   true
    // );
    // const neckLeft = MathUtils.getThirdPoint(
    //   p1,
    //   p2,
    //   Math.PI - this.neckAngle,
    //   neckWidth,
    //   false
    // );
    // const neckRight = MathUtils.getThirdPoint(
    //   p1,
    //   p2,
    //   Math.PI - this.neckAngle,
    //   neckWidth,
    //   true
    // );
    // const points = [
    //   ...tailLeft,
    //   ...neckLeft,
    //   ...headLeft,
    //   ...p2,
    //   ...headRight,
    //   ...neckRight,
    //   ...tailRight,
    //   // ...p1,
    // ];
    // const cartesianPoints = CoordinateUtils.projectionsToCartesian3Arr(points);
    // return cartesianPoints;
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints)
    );
  }
}
