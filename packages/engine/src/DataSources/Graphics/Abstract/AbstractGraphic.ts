import {
  Viewer,
  ScreenSpaceEventHandler,
  Entity,
  Cartesian3,
  defined,
  HeightReference,
  JulianDate,
  PolygonGraphics,
  ScreenSpaceEventType,
  ConstantPositionProperty,
  ImageMaterialProperty,
  PolylineGraphics,
  ColorMaterialProperty,
  PolylineArrowMaterialProperty,
  PolylineDashMaterialProperty,
} from "cesium";
import AbstractCore from "../../../Core/AbstractCore";
import {
  State,
  EventType,
  EventListener,
  VisibleAnimationOpts,
  GrowthAnimationOpts,
  FlashAnimationOpts,
  GeometryDrawEventCallbackMap,
} from "../types";
import EventDispatcher from "../events";
import MouseEventUtils from "../../../Core/MouseEventUtils";
import CoordinateUtils from "../../../Core/CoordinateUtils";
import { defaultControlPointStyle } from "../styles";
import { CoreType, GeometryType, GraphicType } from "../../../enum";
import { GeometryStyleMap, Point3Deg } from "../../../types";

// 定义具体的 GeometryDrawEventCallbackMap 类型，引用 AbstractGraphic 类自身
interface ConcreteGeometryDrawEventCallbackMap extends GeometryDrawEventCallbackMap {
  [GeometryType.POINT]: (
    position: Point3Deg,
    self: AbstractGraphic<GeometryType.POINT>
  ) => void;
  [GeometryType.LINE]: (
    positions: Point3Deg[],
    self: AbstractGraphic<GeometryType.LINE>
  ) => void;
  [GeometryType.POLYGON]: (
    positions: Point3Deg[],
    self: AbstractGraphic<GeometryType.POLYGON>
  ) => void;
}

export default abstract class AbstractGraphic<T extends GeometryType> {
  protected readonly core: AbstractCore<CoreType>;
  protected readonly viewer: Viewer;

  abstract readonly geometryType: T;

  getGeometryType(): T {
    return this.geometryType;
  }

  abstract readonly graphicType: GraphicType;

  protected _graphicName?: string;
  set graphicName(val: string | undefined) {
    this._graphicName = val;
  }
  get graphicName(): string | undefined {
    return this._graphicName;
  }

  protected _style: GeometryStyleMap[T] = {};
  abstract set style(val: GeometryStyleMap[T]);
  abstract get style(): GeometryStyleMap[T];

  private _state: State = "static";

  set state(val: State) {
    this._state = val;
    if (val == "static") {
      this.drawStatic();
    } else {
      this.drawActive();
      this.setHintShow(val == "drawing");
    }
  }

  get state(): State {
    return this._state;
  }

  /**
   * The base class provides a method to change the state, and different logic is implemented based on the state.
   *  The state is controlled by individual sub-components according to the actual situation.
   * @param state
   */
  protected setState(state: State) {
    this.state = state;
  }

  protected getState(): State {
    return this.state;
  }

  readonly eventHandler: ScreenSpaceEventHandler;

  readonly entity = new Entity();

  get id(): string {
    return this.entity.id;
  }

  readonly points: Map<string, Cartesian3> = new Map();
  protected geometryPoints: Cartesian3[] = [];
  protected controlPointEntities: Entity[] = [];
  protected readonly controlPointsEventHandler: ScreenSpaceEventHandler;
  protected freehand: boolean = false;

  protected eventDispatcher: EventDispatcher;

  protected readonly dragEventHandler: ScreenSpaceEventHandler;
  // entityId: string = "";

  abstract readonly minPointsForShape: number;

  protected tempLineEntity?: Entity;

  protected hintText: string = "";
  private originpointer: string | undefined;
  protected hintDiv: HTMLElement | undefined;
  protected hintUpdatefunc?: (evt: any) => void;

