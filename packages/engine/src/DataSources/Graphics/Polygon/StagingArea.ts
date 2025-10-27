/*
 * @Descripttion: 集结地（区域）
 * @Author: Assistant
 * @version: 1.0.0
 * @Date: 2025-10-27
 */
import { Cartesian3, createGuid } from "cesium";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { GeometryDrawEventCallbackMap } from "../types";
import { GeometryType, GraphicType } from "../../../enum";
import { GeometryStyleMap } from "../../../types";
import registry from "../../../Core/GraphicRegistry";

export default class StagingArea extends AbstractPolygon {
  readonly graphicType = GraphicType.STAGING_AREA;
  readonly minPointsForShape = 3;

  constructor({
    core,
    style,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.POLYGON];
  }) {
    super({ core, style });

    this.graphicName = "集结地";
    this.hintText = "单击开始绘制";
  }

  protected addPoint(
    cartesian: Cartesian3,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ) {
    this.points.set(createGuid(), cartesian);

    if (this.points.size === 1) {
      this.hintText = "单击添加第二个点";
      this.onMouseMove();
    } else if (this.points.size === 2) {
      this.hintText = "单击结束绘制";
    } else if (this.points.size >= 3) {
      this.finishDrawing(callback);
    }
  }

  protected updateMovingPoint(cartesian: Cartesian3) {
    const tempPoints = [...this.getPoints(), cartesian];
    const geometryPoints = this.generateGeometry(tempPoints);
    this.setGeometryPoints(geometryPoints);
  }

  protected generateGeometry(points: Cartesian3[]): Cartesian3[] {
    if (!points?.length) return points;
    return points.concat(points[0]);
  }
}

// 模块内自注册
registry.registerGraphic(GraphicType.STAGING_AREA, StagingArea as any);