/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:41:03
 */
import { Cartesian3 } from "cesium";
import FixedFlatTailArrow from "./FixedFlatTailArrow";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryStyleMap, ProjectionPoint, Point3Deg } from "../../../types";
import { GeometryType, GraphicType } from "../../../enum";;
import GeometryUtils from "../../../Core/GeometryUtils";
import registry from "../../../Core/GraphicRegistry";

export default class FixedSwallowTailArrow extends FixedFlatTailArrow {
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

    this.graphicType = GraphicType.FIXED_SWALLOW_TAIL_ARROW;
    this.graphicName = "固定燕尾箭头";
    this.tailWidthFactor = 0.1;
    this.swallowTailFactor = 1;
    this.swallowTailPnt = [0, 0];
  }

  protected generateGeometry(positions: Cartesian3[]): Cartesian3[] {
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints, {
        isFixedTail: true,
        isSwallowTail: true,
      })
    );
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.FIXED_SWALLOW_TAIL_ARROW, FixedSwallowTailArrow as any);