  protected animationids: number[] = [];

  /// The attributes of the geometry shape, such as the name, custom attributes, etc.
  readonly attributes: { [key: string]: any } = {};

  constructor(
    core: AbstractCore<CoreType>,
    attributes: { [key: string]: any } = {}
  ) {
    this.core = core;
    this.viewer = core.viewer;

    this.eventHandler = new ScreenSpaceEventHandler(this.viewer.canvas);

    this.eventDispatcher = new EventDispatcher();

    this.controlPointsEventHandler = new ScreenSpaceEventHandler(
      this.viewer.canvas
    );

    this.dragEventHandler = new ScreenSpaceEventHandler(this.viewer.canvas);

    // Disable default behavior for double-clicking on entities.
    this.viewer.trackedEntity = undefined;
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    this.attributes = attributes;
  }

  protected abstract init(): void;

  protected abstract drawActive(): void;

  protected abstract drawStatic(): void;

  private setHintShow(hintshow: boolean): void {
    this.viewer.scene.postUpdate.removeEventListener(this.updateHint, this);

    if (hintshow === true) {
      if (this.originpointer == null) {
        this.originpointer = this.viewer.scene.canvas.style.cursor;
      }

      this.viewer.scene.canvas.style.cursor = "crosshair";
      if (this.hintDiv == null) {
        this.hintDiv = document.createElement("div");
        this.hintDiv.style.pointerEvents = "none";
        this.hintDiv.style.padding = "0 3px";
        this.hintDiv.style.borderRadius = "2px";
        this.hintDiv.style.position = "absolute";
        this.hintDiv.style.background = "#00000066";
        this.hintDiv.style.color = "white";
        document.body.appendChild(this.hintDiv);
      }
      this.hintUpdatefunc = this.updateHint.bind(this);
      this.viewer.scene.canvas.addEventListener(
        "mousemove",
        this.hintUpdatefunc
      );
    } else {
      if (this.originpointer != null) {
        this.viewer.scene.canvas.style.cursor = this.originpointer;
        this.originpointer = undefined;
      }
      if (this.hintDiv != null) {
        document.body.removeChild(this.hintDiv);
        this.hintDiv = undefined;
      }
      this.viewer.scene.canvas.removeEventListener(
        "mousemove",
        () => this.hintUpdatefunc
      );
    }
  }

  private updateHint(evt: any): void {
    if (this.state != "drawing" || this.hintDiv == undefined) return;

    this.hintDiv.innerText = this.hintText;
    const unit = "px";
    this.hintDiv.style.top = evt.clientY + unit;
    this.hintDiv.style.left = evt.clientX + 12 + unit;
  }

