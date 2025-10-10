/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2022-10-08 10:06:54
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-07-21 18:31:23
 */
import "./index.css";
import { CoreType, GraphicType, SymbolType } from "@xh-gis/engine";
import {
  FC,
  memo,
  PropsWithoutRef,
  RefObject,
  useCallback,
  useMemo,
} from "react";
import { AbstractCore } from "@xh-gis/engine";

// 模拟sStorage功能
const sStorage = {
  get: <T,>(key: string, defaultValue?: T): T | undefined => {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  },
  set: (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

type BtnPanelDataItem = {
  label: string;
  icon: string;
  onClick: () => void;
};

type Constant = {
  menuList: Array<BtnPanelDataItem>;
  mainBtn: BtnPanelDataItem;
  plotRecord: string;
};

type State = {
  graphicType?: SymbolType;
};

type Props = PropsWithoutRef<{
  coreRef?: RefObject<AbstractCore<CoreType>>;
  onClose?: () => void;
}>;

// 简化版BtnPanel组件
const BtnPanel: FC<{
  title: string;
  data: BtnPanelDataItem[];
  mainBtn: BtnPanelDataItem;
  onClose?: () => void;
}> = ({ title, data, mainBtn, onClose }) => {
  return (
    <div className="btn-panel">
      <div className="btn-panel-header">
        <span>{title}</span>
        {onClose && <button onClick={onClose}>×</button>}
      </div>
      <div className="btn-panel-content">
        {data.map((item, index) => (
          <button key={index} onClick={item.onClick}>
            <span className={item.icon}></span>
            {item.label}
          </button>
        ))}
        <button onClick={mainBtn.onClick}>
          <span className={mainBtn.icon}></span>
          {mainBtn.label}
        </button>
      </div>
    </div>
  );
};

const PlottingToolbar: FC<Props> = ({ coreRef, onClose }) => {
  const onClick = useCallback((type: any) => {
    if (!coreRef?.current) return;

    const xgCore = coreRef.current;

    switch (type) {
      case "CLEAR_ALL":
        {
          const prevRecord = sStorage.get<Array<string>>("plot_record_session");

          prevRecord?.forEach((id: string) => {
            xgCore.graphicManager.removeById(id);
          });

          sStorage.set("plot_record_session", []);
        }
        break;
      default:
        xgCore?.graphicManager.setDrawEventHandler(type, (_pos: any, symbol: any) => {
          const prevRecord = sStorage.get<Array<string>>(
            "plot_record_session",
            []
          );

          prevRecord?.push(symbol.id);
          sStorage.set("plot_record_session", prevRecord);
        });

        break;
    }
  }, [coreRef]);

  const constant: Constant = useMemo(() => ({
    menuList: [
      {
        label: "自由线",
        icon: "icon-xianbiaohui",
        onClick: () => onClick(GraphicType.FREEHAND_LINE),
      },
      {
        label: "曲线",
        icon: "icon-quxianbiaohui",
        onClick: () => onClick(GraphicType.CURVE),
      },
      {
        label: "圆形",
        icon: "icon-yuanxing",
        onClick: () => onClick(GraphicType.CIRCLE),
      },
      {
        label: "扇形",
        icon: "icon-sector",
        onClick: () => onClick(GraphicType.SECTOR),
      },
      {
        label: "椭圆",
        icon: "icon-sector",
        onClick: () => onClick(GraphicType.ELLIPSE),
      },
      {
        label: "矩形",
        icon: "icon-mianbiaohui",
        onClick: () => onClick(GraphicType.RECTANGLE),
      },
      {
        label: "多边形",
        icon: "icon-duobianxing",
        onClick: () => onClick(GraphicType.POLYGON),
      },
      {
        label: "自由面",
        icon: "icon-duobianxing",
        onClick: () => onClick(GraphicType.FREEHAND_POLYGON),
      },
      {
        label: "直线箭头",
        icon: "icon-zhijiantou",
        onClick: () => onClick(GraphicType.STRAIGHT_ARROW),
      },
      {
        label: "曲线箭头",
        icon: "icon-jiantoubiaohui",
        onClick: () => onClick(GraphicType.CURVE_ARROW),
      },
      {
        label: SymbolType.战役突击方向,
        icon: "icon-a-gongjijiantoupingweibiaohui",
        onClick: () => onClick(SymbolType.战役突击方向),
      },
      {
        label: SymbolType.战役反突击方向,
        icon: "icon-a-gongjijiantoupingweibiaohui",
        onClick: () => onClick(SymbolType.战役反突击方向),
      },
      {
        label: SymbolType.联合火力打击方向,
        icon: "icon-a-gongjijiantoupingweibiaohui",
        onClick: () => onClick(SymbolType.联合火力打击方向),
      },
      {
        label: SymbolType.精确火力打击方向,
        icon: "icon-a-gongjijiantoupingweibiaohui",
        onClick: () => onClick(SymbolType.精确火力打击方向),
      },
      {
        label: SymbolType.进攻方向,
        icon: "icon-a-gongjijiantoupingweibiaohui",
        onClick: () => onClick(SymbolType.进攻方向),
      },
      {
        label: SymbolType["进攻方向（直线/折线）"],
        icon: "icon-a-gongjijiantoupingweibiaohui",
        onClick: () => onClick(SymbolType["进攻方向（直线/折线）"]),
      },
      {
        label: SymbolType.反冲击方向,
        icon: "icon-a-gongjijiantoupingweibiaohui",
        onClick: () => onClick(SymbolType.反冲击方向),
      },
      {
        label: SymbolType.不标示突破地段的作战行动,
        icon: "icon-a-jiantoubiaohui",
        onClick: () => onClick(SymbolType.不标示突破地段的作战行动),
      },
    ],
    mainBtn: {
      label: "清除标绘",
      icon: "icon-qingchu",
      onClick: () => onClick("CLEAR_ALL"),
    },
    plotRecord: "plot_record_session",
  }), [onClick]);

  return (
    <div className="xh-gis-container-widget-plot-tools">
      <BtnPanel
        title="作战标绘"
        data={constant.menuList}
        mainBtn={constant.mainBtn}
        onClose={onClose}
      />
    </div>
  );
};

export default memo(PlottingToolbar);