import { SymbolType } from "../../../enum";
import BasePolygonArrow from "./BasePolygonArrow";
import registry from "../../../Core/GraphicRegistry";

export default class ZyFtjArrow extends BasePolygonArrow {
  symbolType = SymbolType.战役反突击方向;
}

// 模块内自注册
registry.registerSymbol(SymbolType.战役反突击方向, ZyFtjArrow as any);
