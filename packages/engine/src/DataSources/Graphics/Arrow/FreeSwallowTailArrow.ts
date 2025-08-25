/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:15
 */
import { Cartesian3 } from "cesium";
import AbstractCore from "../../../Core/AbstractCore";
import FreeFlatTailArrow from "./FreeFlatTailArrow";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap } from "../../../types";
import { GeometryUtils } from "../../../Core/GeometryUtils";

export default class FreeSwallowTailArrow extends FreeFlatTailArrow {
  tailWidthFactor: number;
  swallowTailFactor: number;
  swallowTailPnt: [number, number];

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

    this.graphicType = GraphicType.FREE_SWALLOW_TAIL_ARROW;
    this.graphicName = "自定义燕尾箭头";
    this.tailWidthFactor = 0.1;
    this.swallowTailFactor = 1;
    this.swallowTailPnt = [0, 0];
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
    // const tailWidth = MathUtils.projectionDistance(tailLeft, tailRight);
    // const allLen = MathUtils.wholeProjectionDistance(bonePnts) ** 0.99;
    // const len = allLen * this.tailWidthFactor * this.swallowTailFactor;
    // this.swallowTailPnt = MathUtils.getThirdPoint(
    //   bonePnts[1],
    //   bonePnts[0],
    //   Math.PI,
    //   len,
    //   true
    // );
    // const factor = tailWidth / allLen;
    // const bodyPnts = this.getArrowBodyPoints(
    //   bonePnts,
    //   neckLeft,
    //   neckRight,
    //   factor
    // );
    // const count = bodyPnts.length;
    // let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
    // leftPnts.push(neckLeft);
    // let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
    // rightPnts.push(neckRight);
    // leftPnts = MathUtils.computeQuadraticBSplinePoints(leftPnts);
    // rightPnts = MathUtils.computeQuadraticBSplinePoints(rightPnts);
    // const points = leftPnts.concat(headPnts, rightPnts.reverse(), [
    //   this.swallowTailPnt,
    //   leftPnts[0],
    // ]);
    // const temp = Array.from<number>([]).concat(...points);
    // const cartesianPoints = CoordinateUtils.projectionsToCartesian3Arr(temp);
    // return cartesianPoints;

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints, {
        isFixedTail: false,
        isSwallowTail: true,
      })
    );
  }
}
