/*
 * 图层管理面板：对齐 Engine LayerManager 的图层记录
 */
import "./index.css";
import React, { FC, ReactNode, RefObject, useMemo, useReducer, useState } from "react";
import { AbstractCore, CoreType, Layer, LayerItem, LayerType } from "@xh-gis/engine";

type Props = {
  coreRef?: RefObject<AbstractCore<CoreType>>;
};

type UiLayerItem = {
  id: string;
  name: string;
  type: LayerType;
  typeLabel: string;
  visible: boolean;
  pid?: string;
  kind?: "layer" | "graphic";
};

type PanelState = {
  search: string;
  autoRefresh: boolean;
  collapsedGroups: Record<string, boolean>;
  typeFilter: Record<LayerType, boolean>;
  filterOpen: boolean;
};

// 统一的空类型筛选映射，避免顺序依赖与类型转换警告
const EMPTY_TYPE_FILTER: Record<LayerType, boolean> = {
  [LayerType.ENTITY]: false,
  [LayerType.CUSTOM_DATASOURCE]: false,
  [LayerType.CZML_DATASOURCE]: false,
  [LayerType.GEOJSON_DATASOURCE]: false,
  [LayerType.KML_DATASOURCE]: false,
  [LayerType.IMAGERY]: false,
  [LayerType.PRIMITIVE]: false,
  [LayerType.PRIMITIVE_COLLECTION]: false,
  [LayerType.TERRAIN]: false,
};

const defaultState: PanelState = {
  search: "",
  autoRefresh: true,
  collapsedGroups: {},
  typeFilter: { ...EMPTY_TYPE_FILTER },
  filterOpen: false,
};

type Action =
  | { type: "search"; payload: string }
  | { type: "autoRefresh"; payload: boolean }
  | { type: "toggleGroup"; payload: { pid: string } }
  | { type: "resetCollapse" }
  | { type: "toggleType"; payload: { layerType: LayerType } }
  | { type: "resetTypeFilter" }
  | { type: "toggleFilterOpen" };

function reducer(state: PanelState, action: Action): PanelState {
  switch (action.type) {
    case "search":
      return { ...state, search: action.payload };
    case "autoRefresh":
      return { ...state, autoRefresh: action.payload };
    case "toggleGroup": {
      const { pid } = action.payload;
      const prev = state.collapsedGroups[pid];
      return { ...state, collapsedGroups: { ...state.collapsedGroups, [pid]: !prev } };
    }
    case "resetCollapse":
      return { ...state, collapsedGroups: {} };
    case "toggleType": {
      const { layerType } = action.payload;
      const prev = state.typeFilter[layerType] ?? false;
      return { ...state, typeFilter: { ...state.typeFilter, [layerType]: !prev } };
    }
    case "resetTypeFilter": {
      return { ...state, typeFilter: { ...EMPTY_TYPE_FILTER } };
    }
    case "toggleFilterOpen":
      return { ...state, filterOpen: !state.filterOpen };
    default:
      return state;
  }
}

const TYPE_LABEL: Record<LayerType, string> = {
  [LayerType.ENTITY]: "实体",
  [LayerType.CUSTOM_DATASOURCE]: "数据源(Custom)",
  [LayerType.CZML_DATASOURCE]: "数据源(CZML)",
  [LayerType.GEOJSON_DATASOURCE]: "数据源(GeoJSON)",
  [LayerType.KML_DATASOURCE]: "数据源(KML)",
  [LayerType.IMAGERY]: "影像",
  [LayerType.PRIMITIVE]: "图元",
  [LayerType.PRIMITIVE_COLLECTION]: "图元集",
  [LayerType.TERRAIN]: "地形",
};

function getRecordName(record: Layer<LayerItem>): string {
  // 暂无统一命名字段，先用 id 显示；后续可拓展从 item 或元数据读取
  return record.id;
}

