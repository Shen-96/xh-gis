/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:26
 */
import { Cartesian3 } from "cesium";
import StraightTailArrow from "./StraightTailArrow";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap } from "../../../types";
import { GeometryUtils } from "../../../Core/GeometryUtils";

export default class StraightTailRightArrow extends StraightTailArrow {
  headAngle: number;
  neckAngle: number;
  tailWidthFactor: number;

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

    this.graphicType = GraphicType.STRAIGHT_TAIL_RIGHT_ARROW;
    this.graphicName = "直线带尾直角箭头";
    this.headAngle = Math.PI / 3;
    this.neckAngle = Math.PI / 3;
    this.tailWidthFactor = 1;
    this.minPointsForShape = 2;
  }

  protected generateGeometry(positions: Cartesian3[]) {
    // const [p1, p2] = CoordinateUtils.car3ArrToProjectionPntArr(positions);
    // const len = MathUtils.wholeProjectionDistance([p1, p2]) * 1.5;
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
    //   Math.PI - this.headAngle / 2,
    //   headWidth,
    //   false
    // );
    // const headRight = MathUtils.getThirdPoint(
    //   p1,
    //   p2,
    //   Math.PI - this.headAngle / 2,
    //   headWidth,
    //   true
    // );
    // const neckLength =
    //   (MathUtils.projectionDistance(headLeft, headRight) - tailWidth * 2) / 2;

    // const neckLeft = MathUtils.getThirdPoint(
    //   headRight,
    //   headLeft,
    //   Math.PI,
    //   neckLength,
    //   false
    // );
    // const neckRight = MathUtils.getThirdPoint(
    //   headLeft,
    //   headRight,
    //   Math.PI,
    //   neckLength,
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
      GeometryUtils.generateTailArrow(projectionPoints, {
        neckAngle: this.neckAngle,
        headAngle: this.headAngle,
        tailWidthFactor: this.tailWidthFactor,
      })
    );
  }
}
