/*
 * @Descripttion: XH-GIS 核心组件
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2024-09-14 15:21:25
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-10-09 17:35:57
 */

import "../index.css";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { CoreType, XgEarth, XgMap } from "@xh-gis/engine";
import { memo, PropsWithRef, useEffect, useRef } from "react";
import Statusbar from "../Statusbar";
import Timeline from "../Timeline";
import Toolbar from "../Toolbox";

type CoreTypeMap = {
  [CoreType.MAP]: XgMap;
  [CoreType.EARTH]: XgEarth;
};

export type CoreProps<T extends CoreType> = PropsWithRef<{
  coreType: T;
  /// 信息组件显隐
  statusbar?: boolean;
  /// 工具栏显隐
  toolbar?: boolean;
  /// 时间组件显隐
  timeline?: boolean;
  timelineProps?: {
    systemTime?: boolean;
    shouldAnimate?: boolean;
  };
  // /// 标绘组件显隐
  // toolBox?: boolean;
  /// 初始化完成回调
  onInit: (core: CoreTypeMap[T]) => void;
}>;

const Core = <T extends CoreType>({
  coreType,
  statusbar = true,
  toolbar = true,
  timeline = false,
  timelineProps = {},
  onInit,
}: CoreProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xgCoreRef = useRef<CoreTypeMap[T] | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (xgCoreRef.current) return;

    console.time(`${coreType} 实例化耗时`);
    let xgCore: CoreTypeMap[T];

    /// 实例化webgl对象
    if (coreType === CoreType.MAP) {
      //@ts-ignore
      xgCore = xgCoreRef.current = new XgMap(containerRef.current);

      window.xgMap = xgCore;
    } else {
      //@ts-ignore
      xgCore = xgCoreRef.current = new XgEarth(containerRef.current);

      window.xgEarth = xgCore;
    }
    console.timeEnd(`${coreType} 实例化耗时`);

    console.log(
      `%c欢迎使用Xh-GIS ，当前版本为${xgCore.version}`,
      "color: #fff; background: linear-gradient(90deg, #ff6b6b, #4ecdc4); padding: 10px 20px; border-radius: 5px; font-weight: bold;"
    );
    // 初始化完成回调
    onInit(xgCore);

    // return () => {
    //   xgCore.destroy();
    // };
  }, []);

  return (
    <div className={`xh-gis-viewer ${coreType}`}>
      <div ref={containerRef} className={"xh-gis-viewer-scene"}></div>
      {statusbar ? <Statusbar coreRef={xgCoreRef} /> : null}
      {toolbar ? <Toolbar coreRef={xgCoreRef} /> : null}
      {timeline ? <Timeline coreRef={xgCoreRef} {...timelineProps} /> : null}
      <div className={"xh-gis-popup-container"}></div>
    </div>
  );
};

export default memo(Core);
