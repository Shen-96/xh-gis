/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2025-07-16 14:36:44
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-08-14 18:44:17
 */
import { SymbolType } from "../../../enum";
import BasePolygonArrow from "./BasePolygonArrow";
import registry from "../../../Core/GraphicRegistry";

export default class ZyTjArrow extends BasePolygonArrow {
  symbolType = SymbolType.战役突击方向;
}

// 模块内自注册
registry.registerSymbol(SymbolType.战役突击方向, ZyTjArrow as any);
