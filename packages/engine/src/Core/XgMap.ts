/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2020-11-11 11:30:13
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-04-14 09:22:25
 */

import { Viewer, SceneMode } from "cesium";
import AbstractCore from "./AbstractCore";
import { CoreType } from "../enum";

const viewerOptions: Viewer.ConstructorOptions = {
  sceneMode: SceneMode.SCENE2D,
  skyBox: false,
  skyAtmosphere: false,
};

/**
 * @descripttion: 二维视图
 * @author: EV-申小虎
 */
export default class XgMap extends AbstractCore<CoreType.MAP> {
  coreType: CoreType.MAP = CoreType.MAP;

  /**
   * @descripttion: 初始化参数
   * @param {Document} container 容器
   * @param {Object} layerLevel 图层级别
   * @param {String} hostUrl 用户地址
   * @param {Object} viewerOptions 视图参数
   * @return {type} 球
   */
  constructor(
    container: string | Element,
    options?: Viewer.ConstructorOptions
  ) {
    super(container, { ...viewerOptions, ...options });
  }
}
