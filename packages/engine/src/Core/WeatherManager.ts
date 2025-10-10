/*
 * @Descripttion: Cesium系统天气
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-03-18 09:02:03
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:36:48
 */
import { Cartesian3, Viewer } from "cesium";
import { WindDirectionType } from "../enum";
import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";

/**
 * @descripttion: 天气管理器
 * @author: EV-申小虎
 */
class WeatherManager extends AbstractManager {
  //私有属性
  #direction: WindDirectionType;
  #level: number;

  /**
   * @descripttion: 构造函数
   * @param {WindDirectionType} direction 风向
   * @param {number} level 风力
   * @author: EV-申小虎
   */
  constructor(
    core: AbstractCore,
    direction: WindDirectionType = WindDirectionType.NONE,
    level = 0
  ) {
    super(core);
    this.#direction = direction;
    this.#level = level;
  }

  /**
   * @descripttion: 设置风向
   * @param {WindDirectionType} direction 风向
   * @return {void}
   * @author: EV-申小虎
   */
  setDirection(direction: WindDirectionType) {
    this.#direction = direction;
  }

  /**
   * @descripttion: 获取当前风向
   * @return {WindDirectionType}
   * @author: EV-申小虎
   */
  getDirection() {
    return this.#direction;
  }

  /**
   * @descripttion: 设置当前风力
   * @param {number} level 风力
   * @return {void}
   * @author: EV-申小虎
   */
  setLevel(level: number) {
    this.#level = level;
  }

  /**
   * @descripttion: 获取当前风力
   * @return {number}
   * @author: EV-申小虎
   */
  getLevel() {
    return this.#level;
  }

  /**
   * @descripttion: 根据风力、风向计算向量
   * @return {Cartesian3} 向量
   * @author: EV-申小虎
   */
  getWindForceVector() {
    let vectory: Cartesian3;

    switch (this.#direction) {
      case WindDirectionType.NORTH:
        vectory = new Cartesian3(0, 0, -0.2 * this.#level);
        break;
      case WindDirectionType.NORTHEAST:
        vectory = new Cartesian3(0, 0.2 * this.#level, -0.2 * this.#level);
        break;
      case WindDirectionType.EAST:
        vectory = new Cartesian3(0.2 * this.#level, 0, 0);
        break;
      case WindDirectionType.SOUTHEAST:
        vectory = new Cartesian3(0.2 * this.#level, 0, 0.2 * this.#level);
        break;
      case WindDirectionType.SOUTH:
        vectory = new Cartesian3(0, 0, 0.2 * this.#level);
        break;
      case WindDirectionType.SOUTHWEST:
        vectory = new Cartesian3(0, -0.2 * this.#level, 0.2 * this.#level);
        break;
      case WindDirectionType.WEST:
        vectory = new Cartesian3(-0.2 * this.#level, 0, 0);
        break;
      case WindDirectionType.NORTHWEST:
        vectory = new Cartesian3(-0.2 * this.#level, 0, -0.2 * this.#level);
        break;
      default:
        vectory = new Cartesian3(0, 0, 0);
        break;
    }
    return vectory;
  }
}
export default WeatherManager;