  /**
   * Bind a global click event that responds differently based on the state. When in the drawing state,
   * a click will add points for geometric shapes. During editing, selecting a drawn shape puts it in an
   *  editable state. Clicking on empty space sets it to a static state.
   */
  protected onLeftClick(callback?: ConcreteGeometryDrawEventCallbackMap[T]) {
    MouseEventUtils.setLeftClickListener(this.eventHandler, (res) => {
      if (res.screenPosition == undefined) return;

      const pickedObject = CoordinateUtils.getPickedObject(
        this.viewer,
        res.screenPosition
      );
      const hitEntities =
        defined(pickedObject) && pickedObject?.id instanceof Entity;

      const activeEntity = this.entity;

      if (this.state === "drawing") {
        // In the drawing state, the points clicked are key nodes of the shape, and they are saved in this.points.
        const cartesian = CoordinateUtils.getViewCartesian3(
          this.viewer,
          res.screenPosition
        );
        const points = this.getPoints();

        // If the click is outside the sphere, position information cannot be obtained.
        if (!cartesian) {
          return;
        }

        // "For non-freehand drawn shapes, validate that the distance between two consecutive clicks is greater than 10 meters
        if (
          !this.freehand &&
          points.length > 0 &&
          !this.checkDistance(cartesian, points[points.length - 1])
        ) {
          return;
        }
        this.addPoint(cartesian, callback);

        // Trigger 'drawStart' when the first point is being drawn.
        if (this.getPoints().length === 1) {
          this.eventDispatcher.dispatchEvent("drawStart");
        }
        this.eventDispatcher.dispatchEvent("drawUpdate", cartesian);
      } else if (this.state === "edit") {
        //In edit mode, exit the editing state and delete control points when clicking outside the currently edited shape.
        if (!hitEntities || activeEntity?.id !== pickedObject?.id?.id) {
          this.state = "static";
          this.removeControlPoints();
          this.disableDrag();
          // Trigger 'drawEnd' and return the geometry shape points when exiting the edit mode.
          this.eventDispatcher.dispatchEvent("editEnd", this.getPoints());
        }
      } else if (this.state === "static") {
        //When drawing multiple shapes, the click events for all shapes are triggered. Only when hitting a completed shape should it enter editing mode.
        if (hitEntities && activeEntity?.id === pickedObject?.id?.id) {
          const pickedGraphics =
            this.geometryType === "point"
              ? pickedObject.id.point
              : this.geometryType === "line"
              ? pickedObject.id.polyline
              : pickedObject.id.polygon;
          if (defined(pickedGraphics)) {
            // Hit Geometry Shape.
            this.setState("edit");
            this.addControlPoints();
            this.draggable();
            this.eventDispatcher.dispatchEvent("editStart");
          }
        }
      }
    });
  }

  onMouseMove() {
    MouseEventUtils.setMoveListener(this.eventHandler, (res) => {
      const points = this.getPoints();
      const cartesian =
        res.screenPosition &&
        CoordinateUtils.getViewCartesian3(this.viewer, res.screenPosition);
      if (!cartesian) {
        return;
      }
      if (this.checkDistance(cartesian, points[points.length - 1])) {
        // Synchronize data to subclasses.If the distance is less than 10 meters, do not proceed
        this.updateMovingPoint(cartesian);
      }
    });
  }

  onLeftDoubleClick(callback?: ConcreteGeometryDrawEventCallbackMap[T]) {
    MouseEventUtils.setLeftDoubleClickListener(this.eventHandler, () => {
      if (this.state === "drawing") {
        this.finishDrawing(callback);
      }
    });
  }

  /**
   * Check if the distance between two points is greater than 10 meters.
   */
  protected checkDistance(cartesian1: Cartesian3, cartesian2: Cartesian3) {
    const distance = Cartesian3.distance(cartesian1, cartesian2);
    return distance > 10;
  }

  abstract beginDraw(callback?: ConcreteGeometryDrawEventCallbackMap[T]): void;

  protected abstract finishDrawing(
    callback?: ConcreteGeometryDrawEventCallbackMap[T]
  ): void;

  protected removeLeftClickListener() {
    this.eventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
  }

  protected removeMoveListener() {
    this.eventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
  }

