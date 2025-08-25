export enum CoreType {
  EARTH = "earth",
  MAP = "map",
}

export enum GeometryType {
  POINT = "point",
  LINE = "line",
  POLYGON = "polygon",
}

/// 材质类型
export enum MaterialType {
  FlowLine = "FlowLine",
  FlowPoint = "FlowPoint",
  ConvectionPoint = "ConvectionPoint",
  DynamicWall = "DynamicWall",
  PolylineArrow = "PolylineArrow",
  PolylineDash = "PolylineDash",
  PolylineDashConvection = "PolylineDashConvection",
  PolylineDashSlider = "PolylineDashSlider",
  EllipsoidScan = "EllipsoidScan",
  EllipsoidElectric = "EllipsoidElectric",
  EllipsoidSpiral = "EllipsoidSpiral",
  EllipsoidWave = "EllipsoidWave",
  Color = "SolidColor",
  SolidColor = "SolidColor",
  CircleRipple = "CircleRipple",
}

/// 图层类型
export enum LayerType {
  /// 实体
  ENTITY = "ENTITY",
  /// 数据源
  CUSTOM_DATASOURCE = "CUSTOM_DATASOURCE",
  CZML_DATASOURCE = "CZML_DATASOURCE",
  GEOJSON_DATASOURCE = "GEOJSON_DATASOURCE",
  KML_DATASOURCE = "KML_DATASOURCE",
  /// 影像层
  IMAGERY = "IMAGERY_LAYER",
  /// 图元
  PRIMITIVE = "PRIMITIVE",
  /// 图元集
  PRIMITIVE_COLLECTION = "PRIMITIVE_COLLECTION",
  /// DEM
  TERRAIN = "TERRAIN_PROVIDER",
}

/// 风向类型
export enum WindDirectionType {
  NONE,
  NORTH,
  NORTHEAST,
  EAST,
  SOUTHEAST,
  SOUTH,
  SOUTHWEST,
  WEST,
  NORTHWEST,
}

/// 例子类型
export enum ParticleType {
  //燃烧
  BURNING = "BURNING",
  //泄露
  LEAKAGE = "LEAKAGE",
  //爆炸
  BLAST = "BLAST",
  //烟雾
  SMOKE = "SMOKE",
  //消防水枪
  FIREWATERGUN = "FIREWATERGUN",
}

/// 场景事件类型
export enum SceneListenerType {
  postRender,
  postUpdate,
  preRender,
  preUpdate,
}

export enum GraphicType {
  POINT = "point",
  LABEL = "label",
  BILLBOARD = "billboard",
  POLYLINE = "polyline",
  FREEHAND_LINE = "freehand_line",
  CURVE = "curve",
  CIRCLE = "circle",
  SECTOR = "sector",
  ELLIPSE = "ellipse",
  KIDNEY_SHAPED = "KIDNEY_SHAPED",
  RECTANGLE = "rectangle",
  TRIANGLE = "triangle",
  FIXED_RATIO_TRIANGLE = "fixed_ratio_triangle",
  LUNE = "lune",
  POLYGON = "polygon",
  FREEHAND_POLYGON = "freehand_polygon",
  STRAIGHT_ARROW = "straight_arrow",
  CURVE_ARROW = "curve_arrow",
  STRAIGHT_TAIL_ARROW = "straight_tail_arrow",
  STRAIGHT_TAIL_RIGHT_ARROW = "straight_tail_right_arrow",
  FREE_FLAT_TAIL_ARROW = "free_flat_tail_arrow",
  FREE_SWALLOW_TAIL_ARROW = "free_swallow_tail_arrow",
  FIXED_FLAT_TAIL_ARROW = "fixed_flat_tail_arrow",
  FIXED_SWALLOW_TAIL_ARROW = "fixed_swallow_tail_arrow",
  DOUBLE_ARROW = "double_arrow",
  STAGING_AREA = "staging_area",
  SYMBOL = "symbol",
}

