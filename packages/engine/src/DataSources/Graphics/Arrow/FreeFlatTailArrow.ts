import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryStyleMap, ProjectionPoint } from "../../../types";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryUtils } from "../../../Core/GeometryUtils";

export default class FreeFlatTailArrow extends AbstractPolygon {
  graphicType: GraphicType;
  
  minPointsForShape: number;
  headHeightFactor: number;
  headWidthFactor: number;
  neckHeightFactor: number;
  neckWidthFactor: number;
  headTailFactor: number;

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

    this.graphicType = GraphicType.FREE_FLAT_TAIL_ARROW;
    this.graphicName = "自定义平尾箭头";
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.headTailFactor = 0.8;
    this.minPointsForShape = 3;
    this.hintText = "单击开始绘制";
  }

  /**
   * Add points only on click events
   */
  protected addPoint(cartesian: Cartesian3) {
    this.points.set(createGuid(), cartesian);

    if (this.points.size < 2) {
      this.hintText = "单击确定宽度，双击结束绘制";
      this.onMouseMove();
    } else if (this.points.size === 2) {
      this.setGeometryPoints(this.getPoints());
      this.hintText = "单击继续添加点，双击结束绘制";
    } else {
      this.hintText = "单击继续添加点，双击结束绘制";
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    this.setGeometryPoints(tempPoints);
    if (tempPoints.length === 2) {
      this.addTempLine();
    } else {
      this.removeTempLine();
      const geometryPoints = this.generateGeometry(tempPoints);
      this.setGeometryPoints(geometryPoints);
    }
  }

  /**
   * Generate geometric shapes based on key points.
   */
  protected generateGeometry(positions: Cartesian3[]): Cartesian3[] {
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    // let [tailLeft, tailRight] = [projectionPoints[0], projectionPoints[1]];
    // if (
    //   MathUtils.isPathClockwise(
    //     projectionPoints[0],
    //     projectionPoints[1],
    //     projectionPoints[2]
    //   )
    // ) {
    //   tailLeft = projectionPoints[1];
    //   tailRight = projectionPoints[0];
    // }

    // const midTail = MathUtils.mid(tailLeft, tailRight);
    // const bonePnts = [midTail].concat(projectionPoints.slice(2));
    // const headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
    // const [neckLeft, neckRight] = [headPnts[0], headPnts[4]];
    // const tailWidthFactor =
    //   MathUtils.projectionDistance(tailLeft, tailRight) /
    //   MathUtils.wholeProjectionDistance(bonePnts) ** 0.99;
    // const bodyPnts = this.getArrowBodyPoints(
    //   bonePnts,
    //   neckLeft,
    //   neckRight,
    //   tailWidthFactor
    // );
    // const count = bodyPnts.length;
    // let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
    // leftPnts.push(neckLeft);
    // let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
    // rightPnts.push(neckRight);
    // leftPnts = MathUtils.computeQuadraticBSplinePoints(leftPnts);
    // rightPnts = MathUtils.computeQuadraticBSplinePoints(rightPnts);
    // const points = leftPnts.concat(headPnts, rightPnts.reverse());
    // const temp = Array.from<number>([]).concat(...points);

    // const cartesianPoints = CoordinateUtils.projectionsToCartesian3Arr(temp);
    // return cartesianPoints;

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints, {
        isFixedTail: false,
      })
    );
  }

  // protected getArrowHeadPoints(
  //   points: ProjectionPoint[],
  //   tailLeft: ProjectionPoint,
  //   tailRight: ProjectionPoint
  // ) {
  //   try {
  //     let len = MathUtils.wholeProjectionDistance(points) ** 0.99;
  //     let headHeight = len * this.headHeightFactor;
  //     const headPnt = points[points.length - 1];
  //     len = MathUtils.projectionDistance(headPnt, points[points.length - 2]);
  //     const tailWidth = MathUtils.projectionDistance(tailLeft, tailRight);
  //     if (headHeight > tailWidth * this.headTailFactor) {
  //       headHeight = tailWidth * this.headTailFactor;
  //     }
  //     const headWidth = headHeight * this.headWidthFactor;
  //     const neckWidth = headHeight * this.neckWidthFactor;
  //     headHeight = headHeight > len ? len : headHeight;
  //     const neckHeight = headHeight * this.neckHeightFactor;
  //     const headEndPnt = MathUtils.getThirdPoint(
  //       points[points.length - 2],
  //       headPnt,
  //       Math.PI,
  //       headHeight,
  //       true
  //     );
  //     const neckEndPnt = MathUtils.getThirdPoint(
  //       points[points.length - 2],
  //       headPnt,
  //       Math.PI,
  //       neckHeight,
  //       true
  //     );
  //     const headLeft = MathUtils.getThirdPoint(
  //       headPnt,
  //       headEndPnt,
  //       Math.PI / 2,
  //       headWidth,
  //       true
  //     );
  //     const headRight = MathUtils.getThirdPoint(
  //       headPnt,
  //       headEndPnt,
  //       Math.PI / 2,
  //       headWidth,
  //       false
  //     );
  //     const neckLeft = MathUtils.getThirdPoint(
  //       headPnt,
  //       neckEndPnt,
  //       Math.PI / 2,
  //       neckWidth,
  //       true
  //     );
  //     const neckRight = MathUtils.getThirdPoint(
  //       headPnt,
  //       neckEndPnt,
  //       Math.PI / 2,
  //       neckWidth,
  //       false
  //     );
  //     return [neckLeft, headLeft, headPnt, headRight, neckRight];
  //   } catch (e) {
  //     console.log(e);
  //     return [];
  //   }
  // }

  // protected getArrowBodyPoints(
  //   points: ProjectionPoint[],
  //   neckLeft: ProjectionPoint,
  //   neckRight: ProjectionPoint,
  //   tailWidthFactor: number
  // ) {
  //   const allLen = MathUtils.wholeProjectionDistance(points);
  //   const len = allLen ** 0.99;
  //   const tailWidth = len * tailWidthFactor;
  //   const neckWidth = MathUtils.projectionDistance(neckLeft, neckRight);
  //   const widthDif = (tailWidth - neckWidth) / 2;
  //   let [tempLen, leftBodyPnts, rightBodyPnts]: [
  //     number,
  //     ProjectionPoint[],
  //     ProjectionPoint[]
  //   ] = [0, [], []];

  //   for (let i = 1; i < points.length - 1; i++) {
  //     const angle =
  //       MathUtils.getAngleOfThreePoints(
  //         points[i - 1],
  //         points[i],
  //         points[i + 1]
  //       ) / 2;
  //     tempLen += MathUtils.projectionDistance(points[i - 1], points[i]);
  //     const w =
  //       (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle);
  //     const left = MathUtils.getThirdPoint(
  //       points[i - 1],
  //       points[i],
  //       angle,
  //       w,
  //       false
  //     );
  //     const right = MathUtils.getThirdPoint(
  //       points[i - 1],
  //       points[i],
  //       Math.PI - angle,
  //       w,
  //       true
  //     );
  //     leftBodyPnts.push(left);
  //     rightBodyPnts.push(right);
  //   }
  //   return leftBodyPnts.concat(rightBodyPnts);
  // }

  beginDraw(
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void {
    this.setState("drawing");

    this.onLeftClick();
    this.onLeftDoubleClick(callback);
  }
}
