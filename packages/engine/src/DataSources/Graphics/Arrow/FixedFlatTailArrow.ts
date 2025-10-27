import { Cartesian3, createGuid } from "cesium";
import FreeFlatTailArrow from "./FreeFlatTailArrow";
import AbstractCore from "../../../Core/AbstractCore";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import {
  GeometryStyleMap,
  Point2Deg,
  Point3DegList,
  Point3Deg,
} from "../../../types";
import { GeometryType, GraphicType } from "../../../enum";
import GeometryUtils from "../../../Core/GeometryUtils";
import registry from "../../../Core/GraphicRegistry";

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

  protected generateGeometry(positions: Cartesian3[]): Cartesian3[] {
    const projectionPoints =
      CoordinateUtils.car3ArrToProjectionPntArr(positions);

    return CoordinateUtils.projPntArr2Cartesian3Arr(
      GeometryUtils.generateTailArrow(projectionPoints, {
        isFixedTail: true,
      })
    );
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.FIXED_FLAT_TAIL_ARROW, FixedFlatTailArrow as any);
