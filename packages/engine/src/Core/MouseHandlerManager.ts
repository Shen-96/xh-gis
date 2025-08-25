// /*
//  * @Descripttion:
//  * @Author: EV-申小虎
//  * @version: 1.0.0
//  * @Date: 2021-05-19 15:15:45
//  * @LastEditors: EV-申小虎
//  * @LastEditTime: 2025-01-22 07:18:39
//  */

// import {
//   Viewer,
//   createGuid,
//   defined,
//   ScreenSpaceEventHandler,
//   ScreenSpaceEventType,
//   Cartesian2,
// } from "cesium";
// import { TimeHandler, MouseEventHandler, MouseHandlerCallback } from "..";
// import AbstractManager from "./AbstractManager";

// /**
//  * @descripttion: 监听管理器
//  * @author: EV-申小虎
//  */
// class MouseHandlerManager extends AbstractManager {
//   readonly #handlerArr: Array<MouseEventHandler>;
//   readonly #clickTimerArr: Array<TimeHandler>;

//   /**
//    * @descripttion:
//    * @param {Viewer} viewer 视图
//    * @author: EV-申小虎
//    */
//   constructor(viewer: Viewer) {
//     super(viewer);
//     this.#handlerArr = [];
//     this.#clickTimerArr = [];
//   }

//   /**
//    * @descripttion: 添加事件监听
//    * @param {string} key 事件监听标识
//    * @param {ScreenSpaceEventHandler} handler 事件监听对象
//    * @return {object} 添加结果
//    * @author: EV-申小虎
//    */
//   #add(id: string, handler: ScreenSpaceEventHandler): boolean {
//     if (this.isExists(id) && !handler) return false;
//     this.#handlerArr.push({ id, handler });
//     return true;
//   }

//   /**
//    * @descripttion: 获取事件监听
//    * @param {string} key 标识
//    * @return {object|undefined} 返回结果
//    * @author: EV-申小虎
//    */
//   #get(id: string) {
//     if (!id) return undefined;
//     const filterArr = this.#handlerArr.filter(
//       (item) =>
//         item.id === id ||
//         item.id === `${id}wheel` ||
//         item.id === `${id}leftClick` ||
//         item.id === `${id}leftDoubelClick` ||
//         item.id === `${id}rightClick`
//     );
//     return filterArr.length === 1 || filterArr.length === 4
//       ? filterArr
//       : undefined;
//   }

//   /**
//    * @descripttion: 添加计时器
//    * @param {string} guid 唯一索引
//    * @param {object} timer 计时器
//    * @return {boolean} 结果
//    * @author: EV-申小虎
//    */
//   #addClickTimer(id: string, timer: NodeJS.Timeout) {
//     if (!id || timer) return false;
//     const isExists =
//       this.#clickTimerArr.findIndex((item) => item.id === id) >= 0;
//     if (!isExists) {
//       this.#clickTimerArr.push({ id, timer });
//       return true;
//     }
//     return false;
//   }

//   /**
//    * @descripttion: 根据guid获取计时器
//    * @param {string} guid 唯一索引
//    * @return {*} 结果
//    * @author: EV-申小虎
//    */
//   #getClickTimer(id: string) {
//     if (!id) return undefined;
//     const filterArr = this.#clickTimerArr.filter((item) => item.id === id);
//     return filterArr.length === 1 ? filterArr[0] : undefined;
//   }

//   /**
//    * @descripttion: 根据guid清除计时器
//    * @param {string} guid 唯一索引
//    * @return {*} 结果
//    * @author: EV-申小虎
//    */
//   #clearClickTimer(id: string) {
//     const clickTimer = this.#getClickTimer(id);
//     let result = false;
//     if (clickTimer) {
//       clearTimeout(clickTimer.timer);
//       this.#clickTimerArr.splice(
//         this.#clickTimerArr.findIndex((c) => c.id == id),
//         1
//       );
//       result = true;
//     }
//     return result;
//   }

//   /**
//    * @descripttion: 判断是否存在该监听
//    * @param {string} key 外部唯一标识
//    * @return {Index|Undefined} 索引值或undefined
//    * @author: EV-申小虎
//    */
//   isExists(id: string) {
//     if (!id) return true;
//     return this.#handlerArr.findIndex((item) => item.id === id) >= 0;
//   }

