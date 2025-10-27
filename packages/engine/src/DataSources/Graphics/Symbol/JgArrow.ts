/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-07-16 15:31:22
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:43:58
 */
import { SymbolType } from "../../../enum";
import BasePolygonArrow from "./BasePolygonArrow";
import registry from "../../../Core/GraphicRegistry";

export default class JgArrow extends BasePolygonArrow {
  symbolType = SymbolType.进攻方向;
}

// 模块内自注册
registry.registerSymbol(SymbolType.进攻方向, JgArrow as any);
