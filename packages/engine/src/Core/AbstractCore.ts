/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2020-11-11 11:30:13
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 17:26:46
 */
import {
  Ion,
  Entity,
  Viewer,
  Rectangle,
  ScreenSpaceEventType,
  SkyAtmosphere,
  Sun,
  DataSource,
  Camera,
  SceneMode,
  JulianDate,
  SingleTileImageryProvider,
  SkyBox,
  ImageryLayer,
  Math as CesiumMath,
  OrthographicFrustum,
  OrthographicOffCenterFrustum,
  PerspectiveFrustum,
  PerspectiveOffCenterFrustum,
  ScreenSpaceEventHandler,
} from "cesium";
import {
  CoreType,
  EntityPropertyDict,
  LayerManager,
  MouseEventUtils,
  ParticleManager,
  PrivateEntityType,
  RoamManager,
  SceneListenerManager,
  // SpatialAnalysis,
  SpecialEffectManager,
  GraphicManager,
  TimeManager,
  WeatherManager,
  XgConfig,
} from "../index";
import GlobeBG from "../Assets/globe.jpg";
import SkyBoxPX from "../Assets/SkyBox/skybox_px.jpg";
import SkyBoxNX from "../Assets/SkyBox/skybox_nx.jpg";
import SkyBoxPY from "../Assets/SkyBox/skybox_py.jpg";
import SkyBoxNY from "../Assets/SkyBox/skybox_ny.jpg";
import SkyBoxPZ from "../Assets/SkyBox/skybox_pz.jpg";
import SkyBoxNZ from "../Assets/SkyBox/skybox_nz.jpg";
import AbstractPopup from "../DataSources/XgPopup/AbstractPopup";

/// token
Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNTg2OTNhYi1hM2JmLTQyYTItOWE1NS0wMzNjMzAyZDI3NGYiLCJpZCI6MjU5MTAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODY4MzI4NDV9.2DP9UQowHfxa656C1UZT7vVvMk39xJSPTL83-Ce-Ypg";
// Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMTYxYjE3Zi0yM2ZjLTQzOTUtOTUyZS0wNGRlYTI0NzZkNWEiLCJpZCI6MjU5LCJpYXQiOjE2MjI1Nzc1NzF9.wBdlWsqCoHM9tpplqxAPCdQWsERtxJc65IFZRf4g0z4';

const singleTileImageryProvider = new SingleTileImageryProvider({
  url: GlobeBG,
  tileWidth: 2048,
  tileHeight: 1024,
  rectangle: Rectangle.MAX_VALUE,
});

const viewerOptions: Viewer.ConstructorOptions = {
  animation: false, /// 是否创建动画小器件，左下角仪表，默认为true
  baseLayerPicker: false, /// 是否显示图层选择器，默认为true
  fullscreenButton: false, /// 是否显示全屏按钮，默认为true
  // vrButton: true, /// 是否显示VR按钮，默认false
  geocoder: false, /// 是否显示geocoder小器件，右上角查询按钮，默认为true
  homeButton: false, /// 是否显示Home按钮，默认为true
  infoBox: false, /// 是否显示信息框，默认为true
  sceneModePicker: false, /// 是否显示3D/2D选择器，默认为true
  // selectionIndicator: false, /// 是否显示选取指示器组件，默认为true
  timeline: false, /// 是否显示时间轴，默认为true
  navigationHelpButton: false, /// 是否显示右上角的帮助按钮，默认为true
  navigationInstructionsInitiallyVisible: false, /// 是否导航说明初始可见，默认为true
  // scene3DOnly: true, /// 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源，默认false
  // sceneMode: SceneMode.SCENE3D,
  // shouldAnimate: true, /// 是否开始时间动画，默认为true
  //   showRenderLoopErrors: true, /// 如果为true，如果出现渲染循环错误，此小部件将自动向用户显示包含错误的HTML面板
  /// 天空盒纹理
  skyBox: new SkyBox({
    sources: {
      positiveX: SkyBoxPX,
      negativeX: SkyBoxNX,
      positiveY: SkyBoxPY,
      negativeY: SkyBoxNY,
      positiveZ: SkyBoxPZ,
      negativeZ: SkyBoxNZ,
    },
    show: true,
  }),
  skyAtmosphere: new SkyAtmosphere(), /// 大气层
  // automaticallyTrackDataSourceClocks: true, /// 自动追踪最近添加的数据源的时钟设置，默认为true
  // useDefaultRenderLoop: false,/// 默认为true，如果不需要控制渲染循环，则设为false
  // requestRenderMode: false, /// 减少Cesium渲染新帧的总时间并减少Cesium在应用程序中的总体CPU使用率，默认为false
  // maximumRenderTimeChange: 2, /// 如果场景中的元素没有随仿真时间变化，请考虑将设置maximumRenderTimeChange为较高的值，例如Infinity，默认为0.0
  // contextOptions: {
  //     requestWebgl2: true, /// 使用webgl2.0
  // },
  // msaaSamples: 4, /// 使用msaa采样算法，提高渲染效果，需要更高性能
  // terrainProvider: Cesium.createWorldTerrain(),
  baseLayer: ImageryLayer.fromProviderAsync(
    Promise.resolve(singleTileImageryProvider),
    {
      rectangle: Rectangle.MAX_VALUE,
    }
  ),
  contextOptions: {
    requestWebgl1: true,
    webgl: {
      alpha: true,
      depth: false,
      stencil: true,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      failIfMajorPerformanceCaveat: true,
    },
    allowTextureFilterAnisotropic: true,
  },
};