  protected removeDoubleClickListener() {
    this.eventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  protected setGeometryPoints(geometryPoints: Cartesian3[]) {
    this.geometryPoints = geometryPoints;
  }

  getGeometryPoints(): Cartesian3[] {
    return this.geometryPoints.map((i) => i.clone());
  }

  /**
   * Display key points when creating a shape, allowing dragging of these points to edit and generate new shapes.
   */
  protected addControlPoints() {
    this.controlPointEntities = [
      ...Array.from(this.points.entries()).map(([id, position]) => {
        return this.viewer.entities.add({
          id,
          position,
          point: {
            ...defaultControlPointStyle,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: 1000000000,
          },
        });
      }),
    ];

    let isDragging = false;
    let draggedIcon: Entity | null;
    let dragStartPosition: Cartesian3 | null;

    // Listen for left mouse button press events
    MouseEventUtils.setLeftDownListener(
      this.controlPointsEventHandler,
      (res) => {
        const pickedObject =
          res.screenPosition &&
          CoordinateUtils.getPickedObject(this.viewer, res.screenPosition)?.id;

        if (defined(pickedObject)) {
          for (let i = 0; i < this.controlPointEntities.length; i++) {
            if (pickedObject?.id === this.controlPointEntities[i].id) {
              isDragging = true;
              draggedIcon = pickedObject;
              dragStartPosition =
                draggedIcon.position?.getValue(JulianDate.now()) ?? null;
              //Save the index of dragged points for dynamic updates during movement
              // draggedIcon.properties?.addProperty("index", i);
              break;
            }
          }
          // Disable default camera interaction.
          this.viewer.scene.screenSpaceCameraController.enableRotate = false;
          if (this.core.coreType == CoreType.MAP) {
            this.viewer.scene.screenSpaceCameraController.enableTranslate =
              false;
          }
        }
      }
    );

    // Listen for mouse movement events
    MouseEventUtils.setMoveListener(this.controlPointsEventHandler, (res) => {
      if (isDragging && draggedIcon) {
        const cartesian =
          res.screenPosition &&
          this.viewer.camera.pickEllipsoid(
            res.screenPosition,
            this.viewer.scene.globe.ellipsoid
          );
        if (cartesian) {
          draggedIcon.position = new ConstantPositionProperty(cartesian);
          this.updateDraggingPoint(cartesian, draggedIcon.id);
        }
      }
    });

    // Listen for left mouse button release events
    MouseEventUtils.setLeftUpListener(this.controlPointsEventHandler, () => {
      // Trigger 'drawUpdate' when there is a change in coordinates before and after dragging.
      if (
        draggedIcon &&
        !Cartesian3.equals(
          dragStartPosition ?? undefined,
          draggedIcon.position?.getValue(JulianDate.now())
        )
      ) {
        this.eventDispatcher.dispatchEvent(
          "drawUpdate",
          draggedIcon.position?.getValue(JulianDate.now())
        );
      }
      isDragging = false;
      draggedIcon = null;
      this.viewer.scene.screenSpaceCameraController.enableRotate = true;
      if (this.core.coreType == CoreType.MAP) {
        this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
      }
    });
  }

  removeControlPoints() {
    if (this.controlPointEntities.length > 0) {
      this.controlPointEntities.forEach((entity: Entity) => {
        this.viewer.entities.remove(entity);
      });
      this.controlPointsEventHandler.removeInputAction(
        ScreenSpaceEventType.LEFT_DOWN
      );
      this.controlPointsEventHandler.removeInputAction(
        ScreenSpaceEventType.MOUSE_MOVE
      );
      this.controlPointsEventHandler.removeInputAction(
        ScreenSpaceEventType.LEFT_UP
      );
    }
  }

  /**
   * Allow the entire shape to be dragged while in edit mode.
   */
  draggable() {
    let dragging = false;
    let startPosition: Cartesian3 | undefined;

    MouseEventUtils.setLeftDownListener(this.dragEventHandler, (res) => {
      if (!res.screenPosition) return;

      const cartesian = CoordinateUtils.getViewCartesian3(
        this.viewer,
        res.screenPosition
      );

      if (cartesian) {
        const pickedObject = CoordinateUtils.getPickedObject(
          this.viewer,
          res.screenPosition
        );

        if (pickedObject?.id instanceof Entity) {
          const clickedEntity = pickedObject.id;
          if (this.isCurrentEntity(clickedEntity.id)) {
            //Clicking on the current instance's entity initiates drag logic.
            dragging = true;
            startPosition = cartesian;
            this.viewer.scene.screenSpaceCameraController.enableRotate = false;
          }
        }
      }
    });

    MouseEventUtils.setMoveListener(this.dragEventHandler, (res) => {
      if (!res.screenPosition) return;

      if (dragging && startPosition) {
        // Retrieve the world coordinates of the current mouse position.
        const newPosition = CoordinateUtils.getViewCartesian3(
          this.viewer,
          res.screenPosition
        );
        if (newPosition) {
          // Calculate the displacement vector.
          const translation = Cartesian3.subtract(
            newPosition,
            startPosition,
            new Cartesian3()
          );
          const newPoints = this.geometryPoints.map((p) => {
            return Cartesian3.add(p, translation, new Cartesian3());
          });

          //Move all key points according to a vector.
          this.points.forEach((p, key) => {
            this.points.set(
              key,
              Cartesian3.add(p, translation, new Cartesian3())
            );
          });

          // Move control points in the same manner.
          this.controlPointEntities.map((p: Entity) => {
            const position = p.position?.getValue(JulianDate.now());
            const newPosition =
              position &&
              Cartesian3.add(position, translation, new Cartesian3());

            newPosition &&
              (p.position = new ConstantPositionProperty(newPosition));
          });

          this.setGeometryPoints(newPoints);
          if (this.minPointsForShape === 4) {
            // 双箭头在整体被拖拽时，需要同步更新生长动画的插值点
            // this.curveControlPointLeft = Cartesian3.add(
            //   this.curveControlPointLeft,
            //   translation,
            //   new Cartesian3()
            // );
            // this.curveControlPointRight = Cartesian3.add(
            //   this.curveControlPointRight,
            //   translation,
            //   new Cartesian3()
            // );
          }
          startPosition = newPosition;
        }
      } else {
        if (dragging === false) return;
        const pickedObject = CoordinateUtils.getPickedObject(
          this.viewer,
          res.screenPosition
        );
        if (defined(pickedObject) && pickedObject?.id instanceof Entity) {
          const clickedEntity = pickedObject.id;
          // TODO 绘制的图形，需要特殊id标识，可在创建entity时指定id
          if (this.isCurrentEntity(clickedEntity.id)) {
            this.viewer.scene.canvas.style.cursor = "move";
          } else {
            this.viewer.scene.canvas.style.cursor = "default";
          }
        } else {
          this.viewer.scene.canvas.style.cursor = "default";
        }
      }
    });

    // Listen for the mouse release event to end dragging.
    MouseEventUtils.setLeftUpListener(this.dragEventHandler, () => {
      dragging = false;
      startPosition = undefined;
      this.viewer.scene.screenSpaceCameraController.enableRotate = true;
    });
  }

  // Finish editing, disable dragging."
  disableDrag() {
    this.dragEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
    this.dragEventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
    this.dragEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_UP);
  }

