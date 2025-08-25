// /*
//  * @Descripttion: xxx
//  * @Author: EV-申小虎
//  * @version: 1.0.0
//  * @Date: 2023-09-11 11:16:56
//  * @LastEditors: EV-申小虎
//  * @LastEditTime: 2023-10-29 11:11:26
//  */
// import "./index.css";
// import {
//   AbstractGraphic,
//   MaterialType,
//   LabelGraphicOptions,
//   SymbolMergeStyleOptions,
//   SymbolType,
//   XgBillboard,
//   XgBillboardGraphicOptions,
//   XgLabel,
//   XgLineGraphicOptions,
//   XgPoint,
//   XgPointGraphicOptions,
//   XgPolygon,
//   XgPolyline,
//   XgRegionGraphicOptions,
// } from "@/lib-client/xh-gis";
// import { ColorPicker, Input, InputNumber, Select } from "antd";
// import { createGuid } from "cesium";
// import {
//   FC,
//   ReactNode,
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// type Constant = {
//   timer?: NodeJS.Timer;
//   selectedSymbol?: AbstractGraphic;
// };
// type State = {
//   graphicType?: SymbolType;
//   plotStyle?: Partial<SymbolMergeStyleOptions>;
// };

// const EditTool: FC = (props) => {
//   const [state, setState] = useState<State>({});

//   const constant: Constant = {},
//     computeState = {},
//     methods = {
//       changeName: (str: string) => {
//         //   constant.selectedSymbol?.entity.label &&
//         //     (constant.selectedSymbol.label.text = new ConstantProperty(str));
//         constant.selectedSymbol && (constant.selectedSymbol.name = str);
//       },
//       changeLabelColor: (str: string) => {
//         //   constant.selectedSymbol?.entity.label &&
//         //     (constant.selectedSymbol.label.fillColor = new ConstantProperty(
//         //       Color.fromCssColorString(str)
//         //     ));
//         constant.selectedSymbol?.setLabelStyle({
//           material: { fillColor: str },
//         });
//       },
//       changeBillboardScale: (symbol: XgPoint | XgLabel, val: number) => {
//         //   constant.selectedSymbol?.billboard &&
//         //     (constant.selectedSymbol.billboard.scale = new ConstantProperty(
//         //       val
//         //     ));
//         symbol.setBillboardStyle({
//           scale: val,
//         });
//       },
//       changeBillboardImage: (symbol: XgPoint | XgLabel, val: string) => {
//         state.plotStyle?.icon && (state.plotStyle.icon.image = val);
//         //   constant.selectedSymbol?.billboard &&
//         //     (constant.selectedSymbol.billboard.image = new ConstantProperty(
//         //       val
//         //     ));
//         symbol?.setBillboardStyle({
//           image: val,
//         });
//       },
//       changeBgImage: (symbol: XgBillboard, val: string) => {
//         state.plotStyle?.background && (state.plotStyle.background.image = val);
//         //   constant.selectedSymbol?.billboard &&
//         //     (constant.selectedSymbol.billboard.image = new ConstantProperty(
//         //       val
//         //     ));
//         symbol?.setBackgroundStyle({
//           image: val,
//         });
//       },
//       changeBgScale: (symbol: XgBillboard, val: number) => {
//         symbol?.setBackgroundStyle({
//           scale: val,
//         });
//       },
//       changePolylineWidth: (symbol: XgPolyline, val: number) => {
//         //   constant.selectedSymbol?.polyline &&
//         //     (constant.selectedSymbol.polyline.width = new ConstantProperty(
//         //       val
//         //     ));
//         symbol.setLineStyle({ width: val });
//       },
//       changeOutlineWidth: (symbol: XgPolygon, val: number) => {
//         //   constant.selectedSymbol?.polyline &&
//         //     (constant.selectedSymbol.polyline.width = new ConstantProperty(
//         //       val
//         //     ));
//         symbol.setOutlineStyle({ width: val });
//       },
//       changePolylineColor: (symbol: XgPolyline, val: string) => {
//         //   constant.selectedSymbol?.polyline &&
//         //     window.xgIntegrated
//         //       ?.map
//         //       ?.graphicManager.changePolylineColor(
//         //         constant.selectedSymbol.polyline,
//         //         val
//         //       );
//         symbol.setLineStyle({ material: { fillColor: val } });
//       },
//       changeOutlineColor: (symbol: XgPolygon, val: string) => {
//         //   constant.selectedSymbol?.polyline &&
//         //     window.xgIntegrated
//         //       ?.map
//         //       ?.graphicManager.changePolylineColor(
//         //         constant.selectedSymbol.polyline,
//         //         val
//         //       );
//         symbol.setOutlineStyle({ material: { fillColor: val } });
//       },
//       changePolylineType: (symbol: XgPolyline, val: MaterialType) => {
//         //   constant.selectedSymbol?.polyline &&
//         //     window.xgIntegrated
//         //       ?.map
//         //       ?.graphicManager.changePolylineType(
//         //         constant.selectedSymbol.polyline,
//         //         val
//         //       );
//         symbol.setLineStyle({
//           material: { customTexture: { type: val } },
//         });
//       },
//       changeOutlineType: (symbol: XgPolygon, val: MaterialType) => {
//         symbol.setOutlineStyle({
//           material: { customTexture: { type: val } },
//         });
//       },
//       changeRegionFillColor: (symbol: XgPolygon, val: string) => {
//         //   constant.selectedSymbol?.ellipse &&
//         //     (constant.selectedSymbol.ellipse.material =
//         //       new ColorMaterialProperty(Color.fromCssColorString(val)));
//         //   constant.selectedSymbol?.polygon &&
//         //     (constant.selectedSymbol.polygon.material =
//         //       new ColorMaterialProperty(Color.fromCssColorString(val)));