//   /**
//    * @descripttion: 添加监听鼠标滚轮事件
//    * @param {string} key 标识标
//    * @param {function} callback
//    * @return {string|undefined} 监听对象或者undefined(未创建成功)
//    * @author: EV-申小虎
//    */
//   addMouseWheelHandler(
//     id = createGuid(),
//     callback: (res: MouseHandlerCallback) => void
//   ): string | undefined {
//     /// 判断是否已存在
//     /// 可以为空，后续创建监听时会自动赋值
//     if (this.isExists(id)) return undefined;

//     /// 创建handler
//     const mouseWheelHandler = new ScreenSpaceEventHandler(
//       this.viewer.scene.canvas
//     );
//     /// 将handler放入缓存管理
//     const res = this.#add(id, mouseWheelHandler);

//     /// 未创建成功，返回
//     if (!res) return undefined;

//     /// 为handler指定监听类型
//     mouseWheelHandler.setInputAction((mouseWheel: any) => {
//       callback({ mouseWheelPosition: mouseWheel });
//     }, ScreenSpaceEventType.WHEEL);

//     /// 返回监听对象索引
//     return id;
//   }

//   /**
//    * @descripttion: 添加鼠标左键单机监听
//    * @param {string} key 索引
//    * @param {function} callback 回调函数
//    * @return {string|undefined} 监听对象或者undefined
//    * @author: EV-申小虎
//    */
//   addLeftMouseClickHandler(
//     id = createGuid(),
//     callback: (res: MouseHandlerCallback) => void
//   ): string | undefined {
//     /// 判断是否已存在
//     /// 可以为空，后续创建监听时会自动赋值
//     if (this.isExists(id)) return undefined;

//     /// 创建handler
//     const leftMouseClickHandler = new ScreenSpaceEventHandler(
//       this.viewer.scene.canvas
//     );
//     /// 将handler放入缓存管理
//     const res = this.#add(id, leftMouseClickHandler);

//     /// 未创建成功，返回
//     if (!res) return undefined;

//     /// 为handler指定监听类型
//     leftMouseClickHandler.setInputAction(
//       (movement: { position: Cartesian2 }) => {
//         try {
//           /// 清除计时器
//           this.#clearClickTimer(id);

//           /// 点击事件延时200ms执行
//           /// 区分鼠标双击
//           const clickTimer = setTimeout(() => {
//             let screenPosition: Cartesian2 = movement.position;

//             if (defined(screenPosition))
//               screenPosition = screenPosition.clone();

//             if (callback && typeof callback === "function")
//               //返回结果
//               callback({
//                 screenPosition,
//               });
//           }, 200);

//           /// 添加计时器
//           this.#addClickTimer(id, clickTimer);
//         } catch (error) {
//           console.error(new Error(`MouseLeftClickHandler: ${error}`));
//         }
//       },
//       ScreenSpaceEventType.LEFT_CLICK
//     );

//     //返回监听对象索引
//     return id;
//   }

//   /**
//    * @descripttion: 添加鼠标左键按下监听
//    * @param {string} key 索引
//    * @param {function} callback 回调函数
//    * @return {string|undefined} 监听对象或者undefined
//    * @author: EV-申小虎
//    */
//   addLeftMouseDownHandler(
//     id = createGuid(),
//     callback: (res: MouseHandlerCallback) => void
//   ): string | undefined {
//     /// 判断是否已存在
//     /// 可以为空，后续创建监听时会自动赋值
//     if (this.isExists(id)) return undefined;

//     /// 创建handler
//     const leftMouseDownHandler = new ScreenSpaceEventHandler(
//       this.viewer.scene.canvas
//     );
//     /// 将handler放入缓存管理
//     const res = this.#add(id, leftMouseDownHandler);

//     /// 未创建成功，返回
//     if (!res) return undefined;

//     /// 为handler指定监听类型
//     leftMouseDownHandler.setInputAction(
//       (movement: { position: Cartesian2 }) => {
//         try {
//           let screenPosition: Cartesian2 = movement.position;

//           if (defined(screenPosition)) screenPosition = screenPosition.clone();

