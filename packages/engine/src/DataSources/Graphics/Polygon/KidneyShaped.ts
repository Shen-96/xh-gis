/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-21 02:54:16
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:42:32
 */
import { GeometryDrawEventCallbackMap } from "../types";
import AbstractPolygon from "../Abstract/AbstractPolygon";
import AbstractCore from "../../../Core/AbstractCore";
import { Cartesian3, createGuid, Math as CesiumMath } from "cesium";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import MathUtils from "../../../Core/MathUtils";
import { GeometryStyleMap, Point, ProjectionPoint } from "../../../types";
import { GeometryType, GraphicType } from "../../../enum";

export default class KidneyShaped extends AbstractPolygon {
  graphicType: GraphicType;

  minPointsForShape: number;

  constructor({
    core,
    style,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.POLYGON];
  }) {
    super({
      core,
      style,
    });

    this.graphicType = GraphicType.KIDNEY_SHAPED;

    this.freehand = true;
    this.graphicName = "肾形闭合曲线";
    this.minPointsForShape = 3;
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

    this.hintText = "单击结束绘制";
    if (this.points.size === 1) {
      this.onMouseMove();
    } else if (this.points.size > 2) {
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
    const points = CoordinateUtils.car3ArrToProjectionPntArr(positions);
    const res = this.generateKidneyShape(points[0], points[1]);

    const cartesianPoints = CoordinateUtils.projPntArr2Cartesian3Arr(res);
    return cartesianPoints;
  }

  private generatePoints(
    center: Point,
    majorRadius: number,
    minorRadius: number
  ) {
    let [x, y, angle] = [-1, -1, 0];
    const points = [] as Point[];
    for (let i = 0; i <= 100; i++) {
      angle = (Math.PI * 2 * i) / 100;
      x = center[0] + majorRadius * Math.cos(angle);
      y = center[1] + minorRadius * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  }

  /**
   * @descripttion: 生成腰型闭合曲线
   * @param {ProjectionPoint} point1
   * @param {ProjectionPoint} point2
   * @param {*} a 控制宽长比
   * @param {*} b 控制腰部凹陷程度（建议 0.2 < c < 0.5）
   * @return {*}
   * @author: EV-申小虎
   */
  generateKidneyShape(
    point1: ProjectionPoint,
    point2: ProjectionPoint,
    a = 0.3,
    b = 0.3
  ) {
    const points: ProjectionPoint[] = []; // write by ai
    const centerX = (point1[0] + point2[0]) / 2; // write by ai
    const centerY = (point1[1] + point2[1]) / 2; // write by ai
    const width = Math.abs(point2[0] - point1[0]); // write by ai
    const height = Math.abs(point2[1] - point1[1]); // write by ai

    // 计算关键参数
    const rx = width / 2; // write by ai
    const ry = height * a; // write by ai
    const indent = ry * b; // 腰部凹陷深度 // write by ai

    // 生成上半圆 (从π到0)
    for (let angle = Math.PI; angle >= 0; angle -= Math.PI / 36) {
      // write by ai
      points.push([
        // write by ai
        centerX + rx * Math.cos(angle), // write by ai
        centerY - ry * Math.sin(angle), // write by ai
      ]); // write by ai
    }

    // 添加左侧凹陷点
    points.push([
      // write by ai
      centerX - rx * 0.7, // write by ai
      centerY + indent, // write by ai
    ]); // write by ai

    // 生成下半圆 (从0到π)
    for (let angle = 0; angle <= Math.PI; angle += Math.PI / 36) {
      // write by ai
      points.push([
        // write by ai
        centerX + rx * Math.cos(angle), // write by ai
        centerY + ry * Math.sin(angle), // write by ai
      ]); // write by ai
    }

    // 添加右侧凹陷点
    points.push([
      // write by ai
      centerX + rx * 0.7, // write by ai
      centerY + indent, // write by ai
    ]); // write by ai

    // 闭合曲线
    points.push(points[0]); // write by ai

    return points; // write by ai
  }
}
