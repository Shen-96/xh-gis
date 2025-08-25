import {
  Cartesian3,
  defined,
  Transforms,
  Matrix4,
  Matrix3,
  Math as CesiumMath,
} from "cesium";
import { Geographic, Constant, Point, ProjectionPoint } from "..";
import CoordinateUtils from "./CoordinateUtils";

const xPI = (Math.PI * 3000.0) / 180.0;
const a = 6378245.0;
const ee = 0.006693421622965943;
/// 零值容差
const ZERO_TOLERANCE = 0.0001;
/// 默认插值点数
const FITTING_COUNT = 100;

/**
 * @descripttion: 转化工具
 * @author: EV-申小虎
 */
class MathUtils {
  /**
   * @descripttion: 根据边界获取随机数
   * @param {number} min 最小值
   * @param {number} max 最大值
   * @param {boolean} isInt 是否整型(默认true)
   * @return {*}
   * @author: EV-申小虎
   */
  static randomWithRange(min: number, max: number, isInt = true) {
    const Range = max - min,
      Rand = Math.random();

    return isInt ? min + Math.round(Rand * Range) : min + Rand * Range;
  }

  /**
   * @descripttion: 计算两点间向量（三维）
   * @param {Cartesian3} left 左边点
   * @param {Cartesian3} right 右边点
   * @return {Cartesian3} 单位向量
   * @author: EV-申小虎
   */
  static getVector(left: Cartesian3, right: Cartesian3) {
    if (!defined(left) || !defined(right)) return undefined;
    const distance = new Cartesian3();
    const vector = new Cartesian3();
    Cartesian3.subtract(left, right, distance);
    Cartesian3.normalize(distance, vector);
    return vector;
  }

  /**
   * @descripttion: 两点间的投影距离（二维）
   * @param {IPoint} target
   * @param {IPoint} origin
   * @return {*}
   * @author: EV-申小虎
   */
  static projectionDistance(target: ProjectionPoint, origin: ProjectionPoint) {
    return Math.sqrt(
      Math.pow(target[0] - origin[0], 2) + Math.pow(target[1] - origin[1], 2)
    );
  }

  /**
   * @descripttion: 计算中点
   * @param {Point} t
   * @param {Point} o
   * @return {*}
   * @author: EV-申小虎
   */
  static mid(t: Point, o: Point): Point {
    return [(t[0] + o[0]) / 2, (t[1] + o[1]) / 2];
  }

  /**
   * @descripttion: 各点间的距离累计和（二维）
   * @param {Array<IPoint>} path
   * @return {*}
   * @author: EV-申小虎
   */
  static wholeProjectionDistance(path: Array<Point>) {
    let distance = 0;
    for (let index = 0; index < path.length - 1; index++)
      distance += this.projectionDistance(path[index], path[index + 1]);
    return distance;
  }

  /**
   * @descripttion: 通过三个点确定一个圆的中心点
   * @param {Point} point1
   * @param {Point} point2
   * @param {Point} point3
   * @return {Point} 圆心
   * @author: EV-申小虎
   */
  static getCircleCenterOfThreePoints = (
    point1: Point,
    point2: Point,
    point3: Point
  ) => {
    const pntA: Point = [
      (point1[0] + point2[0]) / 2,
      (point1[1] + point2[1]) / 2,
    ];
    const pntB: Point = [
      pntA[0] - point1[1] + point2[1],
      pntA[1] + point1[0] - point2[0],
    ];
    const pntC: Point = [
      (point1[0] + point3[0]) / 2,
      (point1[1] + point3[1]) / 2,
    ];
    const pntD: Point = [
      pntC[0] - point1[1] + point3[1],
      pntC[1] + point1[0] - point3[0],
    ];
    return MathUtils.getIntersectPoint([pntA, pntB], [pntC, pntD]);
  };

