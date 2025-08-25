/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-05-22 15:27:39
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-07-21 17:11:30
 */
import { Math as CesiumMath } from "cesium";
import MathUtils from "./MathUtils";
import { ProjectionPoint } from "../types";

export class GeometryUtils {
  static generateStraightArrow(
    start: ProjectionPoint,
    end: ProjectionPoint,
    params = {
      arrowAngle: Math.PI / 3,
      arrowLengthFactor: 0.1,
      maxArrowLength: 150000,
    }
  ): ProjectionPoint[] {
    const { arrowAngle, arrowLengthFactor, maxArrowLength } = params;

    const distance = MathUtils.projectionDistance(start, end);
    let len = distance * arrowLengthFactor;
    len = len > maxArrowLength ? maxArrowLength : len;
    const radians = Math.PI - arrowAngle / 2;
    const leftPnt = MathUtils.getThirdPoint(start, end, radians, len, false);
    const rightPnt = MathUtils.getThirdPoint(start, end, radians, len, true);

    return [start, end, leftPnt, end, rightPnt];
  }

  static generateCurveArrow(
    projectionPoints: ProjectionPoint[],
    params = {
      arrowAngle: Math.PI / 3,
      arrowLengthFactor: 0.1,
      maxArrowLength: 150000,
      curveSmoothnessFactor: 0.3,
    }
  ): ProjectionPoint[] {
    const {
      arrowAngle,
      arrowLengthFactor,
      maxArrowLength,
      curveSmoothnessFactor,
    } = params;

    const curvePoints = MathUtils.getCurvePoints(
      curveSmoothnessFactor,
      projectionPoints
    );
    const pnt1 = projectionPoints[projectionPoints.length - 2];
    const pnt2 = projectionPoints[projectionPoints.length - 1];

    const distance = MathUtils.wholeProjectionDistance(projectionPoints);
    let len = distance * arrowLengthFactor;
    len = len > maxArrowLength ? maxArrowLength : len;
    const radians = Math.PI - arrowAngle / 2;
    const leftPnt = MathUtils.getThirdPoint(pnt1, pnt2, radians, len, false);
    const rightPnt = MathUtils.getThirdPoint(pnt1, pnt2, radians, len, true);

    return [...curvePoints, leftPnt, pnt2, rightPnt];
  }

  static generateTailArrow(
    projectionPoints: ProjectionPoint[],
    params: Partial<{
      headAngle: number;
      neckAngle: number;
      headLengthFactor: number;
      neckLengthFactor: number;
      maxArrowLength: number;
      tailWidthFactor: number;
      isFixedTail: boolean;
      isSwallowTail: boolean;
      swallowTailFactor: number;
    }> = {}
  ): ProjectionPoint[] {
    const {
      headAngle,
      neckAngle,
      headLengthFactor,
      neckLengthFactor,
      maxArrowLength,
      tailWidthFactor,
      isFixedTail,
      isSwallowTail,
      swallowTailFactor,
    } = {
      headAngle: Math.PI / 6,
      neckAngle: Math.PI / 6,
      headLengthFactor: 0.25,
      neckLengthFactor: 0.5,
      //   maxArrowLength: 1500000,
      tailWidthFactor: 2,
      isFixedTail: true,
      isSwallowTail: false,
      swallowTailFactor: 1,
      ...params,
    };

    if (isFixedTail) {
      const headPnts = this.getArrowHeadPoints(
        projectionPoints,
        headAngle,
        neckAngle,
        headLengthFactor,
        neckLengthFactor,
        maxArrowLength
      );
      const neckLeft = headPnts[0];
      const neckRight = headPnts[4];
      const neckWidth = MathUtils.projectionDistance(neckLeft, neckRight);
      const tailWidth = neckWidth * tailWidthFactor;

      const tailPnts = this.getTailPoints(
          projectionPoints,
          tailWidth / 2,
          isSwallowTail,
          swallowTailFactor
        ),
        leftTailPnt = tailPnts[0],
        rightTailPnt = tailPnts[isSwallowTail ? 2 : 1];

      const bodyPnts = this.getArrowBodyPoints(
        projectionPoints,
        neckWidth,
        tailWidth
      );
      const count = bodyPnts.length;
      let leftPnts = [leftTailPnt].concat(bodyPnts.slice(0, count / 2));
      leftPnts.push(neckLeft);
      let rightPnts = [rightTailPnt].concat(bodyPnts.slice(count / 2, count));
      rightPnts.push(neckRight);
      leftPnts = MathUtils.computeQuadraticBSplinePoints(leftPnts);
      rightPnts = MathUtils.computeQuadraticBSplinePoints(rightPnts);

      const points = leftPnts.concat(
        headPnts,
        rightPnts.reverse(),
        isSwallowTail ? [tailPnts[1], leftPnts[0]] : []
      );

      return points;
    } else {
      let [tailLeftPnt, tailRightPnt] = [
        projectionPoints[0],
        projectionPoints[1],
      ];
      if (
        MathUtils.isPathClockwise(
          projectionPoints[0],
          projectionPoints[1],
          projectionPoints[2]
        )
      ) {
        tailLeftPnt = projectionPoints[1];
        tailRightPnt = projectionPoints[0];
      }

      const tailWidth =
        MathUtils.projectionDistance(tailLeftPnt, tailRightPnt) *
        tailWidthFactor;
      const midTail = MathUtils.mid(tailLeftPnt, tailRightPnt);
      const bonePnts = [midTail].concat(projectionPoints.slice(2));
      const headPnts = this.getArrowHeadPoints(
        bonePnts,
        headAngle,
        neckAngle,
        headLengthFactor,
        neckLengthFactor,
        maxArrowLength
      );
      const [neckLeft, headPnt, neckRight] = [
        headPnts[0],
        headPnts[2],
        headPnts[4],
      ];
      const neckWidth = MathUtils.projectionDistance(neckLeft, neckRight);
      const bodyPnts = this.getArrowBodyPoints(bonePnts, neckWidth, tailWidth);
      const count = bodyPnts.length;
      let leftPnts = [tailLeftPnt].concat(bodyPnts.slice(0, count / 2));
      leftPnts.push(neckLeft);
      let rightPnts = [tailRightPnt].concat(bodyPnts.slice(count / 2, count));
      rightPnts.push(neckRight);
      leftPnts = MathUtils.computeQuadraticBSplinePoints(leftPnts);
      rightPnts = MathUtils.computeQuadraticBSplinePoints(rightPnts);

      const points = leftPnts.concat(headPnts, rightPnts.reverse());
      if (isSwallowTail) {
        // const allLen = MathUtils.wholeProjectionDistance(bonePnts) ** 0.99;
        const maxLength = (tailWidth / 2) * swallowTailFactor;
        const dynamicLength =
          MathUtils.projectionDistance(midTail, headPnt) / 2;
        const swallowTailLength =
          dynamicLength < maxLength ? dynamicLength : maxLength;

        const swallowTailPnt = MathUtils.getThirdPoint(
          bonePnts[1],
          bonePnts[0],
          Math.PI,
          swallowTailLength,
          true
        );

        return points.concat([swallowTailPnt, leftPnts[0]]);
      }

      return points;
    }
  }