//           if (callback && typeof callback === "function")
//             //返回结果
//             callback({
//               screenPosition,
//             });
//         } catch (error) {
//           console.error(new Error(`LeftMouseDownHandler: ${error}`));
//         }
//       },
//       ScreenSpaceEventType.LEFT_DOWN
//     );

//     //返回监听对象索引
//     return id;
//   }

//   /**
//    * @descripttion: 添加鼠标左键抬起监听
//    * @param {string} key 索引
//    * @param {function} callback 回调函数
//    * @return {string|undefined} 监听对象或者undefined
//    * @author: EV-申小虎
//    */
//   addLeftMouseUpHandler(
//     id = createGuid(),
//     callback: (res: MouseHandlerCallback) => void
//   ): string | undefined {
//     /// 判断是否已存在
//     /// 可以为空，后续创建监听时会自动赋值
//     if (this.isExists(id)) return undefined;

//     /// 创建handler
//     const leftMouseUpHandler = new ScreenSpaceEventHandler(
//       this.viewer.scene.canvas
//     );
//     /// 将handler放入缓存管理
//     const res = this.#add(id, leftMouseUpHandler);

//     /// 未创建成功，返回
//     if (!res) return undefined;

//     /// 为handler指定监听类型
//     leftMouseUpHandler.setInputAction((movement: { position: Cartesian2 }) => {
//       try {
//         let screenPosition: Cartesian2 = movement.position;

//         if (defined(screenPosition)) screenPosition = screenPosition.clone();

//         if (callback && typeof callback === "function")
//           //返回结果
//           callback({
//             screenPosition,
//           });
//       } catch (error) {
//         console.error(new Error(`LeftMouseUpHandler: ${error}`));
//       }
//     }, ScreenSpaceEventType.LEFT_UP);

//     //返回监听对象索引
//     return id;
//   }

//   /**
//    * @descripttion: 添加鼠标左键单机监听
//    * @param {string} key 索引
//    * @param {Function} callback 回调函数
//    * @return {object|undefined} 监听对象或者undefined
//    * @author: EV-申小虎
//    */
//   addLeftMouseDoubleClickHandler(
//     id = createGuid(),
//     callback: (res: MouseHandlerCallback) => void
//   ): string | undefined {
//     /// 判断是否已存在
//     /// 可以为空，后续创建监听时会自动赋值
//     if (this.isExists(id)) return undefined;

//     /// 创建handler
//     const leftMouseDoubleClickHandler = new ScreenSpaceEventHandler(
//       this.viewer.scene.canvas
//     );
//     /// 将handler放入缓存管理
//     const res = this.#add(id, leftMouseDoubleClickHandler);

//     /// 未创建成功，返回
//     if (!res) return undefined;

//     /// 为handler指定监听类型
//     leftMouseDoubleClickHandler.setInputAction(
//       (movement: { position: Cartesian2 }) => {
//         try {
//           /// 屏蔽鼠标单击
//           this.#clickTimerArr.forEach((t) => {
//             this.#clearClickTimer(t.id);
//           });

//           let screenPosition: Cartesian2 = movement.position;

//           if (defined(screenPosition)) screenPosition = screenPosition.clone();

//           if (callback && typeof callback === "function")
//             //返回结果
//             callback({
//               screenPosition,
//             });
//         } catch (error) {
//           console.error(new Error(`MouseLeftDoubleClickHandler: ${error}`));
//         }
//       },
//       ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//     );

//     //返回监听对象索引
//     return id;
//   }

//   /**
//    * @descripttion: 添加鼠标左键单机监听
//    * @param {string} key 索引
//    * @param {Function} callback 回调函数
//    * @return {object|undefined} 监听对象或者undefined
//    * @author: EV-申小虎
//    */
//   addRightMouseClickHandler(
//     id = createGuid(),
//     callback: (res: MouseHandlerCallback) => void
//   ) {
//     /// 判断是否已存在
//     /// 可以为空，后续创建监听时会自动赋值
//     if (this.isExists(id)) return undefined;

//     /// 创建handler
//     const rightMouseClickHandler = new ScreenSpaceEventHandler(
//       this.viewer.scene.canvas
//     );
//     /// 将handler放入缓存管理
//     const res = this.#add(id, rightMouseClickHandler);

//     /// 未创建成功，返回
//     if (!res) return undefined;

