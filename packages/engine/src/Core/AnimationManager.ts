/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-01-29 09:55:17
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-02-27 07:57:05
 */
import {
  Cartesian3,
  defined,
  JulianDate,
  Viewer,
  Matrix4,
  Transforms,
  Color,
  HeadingPitchRoll,
  TranslationRotationScale,
  Quaternion,
  Entity,
  MaterialProperty,
  CustomDataSource,
  ClockRange,
} from "cesium";
import MathUtils from "./MathUtils";
import ParticleManager from "./ParticleManager";
import RoamManager from "./RoamManager";
import WeatherManager from "./WeatherManager";
import { Animation, AnimationGroup, Particle } from "../types";
import CoordinateUtils from "./CoordinateUtils";
import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";

/**
 * @descripttion: 事件模拟
 * @author: EV-申小虎
 */
class AnimationManager extends AbstractManager {
  /// 动画集合
  readonly #animationGroups: Array<AnimationGroup>;
  //帧监听
  tickListener: void | undefined;
  /// 漫游管理器
  #roamManager: PartialPrivate<RoamManager>;
  /// 粒子管理器
  #particleManager: PartialPrivate<ParticleManager>;
  /// 风场管理器
  #weatherManager: PartialPrivate<WeatherManager>;

  /**
   * @descripttion: 构造函数
   * @param {Viewer} viewer 视窗
   * @return {*}
   * @author: EV-申小虎
   */
  constructor(core: AbstractCore) {
    super(core);
    this.#roamManager = core.roamManager;
    this.#particleManager = core.particleManager;
    this.#weatherManager = core.weatherManager;
    this.#animationGroups = [];
    this.tickListener = undefined;
  }

  /**
   * @descripttion: 是否已存在动画组
   * @param {string} id 组id
   * @return {*}
   * @author: EV-申小虎
   */
  isExists(id: string) {
    if (!id) return true;
    return this.#animationGroups.findIndex((item) => item._id === id) >= 0;
  }

  /**
   * @descripttion: 是否在组中已存在动画
   * @param {string} groupId 组id
   * @param {string} animationId 动画id
   * @return {boolean}
   * @author: EV-申小虎
   */
  isExistsInGroup(groupId: string, animationId: string) {
    const group = this.getAnimationGroup(groupId),
      index = group?._animationList
        ? group._animationList.findIndex((item) => item._id === animationId)
        : -1;
    return index >= 0;
  }

  /**
   * @descripttion: 创建动画组
   * @param {*}
   * @return {*}
   * @author: EV-申小虎
   */
  createAnimationGroup = (
    id: string,
    name: string,
    period: { startTime: JulianDate; endTime: JulianDate },
    animationList?: Array<Animation>,
    particlerList?: Array<Particle>
  ): AnimationGroup | null => {
    /// 判断是否已存在
    if (this.isExists(id)) return null;

    /// 创建动画组数据源
    const datasource = new CustomDataSource(name);

    /// 将单个动画添加至数据源
    animationList &&
      animationList.forEach((animation) => {
        const id = animation._id;

        /// 若存在重复动画，则创建动画组失败
        if (datasource.entities.getById(id)) {
          console.error("存在重复动画，id：", id);
        }

        datasource.entities.add(animation.entity);
      });

    /// 创建动画组
    const animationGroup: AnimationGroup = {
      _id: id,
      name,
      _datasource: datasource,
      period,
      _animationList: animationList || [],
      _particlerList: particlerList || [],
      add: (animation: Animation) => {
        let result = false;

        const currentList = animationGroup._animationList;

        if (currentList.findIndex((a) => a._id == animation._id) < 0) {
          datasource.entities.add(animation.entity);
          currentList.push(animation);
          result = true;
        }

        return result;
      },
      getById: (id: string) => {
        let result: Animation | null = null;

        const currentList = animationGroup._animationList;

        const index = currentList.findIndex((a) => a._id == id);
        index > -1 && (result = currentList[index]);

        return result;
      },
      removeById: (id: string) => {
        let result = true;

        const currentList = animationGroup._animationList;

        /// 若不存在该动画实体
        currentList.findIndex((a) => a._id == id) < 0
          ? (result = false)
          : /// 删除数组中，某项元素，不返回新数组
            currentList.splice(
              currentList.findIndex((a) => a._id == id),
              1
            );

        datasource.entities.removeById(id);

        return result;
      },
      removeAll: () => {
        const currentList = animationGroup._animationList;

        /// 清空数组元素，不更改地址
        currentList.splice(0, currentList.length);
        datasource.entities.removeAll();
      },
      updatePeriod: (startTime?: JulianDate, endTime?: JulianDate) => {
        if (startTime) {
          this.viewer.clock.startTime = startTime;
          animationGroup.period = {
            startTime,
            endTime: animationGroup.period.endTime,
          };
          /// 设置系统时间
          this.viewer.clock.startTime = startTime;
        }

        if (endTime) {
          this.viewer.clock.stopTime = endTime;
          animationGroup.period = {
            startTime: animationGroup.period.startTime,
            endTime,
          };
          /// 设置系统时间
          this.viewer.clock.stopTime = endTime;
        }
      },
    };

    /// 渲染事件粒子效果
    particlerList?.forEach((particler) => {
      const { item } = particler;
      this.#particleManager.add(particler);
      this.#particleManager.addWindForce(item, this.#weatherManager);
    });

    return animationGroup;
  };

