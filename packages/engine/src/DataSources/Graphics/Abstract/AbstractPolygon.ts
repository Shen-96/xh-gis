/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-19 01:31:27
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:43:54
 */
import {
  Color,
  ColorMaterialProperty,
  ConstantProperty,
  PolygonHierarchy,
  PolygonGraphics,
  CallbackProperty,
  PolylineGraphics,
  ImageMaterialProperty,
  JulianDate,
  PolylineArrowMaterialProperty,
  PolylineDashMaterialProperty,
  Entity,
  createGuid,
  CustomDataSource,
  Cartesian3,
} from "cesium";
import AbstractCore from "../../../Core/AbstractCore";
import AbstractGraphic from "./AbstractGraphic";
import { BillboardStyle } from "../types";
import { defaultPolygonStyle } from "../styles";
import { GeometryStyleMap, Point3Deg } from "../../../types";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import GraphicUtils from "../../../Core/GraphicUtils";
import { GeometryType } from "../../../enum";

export default abstract class AbstractPolygon extends AbstractGraphic<GeometryType.POLYGON> {
  geometryType: GeometryType.POLYGON;

  readonly outlineEntity = new Entity();

  readonly markCollection = new CustomDataSource("markCollection");

  set style(val) {
    this._style = { ...defaultPolygonStyle, ...val };

    // if (this.entity.polygon && val.material) {
    //   if (val.material instanceof Color) {
    //     this.entity.polygon.material = new ColorMaterialProperty(val.material);
    //   } else {
    //     this.entity.polygon.material = val.material;
    //   }
    // }
    if (this.entity.polygon) {
      const graphics = GraphicUtils.generatePolygonGraphicsOptionsFromStyle(
        this._style
      );

      this.entity.polygon = new PolygonGraphics(graphics);
    }

    if (this.outlineEntity.polyline) {
      // this.outlineEntity.polyline.show = new ConstantProperty(
      //   val.outline ?? true
      // );

      // if (val.outlineMaterial) {
      //   if (val.outlineMaterial instanceof Color) {
      //     this.outlineEntity.polyline.material = new ColorMaterialProperty(
      //       val.outlineMaterial
      //     );
      //   } else {
      //     this.outlineEntity.polyline.material = val.outlineMaterial;
      //   }
      // }

      // if (val.outlineWidth) {
      //   if (typeof val.outlineWidth === "number") {
      //     this.outlineEntity.polyline.width = new ConstantProperty(
      //       val.outlineWidth
      //     );
      //   } else this.outlineEntity.polyline.width = val.outlineWidth;
      // }
      const outlineGraphics =
        GraphicUtils.generateOutlineGraphicsOptionsFromStyle(this._style);

      this.outlineEntity.polyline = new PolylineGraphics(outlineGraphics);
    }

    this.state == "static" ? this.drawStatic() : this.drawActive();
  }

  get style() {
    return this._style;
  }

  setStyle(style?: GeometryStyleMap[GeometryType.POLYGON]) {
    this.style = style ?? defaultPolygonStyle;
  }

  constructor({
    core,
    style,
  }: {
    core: AbstractCore;
    style?: GeometryStyleMap[GeometryType.POLYGON];
  }) {
    super(core);
    this.geometryType = GeometryType.POLYGON;

    this.init();
    this.style = { ...defaultPolygonStyle, ...style };
  }

  protected init() {
    this.entity.polygon = new PolygonGraphics({
      hierarchy: new CallbackProperty(
        () => new PolygonHierarchy(this.geometryPoints),
        false
      ),
      stRotation: new CallbackProperty(() => {
        return this.style.stRotation ?? 0;
      }, false),
    });
    this.viewer.entities.add(this.entity);
    this.outlineEntity.polyline = new PolylineGraphics({
      positions: new CallbackProperty(() => {
        return this.geometryPoints;
      }, false),
    });
    this.viewer.entities.add(this.outlineEntity);
    this.viewer.dataSources.add(this.markCollection);
    // 延迟到 beginDraw 时再注册到 GraphicManager
    // this.core.graphicManager.add(this);
  }

  protected drawActive() {
    if (this.entity.polygon) {
      this.entity.polygon.hierarchy = new CallbackProperty(
        () => new PolygonHierarchy(this.geometryPoints),
        false
      );
      this.entity.polygon.stRotation = new CallbackProperty(() => {
        return this.style.stRotation ?? 0;
      }, false);
    }

    // Due to limitations in PolygonGraphics outlining, a separate line style is drawn.
    if (this.outlineEntity.polyline) {
      this.outlineEntity.polyline.positions = new CallbackProperty(() => {
        return this.geometryPoints;
      }, false);
    }
  }