//     /// 为handler指定监听类型
//     rightMouseClickHandler.setInputAction(
//       (movement: { position: Cartesian2 }) => {
//         try {
//           let screenPosition: Cartesian2 = movement.position;

//           if (defined(screenPosition)) screenPosition = screenPosition.clone();

//           if (callback && typeof callback === "function")
//             //返回结果
//             callback({
//               screenPosition,
//             });
//         } catch (error) {
//           console.error(new Error(`MouseRightClickHandler: ${error}`));
//         }
//       },
//       ScreenSpaceEventType.RIGHT_CLICK
//     );
//     /// 返回监听对象索引
//     return id;
//   }

//   /**
//    * @descripttion: 添加鼠标左键单机监听
//    * @param {string} key 索引
//    * @param {Function} callback 回调函数
//    * @return {*} 唯一索引
//    * @author: EV-申小虎
//    */
//   addMouseClickHandler(
//     id = createGuid(),
//     callback: (res: MouseHandlerCallback) => void
//   ) {
//     //判断是否已存在
//     if (this.isExists(id)) return undefined;
//     //创建处理器索引
//     const keys = [
//       `${id}wheel`,
//       `${id}leftClick`,
//       `${id}leftDoubelClick`,
//       `${id}rightClick`,
//     ];

//     //创建鼠标事件
//     this.addMouseWheelHandler(keys[0], callback);
//     this.addLeftMouseClickHandler(keys[1], callback);
//     this.addLeftMouseDoubleClickHandler(keys[2], callback);
//     this.addRightMouseClickHandler(keys[3], callback);

//     //返回监听对象索引
//     return id;
//   }

//   /**
//    * @descripttion: 监听鼠标移动事件获取坐标信息
//    * @param {string} key 索引
//    * @param {Function} callback 回调函数
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   addMouseMoveHandler(
//     id = createGuid(),
//     callback: (res: MouseHandlerCallback) => void
//   ) {
//     /// 判断是否已存在
//     /// 可以为空，后续创建监听时会自动赋值
//     if (this.isExists(id)) return undefined;

//     /// 创建handler
//     const mouseMoveHandler = new ScreenSpaceEventHandler(
//       this.viewer.scene.canvas
//     );
//     /// 将handler放入缓存管理
//     const res = this.#add(id, mouseMoveHandler);

//     /// 未创建成功，返回
//     if (!res) return undefined;

//     /// 为handler指定监听类型
//     mouseMoveHandler.setInputAction((movement: { endPosition: Cartesian2 }) => {
//       try {
//         let screenPosition: Cartesian2 = movement.endPosition;

//         if (defined(screenPosition)) screenPosition = screenPosition.clone();

//         if (callback && typeof callback === "function")
//           //返回结果
//           callback({
//             screenPosition,
//           });
//       } catch (error) {
//         console.error(new Error(`MouseMoveHandler: ${error}`));
//       }
//     }, ScreenSpaceEventType.MOUSE_MOVE);
//     //返回监听对象索引
//     return id;
//   }

//   /**
//    * @descripttion: 销毁处理器
//    * @param {ScreenSpaceEventHandler} handler 处理器
//    * @return {result|Boolean} 处理结果
//    * @author: EV-申小虎
//    */
//   #destroyHandler(handler: ScreenSpaceEventHandler) {
//     let result = false;
//     if (defined(handler))
//       if (!handler.isDestroyed()) {
//         handler.destroy();
//         result = true;
//       }
//     return result;
//   }

//   /**
//    * @descripttion: 销毁处理器(byKey)
//    * @param {string} key 索引
//    * @return {*} 结果
//    * @author: EV-申小虎
//    */
//   destroyHandlerById(id: string) {
//     let result = false;
//     //获取处理器
//     const handlerArr = this.#get(id);
//     //判断处理器有无
//     if (handlerArr) {
//       let index = 0;
//       //删除处理器
//       handlerArr.forEach((obj) => {
//         const { id, handler } = obj;
//         if (this.#destroyHandler(handler)) {
//           this.#handlerArr.splice(
//             this.#handlerArr.findIndex((h) => h.id == id),
//             1
//           );
//           index++;
//         }
//       });
//       index === handlerArr.length && (result = true);
//     }
//     return result;
//   }
// }
// export default MouseHandlerManager;
