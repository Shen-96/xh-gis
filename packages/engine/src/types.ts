import {
  Entity,
  DataSource,
  Primitive,
  PrimitiveCollection,
  ImageryLayer,
  TerrainProvider,
  ParticleSystem,
  JulianDate,
  Cartesian2,
  Cartesian3,
  MaterialProperty,
  Color,
  CustomDataSource,
  CzmlDataSource,
  GeoJsonDataSource,
  KmlDataSource,
} from "cesium";
import {
  ColorBlendModeValueType,
  HeightReferenceValueType,
  ClockRangeType,
  ClockStepType,
  LabelStyleValueType,
  VerticalOriginValueType,
  HorizontalOriginValueType,
  ArcTypeValueType,
  PublicEntityType,
  PrivateEntityType,
  SymbolType,
  LayerType,
  ParticleType,
  SceneListenerType,
  MaterialType,
  GraphicType,
  GeometryType,
} from "./enum";
import { MarkStyle } from "./DataSources/Graphics/types";

/// 经纬度
export type LatDeg = number;
export type LngDeg = number;
/// 经纬度（弧度制）
export type LatRad = number;
export type LngRad = number;
/// 高度
export type Height = number;
/// 地理坐标
export type Point2Deg = [LngDeg, LatDeg];
/// 角度制
export type Point3Deg = [LngDeg, LatDeg, Height?];
export type Point3DegList = Array<Point3Deg>;
/// 弧度制
export type Point3Rad = [LngRad, LatRad, Height?];
export type Point3RadList = Array<Point3Rad>;
/// 投影系
export type X = number;
export type Y = number;
/// 投影坐标
export type ProjectionPoint = [X, Y];
/// 通用点坐标
export type Point = [number, number];

/// CZML
/// Reference
export type ReferenceValue = string;
export type ReferenceListValue = Array<string>;
export type ReferenceListOfListsValue = Array<ReferenceListValue>;
/// VelocityReference
export type VelocityReferenceValue = string;

/// Cartesian2
export type Cartesian2Value = [number, number];

/// Cartesian3
export type Cartesian3Value = [number, number, number];
/// UnitCartesian3
export type UnitCartesian3Value = [number, number, number] | Array<number>;

/// Quaternion
export type UnitQuaternionValue =
  | [number, number, number, number]
  | Array<number>;

/// InterpolatableProperty
export type InterpolatablePropertyOptions = {
  epoch?: string;
  interpolationAlgorithm?: "LINEAR" | "LAGRANGE" | "HERMITE";
  interpolationDegree?: number;
  forwardExtrapolationType?: "NONE" | "HOLD" | "EXTRAPOLATE";
  forwardExtrapolationDuration?: number;
  backwardExtrapolationType?: "NONE" | "HOLD" | "EXTRAPOLATE";
  backwardExtrapolationDuration?: number;
};

/// Position
export type CartographicRadiansValue = Point3Rad;
export type CartographicDegreesValue = Point3Deg;
export type PositionOptions = InterpolatablePropertyOptions & {
  cartesian?: Cartesian3Value | Array<number>;
  cartographicRadians?: CartographicRadiansValue | Array<number>;
  cartographicDegrees?: CartographicDegreesValue | Array<number>;
  reference?: ReferenceValue;
};

/// Positions
export type Cartesian3ListValue = Array<number>;
export type CartographicDegreesListValue = Array<number>;
export type PositionListOptions = {
  cartesian?: Cartesian3ListValue;
  cartographicDegrees?: CartographicDegreesListValue;
  references?: ReferenceListValue;
};

/// RectangleCoordinates
export type CartographicRectangleRadiansValue = [
  LngRad,
  LatRad,
  LngRad,
  LatRad
];
export type CartographicRectangleDegreesValue = [
  LngDeg,
  LatDeg,
  LngDeg,
  LatDeg
];
export type RectangleCoordinatesOptions = {
  wsen?: CartographicRectangleRadiansValue;
  wsenDegrees?: CartographicRectangleDegreesValue;
};

/// PositionListOfLists
export type CartographicDegreesListOfListsValue =
  Array<CartographicDegreesListValue>;
export type PositionListOfListsOptions = {
  cartographicDegrees?: CartographicDegreesListOfListsValue;
  references?: ReferenceListOfListsValue;
};

