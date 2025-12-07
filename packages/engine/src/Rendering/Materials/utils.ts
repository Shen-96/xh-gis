import { Cartesian3, Cartesian2 } from "cesium";

export function ensureCartesian3(value: any, fallback: Cartesian3): Cartesian3 {
  return value instanceof Cartesian3 ? value : fallback;
}

export function ensureCartesian2(value: any, fallback: Cartesian2): Cartesian2 {
  return value instanceof Cartesian2 ? value : fallback;
}
