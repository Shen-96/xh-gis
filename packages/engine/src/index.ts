/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2022-01-11 17:11:44
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-03 10:39:03
 */

// 导入所有图元和符号的自注册模块（副作用导入）
import "./DataSources/register-all";

export * from "./enum";
export * from "./types";
export * from "./DataSources";

import TimeManager from "./Core/TimeManager";
import RoamManager from "./Core/RoamManager";
import AnimationManager from "./Core/AnimationManager";
import Geographic from "./Core/Geographic";
import LayerManager from "./Core/LayerManager";
// import MouseHandlerManager from "./Core/MouseHandlerManager";
import ParticleManager from "./Core/ParticleManager";
import SceneListenerManager from "./Core/SceneListenerManager";
import WeatherManager from "./Core/WeatherManager";
import MathUtils from "./Core/MathUtils";
import GraphicManager from "./Core/GraphicManager";
import GraphicUtils from "./Core/GraphicUtils";
import GeometryUtils from "./Core/GeometryUtils";
import Constant from "./Core/Constant";
// import SpatialAnalysis from "./Core/SpatialAnalysis";
// FX 模块兼容层导出（统一从 FX 入口 re-export）
export { FxManager, FxType, AbstractFx } from "./FX";
// 提供命名空间导出，便于以 FX.XgFrustumFX 等方式访问现有特效类
export * as FX from "./FX";
import AbstractCore from "./Core/AbstractCore";
import XgEarth from "./Core/XgEarth";
import XgMap from "./Core/XgMap";
// import XgIntegrated from "./Core/XgIntegrated";
import CoordinateUtils from "./Core/CoordinateUtils";
import MouseEventUtils from "./Core/MouseEventUtils";
import { setResourceConfig, getResourceUrl, getResourceConfig, resourceManager, ResourcePreloader, resourcePreloader } from "./Core/ResourceConfig";
import type { ResourceConfig } from "./Core/ResourceConfig";
import { ResourceManager } from "./Core/AbstractCore";
import HeatmapManager from "./Core/HeatmapManager";
// Heatmap exports now come from DataSources
// export * from "./Core/Heatmap";

export {
  RoamManager,
  AbstractCore,
  XgEarth,
  XgMap,
  // XgIntegrated,
  AnimationManager,
  Geographic,
  LayerManager,
  // MouseHandlerManager,
  ParticleManager,
  SceneListenerManager,
  TimeManager,
  WeatherManager,
  MathUtils,
  CoordinateUtils,
  MouseEventUtils,
  // Roam,
  GraphicManager,
  GraphicUtils,
  GeometryUtils,
  Constant,
  // SpatialAnalysis,
  // 兼容导出：FX 管理器（命名导出）
  // 已在顶部统一导出，避免重复
  setResourceConfig,
  getResourceUrl,
  getResourceConfig,
  resourceManager,
  ResourceManager,
  ResourcePreloader,
  resourcePreloader,
  HeatmapManager,
};

export type { ResourceConfig };

declare global {
  type PartialDeep<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
      ? PartialDeep<U>[] // 处理数组
      : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<PartialDeep<U>> // 处理只读数组
      : T[P] extends Set<infer U>
      ? Set<PartialDeep<U>> // 处理Set
      : T[P] extends Map<infer K, infer V>
      ? Map<K, PartialDeep<V>> // 处理Map
      : T[P] extends object
      ? PartialDeep<T[P]> // 普通对象
      : T[P]; // 基础类型
  };

  type PartialPrivate<T> = {
    [K in keyof T]: K extends string & `_${string}` ? T[K] | undefined : T[K];
  };

  interface Window {
    xgMap?: XgMap;
    xgEarth?: XgEarth;
  }
}
