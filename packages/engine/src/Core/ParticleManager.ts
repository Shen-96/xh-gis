/*
 * @Descripttion: 粒子系统
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-01-28 18:26:00
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:35:58
 */
import {
  Viewer,
  Cartesian3,
  defined,
  JulianDate,
  ParticleSystem,
  Transforms,
  Matrix4,
  Cartesian2,
  ConeEmitter,
  ParticleBurst,
  Math,
  Color,
  CircleEmitter,
} from "cesium";
import { Particle, WeatherManager, ParticleType } from "..";
import FireImg from "../Assets/Particle/fire.png";
import SmokeImg from "../Assets/Particle/smoke.png";
import CircularImg from "../Assets/Particle/circular.jpg";
import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";

/**
 * @descripttion: 粒子系统
 * @author: EV-申小虎
 */
class ParticleManager extends AbstractManager {
  readonly #particlerArr: Array<Particle>;
  #tickListener: void | undefined;

  /**
   * @descripttion: 粒子系统管理器
   * @param {*} viewer cesium视图
   * @author: EV-申小虎
   */
  constructor(core: AbstractCore) {
    super(core);
    // this.timer = undefined;
    this.#particlerArr = [];
    this.#tickListener = undefined;
    // this.#cameraListener = this.#cameraChangeListener(viewer);
  }

  /**
   * @descripttion: 是否存在
   * @param {string} id 唯一标识
   * @return {boolean|undefined} 存在返回索引，不存在undefined
   * @author: EV-申小虎
   */
  isExists(id: string) {
    if (!id) return true;
    return this.#particlerArr.findIndex((item) => item.id === id) >= 0;
  }