  private static getTailPoints(
    points: ProjectionPoint[],
    halfTailWidth: number,
    isSwallowTail: boolean,
    swallowTailFactor = 1
  ): ProjectionPoint[] {
    // const allLen = MathUtils.wholeProjectionDistance(points) * 0.99;
    const tailLeft = MathUtils.getThirdPoint(
      points[1],
      points[0],
      Math.PI / 2,
      halfTailWidth,
      true
    );
    const tailRight = MathUtils.getThirdPoint(
      points[1],
      points[0],
      Math.PI / 2,
      halfTailWidth,
      false
    );

    if (isSwallowTail) {
      const len = halfTailWidth * swallowTailFactor;
      const swallowTailPnt = MathUtils.getThirdPoint(
        points[1],
        points[0],
        Math.PI,
        len,
        true
      );

      return [tailLeft, swallowTailPnt, tailRight];
    }

    return [tailLeft, tailRight];
  }

  private static getArrowHeadPoints(
    points: ProjectionPoint[],
    headAngle: number,
    neckAngle: number,
    headLengthFactor: number,
    neckLengthFactor: number,
    maxArrowLength?: number
  ) {
    try {
      const distance = MathUtils.wholeProjectionDistance(points) ** 0.99;
      const headPnt = points[points.length - 1];
      const prevHeadPnt = points[points.length - 2];

      let headLength = distance * headLengthFactor;
      maxArrowLength &&
        (headLength =
          headLength > maxArrowLength ? maxArrowLength : headLength);

      const neckLength =
        (headLength / Math.sin(Math.PI - (neckAngle + headAngle / 2))) *
        Math.sin(headAngle / 2) *
        neckLengthFactor;

      const headRadians = Math.PI - headAngle / 2;
      const headLeft = MathUtils.getThirdPoint(
        prevHeadPnt,
        headPnt,
        headRadians,
        headLength,
        false
      );
      const headRight = MathUtils.getThirdPoint(
        prevHeadPnt,
        headPnt,
        headRadians,
        headLength,
        true
      );

      const neckRadians = Math.PI - neckAngle;
      const neckLeft = MathUtils.getThirdPoint(
        headPnt,
        headLeft,
        neckRadians,
        neckLength,
        false
      );
      const neckRight = MathUtils.getThirdPoint(
        headPnt,
        headRight,
        neckRadians,
        neckLength,
        true
      );

      return [neckLeft, headLeft, headPnt, headRight, neckRight];
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  private static getArrowBodyPoints(
    points: ProjectionPoint[],
    neckWidth: number,
    tailWidth: number
  ) {
    const allLen = MathUtils.wholeProjectionDistance(points);
    // const len = allLen ** 0.99;
    // const tailWidth = len * tailWidthFactor;
    // const neckWidth = MathUtils.projectionDistance(neckLeft, neckRight);

    const widthDif = (tailWidth - neckWidth) / 2;
    let tempLen = 0;
    const [leftBodyPnts, rightBodyPnts]: [
      ProjectionPoint[],
      ProjectionPoint[]
    ] = [[], []];

    for (let i = 1; i < points.length - 1; i++) {
      const angle =
        MathUtils.getAngleOfThreePoints(
          points[i - 1],
          points[i],
          points[i + 1]
        ) / 2;
      tempLen += MathUtils.projectionDistance(points[i - 1], points[i]);
      const w =
        (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle);
      const left = MathUtils.getThirdPoint(
        points[i - 1],
        points[i],
        angle,
        w,
        false
      );
      const right = MathUtils.getThirdPoint(
        points[i - 1],
        points[i],
        Math.PI - angle,
        w,
        true
      );
      leftBodyPnts.push(left);
      rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
  }

  /**
   * @descripttion: 圆
   * @param {ProjectionPoint} center
   * @param {number} radius
   * @return {*}
   * @author: EV-申小虎
   */
  static generateCirclePoints(center: ProjectionPoint, radius: number) {
    const pnts: Array<ProjectionPoint> = [];

    new Array(360).fill(0).forEach((_, i) => {
      const radians = CesiumMath.toRadians(i);
      const x = center[0] + radius * Math.cos(radians);
      const y = center[1] + radius * Math.sin(radians);
      pnts.push([x, y]);
    });

    return pnts;
  }
}
