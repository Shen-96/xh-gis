/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-19 01:31:27
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:43:23
 */
import {
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  PolylineGraphics,
  ImageMaterialProperty,
  JulianDate,
  PolylineArrowMaterialProperty,
  PolylineDashMaterialProperty,
  PointGraphics,
  ConstantPositionProperty,
  Cartesian3,
  BillboardGraphics,
} from "cesium";
import AbstractGraphic from "./AbstractGraphic";
import { MarkStyle } from "../types";
import AbstractCore from "../../../Core/AbstractCore";
import { defaultPointStyle } from "../styles";
import { Point3Deg } from "../../../types";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import { GeometryType } from "../../../enum";

export default abstract class AbstractPoint extends AbstractGraphic<GeometryType.POINT> {
  geometryType: GeometryType.POINT;
  minPointsForShape: number;
  centerPoint?: Cartesian3;

  set style(val: MarkStyle) {
    this._style = { ...defaultPointStyle, ...val };

    const style = this._style as MarkStyle;

    if (this.entity.point) {
      if (style.pointStyle?.color) {
        if (style.pointStyle?.color instanceof Color) {
          this.entity.point.color = new ColorMaterialProperty(
            style.pointStyle?.color
          );
        } else {
          this.entity.point.color = style.pointStyle?.color;
        }
      }

      if (style.pointStyle?.outlineColor)
        if (style.pointStyle?.outlineColor instanceof Color) {
          this.entity.point.outlineColor = new ColorMaterialProperty(
            style.pointStyle?.outlineColor
          );
        } else {
          this.entity.point.outlineColor = style.pointStyle?.outlineColor;
        }

      if (style.pointStyle?.outlineWidth)
        if (typeof style.pointStyle?.outlineWidth === "number") {
          this.entity.point.outlineWidth = new ConstantProperty(
            style.pointStyle?.outlineWidth
          );
        } else {
          this.entity.point.outlineWidth = style.pointStyle?.outlineWidth;
        }

      if (style.pointStyle?.pixelSize) {
        if (typeof style.pointStyle?.pixelSize === "number") {
          this.entity.point.pixelSize = new ConstantProperty(
            style.pointStyle?.pixelSize
          );
        } else {
          this.entity.point.pixelSize = style.pointStyle?.pixelSize;
        }
      }
    }

    if (this.entity.billboard) {
      if (style.billboardStyle?.image) {
        this.entity.billboard.image = new ConstantProperty(
          style.billboardStyle?.image
        );
      }

      if (style.billboardStyle?.scale) {
        if (typeof style.billboardStyle?.scale === "number") {
          this.entity.billboard.scale = new ConstantProperty(
            style.billboardStyle?.scale
          );
        } else {
          this.entity.billboard.scale = style.billboardStyle?.scale;
        }
      }

      if (style.billboardStyle?.rotation) {
        if (typeof style.billboardStyle?.rotation === "number") {
          this.entity.billboard.rotation = new ConstantProperty(
            style.billboardStyle?.rotation
          );
        } else {
          this.entity.billboard.rotation = style.billboardStyle?.rotation;
        }
      }

      if (style.billboardStyle?.color) {
        if (style.billboardStyle?.color instanceof Color) {
          this.entity.billboard.color = new ColorMaterialProperty(
            style.billboardStyle?.color
          );
        } else {
          this.entity.billboard.color = style.billboardStyle?.color;
        }
      }

      if (style.billboardStyle?.sizeInMeters) {
        this.entity.billboard.sizeInMeters = new ConstantProperty(
          style.billboardStyle?.sizeInMeters
        );
      }

      if (style.billboardStyle?.alignedAxis) {
        if (style.billboardStyle?.alignedAxis instanceof Cartesian3) {
          this.entity.billboard.alignedAxis = new ConstantProperty(
            style.billboardStyle?.alignedAxis
          );
        } else {
          this.entity.billboard.alignedAxis = style.billboardStyle?.alignedAxis;
        }
      }

      if (style.billboardStyle?.width) {
        if (typeof style.billboardStyle?.width === "number") {
          this.entity.billboard.width = new ConstantProperty(
            style.billboardStyle?.width
          );
        } else {
          this.entity.billboard.width = style.billboardStyle?.width;
        }
      }

      if (style.billboardStyle?.height) {
        if (typeof style.billboardStyle?.height === "number") {
          this.entity.billboard.height = new ConstantProperty(
            style.billboardStyle?.height
          );
        } else {
          this.entity.billboard.height = style.billboardStyle?.height;
        }
      }
    }
  }

  get style(): MarkStyle {
    return this._style;
  }

  setStyle(style?: MarkStyle) {
    this.style = style ?? defaultPointStyle;
  }

  constructor({ core, style }: { core: AbstractCore; style?: MarkStyle }) {
    super(core);

    this.minPointsForShape = 2;
    this.geometryType = GeometryType.POINT;
    this.centerPoint = undefined;
    this.style = { ...defaultPointStyle, ...style };

    this.init();
  }

  protected init() {
    this.viewer.entities.add(this.entity);
    // 延迟到 beginDraw 时再注册到 GraphicManager
    // this.core.graphicManager.add(this);
  }

  protected drawActive() {
    this.entity.position = new ConstantPositionProperty(this.centerPoint);
    this.entity.point = new PointGraphics({
      color: this.style.pointStyle?.color,
      pixelSize: this.style.pointStyle?.pixelSize,
      outlineColor: this.style.pointStyle?.outlineColor,
      outlineWidth: this.style.pointStyle?.outlineWidth,
    });
    this.entity.billboard = new BillboardGraphics({
      image: this.style.billboardStyle?.image,
      scale: this.style.billboardStyle?.scale,
      rotation: this.style.billboardStyle?.rotation,
      color: this.style.billboardStyle?.color,
      sizeInMeters: this.style.billboardStyle?.sizeInMeters,
      alignedAxis: this.style.billboardStyle?.alignedAxis,
      width: this.style.billboardStyle?.width,
      height: this.style.billboardStyle?.height,
    });
  }

  protected drawStatic(): void {
    this.entity.position = new ConstantPositionProperty(this.centerPoint);
  }

  beginDraw(
    callback?:
      | ((
          position: Point3Deg,
          self: AbstractGraphic<GeometryType.POINT>
        ) => void)
      | undefined
  ): void {
    this.setState("drawing");
    // 在开始绘制时注册到 GraphicManager
    this.core.graphicManager.add(this);

    this.onLeftClick(callback);
  }

  finishDrawing(
    callback?:
      | ((
          position: Point3Deg,
          self: AbstractGraphic<GeometryType.POINT>
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
    callback?.(CoordinateUtils.car3ToPoint3Deg(this.getPoints()[0]), this);
  }

  setPosition(position: Point3Deg) {
    const car3Arr = this.generateGeometry([
      CoordinateUtils.pointToCar3(position),
    ]);
    this.geometryPoints = car3Arr;

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
    const material = this.style.pointStyle?.color;
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