/// 设置初始化视框
Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(30, -20, 180, 70);

/// 设置缩放系数
// Camera.DEFAULT_VIEW_FACTOR = 0.0;

/**
 * @descripttion: 定制化视图
 * @author: EV-申小虎
 */
export default abstract class AbstractCore<T extends CoreType = any> {
  /// 版本号
  readonly version = "1.0.0";
  abstract readonly coreType: T;
  /// 视图对象
  readonly viewer: Viewer;
  /// 时间管理器
  readonly timeManager: TimeManager;
  /// 图层记录管理器
  readonly layerManager: PartialPrivate<LayerManager>;
  /// 风力天气管理器
  readonly weatherManager: PartialPrivate<WeatherManager>;
  /// 粒子管理器
  readonly particleManager: PartialPrivate<ParticleManager>;
  /// 漫游工具
  readonly roamManager: PartialPrivate<RoamManager>;
  /// 鼠标事件管理器
  // readonly mouseHandlerManager: PartialPrivate<MouseHandlerManager>;
  /// 场景事件管理器
  readonly sceneListenerManager: PartialPrivate<SceneListenerManager>;
  /// 动画管理器
  // readonly animationManager: PartialPrivate<AnimationManager>;
  /// 绘画管理器
  readonly graphicManager: PartialPrivate<GraphicManager>;
  /// 空间分析
  // readonly spatialAnalysis: PartialPrivate<SpatialAnalysis>;
  /// 特效管理器
  readonly specialEffectManager: PartialPrivate<SpecialEffectManager>;
  readonly popupManager = new Map<string, AbstractPopup>();

  /**
   * @descripttion: 初始化参数
   * @param {Document} container 容器
   * @param {Object} layerLevel 图层级别
   * @param {String} hostUrl 用户地址
   * @param {Object} viewerOptions 视图参数
   * @return {type} 球
   */
  constructor(container: string | Element, options: Viewer.ConstructorOptions) {
    this.viewer = this.#initViewer(container, options);
    this.timeManager = new TimeManager(this); /// 时间管理器
    this.layerManager = new LayerManager(this); /// 图层记录管理器
    this.weatherManager = new WeatherManager(this); /// 天气管理器
    this.particleManager = new ParticleManager(this); /// 粒子管理器
    this.roamManager = new RoamManager(this); /// 漫游工具
    // this.mouseHandlerManager = new MouseHandlerManager(this.viewer); /// 鼠标事件管理器
    this.sceneListenerManager = new SceneListenerManager(this);
    // this.animationManager = new AnimationManager(this.viewer, this.roamManager, this.particleManager, this.weatherManager); /// 动画管理器
    this.graphicManager = new GraphicManager(this); /// 绘图管理器
    // this.spatialAnalysis = new SpatialAnalysis(this); /// 空间分析
    this.specialEffectManager = new SpecialEffectManager(this); /// 特效管理器
  }

