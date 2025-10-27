import { Cartesian3, createGuid } from "cesium";
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import AbstractCore from "../../../Core/AbstractCore";
import {
  GeometryType,
  GraphicType,
  SymbolType,
} from "../../../enum";
import { GeometryStyleMap, Point3Deg } from "../../../types";
import GeometryUtils from "../../../Core/GeometryUtils";
import registry from "../../../Core/GraphicRegistry";

export default class StraightTailArrow extends AbstractPolygon {
  graphicType: GraphicType;
  
  minPointsForShape: number;

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

    this.graphicType = GraphicType.STRAIGHT_TAIL_ARROW;
    this.freehand = true;
    this.graphicName = "直尾箭头";
    this.hintText = "单击开始绘制";
    this.minPointsForShape = 2;
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
      GeometryUtils.generateTailArrow(projectionPoints)
    );
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.STRAIGHT_TAIL_ARROW, StraightTailArrow as any);
