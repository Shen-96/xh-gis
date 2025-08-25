import { Cartesian3, createGuid } from "cesium";
import FreeFlatTailArrow from "./FreeFlatTailArrow";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import {
  GeometryStyleMap,
  Point2Deg,
  Point3DegList,
} from "../../../types";
import { GeometryType, GraphicType } from "../../../enum";
import { GeometryUtils } from "../../../Core/GeometryUtils";

export default class FixedFlatTailArrow extends FreeFlatTailArrow {
  graphicType: GraphicType;
  headHeightFactor: number;
  headWidthFactor: number;
  neckHeightFactor: number;
  neckWidthFactor: number;
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

    this.graphicType = GraphicType.FIXED_FLAT_TAIL_ARROW;
    this.graphicName = "固定平尾箭头";
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.minPointsForShape = 2;
    this.hintText = "单击开始绘制";
  }

  /**
   * Add points only on click events
   */
  protected addPoint(cartesian: Cartesian3) {
    this.points.set(createGuid(), cartesian);

    this.hintText = "单击继续添加点，双击结束绘制";
    if (this.points.size < 2) {
      this.onMouseMove();
    } else if (this.points.size > 2) {
      // this.lineEntity && this.viewer.entities.remove(this.lineEntity);
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    this.setGeometryPoints(tempPoints);
    if (tempPoints.length < 2) {
      return;
    } else {
      const geometryPoints = this.generateGeometry(tempPoints);
      this.setGeometryPoints(geometryPoints);
    }
  }

  /**
   * Generate geometric shapes based on key points.
   */
  protected generateGeometry(positions: Cartesian3[]): Cartesian3[] {
    // const projectionPoints =
    //   CoordinateUtils.car3ArrToProjectionPntArr(positions);
    // const tailPnts = this.getTailPoints(projectionPoints);
    // const headPnts = this.getArrowHeadPoints(
    //   projectionPoints,
    //   tailPnts[0],
    //   tailPnts[1]
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
    // let rightPnts = [tailPnts[1]].concat(bodyPnts.slice(count / 2, count));
    // rightPnts.push(neckRight);
    // leftPnts = MathUtils.computeQuadraticBSplinePoints(leftPnts);
    // rightPnts = MathUtils.computeQuadraticBSplinePoints(rightPnts);
    // const points = leftPnts.concat(headPnts, rightPnts.reverse());
    // const temp = Array.from<number>([]).concat(...points);
    // const cartesianPoints = CoordinateUtils.projectionsToCartesian3Arr(temp);
    // return cartesianPoints;

    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints)
    );
  }

  static generateGeometry(points: Point3DegList): Point2Deg[] {
    const projectionPoints = CoordinateUtils.point3DegArrToProjPointArr(points);

    return CoordinateUtils.projPntArr2PointArr(
      GeometryUtils.generateTailArrow(projectionPoints)
    );
  }

  // protected getTailPoints(points: ProjectionPoint[]): ProjectionPoint[] {
  //   const allLen = MathUtils.wholeProjectionDistance(points) * 0.99;
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
  //   return [tailLeft, tailRight];
  // }
}
