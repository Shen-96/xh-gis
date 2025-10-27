import AbstractCore from "./AbstractCore";
import AbstractGraphic from "../DataSources/Graphics/Abstract/AbstractGraphic";
import { GeometryType, GraphicType, SymbolType } from "../enum";

export type GraphicConstructor<T extends GeometryType = GeometryType> = new (opts: {
  core: AbstractCore;
  style?: any;
  position?: any;
  positions?: any;
}) => AbstractGraphic<T>;

class GraphicRegistry {
  private readonly graphicCtors = new Map<GraphicType, GraphicConstructor>();
  private readonly symbolCtors = new Map<SymbolType, GraphicConstructor>();

  registerGraphic(type: GraphicType, ctor: GraphicConstructor) {
    this.graphicCtors.set(type, ctor);
  }

  registerSymbol(type: SymbolType, ctor: GraphicConstructor) {
    this.symbolCtors.set(type, ctor);
  }

  getGraphic(type: GraphicType): GraphicConstructor | undefined {
    return this.graphicCtors.get(type);
  }

  getSymbol(type: SymbolType): GraphicConstructor | undefined {
    return this.symbolCtors.get(type);
  }

  has(type: GraphicType | SymbolType): boolean {
    return (
      (typeof type === "number" && this.graphicCtors.has(type as GraphicType)) ||
      (typeof type !== "number" && this.symbolCtors.has(type as SymbolType))
    );
  }
}

const registry = new GraphicRegistry();
export default registry;