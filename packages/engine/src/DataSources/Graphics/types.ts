/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-01-14 03:21:07
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-28 05:56:36
 */

import { PointGraphics, BillboardGraphics } from "cesium";
import { GeometryStyleMap, Point3Deg } from "../../types";
import { GeometryType } from "../../enum";
import AbstractGraphic from "./Abstract/AbstractGraphic";

export type PointStyle = Pick<
  PointGraphics.ConstructorOptions,
  "pixelSize" | "color" | "outlineColor" | "outlineWidth"
>;

export type BillboardStyle = Pick<
  BillboardGraphics.ConstructorOptions,
  | "image"
  | "scale"
  | "color"
  | "sizeInMeters"
  | "rotation"
  | "alignedAxis"
  | "width"
  | "height"
>;

export type MarkStyle = {
  pointStyle?: PointStyle;
  billboardStyle?: BillboardStyle;
};

export type State = "drawing" | "edit" | "static" | "animating" | "hidden";

export type EventType =
  | "drawStart"
  | "drawUpdate"
  | "drawEnd"
  | "editEnd"
  | "editStart";
export type EventListener = (eventData?: any) => void;

export type VisibleAnimationOpts = {
  duration?: number;
  delay?: number;
  callback?: () => void;
  loop?: boolean;
};

export type GrowthAnimationOpts = {
  duration: number;
  delay: number;
  callback: () => void;
  loop?: boolean;
};

export type FlashType = "ShowOff" | "SwitchColor";
export type FlashIntervalType = "Numbers" | "Frequency";

export type FlashAnimationOpts<T extends GeometryType> = {
  duration?: number;
  delay?: number;
  callback?: () => void;
  loop?: boolean;

  flashtype?: FlashType;
  intervaltype?: FlashIntervalType;
  flashinterval?: number;
  flashnum?: number;
  startStyle?: GeometryStyleMap[T];
  endStyle?: GeometryStyleMap[T];
};

// 定义一个映射关系，将 geometryType 映射到对应的 GeometryDrawEventCallbackMap 类型
export type GeometryDrawEventCallbackMap = {
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
};
