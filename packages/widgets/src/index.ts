/*
 * @Descripttion: XH-GIS Widgets 导出入口
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-06-27 10:51:14
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-04-14 07:09:13
 */

// 仅保留 Widget 前缀导出，避免与运行时类（XgEarth、XgMap）产生歧义
export { default as WidgetEarth } from "./Earth";
export { default as WidgetMap } from "./Map";
export { default as WidgetStatusBar } from "./Statusbar";
export { default as WidgetTimeLine } from "./Timeline";
export { default as WidgetToolBar } from "./Toolbox";
export {
  PlottingToolbar as WidgetPlottingToolbar,
  PlottingList as WidgetPlottingList,
} from "./GraphicsTools";

// 导出类型
export type { CoreProps } from "./Core";

// 导入样式（在构建时会被复制）
import "./index.css";