import {
  WebMapTileServiceImageryProvider,
  UrlTemplateImageryProvider,
  CesiumTerrainProvider,
  createWorldTerrainAsync,
  Credit,
  ImageryLayer,
  ImageryProvider,
  TerrainProvider,
} from "cesium";
import MathUtils from "../MathUtils";
import type LayerManager from "../LayerManager";
import type { BasemapConfig } from "../../types";

// 天地图 token 列表（用于未提供 token 或解析失败时的回退）
const tdtTKList = [
  "cfa3e740d98acc6adf3581323d75f38b",
  "e43be49450444a791814c3c913e1047c",
  "65a414ddff616a2671130b254abb47ef",
];

export async function addTdtLayer(
  manager: LayerManager,
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
): Promise<ImageryLayer | undefined> {
  let tdtToken = options?.token;
  if (!tdtToken && options?.tokenResolver) {
    try {
      tdtToken = await options.tokenResolver();
    } catch {
      // ignore
    }
  }
  if (!tdtToken) {
    tdtToken = tdtTKList[MathUtils.randomWithRange(0, tdtTKList.length - 1)];
  }

  const { tileMatrixSetID, minimumLevel, maximumLevel, subdomains } = {
    tileMatrixSetID: "w",
    minimumLevel: undefined,
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
    minimumLevel,
    maximumLevel,
    subdomains,
  });

  return (await manager.add(name ?? `tdt_${layer}_image_layer`, tdtProvider)) as ImageryLayer | undefined;
}

export async function addPublicLayer(
  manager: LayerManager,
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
    const tdtToken = tdtTKList[MathUtils.randomWithRange(0, tdtTKList.length - 1)];
    const globeProvider = new WebMapTileServiceImageryProvider({
      url: `https://{s}.tianditu.gov.cn/img_w/wmts?tk=${tdtToken}`,
      layer: "img",
      style: "default",
      format: "tiles",
      tileMatrixSetID: "w",
      maximumLevel: 18,
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    });

    await manager.add("tdtDomImageLayer", globeProvider);

    if (labelLayer) {
      const labelProvider = new WebMapTileServiceImageryProvider({
        url: `https://{s}.tianditu.gov.cn/cia_w/wmts?tk=${tdtToken}`,
        layer: "cia",
        style: "default",
        format: "tiles",
        tileMatrixSetID: "w",
        maximumLevel: 18,
        credit: new Credit("天地图注记服务"),
        subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
      });

      await manager.add("tdtLabelImageLayer", labelProvider);
    }
  }

  if (imageLayer == "TDT_VCT") {
    const tdtToken = tdtTKList[MathUtils.randomWithRange(0, tdtTKList.length - 1)];
    const globeProvider = new WebMapTileServiceImageryProvider({
      url: `https://{s}.tianditu.gov.cn/vec_w/wmts?tk=${tdtToken}`,
      layer: "vec",
      style: "default",
      format: "tiles",
      tileMatrixSetID: "w",
      maximumLevel: 18,
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    });

    await manager.add("tdtVctImageLayer", globeProvider);

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

      await manager.add("tdtLabelImageLayer", labelProvider);
    }
  }

  if (imageLayer == "TDT_TER") {
    const tdtToken = tdtTKList[MathUtils.randomWithRange(0, tdtTKList.length - 1)];
    const globeProvider = new WebMapTileServiceImageryProvider({
      url: `https://{s}.tianditu.gov.cn/ter_w/wmts?tk=${tdtToken}`,
      layer: "ter",
      style: "default",
      format: "tiles",
      tileMatrixSetID: "w",
      maximumLevel: 18,
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    });

    await manager.add("tdtTerImageLayer", globeProvider);

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

      await manager.add("tdtLabelImageLayer", labelProvider);
    }
  }

  if (terrainLayer == "CASIA") {
    const terrainProvider = await CesiumTerrainProvider.fromUrl(
      "http://172.18.29.31:8070/china30dem_ctb_zoom14"
    );

    await manager.add("basicTerrainLayer", terrainProvider);
  }

  if (terrainLayer == "PUB") {
    const terrainProvider = await createWorldTerrainAsync();

    await manager.add("basicTerrainLayer", terrainProvider);
  }
}

export async function loadBaseMaps(
  manager: LayerManager,
  baseMaps: Array<BasemapConfig>
): Promise<any[]> {
  return Promise.all(
    baseMaps?.map(
      async ({
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
          const imagery = new UrlTemplateImageryProvider({
            url: layerUrl,
            minimumLevel,
            maximumLevel,
          });
          return manager.add(layerName, imagery, layerShow);
        } else if (layerType == "tdt") {
          return await addTdtLayer(manager, (layer as any) ?? "img", layerName, {
            maximumLevel,
          });
        } else if (layerType == "group") {
          return await loadBaseMaps(manager, layers ?? []);
        }
      }
    )
  );
}