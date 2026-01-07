/*
 * @Descripttion:
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2021-06-30 18:14:17
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-08-14 18:36:15
 */

import { Scene, JulianDate } from "cesium";
import { SceneListenerType } from "../enum";
import BaseManager from "./BaseManager";
import AbstractCore from "./AbstractCore";

type Listener = {
  id: string;
  type: SceneListenerType;
  listener: (scene: Scene, time: JulianDate) => void;
};

class SceneListenerManager extends BaseManager {
  #listenerArr: Array<Listener>;

  constructor(core: AbstractCore) {
    super(core);
    this.#listenerArr = [];
  }

  /**
   * @descripttion: 添加监听
   * @param {IListener} listener
   * @return {*}
   * @author: Xiaohu.Shen
   */
  add(
    id: string,
    type: SceneListenerType,
    listener: (scene: Scene, time: JulianDate) => void
  ) {
    if (!this.isExists(id)) {
      switch (type) {
        case SceneListenerType.postRender:
          this.viewer.scene.postRender.addEventListener(listener);
          break;
        case SceneListenerType.postUpdate:
          this.viewer.scene.postUpdate.addEventListener(listener);
          break;
        case SceneListenerType.preRender:
          this.viewer.scene.preRender.addEventListener(listener);
          break;
        case SceneListenerType.preUpdate:
          this.viewer.scene.preUpdate.addEventListener(listener);
          break;
        default:
          break;
      }
      this.#listenerArr.push({ id, type, listener });
    }
  }

  /**
   * @descripttion: 是否存在监听
   * @param {string} id 唯一标识
   * @return {boolean} 查询结果
   * @author: Xiaohu.Shen
   */
  isExists(id: string) {
    return this.#listenerArr.findIndex((item) => item.id === id) >= 0;
  }

  /**
   * @descripttion: 获取图层
   * @param {string} id 图层唯一标识
   * @return {LayerRecord} 图层记录
   * @author: Xiaohu.Shen
   */
  get(id: string) {
    if (this.isExists(id))
      return this.#listenerArr.filter((item) => item.id === id)[0];
  }

  /**
   * @descripttion: 删除图层
   * @param {string} id 图层唯一索引
   * @return {void}
   * @author: Xiaohu.Shen
   */
  removeById(id: string) {
    let result = false;
    if (this.isExists(id)) {
      const { listener, type } = this.get(id)!;
      switch (type) {
        case SceneListenerType.postRender:
          this.viewer.scene.postRender.removeEventListener(listener);
          break;
        case SceneListenerType.postUpdate:
          this.viewer.scene.postUpdate.removeEventListener(listener);
          break;
        case SceneListenerType.preRender:
          this.viewer.scene.preRender.removeEventListener(listener);
          break;
        case SceneListenerType.preUpdate:
          this.viewer.scene.preUpdate.removeEventListener(listener);
          break;
        default:
          break;
      }
      const newListeners = this.#listenerArr.filter((item) => item.id !== id);
      this.#listenerArr = [...newListeners];
      result = true;
    }
    return result;
  }
}
export default SceneListenerManager;