/// Color
export type RgbaValue = Array<number>;
export type ColorOptions = {
  rgba?: RgbaValue;
};
export type ColorBlendModeOptions = {
  colorBlendMode?: ColorBlendModeValueType;
  reference?: ReferenceValue;
};
export type SolidColorMaterialOptions = {
  color: ColorOptions;
};

/// ViewFrom
export type ViewFromOptions = {
  cartesian?: Cartesian3Value;
  reference?: ReferenceValue;
};

/// AlignedAxis
export type AlignedAxisOptions = InterpolatablePropertyOptions & {
  reference?: ReferenceValue;
  velocityReference?: VelocityReferenceValue;
  unitCartesian?: UnitCartesian3Value;
};

/// Orientation
export type OrientationOptions = InterpolatablePropertyOptions & {
  reference?: ReferenceValue;
  velocityReference?: VelocityReferenceValue;
  unitQuaternion?: UnitQuaternionValue;
};

export type NearFarScalarValue = [number, number, number, number];

/// HeightReference
export type HeightReferenceOptions = {
  heightReference?: HeightReferenceValueType;
  reference?: ReferenceValue;
};

/// DistanceDisplayCondition
export type DistanceDisplayConditionValue = [number, number?];
export type DistanceDisplayConditionOptions = {
  distanceDisplayCondition?: DistanceDisplayConditionValue;
  reference?: ReferenceValue;
};

/// Clock
export type ClockOptions = {
  interval?: string | Array<string>;
  currentTime?: string;
  multiplier?: number;
  range?: ClockRangeType;
  step?: ClockStepType;
};

/// Material
export type CzmlMaterialOptions = {
  solidColor?: SolidColorMaterialOptions;
  grid?: any;
};

/// PolylineMaterial
export type CzmlPolylineMaterialOptions = {
  solidColor?: SolidColorMaterialOptions;
  polylineOutline?: PolylineOutlineMaterialOptions;
  polylineArrow?: PolylineArrowMaterialOptions;
  polylineDash?: PolylineDashMaterialOptions;
  polylineGlow?: PolylineGlowMaterialOptions;
};

/// PolylineOutlineMaterial
export type PolylineOutlineMaterialOptions = {
  color?: ColorOptions;
  outlineColor?: ColorOptions;
  outlineWidth?: number;
};

/// PolylineArrowMaterial
export type PolylineArrowMaterialOptions = {
  color: ColorOptions;
};

/// PolylineDashMaterial
export type PolylineDashMaterialOptions = {
  color?: ColorOptions;
  gapColor?: ColorOptions;
  dashLength?: number;
  dashPattern?: number;
};

/// PolylineGlowMaterial
export type PolylineGlowMaterialOptions = {
  color?: ColorOptions;
  glowPower?: number;
  taperPower?: number;
};

/// Czml
export type CzmlOptions<T = unknown> = [
  CzmlHeadOptions,
  ...Array<CzmlPacketOptions<T>>
];

/// head
export type CzmlHeadOptions = {
  id: "document";
  name?: string;
  version: "1.0";
  clock?: ClockOptions;
};

/// packet
export type CzmlPacketOptions<T = unknown> = {
  id?: string;
  name?: string;
  show?: boolean | Array<{ interval: string; boolean: boolean }>;
  description?: string;
  availability?: string | Array<string>;
  orientation?: OrientationOptions;
  parent?: string;
  position?: PositionOptions;
  point?: CzmlPointOptions;
  label?: CzmlLabelOptions;
  billboard?: CzmlBillboardOptions;
  model?: CzmlModelOptions;
  rectangle?: CzmlRectangleOptions;
  polyline?: CzmlPolylineOptions;
  path?: CzmlPathOptions;
  polygon?: CzmlPolygonOptions;
  ellipse?: any;
  viewFrom?: ViewFromOptions;
  properties?: T;
};

