/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:15
 */
import { Cartesian3 } from "cesium";
import AbstractCore from "../../../Core/AbstractCore";
import FreeFlatTailArrow from "./FreeFlatTailArrow";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryType, GraphicType } from "../../../enum";;
import { GeometryStyleMap, Point3Deg } from "../../../types";
import GeometryUtils from "../../../Core/GeometryUtils";
import registry from "../../../Core/GraphicRegistry";

export default class FreeSwallowTailArrow extends FreeFlatTailArrow {
  tailWidthFactor: number;
  swallowTailFactor: number;
  swallowTailPnt: [number, number];

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

    this.graphicType = GraphicType.FREE_SWALLOW_TAIL_ARROW;
    this.graphicName = "自定义燕尾箭头";
    this.tailWidthFactor = 0.1;
    this.swallowTailFactor = 1;
    this.swallowTailPnt = [0, 0];
  }

  /**
   * Generate geometric shapes based on key points.
   */
  protected generateGeometry(positions: Cartesian3[]): Cartesian3[] {
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints, {
        isFixedTail: false,
        isSwallowTail: true,
      })
    );
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.FREE_SWALLOW_TAIL_ARROW, FreeSwallowTailArrow as any);
