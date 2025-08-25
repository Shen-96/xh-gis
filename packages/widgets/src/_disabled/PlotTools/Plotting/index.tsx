/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2022-10-08 10:06:54
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-07-21 18:31:23
 */
import "./index.css";
import { sStorage } from "@/lib-client/StorageStore";
import { CoreType, GraphicType, SymbolType } from "@/lib-client/xh-gis";
import {
  FC,
  memo,
  PropsWithoutRef,
  RefObject,
  useCallback,
  useMemo,
} from "react";
import BtnPanel, { BtnPanelDataItem } from "../../BtnPanel";
import AbstractCore from "@/lib-client/xh-gis/Core/AbstractCore";

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

const Plotting: FC<Props> = ({ coreRef, onClose }) => {
  const constant = useMemo(
    () => ({
      menuList: [
        // {
        //   label: "点",
        //   icon: "icon-dianbiaohui",
        //   onClick: () => onClick(GraphicType.POINT),
        // },
        // {
        //   label: "标牌",
        //   icon: "icon-dianbiaohui",
        //   onClick: () => onClick(GraphicType.BILLBOARD),
        // },
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
        // {
        //   label: "腰型",
        //   icon: "icon-sector",
        //   onClick: () => onClick(GraphicType.KIDNEY_SHAPED),
        // },
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
        // {
        //   label: "直线带尾箭头",
        //   icon: "icon-a-gongjijiantoupingweibiaohui",
        //   onClick: () => onClick(GraphicType.STRAIGHT_TAIL_ARROW),
        // },
        // {
        //   label: "直线带尾直角箭头",
        //   icon: "icon-a-gongjijiantoupingweibiaohui",
        //   onClick: () => onClick(GraphicType.STRAIGHT_TAIL_RIGHT_ARROW),
        // },
        // {
        //   label: "自定义平尾箭头",
        //   icon: "icon-jiantoubiaohui",
        //   onClick: () => onClick(GraphicType.FREE_FLAT_TAIL_ARROW),
        // },
        // {
        //   label: "自定义燕尾箭头",
        //   icon: "icon-jiantoubiaohui",
        //   onClick: () => onClick(GraphicType.FREE_SWALLOW_TAIL_ARROW),
        // },
        // {
        //   label: "固定平尾箭头",
        //   icon: "icon-jiantoubiaohui",
        //   onClick: () => onClick(GraphicType.FIXED_FLAT_TAIL_ARROW),
        // },
        // {
        //   label: "固定燕尾箭头",
        //   icon: "icon-jiantoubiaohui",
        //   onClick: () => onClick(GraphicType.FIXED_SWALLOW_TAIL_ARROW),
        // },
        // {
        //   label: "钳击箭头",
        //   icon: "icon-jiantoubiaohui",
        //   onClick: () => onClick(GraphicType.DOUBLE_ARROW),
        // },
        // {
        //   label: SymbolType["部队占领（集结）地域"],
        //   icon: "icon-a-gongjijiantoupingweibiaohui",
        //   onClick: () => onClick(SymbolType["部队占领（集结）地域"]),
        // },
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
        // {
        //   label: SymbolType.本级地面作战主攻方向,
        //   icon: "icon-a-gongjijiantoupingweibiaohui",
        //   onClick: () => onClick(SymbolType.本级地面作战主攻方向),
        // },
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
        //   {
        //     label: "燃烧",
        //     icon: "jijiedibiaohui",
        //     onClick: () => onParticleClick(ParticleType.BURNING),
        //   },
        //   {
        //     label: "烟雾",
        //     icon: "jijiedibiaohui",
        //     onClick: () => onParticleClick(ParticleType.SMOKE),
        //   },
      ],
      mainBtn: {
        label: "清除标绘",
        icon: "icon-qingchu",
        onClick: () => onClick("CLEAR_ALL"),
      },
      plotRecord: "plot_record_session",
    }),
    []
  );

  const onClick = useCallback((type: any) => {
    if (!coreRef?.current) return;

    const xgCore = coreRef.current;

    switch (type) {
      case "CLEAR_ALL":
        {
          const prevRecord = sStorage.get<Array<string>>(constant.plotRecord);

          prevRecord?.forEach((id) => {
            xgCore.graphicManager.removeById(id);
          });

          sStorage.set(constant.plotRecord, []);
        }
        break;
      default:
        xgCore?.graphicManager.setDrawEventHandler(type, (_pos, symbol) => {
          const prevRecord = sStorage.get<Array<string>>(
            constant.plotRecord,
            []
          );

          prevRecord?.push(symbol.id);
          sStorage.set(constant.plotRecord, prevRecord);

          // console.log(prevRecord);
        });

        break;
    }
  }, []);
  // onParticleClick = (type: ParticleType) => {
  //   const xgEarth = window.xgEarth;
  //   if (!xgEarth) return;

  //   xgEarth.scene.globe.depthTestAgainstTerrain = true;

  //   xgEarth.mouseHandlerManager.addLeftMouseClickHandler(
  //     "sadfagadgagada",
  //     (res) => {
  //       const { screenPosition } = res,
  //         car3 = screenPosition && xgEarth.getSceneCartesian3(screenPosition);

  //       const particle =
  //         car3 && xgEarth.particleManager.create("121212121", type, car3);

  //       particle && xgEarth.particleManager.add(particle);

  //       xgEarth.mouseHandlerManager.destroyHandlerById("sadfagadgagada");
  //     }
  //   );
  // };

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

export default memo(Plotting);