/// point
export type CzmlPointOptions = {
  show?: boolean;
  pixelSize?: number;
  heightReference?: HeightReferenceOptions;
  scaleByDistance?: {
    nearFarScalar?: NearFarScalarValue;
  };
  translucencyByDistance?: {
    nearFarScalar?: NearFarScalarValue;
  };
  color?:
    | ColorOptions
    | Array<{
        interval: string;
        rgba: RgbaValue;
      }>;
  outlineColor?: ColorOptions;
  outlineWidth?: number;
  disableDepthTestDistance?: number;
  distanceDisplayCondition?: DistanceDisplayConditionOptions;
  clampToGround?: boolean;
  classificationType?: any;
};

/// label
export type CzmlLabelOptions = {
  show?: boolean;
  text?: string;
  font?: string;
  scale?: number;
  style?: LabelStyleValueType;
  fillColor?: ColorOptions;
  outlineColor?: ColorOptions;
  outlineWidth?: number;
  pixelOffset?: {
    cartesian2?: Cartesian2Value;
  };
  eyeOffset?: {
    cartesian?: Cartesian3Value;
  };
  showBackground?: boolean;
  backgroundColor?: ColorOptions;
  backgroundPadding?: {
    cartesian2?: Cartesian2Value;
  };
  verticalOrigin?: VerticalOriginValueType;
  horizontalOrigin?: HorizontalOriginValueType;
  heightReference?: HeightReferenceOptions;
  distanceDisplayCondition?: DistanceDisplayConditionOptions;
  disableDepthTestDistance?: number;
  scaleByDistance?: {
    nearFarScalar?: NearFarScalarValue;
  };
  translucencyByDistance?: {
    nearFarScalar?: NearFarScalarValue;
  };
  pixelOffsetScaleByDistance?: {
    nearFarScalar?: NearFarScalarValue;
  };
};

/// billboard
export type CzmlBillboardOptions = {
  show?: boolean;
  image?: string;
  width?: number;
  height?: number;
  scale?: number;
  color?: ColorOptions;
  rotation?: number;
  sizeInMeters?: boolean;
  pixelOffset?: {
    cartesian2?: Cartesian2Value;
  };
  eyeOffset?: {
    cartesian?: Cartesian3Value;
  };
  alignedAxis?: AlignedAxisOptions;
  verticalOrigin?: VerticalOriginValueType;
  horizontalOrigin?: HorizontalOriginValueType;
  heightReference?: HeightReferenceOptions;
  distanceDisplayCondition?: DistanceDisplayConditionOptions;
  disableDepthTestDistance?: number;
  scaleByDistance?: {
    nearFarScalar?: NearFarScalarValue;
  };
  translucencyByDistance?: {
    nearFarScalar?: NearFarScalarValue;
  };
  pixelOffsetScaleByDistance?: {
    nearFarScalar?: NearFarScalarValue;
  };
};

export type CzmlRectangleOptions = {
  show?: boolean;
  coordinates?: RectangleCoordinatesOptions;
  outline?: boolean;
  outlineColor?: ColorOptions;
  material?: CzmlMaterialOptions;
};

export type CzmlPolylineOptions = {
  show?: boolean;
  positions?: PositionListOptions;
  width?: number;
  clampToGround?: boolean;
  material?: CzmlPolylineMaterialOptions;
};

export type CzmlPolygonOptions = {
  show?: boolean;
  holes?: PositionListOfListsOptions;
  positions?: PositionListOptions;
  arcType?: ArcTypeValueType;
  height?: number;
  heightReference?: HeightReferenceOptions;
  extrudedHeight?: number;
  extrudedHeightReference?: HeightReferenceOptions;
  fill?: boolean;
  outline?: boolean;
  outlineColor?: ColorOptions;
  outlineWidth?: number;
  material?: CzmlMaterialOptions;
  perPositionHeight?: boolean;
  distanceDisplayCondition?: DistanceDisplayConditionOptions;
};

///
export type CzmlModelOptions = {
  show?: boolean;
  gltf?: string;
  scale?: number;
  minimumPixelSize?: number;
  maximumScale?: number;
  runAnimations?: boolean;
  heightReference?: HeightReferenceOptions;
  colorBlendMode?: ColorBlendModeOptions;
  colorBlendAmount?: number;
  distanceDisplayCondition?: DistanceDisplayConditionOptions;
};

/// Path
export type CzmlPathOptions = {
  show?: boolean;
  leadTime?: number;
  trailTime?: number;
  width?: number;
  resolution?: number;
  material?: CzmlPolylineMaterialOptions;
};

