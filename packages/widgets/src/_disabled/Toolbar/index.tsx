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
import { IoLayersSharp } from "react-icons/io5";
import { MdOutlineScatterPlot } from "react-icons/md";
import Plotting from "../PlotTools/Plotting";
import PlotList from "../PlotTools/PlotList";
import AbstractCore from "@/lib-client/xh-gis/Core/AbstractCore";
import { CoreType } from "@/lib-client/xh-gis";

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

export type ToolbarProps = {
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
}: ToolbarProps) {
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
        icon: <IoLayersSharp />,
        label: "图层",
      },
      {
        key: "graphic",
        icon: <MdOutlineScatterPlot />,
        label: "图形",
        panel: () => (
          <>
            <Plotting coreRef={coreRef} />
            <PlotList coreRef={coreRef} />
          </>
        ),
      },
    ];

    return buttons;
  }, []);

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
