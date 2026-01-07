/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2022-01-11 17:11:44
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-07 11:44:25
 */

// 导入所有图元和符号的自注册模块（副作用导入）
import "./DataSources/register-all";
// 导入所有自定义材质的集中注册（副作用导入）
import "./Rendering/Materials/Appearances/register-builtins";

export * from "./enum";
export * from "./types";
export * from "./DataSources";

// 管理器类通过 core 实例访问，不需要直接导出
// import TimeManager from "./Core/TimeManager";
// import RoamManager from "./Core/RoamManager";
// import AnimationManager from "./Core/AnimationManager";
// import Geographic from "./Core/Geographic";
// import LayerManager from "./Core/LayerManager";
// import ParticleManager from "./Core/ParticleManager";
// import SceneListenerManager from "./Core/SceneListenerManager";
// import WeatherManager from "./Core/WeatherManager";
// import Constant from "./Core/Constant";

// 保留工具类和外部可能使用的类
import MathUtils from "./Core/MathUtils";
import GraphicManager from "./Core/GraphicManager";
import GraphicUtils from "./Core/GraphicUtils";
import GeometryUtils from "./Core/GeometryUtils";
import CoordinateUtils from "./Core/CoordinateUtils";
import MouseEventUtils from "./Core/MouseEventUtils";
// import SpatialAnalysis from "./Core/SpatialAnalysis";
// FX 模块兼容层导出（统一从 FX 入口 re-export）
export { FxManager, FxType } from "./FX"; // AbstractFx 为内部类，不对外导出
// 提供命名空间导出，便于以 FX.XgFrustumFX 等方式访问现有特效类
export * as FX from "./FX";
import AbstractCore from "./Core/AbstractCore";
import XgEarth from "./Core/XgEarth";
import XgMap from "./Core/XgMap";
// import XgIntegrated from "./Core/XgIntegrated";
import {
  setResourceConfig,
  getResourceUrl,
  getResourceConfig,
  resourceManager,
  resourcePreloader,
} from "./Core/ResourceConfig";
import type { ResourceConfig } from "./Core/ResourceConfig";
import { ResourceManager } from "./Core/AbstractCore";
// HeatmapManager 通过 core.heatmapManager 访问，不需要直接导出
// import HeatmapManager from "./Core/HeatmapManager";
// Heatmap exports now come from DataSources
// export * from "./Core/Heatmap";

export {
  // 核心类
  XgEarth,
  XgMap,
  AbstractCore, // @internal - 仅供类型引用（widgets 包使用），外部用户请使用 XgEarth | XgMap

  // 管理器类（外部可能用于类型引用）
  GraphicManager,

  // 工具类
  MathUtils,
  CoordinateUtils,
  MouseEventUtils,
  GraphicUtils,
  GeometryUtils,

  // 资源配置 API
  setResourceConfig, // 高级用法：配置资源路径
  getResourceUrl, // 调试/验证：获取资源 URL
  getResourceConfig, // 调试：获取当前配置

  // 资源预加载 API（高级用法，用于性能优化）
  resourceManager, // 提供预加载和配置管理功能
  resourcePreloader, // 全局预加载器实例

  // 资源工具类
  ResourceManager, // 来自 AbstractCore.ts，提供资源路径常量（ResourceManager.PATHS）
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
