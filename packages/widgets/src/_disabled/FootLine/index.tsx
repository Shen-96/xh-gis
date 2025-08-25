/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2022-03-29 16:14:13
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 19:00:33
 */

import React, {
  FC,
  memo,
  PropsWithoutRef,
  RefObject,
  useEffect,
  useState,
} from "react";
import {
  CameraInfo,
  Geographic,
  CoordinateUtils,
  MouseEventUtils,
  CoreType,
  AbstractCore,
} from "@xh-gis/engine";
import "./index.css";
import { ScreenSpaceEventHandler, defined } from "cesium";

type Props = PropsWithoutRef<{
  coreRef?: RefObject<AbstractCore<CoreType>>;
}>;

const FootLine: FC<Props> = ({ coreRef }) => {
  /// isReady
  const [isReady, setIsReady] = useState(false);
  /// 相机信息
  const [cameraInfo, setCameraInfo] = useState<CameraInfo>();
  /// 鼠标位置
  const [mousePosition, setMousePosition] = useState<Geographic>();

  useEffect(() => {
    const timer = setInterval(() => {
      if (coreRef?.current) {
        setIsReady(true);
        clearInterval(timer);
      }
    }, 2 * 100);
  }, []);

  useEffect(() => {
    let handler: ScreenSpaceEventHandler | undefined;

    if (isReady && coreRef?.current) {
      const xgCore = coreRef.current;
      /// 添加相机监听事件
      xgCore.roamManager.camera.changed.addEventListener(() => {
        setCameraInfo(xgCore.roamManager.cameraInfo);
      });

      handler = new ScreenSpaceEventHandler(xgCore.scene.canvas);
      /// 鼠标移动事件
      MouseEventUtils.setMoveListener(handler, (res) => {
        const { screenPosition } = res;

        if (screenPosition && defined(screenPosition)) {
          const car3 = xgCore.scene.globe.depthTestAgainstTerrain
              ? CoordinateUtils.getSceneCartesian3(xgCore.scene, screenPosition)
              : CoordinateUtils.getSurfaceCartesian3(
                  xgCore.viewer,
                  screenPosition
                ),
            gcs = car3 && CoordinateUtils.car3ToGeographic(car3);

          if (gcs) {
            setMousePosition({
              longitude: gcs.longitude,
              latitude: gcs.latitude,
              altitude: parseFloat(gcs.altitude?.toFixed(3) ?? "0"),
            });
          }
        }
      });
    }

    return () => {
      handler?.destroy();
    };
  }, [isReady, coreRef]);

  return (
    <div className="xh-gis-viewer-foot-line">
      <span className={"detail camera"}>
        经度：
        <span>
          {
            CoordinateUtils.pointToDMS([
              cameraInfo?.lon ?? 0,
              cameraInfo?.lat ?? 0,
            ]).strLon
          }
        </span>
      </span>
      <span className={"detail camera"}>
        纬度：
        <span>
          {
            CoordinateUtils.pointToDMS([
              cameraInfo?.lon ?? 0,
              cameraInfo?.lat ?? 0,
            ]).strLat
          }
        </span>
      </span>
      <span className={"detail camera"}>
        高程：<span>{cameraInfo?.altitude.toFixed(3)}米</span>
      </span>
      <span className={"detail camera"}>
        偏航：<span>{cameraInfo?.heading.toFixed(1)}度</span>
      </span>
      <span className={"detail camera"}>
        俯仰：<span>{cameraInfo?.pitch.toFixed(1)}度</span>
      </span>
      <span className={"detail camera"}>
        相机高度：<span>{cameraInfo?.height.toFixed(3)}米</span>
      </span>
      <span className={"detail mouse"}>
        鼠标位置：
        <span>
          {`${
            CoordinateUtils.pointToDMS([
              mousePosition?.longitude ?? 0,
              mousePosition?.latitude ?? 0,
            ]).strLon
          }（${mousePosition?.longitude ?? 0}°）`}
        </span>
        &nbsp; &nbsp;
        <span>
          {`${
            CoordinateUtils.pointToDMS([
              mousePosition?.longitude ?? 0,
              mousePosition?.latitude ?? 0,
            ]).strLat
          }（${mousePosition?.latitude ?? 0}°）`}
        </span>
        &nbsp; &nbsp;
        <span>{mousePosition?.altitude}米</span>
      </span>
    </div>
  );
};

export default memo(FootLine);
