/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2025-07-16 15:22:43
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-08-14 18:44:10
 */
import { SymbolType } from "../../../enum";
import BasePolygonArrow from "./BasePolygonArrow";
import registry from "../../../Core/GraphicRegistry";

export default class LhHlDjArrow extends BasePolygonArrow {
  symbolType = SymbolType.联合火力打击方向;
}

// 模块内自注册
registry.registerSymbol(SymbolType.联合火力打击方向, LhHlDjArrow as any);
