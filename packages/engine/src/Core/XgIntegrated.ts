/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-06-06 14:13:47
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-08-14 18:36:58
 */
import { Entity, JulianDate } from "cesium";
import type { EntityPropertyDict } from "../types";
import { PrivateEntityType } from "../enum";
import XgEarth from "./XgEarth";
import XgMap from "./XgMap";

type Options = {
  map?: XgMap;
  earth?: XgEarth;
};
/**
 * @descripttion: XG一体化
 * @return {*}
 * @author: Xiaohu.Shen
 */
export default class XgIntegrated {
  #map?: XgMap;
  #earth?: XgEarth;

  /**
   * @descripttion:
   * @return {*}
   * @author: Xiaohu.Shen
   */
  constructor(options?: Options) {
    this.#map = options?.map;
    this.#earth = options?.earth;
  }

  /**
   * @descripttion: 创建一体化
   * @param {string} mapContainer
   * @param {string} earthContainer
   * @return {*}
   * @author: Xiaohu.Shen
   */
  create(mapContainer: string | Element, earthContainer: string | Element) {
    this.createMap(mapContainer);
    this.createEarth(earthContainer);
  }

  /**
   * @descripttion: 释放
   * @return {*}
   * @author: Xiaohu.Shen
   */
  destroy() {
    this.#map?.destroy();
    this.#earth?.destroy();
  }

  /**
   * @descripttion:
   * @param {string} container
   * @return {*}
   * @author: Xiaohu.Shen
   */
  createMap(container: string | Element) {
    if (this.#map) throw "map资源已占用，请先释放。";

    this.#map = new XgMap(container);

    return this.#map;
  }

  get map(): XgMap | undefined {
    return this.#map;
  }

  destroyMap() {
    this.#map?.destroy();
  }

  /**
   * @descripttion: 创建earth对象
   * @param {string} container
   * @return {*}
   * @author: Xiaohu.Shen
   */
  createEarth(container: string | Element) {
    if (this.#earth) throw "earth资源已占用，请先释放。";

    this.#earth = new XgEarth(container);

    return this.#earth;
  }

  get earth() {
    return this.#earth;
  }

  destroyEarth() {
    this.#earth?.destroy();
  }

  //   setSelectionIndicatorElementInnerHTML(style: string) {
  //     this.#map?.setSelectionIndicatorElementInnerHTML(style);
  //     this.#earth?.setSelectionIndicatorElementInnerHTML(style);
  //   }

  //   setFramesPerSecondVisible(visible = true) {
  //     this.#map?.setFramesPerSecondVisible(visible);
  //     this.#earth?.setFramesPerSecondVisible(visible);
  //   }

  //   setSelectedEntity(entity: Entity) {
  //     this.#map?.setSelectedEntity(entity);
  //     this.#earth?.setSelectedEntity(entity);
  //   }

  removeSelectedEntity() {
    this.#map?.removeSelectedEntity();
    this.#earth?.removeSelectedEntity();
  }

  //   setTrackedEntity(entity: Entity) {
  //     this.#map?.roamManager.setTrackedEntity(entity);
  //     this.#earth?.roamManager.setTrackedEntity(entity);
  //   }

  /**
   * @descripttion: 是否为私有实体
   * @param {Entity} entity
   * @return {*}
   * @author: Xiaohu.Shen
   */
  isPrivateEntity(entity: Entity) {
    return entity.properties?.hasProperty("private") ?? false;
  }

  /**
   * @descripttion: 获取实体属性
   * @param {Entity} entity
   * @param {JulianDate} time
   * @return {*}
   * @author: Xiaohu.Shen
   */
  getEntityProps<T = object>(entity: Entity, time: JulianDate) {
    const properties: EntityPropertyDict<T> | undefined =
      entity.properties?.getValue(time);

    return properties;
  }

  /**
   * @descripttion: 创建私有实体
   * @param {string} flag
   * @param {Entity} options
   * @return {*}
   * @author: Xiaohu.Shen
   */
  createPrivateEntity(
    options: Entity.ConstructorOptions | undefined,
    type = PrivateEntityType.BASIC
  ) {
    return new Entity({
      ...options,
      properties: {
        ...options?.properties,
        private: type,
      },
    });
  }

  setShouldAnimate(value = true) {
    this.#map && (this.#map.timeManager.clock.shouldAnimate = value);
    this.#earth && (this.#earth.timeManager.clock.shouldAnimate = value);
  }

  changeClockMultiplier(value: number) {
    this.#map && (this.#map.timeManager.clock.multiplier = value);
    this.#earth && (this.#earth.timeManager.clock.multiplier = value);
  }

  /**
   * @descripttion: 获取父链上的所有实体
   * @param {Entity} entity
   * @return {*} 索引为0的是实体的父级，后依次为父级的父级...
   * @author: Xiaohu.Shen
   */
  getParentChainEntities(
    entity: Entity,
    result: Array<Entity> = []
  ): Array<Entity> {
    const parentEntity = entity.parent;

    if (!parentEntity) return result;

    result.push(parentEntity);
    return this.getParentChainEntities(parentEntity, result);
  }

  // setResolutionScale(scale:number){
  //     this.#map.set
  // }

  //   addXgSymbol(val: AbstractGraphic) {
  //     this.#map?.graphicManager.add(val);
  //     this.#earth?.graphicManager.add(val);
  //   }
}
