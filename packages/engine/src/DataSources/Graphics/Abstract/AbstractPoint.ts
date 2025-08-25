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
    this.style = { ...defaultPointStyle, ...val };

    if (this.entity.point) {
      if (val.pointStyle?.color) {
        if (val.pointStyle?.color instanceof Color) {
          this.entity.point.color = new ColorMaterialProperty(
            val.pointStyle?.color
          );
        } else {
          this.entity.point.color = val.pointStyle?.color;
        }
      }

      if (val.pointStyle?.outlineColor)
        if (val.pointStyle?.outlineColor instanceof Color) {
          this.entity.point.outlineColor = new ColorMaterialProperty(
            val.pointStyle?.outlineColor
          );
        } else {
          this.entity.point.outlineColor = val.pointStyle?.outlineColor;
        }

      if (val.pointStyle?.outlineWidth)
        if (typeof val.pointStyle?.outlineWidth === "number") {
          this.entity.point.outlineWidth = new ConstantProperty(
            val.pointStyle?.outlineWidth
          );
        } else {
          this.entity.point.outlineWidth = val.pointStyle?.outlineWidth;
        }

      if (val.pointStyle?.pixelSize) {
        if (typeof val.pointStyle?.pixelSize === "number") {
          this.entity.point.pixelSize = new ConstantProperty(
            val.pointStyle?.pixelSize
          );
        } else {
          this.entity.point.pixelSize = val.pointStyle?.pixelSize;
        }
      }
    }

    if (this.entity.billboard) {
      if (val.billboardStyle?.image) {
        this.entity.billboard.image = new ConstantProperty(
          val.billboardStyle?.image
        );
      }

      if (val.billboardStyle?.scale) {
        if (typeof val.billboardStyle?.scale === "number") {
          this.entity.billboard.scale = new ConstantProperty(
            val.billboardStyle?.scale
          );
        } else {
          this.entity.billboard.scale = val.billboardStyle?.scale;
        }
      }

      if (val.billboardStyle?.rotation) {
        if (typeof val.billboardStyle?.rotation === "number") {
          this.entity.billboard.rotation = new ConstantProperty(
            val.billboardStyle?.rotation
          );
        } else {
          this.entity.billboard.rotation = val.billboardStyle?.rotation;
        }
      }

      if (val.billboardStyle?.color) {
        if (val.billboardStyle?.color instanceof Color) {
          this.entity.billboard.color = new ColorMaterialProperty(
            val.billboardStyle?.color
          );
        } else {
          this.entity.billboard.color = val.billboardStyle?.color;
        }
      }

      if (val.billboardStyle?.sizeInMeters) {
        this.entity.billboard.sizeInMeters = new ConstantProperty(
          val.billboardStyle?.sizeInMeters
        );
      }

      if (val.billboardStyle?.alignedAxis) {
        if (val.billboardStyle?.alignedAxis instanceof Cartesian3) {
          this.entity.billboard.alignedAxis = new ConstantProperty(
            val.billboardStyle?.alignedAxis
          );
        } else {
          this.entity.billboard.alignedAxis = val.billboardStyle?.alignedAxis;
        }
      }

      if (val.billboardStyle?.width) {
        if (typeof val.billboardStyle?.width === "number") {
          this.entity.billboard.width = new ConstantProperty(
            val.billboardStyle?.width
          );
        } else {
          this.entity.billboard.width = val.billboardStyle?.width;
        }
      }

      if (val.billboardStyle?.height) {
        if (typeof val.billboardStyle?.height === "number") {
          this.entity.billboard.height = new ConstantProperty(
            val.billboardStyle?.height
          );
        } else {
          this.entity.billboard.height = val.billboardStyle?.height;
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

  constructor({ xgCore, style }: { xgCore: AbstractCore; style?: MarkStyle }) {
    super(xgCore);

    this.minPointsForShape = 2;
    this.geometryType = GeometryType.POINT;
    this.centerPoint = undefined;
    this.style = { ...defaultPointStyle, ...style };

    this.init();
  }

  protected init() {
    this.viewer.entities.add(this.entity);
    this.core.graphicManager.add(this);
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
