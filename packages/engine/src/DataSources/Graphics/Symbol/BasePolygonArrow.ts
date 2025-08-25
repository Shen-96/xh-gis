import { Cartesian3, createGuid } from "cesium";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import { GeometryStyleMap, Point2Deg, Point3DegList } from "../../../types";
import { GeometryType, GraphicType, SymbolType } from "../../../enum";
import { GeometryUtils } from "../../../Core/GeometryUtils";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import { ISymbol } from "../Abstract/ISymbol";
import { GeometryDrawEventCallbackMap } from "../types";

const ArrowParams = {
  [SymbolType.战役突击方向]: {
    headAngle: (Math.PI * 2) / 3,
    neckAngle: Math.PI / 6,
    tailWidthFactor: 1.5,
  },
  [SymbolType.战役反突击方向]: {
    headAngle: (Math.PI * 2) / 3,
    neckAngle: Math.PI / 6,
    tailWidthFactor: 1.5,
  },
  [SymbolType.联合火力打击方向]: {
    headAngle: (Math.PI * 2) / 3,
    neckAngle: Math.PI / 6,
    tailWidthFactor: 1,
  },
  [SymbolType.精确火力打击方向]: {
    headAngle: Math.PI / 3,
    neckAngle: Math.PI / 3,
    tailWidthFactor: 1,
  },
  [SymbolType.进攻方向]: {
    headAngle: Math.PI / 6,
    neckAngle: Math.PI / 6,
    tailWidthFactor: 1.5,
  },
  [SymbolType["进攻方向（直线/折线）"]]: {
    headAngle: Math.PI / 3,
    neckAngle: Math.PI / 3,
    tailWidthFactor: 1,
  },
  // [SymbolType.本级地面作战主攻方向]: {
  //   headAngle: Math.PI / 6,
  //   neckAngle: Math.PI / 6,
  //   tailWidthFactor: 1.5,
  // },
  [SymbolType.反冲击方向]: {
    headAngle: Math.PI / 6,
    neckAngle: Math.PI / 6,
    tailWidthFactor: 1.5,
  },
};

export default abstract class BasePolygonArrow
  extends AbstractPolygon
  implements ISymbol
{
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

    this.hintText = "单击开始绘制";
  }

  graphicType = GraphicType.SYMBOL;
  abstract symbolType: SymbolType;
  minPointsForShape = 2;

  beginDraw(
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void {
    this.setState("drawing");

    this.onLeftClick();
    this.onLeftDoubleClick(callback);
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

    const points = CoordinateUtils.car3ArrToPoint3DegArr(positions);

    return CoordinateUtils.point3DegArrToCar3Arr(
      BasePolygonArrow.generateGeometry(points, this.symbolType)
    );
  }

  static generateGeometry(
    points: Point3DegList,
    symbolType: SymbolType
  ): Point2Deg[] {
    const projectionPoints = CoordinateUtils.point3DegArrToProjPointArr(points);

    return CoordinateUtils.projPntArr2PointArr(
      // @ts-ignore
      GeometryUtils.generateTailArrow(projectionPoints, ArrowParams[symbolType])
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
