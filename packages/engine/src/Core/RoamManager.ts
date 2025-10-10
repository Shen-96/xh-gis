/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-04-08 16:26:10
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-04-18 03:10:17
 */
import {
  HeadingPitchRoll,
  HeadingPitchRange,
  Transforms,
  defined,
  EasingFunction,
  Cartesian3,
  BoundingSphere,
  Rectangle,
  Entity,
  Camera,
  Cartographic,
  Ellipsoid,
  Math as CesiumMath,
  Matrix4,
  Ray,
  Cartesian2,
  PerspectiveFrustum,
  OrthographicFrustum,
  OrthographicOffCenterFrustum,
  PerspectiveOffCenterFrustum,
  EntityCollection,
  DataSource,
  ImageryLayer,
  Cesium3DTileset,
  TimeDynamicPointCloud,
} from "cesium";
import type { CameraInfo } from "../types";
import Geographic from "./Geographic";
import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";

/**
 * @descripttion: 漫游管理器
 * @author: EV-申小虎
 */
export default class RoamManager extends AbstractManager {
  // pathManager: PartialPrivate<PathManager>;
  // #isStarted;
  // #isPaused;
  //当前漫游
  // #currentRoam: object;
  // readonly camera: Camera;

  /**
   * @descripttion: 系统漫游
   * @param {*} viewer cesium视图
   * @author: EV-申小虎
   */
  constructor(core: AbstractCore) {
    super(core);
    // this.camera = viewer.camera;
    // this.pathManager = new PathManager();
    // this.#isStarted = false;
    // this.#isPaused = false;
    // this.#currentRoam = {
    //     roam: undefined,
    //     index: -1,
    // };
  }

  get camera() {
    return this.viewer.camera;
  }

  get trackedEntity() {
    return this.viewer.trackedEntity;
  }

  set trackedEntity(entity: Entity | undefined) {
    this.viewer.trackedEntity = entity;
  }

  /**
   * @descripttion: 初始化视图框
   * @param {callback} callback 返回值
   * @return {void}
   * @author: EV-申小虎
   */
  initFullExtend(
    position: Cartesian3 = Cartesian3.fromDegrees(
      107.7004,
      35.5588,
      17894750.737236
    ),
    callback?: (res: boolean) => void
  ) {
    /// 17894750
    this.viewer.camera.flyTo({
      destination: position,
      duration: 5,
      easingFunction: (time) => time * (2 - time),
      complete: () => {
        callback && callback(true);
      },
    });
  }

  /**
   * 获取当前视野中心位置
   * @return {Object} 位置信息
   */
  get positionGeographic() {
    /// 获取相机地理坐标
    const cartographic = this.viewer.camera.positionCartographic.clone(),
      lon = CesiumMath.toDegrees(cartographic.longitude ?? 0),
      lat = CesiumMath.toDegrees(cartographic.latitude ?? 0),
      height = cartographic.height ?? 0,
      gcs = new Geographic(lon, lat, height);

    return gcs;
  }

  /**
   * @descripttion: 获取相机当前朝向
   * @return {*}
   * @author: EV-申小虎
   */
  get orientation() {
    /// 相机参数
    const roll = this.viewer.camera.roll ?? 0,
      heading = this.viewer.camera.heading ?? 0,
      pitch = this.viewer.camera.pitch ?? 0,
      orientation = new HeadingPitchRoll(heading, pitch, roll);

    return orientation;
  }

  /**
   * @descripttion: 获取相机当前朝向(度)
   * @return {*}
   * @author: EV-申小虎
   */
  get orientationDegree() {
    /// 相机参数
    const roll = this.viewer.camera.roll ?? 0,
      heading = this.viewer.camera.heading ?? 0,
      pitch = this.viewer.camera.pitch ?? 0;

    return {
      heading: CesiumMath.toDegrees(heading),
      pitch: CesiumMath.toDegrees(pitch),
      roll: CesiumMath.toDegrees(roll),
    };
  }

  /**
   * @descripttion: 获取相机视点位置
   * @param {*} viewer cesium视图
   * @return {Cartesian3} 视点
   * @author: EV-申小虎
   */
  get viewPosition() {
    //相机方向
    const direction = this.viewer.camera.direction.clone(),
      //相机中心点
      center = this.viewer.camera.position.clone(),
      //以相机中心点、相机方向创建射线
      cameraRay = new Ray(center, direction),
      //射线与地球场景交点
      result = this.viewer.scene.globe.pick(cameraRay, this.viewer.scene);

    return result;
  }

