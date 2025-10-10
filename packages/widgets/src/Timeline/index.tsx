/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2022-10-25 15:10:45
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-06-06 17:43:19
 */

import "./index.css";
import { JulianDate, Timeline as CesiumTimeline } from "cesium";
import { throttle } from "lodash";
import { FC, RefObject, useEffect, useRef, useState } from "react";
import { CoreType, MathUtils, AbstractCore } from "@xh-gis/engine";
import {
  StopIcon as IconStop,
  BeginIcon as IconBegin,
  PauseIcon as IconPause,
  DecelerateIcon as IconDecelerate,
  IncelerateIcon as IconIncelerate,
} from "./components/Icons";

type Props = {
  coreRef?: RefObject<AbstractCore<CoreType>>;
  systemTime?: boolean;
  visible?: boolean;
  shouldAnimate?: boolean;
  onForward?: (multiplier?: number) => void;
  onBackward?: (multiplier?: number) => void;
  onShouldAnimateChange?: (shouldAnimate: boolean) => void;
  // onMultiplierChange?: (multiplier: number) => void;
  onSliderChange?: (value: number) => void;
  onReset?: () => void;
};

const Timeline: FC<Props> = ({
  coreRef,
  systemTime = true,
  visible = true,
  shouldAnimate = false,
  onForward,
  onBackward,
  onShouldAnimateChange,
  // onMultiplierChange,
  onSliderChange,
  onReset,
}) => {
  const timelineRef = useRef<CesiumTimeline | null>();
  const [pause, setPause] = useState(!shouldAnimate);
  const [spendValue, setSpendValue] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [spendTime, setSpendTime] = useState("00:00:00");
  const [entireTime, setEntireTime] = useState("00:00:00");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  // const [multiplierOptions, setMultiplierOptions] = useState<
  //   MenuProps["items"]
  // >([
  //   { key: 0.1, label: " 0.1X " },
  //   { key: 0.5, label: " 0.5X " },
  //   { key: 1.0, label: " 1.0X " },
  //   { key: 2.0, label: " 2.0X " },
  //   { key: 5.0, label: " 5.0X " },
  //   { key: 10, label: "10.0X " },
  //   { key: 30, label: "30.0X " },
  //   { key: 50, label: "50.0X " },
  //   { key: 100, label: "100.0X " },
  //   { key: 200, label: "200.0X " },
  //   { key: 500, label: "500.0X " },
  //   { key: 1000, label: "1000.0X " },
  //   { key: 3600, label: "3600.0X " },
  // ]);

  /// 时间变化回调，做节流处理
  const onTick = throttle(() => {
    const xgCore = coreRef?.current,
      clock = xgCore?.timeManager.clock;

    if (!clock) return;

    const startTime = clock.startTime.clone(),
      stopTime = clock.stopTime.clone(),
      curTime = clock.currentTime.clone(),
      range = JulianDate.secondsDifference(stopTime, startTime),
      spend = JulianDate.secondsDifference(curTime, startTime),
      shouldAnimate = clock.shouldAnimate,
      multiplier = clock.multiplier;

    if (range > 0) {
      setEntireTime(MathUtils.secondsToHMSInStr(range));
      setSpendTime(MathUtils.secondsToHMSInStr(spend));
      setMin(0);
      setMax(range);
      setSpendValue(spend);
      systemTime && setPause(!shouldAnimate);
      /// 保留三位有效数字
      setMultiplier(Math.round(multiplier * 1000) / 1000);

      timelineRef.current?.zoomTo(startTime, stopTime);
    }
  }, 3 * 100);

  /// 改变倍增速率
  // const onMultiplierClick: MenuProps["onClick"] = ({ key: multiplier }) => {
  //   const xgCore = coreRef?.current;

  //   xgCore && (xgCore.timeManager.clock.multiplier = Number(multiplier));
  //   onMultiplierChange?.(Number(multiplier));
  // };

  /// 重置
  const handleResetClick = () => {
      const xgCore = coreRef?.current;

      if (xgCore && systemTime) {
        xgCore.timeManager.clock.shouldAnimate = false;
        xgCore.timeManager.clock.currentTime =
          xgCore.timeManager.clock.startTime.clone();
        xgCore.timeManager.clock.shouldAnimate = true;
      }

      onReset?.();
    },
    /// 开始&暂停
    handlePlayClick = () => {
      const xgCore = coreRef?.current;

      if (xgCore && systemTime) {
        /// 设置时钟状态
        const shouldAnimate = xgCore?.timeManager.clock.shouldAnimate ?? false;

        xgCore.timeManager.clock.shouldAnimate = !shouldAnimate;
      }

      /// 触发事件
      onShouldAnimateChange?.(!shouldAnimate);
    },
    /// 后退
    handleBackwardClick = () => {
      //   const xgMap = window.xgIntegrated?.xgMap,
      //     xgEarth = window.xgIntegrated?.xgEarth;

      //   if (!xgMap || !xgEarth) {
      //     console.error("invalid CustomViewer");
      //     return;
      //   }
      //   const multiplier = xgMap.timeManager.clock.multiplier,
      //     currentTime = xgMap.timeManager.clock.currentTime.clone(),
      //     lastTime = JulianDate.addSeconds(
      //       currentTime,
      //       -multiplier,
      //       new JulianDate()
      //     );

      //   xgMap.timeManager.clock.currentTime = lastTime;
      //   xgEarth.timeManager.clock.currentTime = lastTime;

      const value = multiplier * 0.5;
      if (value < 0.5) {
        alert("最小倍速不能再减小了！");
        return;
      }

      if (coreRef?.current && systemTime) {
        coreRef.current.timeManager.clock.multiplier = value;
      }

      /// 执行后退发射器
      onBackward?.(value);
    },
    /// 前进
    handleForwardClick = () => {
      //   const xgMap = window.xgIntegrated?.xgMap,
      //     xgEarth = window.xgIntegrated?.xgEarth;

      //   if (!xgMap || !xgEarth) {
      //     console.error("invalid CustomViewer");
      //     return;
      //   }
      //   const multiplier = xgMap.timeManager.clock.multiplier,
      //     currentTime = xgMap.timeManager.clock.currentTime.clone(),
      //     lastTime = JulianDate.addSeconds(
      //       currentTime,
      //       multiplier,
      //       new JulianDate()
      //     );

      //   xgMap.timeManager.clock.currentTime = lastTime;
      //   xgEarth.timeManager.clock.currentTime = lastTime;
      const value = multiplier * 2;
      if (value > 1000) {
        alert("最大倍速不能再增加了！");
        return;
      }

      if (coreRef?.current && systemTime) {
        coreRef.current.timeManager.clock.multiplier = value;
      }

      /// 执行前进发射器
      onForward?.(value);
    },
    /// 拖动时间轴
    afterTimelineChange = (value: number) => {
      //   const xgMap = window.xgIntegrated?.xgMap,
      //     xgEarth = window.xgIntegrated?.xgEarth;

      //   if (!xgMap || !xgEarth) {
      //     console.error("invalid CustomViewer");
      //     return;
      //   }
      //   const start = xgMap.timeManager.clock.startTime.clone(),
      //     stop = xgMap.timeManager.clock.stopTime.clone(),
      //     range = JulianDate.secondsDifference(stop, start),
      //     lastTime = JulianDate.addSeconds(
      //       start,
      //       (value / 100) * range,
      //       new JulianDate()
      //     );

      //   xgMap.timeManager.clock.currentTime = lastTime;
      //   xgEarth.timeManager.clock.currentTime = lastTime;

      onSliderChange?.(value);
    },
    onTimelineChange = throttle((value: number) => {
      const xgCore = coreRef?.current;

      if (xgCore) {
        const shouldAnimate = xgCore?.timeManager.clock.shouldAnimate,
          startTime = xgCore.timeManager.clock.startTime.clone(),
          lastTime = JulianDate.addSeconds(startTime, value, new JulianDate());

        xgCore.timeManager.clock.shouldAnimate = false;
        xgCore.timeManager.clock.currentTime = lastTime;
        xgCore.timeManager.clock.shouldAnimate = shouldAnimate;
      }

      //   xgEarth.timeManager.clock.shouldAnimate = false;
      //   xgEarth.timeManager.clock.currentTime = lastTime;
      //   xgEarth.timeManager.clock.shouldAnimate = shouldAnimate;

      onSliderChange?.(value);
    }, 2 * 100);

  useEffect(() => {
    /// 初始化配置
    //   state.multiplier = xgMap.timeManager.clock.multiplier;
    const timer = setInterval(() => {
      if (timelineRef.current) {
        clearInterval(timer);
        return;
      }

      const xgCore = coreRef?.current,
        clock = xgCore?.timeManager.clock;

      if (clock) {
        clearInterval(timer);

        const container = document
            .getElementsByClassName("xh-gis-viewer-time-line-graduation")
            .item(0),
          timeLine = (timelineRef.current =
            container && new CesiumTimeline(container, clock));

        timeLine && xgCore.timeManager.setTimeline(timeLine);

        timeLine?.zoomTo(clock.startTime, clock.stopTime);

        xgCore.timeManager.localizeTime();

        // setShouldAnimate(clock.shouldAnimate);
        /// 监听系统当前时间
        clock.onTick.addEventListener(onTick);
      }
    }, 2 * 100);

    return () => {
      const xgCore = coreRef?.current;

      /// 移除监听系统当前时间事件
      xgCore?.timeManager.clock.onTick.removeEventListener(onTick);
    };
  }, []);

  useEffect(() => {
    setPause(!shouldAnimate);
  }, [shouldAnimate]);

  return (
    <div className="xh-gis-viewer-time-line">
      <div className="xh-gis-viewer-time-line-tools">
        <div className="top-bar">
          <div className="button" title="重新开始" onClick={handleResetClick}>
            <IconStop />
          </div>
          <div className="button" title="减速" onClick={handleBackwardClick}>
            <IconDecelerate />
          </div>
          <div
            className="button"
            title={!pause ? "暂停" : "开始"}
            onClick={handlePlayClick}
          >
            {pause ? <IconBegin /> : <IconPause />}
          </div>
          <div className="button" title="加速" onClick={handleForwardClick}>
            <IconIncelerate />
          </div>
        </div>
        <div className="bottom-bar">
          <span>
            {spendTime}/{entireTime}
          </span>
          <span>x{multiplier}</span>
        </div>
      </div>
      <div className="xh-gis-viewer-time-line-graduation"></div>
    </div>
  );
};

export default Timeline;