export type EntityPropertyDict<T = unknown> = T & {
  public?: PublicEntityType;
  private?: PrivateEntityType;
};

export type PlotPropertyDict = {
  graphicType: GraphicType;
  offset?: Cartesian2Value;
  originCoord?: Cartesian3Value;
};

// Entity
// DataSource
// Primitive
// PrimitiveCollection
// ImageryLayer
// TerrainProvider
export type LayerTypeMap = {
  [LayerType.ENTITY]: Entity;
  [LayerType.CUSTOM_DATASOURCE]: CustomDataSource;
  [LayerType.CZML_DATASOURCE]: CzmlDataSource;
  [LayerType.KML_DATASOURCE]: KmlDataSource;
  [LayerType.GEOJSON_DATASOURCE]: GeoJsonDataSource;
  [LayerType.IMAGERY]: ImageryLayer;
  [LayerType.TERRAIN]: TerrainProvider;
  [LayerType.PRIMITIVE]: Primitive;
  [LayerType.PRIMITIVE_COLLECTION]: PrimitiveCollection;
};

export type LayerItem =
  | Entity
  | DataSource
  | Primitive
  | PrimitiveCollection
  | ImageryLayer
  | TerrainProvider;

/// 图层记录对象
export type Layer<T extends LayerItem> = {
  readonly id: string;
  readonly pid?: string;
  type: LayerType;
  item: T;
};

/// 粒子特效对象
export type Particle = {
  /// 内部唯一索引
  readonly id: string;
  //粒子类型
  type: ParticleType;
  //粒子对象
  item: ParticleSystem;
  //开始时间
  showTime?: JulianDate;
  //结束时间
  stopTime?: JulianDate;
};

// export type MouseEventHandler = {
//   /// 内部唯一索引
//   readonly id: string;
//   /// 事件处理器
//   handler: ScreenSpaceEventHandler;
// };

export type TimeHandler = {
  //同步处理器索引
  readonly id: string;
  //计时器ID
  timer: number;
};

/// 鼠标事件回调
export type ScreenWheelCallback = {
  /// 滚轮位置
  delta?: number;
};

export type ScreenClickCallback = {
  /// 屏幕坐标
  screenPosition?: Cartesian2;
};

export type SceneListener = {
  id: string;
  type: SceneListenerType;
  listener: () => void;
};

export type PlotEventParams<T = GraphicMaterialOptions> = {
  name?: string;
  graphics?: T;
  isDrawResult?: boolean;
};

export type PlotCallback<T = Cartesian3 | Array<Cartesian3>> = (res: {
  id?: string;
  coordinate: T;
  active: boolean;
  isEnded: boolean;
}) => void;

/// 空间分析结果
export type SpatialAnalysisCallback<
  T,
  R = Cartesian3 | Array<Cartesian3>
> = (res: { id?: string; result: T; coordinate: R; active: boolean }) => void;

export type PointMaterialOptions = {
  fill: boolean;
  color: string;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  uniforms: {
    [key: string]: any;
  };
};

export type PolylineMaterialOptions = {
  fill: boolean;
  color: string;
  materialType: MaterialType;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  uniforms: {
    [key: string]: any;
  };
};

export type PolygonMaterialOptions = {
  fill: boolean;
  color: string;
  materialType: MaterialType;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  outlineMaterialType: MaterialType;
  uniforms: {
    [key: string]: any;
  };
};

export type GraphicMaterialOptions =
  | PointMaterialOptions
  | PolylineMaterialOptions
  | PolygonMaterialOptions;

/// 点样式
export type PointStyleOptions = {
  show: boolean;
  pixelSize: number;
  heightReference: HeightReferenceValueType;
  scaleByDistance: NearFarScalarValue;
} & PointMaterialOptions;

// 定义一个映射关系，将 geometryType 映射到对应的 geometryStyle 类型
export type GeometryStyleMap = {
  [GeometryType.POINT]: MarkStyle;
  [GeometryType.LINE]: Partial<PolylineStyleOptions>;
  [GeometryType.POLYGON]: Partial<PolygonStyleOptions>;
};

