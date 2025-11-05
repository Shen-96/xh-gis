import React, {
  FC,
  PropsWithoutRef,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./index.css";
import {
  AbstractCore,
  CoreType,
  GraphicType,
  SymbolType,
  GeometryType,
  MaterialType,
} from "@xh-gis/engine";

type Props = PropsWithoutRef<{ coreRef?: RefObject<AbstractCore<CoreType>> }>;

type GraphicItem = {
  id: string;
  name: string;
  type?: GraphicType | SymbolType;
};

const GraphicTools: FC<Props> = ({ coreRef }) => {
  const [tab, setTab] = useState<"draw" | "manage">("draw");
  const [items, setItems] = useState<GraphicItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [selectedGeom, setSelectedGeom] = useState<GeometryType | undefined>();
  const [form, setForm] = useState<{
    strokeColor: string;
    strokeWidth: number;
    strokeMaterialType: MaterialType;
    fill: boolean;
    fillColor: string;
    outlineColor: string;
    outlineWidth: number;
    outlineMaterialType: MaterialType;
  }>({
    strokeColor: "#ff0000",
    strokeWidth: 3,
    strokeMaterialType: MaterialType.SolidColor,
    fill: true,
    fillColor: "#ffffff00",
    outlineColor: "#ff0000",
    outlineWidth: 3,
    outlineMaterialType: MaterialType.SolidColor,
  });
  const [filter, setFilter] = useState<string>("");
  const [realtime, setRealtime] = useState<boolean>(true);
  const [rename, setRename] = useState<string>("");

  // 事件驱动更新：订阅 GraphicManager 集合变化
  useEffect(() => {
    const core = coreRef?.current;
    if (!core?.graphicManager) return;
    // 初始化一次，确保列表与当前集合一致
    const initList = () => {
      const symbols = core.graphicManager.getAll();
      setItems(
        symbols.map((s) => ({
          id: s.id,
          name: s.graphicName || "未命名",
          type: s.graphicType as any,
        }))
      );
    };
    initList();
    // 订阅集合变化（新增/删除/清空均会触发派生事件 collectionChanged）
    const off = core.graphicManager.on("collectionChanged", (list) => {
      setItems(
        list.map((s) => ({
          id: s.id,
          name: s.graphicName || "未命名",
          type: s.graphicType,
        }))
      );
    });
    return () => {
      off?.();
    };
  }, [coreRef]);

  const triggerDraw = useCallback(
    (type: GraphicType | SymbolType) => {
      const core = coreRef?.current;
      if (!core) return;
      core.graphicManager.setDrawEventHandler(type, (_pos, symbol) => {
        // 事件驱动，集合变化由 GraphicManager 派发，取消乐观插入
        // 绘制完成后便于继续管理，自动切到管理页
        setTab("manage");
      });
    },
    [coreRef]
  );

  const exportGraphicsJson = useCallback(() => {
    const gm = coreRef?.current?.graphicManager;
    const data = gm?.serializeAll?.();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graphics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [coreRef]);

  const exportGeoJSON = useCallback(() => {
    const gm: any = coreRef?.current?.graphicManager as any;
    const data = gm?.toGeoJSON?.();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graphics-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }, [coreRef]);

  const clearAll = useCallback(() => {
    const core = coreRef?.current;
    if (!core) return;
    const ids = core.graphicManager.getAll().map((s) => s.id);
    core.graphicManager.removeMany(ids);
    setItems([]);
    // 清空列表后同时取消选择，避免编辑器残留
    setSelectedId(undefined);
    setSelectedGeom(undefined);
  }, [coreRef]);

  const removeOne = useCallback(
    (id: string) => {
      const core = coreRef?.current;
      if (!core) return;
      core.graphicManager.removeById(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      // 如果删除的是当前正在编辑的图形，则取消选择以隐藏编辑器
      if (selectedId === id) {
        setSelectedId(undefined);
        setSelectedGeom(undefined);
      }
    },
    [coreRef, selectedId]
  );

  // 当选中项不在列表中（被删除或清空）时，自动取消选择
  useEffect(() => {
    if (selectedId && !items.some((i) => i.id === selectedId)) {
      setSelectedId(undefined);
      setSelectedGeom(undefined);
    }
  }, [items, selectedId]);

  const loadStyle = useCallback(
    (id: string) => {
      const core = coreRef?.current;
      if (!core) return;
      const inst: any = core.graphicManager.getById(id);
      if (!inst) return;
      const geom: GeometryType = inst.getGeometryType
        ? inst.getGeometryType()
        : inst.geometryType;
      setSelectedId(id);
      setSelectedGeom(geom);
      setRename(inst.graphicName || "");
      try {
        const style = inst.style || {};
        if (geom === GeometryType.LINE) {
          const strokeColor = style.color ?? "#ff0000";
          const strokeWidth = style.width ?? style.outlineWidth ?? 3;
          const strokeMaterialType: MaterialType =
            style.materialType ?? MaterialType.SolidColor;
          setForm((prev) => ({
            ...prev,
            strokeColor,
            strokeWidth,
            strokeMaterialType,
          }));
        } else if (geom === GeometryType.POLYGON) {
          const fill = style.fill ?? true;
          const fillColor = style.color ?? "#ffffff00";
          const outlineColor = style.outlineColor ?? "#ff0000";
          const outlineWidth = style.outlineWidth ?? 3;
          const outlineMaterialType: MaterialType =
            style.outlineMaterialType ?? MaterialType.SolidColor;
          setForm((prev) => ({
            ...prev,
            fill,
            fillColor,
            outlineColor,
            outlineWidth,
            outlineMaterialType,
            strokeColor: outlineColor,
            strokeWidth: outlineWidth,
          }));
        } else {
          // 点样式后续补充
        }
      } catch {}
    },
    [coreRef]
  );

  const applyStyle = useCallback(() => {
    const core = coreRef?.current;
    if (!core || !selectedId || !selectedGeom) return;
    const inst: any = core.graphicManager.getById(selectedId);
    if (!inst) return;
    if (selectedGeom === GeometryType.LINE) {
      inst.setStyle?.({
        materialType: form.strokeMaterialType,
        color: form.strokeColor,
        width: form.strokeWidth,
      });
    } else if (selectedGeom === GeometryType.POLYGON) {
      inst.setStyle?.({
        fill: form.fill,
        materialType: MaterialType.SolidColor,
        color: form.fillColor,
        outline: true,
        outlineMaterialType: form.outlineMaterialType,
        outlineColor: form.outlineColor || form.strokeColor,
        outlineWidth: form.outlineWidth || form.strokeWidth,
        uniforms: { color: form.outlineColor || form.strokeColor },
      });
    } else {
      // 点的样式暂不处理
    }
  }, [coreRef, selectedId, selectedGeom, form]);

  // 快速预设应用
  const applyColorPreset = useCallback(
    (hex: string) => {
      setForm((p) => {
        const next = { ...p, strokeColor: hex, outlineColor: hex };
        if (realtime) {
          // 立即应用
          const core = coreRef?.current;
          if (core && selectedId && selectedGeom) {
            const inst: any = core.graphicManager.getById(selectedId);
            if (inst) {
              if (selectedGeom === GeometryType.LINE) {
                inst.setStyle?.({
                  materialType: next.strokeMaterialType,
                  color: hex,
                  width: next.strokeWidth,
                });
              } else if (selectedGeom === GeometryType.POLYGON) {
                inst.setStyle?.({
                  fill: next.fill,
                  materialType: MaterialType.SolidColor,
                  color: next.fillColor,
                  outline: true,
                  outlineMaterialType: next.outlineMaterialType,
                  outlineColor: hex,
                  outlineWidth: next.outlineWidth,
                  uniforms: { color: hex },
                });
              }
            }
          }
        }
        return next;
      });
    },
    [coreRef, selectedId, selectedGeom, realtime]
  );

  const applyWidthPreset = useCallback(
    (width: number) => {
      setForm((p) => {
        const next = { ...p, strokeWidth: width, outlineWidth: width };
        if (realtime) {
          const core = coreRef?.current;
          if (core && selectedId && selectedGeom) {
            const inst: any = core.graphicManager.getById(selectedId);
            if (inst) {
              if (selectedGeom === GeometryType.LINE) {
                inst.setStyle?.({
                  materialType: next.strokeMaterialType,
                  color: next.strokeColor,
                  width,
                });
              } else if (selectedGeom === GeometryType.POLYGON) {
                inst.setStyle?.({
                  fill: next.fill,
                  materialType: MaterialType.SolidColor,
                  color: next.fillColor,
                  outline: true,
                  outlineMaterialType: next.outlineMaterialType,
                  outlineColor: next.outlineColor,
                  outlineWidth: width,
                  uniforms: { color: next.outlineColor },
                });
              }
            }
          }
        }
        return next;
      });
    },
    [coreRef, selectedId, selectedGeom, realtime]
  );

  const applyRename = useCallback(() => {
    const core = coreRef?.current;
    if (!core || !selectedId) return;
    const inst: any = core.graphicManager.getById(selectedId);
    if (!inst) return;
    inst.graphicName = rename;
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedId ? { ...i, name: rename || i.name } : i
      )
    );
  }, [coreRef, selectedId, rename]);

  const resetSelection = useCallback(() => {
    setSelectedId(undefined);
    setSelectedGeom(undefined);
  }, []);

  const drawButtons = useMemo(
    () => [
      { label: "自由线", type: GraphicType.FREEHAND_LINE },
      { label: "曲线", type: GraphicType.CURVE },
      { label: "圆形", type: GraphicType.CIRCLE },
      { label: "矩形", type: GraphicType.RECTANGLE },
      { label: "多边形", type: GraphicType.POLYGON },
      { label: "自由面", type: GraphicType.FREEHAND_POLYGON },
      { label: "直线箭头", type: GraphicType.STRAIGHT_ARROW },
      { label: "曲线箭头", type: GraphicType.CURVE_ARROW },
      { label: "战役突击方向", type: SymbolType.战役突击方向 as any },
      { label: "战役反突击方向", type: SymbolType.战役反突击方向 as any },
    ],
    []
  );

  return (
    <div className="xh-gis-graphic-tools">
      <div className="gt-header">
        <div className="gt-tabs">
          <div
            className={`gt-tab ${tab === "draw" ? "active" : ""}`}
            onClick={() => setTab("draw")}
          >
            绘制
          </div>
          <div
            className={`gt-tab ${tab === "manage" ? "active" : ""}`}
            onClick={() => setTab("manage")}
          >
            管理
          </div>
        </div>
        <div className="gt-actions">
          <button className="gt-danger" onClick={clearAll}>
            清空
          </button>
          <button className="gt-primary" onClick={exportGraphicsJson}>
            导出JSON
          </button>
          <button className="gt-primary" onClick={exportGeoJSON}>
            导出GeoJSON
          </button>
        </div>
      </div>
      <div className="gt-body">
        {tab === "draw" ? (
          <div className="gt-toolbar">
            {drawButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => triggerDraw(btn.type as any)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="gt-manage-tools">
              <input
                className="gt-search"
                placeholder="搜索名称或ID"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <label className="gt-realtime">
                <input
                  type="checkbox"
                  checked={realtime}
                  onChange={(e) => setRealtime(e.target.checked)}
                />{" "}
                实时应用样式
              </label>
            </div>
            {items.filter((i) => {
              const key = (i.name || "") + " " + i.id;
              return key.toLowerCase().includes(filter.toLowerCase());
            }).length === 0 ? (
              <div className="gt-empty">暂无标绘</div>
            ) : (
              <table className="gt-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>ID</th>
                    <th>名称</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((i) => {
                      const key = (i.name || "") + " " + i.id;
                      return key.toLowerCase().includes(filter.toLowerCase());
                    })
                    .map((item, index) => (
                      <tr
                        key={item.id}
                        className={
                          selectedId === item.id ? "gt-row-selected" : ""
                        }
                      >
                        <td>{index + 1}</td>
                        <td>
                          <div className="gt-ellipsis" title={item.id}>{item.id}</div>
                        </td>
                        <td>{item.name}</td>
                        <td>
                          <div className="gt-inline-actions">
                            <button onClick={() => loadStyle(item.id)}>编辑</button>
                            <button onClick={() => removeOne(item.id)}>删除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            {selectedId && (
              <div className="gt-editor">
                {/* 重命名 */}
                <div className="gt-editor-row">
                  <div className="gt-editor-col">
                    <label>重命名</label>
                    <input
                      type="text"
                      value={rename}
                      onChange={(e) => setRename(e.target.value)}
                    />
                    <button onClick={applyRename}>保存名称</button>
                  </div>
                </div>
                {/* 线颜色 */}
                <div className="gt-editor-row">
                  <div className="gt-editor-col">
                    <label>线颜色/外边框</label>
                    <input
                      type="color"
                      value={form.strokeColor}
                      onChange={(e) => {
                        const hex = e.target.value;
                        setForm((p) => ({
                          ...p,
                          strokeColor: hex,
                          outlineColor: hex,
                        }));
                        if (realtime) applyColorPreset(hex);
                      }}
                    />
                  </div>
                </div>
                {/* 线材质 */}
                {selectedGeom === GeometryType.LINE && (
                  <div className="gt-editor-row">
                    <div className="gt-editor-col">
                      <label>线材质</label>
                      <select
                        value={form.strokeMaterialType}
                        onChange={(e) => {
                          const mt = e.target.value as MaterialType;
                          setForm((p) => ({ ...p, strokeMaterialType: mt }));
                          if (realtime) {
                            const core = coreRef?.current;
                            if (core && selectedId) {
                              const inst: any =
                                core.graphicManager.getById(selectedId);
                              inst?.setStyle?.({
                                materialType: mt,
                                color: form.strokeColor,
                                width: form.strokeWidth,
                              });
                            }
                          }
                        }}
                      >
                        <option value={MaterialType.SolidColor}>
                          实线（SolidColor）
                        </option>
                        <option value={MaterialType.PolylineDash}>
                          虚线（PolylineDash）
                        </option>
                        <option value={MaterialType.PolylineArrow}>
                          箭头（PolylineArrow）
                        </option>
                      </select>
                    </div>
                  </div>
                )}
                {/* 外边框材质（面）*/}
                {selectedGeom === GeometryType.POLYGON && (
                  <div className="gt-editor-row">
                    <div className="gt-editor-col">
                      <label>外边框材质</label>
                      <select
                        value={form.outlineMaterialType}
                        onChange={(e) => {
                          const mt = e.target.value as MaterialType;
                          setForm((p) => ({ ...p, outlineMaterialType: mt }));
                          if (realtime) {
                            const core = coreRef?.current;
                            if (core && selectedId) {
                              const inst: any =
                                core.graphicManager.getById(selectedId);
                              inst?.setStyle?.({
                                fill: form.fill,
                                materialType: MaterialType.SolidColor,
                                color: form.fillColor,
                                outline: true,
                                outlineMaterialType: mt,
                                outlineColor:
                                  form.outlineColor || form.strokeColor,
                                outlineWidth:
                                  form.outlineWidth || form.strokeWidth,
                                uniforms: {
                                  color: form.outlineColor || form.strokeColor,
                                },
                              });
                            }
                          }
                        }}
                      >
                        <option value={MaterialType.SolidColor}>
                          实线（SolidColor）
                        </option>
                        <option value={MaterialType.PolylineDash}>
                          虚线（PolylineDash）
                        </option>
                      </select>
                    </div>
                  </div>
                )}
                {/* 线宽 */}
                <div className="gt-editor-row">
                  <div className="gt-editor-col">
                    <label>线宽/外边框粗细</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={
                        selectedGeom === GeometryType.POLYGON
                          ? form.outlineWidth
                          : form.strokeWidth
                      }
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setForm((p) => ({
                          ...p,
                          strokeWidth: v,
                          outlineWidth: v,
                        }));
                        if (realtime) applyWidthPreset(v);
                      }}
                    />
                  </div>
                </div>
                {/* 颜色预设 */}

                {/* 面填充开关与颜色 */}
                {selectedGeom === GeometryType.POLYGON && (
                  <>
                    <div className="gt-editor-row">
                      <div className="gt-editor-col">
                        <label>填充启用</label>
                        <input
                          type="checkbox"
                          checked={form.fill}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setForm((p) => ({ ...p, fill: val }));
                            if (realtime) {
                              const core = coreRef?.current;
                              if (core && selectedId) {
                                const inst: any =
                                  core.graphicManager.getById(selectedId);
                                inst?.setStyle?.({
                                  fill: val,
                                  materialType: MaterialType.SolidColor,
                                  color: form.fillColor,
                                  outline: true,
                                  outlineMaterialType: form.outlineMaterialType,
                                  outlineColor: form.outlineColor,
                                  outlineWidth: form.outlineWidth,
                                  uniforms: { color: form.outlineColor },
                                });
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="gt-editor-row">
                      <div className="gt-editor-col">
                        <label>填充颜色</label>
                        <input
                          type="color"
                          value={form.fillColor}
                          onChange={(e) => {
                            const hex = e.target.value;
                            setForm((p) => ({ ...p, fillColor: hex }));
                            if (realtime) {
                              const core = coreRef?.current;
                              if (core && selectedId) {
                                const inst: any =
                                  core.graphicManager.getById(selectedId);
                                inst?.setStyle?.({
                                  fill: form.fill,
                                  materialType: MaterialType.SolidColor,
                                  color: hex,
                                  outline: true,
                                  outlineMaterialType: form.outlineMaterialType,
                                  outlineColor: form.outlineColor,
                                  outlineWidth: form.outlineWidth,
                                  uniforms: { color: form.outlineColor },
                                });
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="gt-editor-actions">
                  <button className="gt-primary" onClick={applyStyle}>
                    应用样式
                  </button>
                  <button className="gt-danger" onClick={resetSelection}>
                    取消选择
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphicTools;