  /**
   * @descripttion: 计算两条线的交点
   * @param {array} lineA
   * @param {array} lineB
   * @return {Point} 交点
   * @author: EV-申小虎
   */
  static getIntersectPoint(
    lineA: [Point, Point],
    lineB: [Point, Point]
  ): Point {
    // 获取两条线段的端点
    const pntA = lineA[0],
      pntB = lineA[1],
      pntC = lineB[0],
      pntD = lineB[1];

    // 如果线段A是水平的，计算交点
    if (pntA[1] === pntB[1]) {
      const f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
      const x = f * (pntA[1] - pntC[1]) + pntC[0];
      const y = pntA[1];
      return [x, y];
    }
    // 如果线段B是水平的，计算交点
    if (pntC[1] === pntD[1]) {
      const e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
      const x = e * (pntC[1] - pntA[1]) + pntA[0];
      const y = pntC[1];
      return [x, y];
    }
    // 计算两条非水平线段的交点
    const e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
    const f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
    const y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f);
    const x = e * y - e * pntA[1] + pntA[0];
    return [x, y];
  }

  /**
   * @descripttion: 获取方位角（地平经度，弧度制）
   * @param {ProjectionPoint} origin
   * @param {ProjectionPoint} target
   * @return {*}
   * @author: EV-申小虎
   */
  static getAzimuth(origin: ProjectionPoint, target: ProjectionPoint): number {
    const dx = target[0] - origin[0];
    const dy = target[1] - origin[1];
    let azimuth = Math.atan2(dx, dy); // 注意参数顺序是 (dx, dy)
    if (azimuth < 0) azimuth += 2 * Math.PI; // 转换为 [0, 2π)

    return azimuth;
  }

  // /**
  //  * @descripttion: 计算方位角（弧度制）
  //  * @param {IPoint} target 目标点位
  //  * @param {IPoint} origin 源点位
  //  * @return {*}
  //  * @author: EV-申小虎
  //  */
  // static getAzimuth(target: ProjectionPoint, origin: ProjectionPoint) {
  //   let azimuth = 0;
  //   const dX = target[0] - origin[0],
  //     dX2 = dX + 1e-20,
  //     dY = target[1] - origin[1];

  //   azimuth = Math.PI * (1 - Math.sign(dX) / 2) - Math.atan(dY / dX2);

  //   return azimuth;
  // }

  // /**
  //  * 获取方位角（地平经度）
  //  * @param startPoint
  //  * @param endPoint
  //  * @returns {*}
  //  */
  // static getAzimuth = (
  //   startPoint: ProjectionPoint,
  //   endPoint: ProjectionPoint
  // ) => {
  //   let azimuth: number = 0;

  //   const angle = Math.asin(
  //     Math.abs(endPoint[1] - startPoint[1]) /
  //       this.projectionDistance(startPoint, endPoint)
  //   );
  //   if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
  //     azimuth = angle + Math.PI;
  //   } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
  //     azimuth = Math.PI * 2 - angle;
  //   } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
  //     azimuth = angle;
  //   } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
  //     azimuth = Math.PI - angle;
  //   }
  //   return azimuth;
  // };

  /**
   * @descripttion: 根据起止点和旋转方向求取第三个点（在目标点基础上进行旋转）
   * @param {ProjectionPoint} origin 源点
   * @param {ProjectionPoint} target 目标点
   * @param {number} radians 旋转弧度
   * @param {number} distance 距离
   * @param {boolean} clockwise 顺时针
   * @return {*}
   * @author: EV-申小虎
   */
  static getThirdPoint(
    origin: ProjectionPoint,
    target: ProjectionPoint,
    radians: number,
    distance: number,
    clockwise: boolean
  ) {
    const azmuth = this.getAzimuth(origin, target),
      newAzmuth = clockwise ? azmuth + radians : azmuth - radians,
      dx = distance * Math.sin(newAzmuth),
      dy = distance * Math.cos(newAzmuth);

    return [target[0] + dx, target[1] + dy] as ProjectionPoint;
  }

  /**
   * @descripttion: 计算弧线段的点集
   * @param center
   * @param radius
   * @param startAngle
   * @param endAngle
   * @returns {ProjectionPoint[]}
   */
  static getArcPoints(
    center: ProjectionPoint,
    radius: number,
    startAngle: number,
    endAngle: number,
    clockwise = true
  ) {
    const pnts: ProjectionPoint[] = [];
    let angleDiff = endAngle - startAngle;

    angleDiff = angleDiff < 0 ? angleDiff + Math.PI * 2 : angleDiff;

    if (Math.abs(angleDiff - 2 * Math.PI) < 1e-6) {
      angleDiff = 2 * Math.PI - 1e-6; // 避免重复点
    }

    const multiplier = clockwise ? 1 : -1;

    for (let i = 0; i <= 100; i++) {
      const angle = startAngle + (angleDiff * i) / 100,
        x = center[0] + radius * Math.sin(angle) * multiplier,
        y = center[1] + radius * Math.cos(angle) * multiplier;

      pnts.push([x, y]);
    }
    return pnts;
  }

  /**
   * @descripttion: 计算经过三个点 pnt1、pnt2 和 pnt3 的外接圆在 pnt2 处的切线方向的法向量
   * @param {ProjectionPoint} pnt1
   * @param {ProjectionPoint} pnt2
   * @param {ProjectionPoint} pnt3
   * @return {ProjectionPoint} 法向量
   * @author: EV-申小虎
   */
  static getCircleTangentNormalAtPoint2(
    pnt1: ProjectionPoint,
    pnt2: ProjectionPoint,
    pnt3: ProjectionPoint
  ): ProjectionPoint {
    let dX1 = pnt1[0] - pnt2[0];
    let dY1 = pnt1[1] - pnt2[1];
    const d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
    dX1 /= d1;
    dY1 /= d1;
    let dX2 = pnt3[0] - pnt2[0];
    let dY2 = pnt3[1] - pnt2[1];
    const d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
    dX2 /= d2;
    dY2 /= d2;
    const uX = dX1 + dX2;
    const uY = dY1 + dY2;
    return [uX, uY];
  }

  /**
   * @descripttion: 计算经过三个点的外接圆在中间点处的切线方向的左右两个法向量
   * @param {number} t 控制切线法向量长度的缩放因子，值越大法向量点离中间点越远
   * @param {ProjectionPoint} pnt1 第一个点
   * @param {ProjectionPoint} pnt2 中间点
   * @param {ProjectionPoint} pnt3 第二个点
   * @return {[ProjectionPoint, ProjectionPoint]} [右法向量, 左法向量]
   * @author: EV-申小虎
   */
  static getBisectorNormals(
    t: number,
    pnt1: ProjectionPoint,
    pnt2: ProjectionPoint,
    pnt3: ProjectionPoint
  ) {
    const normal = MathUtils.getCircleTangentNormalAtPoint2(pnt1, pnt2, pnt3);
    let bisectorNormalRight: ProjectionPoint,
      bisectorNormalLeft: ProjectionPoint,
      dt: number,
      x: number,
      y: number;
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    const uX = normal[0] / dist;
    const uY = normal[1] / dist;
    const d1 = MathUtils.projectionDistance(pnt1, pnt2);
    const d2 = MathUtils.projectionDistance(pnt2, pnt3);
    if (dist > ZERO_TOLERANCE) {
      if (!MathUtils.isPathClockwise(pnt1, pnt2, pnt3)) {
        dt = t * d1;
        x = pnt2[0] - dt * uY;
        y = pnt2[1] + dt * uX;
        bisectorNormalRight = [x, y];
        dt = t * d2;
        x = pnt2[0] + dt * uY;
        y = pnt2[1] - dt * uX;
        bisectorNormalLeft = [x, y];
      } else {
        dt = t * d1;
        x = pnt2[0] + dt * uY;
        y = pnt2[1] - dt * uX;
        bisectorNormalRight = [x, y];
        dt = t * d2;
        x = pnt2[0] - dt * uY;
        y = pnt2[1] + dt * uX;
        bisectorNormalLeft = [x, y];
      }
    } else {
      x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
      y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
      bisectorNormalRight = [x, y];
      x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
      y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
      bisectorNormalLeft = [x, y];
    }
    return [bisectorNormalRight, bisectorNormalLeft];
  }

  /**
   * @descripttion: 获取曲线控制点集起始坐标的左侧
   * @param {array} controlPoints
   * @param {number} t
   * @return {*}
   * @author: EV-申小虎
   */
  static getLeftMostControlPoint(
    controlPoints: ProjectionPoint[],
    t: number
  ): ProjectionPoint {
    const [pnt1, pnt2, pnt3] = [
      controlPoints[0],
      controlPoints[1],
      controlPoints[2],
    ];
    let controlX: number, controlY: number;
    const pnts = MathUtils.getBisectorNormals(0, pnt1, pnt2, pnt3);
    const normalRight = pnts[0];
    const normal = MathUtils.getCircleTangentNormalAtPoint2(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    if (dist > ZERO_TOLERANCE) {
      const mid = MathUtils.mid(pnt1, pnt2);
      const pX = pnt1[0] - mid[0];
      const pY = pnt1[1] - mid[1];
      const d1 = MathUtils.projectionDistance(pnt1, pnt2);
      const n = 2.0 / d1;
      const nX = -n * pY;
      const nY = n * pX;
      const a11 = nX * nX - nY * nY;
      const a12 = 2 * nX * nY;
      const a22 = nY * nY - nX * nX;
      const dX = normalRight[0] - mid[0];
      const dY = normalRight[1] - mid[1];
      controlX = mid[0] + a11 * dX + a12 * dY;
      controlY = mid[1] + a12 * dX + a22 * dY;
    } else {
      controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
      controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
    }
    return [controlX, controlY];
  }

  /**
   * @descripttion: 获取二分角右侧法线上的点
   * @param {array} controlPoints
   * @param {number} t
   * @return {*}
   * @author: EV-申小虎
   */
  static getRightMostControlPoint = (
    controlPoints: ProjectionPoint[],
    t: number
  ): ProjectionPoint => {
    const count = controlPoints.length;
    const pnt1 = controlPoints[count - 3];
    const pnt2 = controlPoints[count - 2];
    const pnt3 = controlPoints[count - 1];
    const pnts = MathUtils.getBisectorNormals(0, pnt1, pnt2, pnt3);
    const normalLeft = pnts[1];
    const normal = MathUtils.getCircleTangentNormalAtPoint2(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    let controlX: number, controlY: number;
    if (dist > ZERO_TOLERANCE) {
      const mid = MathUtils.mid(pnt2, pnt3);
      const pX = pnt3[0] - mid[0];
      const pY = pnt3[1] - mid[1];
      const d1 = MathUtils.projectionDistance(pnt2, pnt3);
      const n = 2.0 / d1;
      const nX = -n * pY;
      const nY = n * pX;
      const a11 = nX * nX - nY * nY;
      const a12 = 2 * nX * nY;
      const a22 = nY * nY - nX * nX;
      const dX = normalLeft[0] - mid[0];
      const dY = normalLeft[1] - mid[1];
      controlX = mid[0] + a11 * dX + a12 * dY;
      controlY = mid[1] + a12 * dX + a22 * dY;
    } else {
      controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
      controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
    }
    return [controlX, controlY];
  };

  /**
   * 插值曲线点
   * @param t
   * @param controlPoints
   * @returns {null}
   */
  /**
   * @descripttion: 计算一条经过控制点集的曲线上的点
   * @param {number} t
   * @param {ProjectionPoint[]} controlPoints
   * @return {ProjectionPoint[]}
   * @author: EV-申小虎
   */
  static getCurvePoints(t: number, controlPoints: ProjectionPoint[]) {
    const leftControl = MathUtils.getLeftMostControlPoint(controlPoints, t);
    let pnt1: ProjectionPoint,
      pnt2: ProjectionPoint,
      pnt3: ProjectionPoint,
      normals: ProjectionPoint[] = [leftControl];
    const points: ProjectionPoint[] = [];

    for (let i = 0; i < controlPoints.length - 2; i++) {
      [pnt1, pnt2, pnt3] = [
        controlPoints[i],
        controlPoints[i + 1],
        controlPoints[i + 2],
      ];
      const normalPoints = MathUtils.getBisectorNormals(t, pnt1, pnt2, pnt3);
      normals = normals.concat(normalPoints);
    }
    const rightControl = MathUtils.getRightMostControlPoint(controlPoints, t);
    if (rightControl) {
      normals.push(rightControl);
    }
    for (let i = 0; i < controlPoints.length - 1; i++) {
      pnt1 = controlPoints[i];
      pnt2 = controlPoints[i + 1];
      points.push(pnt1);
      for (let j = 0; j < FITTING_COUNT; j++) {
        const pnt = MathUtils.getPointOnCubicBezier(
          j / FITTING_COUNT,
          pnt1,
          normals[i * 2],
          normals[i * 2 + 1],
          pnt2
        );
        points.push(pnt);
      }
      points.push(pnt2);
    }
    return points;
  }

  /**
   * @descripttion: 获取对称点
   * @param {IPoint} target 目标点
   * @param {IPoint} origin 源点
   * @param {number} radians 旋转弧度
   * @param {number} distance 距离
   * @param {boolean} clockwise 顺时针
   * @return {*}
   * @author: EV-申小虎
   */
  static getSymmetricalPoint(
    basicPnt1: ProjectionPoint,
    basicPnt2: ProjectionPoint,
    originPnt: ProjectionPoint
  ) {
    let r: ProjectionPoint, n: number, g: number, i: ProjectionPoint;
    const s = MathUtils.mid(basicPnt1, basicPnt2),
      a = MathUtils.projectionDistance(s, originPnt),
      l = MathUtils.getAngleOfThreePoints(basicPnt1, s, originPnt);

    return (
      l < Constant.HALF_PI
        ? ((n = a * Math.sin(l)),
          (g = a * Math.cos(l)),
          (i = MathUtils.getThirdPoint(basicPnt1, s, Constant.HALF_PI, n, !1)),
          (r = MathUtils.getThirdPoint(s, i, Constant.HALF_PI, g, !0)))
        : l >= Constant.HALF_PI && l < Math.PI
        ? ((n = a * Math.sin(Math.PI - l)),
          (g = a * Math.cos(Math.PI - l)),
          (i = MathUtils.getThirdPoint(basicPnt1, s, Constant.HALF_PI, n, !1)),
          (r = MathUtils.getThirdPoint(s, i, Constant.HALF_PI, g, !1)))
        : l >= Math.PI && l < 1.5 * Math.PI
        ? ((n = a * Math.sin(l - Math.PI)),
          (g = a * Math.cos(l - Math.PI)),
          (i = MathUtils.getThirdPoint(basicPnt1, s, Constant.HALF_PI, n, !0)),
          (r = MathUtils.getThirdPoint(s, i, Constant.HALF_PI, g, !0)))
        : ((n = a * Math.sin(2 * Math.PI - l)),
          (g = a * Math.cos(2 * Math.PI - l)),
          (i = MathUtils.getThirdPoint(basicPnt1, s, Constant.HALF_PI, n, !0)),
          (r = MathUtils.getThirdPoint(s, i, Constant.HALF_PI, g, !1))),
      r
    );
  }

  /**
   * @descripttion: 阶乘
   * @param {*} t
   * @return {*}
   * @author: EV-申小虎
   */
  static getFactorial(origin: number) {
    if (1 >= origin) return 1;
    if (2 == origin) return 2;
    if (3 == origin) return 6;
    if (4 == origin) return 24;
    if (5 == origin) return 120;
    let res = BigInt(1);
    for (let e = BigInt(1); origin >= e; e++) res *= e;
    return Number(res);
  }

  /**
   * @descripttion: 二项式分布
   * @param {number} x
   * @param {number} y
   * @return {*}
   * @author: EV-申小虎
   */
  static getBinomialFactor(x: number, y: number) {
    const res =
      this.getFactorial(x) / (this.getFactorial(y) * this.getFactorial(x - y));
    return Number(res);
  }

  /**
   * @descripttion: 二次B样条曲线插值
   * @param {ProjectionPoint} t
   * @return {*}
   * @author: EV-申小虎
   */
  // static computeQuadraticBSplinePoints(t: ProjectionPoint[]) {
  //   if (t.length <= 2) return t;
  //   const o = 2,
  //     e: ProjectionPoint[] = [],
  //     r = t.length - o - 1;
  //   e.push(t[0]);
  //   for (let n = 0; r >= n; n++)
  //     for (let g = 0; 1 >= g; g += 0.05) {
  //       let i = 0,
  //         y = 0;
  //       for (let s = 0; o >= s; s++) {
  //         const a = MathUtils.getQuadricBSplineFactor(s, g);
  //         (i += a * t[n + s][0]), (y += a * t[n + s][1]);
  //       }
  //       e.push([i, y]);
  //     }
  //   return e.push(t[t.length - 1]), e;
  // }

  /**
   * 计算二次B样条曲线点集
   * @param points 控制点数组，每个元素是[x,y]坐标
   * @returns 返回平滑后的B样条曲线点集
   */
  static computeQuadraticBSplinePoints(points: ProjectionPoint[]) {
    if (points.length <= 2) {
      return points;
    }
    const [n, bSplinePoints] = [2, [] as ProjectionPoint[]];
    const m = points.length - n - 1;
    bSplinePoints.push(points[0]);
    for (let i = 0; i <= m; i++) {
      for (let t = 0; t <= 1; t += 0.05) {
        let [x, y] = [0, 0];
        for (let k = 0; k <= n; k++) {
          const factor = this.computeQuadraticBSplineFactor(k, t);
          x += factor * points[i + k][0];
          y += factor * points[i + k][1];
        }
        bSplinePoints.push([x, y]);
      }
    }
    bSplinePoints.push(points[points.length - 1]);
    return bSplinePoints;
  }

  /**
   * @descripttion: 计算二次B样条曲线插值中的特定因子
   * @param {number} t
   * @param {number} o
   * @return {*}
   * @author: EV-申小虎
   */
  static computeQuadraticBSplineFactor(t: number, o: number) {
    return 0 == t
      ? Math.pow(o - 1, 2) / 2
      : 1 == t
      ? (-2 * Math.pow(o, 2) + 2 * o + 1) / 2
      : 2 == t
      ? Math.pow(o, 2) / 2
      : 0;
  }

  /**
   * @descripttion: 二次贝塞尔插值
   * @param {ProjectionPoint} points
   * @return {*}
   * @author: EV-申小虎
   */
  static getQuadricBezierPoints(points: ProjectionPoint[]) {
    if (points.length <= 2) {
      return points;
    }
    const bezierPoints: ProjectionPoint[] = [];
    const n = points.length - 1;
    for (let t = 0; t <= 1; t += 0.01) {
      let [x, y] = [0, 0];
      for (let index = 0; index <= n; index++) {
        const factor = MathUtils.getBinomialFactor(n, index);
        const a = t ** index;
        const b = (1 - t) ** (n - index);
        x += Number(factor) * a * b * points[index][0];
        y += Number(factor) * a * b * points[index][1];
      }
      bezierPoints.push([x, y]);
    }
    bezierPoints.push(points[n]);
    return bezierPoints;
  }

  /**
   * @descripttion: 三次贝塞尔插值
   * @param {Array} points 轨迹关键点
   * @param {*} numberOfPoints 插值点数
   * @return {*}
   * @author: EV-申小虎
   */
  static getCubicBezierPoints(
    points: Array<ProjectionPoint>,
    numberOfPoints = 40
  ): Array<ProjectionPoint> {
    const bezierLinePoints: ProjectionPoint[] = [],
      /// 步长
      dt = 1.0 / (numberOfPoints - 1),
      length = points.length,
      inteval = Math.floor(length / 4), // 向下取整 找下标
      /*计算多项式系数  三次贝塞尔的计算公式*/
      cx = 3.0 * (points[inteval][0] - points[0][0]),
      bx = 3.0 * (points[2 * inteval][0] - points[inteval][0]) - cx,
      ax = points[length - 1][0] - points[0][0] - cx - bx,
      cy = 3.0 * (points[inteval][1] - points[0][1]),
      by = 3.0 * (points[2 * inteval][1] - points[inteval][1]) - cy,
      ay = points[length - 1][1] - points[0][1] - cy - by;

    for (let i = 0; i < numberOfPoints; i++) {
      /// 点位度量
      const scale = i * dt,
        tSquared = Math.pow(scale, 2), //t^2
        tCubed = Math.pow(scale, 3); //t^3

      /// 曲线上的每个记忆点都对应一个scale
      /// scale的范围在[0-1]
      bezierLinePoints.push([
        ax * tCubed + bx * tSquared + cx * scale + points[0][0],
        ay * tCubed + by * tSquared + cy * scale + points[0][1],
      ]);
    }
    return bezierLinePoints;
  }

  /**
   * @descripttion: 根据三个点计算夹角
   * @param {*} t
   * @param {*} o
   * @param {*} e
   * @return {*}
   * @author: EV-申小虎
   */
  static getAngleOfThreePoints(
    left: ProjectionPoint,
    origin: ProjectionPoint,
    right: ProjectionPoint
  ) {
    const r = this.getAzimuth(origin, left) - this.getAzimuth(origin, right);
    return 0 > r ? r + Constant.TWO_PI : r;
  }

  /**
   * 获取线上的点
   * @param t
   * @param startPnt
   * @param endPnt
   * @returns {[*,*]}
   */
  static getPointOnLine(
    t: number,
    startPnt: Point,
    endPnt: Point
  ): Point | undefined {
    if (t < 0 || t > 1) return undefined;

    const x = startPnt[0] + t * (endPnt[0] - startPnt[0]);
    const y = startPnt[1] + t * (endPnt[1] - startPnt[1]);
    return [x, y];
  }

  /**
   * @descripttion: 计算三次贝塞尔曲线上的点
   * @param {number} t
   * @param {Point} startPnt
   * @param {Point} cPnt1
   * @param {Point} cPnt2
   * @param {Point} endPnt
   * @return {Point}
   * @author: EV-申小虎
   */
  static getPointOnCubicBezier(
    t: number,
    startPnt: ProjectionPoint,
    cPnt1: ProjectionPoint,
    cPnt2: ProjectionPoint,
    endPnt: ProjectionPoint
  ): ProjectionPoint {
    t = Math.max(Math.min(t, 1), 0);
    const [tp, t2] = [1 - t, t * t];
    const t3 = t2 * t;
    const tp2 = tp * tp;
    const tp3 = tp2 * tp;
    const x =
      tp3 * startPnt[0] +
      3 * tp2 * t * cPnt1[0] +
      3 * tp * t2 * cPnt2[0] +
      t3 * endPnt[0];
    const y =
      tp3 * startPnt[1] +
      3 * tp2 * t * cPnt1[1] +
      3 * tp * t2 * cPnt2[1] +
      t3 * endPnt[1];
    return [x, y];
  }

  /**
   * @description: 判断三点组成的路径方向是否为顺时针（A->B->C）
   * @param {ProjectionPoint} pointA 路径起点
   * @param {ProjectionPoint} pointB 路径中间点
   * @param {ProjectionPoint} pointC 路径终点
   * @return {boolean} true 表示顺时针，false 表示逆时针或共线
   * @author: EV-申小虎
   */
  static isPathClockwise(
    pointA: ProjectionPoint,
    pointB: ProjectionPoint,
    pointC: ProjectionPoint
  ): boolean {
    // 向量 a (pointB - pointA)
    const ax = pointB[0] - pointA[0];
    const ay = pointB[1] - pointA[1];

    // 向量 b (pointB - pointC)
    const bx = pointC[0] - pointB[0];
    const by = pointC[1] - pointB[1];

    // 叉积 = ax * by - ay * bx
    return ax * by - ay * bx < 0; // 东北坐标系中，叉积负值为顺时针
  }

  /**
   * @descripttion: 计算两点间偏航角
   * @param {Geographic} posA A点坐标
   * @param {Geographic} posB B点坐标
   * @return {*}
   * @author: EV-申小虎
   */
  static getHeading(posA: Geographic, posB: Geographic) {
    //地理坐标A,B
    const p0 = CoordinateUtils.gcsToCartesian3(posA),
      p1 = CoordinateUtils.gcsToCartesian3(posB);
    if (!defined(p0) && defined(p1)) return undefined;
    //计算p0位置的enu位置矩阵的旋转部分
    const defrotmat = Matrix4.fromRotationTranslation(
      Transforms.eastNorthUpToFixedFrame(p0),
      Cartesian3.ZERO
    );
    // let defrotmat = Matrix4.fromTranslation(Transforms.eastNorthUpToFixedFrame(p0), new Matrix3());
    // let defrotmat = Transforms.eastNorthUpToFixedFrame(p0);

    //获取矩阵的三个坐标轴
    const xaxis = Matrix3.getColumn(defrotmat, 0, new Cartesian3());
    const yaxis = Matrix3.getColumn(defrotmat, 1, new Cartesian3());
    const zaxis = Matrix3.getColumn(defrotmat, 2, new Cartesian3());

    //两个位置点的射线方向
    let dir = Cartesian3.subtract(p1, p0, new Cartesian3());

    //计算在 enu 旋转矩阵上的 x y 平面上的投影向量
    dir = Cartesian3.cross(dir, zaxis, dir);
    dir = Cartesian3.cross(zaxis, dir, dir);

    //归一化
    dir = Cartesian3.normalize(dir, dir);

    //计算和x轴夹角  0 ~  pi
    let heading = Cartesian3.angleBetween(xaxis, dir);

    //和y轴夹角 判定在y轴的正方向还是负方向
    const ay = Cartesian3.angleBetween(yaxis, dir);

    // 保证处于0~2PI
    if (ay > Math.PI * 0.5) {
      heading = 2 * Math.PI - heading;
    }

    // console.log("heading:" + Math.toDegrees(heading).toFixed(5));
    return CesiumMath.toDegrees(heading);
  }

  /**
   * @descripttion: 度转度°分′秒″
   * @param {number} degree 角度（-180-180）
   * @return {*}
   * @author: EV-申小虎
   */
  static toDMS(degree: number) {
    if (typeof degree == "undefined") {
      return null;
    }
    /// 是否为负数
    const isNegative = degree < 0,
      /// 转为字符串
      strVal = String(Math.abs(degree));
    /// 获取小数点位置索引
    let i = strVal.indexOf(".");
    /// 获取度
    const strDu = i < 0 ? degree : strVal.substring(0, i);
    let strFen: number | string = 0,
      strMiao: number | string = 0;

    if (i > 0) {
      strFen = Number("0" + strVal.substring(i));
      strFen = strFen * 60;
      i = (strFen + "").indexOf(".");
      if (i > 0) {
        strMiao = Number("0" + (strFen + "").substring(i));
        strFen = (strFen + "").substring(0, i); //获取分
        strMiao = strMiao * 60 + "";
        i = strMiao.indexOf(".");
        strMiao = strMiao.substring(0, i + 4); //取到小数点后面三位
        strMiao = parseFloat(strMiao).toFixed(2); //精确小数点后面两位
      }
    }

    return {
      degree: isNegative ? -Number(strDu) : Number(strDu),
      minute: isNegative ? -Number(strFen) : Number(strFen),
      second: isNegative ? -Number(strMiao) : Number(strMiao),
    };
  }

  /**
   * @descripttion: 度°分′秒″转度
   * @param {number} degree 度（0-180）
   * @param {number} minute 分（0-60）
   * @param {number} second 秒（0-60）
   * @param {number} precision 数值精度（默认为最高精度6）
   * @return {*}
   * @author: EV-申小虎
   */
  static toDegree(
    degree: number,
    minute: number,
    second: number,
    precision = 6
  ) {
    /// 精确到小数点后最多六位
    precision =
      precision > 6 || precision < 0 || typeof precision == "undefined"
        ? 6
        : precision;
    const d = typeof degree == "undefined" ? 0 : Math.abs(degree),
      m = typeof minute == "undefined" ? 0 : Math.abs(minute / 60),
      s = typeof second == "undefined" ? 0 : Math.abs(second / 3600);
    let total = d + m + s;
    total = total > 180 ? 180 : total;

    return parseFloat(total.toFixed(precision));
  }

  /// 计算多边形面积
  static computePolygonArea(points: ProjectionPoint[]) {
    const pnts = points.map((i) => [...i]);
    pnts.push(pnts[0]);

    let h = 0;
    for (let i = 1; i < pnts.length; i++) {
      const oel = pnts[i - 1],
        el = pnts[i];
      h += oel[0] * el[1] - el[0] * oel[1];
    }

    const result = Math.abs(h);

    return result;
  }

  /**
   * 判断点是否在多边形内部
   * @param point 要检测的点 [x, y]
   * @param polygon 多边形顶点集合 [[x1, y1], [x2, y2], ...]
   * @returns boolean 如果点在多边形内返回true，否则返回false
   */
  static computePointInPolygon(
    point: ProjectionPoint,
    polygon: Array<ProjectionPoint>
  ): boolean {
    // 如果多边形点数小于3，无法形成多边形
    if (polygon.length < 3) {
      return false;
    }

    const [x, y] = point;
    let inside = false;

    // 实现射线法(Ray Casting Algorithm)
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      // 检查点是否在多边形的边上
      const onSegment =
        (yi === y && xi === x) ||
        (yj === y && xj === x) ||
        (yi === yj &&
          y === yi &&
          x >= Math.min(xi, xj) &&
          x <= Math.max(xi, xj)) ||
        (xi === xj &&
          x === xi &&
          y >= Math.min(yi, yj) &&
          y <= Math.max(yi, yj));

      if (onSegment) {
        return true;
      }

      // 检查射线是否与多边形的边相交
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }

  ///  秒数转化为时分秒
  static secondsToHMS(value: number, withDay = false) {
    //  秒
    let second = parseInt(value.toString());
    //  分
    let minute = 0;
    //  小时
    let hour = 0;
    //  天
    let day = 0;
    //  如果秒数大于60，将秒数转换成整数
    if (second > 60) {
      //  获取分钟，除以60取整数，得到整数分钟
      minute = parseInt((second / 60).toString());
      //  获取秒数，秒数取佘，得到整数秒数
      second = parseInt((second % 60).toString());
      //  如果分钟大于60，将分钟转换成小时
      if (minute > 60) {
        //  获取小时，获取分钟除以60，得到整数小时
        hour = parseInt((minute / 60).toString());
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        minute = parseInt((minute % 60).toString());
        //  如果小时大于24，将小时转换成天
        if (withDay && hour > 23) {
          //  获取天数，获取小时除以24，得到整天数
          day = parseInt((hour / 24).toString());
          //  获取天数后取余的小时，获取小时除以24取余的小时
          hour = parseInt((hour % 24).toString());
        }
      }
    }

    const secondStr = second > 9 ? second : "0" + second,
      minuteStr = minute > 9 ? minute : "0" + minute,
      hourStr = hour > 9 ? hour : "0" + hour;

    let result = `${hourStr}:${minuteStr}:${secondStr}`;

    if (withDay && day > 0) {
      result = "" + parseInt(day.toString()) + "D" + result;
    }

    return {
      H: hourStr,
      M: minuteStr,
      S: secondStr,
    };
  }
  static secondsToHMSInStr(value: number, withDay = false) {
    //  秒
    let second = parseInt(value.toString());
    //  分
    let minute = 0;
    //  小时
    let hour = 0;
    //  天
    let day = 0;
    //  如果秒数大于60，将秒数转换成整数
    if (second > 60) {
      //  获取分钟，除以60取整数，得到整数分钟
      minute = parseInt((second / 60).toString());
      //  获取秒数，秒数取佘，得到整数秒数
      second = parseInt((second % 60).toString());
      //  如果分钟大于60，将分钟转换成小时
      if (minute > 60) {
        //  获取小时，获取分钟除以60，得到整数小时
        hour = parseInt((minute / 60).toString());
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        minute = parseInt((minute % 60).toString());
        //  如果小时大于24，将小时转换成天
        if (withDay && hour > 23) {
          //  获取天数，获取小时除以24，得到整天数
          day = parseInt((hour / 24).toString());
          //  获取天数后取余的小时，获取小时除以24取余的小时
          hour = parseInt((hour % 24).toString());
        }
      }
    }

    const secondStr = second > 9 ? second : "0" + second,
      minuteStr = minute > 9 ? minute : "0" + minute,
      hourStr = hour > 9 ? hour : "0" + hour;

    let result = `${hourStr}:${minuteStr}:${secondStr}`;

    if (withDay && day > 0) {
      result = "" + parseInt(day.toString()) + "天" + result;
    }

    return result;
  }

  static secondsToHMSInCHN(value: number, withDay = false) {
    //  秒
    let second = parseInt(value.toString());
    //  分
    let minute = 0;
    //  小时
    let hour = 0;
    //  天
    let day = 0;
    //  如果秒数大于60，将秒数转换成整数
    if (second > 60) {
      //  获取分钟，除以60取整数，得到整数分钟
      minute = parseInt((second / 60).toString());
      //  获取秒数，秒数取佘，得到整数秒数
      second = parseInt((second % 60).toString());
      //  如果分钟大于60，将分钟转换成小时
      if (minute > 60) {
        //  获取小时，获取分钟除以60，得到整数小时
        hour = parseInt((minute / 60).toString());
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        minute = parseInt((minute % 60).toString());
        //  如果小时大于24，将小时转换成天
        if (withDay && hour > 23) {
          //  获取天数，获取小时除以24，得到整天数
          day = parseInt((hour / 24).toString());
          //  获取天数后取余的小时，获取小时除以24取余的小时
          hour = parseInt((hour % 24).toString());
        }
      }
    }

    let result = "";
    if (second > 0) result = "" + parseInt(second.toString()) + "秒";
    if (minute > 0) {
      result = "" + parseInt(minute.toString()) + "分" + result;
    }
    if (hour > 0) {
      result = "" + parseInt(hour.toString()) + "小时" + result;
    }
    if (withDay && day > 0) {
      result = "" + parseInt(day.toString()) + "天" + result;
    }

    return result;
  }

  static isPositiveNumber(value: number, includeZero = true) {
    Number.isFinite(value);

    return includeZero
      ? Number.isFinite(value) && value >= 0
      : Number.isFinite(value) && value > 0;
  }
}
export default MathUtils;

function transformGeographic(gcs: Geographic) {
  let retLat =
    -100.0 +
    2.0 * gcs.longitude +
    3.0 * gcs.latitude +
    0.2 * gcs.latitude * gcs.latitude +
    0.1 * gcs.longitude * gcs.latitude +
    0.2 * Math.sqrt(Math.abs(gcs.longitude));
  retLat +=
    ((20.0 * Math.sin(6.0 * gcs.longitude * Math.PI) +
      20.0 * Math.sin(2.0 * gcs.longitude * Math.PI)) *
      2.0) /
    3.0;
  retLat +=
    ((20.0 * Math.sin(gcs.latitude * Math.PI) +
      40.0 * Math.sin((gcs.latitude / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  retLat +=
    ((160.0 * Math.sin((gcs.latitude / 12.0) * Math.PI) +
      320 * Math.sin((gcs.latitude * Math.PI) / 30.0)) *
      2.0) /
    3.0;
  let retLng =
    300.0 +
    gcs.longitude +
    2.0 * gcs.latitude +
    0.1 * gcs.longitude * gcs.longitude +
    0.1 * gcs.longitude * gcs.latitude +
    0.1 * Math.sqrt(Math.abs(gcs.longitude));
  retLng +=
    ((20.0 * Math.sin(6.0 * gcs.longitude * Math.PI) +
      20.0 * Math.sin(2.0 * gcs.longitude * Math.PI)) *
      2.0) /
    3.0;
  retLng +=
    ((20.0 * Math.sin(gcs.longitude * Math.PI) +
      40.0 * Math.sin((gcs.longitude / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  retLng +=
    ((150.0 * Math.sin((gcs.longitude / 12.0) * Math.PI) +
      300.0 * Math.sin((gcs.longitude / 30.0) * Math.PI)) *
      2.0) /
    3.0;
  return new Geographic(retLng, retLat);
}

/**
 * @descripttion:
 * @param {Geographic} gcs
 * @return {*}
 * @author: EV-申小虎
 */
function outofchina(gcs: Geographic) {
  return (
    gcs.longitude < 72.004 ||
    gcs.longitude > 137.8347 ||
    gcs.latitude < 0.8293 ||
    gcs.latitude > 55.8271 ||
    false
  );
}