  get cameraInfo(): CameraInfo {
    const orientation = this.orientationDegree,
      gcs = this.positionGeographic,
      cartographic = this.viewer.camera.positionCartographic,
      /// 获取相应位置地表高程
      altitude = this.viewer.scene.globe.getHeight(cartographic) ?? 0;

    return {
      lon: gcs.longitude,
      lat: gcs.latitude,
      height: gcs.altitude ?? 0,
      altitude: altitude < 0 ? 0 : altitude,
      ...orientation,
    };
  }

  /**
   * @descripttion: 相机飞行到包围盒
   * @param {BoundingSphere} boundingSphere 包围盒
   * @param {object} options 参数
   * @return {*}
   * @author: EV-申小虎
   */
  flyToBoundingSphere(
    boundingSphere: BoundingSphere,
    options: {
      offset?: HeadingPitchRange;
      complete?: Camera.FlightCompleteCallback;
      cancel?: Camera.FlightCancelledCallback;
      endTransform?: Matrix4;
      maximumHeight?: number;
      pitchAdjustHeight?: number;
      flyOverLongitude?: number;
      flyOverLongitudeWeight?: number;
    }
  ) {
    // this.isRoaming() && this.exitRoam();
    this.viewer.camera.flyToBoundingSphere(boundingSphere, {
      duration: 8,
      easingFunction: EasingFunction.EXPONENTIAL_IN_OUT,
      ...options,
    });
  }

  /**
   * @descripttion: 相机飞行
   * @param {object} options 参数
   * @return {void}
   * @author: EV-申小虎
   */
  flyTo(options: {
    destination: Cartesian3 | Rectangle;
    orientation?: any;
    duration?: number;
    complete?: Camera.FlightCompleteCallback;
    cancel?: Camera.FlightCancelledCallback;
    endTransform?: Matrix4;
    maximumHeight?: number;
    pitchAdjustHeight?: number;
    flyOverLongitude?: number;
    flyOverLongitudeWeight?: number;
    convert?: boolean;
    easingFunction?: EasingFunction.Callback;
  }) {
    // this.isRoaming() && this.exitRoam();
    return this.viewer.camera.flyTo({ ...options });
  }

  /**
   * @descripttion: 根据目标飞行
   * @param {*}
   * @return {*}
   * @author: EV-申小虎
   */
  flyToTarget(
    target:
      | Entity
      | Entity[]
      | EntityCollection
      | DataSource
      | ImageryLayer
      | Cesium3DTileset
      | TimeDynamicPointCloud
      | Promise<
          | Entity
          | Entity[]
          | EntityCollection
          | DataSource
          | ImageryLayer
          | Cesium3DTileset
          | TimeDynamicPointCloud
        >,
    options: {
      duration?: number;
      maximumHeight?: number;
      offset?: HeadingPitchRange;
    } = {
      offset: new HeadingPitchRange(0, CesiumMath.toRadians(-90)),
    }
  ) {
    // this.isRoaming() && this.exitRoam();
    return this.viewer.flyTo(target, { ...options });
  }

  computeViewRectangle() {
    const viewer = this.viewer,
      scene = viewer.scene,
      ellipsoid = scene.globe.ellipsoid;

    let rect = viewer.camera.computeViewRectangle(
      viewer.scene.globe.ellipsoid,
      new Rectangle()
    );

    if (rect == undefined) {
      const ltC3 = viewer.scene.camera.pickEllipsoid(
        Cartesian2.ZERO,
        ellipsoid
      );

      const rdC3 = viewer.scene.camera.pickEllipsoid(
        new Cartesian2(viewer.scene.canvas.width, viewer.scene.canvas.height),
        ellipsoid
      );

      const leftTop = ltC3 && ellipsoid.cartesianToCartographic(ltC3),
        rightDown = rdC3 && ellipsoid.cartesianToCartographic(rdC3);

      rect = new Rectangle(
        leftTop?.longitude,
        rightDown?.latitude,
        rightDown?.longitude,
        leftTop?.latitude
      );
    }

    if (rect.west < 0 && rect.east < 0) {
      rect.west += Math.PI;
      rect.east += Math.PI;
    }

    return rect;
  }

