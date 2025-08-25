/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-04-09 14:16:42
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-05-20 17:13:58
 */
import {
  JulianDate,
  Viewer,
  AnimationViewModel,
  Clock,
  Timeline,
} from "cesium";
import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";

/**
 * @descripttion: 时间系统管理器
 * @author: EV-申小虎
 */
class TimeManager extends AbstractManager {
  readonly clock: Clock;
  #localizable: boolean;
  #timeline?: Timeline;

  /**
   * @descripttion: 时间管理器
   * @param {*} viewer cesium视图管理器
   * @author: EV-申小虎
   */
  constructor(core: AbstractCore, localizable = true) {
    super(core);
    this.#localizable = localizable;
    this.#timeline = this.viewer.timeline;
    this.clock = this.#initClock();
  }

  #initClock() {
    this.#localizable && this.localizeTime();

    return this.viewer.clock;
  }

  /**
   * @descripttion:
   * @param {*} date 时间
   * @param {*} viewModel 视图
   * @param {*} ignoredate 忽略日期
   * @return {String} null
   * @author: EV-申小虎
   */
  #dateTimeFormatter(
    date: JulianDate,
    viewModel: AnimationViewModel,
    ignoredate?: boolean
  ) {
    const correctJulianDate = new JulianDate();
    JulianDate.addHours(date, 8, correctJulianDate);
    const gregorianDT = JulianDate.toGregorianDate(correctJulianDate);
    // const gregorianDT = JulianDate.toGregorianDate(date);

    let objDT;
    if (ignoredate) objDT = "";
    else {
      objDT = new Date(
        gregorianDT.year,
        gregorianDT.month - 1,
        gregorianDT.day
      );

      // objDT = gregorianDT.year + "/" + gregorianDT.month + "/" + gregorianDT.day + "";
      objDT =
        gregorianDT.year +
        "年" +
        objDT.toLocaleString("zh-cn", { month: "short" }) +
        gregorianDT.day +
        "日";

      if (viewModel || gregorianDT.hour + gregorianDT.minute === 0)
        return objDT;

      objDT += " ";
    }
    /// 格式化补零
    function prefixInteger(num: number, length: number) {
      return (Array(length).join("0") + num).slice(-length);
    }
    return (
      objDT +
      `${prefixInteger(gregorianDT.hour, 2)}:${prefixInteger(
        gregorianDT.minute,
        2
      )}:${prefixInteger(gregorianDT.second, 2)}`
    );
  }

  setTimeline(val: Timeline) {
    this.#timeline = val;
  }

  getTimeLine() {
    return this.#timeline;
  }

  /**
   * @descripttion:
   * @param {*} time 时间
   * @param {*} viewModel 视图
   * @return {String} 时间串
   * @author: EV-申小虎
   */
  timeFormatter = (time: JulianDate, viewModel: AnimationViewModel) =>
    this.#dateTimeFormatter(time, viewModel, true);

  /**
   * @descripttion: 初始化本地时间
   * @return {void}
   * @author: EV-申小虎
   */
  localizeTime() {
    //格式化显示时间
    if (this.viewer.animation) {
      this.viewer.animation.viewModel.dateFormatter = this.#dateTimeFormatter;
      this.viewer.animation.viewModel.timeFormatter = this.timeFormatter;
    }

    if (this.#timeline) {
      /// 格式化时间轴显示
      // @ts-ignore
      this.#timeline[`makeLabel`] = this.#dateTimeFormatter;
      // this.#timeline.resize();
    }
  }

  /**
   * @descripttion: 改变时间速率
   * @param {Number} speed 速率
   * @return {void}
   * @author: EV-申小虎
   */
  updateTimeSpeed(speed: number) {
    if (Number(speed)) this.viewer.clock.multiplier = speed;
  }

  /**
   * @descripttion: 设置为当前时间
   * @return {void}
   * @author: EV-申小虎
   */
  updateTimeToNow() {
    //恢复正常时间
    const start = JulianDate.fromDate(new Date());
    //设置始时钟始时间
    this.viewer.clock.startTime = start.clone();
    //设置时钟当前时间
    this.viewer.clock.currentTime = start.clone();
    //时间恢复
    this.viewer.clock.canAnimate = true; //时间轴
    this.viewer.clock.shouldAnimate = true; //时间轴
  }

  /**
   * @descripttion: 更新当前时间
   * @param {JulianDate} time
   * @return {null}
   * @author: EV-申小虎
   */
  updateCurrentTime(time: JulianDate) {
    //设置时钟当前时间
    this.viewer.clock.currentTime = time.clone();
  }

  /**
   * @descripttion: 隐藏时间控件
   * @param {*}
   * @return {*}
   * @author: EV-申小虎
   */
  hiddenTimeWidget() {
    /// 动画控件隐藏
    this.viewer.animation.container.remove();
    /// 时间轴控件隐藏
    this.viewer.timeline.container.remove();
  }
}
export default TimeManager;
