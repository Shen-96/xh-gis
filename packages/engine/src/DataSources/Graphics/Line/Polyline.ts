/*
 * @Descripttion: Polyline Graphic
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 */
import { Cartesian3, createGuid } from "cesium";
import AbstractLine from "../Abstract/AbstractLine";
import AbstractCore from "../../../Core/AbstractCore";
import { GeometryDrawEventCallbackMap } from "../types";
import { GeometryType, GraphicType } from "../../../enum";
import { GeometryStyleMap, Point3Deg } from "../../../types";
import registry from "../../../Core/GraphicRegistry";

export default class Polyline extends AbstractLine {
  graphicType: GraphicType;
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
    super({
      core,
      style,
      positions,
    });

    this.graphicType = GraphicType.POLYLINE;
    this.graphicName = "折线";
    this.hintText = "单击开始绘制";
    this.minPointsForShape = 2;
  }

  /**
   * Add points on click events
   */
  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]
  ) {
    this.points.set(createGuid(), cartesian);

    if (this.points.size < 2) {
      this.hintText = "再次单击添加点，双击结束绘制";
      this.onMouseMove();
    } else {
      this.hintText = "继续单击添加点，双击结束绘制";
      this.onMouseMove();
    }
  }

  /**
   * Draw a shape based on mouse movement points during the initial drawing.
   */
  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    this.setGeometryPoints(tempPoints);
  }

  protected generateGeometry(points: Cartesian3[]): Cartesian3[] {
    return points;
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.POLYLINE, Polyline as any);