  /// 计算视图中一个像素代表的实际地面距离（以米为单位）
  getGroundDistanceByPixel() {
    const viewer = this.viewer;
    const camera = viewer.camera;
    const scene = viewer.scene;
    const ellipsoid = scene.globe.ellipsoid;
    const canvas = scene.canvas;

    // 计算视图中一个像素代表的实际地面距离（以米为单位）
    const frustum = camera.frustum as any;

    let pixelSize;
    if (frustum instanceof PerspectiveFrustum) {
      // 对于透视投影
      const halfFov = CesiumMath.toRadians(frustum.fov ?? 0) * 0.5;
      pixelSize =
        (ellipsoid.maximumRadius * 2 * Math.PI) /
        (canvas.width * Math.tan(halfFov));
    } else if (
      frustum instanceof OrthographicFrustum ||
      frustum instanceof PerspectiveOffCenterFrustum ||
      frustum instanceof OrthographicOffCenterFrustum
    ) {
      // 对于正交投影
      const frustum = viewer.camera.frustum;
      const near = frustum.near;
      const pixelSizeAtNear =
        (2 * near * ellipsoid.maximumRadius) / canvas.width;
      pixelSize = pixelSizeAtNear; // 简化计算
    } else {
      throw new Error("Unsupported frustum type");
    }

    return pixelSize;
  }

  /**
   * @descripttion: 计算聚合距离（以米为单位）
   * @param {AbstractCore} xgCore - xg-core实例
   * @param {number} factor - 距离系数，默认值为30
   * @return {number}
   * @author: EV-申小虎
   */
  calculateClusterDistance(
    factor = 30,
    minDistance?: number,
    maxDistance?: number
  ) {
    const viewer = this.viewer;
    const camera = viewer.camera;
    const scene = viewer.scene;
    const ellipsoid = scene.globe.ellipsoid;

    // 获取相机到地球表面的距离
    const cameraHeight = camera.positionCartographic.height;

    // 获取视图的分辨率
    const pixelSize = this.getGroundDistanceByPixel();

    // 根据相机高度和视图分辨率计算聚合距离
    let clusterDistance =
      pixelSize * (cameraHeight / ellipsoid.maximumRadius) * factor;

    // 限制聚合距离范围
    minDistance &&
      clusterDistance < minDistance &&
      (clusterDistance = minDistance);
    maxDistance &&
      clusterDistance > maxDistance &&
      (clusterDistance = maxDistance);

    return clusterDistance;
  }

  /**
   * @descripttion: 初始化漫游关键帧
   * @param {RoamType} roamType 漫游类型
   * @param {Cartesian3} position 相机位置
   * @param {Cartesian3} viewPosition 视点
   * @param {number} rotation 旋转角度
   * @param {HeadingPitchRange} headingPitchRange 相机姿态
   * @param {number} time 变化时间
   * @return {*} path
   * @author: EV-申小虎
   */
  // initRoamFrame(
  //     roamType: RoamType = RoamType.FLYTO,
  //     position: Cartesian3 = Cartesian3.ZERO,
  //     viewPosition: Cartesian3 = Cartesian3.ZERO,
  //     rotation = 0,
  //     headingPitchRange: HeadingPitchRange = new HeadingPitchRange(),
  //     time = 5
  // ): [RoamType, Cartesian3, Cartesian3, number, HeadingPitchRange, number] {
  //     return [
  //         roamType,
  //         position,
  //         viewPosition,
  //         rotation,
  //         headingPitchRange,
  //         time,
  //     ];
  // }

  /**
   * @descripttion: 执行漫游
   * @param {string} code 唯一索引
   * @param {MouseHandlerManager} manager 事件监听管理器
   * @param {function} callback 回调
   * @return {*}
   * @author: EV-申小虎
   */
  // applyRoam(
  //     code: string,
  //     manager: MouseHandlerManager,
  //     callback: (res: boolean) => void
  // ) {
  //     //判断是否正在漫游
  //     if (this.#isStarted) {
  //         callback && callback(false);
  //         console.warn("正在漫游!");
  //         return;
  //     }
  //     //获取当前漫游
  //     const roam = this.pathManager.get(code);
  //     //无此漫游
  //     if (!roam) {
  //         callback && callback(false);
  //         return;
  //     }
  //     const { path, count } = roam;
  //     //判断是否有漫游帧
  //     if (count <= 0) {
  //         callback && callback(false);
  //         return;
  //     }
  //     this.#isStarted = true;
  //     /**
  //      * @descripttion: canvas点击方法
  //      * @return {void}
  //      * @author: EV-申小虎
  //      */
  //     const canvasClick = () => {
  //         this.exitRoam();
  //         // 删除事件绑定
  //         // this.viewer.scene.canvas.removeEventListener('click', canvasClick, false);
  //         manager.destroyHandlerByKey("roamListener");
  //     };
  //     //漫游过程中，为鼠标操作添加监听
  //     // this.viewer.scene.canvas.addEventListener('click', canvasClick, false);
  //     manager.addMouseClickHandler("roamListener", canvasClick);
  //     this.#applyRoamFrame(path, 0, (res: any) => {
  //         this.#isStarted = false;
  //         callback && callback(res);
  //     });
  // }

