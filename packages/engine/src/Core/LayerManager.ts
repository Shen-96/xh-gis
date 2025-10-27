/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-03-26 20:05:36
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:35:30
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
import GraphicManager from "./GraphicManager";
import GraphicUtils from "./GraphicUtils";
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

/**
 * @descripttion: 图层记录管理器
 * @author: EV-申小虎
 */
class LayerManager extends AbstractManager {
  readonly #layerMap: Map<string, Layer<LayerItem>>;

  /**
   * @descripttion: 图层记录管理器
   * @author: EV-申小虎
   */
  constructor(core: AbstractCore) {
    super(core);
    this.#layerMap = new Map();
  }

  /**
   * @descripttion: 添加图层记录
   * @param {string} id 添加图层记录
   * @param {LayerType} type 图层类型
   * @param {T} layer 图层数据
   * @return {*}
   * @author: EV-申小虎
   */
  #registerLayer<T extends LayerItem>(
    id: string,
    type: LayerType,
    layer: T,
    pid?: string
  ) {
    if (id && layer) {
      if (!this.isExists(id)) {
        this.#layerMap.set(id, { id, type, item: layer, pid });
      }
    }
  }

  /**
   * @descripttion: 获取当前层级
   * @param {Viewer} viewer
   * @return {*}
   * @author: EV-申小虎
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
   * @author: EV-申小虎
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

  add<T extends LayerItem>(id: string, layer: T, show = true, index?: number) {
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

      layer.show = show;

      this.#registerLayer(id, LayerType.ENTITY, layer);

      return layer;
    }
    /// 数据源
    if (layer instanceof GeoJsonDataSource) {
      return new Promise((resolve, reject) => {
        this.viewer.dataSources
          .add(layer)
          .then((dataSource) => {
            layer.show = show;

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
            layer.show = show;

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
            layer.show = show;

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
            layer.show = show;

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

      primitive.show = show;

      this.#registerLayer(id, LayerType.PRIMITIVE, primitive);

      return primitive;
    }
    /// 图元集
    if (layer instanceof PrimitiveCollection) {
      const primitiveCollection: PrimitiveCollection =
        this.viewer.scene.primitives.add(layer);

      primitiveCollection.show = show;

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

      layer.show = show;

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
      // this.viewer.terrainProvider = layer;
      this.viewer.scene.terrainProvider = layer;

      this.#registerLayer(id, LayerType.TERRAIN, this.viewer.terrainProvider);

      return this.viewer.scene.terrainProvider;
    }
  }

  /**
   * @descripttion: 是否存在图层
   * @param {string} id 图层唯一标识
   * @return {boolean} 查询结果
   * @author: EV-申小虎
   */
  isExists(id: string) {
    return this.#layerMap.has(id);
  }

  /**
   * @descripttion: 获取图层
   * @param {string} id 图层唯一标识
   * @return {LayerRecord} 图层记录
   * @author: EV-申小虎
   */
  getById<T extends LayerItem>(id: string): T | undefined {
    const layerRecord = this.#layerMap.get(String(id));
    return layerRecord?.item ? (layerRecord.item as T) : undefined;
  }

  /**
   * @descripttion: 获取图层记录（包含 id/type/item/pid）
   * @param {string} id 图层唯一标识
   * @return {Layer<LayerItem> | undefined} 图层记录
   * @author: EV-申小虎
   */
  getLayerRecord(id: string): Layer<LayerItem> | undefined {
    return this.#layerMap.get(String(id));
  }

  /**
   * @descripttion: 按类型列出图层记录
   * @param {LayerType} type 图层类型
   * @return {Array<Layer<LayerItem>>} 图层记录列表
   * @author: EV-申小虎
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
   * @author: EV-申小虎
   */
  listAll(): Array<Layer<LayerItem>> {
    return Array.from(this.#layerMap.values());
  }

  /**
   * @descripttion: 按分组（pid）列出图层记录
   * @param {string} pid 分组标识
   * @return {Array<Layer<LayerItem>>} 图层记录列表
   * @author: EV-申小虎
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
   * @author: EV-申小虎
   */
  setLayerVisible(id: string, visible: boolean): void {
    const record = this.#layerMap.get(String(id));
    if (!record) return;
    this.setVisible(id, record.type, visible);
  }

  /**
   * @descripttion: 批量删除指定类型的图层
   * @param {LayerType} type 图层类型
   * @param {boolean} destroy 是否销毁（默认false）
   * @return {number} 删除数量
   * @author: EV-申小虎
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
   * @author: EV-申小虎
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
   * @author: EV-申小虎
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
   * @author: EV-申小虎
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
   * @author: EV-申小虎
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
   * @author: EV-申小虎
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
