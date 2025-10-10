/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-04-15 06:13:52
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-05-20 14:30:30
 */
import "./index.css";
import React, { ReactNode, RefObject, useMemo, useReducer } from "react";
import { AbstractCore, CoreType } from "@xh-gis/engine";
import { PlottingToolbar, PlottingList } from "../GraphicsTools";

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

export default function Toolbar({
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
      },
      {
        key: "graphic",
        icon: <MdOutlineScatterPlotIcon />,
        label: "图形",
        panel: () => (
          <>
            <PlottingToolbar coreRef={coreRef} />
            <PlottingList coreRef={coreRef} />
          </>
        ),
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
            onClick={() =>
              dispatch({ type: button.key, payload: !state[button.key] })
            }
          />
        ))}
      </div>
      {toolbarButtons.map(
        (button) =>
          button.panel &&
          state[button.key] && <button.panel key={"panel_" + button.key} />
      )}
    </>
  );
}

const ToolbarButton = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <div className="xh-gis-viewer-toolbar" onClick={onClick} title={label}>
      {icon}
    </div>
  );
};