  show(opts?: VisibleAnimationOpts) {
    if (opts) {
      const { duration, delay, callback, loop } = opts;
      this.showWithAnimation(duration, delay, callback, loop);
      return;
    } else {
      this.showWithAnimation(0, 0);
    }
  }

  hide(opts?: VisibleAnimationOpts) {
    if (opts) {
      const { duration, delay, callback, loop } = opts;
      this.hideWithAnimation(duration, delay, callback, loop);
      return;
    } else {
      this.hideWithAnimation(0, 0);
    }
  }

  protected abstract showWithAnimation(
    duration?: number,
    delay?: number,
    callback?: () => void,
    loop?: boolean
  ): void;

  protected abstract hideWithAnimation(
    duration?: number,
    delay?: number,
    callback?: () => void,
    loop?: boolean
  ): void;

  protected stopAnimation() {
    this.animationids.forEach((aniid) => {
      cancelAnimationFrame(aniid);
    });
    this.animationids = [];
    // this.updateStyle();
    const geometryPoints = this.generateGeometry(this.getPoints());
    this.setGeometryPoints(geometryPoints);
  }

  protected animateOpacity(
    entity: Entity,
    targetAlpha: number,
    duration: number,
    delay: number,
    callback?: () => void,
    state?: State,
    loop?: boolean
  ): void {
    const aniidx = this.animationids.length;
    const afterdelayfunc = () => {
      const graphics = entity.polygon ?? entity.polyline ?? entity.billboard;

      let startAlpha: number;

      if (
        graphics instanceof PolygonGraphics ||
        graphics instanceof PolylineGraphics
      ) {
        const material = graphics.material;

        if (
          material instanceof ImageMaterialProperty ||
          material instanceof ColorMaterialProperty ||
          material instanceof PolylineArrowMaterialProperty ||
          material instanceof PolylineDashMaterialProperty
        ) {
          // Texture material, setting the alpha channel in the color of the custom ImageFlowMaterialProperty.
          startAlpha = material.color?.getValue(JulianDate.now()).alpha;
        }
      } else {
        // billbord
        const color = graphics?.color?.getValue(JulianDate.now());
        startAlpha = color.alpha;
      }

      let startTime = 0;

      const animate = (currentTime: number) => {
        if (!startTime) {
          startTime = currentTime;
        }
        const elapsedTime = currentTime - startTime;

        if (elapsedTime < duration) {
          const deltalpha =
            (elapsedTime / duration) * (targetAlpha - startAlpha);
          const newAlpha = startAlpha + deltalpha;

          if (
            graphics instanceof PolygonGraphics ||
            graphics instanceof PolylineGraphics
          ) {
            const material = graphics.material;

            if (
              material instanceof ImageMaterialProperty ||
              material instanceof ColorMaterialProperty ||
              material instanceof PolylineArrowMaterialProperty ||
              material instanceof PolylineDashMaterialProperty
            ) {
              material.color = material.color
                ?.getValue(JulianDate.now())
                .withAlpha(newAlpha);
            }
          } else {
            // billbord
            const color = graphics?.color?.getValue(JulianDate.now());
            const newColor = color.withAlpha(newAlpha);
            graphics!.color = new ColorMaterialProperty(newColor);
          }

          this.animationids[aniidx] = requestAnimationFrame(animate);
        } else {
          const restoredState = state ? state : "static";
          this.setState(restoredState);
          // Animation Ended
          callback && callback();

          // if (targetAlpha === 0) {
          //   this.setState('hidden');
          // }

          // if (duration == 0) {
          // this.setState('drawing');

          if (
            graphics instanceof PolygonGraphics ||
            graphics instanceof PolylineGraphics
          ) {
            const material = graphics.material;
            if (material) {
              // if (material.image && material.color.alpha !== undefined) {
              //   // Texture Material
              //   material.color.alpha = targetAlpha;
              // } else {
              //   // Solid Color
              //   const newColor = material.color
              //     .getValue()
              //     .withAlpha(targetAlpha);
              //   material.color.setValue(newColor);
              // }
              if (
                material instanceof ImageMaterialProperty ||
                material instanceof ColorMaterialProperty ||
                material instanceof PolylineArrowMaterialProperty ||
                material instanceof PolylineDashMaterialProperty
              ) {
                material.color = material.color
                  ?.getValue(JulianDate.now())
                  .withAlpha(targetAlpha);
              }
            }
          } else {
            // billbord
            const color = graphics?.color?.getValue(JulianDate.now());
            const newColor = color.withAlpha(targetAlpha);
            graphics!.color = new ColorMaterialProperty(newColor);
          }

          if (loop === true) {
            startTime = 0;
            this.animationids[aniidx] = requestAnimationFrame(animate);
          }
        }
      };

      this.animationids[aniidx] = requestAnimationFrame(animate);
    };
    let curtime: number;
    const delayfunc = (newcurtime: number) => {
      if (curtime == null) {
        curtime = newcurtime;
      }
      const elapse = newcurtime - curtime;
      if (elapse >= delay) {
        this.animationids[aniidx] = requestAnimationFrame(afterdelayfunc);
      } else {
        this.animationids[aniidx] = requestAnimationFrame(delayfunc);
      }
    };
    this.animationids.push(requestAnimationFrame(delayfunc));
  }