  /**
   * @descripttion: cesium视图初始化
   * @param {Viewer.ConstructorOptions} options
   * @return {*}
   * @author: EV-申小虎
   */
  #initViewer(
    container: Element | string,
    options?: Viewer.ConstructorOptions
  ): Viewer {
    const mergeOptions = { ...viewerOptions, ...options };

    const viewer = new Viewer(container, mergeOptions);

    /// 设置图像渲染像素化处理
    viewer.resolutionScale = window.devicePixelRatio;

    /// 去锯齿
    // viewer.scene.postProcessStages.fxaa.enabled = true;

    /// 移除鼠标右键监听事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );

    //设置相机视野框改变幅度触发相机改变事件
    viewer.scene.camera.percentageChanged = 0.1;

    /// 三维模式
    if (viewer.scene.mode == SceneMode.SCENE3D) {
      /// 显示太阳
      viewer.scene.sun = new Sun();

      /// 开启近地光照
      viewer.scene.globe.enableLighting = true;

      /// 开启深度探测
      // viewer.scene.useDepthPicking = true;
      // viewer.scene.globe.depthTestAgainstTerrain = true;

      // /// 开启雾效
      // viewer.scene.fog.enabled = true;

      // /// 开启雾化
      // viewer.scene.fog.density = 0.0002;
      // viewer.scene.fog.screenSpaceErrorFactor = 100;
    }

    //dem调试模式
    // viewer.extend(Cesium.viewerCesiumInspectorMixin);

    /// 隐藏版权声明
    viewer.cesiumWidget.creditContainer.remove();

    return viewer;
  }

  get scene() {
    return this.viewer.scene;
  }

  get container() {
    return this.viewer.container;
  }

  get depthTestAgainstTerrain() {
    return this.scene.globe.depthTestAgainstTerrain;
  }

  set depthTestAgainstTerrain(val: boolean) {
    this.scene.globe.depthTestAgainstTerrain = val;
  }

  set selectionIndicatorElementInnerHTML(style: string) {
    this.viewer.selectionIndicator &&
      (this.viewer.selectionIndicator.viewModel.selectionIndicatorElement.innerHTML =
        style);
  }

  set debugShowFramesPerSecond(visible: boolean) {
    this.viewer.scene.debugShowFramesPerSecond = visible;
  }

  get selectedEntity() {
    return this.viewer.selectedEntity;
  }

  set selectedEntity(entity: Entity | undefined) {
    this.viewer.selectedEntity = entity;
  }

  removeSelectedEntity() {
    this.viewer.selectedEntity = undefined;
  }

  get selectedEntityChanged() {
    return this.viewer.selectedEntityChanged;
  }

  /**
   * @descripttion: 创建私有实体
   * @param {string} flag
   * @param {Entity} options
   * @return {*}
   * @author: EV-申小虎
   */
  createPrivateEntity(
    options: Entity.ConstructorOptions | undefined,
    type = PrivateEntityType.BASIC
  ) {
    return new Entity({
      ...options,
      properties: {
        ...options?.properties,
        private: type,
      },
    });
  }

  /**
   * @descripttion: 是否为私有实体
   * @param {Entity} entity
   * @return {*}
   * @author: EV-申小虎
   */
  isPrivateEntity(entity: Entity) {
    return entity.properties?.hasProperty("private") ?? false;
  }

  /**
   * @descripttion: 获取实体属性
   * @param {Entity} entity
   * @param {JulianDate} time
   * @return {*}
   * @author: EV-申小虎
   */
  getEntityProps<T = object>(entity: Entity, time: JulianDate) {
    const properties: EntityPropertyDict<T> | undefined =
      entity.properties?.getValue(time);

    return properties;
  }

  /**
   * @descripttion: 获取父链上的所有实体
   * @param {Entity} entity
   * @return {*} 索引为0的是实体的父级，后依次为父级的父级...
   * @author: EV-申小虎
   */
  getParentChainEntities(
    entity: Entity,
    result: Array<Entity> = []
  ): Array<Entity> {
    const parentEntity = entity.parent;

    if (!parentEntity) return result;

    result.push(parentEntity);
    return this.getParentChainEntities(parentEntity, result);
  }

  set clockTrackedDataSource(dataSource: DataSource) {
    this.viewer.clockTrackedDataSource = dataSource;
  }

  setClockTrackedDataSource(dataSource: DataSource) {
    this.viewer.clockTrackedDataSource = dataSource;
  }

  // scene {
  //     return this.viewer.scene;
  // }

  /*
   * @descripttion: 渲染鼠标跟随框
   * @param {string} id
   * @param {string} tip
   * @param {CSSStyleDeclaration} style
   * @return {*}
   * @author: EV-申小虎
   */
  renderMouseTip(
    handler: ScreenSpaceEventHandler,
    tip = "请在场景中，选择发生位置",
    style?: CSSStyleDeclaration
  ) {
    const id = "xh-gis-mouse-tip-container";

    let toolTip = document.getElementById(id);
    if (toolTip) {
      toolTip.innerHTML = tip;
      return;
    } else {
      toolTip = document.createElement("div");
      const popBefore = document.createElement("div"),
        container = this.viewer.container;

      /// 设置容器样式
      toolTip.id = id;
      toolTip.style.position = "absolute";
      toolTip.style.zIndex = "2";
      toolTip.innerHTML = tip;
      toolTip.style.color = style?.color || "#FFF";
      toolTip.style.margin = style?.margin || "5px";
      toolTip.style.backgroundColor = style?.backgroundColor || "#636770c7";
      toolTip.style.border = style?.border || "1px solid #16abd8b5";
      toolTip.style.borderRadius = style?.borderRadius || "5px";
      //伪元素标签
      /// before元素样式
      popBefore.style.display = "block";
      popBefore.style.width = "0";
      popBefore.style.borderWidth = "5px 11px 5px 5px";
      popBefore.style.borderStyle = "solid";
      popBefore.style.borderColor =
        "transparent #16abd8b5 transparent transparent";
      popBefore.style.position = "absolute";
      popBefore.style.transform = "rotate(-45deg)";
      popBefore.style.left = "-15px";
      popBefore.style.bottom = "-10px";
      /// 添加提示框到容器上
      container?.appendChild(toolTip);
      /// 添加伪元素到信息框
      toolTip.appendChild(popBefore);
      /// 鼠标移动监听
      MouseEventUtils.setMoveListener(handler, ({ screenPosition }) => {
        /// 修改元素位置
        if (screenPosition && toolTip) {
          toolTip.style.top = screenPosition.y - 40 + "px";
          toolTip.style.left = screenPosition.x + 10 + "px";
        }
      });
    }
  }

  /**
   * @descripttion: 移除鼠标跟随框
   * @param {string} id
   * @return {*}
   * @author: EV-申小虎
   */
  removeMouseTip() {
    const id = "xh-gis-mouse-tip-container";

    // this.mouseHandlerManager.destroyHandlerById(id);
    const htmlElement = document.getElementById(id);
    /// 移除元素
    htmlElement?.remove();
  }

  set resolutionScale(scale: number) {
    this.viewer.resolutionScale = scale;
  }

  get resolutionScale() {
    return this.viewer.resolutionScale;
  }

  /// 计算视图中一个像素代表的实际地面距离（以米为单位）
  getGroundDistanceByPixel() {
    const viewer = this.viewer;
    const camera = viewer.camera;
    const scene = viewer.scene;
    const ellipsoid = scene.globe.ellipsoid;
    const canvas = scene.canvas;

    // 计算视图中一个像素代表的实际地面距离（以米为单位）
    const frustum = camera.frustum as any;

    let pixelSize: number;
    if (frustum instanceof PerspectiveFrustum) {
      // 对于透视投影
      const halfFov = CesiumMath.toRadians(frustum.fov) * 0.5;
      pixelSize =
        (ellipsoid.maximumRadius * 2 * Math.PI) /
        (canvas.width * Math.tan(halfFov));
    } else if (
      frustum instanceof OrthographicFrustum ||
      frustum instanceof PerspectiveOffCenterFrustum ||
      frustum instanceof OrthographicOffCenterFrustum
    ) {
      // 对于正交投影
      const frustum = viewer.camera.frustum;
      const near = frustum.near;
      const pixelSizeAtNear =
        (2 * near * ellipsoid.maximumRadius) / canvas.width;
      pixelSize = pixelSizeAtNear; // 简化计算
    } else {
      throw new Error("Unsupported frustum type");
    }

    return pixelSize;
  }

  /**
   * @descripttion: 计算聚合距离（以米为单位）
   * @param {AbstractCore} xgCore - xg-core实例
   * @param {number} factor - 距离系数，默认值为30
   * @return {number}
   * @author: EV-申小虎
   */
  calculateClusterDistance(
    factor = 30,
    minDistance?: number,
    maxDistance?: number
  ) {
    const viewer = this.viewer;
    const camera = viewer.camera;
    const scene = viewer.scene;
    const ellipsoid = scene.globe.ellipsoid;

    // 获取相机到地球表面的距离
    const cameraHeight = camera.positionCartographic.height;

    // 获取视图的分辨率
    const pixelSize = this.getGroundDistanceByPixel();

    // 根据相机高度和视图分辨率计算聚合距离
    let clusterDistance =
      pixelSize * (cameraHeight / ellipsoid.maximumRadius) * factor;

    // 限制聚合距离范围
    minDistance &&
      clusterDistance < minDistance &&
      (clusterDistance = minDistance);
    maxDistance &&
      clusterDistance > maxDistance &&
      (clusterDistance = maxDistance);

    return clusterDistance;
  }

  load(config: XgConfig) {
    const { scene, basemaps, layers } = config;

    /// 设置场景

    /// 设置底图
    this.layerManager.loadBaseMaps(basemaps ?? []);

    /// 设置图层
    this.layerManager.loadLayers(layers ?? []);
  }

  resize() {
    this.viewer.resize();
  }

  destroy() {
    this.viewer.scene.primitives.removeAll();
    this.viewer.dataSources.removeAll();

    this.viewer.scene.destroy();
  }
}
