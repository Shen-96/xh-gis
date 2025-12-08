/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-05 11:13:17
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-08 18:05:08
 */
import React, { useCallback, useMemo, useState, useEffect } from "react";
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

  const createPresets = useCallback(
    () =>
      ({
        FlowLine: {
          materialType: MaterialType.PolylineFlow as const,
          uniforms: {
            image: createSolidBitmap(64, 64, "#ffffff"),
            speed: 2.0,
            repeat: [2, 1] as [number, number],
            sample1D: false,
            vScale: 1.0,
          },
        },
        FlowLineAdaptive: {
          materialType: MaterialType.PolylineFlowAdaptive as const,
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
            speed: 1.0,
            reverse: true,
            sliderLength: 12.0,
            sliderHeightRatio: 1.0,
            useCesiumTime: false,
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
            speed: 1.0,
            reverse: false,
            useCesiumTime: false,
          },
        },
      } as const),
    [createSolidBitmap, createTextBitmap]
  );
  const presets = useMemo(() => createPresets(), [createPresets]);
  const [currentKey, setCurrentKey] =
    useState<keyof typeof presets>("FlowLine");
  const [compareMode, setCompareMode] = useState(false);
  const [realIds, setRealIds] = useState<{ main?: string; compare?: string }>({});

  const applyPreset = useCallback(
    (key: keyof typeof presets, idSuffix = "") => {
      if (!earth) return;
      const gm = earth.graphicManager;
      const slot: "main" | "compare" = idSuffix ? "compare" : "main";
      const realId = realIds[slot];
      const p1: Point3Deg = [110.0, 43.0, 0];
      const p2: Point3Deg = [135.0, 45.0, 0];
      // 移除旧折线（优先按真实 id），回退按业务 id
      if (realId) {
        gm.removeById(realId);
      } else {
        gm.removeById(`polyline-line${idSuffix}`);
      }
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
      setRealIds((prev) => ({ ...prev, [slot]: newPl.id }));
    },
    [earth, presets, realIds]
  );

  const applyCurrent = useCallback(() => {
    applyPreset(currentKey, "");
    if (compareMode) applyPreset(currentKey, "-2");
  }, [applyPreset, currentKey, compareMode]);

  const updateUniform = useCallback(
    (name: string, value: any) => {
      if (!earth) return;
      const gm = earth.graphicManager;
      const ids = [realIds.main, compareMode ? realIds.compare : undefined].filter(
        (x): x is string => !!x
      );
      ids.forEach((id) => {
        const entity = gm.getById(id);
        if (!entity) return;
        const cur = (entity.style as any)?.uniforms || {};
        entity.style = {
          ...entity.style,
          uniforms: {
            ...cur,
            [name]: value,
          },
        } as any;
      });
    },
    [earth, compareMode, realIds]
  );

  useEffect(() => {
    if (!earth) return;
    if (!compareMode) {
      const id = realIds.compare;
      if (id) earth.graphicManager.removeById(id);
      setRealIds((prev) => ({ ...prev, compare: undefined }));
    }
  }, [compareMode, earth, realIds.compare]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
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
          {(() => {
            const presetKeys = Object.keys(presets) as Array<
              keyof typeof presets
            >;
            return (
              <select
                value={currentKey}
                onChange={(e) => {
                  const k = e.target.value as keyof typeof presets;
                  setCurrentKey(k);
                  applyPreset(k, "");
                  if (compareMode) applyPreset(k, "-2");
                }}
              >
                {presetKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            );
          })()}
          <button onClick={applyCurrent} style={{ padding: "8px 12px" }}>
            加载/应用
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
            />
            对比模式
          </label>
        </div>
      </div>
      <div
        style={{
          width: 340,
          borderLeft: "1px solid #333",
          padding: 12,
          overflow: "auto",
        }}
      >
        <h3 style={{ marginTop: 0 }}>参数面板</h3>
        {(() => {
          const u = presets[currentKey].uniforms as any;
          const entries = Object.entries(u);
          return (
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}
            >
              {entries.map(([k, v]) => {
                const t = typeof v;
                if (
                  Array.isArray(v) &&
                  v.length === 2 &&
                  v.every((x) => typeof x === "number")
                ) {
                  return (
                    <div key={k}>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {k} (x,y)
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="number"
                          defaultValue={v[0]}
                          onChange={(e) =>
                            updateUniform(k, [Number(e.target.value), v[1]])
                          }
                          style={{ width: 80 }}
                        />
                        <input
                          type="number"
                          defaultValue={v[1]}
                          onChange={(e) =>
                            updateUniform(k, [v[0], Number(e.target.value)])
                          }
                          style={{ width: 80 }}
                        />
                      </div>
                    </div>
                  );
                }
                if (t === "boolean") {
                  return (
                    <label
                      key={k}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <input
                        type="checkbox"
                        defaultChecked={v as boolean}
                        onChange={(e) => updateUniform(k, e.target.checked)}
                      />
                      {k}
                    </label>
                  );
                }
                if (t === "number") {
                  const step = 0.1;
                  return (
                    <div key={k}>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{k}</div>
                      <input
                        type="number"
                        step={step}
                        defaultValue={v as number}
                        onChange={(e) =>
                          updateUniform(k, Number(e.target.value))
                        }
                        style={{ width: 120 }}
                      />
                    </div>
                  );
                }
                if (t === "string" && /^#/.test(v as string)) {
                  return (
                    <div key={k}>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{k}</div>
                      <input
                        type="color"
                        defaultValue={(v as string).replace(
                          /[^#0-9a-f]/gi,
                          "#ffffff"
                        )}
                        onChange={(e) => updateUniform(k, e.target.value)}
                      />
                    </div>
                  );
                }
                return (
                  <div key={k}>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{k}</div>
                    <input
                      type="text"
                      defaultValue={String(v)}
                      onChange={(e) => updateUniform(k, e.target.value)}
                      style={{ width: 200 }}
                    />
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default PolylineEffectsExample;