  startGrowthAnimation(opts: GrowthAnimationOpts) {
    const { duration = 2000, delay = 0, callback, loop } = opts || {};
    if (this.state != "static") {
      return;
    }
    if (this.minPointsForShape <= 1) {
      console.warn("Growth animation is not supported for this type of shape");
      return;
    }
    this.setState("animating");

    const aniidx = this.animationids.length;
    const afterdelayfunc = () => {
      this.hideWithAnimation(0, 0, undefined);
      const points = this.getPoints();

      let segmentDuration = 0;
      if (this.minPointsForShape === 2) {
        segmentDuration = duration / (points.length - 1);
      } else {
        segmentDuration = duration / (points.length - 2);
      }

      let startTime = 0;
      let movingPointIndex = 0;

      const frameListener = (currentTime: number) => {
        if (!startTime) {
          startTime = currentTime;
        }
        const elapsedTime = currentTime - startTime;
        if (elapsedTime >= duration) {
          this.setState("static");
          // Animation ends
          callback && callback();
          startTime = 0;

          if (loop === true) {
            this.animationids[aniidx] = requestAnimationFrame(frameListener);
          }
          return;
        } else if (elapsedTime == 0) {
          this.animationids[aniidx] = requestAnimationFrame(frameListener);
          return;
        }
        const currentSegment = Math.floor(elapsedTime / segmentDuration);
        let startPoint;

        if (this.minPointsForShape === 2) {
          movingPointIndex = currentSegment + 1;
        } else {
          movingPointIndex = currentSegment + 2;
        }
        startPoint = points[movingPointIndex - 1];
        if (currentSegment == 0 && this.minPointsForShape === 3) {
          // The face-arrow determined by three points, with the animation starting from the midpoint of the line connecting the first two points.
          startPoint = Cartesian3.midpoint(
            points[0],
            points[1],
            new Cartesian3()
          );
        }
        const endPoint = points[movingPointIndex];

        // To dynamically add points between the startPoint and endPoint, consistent with the initial drawing logic,
        // update the point at index movingPointIndex in the points array with the newPosition,
        // generate the arrow, and execute the animation.
        const t =
          (elapsedTime - currentSegment * segmentDuration) / segmentDuration;
        if (t == 0) {
          this.animationids[aniidx] = requestAnimationFrame(frameListener);
          return;
        }
        const newPosition = Cartesian3.lerp(
          startPoint,
          endPoint,
          t,
          new Cartesian3()
        );
        const tempPoints = points.slice(0, movingPointIndex + 1);
        tempPoints[tempPoints.length - 1] = newPosition;

        const geometryPoints = this.generateGeometry(tempPoints);
        this.setGeometryPoints(geometryPoints);
        this.showWithAnimation(0, 0, undefined);
        this.animationids[aniidx] = requestAnimationFrame(frameListener);
      };
      this.animationids[aniidx] = requestAnimationFrame(frameListener);
    };
    let curtime: number;
    const delayfunc = (newcurtime: number) => {
      if (curtime == null) {
        curtime = newcurtime;
      }
      const elapse = newcurtime - curtime;
      if (elapse >= delay) {
        this.animationids[aniidx] = requestAnimationFrame(afterdelayfunc);
      } else {
        this.animationids[aniidx] = requestAnimationFrame(delayfunc);
      }
    };
    this.animationids.push(requestAnimationFrame(delayfunc));
  }

