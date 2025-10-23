import React, { useCallback, useState } from "react";
import { Earth, ToolBar } from "@xh-gis/widgets";
import { XgEarth, HeatmapManager, HeatmapOption } from "@xh-gis/engine";
import styles from "./HeatmapExample.module.css";

const HeatmapExample: React.FC = () => {
  const [earth, setEarth] = useState<XgEarth | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInit = useCallback((instance: XgEarth) => {
    setEarth(instance);
    setStatus("ready");

    try {
      const Cesium: any = (window as any).Cesium;
      const { Cartesian3 } = Cesium || {};
      if (Cartesian3) {
        instance.viewer.scene.camera.setView({
          destination: Cartesian3.fromDegrees(116.4074, 39.9042, 5000000),
        });
      }
    } catch (e) {
      console.warn("[HeatmapExample] camera setView failed:", e);
    }

    try {
      // 构造热度图数据（北京周边随机点）
      const points: Array<{ x: number; y: number; value?: number }> = [];
      for (let i = 0; i < 1000; i++) {
        const x = 115 + Math.random() * 3; // 经度
        const y = 39 + Math.random() * 2; // 纬度
        const value = Math.round(Math.random() * 100);
        points.push({ x, y, value });
      }

      const options: HeatmapOption = {
        renderType: "imagery",
        points,
        heatmapOptions: {
          radius: 30,
          maxOpacity: 0.8,
          minOpacity: 0.2,
          blur: 0.85,
          gradient: {
            0.25: "rgb(0,0,255)",
            0.55: "rgb(0,255,0)",
            0.85: "yellow",
            1.0: "rgb(255,0,0)",
          },
        },
        heatmapDataOptions: { min: 0, max: 100 },
        zoomToLayer: true,
        contourLineOption: {
          show: true,
          color: "#fff",
          smooth: true,
        },
      };

      // 创建热度图
      const id = "demo-heatmap";
      if (!instance.heatmapManager.isExists(id)) {
        instance.heatmapManager.add(id, options);
      }
    } catch (e: any) {
      console.error("[HeatmapExample] heatmapManager.add failed:", e);
      setStatus("error");
      setErrorMsg(e?.message || String(e));
    }
  }, []);

  const handleUpdateRadius = useCallback(() => {
    if (!earth) return;
    const id = "demo-heatmap";
    const inst = earth.heatmapManager.getById(id);
    if (!inst) return;

    const newRadius = Math.floor(20 + Math.random() * 60);
    earth.heatmapManager.update(id, { radius: newRadius });
  }, [earth]);

  const handleClear = useCallback(() => {
    if (!earth) return;
    earth.heatmapManager.clearAll();
  }, [earth]);

  return (
    <div className={styles.container}>
      <div className={styles.canvas}>
        <Earth onInit={handleInit} />
        {status === "ready" && earth && (
          <ToolBar coreRef={{ current: earth } as any} />
        )}
        {status === "error" && (
          <div className={styles.errorTip}>
            <strong>发生错误：</strong> {errorMsg || "未知错误"}
          </div>
        )}
      </div>

      <div className={styles.sidePanel}>
        <h2>🔥 热度图示例</h2>
        <p>演示 HeatmapLayer 在不同渲染方式下的效果（默认 imagery）。</p>
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={handleUpdateRadius}>
            随机调整半径
          </button>
          <button className={styles.actionButton} onClick={handleClear}>
            清空热度图
          </button>
        </div>
        <div className={styles.tips}>
          <div>• 使用 HeatmapManager 统一管理实例</div>
          <div>• 支持等值线显示，基于 d3-contour</div>
          <div>• 本示例随机生成北京附近数据点</div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapExample;