/// 标牌样式
export type BillboardStyleOptions = {
  show: boolean;
  alignedAxis: AlignedAxisOptions;
  image: string;
  rotation: number;
  width: number;
  height: number;
  scale: number;
  sizeInMeters: boolean;
  pixelOffset: Cartesian2Value;
  eyeOffset: Cartesian3Value;
  verticalOrigin: VerticalOriginValueType;
  horizontalOrigin: HorizontalOriginValueType;
  heightReference: HeightReferenceValueType;
  scaleByDistance: NearFarScalarValue;
  translucencyByDistance: NearFarScalarValue;
} & PointMaterialOptions;

/// 文本样式
export type LabelStyleOptions = {
  show: boolean;
  text: string;
  fontSize: number;
  fontFamily: string;
  style: LabelStyleValueType;
  scale: number;
  pixelOffset: Cartesian2Value;
  eyeOffset: Cartesian3Value;
  showBackground: boolean;
  backgroundColor: string;
  backgroundPadding: Cartesian2Value;
  verticalOrigin: VerticalOriginValueType;
  horizontalOrigin: HorizontalOriginValueType;
  heightReference: HeightReferenceValueType;
  scaleByDistance: NearFarScalarValue;
  translucencyByDistance: NearFarScalarValue;
} & PointMaterialOptions;

/// 线段样式
export type PolylineStyleOptions = {
  show: boolean;
  arcType: ArcTypeValueType;
  width: number;
  clampToGround: boolean;
} & PolylineMaterialOptions;

/// 多边形样式
export type PolygonStyleOptions = {
  show: boolean;
  stRotation: number;
} & PolygonMaterialOptions;

/// 圆锥样式
export type ConeStyleOptions = {
  show?: boolean;
  material?: PolygonMaterialOptions;
  length: number;
  bottomRadius: number;
  slices?: number;
};

export type ConeGraphicOptions = ConeStyleOptions & {
  position?: PositionOptions;
};

/// 圆柱样式
export type CylinderStyleOptions = {
  show?: boolean;
  material?: PolygonMaterialOptions;
  length: number;
  topRadius: number;
  bottomRadius: number;
  slices?: number;
};

export type CylinderGraphicOptions = CylinderStyleOptions & {
  position?: PositionOptions;
};

/// 圆型样式
export type CircleStyleOptions = {
  show?: boolean;
  radius?: number;
} & PolygonMaterialOptions;

// export type CircleGraphicOptions = CircleStyleOptions & {
//   position?: PositionOptions;
// };

/// 椭圆样式
export type EllipseStyleOptions = {
  show?: boolean;
  semiMajorAxis?: number;
  semiMinorAxis?: number;
} & PolygonMaterialOptions;
// 椭圆图形选项使用统一的 AbstractGraphicOptions 结构
export type EllipseGraphicOptions = AbstractGraphicOptions<GraphicType.ELLIPSE>;

/// 扇形样式
export type SectorStyleOptions = {
  show?: boolean;
  material?: PolygonMaterialOptions;
  radius?: number;
  minimumClock?: number;
  maximumClock?: number;
};

export type SectorGraphicOptions = SectorStyleOptions & {
  position?: PositionOptions;
};

/// 矩形样式
export type RectangleStyleOptions = {
  show?: boolean;
  material?: PolygonMaterialOptions;
};

export type RectangleGraphicOptions = RectangleStyleOptions & {
  coordinates?: RectangleCoordinatesOptions;
};

/// 椭球体样式
export type EllipsoidStyleOptions = {
  show?: boolean;
  material?: PolygonMaterialOptions;
  radii: Cartesian3Value;
  innerRadii?: Cartesian3Value;
  minimumClock?: number;
  maximumClock?: number;
  minimumCone?: number;
  maximumCone?: number;
  stackPartitions?: number;
  slicePartitions?: number;
};

export type EllipsoidGraphicOptions = EllipsoidStyleOptions & {
  position?: PositionOptions;
};

/// 平截头体样式
export type FrustumStyleOptions = {
  show?: boolean;
  material?: PolygonMaterialOptions;
  fov?: number;
  aspectRatio?: number;
  near?: number;
  far?: number;
  xOffset?: number;
  yOffset?: number;
};

export type FrustumGraphicOptions = FrustumStyleOptions & {
  position?: PositionOptions;
};