function adaptRecords(records: Array<Layer<LayerItem>>): UiLayerItem[] {
  return records.map((rec) => {
    // 通过类型判断可见性读取方式；统一抽象到 LayerManager.setLayerVisible 进行操作
    let visible = true;
    try {
      switch (rec.type) {
        case LayerType.ENTITY:
        case LayerType.PRIMITIVE:
        case LayerType.PRIMITIVE_COLLECTION:
          visible = !!(rec.item as any)?.show;
          break;
        case LayerType.CUSTOM_DATASOURCE:
        case LayerType.CZML_DATASOURCE:
        case LayerType.GEOJSON_DATASOURCE:
        case LayerType.KML_DATASOURCE:
          visible = !!(rec.item as any)?.show;
          break;
        case LayerType.IMAGERY:
          visible = !!(rec.item as any)?.show;
          break;
        case LayerType.TERRAIN:
          // 地形的“可见性”取决于是否被当前 viewer.scene.terrainProvider 使用；此处简单认为 true
          visible = true;
          break;
        default:
          visible = true;
      }
    } catch {}

    const isGraphic = rec.pid === "标绘";
    return {
      id: rec.id,
      name: getRecordName(rec),
      type: rec.type,
      typeLabel: TYPE_LABEL[rec.type] ?? String(rec.type),
      visible,
      pid: rec.pid,
      kind: isGraphic ? "graphic" : "layer",
    };
  });
}