  /**
   * @descripttion: 添加粒子记录
   * @param {Particler} particler
   * @return {boolean}
   * @author: EV-申小虎
   */
  #addParticleToRecords(particler: Particle) {
    const result = false;
    if (particler)
      if (!this.isExists(particler.id)) {
        this.#particlerArr.push(particler);
      }
    return result;
  }

  /**
   * @descripttion: 帧监听
   * @return {null} null
   * @author: EV-申小虎
   */
  #addTickListener() {
    this.viewer.clock.onTick.addEventListener(() => {
      //获取当前时间
      const currentDate = this.viewer.clock.currentTime.clone();
      if (this.#particlerArr.length > 0)
        this.#particlerArr.forEach((particler) => {
          const { showTime, stopTime, item } = particler;
          if (!showTime || !stopTime) return;
          if (
            JulianDate.greaterThanOrEquals(currentDate, showTime.clone()) &&
            JulianDate.lessThanOrEquals(currentDate, stopTime.clone())
          ) {
            !item.show && (item.show = true);
          } else item.show = false;
        });
      else {
        // this.viewer.clock.onTick.removeEventListener(this.#tickListener);
        this.#tickListener = undefined;
      }
    });
  }

  /**
   * @descripttion: 创建粒子动哈
   * @param {string} id 外部唯一索引
   * @param {ParticleType} particleType 粒子类型
   * @param {Cartesian3} cartesian3 笛卡尔坐标
   * @return {ParticleModel|undefined} 结果
   * @author: EV-申小虎
   */
  create(
    id: string,
    particleType: ParticleType,
    cartesian3: Cartesian3,
    showTime?: JulianDate,
    stopTime?: JulianDate
  ): Particle | undefined {
    let result: undefined | Particle = undefined;
    //判断是否已存在该索引
    if (!this.isExists(id) && particleType && cartesian3) {
      /**
       * @descripttion: 计算一个从4x4变换矩阵
       * @param {Cartesian3} cartesian3 笛卡尔坐标
       * @return {Matrix4} 4*4变换矩阵
       * @author: EV-申小虎
       */
      const computeModelMatrix = (cartesian3: Cartesian3) => {
        if (!defined(cartesian3)) return undefined;
        const modelMatrix = Transforms.eastNorthUpToFixedFrame(
          cartesian3,
          undefined,
          new Matrix4()
        );
        return modelMatrix;
      };
      //创建粒子特效
      let particle;
      //判断粒子动画类型
      switch (particleType) {
        //燃烧
        case ParticleType.BURNING:
          particle = new ParticleSystem({
            // loop: true,
            // image: getImage(),//粒子图像
            image: FireImg,
            // startColor: new Cesium.Color(1, 0, 0).withAlpha(.7),//开始颜色
            // endColor: new Cesium.Color(1, 1, 0).withAlpha(.5),//结束时的颜色
            // scale: 20,
            startScale: 1.0, //开始时缩放倍数
            endScale: 10.0, //结束时缩放倍数
            minimumParticleLife: 3.1,
            maximumParticleLife: 5.1,
            // particleLife: 100,
            minimumSpeed: 2.1,
            maximumSpeed: 3.5,
            // speed: 10,
            sizeInMeters: true,
            //particleSize: 20,
            // imageSize: new Cesium.Cartesian2(20, 20),//粒子大小
            minimumImageSize: new Cartesian2(0.75365, 0.875609756097561),
            maximumImageSize: new Cartesian2(
              1.0195121951219512,
              0.9975609756097562
            ),
            // minimumWidth: 1,
            // minimumHeight: 1,
            // maximumWidth: 15,
            // maximumHeight: 15,
            // gravity: 2.5,//地心引力值
            emissionRate: 50.0,
            emitter: new ConeEmitter(Math.toRadians(30.0)),
            lifetime: 16.0,
            bursts: [
              // these burst will occasionally sync to create a multicolored effect
              new ParticleBurst({ time: 0.0, minimum: 10, maximum: 20 }),
              new ParticleBurst({ time: 5.0, minimum: 20, maximum: 30 }),
              new ParticleBurst({ time: 10.0, minimum: 30, maximum: 40 }),
              new ParticleBurst({ time: 15.0, minimum: 40, maximum: 50 }),
            ],
            //updateCallback: (particle,dt)=>applyGravity(particle,fireid),//粒子位置更新回调函数
            modelMatrix: computeModelMatrix(cartesian3),
            // emitterModelMatrix: computeEmitterModelMatrix()
          });
          break;
        //烟雾
        case ParticleType.SMOKE:
          particle = new ParticleSystem({
            // loop: true,
            // image: getImage(),//粒子图像
            image: SmokeImg,
            startColor: new Color(1, 1, 1).withAlpha(0.6), //开始颜色
            endColor: new Color(0, 0, 0).withAlpha(0.3), //结束时的颜色
            // scale: 20,
            startScale: 1.0,
            endScale: 10.0,
            minimumParticleLife: 3.1,
            maximumParticleLife: 5.1,
            // particleLife: 100,
            minimumSpeed: 0.5,
            maximumSpeed: 2.5,
            // speed: 10,
            sizeInMeters: true,
            //particleSize: 20,
            // imageSize: new Cesium.Cartesian2(20, 20),//粒子大小
            minimumImageSize: new Cartesian2(
              0.7730769230769231,
              0.8692307692307693
            ),
            maximumImageSize: new Cartesian2(
              0.9615384615384616,
              0.8653846153846154
            ),
            // minimumWidth: 1,
            // minimumHeight: 1,
            // maximumWidth: 15,
            // maximumHeight: 15,
            //gravity: 2.5,
            emissionRate: 25.0,
            emitter: new ConeEmitter(Math.toRadians(30.0)),
            lifetime: 16.0,
            bursts: [
              // these burst will occasionally sync to create a multicolored effect
              new ParticleBurst({ time: 0.0, minimum: 10, maximum: 20 }),
              new ParticleBurst({ time: 5.0, minimum: 20, maximum: 30 }),
              new ParticleBurst({ time: 10.0, minimum: 30, maximum: 40 }),
              new ParticleBurst({ time: 15.0, minimum: 40, maximum: 50 }),
            ],
            //updateCallback: (particle,dt)=>applyGravity(particle,smokeid),
            // gravity: 2.5,//地心引力值
            modelMatrix: computeModelMatrix(cartesian3),
            // emitterModelMatrix: computeEmitterModelMatrix()
          });
          break;
        //泄露
        case ParticleType.LEAKAGE:
          particle = new ParticleSystem({
            // loop: true,
            // image: getImage(),//粒子图像
            image: CircularImg,
            startColor: Color.fromCssColorString("rgba(131, 217, 236, 0.17)"), //开始颜色
            endColor: Color.fromCssColorString("rgba(131, 217, 236, 0.07)"), //结束时的颜色
            // scale: 20,
            startScale: 1.0, //开始时缩放倍数
            endScale: 0.0, //结束时缩放倍数
            // minimumParticleLife: 2.1,
            // maximumParticleLife: 5.1,
            // particleLife: 100,//每个粒子的生存时间，即子弹被打出来后能飞多久
            // minimumSpeed: 1.1,//最小粒子飞行速度
            // maximumSpeed: 1.5,//最大粒子飞行速度
            speed: -1, //粒子飞行速度
            sizeInMeters: true, //设置粒子的大小是米还是像素。true以米为单位调整颗粒大小；否则，大小以像素为单位。
            // particleSize: 30,
            imageSize: new Cartesian2(0.5, 0.6), //粒子大小
            // minimumImageSize: new Cesium.Cartesian2(0.8536585365853658, 0.975609756097561),
            // maximumImageSize: new Cesium.Cartesian2(1.2195121951219512, 1.0975609756097562),
            // minimumWidth: 1,
            // minimumHeight: 1,
            // maximumWidth: 15,
            // maximumHeight: 15,
            // gravity: 2.5,//地心引力值
            emissionRate: 25.0, //每秒发射粒子的个数
            emitter: new CircleEmitter(0.05), //粒子发射器的形式，确定了在什么样的区间里随机产生粒子，该行表示粒子将在一个半径为1米的圆形区域不断产生
            lifetime: 16.0, //粒子发射器的生命周期，即发射粒子的时间，该值可理解为一把枪的弹夹可以用多长时间，loop默认属性为true理解为到时间后换上另一个弹夹继续发射。
            // bursts: [
            //     // these burst will occasionally sync to create a multicolored effect
            //     new Cesium.ParticleBurst({ time: 0.0, minimum: 10, maximum: 20 }),
            //     new Cesium.ParticleBurst({ time: 5.0, minimum: 20, maximum: 40 }),
            //     new Cesium.ParticleBurst({ time: 10.0, minimum: 40, maximum: 60 }),
            //     new Cesium.ParticleBurst({ time: 15.0, minimum: 60, maximum: 80 })
            // ],
            // updateCallback: applyGravity(),//粒子位置更新回调函数
            modelMatrix: computeModelMatrix(cartesian3), //决定粒子在空间坐标系的位置矩阵，可以理解为用枪的人的空间位置
            // emitterModelMatrix: computeEmitterModelMatrix()//决定粒子相对于模型位置的位置矩阵，可以理解为人把发射枪拿在哪里，用左手还是右手还是用脚，即发射器相对本体的位置矩阵。
          });
          break;
        //爆炸
        case ParticleType.BLAST:
          particle = new ParticleSystem({
            loop: false,
            image: FireImg,
            sizeInMeters: true,
            minimumImageSize: new Cartesian2(
              0.525695254208858,
              0.6007945762386948
            ),
            maximumImageSize: new Cartesian2(
              0.7509932202983686,
              0.6758938982685316
            ),
            minimumParticleLife: 5.0,
            maximumParticleLife: 10.0,
            minimumSpeed: 5.0,
            maximumSpeed: 10.0,
            startColor: new Color(1, 0, 0).withAlpha(0.7),
            endColor: new Color(1, 1, 0).withAlpha(0.4),
            startScale: 2.0,
            endScale: 8.0,
            particleLife: 3.0,
            speed: 5.0,
            emissionRate: 35.0,
            emitter: new ConeEmitter(Math.toRadians(30.0)),
            lifetime: 16.0,
            bursts: [
              new ParticleBurst({ time: 1.0, minimum: 100, maximum: 120 }),
            ],
            modelMatrix: computeModelMatrix(cartesian3),
          });
          break;
        //消防水枪
        case ParticleType.FIREWATERGUN:
          particle = this.#addFireWaterGun();
          break;
        default:
          break;
      }
      //创建內部唯一索引
      if (particle) {
        //粒子记录
        result = {
          id: id,
          type: particleType,
          item: particle,
          showTime,
          stopTime,
        };
        //添加到记录&&渲染粒子
        this.#addParticleToRecords(result);
        //开启帧监听
        // !this.#tickListener && (this.#tickListener = this.#addTickListener());
      }
    }
    return result;
  }

  /**
   * @descripttion: 渲染粒子动画
   * @param {string} id 唯一索引
   * @param {ParticleSystem} particle 粒子
   * @return {boolean}
   * @author: EV-申小虎
   */
  add(particle: Particle) {
    if (this.isExists(particle.id)) {
      const particler = this.getById(particle.id ?? "");
      particler && this.viewer.scene.primitives.add(particler.item);
      return true;
    }
    if (defined(particle)) {
      this.viewer.scene.primitives.add(particle);
      return true;
    }
    return false;
  }

  /**
   * @descripttion: 根据索引获取粒子动画
   * @param {string} id 索引
   * @return {ParticleModel|undefined}
   * @author: EV-申小虎
   */
  getById(id: string) {
    let result: Array<Particle> = [];
    if (this.isExists(id))
      result = this.#particlerArr.filter((item) => item.id === id);
    return result.length === 1 ? result[0] : undefined;
  }

  /**
   * @descripttion: 根据类型获取粒子动画
   * @param {ParticleType} type 粒子类型
   * @return {ParticleModel[]}
   * @author: EV-申小虎
   */
  getByType(type: ParticleType) {
    let result: Array<Particle> = [];
    result = this.#particlerArr.filter((item) => item.type === type);
    return result;
  }

  /**
   * @descripttion: 添加消防水枪
   * @return {ParticleSystem} 粒子对象
   * @author: EV-申小虎
   */
  #addFireWaterGun() {
    // const { id, rescueTime: { startDate, startTime }, rescueSecond, eventTime } = entity;
    //粒子显示时间
    // let endNode = moment(`${startDate.format('YYYY-MM-DD')} ${startTime.format('HH:mm:ss')}`).add(rescueSecond, 'seconds');

    /**
     * @descripttion: 计算一个从4x4变换矩阵
     * @param {Cartesian3} cartesian3 笛卡尔坐标
     * @return {Matrix4} 4*4变换矩阵
     * @author: EV-申小虎
     */
    // const computeModelMatrix = (cartesian3) => {
    //     if (!Cesium.defined(cartesian3))
    //         return undefined;
    //     const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(cartesian3, undefined, new Cesium.Matrix4());
    //     return modelMatrix;
    // }

    /**
     * @descripttion: 计算发射器偏移矩阵
     * @return {null} null
     * @author: EV-申小虎
     */
    // const computeEmitterModelMatrix = () => {
    //     // const gcsA = CoordinateCon.Car3toDegrees(this.viewer, eventPosition);
    //     // const gcsB = CoordinateCon.Car3toDegrees(this.viewer, rescuePath[rescuePath.length - 1]);
    //     // const angle = CoordinateCon.CalcuationAzimuth(gcsB.lon, gcsB.lat, gcsA.lon, gcsA.lat);
    //     let hpr = Cesium.HeadingPitchRoll.fromDegrees(0, 0.0, -30, new Cesium.HeadingPitchRoll());
    //     //new Cesium.TranslationRotationScale(translation, 旋转, 三方向缩放)生成新的仿射变换
    //     let trs = new Cesium.TranslationRotationScale();
    //     //Cesium.Cartesian3.fromElements(x, y, z, result)；三维坐标转三维向量
    //     // trs.translation = Cesium.Cartesian3.fromElements(0.6, -0.5, 3.5, new Cesium.Cartesian3());
    //     //Cesium.Quaternion.fromHeadingPitchRoll(headingPitchRoll, result) 将旋转转化为四元数
    //     trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, new Cesium.Quaternion());
    //     //将仿生变换转换为四阶矩阵
    //     return Cesium.Matrix4.fromTranslationRotationScale(trs, new Cesium.Matrix4());
    // }

    /**
            //  * @descripttion: 
            //  * @param {*} updateMatrix
            //  * @return {*}
            //  * @author: EV-申小虎
            //  */
    // const updateMatrix = () => {
    //     let guns = this.particles.filter(item => item.id === id);
    //     console.log(guns);
    //     if (guns.length > 0) {
    //         let par = guns[0];
    //         //消防水枪开始时间
    //         let showDate = Cesium.JulianDate.fromDate(moment(endNode).toDate());
    //         //消防水枪结束时间
    //         let stopDate = Cesium.JulianDate.fromDate(moment(eventTime[1]).toDate());
    //         let currentDate =this.#viewer.clock.currentTime;
    //         if (Cesium.JulianDate.greaterThanOrEquals(currentDate, showDate) && Cesium.JulianDate.lessThanOrEquals(currentDate, stopDate)) {
    //             par.modelMatrix = entity.computeModelMatrix(showDate, new Cesium.Matrix4());
    //             const modelPosition = rescuePath[rescuePath.length - 1];
    //             par.emitterModelMatrix = computeEmitterModelMatrix(eventPosition, modelPosition);
    //             par.emissionRate = 60;
    //             par.startColor = new Cesium.Color(1, 1, 1, 0.8);
    //             par.endColor = new Cesium.Color(0.80, 0.86, 1, 0.4);
    //         } else {
    //             par.emissionRate = 10;
    //             par.startColor = new Cesium.Color(1, 1, 1, 0);
    //             par.endColor = new Cesium.Color(0.80, 0.86, 1, 0.2);
    //         }
    //     }
    // }
    const gravityScratch = new Cartesian3();
    /**
     * @descripttion:
     * @param {*} p
     * @param {*} dt
     * @return {*}
     * @author: EV-申小虎
     */
    function applyGravity(p: any, dt: any) {
      // We need to compute a local up vector for each particle in geocentric space.
      const position = p.position;

      Cartesian3.normalize(position, gravityScratch);
      Cartesian3.multiplyByScalar(gravityScratch, -9.8 * dt, gravityScratch);

      p.velocity = Cartesian3.add(p.velocity, gravityScratch, p.velocity);
    }

    const waterBranchParticle = new ParticleSystem({
      image: "./assets/particle/fountain.png",
      startColor: new Color(1, 1, 1, 0.8),
      endColor: new Color(0.8, 0.86, 1, 0.4),
      startScale: 1.0, //开始时缩放倍数
      endScale: 20.0, //结束时缩放倍数
      minimumParticleLife: 6.1,
      maximumParticleLife: 7.1,
      minimumSpeed: 18, //最小粒子飞行速度
      maximumSpeed: 22, //最大粒子飞行速度
      // particleSize: 10,
      sizeInMeters: true,
      minimumImageSize: new Cartesian2(0.9, 0.9),
      maximumImageSize: new Cartesian2(0.9, 0.9),
      // gravity: -9.8,//地心引力值
      emissionRate: 60.0, //每秒发射粒子的个数
      emitter: new CircleEmitter(0.2), //粒子发射器的形式，确定了在什么样的区间里随机产生粒子，该行表示粒子将在一个半径为1米的圆形区域不断产生
      lifetime: 16.0, //粒子发射器的生命周期，即发射粒子的时间，该值可理解为一把枪的弹夹可以用多长时间，loop默认属性为true理解为到时间后换上另一个弹夹继续发射。
      // modelMatrix: entity.computeModelMatrix(Cesium.JulianDate.now(), new Cesium.Matrix4()),//决定粒子在空间坐标系的位置矩阵，可以理解为用枪的人的空间位置
      // emitterModelMatrix: computeEmitterModelMatrix(),//决定粒子相对于模型位置的位置矩阵，可以理解为人把发射枪拿在哪里，用左手还是右手还是用脚，即发射器相对本体的位置矩阵。
      updateCallback: applyGravity,
    });
    // waterBranchParticle.id = id || Cesium.createGuid();
    // waterBranchParticle.particleType = '消防水枪';
    // waterBranchParticle.showTime = endNode;
    // waterBranchParticle.stopTime = eventTime[1];
    // waterBranchParticle.show = false;
    // this.particles.push(waterBranchParticle);
    // this.#viewer.scene.primitives.add(waterBranchParticle);
    return waterBranchParticle;
  }

  /**
   * @descripttion: 添加消防水枪
   * @param {Entity} entity 跟随模型
   * @return {null} null
   * @author: EV-申小虎
   */
  // addFireWaterGun2(eventPosition, modelPosition) {

  //     /**
  //     * @descripttion: 计算一个从4x4变换矩阵
  //     * @param {Cartesian3} cartesian3 笛卡尔坐标
  //     * @return {Matrix4} 4*4变换矩阵
  //     * @author: EV-申小虎
  //     */
  //     const computeModelMatrix = (cartesian3) => {
  //         if (!Cesium.defined(cartesian3))
  //             return undefined;
  //         const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(cartesian3, undefined, new Cesium.Matrix4());
  //         return modelMatrix;
  //     }

  //     /**
  //      * @descripttion: 计算发射器偏移矩阵
  //      * @return {null} null
  //      * @author: EV-申小虎
  //      */
  //     const computeEmitterModelMatrix = () => {
  //         const gcsA = CoordinateCon.Car3toDegrees(this.viewer, eventPosition);
  //         const gcsB = CoordinateCon.Car3toDegrees(this.viewer, modelPosition);
  //         // const angle = CoordinateCon.CalcuationAzimuth(gcsB.lon, gcsB.lat, gcsA.lon, gcsA.lat);
  //         // const angle = CoordinateCon.CalcuationAzimuth(gcsB.lon, gcsB.lat, gcsA.lon, gcsA.lat);
  //         // const angle = CoordinateCon.getAngle(gcsB.lon, gcsB.lat, gcsA.lon, gcsA.lat);
  //         // console.log(angle, '+++++++++++++++++++++++');
  //         let hpr = Cesium.HeadingPitchRoll.fromDegrees(0, 0, -30, new Cesium.HeadingPitchRoll());
  //         //new Cesium.TranslationRotationScale(translation, 旋转, 三方向缩放)生成新的仿射变换
  //         let trs = new Cesium.TranslationRotationScale();
  //         //Cesium.Cartesian3.fromElements(x, y, z, result)；三维坐标转三维向量
  //         // trs.translation = Cesium.Cartesian3.fromElements(0.6, -0.5, 3.5, new Cesium.Cartesian3());
  //         //Cesium.Quaternion.fromHeadingPitchRoll(headingPitchRoll, result) 将旋转转化为四元数
  //         trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, new Cesium.Quaternion());
  //         //将仿生变换转换为四阶矩阵
  //         return Cesium.Matrix4.fromTranslationRotationScale(trs, new Cesium.Matrix4());
  //     }

  //     /**
  //      * @descripttion:
  //      * @param {*} forceUpdate
  //      * @return {*}
  //      * @author: EV-申小虎
  //      */
  //     // const forceUpdate = (particle, dt) => {
  //     //     //particle是当前粒子对象，
  //     //     //可以由很多属性，dt是时间步长。之前有一个属性是particleLife表
  //     //     //示每个粒子被发射出来后的生存时间。dt就是将这段时间均分的步长。
  //     //     //下面我们对粒子的位置进行改变。
  //     //     let result = new Cesium.Cartesian3();
  //     //     let curtime =this.#viewer.clock.currentTime;
  //     //     let position = tarEntity.position.getValue(curtime, result);
  //     //     // if (!Cesium.defined(tarEntity)) {//如果目标消失
  //     //     //     scene.primitives.remove(particle);
  //     //     //     return new Cesium.Cartesian3();
  //     //     // }

  //     //     if (!Cesium.defined(position)) { //如果获取不到目标实时位置
  //     //         return;
  //     //     }
  //     //     let midpoint1 = Cesium.Cartesian3.midpoint(particle.position,
  //     //         position, new Cesium.Cartesian3());
  //     //     let midpoint2 = Cesium.Cartesian3.midpoint(particle.position,
  //     //         midpoint1, new Cesium.Cartesian3());
  //     //     let positionA = Cesium.Cartesian3.normalize(midpoint2,
  //     //         new Cesium.Cartesian3());//将粒子的位置向量正则化为单位值。
  //     //     Cesium.Cartesian3.multiplyByScalar(positionA, dt,
  //     //         positionA);//将单位向量按比例进行缩放
  //     //     particle.position = Cesium.Cartesian3.add(midpoint2,
  //     //         positionA, particle.position);//在粒子发射方向加上成比例
  //     //     //缩放的向量，更新粒子位置
  //     // }

  //     let waterBranchParticle = new Cesium.ParticleSystem({
  //         image: './assets/particle/fountain.png',
  //         startColor: new Cesium.Color(1, 1, 1, 0.6),
  //         endColor: new Cesium.Color(0.80, 0.86, 1, 0.4),
  //         startScale: 1.0,//开始时缩放倍数
  //         endScale: 20.0,//结束时缩放倍数
  //         minimumParticleLife: 6.1,
  //         maximumParticleLife: 7.1,
  //         minimumSpeed: 18,//最小粒子飞行速度
  //         maximumSpeed: 22,//最大粒子飞行速度
  //         particleSize: 10,
  //         minimumImageSize: new Cesium.Cartesian2(8, 8),
  //         maximumImageSize: new Cesium.Cartesian2(8, 8),
  //         gravity: -9.8,//地心引力值
  //         emissionRate: 60.0,//每秒发射粒子的个数
  //         emitter: new Cesium.CircleEmitter(0.2),//粒子发射器的形式，确定了在什么样的区间里随机产生粒子，该行表示粒子将在一个半径为1米的圆形区域不断产生
  //         lifetime: 16.0,//粒子发射器的生命周期，即发射粒子的时间，该值可理解为一把枪的弹夹可以用多长时间，loop默认属性为true理解为到时间后换上另一个弹夹继续发射。
  //         modelMatrix: computeModelMatrix(modelPosition),//决定粒子在空间坐标系的位置矩阵，可以理解为用枪的人的空间位置
  //         emitterModelMatrix: computeEmitterModelMatrix(),//决定粒子相对于模型位置的位置矩阵，可以理解为人把发射枪拿在哪里，用左手还是右手还是用脚，即发射器相对本体的位置矩阵。
  //         // updateCallback: forceUpdate
  //     });
  //     this.particles.push(waterBranchParticle);
  //     this.#viewer.scene.primitives.add(waterBranchParticle);
  // }

  /**
   * @descripttion: 根据索引清除粒子动画
   * @param {string} id 索引
   * @return {boolean}
   * @author: EV-申小虎
   */
  removeById(id: string) {
    let result = false;
    this.#particlerArr.slice(
      this.#particlerArr.findIndex((particler) => {
        if (particler.id === id) {
          //销毁粒子
          particler.item.destroy();
          //删除记录
          result = true;
        }
        return result;
      }),
      1
    );

    return result;
  }

  /**
   * @descripttion: 清除所有粒子动画
   * @return {void}
   * @author: EV-申小虎
   */
  removeAll() {
    this.#particlerArr.forEach((particler) => {
      if (!particler.item.isDestroyed()) {
        particler.item.destroy();
      }
    });
    this.#particlerArr.splice(0, this.#particlerArr.length);
  }

  /**
   * @descripttion: 根据天气系统设置粒子方向
   * @param {ParticleSystem} particle 粒子对象
   * @param {WeatherManager} weatherManager 天气系统
   * @return {void}
   * @author: EV-申小虎
   */
  addWindForce(
    particle: ParticleSystem,
    weatherManager: PartialPrivate<WeatherManager>
  ) {
    //particle是当前粒子对象，可以由很多属性，dt是时间步长。之前有一个属性是particleLife表示每个粒子被发射出来后的生存时间。dt就是将这段时间均分的步长。下面我们对粒子的位置进行改变。
    particle.updateCallback = (p, dt) => {
      const vectory = weatherManager.getWindForceVector?.() ?? Cartesian3.ZERO;
      Cartesian3.multiplyByScalar(vectory, dt, vectory); //将单位向量按比例进行缩放
      p.velocity = Cartesian3.add(p.velocity, vectory, p.velocity); //在粒子发射方向加上成比例缩放的向量，更新粒子位置
    };
  }
}
export default ParticleManager;