/// 箭头样式
export type ArrowStyleOptions<
  T extends StraightArrowParams | TailAttackArrowParams | PincerArrowParams
> = {
  show?: boolean;
  material?: PolygonMaterialOptions;
  params?: T;
};

export type ArrowGraphicOptions<
  T extends StraightArrowParams | TailAttackArrowParams | PincerArrowParams
> = ArrowStyleOptions<T> & {
  positions?: PositionListOptions;
};

/// 集结地
export type StagingAreaStyleOptions = {
  show?: boolean;
  material?: PolygonMaterialOptions;
};

export type StagingAreaGraphicOptions = StagingAreaStyleOptions & {
  positions?: PositionListOptions;
};

/// 特效
///
export type SpecialEffectGraphicOptions<T = XgFxStyleOptions> = Omit<
  T,
  "show"
> & {
  position?: PositionOptions;
};

export type SpecialEffectStereoStyleOptions<
  T = ConeStyleOptions | EllipsoidStyleOptions | FrustumStyleOptions
> = T & {
  orientation?: UnitQuaternionValue;
  attitude?: Attitude;
};

export type SpecialEffectOptions<T = XgFxStyleOptions> = {
  id?: string;
  name?: string;
  show?: boolean;
  availability?: string | Array<string>;
  graphics: SpecialEffectGraphicOptions<T>;
};

export type XgConeFxStyleOptions =
  SpecialEffectStereoStyleOptions<ConeStyleOptions>;
export type XgConeFxGraphicOptions =
  SpecialEffectGraphicOptions<XgConeFxStyleOptions>;

export type XgEllipsoidFxStyleOptions =
  SpecialEffectStereoStyleOptions<EllipsoidStyleOptions>;
export type XgEllipsoidFxGraphicOptions =
  SpecialEffectGraphicOptions<XgEllipsoidFxStyleOptions>;

export type XgFrustumFxStyleOptions =
  SpecialEffectStereoStyleOptions<FrustumStyleOptions>;
export type XgFrustumFxGraphicOptions =
  SpecialEffectGraphicOptions<XgFrustumFxStyleOptions>;

export type XgSuperGifFxStyleOptions = BillboardStyleOptions & {
  delay?: number;
  loop?: boolean;
  iterations?: number;
};
export type XgSuperGifFxGraphicOptions =
  SpecialEffectGraphicOptions<XgSuperGifFxStyleOptions>;

export type XgFxStyleOptions =
  | XgConeFxStyleOptions
  | XgEllipsoidFxStyleOptions
  | XgFrustumFxStyleOptions
  | XgSuperGifFxStyleOptions;
export type XgFxGraphicOptions =
  | XgConeFxGraphicOptions
  | XgEllipsoidFxGraphicOptions
  | XgFrustumFxGraphicOptions
  | XgSuperGifFxGraphicOptions;
/// 特效实例
// export type SpecialEffect<T = CustomGraphicOptions> = {
//     // availability?: TimeIntervalCollection;
//     readonly _id: string;
//     readonly _type: SpecialEffectType;
//     // readonly _scrs: "ENTITY" | "Geographic";
//     readonly _style?: SpecialEffectGraphicOptions<T>;
//     // readonly _trackedEntity?: Entity;
//     readonly _fxs: PrimitiveCollection;
//     show: {
//         get(): boolean;
//         set(val: boolean): void;
//     };
//     updateModelMatrix(
//         // time?: JulianDate,
//         modelMatrix: Matrix4,
//         // attitude?: Attitude,
//         // translation?: Cartesian3
//     ): void;
//     updateMaterial(material: GraphicMaterialOptions<GraphicStyleValueType.FILL | GraphicStyleValueType.OUTLINE | GraphicStyleValueType.FILL_AND_OUTLINE>): void;
// };

/// 动画对象
export type AnimationGroup = {
  //索引
  readonly _id: string;
  /// 数据源
  readonly _datasource: DataSource;
  //名称
  name: string;
  //时间
  period: { startTime: JulianDate; endTime: JulianDate };
  //模型动画组
  readonly _animationList: Array<Animation>;
  //粒子动画组
  readonly _particlerList: Array<Particle>;
  /// 添加动画
  add(animaiton: Animation): boolean;
  /// 根据动画id获取动画实体
  getById(id: string): Animation | null;
  /// 根据动画id移除动画
  removeById(id: string): boolean;
  /// 移除所有动画
  removeAll(): void;
  /// 更新动画周期
  updatePeriod(startTime?: JulianDate, endTime?: JulianDate): void;
};

