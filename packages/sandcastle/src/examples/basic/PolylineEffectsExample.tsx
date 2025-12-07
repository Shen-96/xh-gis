/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-05 11:13:17
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-07 20:12:45
 */
import React, { useCallback, useMemo, useRef, useState } from "react";
import { WidgetEarth as Earth } from "@xh-gis/widgets";
import { XgEarth, GraphicType, MaterialType, Point3Deg } from "@xh-gis/engine";
import { Cartesian3 } from "cesium";

const PolylineEffectsExample: React.FC = () => {
  const [earth, setEarth] = useState<XgEarth | null>(null);

  const createTextBitmap = useCallback((text = "01010101", w = 256, h = 64) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    // 透明背景，仅绘制白色文字，让 alpha 充当掩码
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = Math.floor(h * 0.7);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillText(text, w / 2, h / 2);
    return canvas.toDataURL("image/png");
  }, []);

  const createSolidBitmap = useCallback((w = 64, h = 64, color = "#ffffff") => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    return canvas.toDataURL("image/png");
  }, []);

  const handleInit = useCallback((instance: XgEarth) => {
    setEarth(instance);
    try {
      instance.viewer.scene.camera.setView({
        destination: Cartesian3.fromDegrees(116.4, 39.9, 5000000),
      });
    } catch (error) {
      console.error("相机设置失败:", error);
    }
  }, []);

  const presets = useMemo(
    () => ({
      FlowLine: {
        materialType: MaterialType.FlowLine as const,
        uniforms: {
          image: createSolidBitmap(64, 64, "#ffffff"),
          speed: 2.0,
          repeat: [2, 1] as [number, number],
          sample1D: false,
          vScale: 1.0,
        },
      },
      FlowLineAdaptive: {
        materialType: MaterialType.FlowLineAdaptive as const,
        uniforms: {
          color: "#00b7ff",
          image: createTextBitmap("01010101", 256, 6),
          speed: 2.0,
          repeat: [2, 1] as [number, number],
          modeIndex: 1,
          imageHeightPx: 64,
        },
      },
      MSDFStatic: {
        materialType: MaterialType.MSDFStatic as const,
        uniforms: {
          color: "#ff6a00",
          image: "/textures/flowline/h_msdf.png",
          repeat: [24, 1] as [number, number],
          range: 0.5,
          smooth: 1.2,
          center: 0.5,
        },
      },
      PolylineDash: {
        materialType: MaterialType.PolylineDash as const,
        uniforms: {
          color: "#ff6a00",
        },
      },
      PolylineDashSlider: {
        materialType: MaterialType.PolylineDashSlider as const,
        uniforms: {
          color: "#00b7ff",
          sliderColor: "#ffff00",
          speed: 2.0,
          reverse: false,
        },
      },
      PolylineDashFlow: {
        materialType: MaterialType.PolylineDashFlow as const,
        uniforms: {
          color: "#00b7ff",
          gapColor: "#00000000",
          sliderColor: "#ffff00",
          sliderLength: 8.0,
          dashLength: 16.0,
          dashPattern: 255,
          speed: 2.0,
          reverse: false,
        },
      },
    }),
    [createSolidBitmap, createTextBitmap]
  );

  const applyPreset = useCallback(
    (key: keyof typeof presets) => {
      if (!earth) return;
      const gm = earth.graphicManager;
      const plId = `polyline-line`;
      const p1: Point3Deg = [110.0, 43.0, 0];
      const p2: Point3Deg = [135.0, 45.0, 0];
      // 移除旧折线
      gm.removeById(plId);
      // 新增折线并应用预设材质
      const newPl = gm.create(GraphicType.FREEHAND_LINE);
      newPl.style = {
        width: 6,
        clampToGround: false,
        materialType: presets[key].materialType,
        uniforms: presets[key].uniforms as any,
      };
      newPl.setPositions([p1, p2]);
      gm.add(newPl);
    },
    [earth, presets]
  );

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
          <button
            onClick={() => applyPreset("FlowLine")}
            style={{ padding: "8px 12px" }}
          >
            加载折线
          </button>
          <select
            defaultValue={"FlowLine"}
            onChange={(e) =>
              applyPreset(e.target.value as keyof typeof presets)
            }
          >
            <option value="FlowLine">FlowLine</option>
            <option value="FlowLineAdaptive">FlowLineAdaptive</option>
            <option value="MSDFStatic">MSDFStatic</option>
          <option value="PolylineDash">PolylineDash</option>
          <option value="PolylineDashSlider">PolylineDashSlider</option>
          <option value="PolylineDashFlow">PolylineDashFlow</option>
        </select>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <h3>折线材质切换示例</h3>
        <ul>
          <li>加载一条折线</li>
          <li>使用下拉框切换不同材质</li>
        </ul>
      </div>
    </div>
  );
};

export default PolylineEffectsExample;
