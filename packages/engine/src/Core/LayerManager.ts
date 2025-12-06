/*
 * @Descripttion:
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2021-03-26 20:05:36
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-05 18:03:24
 */
import {
  GeoJsonDataSource,
  DataSource,
  ImageryLayer,
  ImageryProvider,
  UrlTemplateImageryProvider,
  WebMapTileServiceImageryProvider,
  CustomDataSource,
  IonImageryProvider,
  BingMapsImageryProvider,
  ArcGisMapServerImageryProvider,
  CzmlDataSource,
  WebMapServiceImageryProvider,
  SingleTileImageryProvider,
  KmlDataSource,
  Primitive,
  PrimitiveCollection,
  TerrainProvider,
  CesiumTerrainProvider,
  EllipsoidTerrainProvider,
  Entity,
  createWorldTerrainAsync,
  Cartographic,
  sampleTerrain,
  Credit,
  createGuid,
} from "cesium";
import { BasemapConfig, Layer, LayerConfig, LayerItem } from "../types";
import { GraphicType, LayerType } from "../enum";
import CoordinateUtils from "./CoordinateUtils";
import MathUtils from "./MathUtils";
import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";
import GeometryUtils from "./GeometryUtils";
import {
  addTdtLayer as addTdtLayerFromLoader,
  addPublicLayer as addPublicLayerFromLoader,
  loadBaseMaps as loadBaseMapsFromLoader,
} from "./Loaders/BasemapLoader";
import { loadLayers as loadLayersFromLoader } from "./Loaders/LayerConfigLoader";

/// 天地图token列表
const tdtTKList = [
  "cfa3e740d98acc6adf3581323d75f38b",
  "e43be49450444a791814c3c913e1047c",
  "65a414ddff616a2671130b254abb47ef",
];

// 事件类型（字符串联合）
type LayerManagerEvent =
  | "added"
  | "removed"
  | "cleared"
  | "visibleChanged"
  | "sizeChanged"
  | "collectionChanged";

/**
 * @descripttion: 图层记录管理器
 * @author: Xiaohu.Shen
 */
class LayerManager extends AbstractManager {
  readonly #layerMap: Map<string, Layer<LayerItem>>;
  /**
   * 事件监听集合（轻量版）。
   * 支持的事件：
   * - added: 有图层记录被添加
   * - removed: 有图层记录被移除
   * - cleared: 图层记录被批量清除（当前未使用，预留）
   * - visibleChanged: 某图层的可见性发生变化
   * - sizeChanged: 图层记录数量发生变化
   * - collectionChanged: 图层记录集合发生变化
   */
  private listeners: Record<LayerManagerEvent, Set<(payload: any) => void>>;

  /**
   * @descripttion: 图层记录管理器
   * @author: Xiaohu.Shen
   */
  constructor(core: AbstractCore) {
    super(core);
    this.#layerMap = new Map();
    this.listeners = {
      added: new Set(),
      removed: new Set(),
      cleared: new Set(),
      visibleChanged: new Set(),
      sizeChanged: new Set(),
      collectionChanged: new Set(),
    };
  }

  /** LayerManager 事件类型 */
  public on(event: LayerManagerEvent, listener: (payload: any) => void) {
    this.listeners[event]?.add(listener);
  }

  public off(event: LayerManagerEvent, listener: (payload: any) => void) {
    this.listeners[event]?.delete(listener);
  }

