/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-02-20 06:48:27
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-31 10:06:17
 */
import { Color } from "cesium";
import { MarkStyle, PointStyle } from "./types";
import { GeometryType, MaterialType } from "../../enum";
import { GeometryStyleMap } from "../../types";

const defaultRotationPointStyle: PointStyle = {
  pixelSize: 10,
  color: Color.GREEN,
};

const defaultControlPointStyle: PointStyle = {
  pixelSize: 8,
  color: Color.YELLOW,
};

const defaultPointStyle: MarkStyle = {
  pointStyle: {
    pixelSize: 10,
    color: Color.RED,
  },
};

const defaultLineStyle: GeometryStyleMap[GeometryType.LINE] = {
  materialType: MaterialType.SolidColor,
  color: "#FF0000",
  width: 4,
};

const defaultPolygonStyle: GeometryStyleMap[GeometryType.POLYGON] = {
  fill: true,
  materialType: MaterialType.SolidColor,
  color: "#ffffff00",
  outline: true,
  outlineMaterialType: MaterialType.SolidColor,
  outlineColor: "#ff0000",
  outlineWidth: 3,
};

export {
  defaultControlPointStyle,
  defaultPointStyle,
  defaultLineStyle,
  defaultPolygonStyle,
};