  /**
   * @descripttion: 渲染动画组
   * @param {*}
   * @return {*}
   * @author: EV-申小虎
   */
  renderAnimationGroup = (
    object: string | AnimationGroup,
    loop = false
  ): Promise<boolean> =>
    new Promise((resolve, reject) => {
      const animationGroup: AnimationGroup | undefined =
        typeof object == "string" ? this.getAnimationGroup(object) : object;

      /// 若动画组存在ds
      if (animationGroup?._datasource)
        /// 渲染动画组
        this.viewer.dataSources
          .add(animationGroup._datasource)
          .then((res) => {
            if (defined(res)) {
              const period = animationGroup.period;

              /// 设置系统时间
              this.viewer.clock.startTime = period.startTime;
              this.viewer.clock.stopTime = period.endTime;
              this.viewer.clock.currentTime = period.startTime;

              /// 默认循环播放
              this.viewer.clock.clockRange = loop
                ? ClockRange.LOOP_STOP
                : ClockRange.UNBOUNDED;

              /// 添加至内存
              this.#animationGroups.push(animationGroup);

              resolve(true);
            } else reject(false);
          })
          .catch((err) => {
            console.error("动画组渲染失败，error:", err);
            reject(false);
          });
    });

  /**
   * @descripttion: 移除动画组
   * @param {*} dispatch 参数
   * @return {void}
   * @author: EV-申小虎
   */
  removeAnimationGroup(id: string, destroy = true) {
    const animationGroup = this.getAnimationGroup(id);
    if (!animationGroup) return false;
    //如果存在动画
    //移除事件粒子效果
    animationGroup._particlerList.forEach((particler) => {
      this.#particleManager.removeById?.(particler.id);
    });
    //移除与该事件有关的所有实体
    animationGroup._animationList.forEach((animation) => {
      const { extendParticler } = animation;
      //删除附属粒子
      extendParticler && this.#particleManager.removeById(extendParticler.id);
    });
    /// 移除动画组
    this.viewer.dataSources.remove(animationGroup._datasource, destroy);
    /// 删除记录
    this.#animationGroups.splice(
      this.#animationGroups.findIndex((a) => a._id == id),
      1
    );
  }

  /**
   * @descripttion: 根据id获取动画组
   * @param {string} id
   * @return {*}
   * @author: EV-申小虎
   */
  getAnimationGroup(id: string) {
    return this.#animationGroups.find((item) => item._id == id);
  }

  /**
   * @descripttion: 创建动画对象
   * @param {*}
   * @return {*}
   * @author: EV-申小虎
   */
  createAnimation(
    entity: Entity,
    pathMarteia?: MaterialProperty | Color,
    extendParticler?: Particle
  ): Animation {
    const animaiton: Animation = {
      _id: entity.id,
      entity,
      pathMarteia,
      extendParticler,
    };
    return animaiton;
  }

  /**
   * @descripttion: 计算一个从4x4变换矩阵
   * @param {Cartesian3} cartesian3 笛卡尔坐标
   * @return {Matrix4} 4*4变换矩阵
   * @author: EV-申小虎
   */
  computeModelMatrix = (cartesian3: Cartesian3) => {
    const modelMatrix = Transforms.eastNorthUpToFixedFrame(
      cartesian3,
      undefined,
      new Matrix4()
    );
    return modelMatrix;
  };

  /**
   * @descripttion:计算发射器偏移矩阵
   * @param {Cartesian3} eventPosition 事件位置
   * @param {Cartesian3} modelPosition 模型位置
   * @return {null} null
   * @author: EV-申小虎
   */
  computeEmitterModelMatrix = (
    eventPosition: Cartesian3,
    modelPosition: Cartesian3
  ) => {
    // //求世界坐标到局部坐标的变换矩阵
    // const worldToLocalMatrix = Cesium.Matrix4.inverse(localToWorldMatrix, new Cesium.Matrix4());
    // //a点在局部坐标的位置，其实就是局部坐标原点
    // const localPositionA = Cesium.Matrix4.multiplyByPoint(worldToLocalMatrix, modelPosition, new Cesium.Cartesian3());
    // //B点在以A点为原点的局部的坐标位置
    // const localPositionB = Cesium.Matrix4.multiplyByPoint(worldToLocalMatrix, eventPosition, new Cesium.Cartesian3());
    // //弧度
    // //这里应该用x/y，因为是计算偏北角。
    // const angle = Math.atan2(localPositionB.y - localPositionA.y, localPositionB.x - localPositionA.x);
    // //角度
    // let theta = angle * (180 / Math.PI);
    // console.log(theta, '666666666666666666666');
    // if (theta < 0) {
    //     theta = 180 - theta;
    // }
    const gcsA = CoordinateUtils.car3ToGeographic(eventPosition);
    const gcsB = CoordinateUtils.car3ToGeographic(modelPosition);
    const angle = MathUtils.getHeading(gcsB, gcsA);
    //根据经纬度获取当前点高程
    // let cartographic = Cesium.Cartographic.fromDegrees(gcsB.lon, gcsB.lat)//输入经纬度
    // let height = this.viewer.scene.globe.getHeight(cartographic);
    // const angle2 = CoordinateTransform.getAngle(gcsB.lon, gcsB.lat, gcsA.lon, gcsA.lat);
    // const angle3 = CoordinateTransform.ComputeHeading(gcsB.lon, gcsB.lat, gcsA.lon, gcsA.lat);
    // console.log(angle, angle2, angle3, '666666666666666666666');
    const hpr = HeadingPitchRoll.fromDegrees(
      angle || 0,
      0,
      -30,
      new HeadingPitchRoll()
    );
    //new Cesium.TranslationRotationScale(translation, 旋转, 三方向缩放)生成新的仿射变换
    const trs = new TranslationRotationScale();
    //Cesium.Cartesian3.fromElements(x, y, z, result)；三维坐标转三维向量
    trs.translation = Cartesian3.fromElements(0, 0, 3.3, new Cartesian3());
    //Cesium.Quaternion.fromHeadingPitchRoll(headingPitchRoll, result) 将旋转转化为四元数
    trs.rotation = Quaternion.fromHeadingPitchRoll(hpr, new Quaternion());
    //将仿生变换转换为四阶矩阵
    return Matrix4.fromTranslationRotationScale(trs, new Matrix4());
  };

  /**
   * @descripttion:
   * @return {null} null
   * @author: EV-申小虎
   */
  addTickListener() {
    // this.viewer.clock.onTick.addEventListener(() => {
    //   //是否正在模拟
    //   if (this.currentEvent) {
    //     //获取当前时间
    //     const currentDate = this.viewer.clock.currentTime;
    //     //判断动画附带粒子是否到达过期时间
    //     const { eventPosition, modelList } = this.currentEvent;
    //     modelList?.forEach((model) => {
    //       const {
    //         guid,
    //         path,
    //         extendParticler,
    //         showTime: { stopTime },
    //       } = model;
    //       let modelEntity;
    //       //到达结束时间，关闭模型动画
    //       if (JulianDate.greaterThanOrEquals(currentDate, stopTime)) {
    //         modelEntity = this.viewer.entities.getById(guid);
    //         if (modelEntity)
    //           modelEntity.model && (modelEntity.model.runAnimations = new ConstantProperty(false));
    //       }
    //       //到达结束时间，关闭模型附带粒子
    //       if (extendParticler) {
    //         const { showTime, stopTime: endTime, particle } = extendParticler;
    //         //消防水枪开始时间
    //         const showDate = JulianDate.fromDate(moment(showTime).toDate());
    //         //消防水枪结束时间
    //         const stopDate = JulianDate.fromDate(moment(endTime).toDate());
    //         //到达时间
    //         if (
    //           JulianDate.greaterThanOrEquals(currentDate, showDate) &&
    //           JulianDate.lessThanOrEquals(currentDate, stopDate)
    //         ) {
    //           //模型停止位置
    //           const modelPosition = path[path.length - 1];
    //           //设置跟随粒子放置位置
    //           particle.modelMatrix = this.computeModelMatrix(modelPosition);
    //           particle.emitterModelMatrix = this.computeEmitterModelMatrix(
    //             eventPosition,
    //             modelPosition,
    //           );
    //         }
    //       }
    //     });
    //   }
    // });
  }
}
export default AnimationManager;