//模型对象
export type Animation = {
  //唯一索引
  readonly _id: string;
  /// 动画实体
  entity: Entity;
  //路径材质
  pathMarteia?: MaterialProperty | Color;
  //模型扩展粒子
  extendParticler?: Particle;
};

export type CameraInfo = {
  lon: LngDeg;
  lat: LatDeg;
  height: number;
  altitude: number;
  heading: number;
  pitch: number;
  roll: number;
};

export type WidgetMode = "MAP_ONLY" | "EARTH_ONLY" | "BOTH";

export type StraightArrowParams = {
  tailHalfWidthFactor: number;
  headHalfAngle: number;
  neckAngle: number;
};

export type TailAttackArrowParams = {
  headHeightFactor: number;
  headWidthFactor: number;
  neckHeightFactor: number;
  neckWidthFactor: number;
  tailWidthFactor: number;
  headTailFactor: number;
  swallowTailFactor: number;
};

export type PincerArrowParams = {
  fixPointCount: number;
  headHeightFactor: number;
  headWidthFactor: number;
  neckHeightFactor: number;
  neckWidthFactor: number;
  midLengthFactor: number;
};

/// 特效姿态
export type Attitude = {
  azimuth?: number;
  elevation?: number;
  roll?: number;
};

/// 场景配置参数
export type SceneConfig = {
  /// 场景中心
  center: {
    lat: LatDeg;
    lng: LngDeg;
    alt: number;
    heading: number;
    pitch: number;
  };
  /// 场景范围
  scope: {
    west: LngDeg;
    south: LatDeg;
    east: LngDeg;
    north: LatDeg;
  };
  scene3DOnly: boolean;
  shadows: boolean;
  removeDblClick: boolean;
  sceneMode: number;
  showSun: boolean;
  showMoon: boolean;
  showSkyBox: boolean;
  showSkyAtmosphere: boolean;
  fog: boolean;
  fxaa: boolean;
  orderIndependentTranslucency: boolean;
  requestRenderMode: boolean;
  contextOptions: {
    requestWebgl1: boolean;
  };
  globe: {
    depthTestAgainstTerrain: boolean;
    baseColor: string;
    showGroundAtmosphere: boolean;
    enableLighting: boolean;
  };
  cameraController: {
    zoomFactor: number;
    minimumZoomDistance: number;
    maximumZoomDistance: number;
    enableRotate: boolean;
    enableTranslate: boolean;
    enableTilt: boolean;
    enableZoom: boolean;
    enableCollisionDetection: boolean;
    minimumCollisionTerrainHeight: number;
  };
};

/// 图层配置参数
export type BasemapConfig = {
  // id: string;
  name: string;
  type:
    | "group"
    | "tdt"
    | "gaode"
    | "baidu"
    | "tencent"
    | "xyz"
    | "image"
    | "grid";
  icon?: string;
  pid?: number;
  layers?: Array<{
    name: string;
    type: "tdt" | "gaode" | "baidu" | "tencent" | "xyz";
    layer: string;
  }>;
  layer?: string;
  show?: boolean;
  chinaCRS?: string;
  invertColor?: boolean;
  filterColor?: string;
  brightness?: number;
  contrast?: number;
  gamma?: number;
  hue?: number;
  saturation?: number;
  url?: string;
  enablePickFeatures?: boolean;
  minimumLevel?: number;
  maximumLevel?: number;
  cells?: number;
  color?: string;
  alpha?: number;
};

