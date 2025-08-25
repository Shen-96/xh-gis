/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2022-06-14 17:07:39
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:35:14
 */

import {
  ArcType,
  BillboardGraphics,
  Cartesian2,
  Cartesian3,
  Color,
  ColorMaterialProperty,
  HeightReference,
  HorizontalOrigin,
  LabelGraphics,
  LabelStyle,
  MaterialProperty,
  NearFarScalar,
  PointGraphics,
  PolygonGraphics,
  PolylineArrowMaterialProperty,
  PolylineDashMaterialProperty,
  PolylineGraphics,
  PolylineOutlineMaterialProperty,
  VerticalOrigin,
} from "cesium";
import {
  PolylineGraphicOptions,
  PolygonGraphicOptions,
  PointStyleOptions,
  LabelStyleOptions,
  LabelStyleValueType,
  BillboardStyleOptions,
  PolygonStyleOptions,
  PolylineStyleOptions,
  PolylineMaterialOptions,
  VerticalOriginValueType,
  HorizontalOriginValueType,
  ArcTypeValueType,
  MaterialType,
  HeightReferenceValueType,
} from "..";
import CoordinateUtils from "./CoordinateUtils";
import ConvectionPointMaterialProperty from "../DataSources/Materials/ConvectionPointMaterialProperty";
import FlowLineMaterialProperty from "../DataSources/Materials/FlowLineMaterialProperty";
import FlowPointMaterialProperty from "../DataSources/Materials/FlowPointMaterialProperty";
import PolylineDashConvectionMaterialProperty from "../DataSources/Materials/PolylineDashConvectionMaterialProperty";
import PolylineDashSliderMaterialProperty from "../DataSources/Materials/PolylineDashSliderMaterialProperty";

const defaultPointStyle: Pick<
  PointStyleOptions,
  "pixelSize" | "color" | "outlineColor"
> = {
  pixelSize: 5,
  color: "#00FF00",
  outlineColor: "#ffffff",
};

const defaultLabelStyle: Pick<
  LabelStyleOptions,
  | "fontSize"
  | "fontFamily"
  | "scale"
  | "color"
  | "outline"
  | "outlineColor"
  | "style"
  | "pixelOffset"
  | "eyeOffset"
  | "verticalOrigin"
  | "horizontalOrigin"
  | "heightReference"
  | "scaleByDistance"
  | "translucencyByDistance"
> = {
  fontSize: 64,
  fontFamily: "sans-serif",
  scale: 0.3,
  outline: true,
  // showBackground: true, /// 指定标签后面背景的可见性
  // backgroundColor: "rgba(22, 171, 216, 0.8)", /// 背景颜色
  color: "#FFFF00",
  outlineColor: "#FFF",
  // backgroundPadding: [6, 6], /// 指定以像素为单位的水平和垂直背景填充padding
  // pixelOffset: [10, 0],
  style: LabelStyleValueType.FILL_AND_OUTLINE,
  pixelOffset: [0, 28],
  eyeOffset: [0, 0, -999],
  verticalOrigin: VerticalOriginValueType.CENTER,
  horizontalOrigin: HorizontalOriginValueType.CENTER,
  heightReference: HeightReferenceValueType.NONE,
  scaleByDistance: [0.5, 1, 5000000, 0.3],
  translucencyByDistance: [1, 1, 1000000, 0],
};

const defaultBillboardStyle: Pick<
  BillboardStyleOptions,
  | "width"
  | "height"
  | "scale"
  | "sizeInMeters"
  | "verticalOrigin"
  | "horizontalOrigin"
  | "heightReference"
  | "translucencyByDistance"
> = {
  width: 32,
  height: 32,
  scale: 1,
  sizeInMeters: false,
  verticalOrigin: VerticalOriginValueType.CENTER,
  horizontalOrigin: HorizontalOriginValueType.CENTER,
  heightReference: HeightReferenceValueType.NONE,
  translucencyByDistance: [1, 1, 50000000, 0],
};

const defaultPolylineStyle: Pick<
  PolylineStyleOptions,
  "color" | "width" | "arcType" | "clampToGround"
> = {
  color: "#FF0000",
  arcType: ArcTypeValueType.GEODESIC,
  width: 1,
  clampToGround: true,
};

const defaultPolygonStyle: Pick<
  PolygonStyleOptions,
  | "fill"
  | "materialType"
  | "color"
  | "outline"
  | "outlineMaterialType"
  | "outlineColor"
  | "outlineWidth"
  | "stRotation"