const LayersPanel: FC<Props> = ({ coreRef }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [revision, setRevision] = useState(0); // 手动刷新触发因子
  const [attached, setAttached] = useState(false);
  const handleLmChange = React.useCallback(() => setRevision((r) => r + 1), []);
  // 记录当前绑定的 LayerManager 实例与解绑函数，用于当实例变化时重新绑定
  const boundLmRef = React.useRef<any>(null);
  const unbindRef = React.useRef<(() => void) | null>(null);

  const layerItems = useMemo<UiLayerItem[]>(() => {
    const core = coreRef?.current;
    if (!core) return [];
    const records = core.layerManager.listAll();
    let items = adaptRecords(records);
    const term = state.search.trim();
    if (term) {
      items = items.filter((it) => it.name.includes(term) || it.id.includes(term));
    }
    const selectedTypes: LayerType[] = [];
    for (const [k, v] of Object.entries(state.typeFilter)) {
      if (v) selectedTypes.push(k as LayerType);
    }
    if (selectedTypes.length > 0) {
      items = items.filter((it) => selectedTypes.includes(it.type));
    }
    return items;
  }, [coreRef?.current, state.search, state.typeFilter, revision]);

  const grouped = useMemo(() => {
    const groups: Record<string, UiLayerItem[]> = {};
    const defaultKey = "未分组";
    for (const it of layerItems) {
      const key = it.pid || defaultKey;
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    }
    return groups;
  }, [layerItems]);

  const handleToggleVisible = (it: UiLayerItem) => {
    const core = coreRef?.current;
    if (!core) return;
    if (it.kind === "graphic") {
      // 标绘实体直接控制 entity.show
      const graphic = core.graphicManager.getById?.(it.id);
      const entity = (graphic as any)?.entity ?? core.viewer.entities.getById(it.id);
      if (entity) entity.show = !it.visible;
    } else {
      core.layerManager.setLayerVisible(it.id, !it.visible);
    }
    // 触发 UI 刷新（简单策略）
    setRevision((r) => r + 1);
  };

  const handleRemove = (it: UiLayerItem) => {
    const core = coreRef?.current;
    if (!core) return;
    if (it.kind === "graphic") {
      core.graphicManager.removeById(it.id);
    } else {
      core.layerManager.removeById(it.id, true);
    }
    setRevision((r) => r + 1);
  };

  const handleGroupToggle = (pid: string) => {
    dispatch({ type: "toggleGroup", payload: { pid } });
  };

  // 订阅 LayerManager 的增删与显隐事件；若 LayerManager 实例发生变化，自动重绑
  React.useEffect(() => {
    let disposed = false;

    const bindToLm = (lm: any) => {
      // 解绑之前绑定的实例
      if (unbindRef.current) {
        try { unbindRef.current(); } catch {}
        unbindRef.current = null;
      }
      // 绑定新的实例
      if (lm && typeof lm.on === "function") {
        lm.on("added", handleLmChange);
        lm.on("removed", handleLmChange);
        lm.on("visibleChanged", handleLmChange);
        lm.on("collectionChanged", handleLmChange);
        lm.on("sizeChanged", handleLmChange);
        lm.on("cleared", handleLmChange);
        boundLmRef.current = lm;
        setAttached(true);
        // 提供统一解绑逻辑
        unbindRef.current = () => {
          lm?.off?.("added", handleLmChange);
          lm?.off?.("removed", handleLmChange);
          lm?.off?.("visibleChanged", handleLmChange);
          lm?.off?.("collectionChanged", handleLmChange);
          lm?.off?.("sizeChanged", handleLmChange);
          lm?.off?.("cleared", handleLmChange);
          boundLmRef.current = null;
          setAttached(false);
        };
      }
    };

    const attachOrRebind = () => {
      if (disposed) return;
      const core = coreRef?.current;
      if (!core) return;
      const lm: any = core.layerManager as any;
      if (!lm) return;
      // 若尚未绑定，或实例已变化，则执行重绑
      if (!boundLmRef.current || boundLmRef.current !== lm) {
        bindToLm(lm);
        // 重绑后主动刷新一次 UI
        setRevision((r) => r + 1);
      }
    };

    // 立即尝试一次，然后以小间隔轮询，保证在 core 就绪或 lm 实例更换时能及时重绑
    attachOrRebind();
    const tid = window.setInterval(attachOrRebind, 250);

    return () => {
      disposed = true;
      window.clearInterval(tid);
      // 统一解绑
      if (unbindRef.current) {
        try { unbindRef.current(); } catch {}
        unbindRef.current = null;
      }
    };
  }, [coreRef, handleLmChange]);

  const headerTools: ReactNode = (
    <div className="lp-tools">
      <input
        className="lp-search"
        placeholder="搜索图层..."
        value={state.search}
        onChange={(e) => dispatch({ type: "search", payload: e.target.value })}
      />
      <button
        className="lp-button"
        onClick={() => dispatch({ type: "toggleFilterOpen" })}
        aria-expanded={state.filterOpen}
        aria-controls="lp-filter"
      >
        {state.filterOpen ? "收起筛选" : "更多筛选"}
      </button>
    </div>
  );

  return (
    <div className="xh-gis-layers-panel">
      <div className="lp-header">
        <div className="lp-title">图层管理</div>
        {headerTools}
      </div>
      {state.filterOpen && (
      <div className="lp-filter" id="lp-filter">
        {Object.entries(TYPE_LABEL).map(([typeKey, label]) => {
          const type = typeKey as LayerType;
          const checked = !!state.typeFilter[type];
          return (
            <label key={typeKey} className="lp-filter-item">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => dispatch({ type: "toggleType", payload: { layerType: type } })}
                aria-label={`筛选类型-${label}`}
              />
              <span>{label}</span>
            </label>
          );
        })}
        <button className="lp-button" onClick={() => dispatch({ type: "resetTypeFilter" })}>清空</button>
      </div>
      )}
      <div className="lp-body">
        {Object.keys(grouped).length === 0 ? (
          <div className="lp-empty">暂无图层记录</div>
        ) : (
          Object.entries(grouped).map(([pid, items]) => {
            const collapsed = !!state.collapsedGroups[pid];
            return (
              <div className="lp-group" key={pid}>
                <div className="lp-group-header">
                  <div className="lp-group-title">{pid}</div>
                  <div className="lp-group-tools">
                    <button className="lp-button" onClick={() => handleGroupToggle(pid)}>
                      {collapsed ? "展开" : "收起"}
                    </button>
                    <span style={{ color: "var(--lp-muted)" }}>共 {items.length} 条</span>
                  </div>
                </div>
                {!collapsed && (
                  <div className="lp-items">
                    {items.map((it) => (
                      <div className="lp-item" key={it.id}>
                        <input
                          type="checkbox"
                          checked={it.visible}
                          onChange={() => handleToggleVisible(it)}
                          aria-label={`显示隐藏-${it.name}`}
                        />
                        <div className="lp-item-name">{it.name}</div>
                        <div className="lp-item-type">{it.typeLabel}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="lp-button" onClick={() => handleRemove(it)}>删除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LayersPanel;