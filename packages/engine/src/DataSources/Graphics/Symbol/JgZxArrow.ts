/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-07-16 15:31:22
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:44:01
 */
import { SymbolType } from "../../../enum";
import BasePolygonArrow from "./BasePolygonArrow";

export default class JgZxArrow extends BasePolygonArrow {
  symbolType = SymbolType["进攻方向（直线/折线）"];
}
