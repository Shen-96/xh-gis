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
  Entity,
  createWorldTerrainAsync,
  Cartographic,
  sampleTerrain,
  Credit,
  createGuid,
} from "cesium";
import {
  BasemapConfig,
  CoordinateUtils,
  GraphicManager,
  GraphicType,
  GraphicUtils,
  Layer,
  LayerConfig,
  LayerItem,
  LayerType,
  MathUtils,
} from "..";
import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";
import GeometryUtils from "./GeometryUtils";

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
  readonly #layerArr: Array<Layer<LayerItem>>;

  /**
   * @descripttion: 图层记录管理器
   * @author: EV-申小虎
   */
  constructor(core: AbstractCore) {
    super(core);
    this.#layerArr = [];
  }

  /**
   * @descripttion: 添加图层记录
   * @param {string} id 添加图层记录
   * @param {LayerType} type 图层类型
   * @param {T} layer 图层数据
   * @return {*}
   * @author: EV-申小虎
   */
  #addLayer<T extends LayerItem>(
    id: string,
    type: LayerType,
    layer: T,
    pid?: string
  ) {
    if (id && layer) {
      if (!this.isExists(id)) {
        this.#layerArr.push({ id, type, item: layer, pid });
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

      this.#addLayer(id, LayerType.ENTITY, layer);

      return layer;
    }
    /// 数据源
    if (layer instanceof GeoJsonDataSource) {
      return new Promise((resolve, reject) => {
        this.viewer.dataSources
          .add(layer)
          .then((dataSource) => {
            layer.show = show;

            this.#addLayer(id, LayerType.GEOJSON_DATASOURCE, dataSource);

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

            this.#addLayer(id, LayerType.CUSTOM_DATASOURCE, dataSource);

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

            this.#addLayer(id, LayerType.KML_DATASOURCE, dataSource);

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

            this.#addLayer(id, LayerType.CZML_DATASOURCE, dataSource);

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

      this.#addLayer(id, LayerType.PRIMITIVE, primitive);

      return primitive;
    }
    /// 图元集
    if (layer instanceof PrimitiveCollection) {
      const primitiveCollection: PrimitiveCollection =
        this.viewer.scene.primitives.add(layer);

      primitiveCollection.show = show;

      this.#addLayer(id, LayerType.PRIMITIVE, primitiveCollection);

      return primitiveCollection;
    }
    /// 影像数据图层
    if (layer instanceof ImageryLayer) {
      this.viewer.scene.imageryLayers.add(layer, index);

      layer.show = show;

      this.#addLayer(id, LayerType.IMAGERY, layer);

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

      this.#addLayer(id, LayerType.IMAGERY, imageryLayer);

      return imageryLayer;
    }
    /// DEM
    if (layer instanceof TerrainProvider) {
      // this.viewer.terrainProvider = layer;
      this.viewer.scene.terrainProvider = layer;

      this.#addLayer(id, LayerType.TERRAIN, this.viewer.terrainProvider);

      return this.viewer.scene.terrainProvider;
    }
    if (layer instanceof CesiumTerrainProvider) {
      // this.viewer.terrainProvider = layer;
      this.viewer.scene.terrainProvider = layer;

      this.#addLayer(id, LayerType.TERRAIN, this.viewer.terrainProvider);

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
    return this.#layerArr.findIndex((item) => item.id === id) >= 0;
  }

  /**
   * @descripttion: 获取图层
   * @param {string} id 图层唯一标识
   * @return {LayerRecord} 图层记录
   * @author: EV-申小虎
   */
  getById<T extends LayerItem>(id: string): T | undefined {
    const layerRecord = this.#layerArr.find(
      (layer) => String(layer.id) === String(id)
    );

    return layerRecord?.item ? (layerRecord.item as T) : undefined;
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
      return new Promise((reslove, reject) => {
        const layer = this.getById<DataSource>(id);
        if (layer) reslove(layer);
        else {
          this.add(id, new CustomDataSource())
            .then((dataSource) => {
              dataSource ? reslove(dataSource) : reject(undefined);
            })
            .catch(() => reject(undefined));
        }
      });
    }
    /// 数据源
    if (layerType == LayerType.CZML_DATASOURCE) {
      return new Promise((reslove, reject) => {
        const layer = this.getById<DataSource>(id);
        if (layer) reslove(layer);
        else {
          this.add(id, new CzmlDataSource())
            .then((dataSource) => {
              dataSource ? reslove(dataSource) : reject(undefined);
            })
            .catch(() => reject(undefined));
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
    const { imageLayer, labelLayer, terrainLayer } = options;

    if (imageLayer == "TDT_IMG" || imageLayer == undefined) {
      /// 随机使用一个天地图token
      const tdtToken =
          tdtTKList[MathUtils.randomWithRange(0, tdtTKList.length - 1)],
        globeProvider = new WebMapTileServiceImageryProvider({
          url: `https://{s}.tianditu.gov.cn/img_w/wmts?tk=${tdtToken}`,
          layer: "img",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "w",
          maximumLevel: 18,
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        });

      await this.add("tdtDomImageLayer", globeProvider);

      if (labelLayer) {
        const labelProvider = new WebMapTileServiceImageryProvider({
          // url: `http://{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=label&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tdtToken}`,
          // layer: "cia",
          // style: "default",
          // minimumLevel: 0,
          // maximumLevel: 15,
          // format: "image/jpeg",
          // tileMatrixSetID: "GoogleMapsCompatible",
          url: `https://{s}.tianditu.gov.cn/cia_w/wmts?tk=${tdtToken}`,
          layer: "cia",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "w",
          maximumLevel: 18,
          credit: new Credit("天地图注记服务"),
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        });

        await this.add("tdtLabelImageLayer", labelProvider);
      }
    }

    if (imageLayer == "TDT_VCT") {
      /// 随机使用一个天地图token
      const tdtToken =
          tdtTKList[MathUtils.randomWithRange(0, tdtTKList.length - 1)],
        globeProvider = new WebMapTileServiceImageryProvider({
          url: `https://{s}.tianditu.gov.cn/vec_w/wmts?tk=${tdtToken}`,
          layer: "vec",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "w",
          maximumLevel: 18,
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        });

      await this.add("tdtVctImageLayer", globeProvider);

      if (labelLayer) {
        const labelProvider = new WebMapTileServiceImageryProvider({
          url: `https://{s}.tianditu.gov.cn/cva_w/wmts?tk=${tdtToken}`,
          layer: "cva",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "w",
          maximumLevel: 18,
          credit: new Credit("天地图注记服务"),
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        });

        await this.add("tdtLabelImageLayer", labelProvider);
      }
    }

    if (imageLayer == "TDT_TER") {
      /// 随机使用一个天地图token
      const tdtToken =
          tdtTKList[MathUtils.randomWithRange(0, tdtTKList.length - 1)],
        globeProvider = new WebMapTileServiceImageryProvider({
          url: `https://{s}.tianditu.gov.cn/ter_w/wmts?tk=${tdtToken}`,
          layer: "ter",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "w",
          maximumLevel: 18,
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        });

      await this.add("tdtTerImageLayer", globeProvider);

      if (labelLayer) {
        const labelProvider = new WebMapTileServiceImageryProvider({
          url: `https://{s}.tianditu.gov.cn/cta_w/wmts?tk=${tdtToken}`,
          layer: "cta",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "w",
          maximumLevel: 18,
          credit: new Credit("天地图注记服务"),
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        });

        await this.add("tdtLabelImageLayer", labelProvider);
      }
    }

    if (terrainLayer == "CASIA") {
      const terrainProvider = await CesiumTerrainProvider.fromUrl(
        "http://172.18.29.31:8070/china30dem_ctb_zoom14"
      );

      this.add("basicTerrainLayer", terrainProvider);
    }

    if (terrainLayer == "PUB") {
      const terrainProvider = await createWorldTerrainAsync();

      this.add("basicTerrainLayer", terrainProvider);
    }

    //ArcMap
    // globeProvider = new Cesium.ArcGisMapServerImageryProvider({
    //     // // online
    //     // url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    //     // // http
    //     // url: 'http://vmsgis.cnpc.com.cn:9001/arcgis/rest/services/Map/chinaimage/MapServer',
    //     // token: "VPdJZnAZCyPzq-cU2ShEUirPD0nKLbAP7CvPA2hlfmdCh5pXF5wcbZmTzQf4LqRG",
    //     // https
    //     // url: 'https://vms.cnpc.com.cn:7902/arcgis/rest/services/Map/chinaimage/MapServer',
    //     // token: "SFJnaLGvKf7s_d3em1aPLqyK5AJH-tatOTXvdQ20Q_ckW5JSipyrNP1nm9ITvWiS",
    //     // // label
    //     url: 'https://vms.cnpc.com.cn:7902/arcgis/rest/services/Map/china/MapServer/tile',
    //     token: '1FMKCWARLQ-LjM0SMmCOZcqsQzZn2GmnYDS5JaTrM3SkE6q4-m6iFQZwjm8eFxTHoZT9P_uMzM72y7qjufQ7eQ..'
    // });
    // GoogleMap
    // globeProvider = new Cesium.UrlTemplateImageryProvider({
    //     url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
    //     tilingScheme: new Cesium.WebMercatorTilingScheme(),
    //     // minimumLevel: this.layerLevel.minimumLevel,
    //     // maximumLevel: this.layerLevel.maximumLevel,
    // });
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
    }
  ) {
    /// 随机使用一个天地图token
    const tdtToken =
      tdtTKList[MathUtils.randomWithRange(0, tdtTKList.length - 1)];
    const { tileMatrixSetID, maximumLevel, subdomains } = {
      tileMatrixSetID: "w",
      maximumLevel: 18,
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
      ...options,
    };

    const tdtProvider = new WebMapTileServiceImageryProvider({
      url: `https://{s}.tianditu.gov.cn/${layer}_${tileMatrixSetID}/wmts?tk=${tdtToken}`,
      layer,
      style: "default",
      format: "tiles",
      tileMatrixSetID,
      maximumLevel,
      subdomains,
    });

    return await this.add(name ?? `tdt_${layer}_image_layer`, tdtProvider);

    // if (terrainLayer == "CASIA") {
    //   const terrainProvider = await CesiumTerrainProvider.fromUrl(
    //     "http://172.18.29.31:8070/china30dem_ctb_zoom14"
    //   );

    //   this.add("basicTerrainLayer", terrainProvider);
    // }

    //ArcMap
    // globeProvider = new Cesium.ArcGisMapServerImageryProvider({
    //     // // online
    //     // url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    //     // // http
    //     // url: 'http://vmsgis.cnpc.com.cn:9001/arcgis/rest/services/Map/chinaimage/MapServer',
    //     // token: "VPdJZnAZCyPzq-cU2ShEUirPD0nKLbAP7CvPA2hlfmdCh5pXF5wcbZmTzQf4LqRG",
    //     // https
    //     // url: 'https://vms.cnpc.com.cn:7902/arcgis/rest/services/Map/chinaimage/MapServer',
    //     // token: "SFJnaLGvKf7s_d3em1aPLqyK5AJH-tatOTXvdQ20Q_ckW5JSipyrNP1nm9ITvWiS",
    //     // // label
    //     url: 'https://vms.cnpc.com.cn:7902/arcgis/rest/services/Map/china/MapServer/tile',
    //     token: '1FMKCWARLQ-LjM0SMmCOZcqsQzZn2GmnYDS5JaTrM3SkE6q4-m6iFQZwjm8eFxTHoZT9P_uMzM72y7qjufQ7eQ..'
    // });
    // GoogleMap
    // globeProvider = new Cesium.UrlTemplateImageryProvider({
    //     url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
    //     tilingScheme: new Cesium.WebMercatorTilingScheme(),
    //     // minimumLevel: this.layerLevel.minimumLevel,
    //     // maximumLevel: this.layerLevel.maximumLevel,
    // });
  }

  loadBaseMaps(baseMaps: Array<BasemapConfig>) {
    return Promise.all(
      baseMaps?.map(
        async ({
          // id: layerId,
          name: layerName,
          type: layerType,
          url: layerUrl,
          show: layerShow,
          minimumLevel,
          maximumLevel,
          layers,
          layer,
        }): Promise<any> => {
          if (layerType == "xyz" && layerUrl) {
            const layer = new UrlTemplateImageryProvider({
              url: layerUrl,
              minimumLevel,
              maximumLevel,
            });

            return this.add(layerName, layer, layerShow);
          } else if (layerType == "tdt") {
            return await this.addTdtLayer((layer as any) ?? "img", layerName, {
              maximumLevel,
            });
          } else if (layerType == "group") {
            return await this.loadBaseMaps(layers ?? []);
          }
        }
      )
    );
  }

  loadLayers(layers: Array<LayerConfig>) {
    /// 设置图层
    return Promise.all(
      layers?.map(
        async ({
          id: layerId,
          name: layerName,
          type: layerType,
          show: layerShow,
          data: layerData,
        }): Promise<void> => {
          if (layerType == "graphic") {
            const dataSource = new CustomDataSource(layerName);
            await this.add(layerId ?? createGuid(), dataSource, layerShow);

            layerData?.forEach((graphic) => {
              const {
                id: graphicId,
                type: graphicType,
                name,
                show,
                style,
              } = graphic;

              const entity = dataSource.entities.add({
                id: graphicId ?? createGuid(),
                name,
                show,
              });

              if (graphicType == GraphicType.LABEL) {
                const { position } = graphic;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);

                  entity.merge(
                    new Entity({
                      position: cartesian,
                      label:
                        GraphicUtils.generateLabelGraphicsOptionsFromStyle(
                          style
                        ),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.LABEL ->",
                    graphicId,
                    "未设置位置"
                  );
                }
              } else if (graphicType == GraphicType.CIRCLE) {
                const { position } = graphic;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);
                  const points = GeometryUtils.generateCirclePoints(
                    CoordinateUtils.car3ToProjectionPnt(cartesian),
                    style?.radius ?? 0
                  );

                  entity.merge(
                    new Entity({
                      polygon:
                        GraphicUtils.generatePolygonGraphicsOptionsFromGraphic({
                          style,
                          positions:
                            CoordinateUtils.projPntArr2PointArr(points),
                        }),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.LABEL ->",
                    graphicId,
                    "未设置位置"
                  );
                }
              } else if (graphicType == GraphicType.POLYLINE) {
                const { positions } = graphic;

                if (positions) {
                  entity.merge(
                    new Entity({
                      polyline:
                        GraphicUtils.generatePolylineGraphicsOptionsFromGraphic(
                          {
                            style,
                            positions,
                          }
                        ),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.POLYLINE ->",
                    graphicId,
                    "未设置位置"
                  );
                }
              } else if (graphicType == GraphicType.POLYGON) {
                const { positions } = graphic;

                if (positions) {
                  entity.merge(
                    new Entity({
                      polygon:
                        GraphicUtils.generatePolygonGraphicsOptionsFromGraphic({
                          style,
                          positions,
                        }),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.POLYGON ->",
                    graphicId,
                    "未设置位置"
                  );
                }
              } else if (graphicType == GraphicType.SYMBOL) {
                const { code, position, positions } = graphic;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);

                  entity.merge(
                    new Entity({
                      position: cartesian,
                      billboard:
                        GraphicUtils.generateBillboardGraphicsOptionsFromStyle({
                          ...(style as any),
                          image: `/data/symbol/icon/${code}.png`,
                        }),
                      label: GraphicUtils.generateLabelGraphicsOptionsFromStyle(
                        {
                          ...(style as any),
                          text: name,
                        }
                      ),
                    })
                  );
                } else if (positions) {
                  //@ts-ignore
                  const SymbolClass = GraphicManager.getSymbolClass(code),
                    //@ts-ignore
                    arrowPos = SymbolClass?.generateGeometry(positions, code);

                  entity.merge(
                    new Entity({
                      polyline:
                        GraphicUtils.generatePolylineGraphicsOptionsFromGraphic(
                          {
                            positions: arrowPos,
                            style: {
                              width: 3,
                              ...style,
                            },
                          }
                        ),
                    })
                  );
                }
              }
            });
          }
        }
      )
    );
  }

  /**
   * @descripttion:
   * @param {string} id
   * @return {void}
   * @author: EV-申小虎
   */
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
      const { type, item } = this.#layerArr.find((layer) => layer.id === id)!;

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

      this.#layerArr.splice(
        this.#layerArr.findIndex((i) => i.id == id),
        1
      );

      result = true;
    }
    return result;
  }

  setVisible(id: string, layerType: LayerType, visible: boolean) {
    if (layerType == LayerType.CZML_DATASOURCE) {
      const layer = this.getById<DataSource>(id);

      layer && (layer.show = visible);
    }
  }
}

export default LayerManager;
