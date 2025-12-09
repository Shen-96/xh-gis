import { Matrix4 } from "cesium";
import type {
  TetrahedronStyleOptions,
  FrustumStyleOptions,
  ConeStyleOptions,
  EllipsoidStyleOptions,
  PolylineStyleOptions,
  SectorStyleOptions,
  CylinderStyleOptions,
  TetrahedronGraphicOptions,
  FrustumGraphicOptions,
  ConeGraphicOptions,
  EllipsoidGraphicOptions,
  PolylineGraphicOptions,
  SectorGraphicOptions,
  CylinderGraphicOptions,
} from "../../types";

export type PrimitiveKind =
  | "tetrahedron"
  | "frustum"
  | "cone"
  | "ellipsoid"
  | "polyline"
  | "sector"
  | "cylinder";

export type PrimitiveStyleMap = {
  tetrahedron: TetrahedronStyleOptions;
  frustum: FrustumStyleOptions;
  cone: ConeStyleOptions;
  ellipsoid: EllipsoidStyleOptions;
  polyline: PolylineStyleOptions;
  sector: SectorStyleOptions;
  cylinder: CylinderStyleOptions;
};

export type PrimitiveGraphicMap = {
  tetrahedron: TetrahedronGraphicOptions;
  frustum: FrustumGraphicOptions;
  cone: ConeGraphicOptions;
  ellipsoid: EllipsoidGraphicOptions;
  polyline: PolylineGraphicOptions;
  sector: SectorGraphicOptions;
  cylinder: CylinderGraphicOptions;
};

export type PrimitiveCreateOptions<K extends PrimitiveKind> = {
  id?: string;
  style: PrimitiveGraphicMap[K];
  modelMatrix?: Matrix4;
};

