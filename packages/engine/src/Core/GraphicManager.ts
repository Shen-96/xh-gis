/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2022-01-18 13:04:45
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:27:22
 */
import type { GraphicOptions, Point3Deg } from "../types";
import { GeometryType, GraphicType, SymbolType } from "../enum";
import CoordinateUtils from "./CoordinateUtils";
import AbstractGraphic from "../DataSources/Graphics/Abstract/AbstractGraphic";
import { GeometryDrawEventCallbackMap } from "../DataSources/Graphics/types";
import AbstractCore from "./AbstractCore";
import registry from "./GraphicRegistry";
import ZyTjArrow from "../DataSources/Graphics/Symbol/ZyTjArrow";
import ZyFtjArrow from "../DataSources/Graphics/Symbol/ZyFtjArrow";
import LhHlDjArrow from "../DataSources/Graphics/Symbol/LhHlDjArrow";
import JqLhHlDjArrow from "../DataSources/Graphics/Symbol/JqLhHlDjArrow";
import JgArrow from "../DataSources/Graphics/Symbol/JgArrow";
import JgZxArrow from "../DataSources/Graphics/Symbol/JgZxArrow";
import FcjArrow from "../DataSources/Graphics/Symbol/FcjArrow";
import BbsTpDdArrow from "../DataSources/Graphics/Symbol/BbsTpDdArrow";
import {
  XgCircle,
  XgEllipse,
  XgTriangle,
  XgCurve,
  XgCurvedArrow,
  XgDoubleArrow,
  XgFreehandLine,
  XgFreehandPolygon,
  XgLune,
  XgPolygon,
  XgRectangle,
  XgFixedRatioRectangle,
  XgSector,
  XgStraightArrow,
  XgStraightTailArrow,
  XgStraightTailRightArrow,
  XgFreeFlatTailArrow,
  XgFreeSwallowTailArrow,
  XgFixedFlatTailArrow,
  XgFixedSwallowTailArrow,
  XgMark,
  XgKidneyShaped,
} from "../DataSources";
import AbstractManager from "./AbstractManager";

/**
 * 管理器事件类型枚举：
 * - added：有图形加入集合，负载为加入的图形实例
 * - removed：有图形从集合移除，负载为移除的图形 id
 * - cleared：集合被清空，负载为 undefined
 * - sizeChanged：集合元素数量变化，负载为当前 size（number）
 * - collectionChanged：集合整体变化（新增/删除/清空后派生），负载为当前图形列表
 */
export type GraphicManagerEvent =
  | "added"
  | "removed"
  | "cleared"
  | "sizeChanged"
  | "collectionChanged";

/**
 * 不同事件对应的负载类型映射。
 * 订阅时会按事件名称推导相应的负载类型，实现强类型的事件分发。
 */
export interface GraphicManagerEventPayloads {
  added: AbstractGraphic<GeometryType>;
  removed: string;
  cleared: undefined;
  sizeChanged: number;
  collectionChanged: Array<AbstractGraphic<GeometryType>>;
}

// 监听器类型映射：为每个事件提供精确的负载类型
type GraphicManagerListenerMap = {
  [K in GraphicManagerEvent]?: Set<
    (payload: GraphicManagerEventPayloads[K]) => void
  >;
};

/**
 * @descripttion: 标绘管理器
 * @return {*}
 * @author: EV-申小虎
 */
export default class GraphicManager extends AbstractManager {
  /// 标绘集合
  private readonly graphicCollection: Map<
    string,
    AbstractGraphic<GeometryType>
  > = new Map();

  // 监听器记录：按事件类型分别维护订阅者集合（强类型负载）
  private readonly listeners: GraphicManagerListenerMap = {};

  constructor(core: AbstractCore) {
    super(core);
    // 注册逻辑已移至各模块内部自注册
  }

