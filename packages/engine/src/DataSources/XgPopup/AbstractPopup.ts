/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2024-06-13 15:16:49
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:47:03
 */
import { Cartesian2, Cartesian3, createGuid, SceneTransforms } from "cesium";
import { CoordinateUtils, MathUtils, ProjectionPoint } from "../..";
import { ElementType, ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { Point3Deg } from "../../index";
import AbstractCore from "../../Core/AbstractCore";

// export type PopupAnchor =
//   | "left-top"
//   | "left-bottom"
//   | "right-top"
//   | "right-bottom"
//   | "center";

// const ALL_VALUES: PopupAnchor[] = [
//   "left-top",
//   "left-bottom",
//   "right-top",
//   "right-bottom",
//   "center",
// ];

// function getRandomStringValue(): PopupAnchor {
//   const randomIndex = Math.floor(Math.random() * ALL_VALUES.length);
//   return ALL_VALUES[randomIndex];
// }

export type AbstractPopupOptions<T extends ElementType = any> = {
  id?: string;
  name?: string;
  show?: boolean;
  icon?: string;
  iconSize?: [number, number];
  element?: ReactElement<T> | HTMLElement | string;
  /// 锚点位置
  // anchor?: PopupAnchor;
  position: Point3Deg;
  maxRange?: number;
  offset?: [number?, number?];
  xgCore: AbstractCore;
};

export default abstract class AbstractPopup<T extends ElementType = any> {
  readonly xgCore: AbstractCore;
  readonly #id: string;
  protected guid: string;
  #name?: string;
  #show: boolean;
  #icon?: string;
  #iconSize: [number, number] = [0, 0];
  #element?: ReactElement<T> | HTMLElement | string;
  /// 锚点位置
  // #anchor: PopupAnchor;
  #position: Point3Deg;
  protected car3Position: Cartesian3;
  #maxRange?: number;
  #offset: [number, number];
  /// 鼠标按下
  protected isMouseDown: boolean = false;
  /// 鼠标按下时的屏幕坐标
  protected mouseDownScreenPosition: Cartesian2 = Cartesian2.ZERO;
  /// 鼠标移动的偏移量
  protected mouseMoveOffset: [number, number] = [0, 0];
  protected animationId = -1;

  constructor(options: AbstractPopupOptions) {
    this.xgCore = options.xgCore;
    this.#id = options.id ?? createGuid();
    this.guid = createGuid();
    this.#name = options.name;
    this.#show = options.show ?? true;
    this.#icon = options.icon;
    this.#iconSize = options.iconSize ?? [16, 16];
    this.#element = options.element;
    // this.#anchor = options.anchor ?? getRandomStringValue();
    this.#position = options.position;
    this.car3Position = CoordinateUtils.pointToCar3(this.#position);
    this.#maxRange = options.maxRange;
    this.#offset = [
      options.offset?.[0] ??
        200 * Math.random() * (Math.random() > 0.5 ? -1 : 1),
      options.offset?.[1] ??
        200 * Math.random() * (Math.random() > 0.5 ? -1 : 1),
    ];
    this.render();
  }

  protected abstract render(): void;

  abstract destroy(): void;

  get id(): string {
    return this.#id;
  }

  get name(): string | undefined {
    return this.#name;
  }

  set name(name: string | undefined) {
    this.#name = name;
  }

  get show(): boolean {
    return this.#show;
  }

  set show(show: boolean) {
    this.#show = show;
  }

  get icon(): string | undefined {
    return this.#icon;
  }

  set icon(icon: string | undefined) {
    this.#icon = icon;
    this.updateIcon();
  }

  get iconSize(): [number, number] {
    return this.#iconSize;
  }

  set iconSize(iconSize: [number, number]) {
    this.#iconSize = iconSize;
    this.updateIcon();
  }

  get element(): ReactElement<T> | HTMLElement | string | undefined {
    return this.#element;
  }

  set element(element: ReactElement<T> | HTMLElement | string | undefined) {
    this.#element = element;
    this.updateElement();
  }

  get position(): Point3Deg {
    return this.#position;
  }

  set position(position: Point3Deg) {
    this.#position = position;
    this.car3Position = CoordinateUtils.pointToCar3(position);
  }

  get maxRange(): number | undefined {
    return this.#maxRange;
  }

  set maxRange(maxRange: number | undefined) {
    this.#maxRange = maxRange;
  }

  get offset(): [number, number] {
    return this.#offset;
  }

  set offset(offset: [number?, number?]) {
    this.#offset = [offset[0] ?? 0, offset[1] ?? 50];
  }

  // 定义一个类型守卫函数，用于检查参数是否为React.ReactElement
  protected isReactElement(element: any): element is ReactElement {
    return (
      element &&
      typeof element === "object" &&
      /// TODO: ReactElement的类型定义，内置元素如div，element.type是div
      // typeof element.type === "function" &&
      typeof element.props === "object"
    );
  }

  protected abstract updateElement(): void;

  protected updateIcon(): void {
    const iconDiv = document.getElementById(`${this.guid}_icon`);
    if (!iconDiv) return;

    if (this.icon) {
      iconDiv.style.width = this.iconSize[0] + "px";
      iconDiv.style.height = this.iconSize[1] + "px";
      iconDiv.style.backgroundImage = `url(${this.icon})`;
      iconDiv.style.backgroundSize = "contain";
      iconDiv.style.backgroundRepeat = "no-repeat";
      iconDiv.style.backgroundPosition = "center";
    } else {
      iconDiv.style.backgroundImage = "";
    }
  }

  /// TODO: 根据空间坐标和便宜量，计算标牌中心点屏幕坐标
  protected calulateIconLeftTopPosition(): Cartesian2 {
    /// 根据经纬度坐标计算画布坐标
    const canvasPosition = this.xgCore.scene.cartesianToCanvasCoordinates(
      this.car3Position
    );

    return Cartesian2.fromElements(
      canvasPosition.x - this.iconSize[0] / 2,
      canvasPosition.y - this.iconSize[1] / 2
    );
  }

  /// TODO: 根据屏幕坐标和便宜量，计算标牌的左上角坐标
  protected calulatePopLeftTopPosition(): Cartesian2 {
    /// 根据经纬度坐标计算画布坐标
    const canvasPosition = this.xgCore.scene.cartesianToCanvasCoordinates(
      this.car3Position
    );

    /// 获取标牌的容器的size
    const popDiv = document.getElementById(this.guid);
    const popDivWidth = popDiv?.clientWidth ?? 0;

    return Cartesian2.fromElements(
      canvasPosition.x -
        popDivWidth / 2 +
        this.#offset[0] +
        this.mouseMoveOffset[0],
      canvasPosition.y + this.#offset[1] + this.mouseMoveOffset[1]
    );
  }

  /// TODO: 根据屏幕坐标和便宜量，计算标牌的左上角坐标
  protected calulatePopRightTopPosition(): Cartesian2 {
    /// 根据经纬度坐标计算画布坐标
    const canvasPosition = this.xgCore.scene.cartesianToCanvasCoordinates(
      this.car3Position
    );

    /// 获取标牌的容器的size
    const popDiv = document.getElementById(this.guid);
    const popDivWidth = popDiv?.clientWidth ?? 0;

    return Cartesian2.fromElements(
      canvasPosition.x +
        popDivWidth / 2 +
        this.#offset[0] +
        this.mouseMoveOffset[0],
      canvasPosition.y + this.#offset[1] + this.mouseMoveOffset[1]
    );
  }

  /// TODO: 根据屏幕坐标和便宜量，计算标牌的左上角坐标
  protected calulatePopLeftBottomPosition(): Cartesian2 {
    /// 根据经纬度坐标计算画布坐标
    const canvasPosition = this.xgCore.scene.cartesianToCanvasCoordinates(
      this.car3Position
    );

    /// 获取标牌的容器的size
    const popDiv = document.getElementById(this.guid);
    const popDivHeight = popDiv?.clientHeight ?? 0;

    return Cartesian2.fromElements(
      canvasPosition.x + this.#offset[0] + this.mouseMoveOffset[0],
      canvasPosition.y +
        popDivHeight / 2 +
        this.#offset[1] +
        this.mouseMoveOffset[1]
    );
  }

  /// TODO: 根据屏幕坐标和便宜量，计算标牌的左上角坐标
  protected calulatePopRightBottomPosition(): Cartesian2 {
    /// 根据经纬度坐标计算画布坐标
    const canvasPosition = this.xgCore.scene.cartesianToCanvasCoordinates(
      this.car3Position
    );

    /// 获取标牌的容器的size
    const popDiv = document.getElementById(this.guid);
    const popDivWidth = popDiv?.clientWidth ?? 0;
    const popDivHeight = popDiv?.clientHeight ?? 0;

    return Cartesian2.fromElements(
      canvasPosition.x +
        popDivWidth / 2 +
        this.#offset[0] +
        this.mouseMoveOffset[0],
      canvasPosition.y +
        popDivHeight / 2 +
        this.#offset[1] +
        this.mouseMoveOffset[1]
    );
  }

  /**
   * 实现两个元素中心点的连线
   * @author 渀波儿灞 2021-02-20
   * @param  {Object} startObj  jquery对象，起点元素
   * @param  {Object} endObj    jquery对象，终点元素
   * @return {String}           返回连线的dom
   */
  protected drawLine(startObj: HTMLElement) {
    const corners: ProjectionPoint[] = [
      [
        Number(startObj.style.left.replace("px", "")),
        Number(startObj.style.top.replace("px", "")),
      ],
      [
        Number(startObj.style.left.replace("px", "")),
        Number(startObj.style.top.replace("px", "")) + startObj.clientHeight,
      ],
      [
        Number(startObj.style.left.replace("px", "")) + startObj.clientWidth,
        Number(startObj.style.top.replace("px", "")),
      ],
      [
        Number(startObj.style.left.replace("px", "")) + startObj.clientWidth,
        Number(startObj.style.top.replace("px", "")) + startObj.clientHeight,
      ],
    ];

    // switch (this.#anchor) {
    //   case "left-top":
    //     y_start = Number(startObj.style.top.replace("px", "")) + 10;
    //     x_start = Number(startObj.style.left.replace("px", "")) + 10;
    //     break;
    //   case "left-bottom":
    //     y_start =
    //       Number(startObj.style.top.replace("px", "")) +
    //       startObj.clientHeight -
    //       10;
    //     x_start = Number(startObj.style.left.replace("px", "")) + 10;
    //     break;
    //   case "right-top":
    //     y_start = Number(startObj.style.top.replace("px", "")) + 10;
    //     x_start =
    //       Number(startObj.style.left.replace("px", "")) +
    //       startObj.clientWidth -
    //       10;
    //     break;
    //   case "right-bottom":
    //     y_start =
    //       Number(startObj.style.top.replace("px", "")) +
    //       startObj.clientHeight -
    //       10;
    //     x_start =
    //       Number(startObj.style.left.replace("px", "")) +
    //       startObj.clientWidth -
    //       10;
    //     break;
    //   case "center":
    //     y_start =
    //       Number(startObj.style.top.replace("px", "")) +
    //       startObj.clientHeight / 2;
    //     x_start =
    //       Number(startObj.style.left.replace("px", "")) +
    //       startObj.clientWidth / 2;
    //     break;
    //   default:
    //     y_start = Number(startObj.style.top.replace("px", "")) + 10;
    //     x_start = Number(startObj.style.left.replace("px", "")) + 10;
    //     break;
    // }

    const endPos = this.xgCore.scene.cartesianToCanvasCoordinates(
      this.car3Position
    );

    //终点元素中心坐标
    const x_end = endPos.x;
    const y_end = endPos.y;

    let minDistance = Number.MAX_SAFE_INTEGER,
      minObjIndex = 0;
    corners.forEach((pnt, index) => {
      const distance = MathUtils.projectionDistance(pnt, [x_end, y_end]);
      if (distance < minDistance) {
        minDistance = distance;
        minObjIndex = index;
      }
    });

    /// 起点元素中心坐标
    const x_start = corners[minObjIndex][0],
      y_start = corners[minObjIndex][1];

    //用勾股定律计算出斜边长度及其夹角（即连线的旋转角度）
    const lx = x_end - x_start;
    const ly = y_end - y_start;
    //计算连线长度
    const length = Math.sqrt(lx * lx + ly * ly);
    //弧度值转换为角度值
    const c = (360 * Math.atan2(ly, lx)) / (2 * Math.PI);

    //连线中心坐标
    const midX = (x_end + x_start) / 2;
    const midY = (y_end + y_start) / 2;
    const deg = c <= -90 ? 360 + c : c; //负角转换为正角

    const lineDiv = document.getElementById(`${this.guid}_link`);

    if (!lineDiv) return;

    lineDiv.style.top = midY + "px";
    lineDiv.style.left = midX - length / 2 + "px";
    lineDiv.style.width = length + "px";
    lineDiv.style.transform = `rotate(${deg}deg)`;
  }
}