//         symbol.setRegionStyle({ material: { fillColor: val } });
//       },
//       // changeRectangleFillColor: (val: string) => {
//       //   constant.selectedSymbol?.rectangle &&
//       //     (constant.selectedSymbol.rectangle.material =
//       //       new ColorMaterialProperty(Color.fromCssColorString(val)));
//       // },
//       // changePolygonFillColor: (val: string) => {
//       //   constant.selectedSymbol?.polygon &&
//       //     (constant.selectedSymbol.polygon.material =
//       //       new ColorMaterialProperty(Color.fromCssColorString(val)));
//       // },
//     },
//     renderMethods = {
//       labelEditor: (label?: Omit<LabelGraphicOptions, "position">) => (
//         <div className={"xg-plot-label editor-item"}>
//           <span className={"title margin"}>名称</span>
//           <div className={"value margin text"}>
//             <NInput
//               key={createGuid()}
//               size={"small"}
//               defaultValue={constant.selectedSymbol?.name}
//               onUpdateValue={(str) => methods.changeName(str)}
//             />
//           </div>
//           <div className={"value color"}>
//             <NColorPicker
//               className={"editor"}
//               key={createGuid()}
//               renderLabel={() => null}
//               actions={["confirm"]}
//               size={"small"}
//               modes={["rgb"]}
//               defaultValue={label?.material?.fillColor}
//               onConfirm={(val) => methods.changeLabelColor(val)}
//             />
//           </div>
//         </div>
//       ),
//       billboardScaleEditor: (scale?: number) => (
//         <div className={"xg-plot-billboard-scale editor-item"}>
//           <span className={"title margin"}>大小</span>
//           <div className={"value margin number"}>
//             <NInputNumber
//               key={createGuid()}
//               size={"small"}
//               defaultValue={scale ?? 1}
//               step={0.5}
//               min={0.1}
//               max={10}
//               onUpdateValue={(val) =>
//                 val &&
//                 constant.selectedSymbol &&
//                 methods.changeBillboardScale(
//                   constant.selectedSymbol as XgPoint,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       backgroundScaleEditor: (scale?: number) => (
//         <div className={"xg-plot-billboard-scale editor-item"}>
//           <span className={"title margin"}>大小</span>
//           <div className={"value margin number"}>
//             <NInputNumber
//               key={createGuid()}
//               size={"small"}
//               defaultValue={scale ?? 1}
//               step={0.5}
//               min={0.1}
//               max={10}
//               onUpdateValue={(val) =>
//                 val &&
//                 constant.selectedSymbol &&
//                 methods.changeBgScale(
//                   constant.selectedSymbol as XgBillboard,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       billboardImageEditor: (
//         title = "图标",
//         optionalImageList?: Array<{ label: string; image: string }>,
//         image?: string
//       ) => (
//         <div className={"xg-plot-billboard-image editor-item"}>
//           <span className={"title margin"}>{title}</span>
//           <div className={"value image-list"}>
//             {optionalImageList?.map((item) => (
//               <span
//                 className={`image-item${image == item.image ? " checked" : ""}`}
//                 title={item.label}
//                 style={{ backgroundImage: `url("${item.image}")` }}
//                 onClick={() =>
//                   constant.selectedSymbol &&
//                   methods.changeBillboardImage(
//                     constant.selectedSymbol as XgPoint,
//                     item.image
//                   )
//                 }
//               ></span>
//             )) ?? null}
//           </div>
//         </div>
//       ),
//       backgroundImageEditor: (
//         title = "图标",
//         optionalImageList?: Array<{ label: string; image: string }>,
//         image?: string
//       ) => (
//         <div className={"xg-plot-billboard-image editor-item"}>
//           <span className={"title margin"}>{title}</span>
//           <div className={"value image-list"}>
//             {optionalImageList?.map((item) => (
//               <span
//                 className={`image-item${image == item.image ? " checked" : ""}`}
//                 title={item.label}
//                 style={{ backgroundImage: `url("${item.image}")` }}
//                 onClick={() =>
//                   constant.selectedSymbol &&
//                   methods.changeBgImage(
//                     constant.selectedSymbol as XgBillboard,
//                     item.image
//                   )
//                 }
//               ></span>
//             )) ?? null}
//           </div>
//         </div>
//       ),
//       polylineWidthEditor: (width?: number) => (
//         <div className={"xg-plot-ployline-width editor-item"}>
//           <span className={"title margin"}>线宽</span>
//           <div className={"value margin number"}>
//             <NInputNumber
//               key={createGuid()}
//               size={"small"}
//               defaultValue={width ?? 1}
//               step={1}
//               min={1}
//               max={30}
//               onUpdateValue={(val) =>
//                 val &&
//                 constant.selectedSymbol &&
//                 methods.changePolylineWidth(
//                   constant.selectedSymbol as XgPolyline,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       outlineWidthEditor: (width?: number) => (
//         <div className={"xg-plot-ployline-width editor-item"}>
//           <span className={"title margin"}>线宽</span>
//           <div className={"value margin number"}>
//             <NInputNumber
//               key={createGuid()}
//               size={"small"}
//               defaultValue={width ?? 1}
//               step={1}
//               min={1}
//               max={30}
//               onUpdateValue={(val) =>
//                 val &&
//                 constant.selectedSymbol &&
//                 methods.changeOutlineWidth(
//                   constant.selectedSymbol as XgPolygon,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       polylineFillColorEditor: (color?: string) => (
//         <div className={"xg-plot-ployline-color editor-item"}>
//           <span className={"title margin"}>颜色</span>
//           <div className={"value margin color"}>
//             <NColorPicker
//               className={"editor"}
//               key={createGuid()}
//               renderLabel={() => null}
//               actions={["confirm"]}
//               size={"small"}
//               modes={["rgb"]}
//               defaultValue={color}
//               onConfirm={(val) =>
//                 val &&
//                 constant.selectedSymbol &&
//                 methods.changePolylineColor(
//                   constant.selectedSymbol as XgPolyline,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       outlineFillColorEditor: (color?: string) => (
//         <div className={"xg-plot-ployline-color editor-item"}>
//           <span className={"title margin"}>颜色</span>
//           <div className={"value margin color"}>
//             <ColorPicker
//               className={"editor"}
//               key={createGuid()}
//               size={"small"}
//               mode={"single"}
//               defaultValue={color}
//               onChange={(val) =>
//                 constant.selectedSymbol &&
//                 methods.changeOutlineColor(
//                   constant.selectedSymbol as XgPolygon,
//                   val.toCssString()
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       polylineTypeEditor: (type?: string) => (
//         <div className={"xg-plot-ployline-type editor-item"}>
//           <span className={"title margin"}>线型</span>
//           <div className={"value margin"}>
//             <Select
//               key={createGuid()}
//               defaultValue={
//                 MaterialType[type ?? MaterialType.Color]
//               }
//               options={[
//                 {
//                   label: PolylineMaterialTypeMapCHN[MaterialType.Color],
//                   value: MaterialType.Color,
//                 },
//                 {
//                   label:
//                     PolylineMaterialTypeMapCHN[MaterialType.PolylineDash],
//                   value: MaterialType.PolylineDash,
//                 },
//               ]}
//               onChange={(e) =>
//                 constant.selectedSymbol &&
//                 methods.changePolylineType(
//                   constant.selectedSymbol as XgPolyline,
//                   e.target.value as MaterialType
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       outlineTypeEditor: (type?: string) => (
//         <div className={"xg-plot-ployline-type editor-item"}>
//           <span className={"title margin"}>线型</span>
//           <div className={"value margin"}>
//             <NSelect
//               key={createGuid()}
//               defaultValue={
//                 MaterialType[type ?? MaterialType.Color]
//               }
//               options={[
//                 {
//                   label: PolylineMaterialTypeMapCHN[MaterialType.Color],
//                   value: MaterialType.Color,
//                 },
//                 {
//                   label:
//                     PolylineMaterialTypeMapCHN[MaterialType.PolylineDash],
//                   value: MaterialType.PolylineDash,
//                 },
//               ]}
//               onUpdateValue={(val) =>
//                 val &&
//                 constant.selectedSymbol &&
//                 methods.changeOutlineType(
//                   constant.selectedSymbol as XgPolygon,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       regionFillColorEditor: (
//         color?: string
//         //   callback?: (val: string) => void
//       ) => (
//         <div className={"xg-plot-shape-fill editor-item"}>
//           <span className={"title margin"}>填充</span>
//           <div className={"value margin color"}>
//             <NColorPicker
//               className={"editor"}
//               key={createGuid()}
//               renderLabel={() => null}
//               actions={["confirm"]}
//               size={"small"}
//               modes={["rgb"]}
//               defaultValue={color}
//               onConfirm={(val) =>
//                 constant.selectedSymbol &&
//                 methods.changeRegionFillColor(
//                   constant.selectedSymbol as XgPolygon,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       renderPointEditor: (style?: XgPointGraphicOptions) => (
//         <>
//           {renderMethods.labelEditor(style?.label)}
//           {renderMethods.billboardScaleEditor(style?.icon?.scale)}
//           {renderMethods.billboardImageEditor(
//             "图标",
//             window.xgIntegrated?.map?.graphicManager.getPointOptionalIcons(),
//             style?.icon?.image
//           )}
//         </>
//       ),
//       renderBillboardEditor: (style?: XgBillboardGraphicOptions) => (
//         <>
//           {renderMethods.labelEditor(style?.label)}
//           {renderMethods.backgroundScaleEditor(style?.background?.scale)}
//           {renderMethods.backgroundImageEditor(
//             "背景",
//             window.xgIntegrated?.map?.graphicManager.getBillboardOptionalBackgrounds(),
//             style?.background?.image
//           )}
//         </>
//       ),
//       renderLineEditor: (style?: XgLineGraphicOptions) => (
//         <>
//           {renderMethods.labelEditor(style?.label)}
//           {/* <div className={"xg-plot-ployline-type editor-item"}>
//                   <span className={"title margin"}>线型</span>
//                   <div className={"value margin"}>
                      
//                   </div>
//                 </div> */}
//           {renderMethods.polylineTypeEditor(
//             style?.line?.material?.customTexture?.type
//           )}
//           {renderMethods.polylineWidthEditor(style?.line?.width)}
//           {renderMethods.polylineFillColorEditor(
//             style?.line?.material?.fillColor
//           )}
//         </>
//       ),
//       renderRegionEditor: (style?: XgRegionGraphicOptions) => (
//         <>
//           {renderMethods.labelEditor(style?.label)}
//           {/* <div className={"xg-plot-ployline-type editor-item"}>
//                     <span className={"title margin"}>线型</span>
//                     <div className={"value margin"}>
                        
//                     </div>
//                   </div> */}
//           {renderMethods.regionFillColorEditor(
//             style?.region?.material?.fillColor
//             //   methods.changeCircleFillColor
//           )}
//           {renderMethods.outlineTypeEditor(
//             style?.outline?.material?.customTexture?.type
//           )}
//           {renderMethods.outlineWidthEditor(style?.outline?.width)}
//           {renderMethods.outlineFillColorEditor(
//             style?.outline?.material?.fillColor
//           )}
//         </>
//       ),
//       // renderRectangleEditor: (style?: XgRectangleGraphicOptions) => (
//       //   <>
//       //     {renderMethods.labelEditor(style?.label)}
//       //     {/* <div className={"xg-plot-ployline-type editor-item"}>
//       //             <span className={"title margin"}>线型</span>
//       //             <div className={"value margin"}>

//       //             </div>
//       //           </div> */}
//       //     {renderMethods.plotShapeFillColorEditor(
//       //       style?.region?.material?.fillColor
//       //       //   methods.changeRectangleFillColor
//       //     )}
//       //     {renderMethods.outlineTypeEditor(
//       //       style?.outline?.material?.customTexture?.type
//       //     )}
//       //     {renderMethods.outlineWidthEditor(style?.outline?.width)}
//       //     {renderMethods.outlineFillColorEditor(
//       //       style?.outline?.material?.fillColor
//       //     )}
//       //   </>
//       // ),
//       // renderPolygonEditor: (style?: XgPolygonGraphicOptions) => (
//       //   <>
//       //     {renderMethods.labelEditor(style?.label)}
//       //     {/* <div className={"xg-plot-ployline-type editor-item"}>
//       //             <span className={"title margin"}>线型</span>
//       //             <div className={"value margin"}>

//       //             </div>
//       //           </div> */}
//       //     {renderMethods.plotShapeFillColorEditor(
//       //       style?.region?.material?.fillColor
//       //       //   methods.changePolygonFillColor
//       //     )}
//       //     {renderMethods.outlineTypeEditor(
//       //       style?.outline?.material?.customTexture?.type
//       //     )}
//       //     {renderMethods.outlineWidthEditor(style?.outline?.width)}
//       //     {renderMethods.outlineFillColorEditor(
//       //       style?.outline?.material?.fillColor
//       //     )}
//       //   </>
//       // ),
//       // renderArrowEditor: (style?: XgArrowGraphicOptions) => (
//       //   <>
//       //     {renderMethods.labelEditor(style?.label)}
//       //     {/* <div className={"xg-plot-ployline-type editor-item"}>
//       //             <span className={"title margin"}>线型</span>
//       //             <div className={"value margin"}>

//       //             </div>
//       //           </div> */}
//       //     {renderMethods.plotShapeFillColorEditor(
//       //       style?.region?.material?.fillColor
//       //       //   methods.changePolygonFillColor
//       //     )}
//       //     {renderMethods.outlineTypeEditor(
//       //       style?.outline?.material?.customTexture?.type
//       //     )}
//       //     {renderMethods.outlineWidthEditor(style?.outline?.width)}
//       //     {renderMethods.outlineFillColorEditor(
//       //       style?.outline?.material?.fillColor
//       //     )}
//       //   </>
//       // ),
//       // renderStagingAreaEditor: (style?: XgStagingAreaGraphicOptions) => (
//       //   <>
//       //     {renderMethods.labelEditor(style?.label)}
//       //     {/* <div className={"xg-plot-ployline-type editor-item"}>
//       //             <span className={"title margin"}>线型</span>
//       //             <div className={"value margin"}>

//       //             </div>
//       //           </div> */}
//       //     {renderMethods.plotShapeFillColorEditor(
//       //       style?.stagingArea?.material?.fillColor
//       //       //   methods.changePolygonFillColor
//       //     )}
//       //     {renderMethods.outlineTypeEditor(
//       //       style?.outline?.material?.customTexture?.type
//       //     )}
//       //     {renderMethods.outlineWidthEditor(style?.outline?.width)}
//       //     {renderMethods.outlineFillColorEditor(
//       //       style?.outline?.material?.fillColor
//       //     )}
//       //   </>
//       // ),
//     };

//   const LabelEditor = useCallback(
//       (label?: Omit<LabelGraphicOptions, "position">) => (
//         <div className={"xg-plot-label editor-item"}>
//           <span className={"title margin"}>名称</span>
//           <div className={"value margin text"}>
//             <Input
//               key={createGuid()}
//               size={"small"}
//               defaultValue={constant.selectedSymbol?.name}
//               onChange={(e) => methods.changeName(e.target.value)}
//             />
//           </div>
//           <div className={"value color"}>
//             <ColorPicker
//               className={"editor"}
//               key={createGuid()}
//               size={"small"}
//               defaultValue={label?.material?.fillColor}
//               onChange={(val) => methods.changeLabelColor(val.toCssString())}
//             />
//           </div>
//         </div>
//       ),
//       []
//     ),
//     BillboardScaleEditor = useCallback(
//       (scale?: number) => (
//         <div className={"xg-plot-billboard-scale editor-item"}>
//           <span className={"title margin"}>大小</span>
//           <div className={"value margin number"}>
//             <InputNumber
//               key={createGuid()}
//               size={"small"}
//               defaultValue={scale ?? 1}
//               step={0.5}
//               min={0.1}
//               max={10}
//               onChange={(val) =>
//                 val &&
//                 constant.selectedSymbol &&
//                 methods.changeBillboardScale(
//                   constant.selectedSymbol as XgPoint,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       []
//     ),
//     BackgroundScaleEditor = useCallback(
//       (scale?: number) => (
//         <div className={"xg-plot-billboard-scale editor-item"}>
//           <span className={"title margin"}>大小</span>
//           <div className={"value margin number"}>
//             <InputNumber
//               key={createGuid()}
//               size={"small"}
//               defaultValue={scale ?? 1}
//               step={0.5}
//               min={0.1}
//               max={10}
//               onChange={(val) =>
//                 val &&
//                 constant.selectedSymbol &&
//                 methods.changeBgScale(
//                   constant.selectedSymbol as XgBillboard,
//                   val
//                 )
//               }
//             />
//           </div>
//         </div>
//       ),
//       []
//     );

//   useEffect(() => {
//     /// 更新当前选中标绘
//     constant.timer = setInterval(() => {
//       const map = window.xgMap;

//       if (map) {
//         const symbol = map.graphicManager.getSelected();

//         if (symbol) {
//           /// 同一个标绘
//           if (constant.selectedSymbol?.id == symbol.id) return;

//           constant.selectedSymbol = symbol;

//           state.graphicType = symbol.type;
//           if (symbol.type != undefined) {
//             state.plotStyle =
//               symbol.graphics ?? map.graphicManager.getDefaultStyle(symbol.type);
//           }
//         } else {
//           constant.selectedSymbol = undefined;
//           state.graphicType = undefined;
//           state.plotStyle = undefined;
//         }
//       }
//     }, 2 * 100);
//   }, []);

//   const EditTool = useMemo(() => {
//     let jsx: null | ReactNode = null;
//     switch (state.graphicType) {
//       case GraphicType.POINT:
//         jsx = renderMethods.renderPointEditor(state.plotStyle);
//         break;
//       case GraphicType.BILLBOARD:
//         jsx = renderMethods.renderBillboardEditor(state.plotStyle);
//         break;
//       case GraphicType.POLYLINE:
//       case GraphicType.BEZIER_CURVE:
//         jsx = renderMethods.renderLineEditor(state.plotStyle);
//         break;
//       case GraphicType.CIRCLE:
//       case GraphicType.RECTANGLE:
//       case GraphicType.POLYGON:
//       case GraphicType.ARROW_ATTACK_FLAT:
//       case GraphicType.ARROW_ATTACK_SWALLOW:
//       case GraphicType.ARROW_PINCER:
//       case GraphicType.ARROW_STRAIGHT:
//       case GraphicType.STAGING_AREA:
//         jsx = renderMethods.renderRegionEditor(state.plotStyle);
//         break;

//       default:
//         break;
//     }

//     return jsx ? <div className={"xh-gis-plot-tools-editor"}>{jsx}</div> : null;
//   }, [state]);

//   return EditTool;
// };
