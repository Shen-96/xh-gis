/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2022-01-18 13:04:45
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:27:22
 */
import { createGuid } from "cesium";
import type { Point3Deg } from "../types";
import { GeometryType, GraphicType, SymbolType } from "../enum";
import CoordinateUtils from "./CoordinateUtils";
import AbstractGraphic from "../DataSources/Graphics/Abstract/AbstractGraphic";
import { GeometryDrawEventCallbackMap } from "../DataSources/Graphics/types";
import AbstractCore from "./AbstractCore";
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
import ZyTjArrow from "../DataSources/Graphics/Symbol/ZyTjArrow";
import ZyFtjArrow from "../DataSources/Graphics/Symbol/ZyFtjArrow";
import LhHlDjArrow from "../DataSources/Graphics/Symbol/LhHlDjArrow";
import JqLhHlDjArrow from "../DataSources/Graphics/Symbol/JqLhHlDjArrow";
import JgArrow from "../DataSources/Graphics/Symbol/JgArrow";
import JgZxArrow from "../DataSources/Graphics/Symbol/JgZxArrow";
import FcjArrow from "../DataSources/Graphics/Symbol/FcjArrow";
import BbsTpDdArrow from "../DataSources/Graphics/Symbol/BbsTpDdArrow";

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

  constructor(core: AbstractCore) {
    super(core);
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
      const symbol = (plot = new XgMark(this.core));
      symbol.setPosition(param1);
    } else if (type === GraphicType.FREEHAND_LINE) {
      const symbol = (plot = new XgFreehandLine({
        core: this.core,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.CURVE) {
      const symbol = (plot = new XgCurve({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.RECTANGLE) {
      const symbol = (plot = new XgRectangle({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.POLYGON) {
      const symbol = (plot = new XgPolygon({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.FREEHAND_POLYGON) {
      const symbol = (plot = new XgFreehandPolygon({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.CIRCLE) {
      const symbol = (plot = new XgCircle({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.ELLIPSE) {
      const symbol = (plot = new XgEllipse({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.KIDNEY_SHAPED) {
      const symbol = (plot = new XgKidneyShaped({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.SECTOR) {
      const symbol = (plot = new XgSector({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.LUNE) {
      const symbol = (plot = new XgLune({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.TRIANGLE) {
      const symbol = (plot = new XgTriangle({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.STRAIGHT_TAIL_ARROW) {
      const symbol = (plot = new XgStraightTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.STRAIGHT_TAIL_RIGHT_ARROW) {
      const symbol = (plot = new XgStraightTailRightArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.CURVE_ARROW) {
      const symbol = (plot = new XgCurvedArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.STRAIGHT_ARROW) {
      const symbol = (plot = new XgStraightArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.FREE_FLAT_TAIL_ARROW) {
      const symbol = (plot = new XgFreeFlatTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.FREE_SWALLOW_TAIL_ARROW) {
      const symbol = (plot = new XgFreeSwallowTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.FIXED_FLAT_TAIL_ARROW) {
      const symbol = (plot = new XgFixedFlatTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.FIXED_SWALLOW_TAIL_ARROW) {
      const symbol = (plot = new XgFixedSwallowTailArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === GraphicType.DOUBLE_ARROW) {
      const symbol = (plot = new XgDoubleArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === SymbolType.战役突击方向) {
      const symbol = (plot = new ZyTjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === SymbolType.战役反突击方向) {
      const symbol = (plot = new ZyFtjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === SymbolType.联合火力打击方向) {
      const symbol = (plot = new LhHlDjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === SymbolType.精确火力打击方向) {
      const symbol = (plot = new JqLhHlDjArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === SymbolType.进攻方向) {
      const symbol = (plot = new JgArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
    } else if (type === SymbolType["进攻方向（直线/折线）"]) {
      const symbol = (plot = new JgZxArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
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
    } else if (type === SymbolType.不标示突破地段的作战行动) {
      const symbol = (plot = new BbsTpDdArrow({
        core: this.core,
        style: param2,
      }));
      param1 && symbol.setPositions(param1);
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
    if (type === SymbolType.战役突击方向) {
      return ZyTjArrow;
    } else if (type === SymbolType.战役反突击方向) {
      return ZyFtjArrow;
    } else if (type === SymbolType.联合火力打击方向) {
      return LhHlDjArrow;
    } else if (type === SymbolType.精确火力打击方向) {
      return JqLhHlDjArrow;
    } else if (type === SymbolType.进攻方向) {
      return JgArrow;
    } else if (type === SymbolType["进攻方向（直线/折线）"]) {
      return JgZxArrow;
    } else if (type === SymbolType.反冲击方向) {
      return FcjArrow;
    } else {
      return null;
    }
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

  save2Json() {
    const json = (
      data: { type: GraphicType; positions: Point3Deg[] }[] | BlobPart,
      filename: string
    ) => {
      if (!data) {
        alert("保存的数据为空");
        return;
      }
      if (!filename) filename = "json.json";
      if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4);
      }
      const blob = new Blob([data], { type: "text/json" }),
        e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      e.initMouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      a.dispatchEvent(e);
    };
    const symbols = this.getAll();

    const data = symbols.map((symbol) => {
      const car3Arr = [...symbol.points.values()];

      const i = {
        type: symbol.graphicType,
        positions: CoordinateUtils.car3ArrToPoint3DegArr(car3Arr),
      };

      return i;
    });

    json(data, createGuid() + ".json");
  }

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
  }
}
