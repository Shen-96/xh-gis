/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2025-04-15 06:13:52
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-11-27 15:52:55
 */
import "./index.css";
import React, { ReactNode, RefObject, useMemo, useReducer } from "react";
import { AbstractCore, CoreType } from "@xh-gis/engine";
import GraphicTools from "../GraphicsTools";
import LayersPanel from "../LayersPanel";

// 使用Unicode字符替代react-icons
const IoLayersSharpIcon = () => <span>🗂️</span>;
const MdOutlineScatterPlotIcon = () => <span>📍</span>;

type Action = { type: keyof InitialState; payload: boolean };

type InitialState = {
  layer: boolean;
  graphic: boolean;
  measure: boolean;
  attribute: boolean;
  zoom: boolean;
  pan: boolean;
};

const defaultState: InitialState = {
  layer: false,
  graphic: false,
  measure: false,
  attribute: false,
  zoom: false,
  pan: false,
};

export type ToolBarProps = {
  coreRef?: RefObject<AbstractCore<CoreType>>;
  initialState?: InitialState;
  onClicked?: (key: string, value: boolean) => void;
};

function reducer(state: InitialState, action: Action) {
  switch (action.type) {
    case "layer":
      return { ...state, layer: action.payload };
    case "graphic":
      return { ...state, graphic: action.payload };
    case "measure":
      return { ...state, measure: action.payload };
    case "attribute":
      return { ...state, attribute: action.payload };
    case "zoom":
      return { ...state, zoom: action.payload };
    case "pan":
      return { ...state, pan: action.payload };
    default:
      throw new Error();
  }
}

export default function Toolbox({
  coreRef,
  initialState = defaultState,
}: ToolBarProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toolbarButtons = useMemo(() => {
    const buttons: Array<{
      key: keyof InitialState;
      icon: ReactNode;
      label: string;
      panel?: () => ReactNode;
    }> = [
      {
        key: "layer",
        icon: <IoLayersSharpIcon />,
        label: "图层",
        panel: () => <LayersPanel coreRef={coreRef} />,
      },
      {
        key: "graphic",
        icon: <MdOutlineScatterPlotIcon />,
        label: "图形",
        panel: () => <GraphicTools coreRef={coreRef} />,
      },
    ];

    return buttons;
  }, [coreRef]);

  return (
    <>
      <div className="xh-gis-toolbar">
        {toolbarButtons.map((button) => (
          <ToolbarButton
            key={button.key}
            icon={button.icon}
            label={button.label}
            active={state[button.key]}
            onClick={() =>
              dispatch({ type: button.key, payload: !state[button.key] })
            }
            onKeyPress={() =>
              dispatch({ type: button.key, payload: !state[button.key] })
            }
          />
        ))}
      </div>
      {toolbarButtons.map((button) => {
        if (!button.panel) return null;
        if (!state[button.key]) return null;
        // 正确调用 panel 函数以返回 React 节点，避免把函数对象/元素对象当作子节点
        const PanelNode = button.panel();
        return (
          <React.Fragment key={"panel_" + button.key}>
            {PanelNode}
          </React.Fragment>
        );
      })}
    </>
  );
}

const ToolbarButton = ({
  icon,
  label,
  active,
  onClick,
  onKeyPress,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  onKeyPress?: () => void;
}) => {
  return (
    <div
      className={`xh-gis-viewer-toolbar${active ? " active" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onKeyPress?.();
        }
      }}
      role="button"
      aria-pressed={!!active}
      tabIndex={0}
      title={label}
    >
      {icon}
    </div>
  );
};
