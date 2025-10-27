/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:18
 */
import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractCore from "../../../Core/AbstractCore";
import AbstractLine from "../Abstract/AbstractLine";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryType, GraphicType } from "../../../enum";
import { GeometryStyleMap, Point3Deg } from "../../../types";
import GeometryUtils from "../../../Core/GeometryUtils";
import registry from "../../../Core/GraphicRegistry";

export default class StraightArrow extends AbstractLine {
  graphicType: GraphicType;
  
  freehand: boolean;
  headAngle: number; // 头宽角度
  neckAngle: number; // 颈宽角度
  minPointsForShape: number;

  constructor({
    core,
    style,
    positions,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.LINE];
    positions?: Point3Deg[];
  }) {
    super({ core, style, positions });

    this.graphicType = GraphicType.STRAIGHT_ARROW;
    this.freehand = true;
    this.graphicName = "直箭头";
    this.hintText = "单击开始绘制";

    this.headAngle = Math.PI / 4;
    this.neckAngle = Math.PI / 6;
    this.minPointsForShape = 2;
  }

  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]
  ) {
    this.points.set(createGuid(), cartesian);
    if (this.points.size < 2) {
      this.onMouseMove();
    } else {
      this.finishDrawing(callback);
    }
  }

  protected updateMovingPoint(cartesian: Cartesian3) {
    // 仅用于预览，不应写入关键点集合
    const tempPoints = [...this.getPoints(), cartesian];
    const geometryPoints = this.generateGeometry(tempPoints);
    this.setGeometryPoints(geometryPoints);
  }

  protected generateGeometry(positions: Cartesian3[]) {
    const [pnt1, pnt2] = CoordinateUtils.car3ArrToProjectionPntArr(positions);
    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateStraightArrow(pnt1, pnt2)
    );
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.STRAIGHT_ARROW, StraightArrow as any);