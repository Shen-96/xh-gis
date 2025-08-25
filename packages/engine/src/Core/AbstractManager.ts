/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-03-08 12:47:23
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:32:07
 */

import { createGuid, defined, Viewer } from "cesium";
import AbstractCore from "./AbstractCore";

export default abstract class AbstractManager {
  protected readonly guid = createGuid();
  protected readonly core: AbstractCore;
  protected readonly viewer: Viewer;

  constructor(core: AbstractCore) {
    this.core = core;
    this.viewer = this.#init(core.viewer);
  }

  /**
   * @descripttion: 初始化
   * @param {Viewer} viewer 视图
   * @return {Viewer} 视图
   * @author: EV-申小虎
   */
  #init(viewer: Viewer): Viewer {
    if (!defined(viewer)) throw new Error("无效的视图对象！");
    return viewer;
  }

  // /*
  //  * @descripttion: 渲染鼠标跟随框
  //  * @param {string} id
  //  * @param {string} tip
  //  * @param {CSSStyleDeclaration} style
  //  * @return {*}
  //  * @author: EV-申小虎
  //  */
  // protected renderMouseTip(
  //   tip = "请在场景中，选择发生位置",
  //   style?: CSSStyleDeclaration
  // ) {
  //   const id = "xh-gis-mouse-tip-container";

  //   let toolTip = document.getElementById(id);
  //   if (toolTip) {
  //     toolTip.innerHTML = tip;
  //     return;
  //   } else {
  //     toolTip = document.createElement("div");
  //     const popBefore = document.createElement("div"),
  //       container = this.viewer.container;

  //     /// 设置容器样式
  //     toolTip.id = id;
  //     toolTip.style.position = "absolute";
  //     toolTip.style.zIndex = "2";
  //     toolTip.innerHTML = tip;
  //     toolTip.style.color = style?.color || "#FFF";
  //     toolTip.style.margin = style?.margin || "5px";
  //     toolTip.style.backgroundColor = style?.backgroundColor || "#636770c7";
  //     toolTip.style.border = style?.border || "1px solid #16abd8b5";
  //     toolTip.style.borderRadius = style?.borderRadius || "5px";
  //     /// 禁用选中
  //     toolTip.style.userSelect = "none";
  //     //伪元素标签
  //     /// before元素样式
  //     popBefore.style.display = "block";
  //     popBefore.style.width = "0";
  //     popBefore.style.borderWidth = "5px 11px 5px 5px";
  //     popBefore.style.borderStyle = "solid";
  //     popBefore.style.borderColor =
  //       "transparent #16abd8b5 transparent transparent";
  //     popBefore.style.position = "absolute";
  //     popBefore.style.transform = "rotate(-45deg)";
  //     popBefore.style.left = "-15px";
  //     popBefore.style.bottom = "-10px";
  //     /// 添加提示框到容器上
  //     container?.appendChild(toolTip);
  //     /// 添加伪元素到信息框
  //     toolTip.appendChild(popBefore);
  //     /// 鼠标移动监听
  //     /// 创建handler
  //     this.#mouseMoveHandler = new ScreenSpaceEventHandler(
  //       this.viewer.scene.canvas
  //     );
  //     /// 为handler指定监听类型
  //     this.#mouseMoveHandler.setInputAction(
  //       (movement: { endPosition: Cartesian2 }) => {
  //         try {
  //           const screenPosition: Cartesian2 = movement.endPosition;

  //           if (defined(screenPosition) && toolTip) {
  //             toolTip.style.top = screenPosition.y - 40 + "px";
  //             toolTip.style.left = screenPosition.x + 10 + "px";
  //           }
  //         } catch (error) {
  //           console.error(new Error(`MouseMoveHandler: ${error}`));
  //         }
  //       },
  //       ScreenSpaceEventType.MOUSE_MOVE
  //     );
  //   }
  // }

  // /**
  //  * @descripttion: 移除鼠标跟随框
  //  * @param {string} id
  //  * @return {*}
  //  * @author: EV-申小虎
  //  */
  // protected removeMouseTip() {
  //   const id = "xh-gis-mouse-tip-container";

  //   this.#mouseMoveHandler?.destroy();
  //   this.#mouseMoveHandler = undefined;
  //   const htmlElement = document.getElementById(id);
  //   /// 移除元素
  //   htmlElement?.remove();
  // }

  // /**
  //  * @descripttion: 创建私有实体
  //  * @param {string} flag
  //  * @param {Entity} options
  //  * @return {*}
  //  * @author: EV-申小虎
  //  */
  // protected createPrivateEntity(
  //   options: Entity.ConstructorOptions | undefined,
  //   type = PrivateEntityType.BASIC
  // ) {
  //   return new Entity({
  //     ...options,
  //     properties: {
  //       ...options?.properties,
  //       private: type,
  //     },
  //   });
  // }

  // /**
  //  * @descripttion: 获取实体属性
  //  * @param {Entity} entity
  //  * @param {JulianDate} time
  //  * @return {*}
  //  * @author: EV-申小虎
  //  */
  // protected getEntityProps<T = object>(entity: Entity, time: JulianDate) {
  //   const properties: EntityPropertyDict<T> | undefined =
  //     entity.properties?.getValue(time);

  //   return properties;
  // }

  // /**
  //  * @descripttion: 根据屏幕坐标获取选中对象
  //  * @param {Viewer} viewer
  //  * @param {Cartesian2} screenPosition
  //  * @return {*}
  //  * @author: EV-申小虎
  //  */
  // protected getPickedObject(viewer: Viewer, screenPosition: Cartesian2) {
  //   let result: { id?: Entity } | undefined = undefined;

  //   /// 1.先判断浏览器是否支持深度拾取
  //   // if (!viewer.scene.pickPositionSupported) {
  //   //     console.error("获取对象失败，error:", "该浏览器不支持深度拾取！");
  //   //     return result;
  //   // }

  //   /// 2.再判断是否开启了地形深度探测
  //   // if (!viewer.scene.globe.depthTestAgainstTerrain) {
  //   //     console.error("获取对象失败，error:", "未开启地形深度探测！");
  //   //     return result;
  //   // }

  //   /// 3.开始获取选中对象
  //   result = viewer.scene.pick(screenPosition);

  //   return result;
  // }
}