/// 标绘类型
export enum SymbolType {
  /// 战役突击方向
  "战役突击方向" = "战役突击方向",
  /// 战役反突击方向
  "战役反突击方向" = "战役反突击方向",
  /// 联合火力打击方向
  "联合火力打击方向" = "联合火力打击方向",
  /// 精确火力打击方向
  "精确火力打击方向" = "精确火力打击方向",
  /// 进攻方向
  "进攻方向" = "进攻方向",
  /// 不标示突破地段的作战行动
  "不标示突破地段的作战行动" = "不标示突破地段的作战行动",
  /// 进攻方向（直线/折线）
  "进攻方向（直线/折线）" = "进攻方向（直线/折线）",
  /// 本级地面作战主攻方向
  // "本级地面作战主攻方向" = "本级地面作战主攻方向",
  /// 反冲击方向
  "反冲击方向" = "反冲击方向",
  /// 打击目标
  "打击目标" = "打击目标",
  /// 精确打击目标
  "精确打击目标" = "精确打击目标",
  /// 部队占领（集结）地域
  "部队占领（集结）地域" = "部队占领（集结）地域",
}
// CLEAR_ALL = "CLEAR_ALL",
// POINT = "XG_POINT",
// LABEL = "XG_LABEL",
// BILLBOARD = "XG_BILLBOARD",
// POLYLINE = "XG_POLYLINE",
// BEZIER_CURVE = "XG_BEZIER_CURVE",
// CIRCLE = "XG_CIRCLE",
// ELLIPSE = "XG_ELLIPSE",
// XG_RECTANGLE = "XG_RECTANGLE",
// XG_POLYGON = "XG_POLYGON",
// ARROW_STRAIGHT = "XG_ARROW_STRAIGHT",
// ARROW_ATTACK_FLAT = "XG_ARROW_ATTACK_FLAT",
// ARROW_ATTACK_SWALLOW = "XG_ARROW_ATTACK_SWALLOW",
// ARROW_PINCER = "XG_ARROW_PINCER",
// STAGING_AREA = "XG_STAGING_AREA",
// POINT = "POINT",
// LABEL = "LABEL",
// BILLBOARD = "BILLBOARD",
// // POLYLINE = "POLYLINE",
// /// 自由线
// FREEHAND_LINE = "FREEHAND_LINE",
// CURVE = "CURVE",
// CIRCLE = "CIRCLE",
// SECTOR = "SECTOR",
// ELLIPSE = "ELLIPSE",
// KIDNEY_SHAPED = "KIDNEY_SHAPED",
// RECTANGLE = "RECTANGLE",
// TRIANGLE = "TRIANGLE",
// FIXED_RATIO_TRIANGLE = "FIXED_RATIO_TRIANGLE",
// LUNE = "LUNE",
// POLYGON = "POLYGON",
// /// 自由面
// FREEHAND_POLYGON = "FREEHAND_POLYGON",
// /// 直线箭头
// STRAIGHT_ARROW = "STRAIGHT_ARROW",
// /// 曲线箭头
// CURVE_ARROW = "CURVE_ARROW",
// /// 直线带尾箭头
// STRAIGHT_TAIL_ARROW = "FINE_ARROW",
// /// 直线带尾直角箭头
// STRAIGHT_TAIL_RIGHT_ARROW = "STRAIGHT_TAIL_RIGHT_ARROW",
// /// 自定义平尾箭头
// FREE_FLAT_TAIL_ARROW = "FREE_FLAT_TAIL_ARROW",
// /// 自定义燕尾箭头
// FREE_SWALLOW_TAIL_ARROW = "FREE_SWALLOW_TAIL_ARROW",
// /// 固定平尾箭头
// FIXED_FLAT_TAIL_ARROW = "FIXED_FLAT_TAIL_ARROW",
// // 固定燕尾箭头
// FIXED_SWALLOW_TAIL_ARROW = "FIXED_SWALLOW_TAIL_ARROW",
// /// 双箭头
// DOUBLE_ARROW = "DOUBLE_ARROW",
// /// 集结地
// STAGING_AREA = "STAGING_AREA",

/// 标签样式类型
export enum LabelStyleValueType {
  FILL = "FILL",
  OUTLINE = "OUTLINE",
  FILL_AND_OUTLINE = "FILL_AND_OUTLINE",
}

/// 垂直对齐样式
export enum VerticalOriginValueType {
  CENTER = "CENTER",
  BOTTOM = "BOTTOM",
  BASELINE = "BASELINE",
  TOP = "TOP",
}

/// 水平对齐样式
export enum HorizontalOriginValueType {
  LEFT = "LEFT",
  CENTER = "CENTER",
  RIGHT = "RIGHT",
}

/// 特效类型
export enum SpecialEffectType {
  BILLBOARD = "BILLBOARD",
  // SUPERGIF = 'XG_SUPERGIF',
  // CONE = "XG_CONE",
  // CYLINDER = "XG_CYLINDER",
  // FRUSTUM = "XG_FRUSTUM",
  // SPHERE = "XG_SPHERE",
  // ELLIPSOID = "XG_ELLIPSOID",
  SUPERGIF = "SUPERGIF",
  CONE = "CONE",
  CYLINDER = "CYLINDER",
  ELLIPSOID = "ELLIPSOID",
  FRUSTUM = "FRUSTUM",
  SPHERE = "SPHERE",
}

/**
 * @descripttion: 漫游类型
 * @enum {Number}
 * @author: EV-申小虎
 */
export enum RoamType {
  /**
   * @descripttion: 飞行
   * @author: EV-申小虎
   */
  FLYTO,
  /**
   * @descripttion: 平移
   * @author: EV-申小虎
   */
  TRANSLATION,
  /**
   * @descripttion: 旋转
   * @author: EV-申小虎
   */
  ROTATION,
}

export enum WidgetModeType {
  MAP,
  EARTH,
  BOTH,
}

export enum WidgetModeValueType {
  MAP = "MAP",
  EARTH = "EARTH",
  BOTH = "BOTH",
}

export enum ColorBlendModeValueType {
  HIGHLIGHT = "HIGHLIGHT",
  REPLACE = "REPLACE",
  MIX = "MIX",
}

export enum HeightReferenceValueType {
  NONE = "NONE",
  CLAMP_TO_GROUND = "CLAMP_TO_GROUND",
  RELATIVE_TO_GROUND = "RELATIVE_TO_GROUND",
}

export enum ClockRangeType {
  UNBOUNDED = "UNBOUNDED",
  CLAMPED = "CLAMPED",
  LOOP_STOP = "LOOP_STOP",
}

export enum ClockStepType {
  TICK_DEPENDENT = "TICK_DEPENDENT",
  SYSTEM_CLOCK_MULTIPLIER = "SYSTEM_CLOCK_MULTIPLIER",
  SYSTEM_CLOCK = "SYSTEM_CLOCK",
}

/// ArcType
export enum ArcTypeValueType {
  NONE = "NONE",
  GEODESIC = "GEODESIC",
  RHUMB = "RHUMB",
}

/// EntitySource
export enum PublicEntityType {
  BASIC,
}

export enum PrivateEntityType {
  BASIC,
  PLOT,
  PLOT_CTRL_PNT,
}
