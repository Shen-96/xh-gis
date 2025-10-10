/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-05-19 15:15:45
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-02-20 01:32:08
 */

import {
  Viewer,
  defined,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartesian2,
} from "cesium";
import type { ScreenWheelCallback, ScreenClickCallback } from "../types";

/**
 * @descripttion: 监听管理器
 * @author: EV-申小虎
 */
class MouseEventUtils {
  /**
   * @descripttion: 添加监听鼠标滚轮事件
   * @param {ScreenSpaceEventHandler} handler 监听器
   * @param {function} callback
   * @return {string|undefined} 监听对象或者undefined(未创建成功)
   * @author: EV-申小虎
   */
  static setWheelListener(
    handler: ScreenSpaceEventHandler,
    callback: (res: ScreenWheelCallback) => void
  ) {
    /// 为handler指定监听类型
    handler.setInputAction((mouseWheel: any) => {
      callback({ delta: mouseWheel });
    }, ScreenSpaceEventType.WHEEL);
  }

  /**
   * @descripttion: 添加鼠标左键单机监听
   * @param {ScreenSpaceEventHandler} handler 监听器
   * @param {function} callback 回调函数
   * @return {string|undefined} 监听对象或者undefined
   * @author: EV-申小虎
   */
  static setLeftClickListener(
    handler: ScreenSpaceEventHandler,
    callback: (res: ScreenClickCallback) => void
  ) {
    /// 为handler指定监听类型
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      // try {
      /// 点击事件延时200ms执行
      /// 区分鼠标双击
      // const clickTimer = setTimeout(() => {
      let screenPosition: Cartesian2 = movement.position;

      if (defined(screenPosition)) screenPosition = screenPosition.clone();

      if (callback && typeof callback === "function")
        //返回结果
        callback({
          screenPosition,
        });
      // }, 200);
      // } catch (error) {
      //   console.error(new Error(`MouseLeftClickHandler: ${error}`));
      // }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * @descripttion: 添加鼠标左键按下监听
   * @param {ScreenSpaceEventHandler} handler 监听器
   * @param {function} callback 回调函数
   * @return {string|undefined} 监听对象或者undefined
   * @author: EV-申小虎
   */
  static setLeftDownListener(
    handler: ScreenSpaceEventHandler,
    callback: (res: ScreenClickCallback) => void
  ) {
    /// 为handler指定监听类型
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      // try {
      let screenPosition: Cartesian2 = movement.position;

      if (defined(screenPosition)) screenPosition = screenPosition.clone();

      if (callback && typeof callback === "function")
        //返回结果
        callback({
          screenPosition,
        });
      // } catch (error) {
      //   console.error(new Error(`LeftMouseDownHandler: ${error}`));
      // }
    }, ScreenSpaceEventType.LEFT_DOWN);
  }

  /**
   * @descripttion: 添加鼠标左键抬起监听
   * @param {ScreenSpaceEventHandler} handler 监听器
   * @param {function} callback 回调函数
   * @return {string|undefined} 监听对象或者undefined
   * @author: EV-申小虎
   */
  static setLeftUpListener(
    handler: ScreenSpaceEventHandler,
    callback: (res: ScreenClickCallback) => void
  ) {
    /// 为handler指定监听类型
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      // try {
      let screenPosition: Cartesian2 = movement.position;

      if (defined(screenPosition)) screenPosition = screenPosition.clone();

      if (callback && typeof callback === "function")
        //返回结果
        callback({
          screenPosition,
        });
      // } catch (error) {
      //   console.error(new Error(`LeftMouseUpHandler: ${error}`));
      // }
    }, ScreenSpaceEventType.LEFT_UP);
  }

  /**
   * @descripttion: 添加鼠标左键单机监听
   * @param {ScreenSpaceEventHandler} handler 监听器
   * @param {Function} callback 回调函数
   * @return {object|undefined} 监听对象或者undefined
   * @author: EV-申小虎
   */
  static setLeftDoubleClickListener(
    handler: ScreenSpaceEventHandler,
    callback: (res: ScreenClickCallback) => void
  ) {
    /// 为handler指定监听类型
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      // try {
      let screenPosition: Cartesian2 = movement.position;

      if (defined(screenPosition)) screenPosition = screenPosition.clone();

      if (callback && typeof callback === "function")
        //返回结果
        callback({
          screenPosition,
        });
      // } catch (error) {
      //   console.error(new Error(`MouseLeftDoubleClickHandler: ${error}`));
      // }
    }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  /**
   * @descripttion: 添加鼠标左键单机监听
   * @param {ScreenSpaceEventHandler} handler 监听器
   * @param {Function} callback 回调函数
   * @return {object|undefined} 监听对象或者undefined
   * @author: EV-申小虎
   */
  static setRightClickListener(
    handler: ScreenSpaceEventHandler,
    callback: (res: ScreenClickCallback) => void
  ) {
    /// 为handler指定监听类型
    handler.setInputAction((movement: { position: Cartesian2 }) => {
      // try {
      let screenPosition: Cartesian2 = movement.position;

      if (defined(screenPosition)) screenPosition = screenPosition.clone();

      if (callback && typeof callback === "function")
        //返回结果
        callback({
          screenPosition,
        });
      // } catch (error) {
      //   console.error(new Error(`MouseRightClickHandler: ${error}`));
      // }
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }

  /**
   * @descripttion: 添加鼠标左键单机监听
   * @param {ScreenSpaceEventHandler} handler 监听器
   * @param {Function} callback 回调函数
   * @return {*} 唯一索引
   * @author: EV-申小虎
   */
  static setClickListener(
    handler: ScreenSpaceEventHandler,
    callback: (res: ScreenClickCallback) => void
  ) {
    //创建鼠标事件
    this.setLeftClickListener(handler, callback);
    this.setLeftDoubleClickListener(handler, callback);
    this.setRightClickListener(handler, callback);
  }

  /**
   * @descripttion: 监听鼠标移动事件获取坐标信息
   * @param {ScreenSpaceEventHandler} handler 监听器
   * @param {Function} callback 回调函数
   * @return {*}
   * @author: EV-申小虎
   */
  static setMoveListener(
    handler: ScreenSpaceEventHandler,
    callback: (res: ScreenClickCallback) => void
  ) {
    /// 为handler指定监听类型
    handler.setInputAction((movement: { endPosition: Cartesian2 }) => {
      // try {
      let screenPosition: Cartesian2 = movement.endPosition;

      if (defined(screenPosition)) screenPosition = screenPosition.clone();

      if (callback && typeof callback === "function")
        //返回结果
        callback({
          screenPosition,
        });
      // } catch (error) {
      //   console.error(new Error(`MouseMoveHandler: ${error}`));
      // }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }
}

export default MouseEventUtils;