  protected drawStatic(): void {
    if (this.entity.polygon) {
      this.entity.polygon.hierarchy = new ConstantProperty(
        new PolygonHierarchy(this.geometryPoints)
      );
    }

    // Due to limitations in PolygonGraphics outlining, a separate line style is drawn.
    if (this.outlineEntity.polyline) {
      this.outlineEntity.polyline.positions = new ConstantProperty(
        this.geometryPoints
      );
    }
  }

  beginDraw(
    callback?: (
      positions: Point3Deg[],
      self: AbstractGraphic<GeometryType.POLYGON>
    ) => void
  ): void {
    this.setState("drawing");
    // 在开始绘制时注册到 GraphicManager
    this.core.graphicManager.add(this);

    this.onLeftClick(callback);
  }

  finishDrawing(
    callback?:
      | ((
          positions: Point3Deg[],
          self: AbstractGraphic<GeometryType.POLYGON>
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

  protected addTempLine() {
    if (!this.tempLineEntity) {
      // The line style between the first two points matches the outline style.
      this.tempLineEntity = this.viewer.entities.add({
        polyline: {
          ...GraphicUtils.generateOutlineGraphicsOptionsFromStyle(this._style),
          positions: new CallbackProperty(() => this.geometryPoints, false),
        },
      });
    }
  }

  protected removeTempLine() {
    if (this.tempLineEntity) {
      this.viewer.entities.remove(this.tempLineEntity);
    }
  }

  setPositions(positions: Point3Deg[]) {
    if (positions.length < this.minPointsForShape) return;

    const car3Arr = CoordinateUtils.point3DegArrToCar3Arr(positions);

    this.points.clear();
    car3Arr.forEach((car3) => {
      this.points.set(createGuid(), car3);
    });

    const tempCar3Arr = this.generateGeometry(car3Arr);
    this.geometryPoints = tempCar3Arr;

    this.drawActive();
    this.drawStatic();
  }

  setMarks(marks: BillboardStyle[]) {
    this.markCollection.entities.removeAll();

    const points = this.getPoints();
    const start = Cartesian3.lerp(points[1], points[0], 0.2, new Cartesian3()),
      end = Cartesian3.lerp(points[1], points[0], 0.6, new Cartesian3());

    marks.forEach(({ image, width, height }, index) => {
      const position = new Cartesian3();
      Cartesian3.lerp(start, end, index / (marks.length - 1), position);
      this.markCollection.entities.add({
        position,
        billboard: {
          image,
          width: width ?? 32,
          height: height ?? 32,
        },
      });
    });
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

    let alpha = 0.3;
    const material = this.entity.polygon?.material;
    if (material instanceof ImageMaterialProperty) {
      // With Texture
      alpha = material.color?.getValue(JulianDate.now()).alpha;
    } else if (material instanceof Color) {
      alpha = material.alpha;
    }

    let outlineAlpha = 1.0;
    const outlineMaterial = this.outlineEntity.polyline?.material;
    if (
      outlineMaterial instanceof ImageMaterialProperty ||
      outlineMaterial instanceof ColorMaterialProperty ||
      outlineMaterial instanceof PolylineArrowMaterialProperty ||
      outlineMaterial instanceof PolylineDashMaterialProperty
    ) {
      outlineAlpha = outlineMaterial.color?.getValue(JulianDate.now()).alpha;
    } else if (outlineMaterial instanceof Color) {
      outlineAlpha = outlineMaterial.alpha;
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
    this.animateOpacity(
      this.outlineEntity,
      outlineAlpha,
      duration,
      delay,
      undefined,
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
    this.animateOpacity(
      this.outlineEntity,
      0.0,
      duration,
      delay,
      undefined,
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

  remove(_source?: "manager") {
    this.stopAnimation();
    this.setState("static");

    this.viewer.entities.remove(this.entity);
    this.viewer.entities.remove(this.outlineEntity);
    this.viewer.dataSources.remove(this.markCollection);
    this.removeLeftClickListener();
    this.removeMoveListener();
    this.removeDoubleClickListener();
    this.removeControlPoints();

    _source !== "manager" && this.core.graphicManager.removeById(this.id);
  }
}
