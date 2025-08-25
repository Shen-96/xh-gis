/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2020-11-11 11:30:13
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-04-14 09:22:45
 */

import { Viewer, SceneMode } from "cesium";
import AbstractCore from "./AbstractCore";
import { CoreType } from "../enum";

const viewerOptions: Viewer.ConstructorOptions = {
  scene3DOnly: true, /// 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源，默认false
  sceneMode: SceneMode.SCENE3D,
};

/**
 * @descripttion: 三维视图
 * @author: EV-申小虎
 */
export default class XgEarth extends AbstractCore<CoreType.EARTH> {
  coreType: CoreType.EARTH = CoreType.EARTH;

  /**
   * @descripttion: 初始化参数
   * @param {Document} container 容器
   * @param {Object} layerLevel 图层级别
   * @param {String} hostUrl 用户地址
   * @param {Object} viewerOptions 视图参数
   * @return {XgEarth} 球
   */
  constructor(
    container: string | Element,
    options?: Viewer.ConstructorOptions
  ) {
    super(container, { ...viewerOptions, ...options });
  }
}
