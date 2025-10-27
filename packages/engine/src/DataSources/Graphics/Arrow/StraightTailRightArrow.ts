/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:26
 */
import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap } from "../types";
import StraightTailArrow from "./StraightTailArrow";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap, Point3Deg } from "../../../types";
import GeometryUtils from "../../../Core/GeometryUtils";
import registry from "../../../Core/GraphicRegistry";

export default class StraightTailRightArrow extends StraightTailArrow {
  graphicType: GraphicType;
  
  minPointsForShape: number;
  headAngle: number;
  neckAngle: number;
  tailWidthFactor: number;

  constructor({
    core,
    style,
    positions,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.POLYGON];
    positions?: Point3Deg[];
  }) {
    super({ core, style, positions });

    this.graphicType = GraphicType.STRAIGHT_TAIL_RIGHT_ARROW;
    this.graphicName = "直尾右箭头";
    this.hintText = "单击开始绘制";
    this.minPointsForShape = 2;

    // 默认参数（与 GeometryUtils 约定匹配）
    this.headAngle = Math.PI / 6;
    this.neckAngle = Math.PI / 6;
    this.tailWidthFactor = 2;
  }

  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ) {
    this.points.set(createGuid(), cartesian);

    this.hintText = "单击继续添加点，双击结束绘制";
    if (this.points.size < 2) {
      this.onMouseMove();
    } else {
      this.finishDrawing(callback);
    }
  }

  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    const geometryPoints = this.generateGeometry(tempPoints);
    this.setGeometryPoints(geometryPoints);
  }

  protected generateGeometry(positions: Cartesian3[]) {
    const projectionPoints = CoordinateUtils.car3ArrToProjectionPntArr(positions);
    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints, {
        neckAngle: this.neckAngle,
        headAngle: this.headAngle,
        tailWidthFactor: this.tailWidthFactor,
      })
    );
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.STRAIGHT_TAIL_RIGHT_ARROW, StraightTailRightArrow as any);