> = {
  fill: true,
  materialType: MaterialType.SolidColor,
  color: "rgba(22, 171, 216, 0.2)",
  outline: true,
  outlineMaterialType: MaterialType.SolidColor,
  outlineColor: "rgba(22, 171, 216, 0.8)",
  outlineWidth: 3,
  stRotation: 0,
};

export default class GraphicUtils {
  /**
   * @descripttion: 根据样式创建点图形
   * @param {PointStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  static generatePointGraphicsOptionsFromStyle(
    options: PointStyleOptions
  ): PointGraphics.ConstructorOptions {
    const {
      show,
      pixelSize,
      color,
      outlineColor,
      outlineWidth,
      heightReference,
      scaleByDistance,
    } = options ?? {};

    return {
      show,
      pixelSize,
      color: Color.fromCssColorString(color ?? defaultPointStyle.color),
      outlineWidth: outlineWidth,
      outlineColor: Color.fromCssColorString(
        outlineColor ?? defaultPointStyle.outlineColor
      ),
      heightReference:
        HeightReference[heightReference ?? HeightReferenceValueType.NONE],
      scaleByDistance:
        scaleByDistance && CoordinateUtils.value2NearFarScalar(scaleByDistance),
    };
  }

  /**
   * @descripttion: 根据样式创建点图形
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  static generateLabelGraphicsOptionsFromStyle(
    options?: Partial<LabelStyleOptions>
  ): LabelGraphics.ConstructorOptions {
    const {
      show,
      text,
      fontSize,
      fontFamily,
      style,
      scale,
      color,
      outlineColor,
      outlineWidth,
      pixelOffset,
      eyeOffset,
      showBackground,
      backgroundColor,
      backgroundPadding,
      verticalOrigin,
      horizontalOrigin,
      heightReference,
      scaleByDistance,
    } = options ?? {};

    return {
      show,
      text,
      font: `${fontSize ?? defaultLabelStyle.fontSize}px ${
        fontFamily ?? defaultLabelStyle.fontFamily
      }`,
      fillColor: Color.fromCssColorString(color ?? defaultLabelStyle.color),
      outlineColor: Color.fromCssColorString(
        outlineColor ?? defaultLabelStyle.outlineColor
      ),
      outlineWidth,
      scale: scale ?? defaultLabelStyle.scale,
      style: LabelStyle[style ?? defaultLabelStyle.style],
      pixelOffset: Cartesian2.fromArray(
        pixelOffset ?? defaultLabelStyle.pixelOffset
      ),
      eyeOffset: Cartesian3.fromArray(eyeOffset ?? defaultLabelStyle.eyeOffset),
      showBackground,
      backgroundColor: Color.fromCssColorString(
        backgroundColor ?? "rgba(43,43,43,0)"
      ),
      backgroundPadding: Cartesian2.fromArray(backgroundPadding ?? []),
      verticalOrigin:
        VerticalOrigin[verticalOrigin ?? defaultLabelStyle.verticalOrigin],
      horizontalOrigin:
        HorizontalOrigin[
          horizontalOrigin ?? defaultLabelStyle.horizontalOrigin
        ],
      heightReference:
        HeightReference[heightReference ?? defaultLabelStyle.heightReference],
      scaleByDistance: CoordinateUtils.value2NearFarScalar(
        scaleByDistance ?? defaultLabelStyle.scaleByDistance
      ),
    };
  }

  /**
   * @descripttion: 根据样式创建点图形
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  static generateBillboardGraphicsOptionsFromStyle(
    options: Partial<BillboardStyleOptions>
  ): BillboardGraphics.ConstructorOptions {
    const {
      show,
      image,
      rotation,
      color,
      width,
      height,
      scale,
      alignedAxis,
      pixelOffset,
      eyeOffset,
      sizeInMeters,
      verticalOrigin,
      horizontalOrigin,
      heightReference,
      scaleByDistance,
      translucencyByDistance,
    } = options ?? {};

    return {
      show,
      image,
      rotation,
      color: Color.fromCssColorString(color ?? "#FFF"),
      width: width ?? defaultBillboardStyle.width,
      height: height ?? defaultBillboardStyle.height,
      scale: scale ?? defaultBillboardStyle.scale,
      sizeInMeters: sizeInMeters ?? defaultBillboardStyle.sizeInMeters,
      alignedAxis: CoordinateUtils.alignedAxisOptionsToCar3(alignedAxis ?? {}),
      pixelOffset: Cartesian2.fromArray(pixelOffset ?? []),
      eyeOffset: Cartesian3.fromArray(eyeOffset ?? []),
      verticalOrigin:
        VerticalOrigin[verticalOrigin ?? VerticalOriginValueType.CENTER],
      horizontalOrigin:
        HorizontalOrigin[horizontalOrigin ?? HorizontalOriginValueType.CENTER],
      heightReference:
        HeightReference[heightReference ?? HeightReferenceValueType.NONE],
      scaleByDistance:
        scaleByDistance && CoordinateUtils.value2NearFarScalar(scaleByDistance),
      translucencyByDistance: CoordinateUtils.value2NearFarScalar(
        translucencyByDistance ?? defaultBillboardStyle.translucencyByDistance
      ),
    };
  }

  /**
   * @descripttion: 根据样式创建点图形
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  static generatePolylineGraphicsOptionsFromStyle(
    options?: Partial<PolylineStyleOptions>
  ): PolylineGraphics.ConstructorOptions {
    const { show, arcType, width, outlineWidth, clampToGround } = options ?? {};

    return {
      show,
      arcType: ArcType[arcType ?? defaultPolylineStyle.arcType],
      width: width ?? outlineWidth ?? defaultPolylineStyle.width,
      clampToGround: clampToGround ?? defaultPolylineStyle.clampToGround,
      material: this.generatePolylineMaterialPropertyByMaterialOptions(options),
    };
  }

  /**
   * @descripttion: 根据样式创建点图形
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  static generatePolylineGraphicsOptionsFromGraphic(
    options?: Partial<PolylineGraphicOptions>
  ): PolylineGraphics.ConstructorOptions {
    const { show, style, positions } = options ?? {},
      { arcType, width, outlineWidth, clampToGround } = style ?? {};

    return {
      show,
      arcType: ArcType[arcType ?? defaultPolylineStyle.arcType],
      width: width ?? outlineWidth ?? defaultPolylineStyle.width,
      clampToGround: clampToGround ?? defaultPolylineStyle.clampToGround,
      material: this.generatePolylineMaterialPropertyByMaterialOptions(style),
      positions: positions && CoordinateUtils.point3DegArrToCar3Arr(positions),
    };
  }

  /**
   * @descripttion: 创建线的材质
   * @param {SpecialEffectMaterial} material
   * @param {object} params
   * @return {*}
   * @author: EV-申小虎
   */
  static generatePolylineMaterialPropertyByMaterialOptions(
    options?: Partial<PolylineMaterialOptions>,
    params?: { startPosition?: Cartesian3 }
  ) {
    const {
      color,
      materialType,
      outline,
      outlineColor,
      outlineWidth,
      uniforms,
    } = options ?? {};

    let result: MaterialProperty | undefined;

    switch (materialType) {
      case MaterialType.FlowPoint:
        result = new FlowPointMaterialProperty({
          speed: uniforms?.speed,
          background: uniforms?.background,
          point: uniforms?.point,
          reverse: uniforms?.reverse,
        });
        break;
      case MaterialType.FlowLine:
        result = new FlowLineMaterialProperty({
          speed: uniforms?.speed,
          image: uniforms?.image ?? "",
          // image: './assets/class/wd/link_new.png'
        });
        break;
      case MaterialType.ConvectionPoint:
        result = new ConvectionPointMaterialProperty({
          speed: uniforms?.speed,
          background: uniforms?.background,
          point: uniforms?.point,
        });
        break;
      case MaterialType.PolylineArrow:
        result = new PolylineArrowMaterialProperty(
          Color.fromCssColorString(uniforms?.color ?? color ?? "#FFF")
        );
        break;
      case MaterialType.PolylineDash:
        result = new PolylineDashMaterialProperty({
          color: Color.fromCssColorString(uniforms?.color ?? color ?? "#FFF"),
        });
        break;
      case MaterialType.PolylineDashSlider:
        result = params?.startPosition
          ? new PolylineDashSliderMaterialProperty({
              color: Color.fromCssColorString(uniforms?.color ?? "#FFF"),
              sliderColor: Color.fromCssColorString(
                uniforms?.sliderColor ?? "#FFFF00"
              ),
              reverse: uniforms?.reverse ?? false,
              speed: uniforms?.speed,
              startPosition: params?.startPosition.clone(),
            })
          : undefined;
        break;
      case MaterialType.PolylineDashConvection:
        result = params?.startPosition
          ? new PolylineDashConvectionMaterialProperty({
              color: Color.fromCssColorString(uniforms?.color ?? "#FFF"),
              sliderColor: Color.fromCssColorString(
                uniforms?.sliderColor ?? "#FFFF00"
              ),
              speed: uniforms?.speed,
              startPosition: params?.startPosition.clone(),
            })
          : undefined;
        break;

      default:
        result = outline
          ? new PolylineOutlineMaterialProperty({
              color: Color.fromCssColorString(color ?? "#FFF"),
              outlineColor: Color.fromCssColorString(outlineColor ?? "#000"),
              outlineWidth,
            })
          : new ColorMaterialProperty(
              Color.fromCssColorString(color ?? outlineColor ?? "#FFF")
            );
        break;
    }

    return result;
  }

