/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:03
 */
import { Cartesian3 } from "cesium";
import FixedFlatTailArrow from "./FixedFlatTailArrow";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryStyleMap, ProjectionPoint } from "../../../types";
import { GeometryType, GraphicType } from "../../../enum";;
import GeometryUtils from "../../../Core/GeometryUtils";

export default class FixedSwallowTailArrow extends FixedFlatTailArrow {
  headHeightFactor: number;
  headWidthFactor: number;
  neckHeightFactor: number;
  neckWidthFactor: number;
  tailWidthFactor: number;
  swallowTailFactor: number;

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

    this.graphicType = GraphicType.FIXED_SWALLOW_TAIL_ARROW;
    this.graphicName = "固定燕尾箭头";
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.swallowTailFactor = 1;
    this.minPointsForShape = 2;
  }

  /**
   * Generate geometric shapes based on key points.
   */
  protected generateGeometry(positions: Cartesian3[]): Cartesian3[] {
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    // const tailPnts = this.getTailPoints(projectionPoints);
    // const headPnts = this.getArrowHeadPoints(
    //   projectionPoints,
    //   tailPnts[0],
    //   tailPnts[2]
    // );
    // const neckLeft = headPnts[0];
    // const neckRight = headPnts[4];
    // const bodyPnts = this.getArrowBodyPoints(
    //   projectionPoints,
    //   neckLeft,
    //   neckRight,
    //   this.tailWidthFactor
    // );
    // const count = bodyPnts.length;
    // let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
    // leftPnts.push(neckLeft);
    // let rightPnts = [tailPnts[2]].concat(bodyPnts.slice(count / 2, count));
    // rightPnts.push(neckRight);
    // leftPnts = MathUtils.computeQuadraticBSplinePoints(leftPnts);
    // rightPnts = MathUtils.computeQuadraticBSplinePoints(rightPnts);

    // const points = leftPnts.concat(headPnts, rightPnts.reverse(), [
    //   tailPnts[1],
    //   leftPnts[0],
    // ]);
    // const temp = Array.from<number>([]).concat(...points);
    // const cartesianPoints = CoordinateUtils.projectionsToCartesian3Arr(temp);
    // return cartesianPoints;

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints, {
        isSwallowTail: true,
      })
    );
  }

  // protected getTailPoints(points: ProjectionPoint[]) {
  //   const allLen = MathUtils.wholeProjectionDistance(points) ** 0.99;
  //   const tailWidth = allLen * this.tailWidthFactor;
  //   const tailLeft = MathUtils.getThirdPoint(
  //     points[1],
  //     points[0],
  //     Math.PI / 2,
  //     tailWidth,
  //     true
  //   );
  //   const tailRight = MathUtils.getThirdPoint(
  //     points[1],
  //     points[0],
  //     Math.PI / 2,
  //     tailWidth,
  //     false
  //   );
  //   const len = tailWidth * this.swallowTailFactor;
  //   const swallowTailPnt = MathUtils.getThirdPoint(
  //     points[1],
  //     points[0],
  //     Math.PI,
  //     len,
  //     true
  //   );
  //   return [tailLeft, swallowTailPnt, tailRight];
  // }
}
