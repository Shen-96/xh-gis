/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-19 01:31:27
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:42:12
 */
import {
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  CallbackProperty,
  PolylineGraphics,
  ImageMaterialProperty,
  JulianDate,
  PolylineArrowMaterialProperty,
  PolylineDashMaterialProperty,
} from "cesium";
import AbstractGraphic from "./AbstractGraphic";
import AbstractCore from "../../../Core/AbstractCore";
import { defaultLineStyle } from "../styles";
import { GeometryStyleMap, Point3Deg } from "../../../types";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import GraphicUtils from "../../../Core/GraphicUtils";
import { GeometryType } from "../../../enum";

export default abstract class AbstractLine extends AbstractGraphic<GeometryType.LINE> {
  geometryType: GeometryType.LINE;

  set style(val) {
    this._style = { ...defaultLineStyle, ...val };

    if (this.entity.polyline) {
      // if (val.material) {
      //   if (val.material instanceof Color) {
      //     this.entity.polyline.material = new ColorMaterialProperty(
      //       val.material
      //     );
      //   } else {
      //     this.entity.polyline.material = val.material;
      //   }
      // }

      // if (val.width) {
      //   if (typeof val.width === "number") {
      //     this.entity.polyline.width = new ConstantProperty(val.width);
      //   } else this.entity.polyline.width = val.width;
      // }
      const graphics = GraphicUtils.generatePolylineGraphicsOptionsFromStyle(
        this._style
      );
      this.entity.polyline = new PolylineGraphics(graphics);

      this.state == "static" ? this.drawStatic() : this.drawActive();
    }
  }

  get style() {
    return this._style;
  }

  setStyle(style?: GeometryStyleMap[GeometryType.LINE]) {
    this.style = style ?? defaultLineStyle;
  }

  constructor({
    core,
    style,
    positions,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.LINE];
    positions?: Point3Deg[];
  }) {
    super(core);
    this.geometryType = GeometryType.LINE;
  
    this.init();
    this.style = { ...defaultLineStyle, ...style };
  
    if (positions && positions.length) {
      this.setPositions(positions);
    }
  }

  protected init() {
    this.entity.polyline = new PolylineGraphics({
      positions: new CallbackProperty(() => this.geometryPoints, false),
    });
    this.viewer.entities.add(this.entity);
    // 延迟到 beginDraw 时再注册到 GraphicManager
    // this.core.graphicManager.add(this);
  }

  protected drawActive() {
    if (this.entity.polyline) {
      this.entity.polyline.positions = new CallbackProperty(
        () => this.geometryPoints,
        false
      );
    }
  }

  protected drawStatic() {
    if (this.entity.polyline) {
      this.entity.polyline.positions = new ConstantProperty(
        this.geometryPoints
      );
    }
  }

  beginDraw(
    callback?:
      | ((
          positions: Point3Deg[],
          self: AbstractGraphic<GeometryType.LINE>
        ) => void)
      | undefined
  ): void {
    this.setState("drawing");

    this.onLeftClick(callback);
  }

  finishDrawing(
    callback?:
      | ((
          positions: Point3Deg[],
          self: AbstractGraphic<GeometryType.LINE>
        ) => void)
      | undefined
  ): void {
    // Some polygons draw a separate line between the first two points before drawing the complete shape;
    // this line should be removed after drawing is complete.
    // this.geometryType === "polygon" &&
    //   this.lineEntity &&
    //   this.viewer.entities.remove(this.lineEntity);

    this.removeMoveListener();
    // Editable upon initial drawing completion.
    this.setState("edit");
    this.addControlPoints();
    this.draggable();
    // const entity = this.polygonEntity || this.lineEntity;
    // this.entityId = entity.id;
    /**
     * "I've noticed that CallbackProperty can lead to significant performance issues.
     *  After drawing multiple shapes, the map becomes noticeably laggy. Using methods
     * like requestAnimationFrame or setInterval doesn't provide a smooth way to display
     *  shapes during the drawing process. As a temporary solution, I've set the hierarchy
     *  or positions to static after drawing is complete. This addresses the performance
     *  problem, but introduces a new issue: after setting the data to static, the shapes
     *  redraw, resulting in a flicker. However, this seems to be a relatively reasonable
     *  approach given the current circumstances."
     */
    // TODO...
    // if (this.geometryType === 'polygon') {
    //   this.polygonEntity.polygon.hierarchy = new PolygonHierarchy(this.geometryPoints);
    //   this.outlineEntity.line.positions = [...this.geometryPoints, this.geometryPoints[0]];
    // } else if (this.geometryType === 'line') {
    //   this.lineEntity.line.positions = this.geometryPoints;
    // }

    this.eventDispatcher.dispatchEvent("drawEnd", this.getPoints());
    callback?.(CoordinateUtils.car3ArrToPoint3DegArr(this.getPoints()), this);
  }

  setPositions(positions: Point3Deg[]) {
    if (positions.length < this.minPointsForShape) return;

    const car3Arr = this.generateGeometry(
      CoordinateUtils.point3DegArrToCar3Arr(positions)
    );
    this.geometryPoints = car3Arr;

    this.drawActive();
    this.drawStatic();
  }

  showWithAnimation(
    duration: number = 2000,
    delay: number = 0,
    callback?: () => void,
    loop: boolean = false
  ) {
    if (this.state !== "hidden") {
      //If not in a static state or already displayed, do not process.
      return;
    }
    this.setState("static");

    let alpha = 1.0;
    const material = this.entity.polyline?.material;
    if (
      material instanceof ImageMaterialProperty ||
      material instanceof ColorMaterialProperty ||
      material instanceof PolylineArrowMaterialProperty ||
      material instanceof PolylineDashMaterialProperty
    ) {
      alpha = material.color?.getValue(JulianDate.now()).alpha;
    } else if (material instanceof Color) {
      alpha = material.alpha;
    }
    this.animateOpacity(
      this.entity,
      alpha,
      duration,
      delay,
      callback,
      this.state,
      loop
    );

    if (duration != 0) {
      this.setState("animating");
    }
  }

  hideWithAnimation(
    duration: number = 2000,
    delay: number = 0,
    callback?: () => void,
    loop: boolean = false
  ) {
    if (this.state != "static") {
      return;
    }
    this.setState("hidden");

    this.animateOpacity(
      this.entity,
      0.0,
      duration,
      delay,
      callback,
      this.state,
      loop
    );

    // if (this.state == 'edit') {
    // 	this.controlPoints.forEach(p => {
    // 		this.animateOpacity(p, 0.0, duration, delay, undefined, this.state);
    // 	});
    // }
    if (duration != 0) {
      this.setState("animating");
    }
  }
}