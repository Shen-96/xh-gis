/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-20 09:45:37
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:33
 */

import AbstractCore from "../../../Core/AbstractCore";
import AbstractLine from "../Abstract/AbstractLine";
import { GeometryDrawEventCallbackMap } from "../types";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { Cartesian3, createGuid } from "cesium";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap, Point3Deg } from "../../../types";
import registry from "../../../Core/GraphicRegistry";

export default class Curve extends AbstractLine {
  readonly graphicType = GraphicType.CURVE;
  readonly minPointsForShape = 3;
  arrowLengthScale: number = 5;
  maxArrowLength: number = 3000000;
  t: number;

  constructor({
    core,
    style,
    positions,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.LINE];
    positions?: Point3Deg[];
  }) {
    super({
      core,
      style,
      positions,
    });

    this.graphicName = "曲线";
    this.t = 0.3;
    this.hintText = "单击开始绘制";
  }

  protected addPoint(cartesian: Cartesian3) {
    this.points.set(createGuid(), cartesian);

    this.hintText = "单击继续添加点，双击结束绘制";
    if (this.points.size < 2) {
      this.onMouseMove();
    } else if (this.points.size === 2) {
      this.setGeometryPoints(this.getPoints());
      this.drawActive();
    }
  }

  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];

    if (tempPoints.length === 2) {
      this.setGeometryPoints(tempPoints);
    } else {
      const geometryPoints = this.generateGeometry(tempPoints);
      this.setGeometryPoints(geometryPoints);
    }
  }

  protected generateGeometry(positions: Cartesian3[]) {
    const projPoints = positions.map((pnt) => {
      return CoordinateUtils.car3ToProjectionPnt(pnt);
    });

    const curvePoints = MathUtils.getCurvePoints(this.t, projPoints);

    const temp = [...curvePoints];
    const cartesianPoints = temp.map((t) =>
      CoordinateUtils.projPnt2Cartesian3(t)
    );
    return cartesianPoints;
  }

  beginDraw(callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]): void {
    this.setState("drawing");

    this.onLeftClick();
    this.onLeftDoubleClick(callback);
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.CURVE, Curve as any);