  protected abstract setStyle(style?: GeometryStyleMap[T]): void;

  startFlashAnimation(opts: FlashAnimationOpts<T>) {
    const {
      duration = 2000,
      delay = 0,
      callback,
      loop,
      flashtype,
      intervaltype,
      flashinterval = 1,
      flashnum = 0,
      startStyle,
      endStyle,
    } = opts || {};
    const aniidx = this.animationids.length;
    const afterdelayfunc = () => {
      const points = this.getPoints();
      let startTime = 0;
      const frameListener = (currentTime: number) => {
        if (!startTime) {
          startTime = currentTime;
        }
        const elapsedTime = currentTime - startTime;
        if (elapsedTime >= duration) {
          this.setState("static");
          // Animation ends
          callback && callback();
          startTime = 0;

          if (loop === true) {
            this.animationids[aniidx] = requestAnimationFrame(frameListener);
          }
          return;
        } else if (elapsedTime == 0) {
          this.animationids[aniidx] = requestAnimationFrame(frameListener);
          return;
        }

        let elapsenum = 0;
        if (intervaltype == "Numbers") {
          //次数
          const n = flashnum * 2 + 1;
          const timespan = duration / n;
          elapsenum = Math.ceil(elapsedTime / timespan);
        } else if (intervaltype == "Frequency") {
          const timespan = flashinterval;
          elapsenum = parseInt(String(elapsedTime / timespan));
        }
        if (elapsenum % 2 == 1) {
          if (flashtype == "ShowOff") {
            this.hide();
          } else {
            //切换颜色
            this.setStyle(startStyle);
          }
        } else {
          if (flashtype == "ShowOff") {
            this.show();
          } else {
            //切换颜色
            this.setStyle(endStyle);
          }
        }

        this.animationids[aniidx] = requestAnimationFrame(frameListener);
      };
      this.animationids[aniidx] = requestAnimationFrame(frameListener);
    };

    let curtime: number;
    const delayfunc = (newcurtime: number) => {
      if (curtime == null) {
        curtime = newcurtime;
      }
      const elapse = newcurtime - curtime;
      if (elapse >= delay) {
        this.animationids[aniidx] = requestAnimationFrame(afterdelayfunc);
      } else {
        this.animationids[aniidx] = requestAnimationFrame(delayfunc);
      }
    };
    this.animationids.push(requestAnimationFrame(delayfunc));
  }