  /**
   * 订阅管理器事件（强类型负载），返回取消订阅函数。
   *
   * 用法示例：
   * - 监听新增：on('added', (g) => console.log(g.id))
   * - 监听删除：on('removed', (id) => console.log(id))
   * - 监听清空：on('cleared', () => { ... })
   * - 监听数量变化：on('sizeChanged', (n) => { ... })
   * - 监听集合变化：on('collectionChanged', (list) => { ... })
   *
   * 说明：负载类型会根据事件名称自动推导，例如：
   * - added → AbstractGraphic<GeometryType>
   * - removed → string
   * - cleared → undefined
   * - sizeChanged → number
   * - collectionChanged → Array<AbstractGraphic<GeometryType>>
   */
  on<T extends GraphicManagerEvent>(
    event: T,
    handler: (payload: GraphicManagerEventPayloads[T]) => void
  ): () => void {
    const set =
      (this.listeners[event] as
        | Set<(payload: GraphicManagerEventPayloads[T]) => void>
        | undefined) ??
      new Set<(payload: GraphicManagerEventPayloads[T]) => void>();
    set.add(handler);
    // 由于泛型索引的限制，这里做一次窄化赋值
    this.listeners[event] = set as any;
    return () => {
      set.delete(handler);
    };
  }

  /**
   * 内部分发事件（强类型负载）。
   *
   * 注意：该方法用于管理器内部派发事件，外部请使用 on() 进行订阅。
   * 当派发 added/removed/cleared 时，会在方法内自动派发派生事件：
   * - sizeChanged：集合大小发生变化的数值
   * - collectionChanged：当前完整的图形集合数组
   */
  private emit<T extends GraphicManagerEvent>(
    event: T,
    payload: GraphicManagerEventPayloads[T]
  ) {
    const set = this.listeners[event] as
      | Set<(payload: GraphicManagerEventPayloads[T]) => void>
      | undefined;
    set?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error("GraphicManager listener error:", e);
      }
    });
    // 派发派生事件，保持集合与数量同步
    if (event === "added" || event === "removed" || event === "cleared") {
      const sizeListeners = this.listeners["sizeChanged"];
      sizeListeners?.forEach((fn) => {
        try {
          fn(this.size());
        } catch (e) {
          console.error("GraphicManager sizeChanged listener error:", e);
        }
      });
      const colListeners = this.listeners["collectionChanged"];
      const list = this.getAll();
      colListeners?.forEach((fn) => {
        try {
          fn(list);
        } catch (e) {
          console.error("GraphicManager collectionChanged listener error:", e);
        }
      });
    }
  }

  setDrawEventHandler(
    type: GraphicType.POINT,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POINT]
  ): void;
  setDrawEventHandler(
    type: GraphicType.FREEHAND_LINE,
    callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]
  ): void;
  setDrawEventHandler(
    type: GraphicType.CURVE,
    callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]
  ): void;
  setDrawEventHandler(
    type: GraphicType.RECTANGLE,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.FIXED_RATIO_RECTANGLE,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.POLYGON,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.FREEHAND_POLYGON,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.CIRCLE,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.ELLIPSE,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.KIDNEY_SHAPED,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.SECTOR,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.LUNE,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.TRIANGLE,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.STRAIGHT_TAIL_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.STRAIGHT_TAIL_RIGHT_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.CURVE_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.STRAIGHT_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.FREE_FLAT_TAIL_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.FREE_SWALLOW_TAIL_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.FIXED_FLAT_TAIL_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.FIXED_SWALLOW_TAIL_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: GraphicType.DOUBLE_ARROW,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: SymbolType.战役突击方向,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: SymbolType.战役反突击方向,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: SymbolType.联合火力打击方向,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: SymbolType.精确火力打击方向,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: SymbolType.进攻方向,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    //@ts-ignore
    type: SymbolType["进攻方向（直线/折线）"],
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  // setDrawEventHandler(
  //   type: SymbolType.本级地面作战主攻方向,
  //   callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  // ): void;
  setDrawEventHandler(
    type: SymbolType.反冲击方向,
    callback?: GeometryDrawEventCallbackMap[GeometryType.POLYGON]
  ): void;
  setDrawEventHandler(
    type: SymbolType.不标示突破地段的作战行动,
    callback?: GeometryDrawEventCallbackMap[GeometryType.LINE]
  ): void;
  setDrawEventHandler(type: any, callback?: any) {
    try {
      const symbol = this.create(type);

      symbol.beginDraw(callback);
    } catch (error) {
      console.error("drawManager:", error);
    }
  }

  /**
   * @descripttion: 绘制
   * @param {AbstractGraphic} PlotSymbol
   * @return {*}
   * @author: EV-申小虎
   */
  add(plotSymbol: AbstractGraphic<GeometryType>) {
    try {
      /// 渲染标绘实体
      if (!plotSymbol) throw "无效的标绘实体";
      if (this.isExists(plotSymbol.id)) throw "标会实体已存在";

      this.graphicCollection.set(plotSymbol.id, plotSymbol);
      this.emit("added", plotSymbol);
    } catch (error) {
      console.error("drawManager:", error);
    }
  }

  create(type: GraphicType.POINT, position?: Point3Deg): XgMark;
  create(
    type: GraphicType.FREEHAND_LINE,
    positions?: Array<Point3Deg>
  ): XgFreehandLine;
  create(type: GraphicType.CURVE, positions?: Array<Point3Deg>): XgCurve;
  create(
    type: GraphicType.RECTANGLE,
    positions?: Array<Point3Deg>
  ): XgRectangle;
  create(
    type: GraphicType.FIXED_RATIO_RECTANGLE,
    positions?: Array<Point3Deg>
  ): XgFixedRatioRectangle;
  create(type: GraphicType.POLYGON, positions?: Array<Point3Deg>): XgPolygon;
  create(
    type: GraphicType.FREEHAND_POLYGON,
    positions?: Array<Point3Deg>
  ): XgFreehandPolygon;
  create(type: GraphicType.CIRCLE, positions?: Point3Deg[]): XgCircle;
  create(type: GraphicType.ELLIPSE, positions?: Point3Deg[]): XgEllipse;
  create(
    type: GraphicType.KIDNEY_SHAPED,
    positions?: Point3Deg[]
  ): XgKidneyShaped;
  create(type: GraphicType.SECTOR, positions?: Point3Deg[]): XgSector;
  create(type: GraphicType.LUNE, positions?: Point3Deg[]): XgLune;
  create(type: GraphicType.TRIANGLE, positions?: Point3Deg[]): XgTriangle;
  create(
    type: GraphicType.STRAIGHT_TAIL_ARROW,
    positions?: Point3Deg[]
  ): XgStraightTailArrow;
  create(
    type: GraphicType.STRAIGHT_TAIL_RIGHT_ARROW,
    positions?: Point3Deg[]
  ): XgStraightTailRightArrow;
  create(type: GraphicType.CURVE_ARROW, positions?: Point3Deg[]): XgCurvedArrow;
  create(
    type: GraphicType.STRAIGHT_ARROW,
    positions?: Point3Deg[]
  ): XgStraightArrow;
  create(
    type: GraphicType.FREE_FLAT_TAIL_ARROW,
    positions?: Point3Deg[]
  ): XgFreeFlatTailArrow;
  create(
    type: GraphicType.FREE_SWALLOW_TAIL_ARROW,
    positions?: Point3Deg[]
  ): XgFreeSwallowTailArrow;
  create(
    type: GraphicType.FIXED_FLAT_TAIL_ARROW,
    positions?: Point3Deg[]
  ): XgFixedFlatTailArrow;
  create(
    type: GraphicType.FIXED_SWALLOW_TAIL_ARROW,
    positions?: Point3Deg[]
  ): XgFixedSwallowTailArrow;
  create(
    type: GraphicType.DOUBLE_ARROW,
    positions?: Point3Deg[]
  ): XgDoubleArrow;
  create(type: SymbolType.战役突击方向, positions?: Point3Deg[]): ZyTjArrow;
  create(type: SymbolType.战役反突击方向, positions?: Point3Deg[]): ZyFtjArrow;
  create(
    type: SymbolType.联合火力打击方向,
    positions?: Point3Deg[]
  ): LhHlDjArrow;
  create(
    type: SymbolType.精确火力打击方向,
    positions?: Point3Deg[]
  ): JqLhHlDjArrow;
  create(type: SymbolType.进攻方向, positions?: Point3Deg[]): JgArrow;
  create(
    // @ts-ignore
    type: SymbolType["进攻方向（直线/折线）"],
    positions?: Point3Deg[]
  ): JgZxArrow;
  // create(
  //   type: SymbolType.本级地面作战主攻方向,
  //   positions?: Point3Deg[]
  // ): CurvedArrow;
  create(type: SymbolType.反冲击方向, positions?: Point3Deg[]): FcjArrow;
  create(
    type: SymbolType.不标示突破地段的作战行动,
    positions?: Point3Deg[]
  ): BbsTpDdArrow;
  /**
   * @descripttion: 根据绘制类型创建实体
   * @param {string} id
   * @param {Cartesian3 | Array<Cartesian3>} position
   * @param {GraphicType | SymbolType} type
   * @param {boolean} clampToGround 是否贴地（默认true）
   * @return {Entity | null}
   * @author: EV-申小虎
   */
  create(type: GraphicType | SymbolType, param1?: any, param2?: any) {
    let plot: AbstractGraphic<GeometryType>;

    // 先使用注册表进行构造（减少巨型分支）
    const Ctor =
      registry.getGraphic(type as GraphicType) ||
      registry.getSymbol(type as SymbolType);
    if (Ctor) {
      const symbol = (plot = new Ctor({
        core: this.core,
        style: param2,
        position: type === GraphicType.POINT ? param1 : undefined,
        positions: type !== GraphicType.POINT ? param1 : undefined,
      }));
      if (type === GraphicType.POINT && (symbol as any).setPosition) {
        param1 && (symbol as any).setPosition(param1);
      } else if ((symbol as any).setPositions) {
        param1 && (symbol as any).setPositions(param1);
      }
      // 如果传入了 positions/position，说明是直接创建的静态图形，需纳入管理器
      if (
        (type === GraphicType.POINT && !!param1) ||
        (type !== GraphicType.POINT && !!param1)
      ) {
        this.add(symbol as any);
      }
      return plot;
    }

    // switch (type) {
    // case GraphicType.POINT:
    //   plot = this.createXgPoint(options);
    //   break;
    // case GraphicType.LABEL:
    //   plot = this.createXgLabel(options);
    //   break;
    // case GraphicType.BILLBOARD:
    //   plot = this.createXgBillboard(options);
    //   break;
    if (type === GraphicType.POINT) {
      const symbol = (plot = new XgMark({ core: this.core }));
      symbol.setPosition(param1);
      // 直接创建的对象纳入管理器
      param1 && this.add(symbol);
    } else if (type === GraphicType.FREEHAND_LINE) {
      const symbol = (plot = new XgFreehandLine({
        core: this.core,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.CURVE) {
      const symbol = (plot = new XgCurve({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.RECTANGLE) {
      const symbol = (plot = new XgRectangle({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.POLYGON) {
      const symbol = (plot = new XgPolygon({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.FREEHAND_POLYGON) {
      const symbol = (plot = new XgFreehandPolygon({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.CIRCLE) {
      const symbol = (plot = new XgCircle({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.ELLIPSE) {
      const symbol = (plot = new XgEllipse({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.KIDNEY_SHAPED) {
      const symbol = (plot = new XgKidneyShaped({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.SECTOR) {
      const symbol = (plot = new XgSector({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.LUNE) {
      const symbol = (plot = new XgLune({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.TRIANGLE) {
      const symbol = (plot = new XgTriangle({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.STRAIGHT_TAIL_ARROW) {
      const symbol = (plot = new XgStraightTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.STRAIGHT_TAIL_RIGHT_ARROW) {
      const symbol = (plot = new XgStraightTailRightArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.CURVE_ARROW) {
      const symbol = (plot = new XgCurvedArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.STRAIGHT_ARROW) {
      const symbol = (plot = new XgStraightArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.FREE_FLAT_TAIL_ARROW) {
      const symbol = (plot = new XgFreeFlatTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.FREE_SWALLOW_TAIL_ARROW) {
      const symbol = (plot = new XgFreeSwallowTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.FIXED_FLAT_TAIL_ARROW) {
      const symbol = (plot = new XgFixedFlatTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.FIXED_SWALLOW_TAIL_ARROW) {
      const symbol = (plot = new XgFixedSwallowTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === GraphicType.DOUBLE_ARROW) {
      const symbol = (plot = new XgDoubleArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === SymbolType.战役突击方向) {
      const symbol = (plot = new ZyTjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === SymbolType.战役反突击方向) {
      const symbol = (plot = new ZyFtjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === SymbolType.联合火力打击方向) {
      const symbol = (plot = new LhHlDjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === SymbolType.精确火力打击方向) {
      const symbol = (plot = new JqLhHlDjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === SymbolType.进攻方向) {
      const symbol = (plot = new JgArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === SymbolType["进攻方向（直线/折线）"]) {
      const symbol = (plot = new JgZxArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    }
    //  else if (type === SymbolType.本级地面作战主攻方向) {
    //   const symbol = (plot = new CurvedArrow({
    //     core: this.core,
    //     style: param2,
    //   }));
    //   param1 && symbol.setPositions(param1);
    // }
    else if (type === SymbolType.反冲击方向) {
      const symbol = (plot = new FcjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else if (type === SymbolType.不标示突破地段的作战行动) {
      const symbol = (plot = new BbsTpDdArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
      param1 && this.add(symbol);
    } else {
      throw Error("无效的标绘类型");
    }

    // case GraphicType.CIRCLE:
    //   plot = this.createXgCircle(options);
    //   break;
    // case GraphicType.SECTOR:
    //   plot = this.createXgSector(options);
    //   break;
    // case GraphicType.CURVE:
    //   plot = this.createXgBezierCurve(options);
    //   break;
    // case GraphicType.CURVE_ARROW:
    //   plot = this.createXgBezierCurve(options);
    //   break;
    // case GraphicType.ARROW_STRAIGHT:
    //   plot = this.createXgStraightArrow(options);
    //   break;
    // case GraphicType.ARROW_ATTACK_FLAT:
    //   plot = this.createXgFlatTailArrow(options);
    //   break;
    // case GraphicType.ARROW_ATTACK_SWALLOW:
    //   plot = this.createXgSwallowTailArrow(options);
    //   break;
    // case GraphicType.ARROW_PINCER:
    //   plot = this.createXgPincerArrow(options);
    //   break;
    // case GraphicType.STAGING_AREA:
    //   plot = this.createXgStagingArea(options);
    //   break;

    //   default:
    //     break;
    // }

    return plot;
  }

  /**
   * @descripttion: 根据标绘类型获取实体类
   * @param {SymbolType} type
   * @return {*}
   * @author: EV-申小虎
   */
  static getSymbolClass(type: SymbolType) {
    const ctor = registry.getSymbol(type);
    return ctor ?? null;
  }

  isExists(id: string) {
    return this.graphicCollection.has(id);
  }

  getById(id: string) {
    return this.graphicCollection.get(id);
  }

  /**
   * @descripttion: 获取所有标绘
   * @return {*}
   * @author: EV-申小虎
   */
  getAll() {
    return [...this.graphicCollection.values()];
  }

  /**
   * 返回完整序列化结果为 GraphicOptions
   */
  serializeAll(): Array<GraphicOptions> {
    const graphics = this.getAll();
    return graphics.map((g) => {
      const type = g.graphicType as GraphicType | SymbolType;
      const id = g.id;
      const name = g.graphicName;
      const show = g.state !== "hidden";

      const positions = CoordinateUtils.car3ArrToPoint3DegArr([
        ...g.points.values(),
      ]);

      const base = { id, name, show, type } as any;

      // 位置/几何类型分发
      const geometryType = g.getGeometryType
        ? g.getGeometryType()
        : (g as any).geometryType;

      if (geometryType === GeometryType.POINT) {
        base.position = positions[0];
      } else if (geometryType === GeometryType.LINE) {
        base.positions = positions;
      } else if (geometryType === GeometryType.POLYGON) {
        base.positions = positions;
      }

      // 样式序列化（按已有样式对象透传）
      base.style = g.style as any;

      // 附加自定义属性
      if (g.attributes && Object.keys(g.attributes).length) {
        base.attr = g.attributes;
      }

      // SYMBOL 额外包含 code
      if (type === GraphicType.SYMBOL) {
        // 符号类都实现了 ISymbol，且拥有 symbolType 字段（枚举字符串）
        const symbolType = (g as any).symbolType as SymbolType | undefined;
        // 若 symbolType 缺失，则尝试通过枚举值反查键名；否则直接用枚举值（字符串）
        const codeKey = symbolType
          ? CoordinateUtils.getKeyByEnumValue(SymbolType, symbolType) ?? symbolType
          : undefined;
        base.code = (codeKey ?? type) as any;
      }

      return base;
    });
  }

  /**
   * 导出为标准 GeoJSON FeatureCollection
   */
  toGeoJSON(closeRing: boolean = true): {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      properties: { type: GraphicType | SymbolType; [key: string]: any };
      geometry:
        | { type: "Point"; coordinates: [number, number] }
        | { type: "LineString"; coordinates: [number, number][] }
        | { type: "Polygon"; coordinates: [number, number][][] };
    }>;
  } {
    const symbols = this.getAll();

    const features = symbols.map((symbol) => {
      const car3Arr = [...symbol.points.values()];
      const positions = CoordinateUtils.car3ArrToPoint3DegArr(car3Arr);
      const geometryType = symbol.getGeometryType
        ? symbol.getGeometryType()
        : (symbol as any).geometryType;

      const coords: [number, number][] = positions.map((p) => {
        // Point3Deg is [lon, lat, alt]
        const lon = Array.isArray(p) ? p[0] : (p as any)?.longitude ?? (p as any)?.lon ?? (p as any)?.lng ?? (p as any)?.x;
        const lat = Array.isArray(p) ? p[1] : (p as any)?.latitude ?? (p as any)?.lat ?? (p as any)?.y;
        return [Number(lon ?? 0), Number(lat ?? 0)] as [number, number];
      });

      let geometry:
        | { type: "Point"; coordinates: [number, number] }
        | { type: "LineString"; coordinates: [number, number][] }
        | { type: "Polygon"; coordinates: [number, number][][] };

      if (geometryType === GeometryType.POLYGON) {
        let ring: [number, number][] = coords;
        if (closeRing && coords.length) {
          const first = coords[0];
          const last = coords[coords.length - 1];
          const isClosed = first[0] === last[0] && first[1] === last[1];
          ring = isClosed ? coords : [...coords, first];
        }
        geometry = { type: "Polygon", coordinates: [ring] };
      } else if (geometryType === GeometryType.LINE) {
        geometry = { type: "LineString", coordinates: coords };
      } else {
        const first: [number, number] = (coords[0] ?? [0, 0]) as [
          number,
          number
        ];
        geometry = { type: "Point", coordinates: first };
      }

      const props: { type: GraphicType | SymbolType; [key: string]: any } = {
        type: symbol.graphicType as any,
      };

      // 附加基本属性
      const name = (symbol as any).graphicName;
      if (name) props.name = name;
      const state = (symbol as any).state;
      if (state) props.show = state !== "hidden";
      const attr = (symbol as any).attributes;
      if (attr && Object.keys(attr).length > 0) props.attr = attr;

      // 附加样式（注意：样式对象应为可序列化的纯数据结构）
      const style = (symbol as any).style;
      if (style) props.style = style;

      // 附加符号 code（若为 SYMBOL 类型）
      if (symbol.graphicType === GraphicType.SYMBOL) {
        const symbolType = (symbol as any).symbolType as SymbolType | string | undefined;
        if (symbolType) {
          const key = CoordinateUtils.getKeyByEnumValue(SymbolType as any, symbolType as any);
          props.code = key ?? String(symbolType);
        }
      }

      return {
        type: "Feature" as const,
        properties: props,
        geometry,
      };
    });

    return { type: "FeatureCollection", features };
  }

  // 新增：集合与序列化便捷 API
  size() {
    return this.graphicCollection.size;
  }

  forEach(callback: (item: AbstractGraphic<GeometryType>, id: string) => void) {
    this.graphicCollection.forEach((value, key) => callback?.(value, key));
  }

  addMany(items: AbstractGraphic<GeometryType>[]) {
    items?.forEach((item) => this.add(item));
  }

  removeMany(ids: string[]) {
    ids?.forEach((id) => this.removeById(id));
  }

  // 保留在文件底部的便捷 API 无改动

  /**
   * @descripttion: 清除标绘
   * @param {string} id 标绘id
   * @return {null}
   * @author: EV-申小虎
   */
  removeById(id: string) {
    const symbol = this.graphicCollection.get(id);

    if (symbol) {
      symbol.remove("manager");
      this.graphicCollection.delete(id);
      this.emit("removed", id);
    }
  }

  /**
   * @descripttion: 清除所有标绘
   * @return {null}
   * @author: EV-申小虎
   */
  removeAll() {
    this.graphicCollection.forEach((i) => {
      i.remove("manager");
    });
    this.graphicCollection.clear();
    this.emit("cleared", undefined);
  }
}