/// 图层数据配置参数
export type LayerConfig = {
  id?: string;
  pid?: string;
  name?: string;
  type: "group" | "tileset" | "geojson" | "graphic";
  data?: Array<GraphicOptions>;
  url?: string;
  position?: {
    lng: number;
    lat: number;
    alt: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  maximumScreenSpaceError?: number;
  skipLevelOfDetail?: boolean;
  loadSiblings?: boolean;
  cullRequestsWhileMoving?: boolean;
  cullRequestsWhileMovingMultiplier?: number;
  preferLeaves?: boolean;
  progressiveResolutionHeightFraction?: number;
  dynamicScreenSpaceError?: boolean;
  preloadWhenHidden?: boolean;
  center?: {
    lat: number;
    lng: number;
    alt: number;
    heading: number;
    pitch: number;
  };
  popup?: string;
  highlight?: {
    type: string;
    color: string;
  };
  scenetree?: string;
  layers?: Array<Partial<LayerConfig>>;
  hasOpacity?: boolean;
  open?: boolean;
  flat?: {
    enabled: boolean;
    editHeight: number;
  };
  flyTo?: boolean;
  show?: boolean;
  msg?: string;
};

export type GraphicStyleMap = {
  [GraphicType.POINT]: PointStyleOptions;
  [GraphicType.LABEL]: LabelStyleOptions;
  [GraphicType.POLYLINE]: PolylineStyleOptions;
  [GraphicType.POLYGON]: PolygonStyleOptions;
  [GraphicType.CIRCLE]: CircleStyleOptions;
  [GraphicType.ELLIPSE]: EllipseStyleOptions;
  [GraphicType.SYMBOL]: {
    color: string;
    icon: Partial<BillboardStyleOptions>;
    label: Partial<Omit<LabelStyleOptions, "text">>;
  } & PolygonMaterialOptions;
};

/// Graphic参数
/// 如果GraphicType为POINT，则position为必填项
/// 如果GraphicType为LABEL，则position为必填项
/// 如果GraphicType为POLYLINE，则positions为必填项
/// 如果GraphicType为POLYGON，则positions为必填项
/// 如果GraphicType为SYMBOL，则code为必填项
export type AbstractGraphicOptions<T extends GraphicType> = T extends
  | GraphicType.POINT
  | GraphicType.LABEL
  | GraphicType.CIRCLE
  ? {
      id?: string;
      name?: string;
      show?: boolean;
      type: T;
      position?: Point3Deg;
      style?: Partial<GraphicStyleMap[T]>;
      attr?: { [key: string]: string };
    }
  : T extends GraphicType.POLYLINE | GraphicType.POLYGON
  ? {
      id?: string;
      name?: string;
      show?: boolean;
      type: T;
      positions?: Point3DegList;
      style?: Partial<GraphicStyleMap[T]>;
      attr?: { [key: string]: string };
    }
  : T extends GraphicType.ELLIPSE
  ? {
      id?: string;
      name?: string;
      show?: boolean;
      type: T;
      // 支持两种输入：中心点+半轴 或 两点自动推算半轴
      position?: Point3Deg;
      positions?: Point3DegList;
      style?: Partial<GraphicStyleMap[T]>;
      attr?: { [key: string]: string };
    }
  : T extends GraphicType.SYMBOL
  ? {
      id?: string;
      name?: string;
      show?: boolean;
      type: T;
      code: string;
      position?: Point3Deg;
      positions?: Point3DegList;
      style?: Partial<GraphicStyleMap[T]>;
      attr?: { [key: string]: string };
    }
  : never;

export type PointGraphicOptions = AbstractGraphicOptions<GraphicType.POINT>;

export type LabelGraphicOptions = AbstractGraphicOptions<GraphicType.LABEL>;

export type PolylineGraphicOptions =
  AbstractGraphicOptions<GraphicType.POLYLINE>;

export type PolygonGraphicOptions = AbstractGraphicOptions<GraphicType.POLYGON>;

export type CircleGraphicOptions = AbstractGraphicOptions<GraphicType.CIRCLE>;

export type SymbolGraphicOptions = AbstractGraphicOptions<GraphicType.SYMBOL>;

export type GraphicOptions =
  | PointGraphicOptions
  | LabelGraphicOptions
  | PolylineGraphicOptions
  | PolygonGraphicOptions
  | CircleGraphicOptions
  | EllipseGraphicOptions
  | SymbolGraphicOptions;

/// Xh-GIS配置
export type XgConfig = {
  scene?: Partial<SceneConfig>;
  basemaps?: Array<BasemapConfig>;
  layers?: Array<LayerConfig>;
};