  remove(_source?: "manager") {
    this.stopAnimation();
    this.setState("static");

    this.viewer.entities.remove(this.entity);
    this.removeLeftClickListener();
    this.removeMoveListener();
    this.removeDoubleClickListener();
    this.removeControlPoints();

    _source != "manager" && this.core.graphicManager.removeById(this.id);
  }

  on(eventType: EventType, listener: EventListener) {
    this.eventDispatcher.on(eventType, listener);
  }

  off(eventType: EventType, listener: EventListener) {
    this.eventDispatcher.off(eventType, listener);
  }

  isCurrentEntity(id: string) {
    // return this.entityId === `CesiumPlot-${id}`;
    return this.entity.id === id;
  }

  //Abstract method that must be implemented by subclasses.
  protected abstract addPoint(
    cartesian: Cartesian3,
    callback?: ConcreteGeometryDrawEventCallbackMap[T]
  ): void;

  //Abstract method that must be implemented by subclasses.
  protected getPoints() {
    return [...this.points.values()];
  }

  //Abstract method that must be implemented by subclasses.
  protected abstract updateMovingPoint(cartesian: Cartesian3): void;

  /**
   * In edit mode, drag key points to update corresponding key point data.
   */
  protected updateDraggingPoint(cartesian: Cartesian3, id: string) {
    this.points.set(id, cartesian);
    this.setGeometryPoints(this.generateGeometry(this.getPoints()));
    // this.drawActive();
  }

  //Abstract method that must be implemented by subclasses.
  protected abstract generateGeometry(points: Cartesian3[]): Cartesian3[];

  protected assignIgnoreUndefined(
    target: { [x: string]: any },
    ...sources: any[]
  ) {
    sources.forEach((source) => {
      Object.keys(source).forEach((key) => {
        if (source[key] !== undefined) {
          target[key] = source[key];
        }
      });
    });
    return target;
  }
}