  /**
   * @descripttion: 暂停当前漫游
   * @return {void}
   * @author: EV-申小虎
   */
  // pauseRoam() {
  //     if (this.#isStarted) {
  //         this.viewer.camera.cancelFlight();
  //         this.#isPaused = true;
  //     }
  // }

  /**
   * @descripttion: 退出当前漫游
   * @return {void}
   * @author: EV-申小虎
   */
  // exitRoam() {
  //     if (this.#isStarted) {
  //         this.viewer.camera.cancelFlight();
  //         this.#isStarted = false;
  //         this.#isPaused = false;
  //         this.clearRoamInfo();
  //     }
  // }

  /**
   * @descripttion: 获取当前漫游状态
   * @return {boolean} 状态
   * @author: EV-申小虎
   */
  // isRoaming = () => this.#isStarted;

  /**
   * @descripttion: 执行漫游帧
   * @param {Array} path 漫游路径
   * @param {number} index 漫游索引
   * @param {function} callback 回调
   * @return {Promise} 执行结果
   * @author: EV-申小虎
   */
  // #applyRoamFrame(
  //     path: Array<any>,
  //     index: number,
  //     callback: (res: boolean) => void
  // ) {
  //     if (!this.#isStarted) {
  //         callback(false);
  //         return;
  //     }
  //     const roamFrame = path[index];
  //     const frameCount = path.length;
  //     this.#currentRoam = {
  //         roam: roamFrame,
  //         index,
  //     };
  //     if (frameCount === index) {
  //         callback(true);
  //         return;
  //     }
  //     if (roamFrame) {
  //         const roamType = roamFrame[0],
  //             position = roamFrame[1],
  //             viewPosition = roamFrame[2],
  //             rotation = roamFrame[3],
  //             headingPitchRange = roamFrame[4],
  //             time = roamFrame[5];
  //         this.#flyRoam(position, headingPitchRange, index === 0 ? NaN : time).then(
  //             (res) => {
  //                 if (res) {
  //                     //飞行漫游||平移漫游
  //                     roamType !== 2 || rotation === 0
  //                         ? this.#applyRoamFrame(path, index + 1, callback)
  //                         : //旋转漫游
  //                         this.#rotateRoam(viewPosition, rotation).then(() =>
  //                             this.#applyRoamFrame(path, index + 1, callback)
  //                         );
  //                 } else callback(false);
  //             }
  //         );
  //     } else
  //         frameCount !== index &&
  //             console.log(new Error(`漫游参数错误！path:${path}index:${index}`));
  // }

  /**
   * @descripttion: 飞行
   * @param {Cartesian3} position 终点位置
   * @param {HeadingPitchRange} headingPitchRange 相机姿态
   * @param {number} time 持续时间
   * @return {void}
   * @author: EV-申小虎
   */
  // #flyRoam(
  //     position: Cartesian3,
  //     headingPitchRange: HeadingPitchRange,
  //     time: number
  // ) {
  //     return new Promise((resolve) => {
  //         //获取相机位置
  //         const currentPosition = { ...this.viewer.camera.position };
  //         //创建新对象
  //         const cameraPosition = new Cartesian3(
  //             currentPosition.x,
  //             currentPosition.y,
  //             currentPosition.z
  //         );
  //         //目标位置与当前位置的距离
  //         const distance = Cartesian3.distance(position, cameraPosition);
  //         if (distance > 1) {
  //             // const boundingSphere = new Cesium.BoundingSphere(position);
  //             //转为地理坐标
  //             const gcs = MathUtils.car3ToGeographic(position);
  //             //相机姿态
  //             const hpr = { ...headingPitchRange };
  //             //最大相机飞行高度
  //             const maxHeightOption =
  //                 distance < 500 ? { maximumHeight: gcs.height || 1000 } : {};
  //             //飞行参数
  //             const options = !Number.isNaN(time)
  //                 ? {
  //                     destination: position,
  //                     // offset: headingPitchRange,
  //                     orientation: hpr,
  //                     duration: time,
  //                     easingFunction: EasingFunction.LINEAR_NONE,
  //                     complete: () => resolve(true),
  //                     cancel: () => resolve(false),
  //                     ...maxHeightOption,
  //                 }
  //                 : {
  //                     destination: position,
  //                     // offset: new Cesium.HeadingPitchRange(0, 0, 0),
  //                     // pitchAdjustHeight: 180,
  //                     orientation: hpr,
  //                     duration: 8,
  //                     easingFunction: EasingFunction.EXPONENTIAL_IN_OUT,
  //                     complete: () => resolve(true),
  //                     cancel: () => resolve(false),
  //                 };
  //             // this.viewer.camera.flyToBoundingSphere(boundingSphere, { ...options });
  //             this.viewer.camera.flyTo({ ...options });
  //         } else resolve(true);
  //     }).catch((err) => console.log(new Error(err.toString())));
  // }