  /** 内部分发事件，并派发派生事件保证集合与数量同步 */
  private emit(event: LayerManagerEvent, payload?: any) {
    const set = this.listeners[event];
    set?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error("LayerManager listener error:", e);
      }
    });
    if (event === "added" || event === "removed" || event === "cleared") {
      const sizeSet = this.listeners["sizeChanged"];
      sizeSet?.forEach((fn) => {
        try {
          fn(this.#layerMap.size);
        } catch (e) {
          console.error("LayerManager sizeChanged listener error:", e);
        }
      });
      const colSet = this.listeners["collectionChanged"];
      const list = this.listAll();
      colSet?.forEach((fn) => {
        try {
          fn(list);
        } catch (e) {
          console.error("LayerManager collectionChanged listener error:", e);
        }
      });
    }
  }

  /** 事件字面量类型定义（字符串联合） */
  public static Events = {
    added: "added",
    removed: "removed",
    cleared: "cleared",
    visibleChanged: "visibleChanged",
    sizeChanged: "sizeChanged",
    collectionChanged: "collectionChanged",
  } as const;

  /**
   * @descripttion: 添加图层记录
   * @param {string} id 添加图层记录
   * @param {LayerType} type 图层类型
   * @param {T} layer 图层数据
   * @return {*}
   * @author: Xiaohu.Shen
   */
  #registerLayer<T extends LayerItem>(
    id: string,
    type: LayerType,
    layer: T,
    pid?: string
  ) {
    if (id && layer) {
      if (!this.isExists(id)) {
        const record = { id, type, item: layer, pid } as Layer<LayerItem>;
        this.#layerMap.set(id, record);
        this.emit("added", record);
      }
    }
  }

  /**
   * @descripttion: 获取当前层级
   * @param {Viewer} viewer
   * @return {*}
   * @author: Xiaohu.Shen
   */
  get currentLevel() {
    const height = Math.ceil(this.viewer.camera.positionCartographic.height),
      A = 40487.57,
      B = 0.00007096758,
      C = 91610.74,
      D = -40467.74;
    return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)));
  }

  /**
   * @descripttion: 根据层级获取地形高程
   * @param {Cartesian3} car3 笛卡尔坐标
   * @param {number} level 层级
   * @return {Promise} 回调
   * @author: Xiaohu.Shen
   */
  getTerrainHeightByLevel(longitude: number, latitude: number, level: number) {
    const cartographic = Cartographic.fromDegrees(longitude, latitude),
      cartographics: Cartographic[] = [cartographic],
      promise = sampleTerrain(
        this.viewer.scene.terrainProvider,
        level,
        cartographics
      );
    return promise;
  }

  add(
    id: string,
    layer: Entity,
    show?: boolean,
    index?: number
  ): Entity | undefined;
  add<T extends DataSource>(
    id: string,
    layer: T,
    show?: boolean,
    index?: number
  ): Promise<T | undefined>;
  add<T extends Primitive>(
    id: string,
    layer: T,
    show?: boolean,
    index?: number
  ): Primitive | undefined;
  add<T extends PrimitiveCollection>(
    id: string,
    layer: T,
    show?: boolean,
    index?: number
  ): PrimitiveCollection | undefined;
  add<T extends ImageryLayer>(
    id: string,
    layer: T,
    show?: boolean,
    index?: number
  ): ImageryLayer | undefined;
  add<T extends ImageryProvider>(
    id: string,
    layer: T,
    show?: boolean,
    index?: number
  ): ImageryLayer | undefined;
  add<T extends TerrainProvider>(
    id: string,
    layer: T,
    show?: boolean,
    index?: number
  ): TerrainProvider | undefined;
  // 移除对 AbstractGraphic 的重载支持，彻底与 GraphicManager 解耦

  add(id: string, layer: LayerItem, show: boolean = true, index?: number) {
    /// 判断是否已存在
    if (!id) {
      throw new Error("id 未定义");
    }
    if (this.isExists(id)) {
      throw new Error(`${id} 该条数据已存在`);
    }
    /// 实体
    if (layer instanceof Entity) {
      this.viewer.entities.add(layer);

      (layer as Entity).show = show;

      this.#registerLayer(id, LayerType.ENTITY, layer);

      return layer;
    }
    /// 数据源
    if (layer instanceof GeoJsonDataSource) {
      return new Promise((resolve, reject) => {
        this.viewer.dataSources
          .add(layer)
          .then((dataSource) => {
            (layer as GeoJsonDataSource).show = show;

            this.#registerLayer(id, LayerType.GEOJSON_DATASOURCE, dataSource);

            resolve(dataSource);
          })
          .catch(() => {
            reject(undefined);
          });
      });
    }
    if (layer instanceof CustomDataSource) {
      return new Promise((resolve, reject) => {
        this.viewer.dataSources
          .add(layer)
          .then((dataSource) => {
            (layer as CustomDataSource).show = show;

            this.#registerLayer(id, LayerType.CUSTOM_DATASOURCE, dataSource);

            resolve(dataSource);
          })
          .catch(() => {
            reject(undefined);
          });
      });
    }
    if (layer instanceof KmlDataSource) {
      return new Promise((resolve, reject) => {
        this.viewer.dataSources
          .add(layer)
          .then((dataSource) => {
            (layer as KmlDataSource).show = show;

            this.#registerLayer(id, LayerType.KML_DATASOURCE, dataSource);

            resolve(dataSource);
          })
          .catch(() => {
            reject(undefined);
          });
      });
    }
    if (layer instanceof CzmlDataSource) {
      return new Promise((resolve, reject) => {
        this.viewer.dataSources
          .add(layer)
          .then((dataSource) => {
            (layer as CzmlDataSource).show = show;

            this.#registerLayer(id, LayerType.CZML_DATASOURCE, dataSource);

            resolve(dataSource);
          })
          .catch(() => {
            reject(undefined);
          });
      });
    }
    /// 图元
    if (layer instanceof Primitive) {
      const primitive: Primitive = this.viewer.scene.primitives.add(layer);

      (primitive as Primitive).show = show;

      this.#registerLayer(id, LayerType.PRIMITIVE, primitive);

      return primitive;
    }
    /// 图元集
    if (layer instanceof PrimitiveCollection) {
      const primitiveCollection: PrimitiveCollection =
        this.viewer.scene.primitives.add(layer);

      (primitiveCollection as PrimitiveCollection).show = show;

      this.#registerLayer(
        id,
        LayerType.PRIMITIVE_COLLECTION,
        primitiveCollection
      );

      return primitiveCollection;
    }
    /// 影像数据图层
    if (layer instanceof ImageryLayer) {
      this.viewer.scene.imageryLayers.add(layer, index);

      (layer as ImageryLayer).show = show;

      this.#registerLayer(id, LayerType.IMAGERY, layer);

      return layer;
    }
    /// 影像提供者
    if (
      /// WMTS
      layer instanceof WebMapTileServiceImageryProvider ||
      /// WMS
      layer instanceof WebMapServiceImageryProvider ||
      /// URL
      layer instanceof UrlTemplateImageryProvider ||
      layer instanceof ArcGisMapServerImageryProvider ||
      layer instanceof BingMapsImageryProvider ||
      layer instanceof SingleTileImageryProvider ||
      layer instanceof IonImageryProvider
    ) {
      const imageryLayer = this.viewer.scene.imageryLayers.addImageryProvider(
        layer,
        index
      );

      imageryLayer.show = show;

      this.#registerLayer(id, LayerType.IMAGERY, imageryLayer);

      return imageryLayer;
    }
    /// DEM
    if (layer instanceof TerrainProvider) {
      this.viewer.scene.terrainProvider = layer;

      this.#registerLayer(id, LayerType.TERRAIN, this.viewer.terrainProvider);

      return this.viewer.scene.terrainProvider;
    }
  }

  // 已移除对 AbstractGraphic 的支持

  /**
   * @descripttion: 是否存在图层
   * @param {string} id 图层唯一标识
   * @return {boolean} 查询结果
   * @author: Xiaohu.Shen
   */
  isExists(id: string) {
    return this.#layerMap.has(id);
  }

  /**
   * @descripttion: 获取图层
   * @param {string} id 图层唯一标识
   * @return {LayerRecord} 图层记录
   * @author: Xiaohu.Shen
   */
  getById<T extends LayerItem>(id: string): T | undefined {
    const layerRecord = this.#layerMap.get(String(id));
    return layerRecord?.item ? (layerRecord.item as T) : undefined;
  }

  /**
   * @descripttion: 获取图层记录（包含 id/type/item/pid）
   * @param {string} id 图层唯一标识
   * @return {Layer<LayerItem> | undefined} 图层记录
   * @author: Xiaohu.Shen
   */
  getLayerRecord(id: string): Layer<LayerItem> | undefined {
    return this.#layerMap.get(String(id));
  }

  /**
   * @descripttion: 按类型列出图层记录
   * @param {LayerType} type 图层类型
   * @return {Array<Layer<LayerItem>>} 图层记录列表
   * @author: Xiaohu.Shen
   */
  listByType(type: LayerType): Array<Layer<LayerItem>> {
    const list: Array<Layer<LayerItem>> = [];
    for (const record of this.#layerMap.values()) {
      if (record.type === type) list.push(record);
    }
    return list;
  }

  /**
   * @descripttion: 列出所有图层记录
   * @return {Array<Layer<LayerItem>>} 全部图层记录
   * @author: Xiaohu.Shen
   */
  listAll(): Array<Layer<LayerItem>> {
    return Array.from(this.#layerMap.values());
  }

  /**
   * @descripttion: 按分组（pid）列出图层记录
   * @param {string} pid 分组标识
   * @return {Array<Layer<LayerItem>>} 图层记录列表
   * @author: Xiaohu.Shen
   */
  listByPid(pid: string): Array<Layer<LayerItem>> {
    const list: Array<Layer<LayerItem>> = [];
    for (const record of this.#layerMap.values()) {
      if (record.pid === pid) list.push(record);
    }
    return list;
  }

  /**
   * @descripttion: 设置图层可见性（自动匹配记录类型）
   * @param {string} id 图层唯一标识
   * @param {boolean} visible 是否可见
   * @return {void}
   * @author: Xiaohu.Shen
   */
  setLayerVisible(id: string, visible: boolean): void {
    const record = this.#layerMap.get(String(id));
    if (!record) return;
    this.setVisible(id, record.type, visible);
    this.emit("visibleChanged", { id, type: record.type, visible });
  }

  /**
   * 设置图层分组（pid）。用于在记录展示中显示“标绘”等分组标签。
   */
  setLayerGroup(id: string, pid?: string): void {
    const record = this.#layerMap.get(String(id));
    if (!record) return;
    // 更新记录的分组
    (record as any).pid = pid;
    this.#layerMap.set(String(id), record);
    // 分发集合变化事件，便于 UI 刷新
    this.emit("collectionChanged", this.listAll());
  }

  /**
   * @descripttion: 批量删除指定类型的图层
   * @param {LayerType} type 图层类型
   * @param {boolean} destroy 是否销毁（默认false）
   * @return {number} 删除数量
   * @author: Xiaohu.Shen
   */
  removeByType(type: LayerType, destroy = false): number {
    const toRemove: string[] = [];
    for (const [id, record] of this.#layerMap.entries()) {
      if (record.type === type) toRemove.push(id);
    }
    let count = 0;
    for (const id of toRemove) {
      if (this.removeById(id, destroy)) count++;
    }
    return count;
  }

  /**
   * @descripttion: 批量删除指定分组（pid）的图层
   * @param {string} pid 分组标识
   * @param {boolean} destroy 是否销毁（默认false）
   * @return {number} 删除数量
   * @author: Xiaohu.Shen
   */
  removeByPid(pid: string, destroy = false): number {
    const toRemove: string[] = [];
    for (const [id, record] of this.#layerMap.entries()) {
      if (record.pid === pid) toRemove.push(id);
    }
    let count = 0;
    for (const id of toRemove) {
      if (this.removeById(id, destroy)) count++;
    }
    return count;
  }

  getOrCreate(id: string, layerType: LayerType.ENTITY): Entity | undefined;
  getOrCreate(
    id: string,
    layerType: LayerType.CUSTOM_DATASOURCE
  ): Promise<CustomDataSource | undefined>;
  getOrCreate(
    id: string,
    layerType: LayerType.CZML_DATASOURCE
  ): Promise<CzmlDataSource | undefined>;
  getOrCreate(
    id: string,
    layerType: LayerType.GEOJSON_DATASOURCE
  ): Promise<GeoJsonDataSource | undefined>;
  getOrCreate(
    id: string,
    layerType: LayerType.GEOJSON_DATASOURCE,
    load: { data: any; options?: any }
  ): Promise<GeoJsonDataSource | undefined>;
  getOrCreate(
    id: string,
    layerType: LayerType.KML_DATASOURCE
  ): Promise<KmlDataSource | undefined>;
  getOrCreate(
    id: string,
    layerType: LayerType.KML_DATASOURCE,
    load: { data: any; options?: any }
  ): Promise<KmlDataSource | undefined>;

  /**
   * @descripttion: 获取或创建图层
   * @param {string} id 唯一标识
   * @param {LayerType} layerType 图层类型
   * @return {*}
   * @author: Xiaohu.Shen
   */
  getOrCreate(id: string, layerType: LayerType) {
    /// 实体
    if (layerType == LayerType.ENTITY) {
      const layer = this.getById<Entity>(id);
      if (layer) return layer;
      else {
        const entity = new Entity();
        return this.add(id, entity);
      }
    }
    /// 数据源
    if (layerType == LayerType.CUSTOM_DATASOURCE) {
      return new Promise((resolve, reject) => {
        const layer = this.getById<DataSource>(id);
        if (layer) resolve(layer as CustomDataSource);
        else {
          this.add(id, new CustomDataSource())
            .then((dataSource) => {
              dataSource
                ? resolve(dataSource as CustomDataSource)
                : reject(undefined);
            })
            .catch(() => reject(undefined));
        }
      });
    }
    /// 数据源
    if (layerType == LayerType.CZML_DATASOURCE) {
      return new Promise((resolve, reject) => {
        const layer = this.getById<DataSource>(id);
        if (layer) resolve(layer as CzmlDataSource);
        else {
          this.add(id, new CzmlDataSource())
            .then((dataSource) => {
              dataSource
                ? resolve(dataSource as CzmlDataSource)
                : reject(undefined);
            })
            .catch(() => reject(undefined));
        }
      });
    }
    /// 数据源
    if (layerType == LayerType.GEOJSON_DATASOURCE) {
      return new Promise((resolve, reject) => {
        const layer = this.getById<DataSource>(id);
        if (layer) resolve(layer as GeoJsonDataSource);
        else {
          const hasLoad =
            arguments.length >= 3 && !!(arguments[2] as any)?.data;
          if (hasLoad) {
            const { data, options } = (arguments[2] as any) ?? {};
            GeoJsonDataSource.load(data, options)
              .then(async (ds) => {
                const added = await this.add(id, ds);
                added ? resolve(added as GeoJsonDataSource) : reject(undefined);
              })
              .catch(() => reject(undefined));
          } else {
            this.add(id, new GeoJsonDataSource())
              .then((dataSource) => {
                dataSource
                  ? resolve(dataSource as GeoJsonDataSource)
                  : reject(undefined);
              })
              .catch(() => reject(undefined));
          }
        }
      });
    }
    /// 数据源
    if (layerType == LayerType.KML_DATASOURCE) {
      return new Promise((resolve, reject) => {
        const layer = this.getById<DataSource>(id);
        if (layer) resolve(layer as KmlDataSource);
        else {
          const hasLoad =
            arguments.length >= 3 && !!(arguments[2] as any)?.data;
          if (hasLoad) {
            const { data, options } = (arguments[2] as any) ?? {};
            KmlDataSource.load(data, options)
              .then(async (ds) => {
                const added = await this.add(id, ds);
                added ? resolve(added as KmlDataSource) : reject(undefined);
              })
              .catch(() => reject(undefined));
          } else {
            this.add(id, new KmlDataSource())
              .then((dataSource) => {
                dataSource
                  ? resolve(dataSource as KmlDataSource)
                  : reject(undefined);
              })
              .catch(() => reject(undefined));
          }
        }
      });
    }
  }

  /**
   * @descripttion: 加载基础图层
   * @return {void}
   * @author: Xiaohu.Shen
   */
  async addPublicLayer(
    options: {
      imageLayer?: "TDT_IMG" | "TDT_VCT" | "TDT_TER";
      labelLayer?: boolean;
      terrainLayer?: "NONE" | "PUB" | "CASIA";
    } = {
      imageLayer: "TDT_IMG",
      labelLayer: false,
      terrainLayer: "NONE",
    }
  ) {
    return await addPublicLayerFromLoader(this, options);
  }

  /**
   * @descripttion: 加载基础图层
   * @return {void}
   * @author: Xiaohu.Shen
   */
  async addTdtLayer(
    layer: "img" | "cia" | "vec" | "cva" | "ter" | "cta",
    name?: string,
    options?: {
      tileMatrixSetID?: string;
      minimumLevel?: number;
      maximumLevel?: number;
      subdomains?: string[];
      token?: string;
      tokenResolver?: () => string | Promise<string>;
    }
  ) {
    return await addTdtLayerFromLoader(this, layer, name, options);
  }

  addBasemapLayers(baseMaps: Array<BasemapConfig>) {
    return loadBaseMapsFromLoader(this, baseMaps);
  }

  addLayersFromConfig(layers: Array<LayerConfig>) {
    return loadLayersFromLoader(this, layers);
  }

  /**
   * @descripttion: 删除图层
   * @param {string} id 图层唯一索引
   * @param {*} destroy 是否销毁（默认false）
   * @return {*}
   * @author: Xiaohu.Shen
   */
  removeById(id: string, destroy = false) {
    let result = false;
    if (this.isExists(id)) {
      const record = this.#layerMap.get(id);
      const { type, item } = record!;

      switch (type) {
        case LayerType.ENTITY:
          this.viewer.entities.remove(item as Entity);
          break;
        case LayerType.CUSTOM_DATASOURCE:
        case LayerType.CZML_DATASOURCE:
        case LayerType.GEOJSON_DATASOURCE:
        case LayerType.KML_DATASOURCE:
          {
            (<DataSource>item).entities.removeAll();
            this.viewer.dataSources.remove(item as DataSource, destroy);
          }
          break;
        case LayerType.IMAGERY:
          this.viewer.scene.imageryLayers.remove(item as ImageryLayer, destroy);
          break;
        case LayerType.PRIMITIVE:
        case LayerType.PRIMITIVE_COLLECTION:
          this.viewer.scene.primitives.remove(item);
          // destroy && (item as Primitive | PrimitiveCollection).destroy();
          break;

        default:
          break;
      }
      this.#layerMap.delete(id);
      this.emit("removed", record);
      result = true;
    }
    return result;
  }

  setVisible(id: string, layerType: LayerType, visible: boolean) {
    switch (layerType) {
      case LayerType.ENTITY: {
        const layer = this.getById<Entity>(id);
        if (layer) layer.show = visible;
        break;
      }
      case LayerType.CUSTOM_DATASOURCE:
      case LayerType.CZML_DATASOURCE:
      case LayerType.GEOJSON_DATASOURCE:
      case LayerType.KML_DATASOURCE: {
        const layer = this.getById<DataSource>(id);
        if (layer) layer.show = visible;
        break;
      }
      case LayerType.IMAGERY: {
        const layer = this.getById<ImageryLayer>(id);
        if (layer) layer.show = visible;
        break;
      }
      case LayerType.PRIMITIVE: {
        const layer = this.getById<Primitive>(id);
        if (layer) (layer as any).show = visible;
        break;
      }
      case LayerType.PRIMITIVE_COLLECTION: {
        const layer = this.getById<PrimitiveCollection>(id);
        if (layer) (layer as any).show = visible;
        break;
      }
      case LayerType.TERRAIN: {
        const layer = this.getById<TerrainProvider>(id);
        if (layer) {
          this.viewer.scene.terrainProvider = visible
            ? layer
            : new EllipsoidTerrainProvider();
        }
        break;
      }
      default:
        break;
    }
  }
}

export default LayerManager;