  /**
   * @descripttion:
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  // static generateRectangleGraphicsOptionsFromStyle(
  //   options: RectangleGraphicOptions
  // ): RectangleGraphics.GraphicsOptions {
  //   const { show, material, coordinates } = options ?? {},
  //     { fill, fillColor } = material ?? {};

  //   return {
  //     show: show ?? fill ?? true,
  //     material: Color.fromCssColorString(
  //       fillColor ?? defaultPolygonStyle.material?.fillColor!
  //     ),
  //     coordinates:
  //       coordinates &&
  //       CoordinateUtils.rectangleCoordinatesOptionsToRectangle(coordinates),
  //   };
  // }

  /**
   * @descripttion: 根据样式创建点图形
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  static generateOutlineGraphicsOptionsFromStyle(
    options?: Partial<PolygonStyleOptions>
  ): PolylineGraphics.ConstructorOptions {
    const { show, outline, outlineMaterialType, outlineWidth } = options ?? {};

    return {
      show: show ?? outline,
      arcType: ArcType[defaultPolylineStyle.arcType],
      width: outlineWidth ?? defaultPolylineStyle.width,
      clampToGround: defaultPolylineStyle.clampToGround,
      material: this.generatePolylineMaterialPropertyByMaterialOptions({
        ...options,
        materialType: outlineMaterialType,
      }),
    };
  }

  /**
   * @descripttion:
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  static generatePolygonGraphicsOptionsFromStyle(
    options: Partial<PolygonStyleOptions>
  ): PolygonGraphics.ConstructorOptions {
    const { show, fill, color } = options ?? {};

    return {
      show: show ?? fill ?? true,
      material: Color.fromCssColorString(color ?? defaultPolygonStyle.color),
    };
  }

  /**
   * @descripttion:
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  static generatePolygonGraphicsOptionsFromGraphic(
    options: Partial<PolygonGraphicOptions>
  ): PolygonGraphics.ConstructorOptions {
    const { show, positions, style } = options ?? {},
      { fill, color } = style ?? {};

    return {
      show: show ?? fill ?? true,
      material: Color.fromCssColorString(color ?? defaultPolygonStyle.color),
      hierarchy: positions && CoordinateUtils.point3DegArrToCar3Arr(positions),
    };
  }

  /**
   * @descripttion:
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  // static generateCircleGraphicsOptionsFromStyle(
  //   options: CircleGraphicOptions
  // ): PolygonGraphics.GraphicsOptions {
  //   const { show, material, position, radius } = options ?? {},
  //     car3 = position && CoordinateUtils.positionOptionsToCar3(position),
  //     projPnt = car3 && CoordinateUtils.car3ToProjectionPnt(car3),
  //     { fill, fillColor } = material ?? {};

  //   return {
  //     show: show ?? fill ?? true,
  //     material: Color.fromCssColorString(
  //       fillColor ?? defaultPolygonStyle.material?.fillColor!
  //     ),
  //     hierarchy: projPnt && radius ? this.circle(projPnt, radius) : undefined,
  //   };
  // }

  /**
   * @descripttion:
   * @param {SymbolMergeStyleOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  // static generateSectorGraphicsOptionsFromStyle(
  //   options: Partial<SectorGraphicOptions>
  // ): PolygonGraphics.GraphicsOptions {
  //   const { show, material, position, radius, minimumClock, maximumClock } =
  //       options ?? {},
  //     car3 = position && CoordinateUtils.positionOptionsToCar3(position),
  //     projPnt = car3 && CoordinateUtils.car3ToProjectionPnt(car3),
  //     { fill, fillColor } = material ?? {};

  //   return {
  //     show: show ?? fill ?? true,
  //     material: Color.fromCssColorString(
  //       fillColor ?? defaultPolygonStyle.material?.fillColor!
  //     ),
  //     hierarchy:
  //       projPnt && radius
  //         ? this.sector(
  //             projPnt,
  //             radius,
  //             CesiumMath.toDegrees(minimumClock ?? 0),
  //             CesiumMath.toDegrees(maximumClock ?? 0)
  //           )
  //         : undefined,
  //   };
  // }
}
