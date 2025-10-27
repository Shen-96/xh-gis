import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap, GrowthAnimationOpts } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { GeometryStyleMap, ProjectionPoint, Point3Deg } from "../../../types";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryType, GraphicType } from "../../../enum";
import registry from "../../../Core/GraphicRegistry";

export default class DoubleArrow extends AbstractPolygon {
  graphicType: GraphicType;

  minPointsForShape: number;
  protected arrowLengthScale: number = 5;
  protected maxArrowLength: number = 2;
  protected neckWidthFactor: number;
  protected headWidthFactor: number;
  protected headHeightFactor: number;
  protected neckHeightFactor: number;
  protected connPoint: ProjectionPoint;
  protected tempPoint4: ProjectionPoint;
  protected llBodyPnts: ProjectionPoint[] = [];
  protected rrBodyPnts: ProjectionPoint[] = [];
  protected curveControlPointLeft: Cartesian3 = new Cartesian3();
  protected curveControlPointRight: Cartesian3 = new Cartesian3();
  protected isClockWise: boolean = false;

  constructor({
    core,
    style,
    positions,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.POLYGON];
    positions?: Point3Deg[];
  }) {
    super({
      core,
      style,
      positions,
    });

    this.graphicType = GraphicType.DOUBLE_ARROW;
    this.graphicName = "平尾双箭头";
    this.headHeightFactor = 0.25;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.connPoint = [0, 0];
    this.tempPoint4 = [0, 0];
    this.minPointsForShape = 4;
    this.hintText = "单击开始绘制";
  }

  /**
   * Add points only on click events
   */
  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ) {
    this.points.set(createGuid(), cartesian);

    if (this.points.size < 2) {
      this.hintText = "单击确定宽度";
      this.onMouseMove();
    } else if (this.points.size === 2) {
      this.hintText = "单击确定第一个箭头的终点";
      this.setGeometryPoints(this.getPoints());
    } else if (this.points.size === 3) {
      this.hintText = "单击确定第二个箭头的终点";
    } else {
      this.finishDrawing(callback);

      // // 辅助查看插值控制点位置
      // this.viewer.entities.add({
      // 	position: this.curveControlPointLeft,
      // 	point: {
      // 		pixelSize: 10,
      // 		heightReference: HeightReference.CLAMP_TO_GROUND,
      // 		color: Color.RED,
      // 	},
      // });
      // this.viewer.entities.add({
      // 	position: this.curveControlPointRight,
      // 	point: {
      // 		pixelSize: 10,
      // 		heightReference: HeightReference.CLAMP_TO_GROUND,
      // 		color: Color.RED,
      // 	},
      // });
    }
  }

  finishDrawing(callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]) {
    this.curveControlPointLeft = CoordinateUtils.projPnt2Cartesian3(
      this.llBodyPnts[2]
    );
    this.curveControlPointRight = CoordinateUtils.projPnt2Cartesian3(
      this.rrBodyPnts[1]
    );
    super.finishDrawing(callback);
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    this.setGeometryPoints(tempPoints);
    if (tempPoints.length === 2) {
      this.addTempLine();
    } else if (tempPoints.length > 2) {
      this.removeTempLine();
      const geometryPoints = this.generateGeometry(tempPoints);
      this.setGeometryPoints(geometryPoints);
    }
  }

  /**
   * Generate geometric shapes based on key points.
   */
  protected generateGeometry(positions: Cartesian3[]) {
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);
    const [pnt1, pnt2, pnt3] = [
      projectionPoints[0],
      projectionPoints[1],
      projectionPoints[2],
    ];
    const count = projectionPoints.length;
    if (count === 3) {
      this.tempPoint4 = this.getTempPoint4(pnt1, pnt2, pnt3);
      this.connPoint = MathUtils.mid(pnt1, pnt2);
    } else if (count === 4) {
      this.tempPoint4 = projectionPoints[3];
      this.connPoint = MathUtils.mid(pnt1, pnt2);
    } else {
      this.tempPoint4 = projectionPoints[3];
      this.connPoint = projectionPoints[4];
    }
    let leftArrowPnts: ProjectionPoint[];
    let rightArrowPnts;
    this.isClockWise = MathUtils.isPathClockwise(pnt1, pnt2, pnt3);
    if (this.isClockWise) {
      leftArrowPnts = this.getArrowPoints(
        pnt1,
        this.connPoint,
        this.tempPoint4,
        true
      );
      rightArrowPnts = this.getArrowPoints(this.connPoint, pnt2, pnt3, false);
    } else {
      leftArrowPnts = this.getArrowPoints(pnt2, this.connPoint, pnt3, true);
      rightArrowPnts = this.getArrowPoints(
        this.connPoint,
        pnt1,
        this.tempPoint4,
        false
      );
    }
    const m = leftArrowPnts.length;
    const t = (m - 5) / 2;
    const llBodyPnts = leftArrowPnts.slice(0, t);
    const lArrowPnts = leftArrowPnts.slice(t, t + 5);
    let lrBodyPnts = leftArrowPnts.slice(t + 5, m);
    this.llBodyPnts = llBodyPnts;
    let rlBodyPnts = rightArrowPnts.slice(0, t);
    const rArrowPnts = rightArrowPnts.slice(t, t + 5);
    const rrBodyPnts = rightArrowPnts.slice(t + 5, m);
    this.rrBodyPnts = rrBodyPnts;
    rlBodyPnts = MathUtils.getQuadricBezierPoints(rlBodyPnts);
    const bodyPnts = MathUtils.getQuadricBezierPoints(
      rrBodyPnts.concat(llBodyPnts.slice(1))
    );
    lrBodyPnts = MathUtils.getQuadricBezierPoints(lrBodyPnts);
    const pnts = rlBodyPnts.concat(
      rArrowPnts,
      bodyPnts,
      lArrowPnts,
      lrBodyPnts
    );
    const temp = Array.from<number>([]).concat(...pnts);
    const cartesianPoints = CoordinateUtils.projectionsToCartesian3Arr(temp);
    return cartesianPoints;
  }

  private getTempPoint4(
    linePnt1: ProjectionPoint,
    linePnt2: ProjectionPoint,
    point: ProjectionPoint
  ): ProjectionPoint {
    const midPnt = MathUtils.mid(linePnt1, linePnt2);
    const len = MathUtils.projectionDistance(midPnt, point);
    const angle = MathUtils.getAngleOfThreePoints(linePnt1, midPnt, point);
    let symPnt = [0, 0] as ProjectionPoint;
    let distance1;
    let distance2;
    let mid;
    if (angle < Math.PI / 2) {
      distance1 = len * Math.sin(angle);
      distance2 = len * Math.cos(angle);
      mid = MathUtils.getThirdPoint(
        linePnt1,
        midPnt,
        Math.PI / 2,
        distance1,
        true
      );
      symPnt = MathUtils.getThirdPoint(
        midPnt,
        mid,
        Math.PI / 2,
        distance2,
        false
      );
    } else if (angle >= Math.PI / 2 && angle < Math.PI) {
      distance1 = len * Math.sin(Math.PI - angle);
      distance2 = len * Math.cos(Math.PI - angle);
      mid = MathUtils.getThirdPoint(
        linePnt1,
        midPnt,
        Math.PI / 2,
        distance1,
        true
      );
      symPnt = MathUtils.getThirdPoint(
        midPnt,
        mid,
        Math.PI / 2,
        distance2,
        true
      );
    } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
      distance1 = len * Math.sin(angle - Math.PI);
      distance2 = len * Math.cos(angle - Math.PI);
      mid = MathUtils.getThirdPoint(
        linePnt1,
        midPnt,
        Math.PI / 2,
        distance1,
        false
      );
      symPnt = MathUtils.getThirdPoint(
        midPnt,
        mid,
        Math.PI / 2,
        distance2,
        false
      );
    } else {
      distance1 = len * Math.sin(Math.PI * 2 - angle);
      distance2 = len * Math.cos(Math.PI * 2 - angle);
      mid = MathUtils.getThirdPoint(
        linePnt1,
        midPnt,
        Math.PI / 2,
        distance1,
        false
      );
      symPnt = MathUtils.getThirdPoint(
        midPnt,
        mid,
        Math.PI / 2,
        distance2,
        true
      );
    }
    return symPnt;
  }

  private getArrowPoints(
    pnt1: ProjectionPoint,
    pnt2: ProjectionPoint,
    pnt3: ProjectionPoint,
    clockWise: boolean
  ): ProjectionPoint[] {
    const midPnt = MathUtils.mid(pnt1, pnt2);
    const len = MathUtils.projectionDistance(midPnt, pnt3);
    let midPnt1 = MathUtils.getThirdPoint(
      pnt3,
      midPnt,
      Math.PI,
      len * 0.3,
      true
    );
    let midPnt2 = MathUtils.getThirdPoint(
      pnt3,
      midPnt,
      Math.PI,
      len * 0.5,
      true
    );
    midPnt1 = MathUtils.getThirdPoint(
      midPnt,
      midPnt1,
      Math.PI / 2,
      len / 5,
      clockWise
    );

    midPnt2 = MathUtils.getThirdPoint(
      midPnt,
      midPnt2,
      Math.PI / 2,
      len / 4,
      clockWise
    );
    const points = [midPnt, midPnt1, midPnt2, pnt3];
    const arrowPnts = this.getArrowHeadPoints(points);
    if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
      const neckLeftPoint: ProjectionPoint = arrowPnts[0];
      const neckRightPoint: ProjectionPoint = arrowPnts[4];
      const tailWidthFactor =
        MathUtils.projectionDistance(pnt1, pnt2) /
        MathUtils.wholeProjectionDistance(points) ** 0.99 /
        2;
      const bodyPnts = this.getArrowBodyPoints(
        points,
        neckLeftPoint,
        neckRightPoint,
        tailWidthFactor
      );
      if (bodyPnts) {
        const n = bodyPnts.length;
        let lPoints = bodyPnts.slice(0, n / 2);
        let rPoints = bodyPnts.slice(n / 2, n);
        lPoints.push(neckLeftPoint);
        rPoints.push(neckRightPoint);
        lPoints = lPoints.reverse();
        lPoints.push(pnt2);
        rPoints = rPoints.reverse();
        rPoints.push(pnt1);
        return lPoints.reverse().concat(arrowPnts, rPoints);
      } else {
        return points;
      }
    } else {
      throw new Error("Interpolation Error");
    }
  }

  private getArrowBodyPoints(
    points: ProjectionPoint[],
    neckLeft: ProjectionPoint,
    neckRight: ProjectionPoint,
    tailWidthFactor: number
  ): ProjectionPoint[] {
    const allLen = MathUtils.wholeProjectionDistance(points);
    const len = allLen ** 0.99;
    const tailWidth = len * tailWidthFactor;
    const neckWidth = MathUtils.projectionDistance(neckLeft, neckRight);
    const widthDif = (tailWidth - neckWidth) / 2;
    let tempLen: number = 0;
    const leftBodyPnts: ProjectionPoint[] = [];
    const rightBodyPnts: ProjectionPoint[] = [];
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

  private getArrowHeadPoints(points: ProjectionPoint[]): ProjectionPoint[] {
    const len = MathUtils.wholeProjectionDistance(points);
    const headHeight = len * this.headHeightFactor;
    const headPnt = points[points.length - 1];
    const headWidth = headHeight * this.headWidthFactor;
    const neckWidth = headHeight * this.neckWidthFactor;
    const neckHeight = headHeight * this.neckHeightFactor;
    const headEndPnt = MathUtils.getThirdPoint(
      points[points.length - 2],
      headPnt,
      Math.PI,
      headHeight,
      true
    );
    const neckEndPnt = MathUtils.getThirdPoint(
      points[points.length - 2],
      headPnt,
      Math.PI,
      neckHeight,
      true
    );
    const headLeft = MathUtils.getThirdPoint(
      headPnt,
      headEndPnt,
      Math.PI / 2,
      headWidth,
      true
    );
    const headRight = MathUtils.getThirdPoint(
      headPnt,
      headEndPnt,
      Math.PI / 2,
      headWidth,
      false
    );
    const neckLeft = MathUtils.getThirdPoint(
      headPnt,
      neckEndPnt,
      Math.PI / 2,
      neckWidth,
      true
    );
    const neckRight = MathUtils.getThirdPoint(
      headPnt,
      neckEndPnt,
      Math.PI / 2,
      neckWidth,
      false
    );
    return [neckLeft, headLeft, headPnt, headRight, neckRight];
  }

  private getBezierControlPointforGrowthAnimation() {
    return this.isClockWise
      ? {
          left: this.curveControlPointLeft,
          right: this.curveControlPointRight,
        }
      : {
          right: this.curveControlPointLeft,
          left: this.curveControlPointRight,
        };
  }

  private interpolateAlongCurve(curvePoints: Cartesian3[], t: number) {
    const numPoints = curvePoints.length - 1;
    const index = Math.floor(t * numPoints);
    const tSegment = t * numPoints - index;
    const startPoint = curvePoints[index];
    const endPoint = curvePoints[index + 1];
    const x = startPoint.x + (endPoint.x - startPoint.x) * tSegment;
    const y = startPoint.y + (endPoint.y - startPoint.y) * tSegment;
    const z = startPoint.z + (endPoint.z - startPoint.z) * tSegment;

    return new Cartesian3(x, y, z);
  }

  private getNewPosition(curveControlPoints: Cartesian3[], t: number) {
    const curveControlPointsProjection =
      CoordinateUtils.car3ArrToProjectionPntArr(curveControlPoints);
    const curvePoints = MathUtils.getCurvePoints(
      0.3,
      curveControlPointsProjection
    );

    const newPosition = this.interpolateAlongCurve(
      CoordinateUtils.projPntArr2Cartesian3Arr(curvePoints),
      t
    );
    return newPosition;
  }

  private doubleArrowGrowthAnimation(
    duration: number = 2000,
    delay: number = 0,
    callback?: () => void,
    loop?: boolean
  ) {
    const aniidx = this.animationids.length;
    const afterdelayfunc = () => {
      this.hideWithAnimation(0, 0, undefined);
      const points = this.getPoints();
      let startTime = 0;
      const frameListener = (currentTime: number) => {
        if (!startTime) {
          startTime = currentTime;
        }
        const elapsedTime = currentTime - startTime;
        if (elapsedTime >= duration) {
          this.setState("static");
          // Animation ends
          callback && callback();
          startTime = 0;

          if (loop === true) {
            this.animationids[aniidx] = requestAnimationFrame(frameListener);
          }
          return;
        } else if (elapsedTime == 0) {
          this.animationids[aniidx] = requestAnimationFrame(frameListener);
          return;
        }

        // Utils.isClockWise(pnt1, pnt2, pnt3)
        const midPoint = Cartesian3.midpoint(
          points[0],
          points[1],
          new Cartesian3()
        );

        const startPointLeft = Cartesian3.midpoint(
          points[0],
          midPoint,
          new Cartesian3()
        );

        const startPointRight = Cartesian3.midpoint(
          midPoint,
          points[1],
          new Cartesian3()
        );
        const endPointLeft = points[3];
        const endPointRight = points[2];
        const t = elapsedTime / duration;
        const controlPoint = this.getBezierControlPointforGrowthAnimation();
        const curveControlPointsLeft = [
          startPointLeft,
          controlPoint.left,
          endPointLeft,
        ];
        const curveControlPointsRight = [
          startPointRight,
          controlPoint.right,
          endPointRight,
        ];
        const newPositionLeft = this.getNewPosition(curveControlPointsLeft, t);
        const newPositionRight = this.getNewPosition(
          curveControlPointsRight,
          t
        );

        const tempPoints = [...points];
        tempPoints[2] = newPositionRight;
        tempPoints[3] = newPositionLeft;
        const geometryPoints = this.generateGeometry(tempPoints);
        this.setGeometryPoints(geometryPoints);
        this.showWithAnimation(0, 0, undefined);
        this.animationids[aniidx] = requestAnimationFrame(frameListener);
      };
      this.animationids[aniidx] = requestAnimationFrame(frameListener);
    };
    let curtime: number;
    const delayfunc = (newcurtime: number) => {
      if (curtime == null) {
        curtime = newcurtime;
      }
      const elapse = newcurtime - curtime;
      if (elapse >= delay) {
        this.animationids[aniidx] = requestAnimationFrame(afterdelayfunc);
      } else {
        this.animationids[aniidx] = requestAnimationFrame(delayfunc);
      }
    };
    this.animationids.push(requestAnimationFrame(delayfunc));
  }

  startGrowthAnimation(opts: GrowthAnimationOpts) {
    const { duration = 2000, delay = 0, callback, loop } = opts || {};
    if (this.state != "static") {
      return;
    }

    this.setState("animating");

    // For double arrows, special handling is required.
    this.doubleArrowGrowthAnimation(duration, delay, callback, loop);
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.DOUBLE_ARROW, DoubleArrow as any);