  // /**
  //  * @descripttion: 绕点旋转
  //  * @param {*} viewPosition 视点
  //  * @param {*} rotation 旋转角度
  //  * @return {Promise} 结果
  //  * @author: EV-申小虎
  //  */
  // #rotateRoam = async (viewPosition: Cartesian3, rotation: number) => {
  //     let index = 1;
  //     const result = await new Promise((resolve) => {
  //         const timer = setInterval(() => {
  //             //是否暂停
  //             if (this.#isPaused) return;
  //             //是否停止
  //             if (!this.#isStarted) {
  //                 clearInterval(timer);
  //                 resolve(false);
  //                 return;
  //             }
  //             this.viewer.camera.rotate(viewPosition, -Math.toRadians(0.2));
  //             index += 0.2;
  //             if (index > rotation) {
  //                 clearInterval(timer);
  //                 resolve(true);
  //             }
  //         }, 10);
  //     });
  //     return result;
  // };

  // /**
  //  * @descripttion:清除漫游信息
  //  * @return {void}
  //  * @author: EV-申小虎
  //  */
  // clearRoamInfo() {
  //     this.#currentRoam = {
  //         roam: undefined,
  //         index: -1,
  //     };
  // }
}

//漫游对象
// export class Roam implements RoamModel {
//     /**
//      * The Code component.
//      */
//     code: string;
//     /**
//      * The Path component.
//      */
//     path: [RoamType, Cartesian3, Cartesian3, number, HeadingPitchRange, number];
//     /**
//      * The Count component.
//      */
//     count: number;
//     constructor(
//         code: string,
//         path: [RoamType, Cartesian3, Cartesian3, number, HeadingPitchRange, number],
//         count: number
//     ) {
//         this.code = code;
//         this.path = path;
//         this.count = count;
//     }
// }

/**
 * @descripttion: 路径管理器
 * @author: EV-申小虎
 */
// class PathManager {
//     #roamPathArr: Array<Roam>;

//     /**
//      * @descripttion: 路径管理器
//      * @author: EV-申小虎
//      */
//     constructor() {
//         this.#roamPathArr = [];
//     }

//     /**
//      * @descripttion: 查找漫游路径（根据code）
//      * @param {string} code 唯一标识
//      * @return {object} 漫游对象
//      * @author: EV-申小虎
//      */
//     get(code: string) {
//         const index = this.isExists(code);
//         return index !== -1 ? this.#roamPathArr[index] : undefined;
//     }

//     /**
//      * @descripttion: 获取所有漫游对象
//      * @return {Array} 所有漫游对象
//      * @author: EV-申小虎
//      */
//     getAll() {
//         return this.#roamPathArr;
//     }

//     /**
//      * @descripttion: 添加漫游对象
//      * @param {string} code 唯一标识
//      * @param {*} path 漫游路径
//      * @return {*} 结果
//      * @author: EV-申小虎
//      */
//     add(
//         code: string,
//         path: [RoamType, Cartesian3, Cartesian3, number, HeadingPitchRange, number]
//     ) {
//         let result = false;
//         if (this.isExists(code) === -1 && Array.isArray(path)) {
//             this.#roamPathArr.push({ code, path, count: path.length });
//             result = true;
//         }
//         return result;
//     }

//     /**
//      * @descripttion: 是否存在
//      * @param {string} code 唯一标识
//      * @return {boolean} 存在返回索引，不存在undefined
//      * @author: EV-申小虎
//      */
//     isExists(code = "") {
//         return this.#roamPathArr.findIndex((item) => item.code === code);
//     }

//     /**
//      * @descripttion: 删除漫游对象
//      * @param {string} code 唯一索引
//      * @return {boolean} 结果
//      * @author: EV-申小虎
//      */
//     deleteByCode(code = "") {
//         let result = false;
//         if (this.isExists(code)) {
//             const newPaths = this.#roamPathArr.filter((item) => item.code !== code);
//             this.#roamPathArr = [...newPaths];
//             result = true;
//         }
//         return result;
//     }

//     /**
//      * @descripttion: 删除所有漫游对象
//      * @return {void}
//      * @author: EV-申小虎
//      */
//     deleteAll() {
//         this.#roamPathArr = [];
//     }
// }
