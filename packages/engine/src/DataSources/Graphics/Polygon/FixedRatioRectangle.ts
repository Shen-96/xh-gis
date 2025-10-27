/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 07:00:31
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:42:25
 */
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { Cartesian3, createGuid } from "cesium";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import Constant from "../../../Core/Constant";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap, Point3Deg } from "../../../types";
import registry from "../../../Core/GraphicRegistry";

export default class FixedRatioRectangle extends AbstractPolygon {
  readonly graphicType = GraphicType.FIXED_RATIO_RECTANGLE;
  readonly minPointsForShape = 2;

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

    this.graphicName = "等比矩形";
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

    if (this.points.size === 1) {
      this.hintText = "单击结束绘制";
      this.onMouseMove();
    } else if (this.points.size > 1) {
      this.finishDrawing(callback);
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    const geometryPoints = this.generateGeometry(tempPoints);
    this.setGeometryPoints(geometryPoints);
  }

  protected generateGeometry(positions: Cartesian3[]) {
    const [p1, p2] = CoordinateUtils.car3ArrToProjectionPntArr(positions);

    this.style.stRotation = MathUtils.getAzimuth(p1, p2);

    const distance = MathUtils.wholeProjectionDistance([p1, p2]);

    const width = distance;
    const height = (distance / 3) * 2;

    const p3 = MathUtils.getThirdPoint(
      p2,
      p1,
      Constant.HALF_PI,
      height / 2,
      false
    );
    const p4 = MathUtils.getThirdPoint(
      p2,
      p1,
      Constant.HALF_PI,
      height / 2,
      true
    );
    const p5 = MathUtils.getThirdPoint(
      p1,
      p2,
      Constant.HALF_PI,
      height / 2,
      false
    );
    const p6 = MathUtils.getThirdPoint(
      p1,
      p2,
      Constant.HALF_PI,
      height / 2,
      true
    );

    const cartesianPoints = CoordinateUtils.projectionsToCartesian3Arr([
      ...p3,
      ...p4,
      ...p5,
      ...p6,
    ]);
    return cartesianPoints;
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.FIXED_RATIO_RECTANGLE, FixedRatioRectangle as any);
