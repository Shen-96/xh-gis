/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-05 11:13:17
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-05 11:24:16
 */
import React, { useCallback, useState } from "react";
import { WidgetEarth as Earth } from "@xh-gis/widgets";
import { XgEarth, GraphicType, MaterialType, Point3Deg } from "@xh-gis/engine";

const PolylineEffectsExample: React.FC = () => {
  const [earth, setEarth] = useState<XgEarth | null>(null);

  const handleInit = useCallback((instance: XgEarth) => {
    setEarth(instance);
    try {
      const { Cartesian3 } = (window as any).Cesium || {};
      if (Cartesian3) {
        instance.viewer.scene.camera.setView({
          destination: Cartesian3.fromDegrees(116.4, 39.9, 5000000),
        });
      }
    } catch {}
  }, []);

  const addDemoPolylines = useCallback(() => {
    if (!earth) return;

    // 使用引擎核心对象初始化图形管理器
    const gm = earth.graphicManager;

    const p1: Point3Deg = [116.0, 39.8, 0];
    const p2: Point3Deg = [116.5, 40.0, 0];
    const p3: Point3Deg = [117.0, 40.2, 0];

    // 1) 折线-点流动（FlowPoint）
    const flowPoint = gm.create(GraphicType.CURVE, [p1, p2]);
    flowPoint.style = {
      width: 5,
      color: "#ffffff",
      materialType: MaterialType.FlowPoint,
      uniforms: {
        speed: 1.0,
        reverse: false,
      },
    };

    // 2) 折线-线流动（FlowLine）
    const flowLine = gm.create(GraphicType.CURVE, [p2, p3]);
    flowLine.style = {
      width: 5,
      color: "#ffffff",
      materialType: MaterialType.FlowLine,
      uniforms: {
        image: "",
        speed: 1.0,
      },
    };

    // 3) 折线-虚线（PolylineDash）
    const dashLine = gm.create(GraphicType.CURVE, [p1, p3]);
    dashLine.style = {
      width: 6,
      color: "#00ffff",
      materialType: MaterialType.PolylineDash,
    };

    // 4) 折线-箭头（PolylineArrow）
    const arrowLine = gm.create(GraphicType.CURVE, [p3, p1]);
    arrowLine.style = {
      width: 6,
      color: "#ffff00",
      materialType: MaterialType.PolylineArrow,
      uniforms: {
        color: "#ffff00",
      },
    };
  }, [earth]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <Earth onInit={handleInit} />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            gap: 12,
          }}
        >
          <button onClick={addDemoPolylines} style={{ padding: "8px 12px" }}>
            添加线型特效
          </button>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <h3>线型特效示例</h3>
        <ul>
          <li>折线-点流动（FlowPoint）</li>
          <li>折线-线流动（FlowLine）</li>
          <li>折线-虚线（PolylineDash）</li>
          <li>折线-箭头（PolylineArrow）</li>
        </ul>
      </div>
    </div>
  );
};

export default PolylineEffectsExample;
