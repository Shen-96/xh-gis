/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-07-16 15:42:02
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:43:52
 */
import { SymbolType } from "../../../enum";
import BaseCurvedArrow from "./BaseCurvedArrow";
import registry from "../../../Core/GraphicRegistry";

export default class BbsTpDdArrow extends BaseCurvedArrow {
  symbolType = SymbolType.不标示突破地段的作战行动;
}

// 模块内自注册
registry.registerSymbol(SymbolType.不标示突破地段的作战行动, BbsTpDdArrow as any);
