import React, { useCallback, useMemo, useState } from "react";
import { Earth, ToolBar } from "@xh-gis/widgets";
import { XgEarth, HeatmapOption } from "@xh-gis/engine";
import styles from "./HeatmapExample.module.css";
import { CustomDataSource, Cartesian3, Color, Cartesian2, HeightReference, SingleTileImageryProvider, Rectangle, ImageryLayer } from "cesium";
import { density2d } from "fast-kde";

const genDemoPoints = (count = 1000) => {
  const pts: Array<{ x: number; y: number; value?: number }> = [];
  for (let i = 0; i < count; i++) {
    const x = 115 + Math.random() * 3; // 经度
    const y = 39 + Math.random() * 2; // 纬度
    const value = Math.round(Math.random() * 100);
    pts.push({ x, y, value });
  }
  return pts;
};

const HeatmapExample: React.FC = () => {
  const [earthClassic, setEarthClassic] = useState<XgEarth | null>(null);
  const [earthGaussian, setEarthGaussian] = useState<XgEarth | null>(null);
  const [statusClassic, setStatusClassic] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [statusGaussian, setStatusGaussian] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [errorMsgClassic, setErrorMsgClassic] = useState<string | null>(null);
  const [errorMsgGaussian, setErrorMsgGaussian] = useState<string | null>(null);
  // 新增：External KDE 面板状态
  const [earthExternal, setEarthExternal] = useState<XgEarth | null>(null);
  const [statusExternal, setStatusExternal] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [errorMsgExternal, setErrorMsgExternal] = useState<string | null>(null);
  const [externalImagery, setExternalImagery] = useState<ImageryLayer | null>(null);

  // 控制：自动/手动 & 当前/手动半径值
  const [isAutoClassic, setIsAutoClassic] = useState(true);
  const [isAutoGaussian, setIsAutoGaussian] = useState(true);
  const [manualRadiusClassic, setManualRadiusClassic] = useState(40);
  const [manualRadiusGaussian, setManualRadiusGaussian] = useState(40);
  const [currentRadiusClassic, setCurrentRadiusClassic] = useState<
    number | null
  >(null);
  const [currentRadiusGaussian, setCurrentRadiusGaussian] = useState<
    number | null
  >(null);
  // External KDE 当前半径（只读）
  const [currentRadiusExternal, setCurrentRadiusExternal] = useState<number | null>(null);

  // 全局控件：不透明度与等值线参数
  const [globalMinOpacity, setGlobalMinOpacity] = useState(0);
  const [contourSmooth, setContourSmooth] = useState(false);
  const [epsilonLow, setEpsilonLow] = useState(0);
  const [epsilonHigh, setEpsilonHigh] = useState(0);
  const [thresholdMode, setThresholdMode] = useState<
    "equalInterval" | "quantile" | "paletteStops"
  >("paletteStops");
  // 新增：热图 blur（平滑强度）
  const [globalBlur, setGlobalBlur] = useState(0.85);

  // 应用热图最小不透明度到两个图层（含 ExternalKDE）
  const applyMinOpacity = useCallback(
    (v: number) => {
      const val = Math.max(0, Math.min(1, v));
      setGlobalMinOpacity(val);
      if (earthClassic)
        earthClassic.heatmapManager.update(classicId, {
          heatmap: { minOpacity: val },
        });
      if (earthGaussian)
        earthGaussian.heatmapManager.update(gaussianId, {
          heatmap: { minOpacity: val },
        });
      // external 面板独立渲染，不走 heatmapManager
    },
    [earthClassic, earthGaussian]
  );

  // 新增：应用 blur 到三个图层
  const applyBlur = useCallback(
    (v: number) => {
      const val = Math.max(0, Math.min(1, v));
      setGlobalBlur(val);
      if (earthClassic)
        earthClassic.heatmapManager.update(classicId, {
          heatmap: { blur: val },
        });
      if (earthGaussian)
        earthGaussian.heatmapManager.update(gaussianId, {
          heatmap: { blur: val },
        });
      // external 面板独立渲染，不走 heatmapManager
    },
    [earthClassic, earthGaussian]
  );

  // 应用等值线平滑
  const applyContourSmooth = useCallback(
    (v: boolean) => {
      setContourSmooth(v);
      if (earthClassic)
        earthClassic.heatmapManager.update(classicId, {
          contour: { smooth: v },
        });
      if (earthGaussian)
        earthGaussian.heatmapManager.update(gaussianId, {
          contour: { smooth: v },
        });
      // external 面板独立渲染，不走 heatmapManager
    },
    [earthClassic, earthGaussian]
  );

  // 应用低端/高端阈值裁剪
  const applyEpsilonLow = useCallback(
    (v: number) => {
      const val = Math.max(0, Math.min(0.2, v));
      setEpsilonLow(val);
      if (earthClassic)
        earthClassic.heatmapManager.update(classicId, {
          contour: { epsilonLowRatio: val },
        });
      if (earthGaussian)
        earthGaussian.heatmapManager.update(gaussianId, {
          contour: { epsilonLowRatio: val },
        });
    },
    [earthClassic, earthGaussian]
  );
  const applyEpsilonHigh = useCallback(
    (v: number) => {
      const val = Math.max(0, Math.min(0.2, v));
      setEpsilonHigh(val);
      if (earthClassic)
        earthClassic.heatmapManager.update(classicId, {
          contour: { epsilonHighRatio: val },
        });
      if (earthGaussian)
        earthGaussian.heatmapManager.update(gaussianId, {
          contour: { epsilonHighRatio: val },
        });
    },
    [earthClassic, earthGaussian]
  );

  // 应用阈值模式
  const applyThresholdMode = useCallback(
    (mode: "equalInterval" | "quantile" | "paletteStops") => {
      setThresholdMode(mode);
      if (earthClassic)
        earthClassic.heatmapManager.update(classicId, {
          contour: { thresholdMode: mode },
        });
      if (earthGaussian)
        earthGaussian.heatmapManager.update(gaussianId, {
          contour: { thresholdMode: mode },
        });
    },
    [earthClassic, earthGaussian]
  );

  const points = useMemo(() => genDemoPoints(1000), []);

  // 点权重图层
  const weightsClassicId = "weights-classic";
  const weightsGaussianId = "weights-gaussian";
  const weightsExternalId = "weights-external";
  const [showWeightsLayer, setShowWeightsLayer] = useState(true);

  const addWeightsLayer = useCallback(
    (instance: XgEarth, id: string) => {
      try {
        if (instance.layerManager.isExists(id)) return;

        const ds = new CustomDataSource("Weights");
        points.forEach((p) => {
          const pos = Cartesian3.fromDegrees(p.x, p.y);
          ds.entities.add({
            position: pos,
            point: {
              pixelSize: 6,
              color: Color.fromCssColorString("#2563eb"),
              outlineColor: Color.WHITE,
              outlineWidth: 1,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
              text: String(p.value ?? ""),
              font: "12px sans-serif",
              fillColor: Color.fromCssColorString("#111827"),
              outlineColor: Color.WHITE,
              outlineWidth: 2,
              pixelOffset: new Cartesian2(0, -16),
              showBackground: true,
              backgroundColor: Color.fromCssColorString("rgba(255,255,255,0.6)"),
              heightReference: HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          });
        });

        instance.layerManager.add(id, ds, showWeightsLayer);
        // 聚焦到点权重图层实体，确保视野内可见
        instance.viewer.flyTo(ds.entities, { duration: 0 });
      } catch (e) {
        console.warn("[HeatmapExample] addWeightsLayer failed:", e);
      }
    },
    [points, showWeightsLayer]
  );

  const toggleWeightsVisibility = useCallback(() => {
    const next = !showWeightsLayer;
    setShowWeightsLayer(next);
    try {
      if (earthClassic) {
        const ds = earthClassic.layerManager.getById<any>(weightsClassicId);
        if (ds) ds.show = next;
      }
      if (earthGaussian) {
        const ds = earthGaussian.layerManager.getById<any>(weightsGaussianId);
        if (ds) ds.show = next;
      }
      if (earthExternal) {
        const ds = earthExternal.layerManager.getById<any>(weightsExternalId);
        if (ds) ds.show = next;
      }
    } catch (e) {
      console.warn("[HeatmapExample] toggleWeightsVisibility failed:", e);
    }
  }, [earthClassic, earthGaussian, earthExternal, showWeightsLayer]);

  const classicId = "heatmap-radialGradient";
  const gaussianId = "heatmap-gaussian";
  // external 不再使用 heatmapManager id

  const baseHeatmapOptions = {
    maxOpacity: 0.8,
    minOpacity: 0,
    blur: 1.0,
    gradient: {
      0.25: "rgb(0,0,255)",
      0.55: "rgb(0,255,0)",
      0.85: "yellow",
      1.0: "rgb(255,0,0)",
    },
  } as const;
  const gradientStops = Object.keys(baseHeatmapOptions.gradient).length;

  // 最小可用 External KDE 渲染函数：基于加权高斯核在影像画布上构建 alpha
  const externalKDERender = useCallback((opts: {
    ctx: CanvasRenderingContext2D;
    shadowCtx: CanvasRenderingContext2D;
    width: number;
    height: number;
    min: number;
    max: number;
    data: Array<{ x: number; y: number; value?: number; radius?: number }>;
    config: any;
  }) => {
    const { shadowCtx, width, height, min, max, data, config } = opts;
    const sigmaBase = typeof config.radius === "number" ? config.radius : 40;
    const sigma = Math.max(0.1, sigmaBase * 0.5);

    try {
      const est: any = (density2d as any)(data, {
        x: (d: any) => d.x,
        y: (d: any) => d.y,
        weight: (d: any) => {
          const vRaw = typeof d.value === "number" ? d.value : min;
          return Math.max(min, Math.min(max, vRaw));
        },
        bandwidth: [sigma, sigma],
        extent: [[0, width], [0, height]],
        bins: [width, height],
      });

      let grid: Float64Array;
      if (typeof est.grid === "function") {
        grid = est.grid();
      } else {
        // 兼容：若未提供 grid()，则从迭代点集合构造栅格
        const pts: any[] = Array.from(est as any);
        grid = new Float64Array(width * height);
        for (const p of pts) {
          const xi = Math.max(0, Math.min(width - 1, Math.round((p as any).x ?? 0)));
          const yi = Math.max(0, Math.min(height - 1, Math.round((p as any).y ?? 0)));
          const z = (p as any).z ?? (p as any).value ?? 0;
          grid[yi * width + xi] = z as number;
        }
      }

      // 局部最大值归一化写入 alpha
      let maxAcc = 0;
      for (let i = 0; i < grid.length; i++) if (grid[i] > maxAcc) maxAcc = grid[i];
      const img = shadowCtx.getImageData(0, 0, width, height);
      const arr = img.data;
      for (let i = 0, p = 0; i < grid.length; i++, p += 4) {
        const alpha = maxAcc > 0 ? Math.min(255, Math.round((grid[i] / maxAcc) * 255)) : 0;
        arr[p] = 0;
        arr[p + 1] = 0;
        arr[p + 2] = 0;
        arr[p + 3] = alpha;
      }
      shadowCtx.putImageData(img, 0, 0);
    } catch (e) {
      // 回退到本地简单实现，以保证渲染不中断
      const windowR = Math.max(1, Math.floor(3 * sigma));
      const twoSigma2 = 2 * sigma * sigma;
      const acc = new Float32Array(width * height);
      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        const x = Math.round(p.x);
        const y = Math.round(p.y);
        const vRaw = typeof p.value === "number" ? p.value : min;
        const v = Math.max(min, Math.min(max, vRaw));
        const startX = Math.max(0, x - windowR);
        const endX = Math.min(width - 1, x + windowR);
        const startY = Math.max(0, y - windowR);
        const endY = Math.min(height - 1, y + windowR);
        for (let yy = startY; yy <= endY; yy++) {
          const dy = yy - y;
          const dy2 = dy * dy;
          const rowOffset = yy * width;
          for (let xx = startX; xx <= endX; xx++) {
            const dx = xx - x;
            const dist2 = dx * dx + dy2;
            const w = Math.exp(-dist2 / twoSigma2);
            acc[rowOffset + xx] += w * v;
          }
        }
      }
      let maxAcc = 0;
      for (let i = 0; i < acc.length; i++) if (acc[i] > maxAcc) maxAcc = acc[i];
      const img = shadowCtx.getImageData(0, 0, width, height);
      const arr = img.data;
      for (let i = 0, p = 0; i < acc.length; i++, p += 4) {
        const alpha = maxAcc > 0 ? Math.min(255, Math.round((acc[i] / maxAcc) * 255)) : 0;
        arr[p] = 0;
        arr[p + 1] = 0;
        arr[p + 2] = 0;
        arr[p + 3] = alpha;
      }
      shadowCtx.putImageData(img, 0, 0);
      console.warn("[externalKDE] fast-kde failed, fallback used:", e);
    }
  }, []);

  const buildOptions = (
    kernelMode: "radialGradient" | "gaussian" | "externalKDE",
    radius?: number
  ): HeatmapOption => ({
    noLisenerCamera: true, // 关闭相机驱动，便于控制变量
    renderType: "imagery",
    points,
    heatmapOptions: {
      ...baseHeatmapOptions,
      kernelMode: kernelMode as any,
      ...(typeof radius === "number" ? { radius } : {}),
      ...(kernelMode === "externalKDE" ? { externalKDE: externalKDERender } : {}),
    } as any,
    heatmapDataOptions: { min: 0, max: 100 },
    zoomToLayer: true,
    contourLineOption: {
      show: true,
      contourCount: Math.max(1, gradientStops),
      smooth: false,
      epsilonLowRatio: 0,
      epsilonHighRatio: 0,
      thresholdMode: "paletteStops",
      width: 3,
    },
  });

  const readCurrentRadius = (
    instance: XgEarth | null,
    id: string
  ): number | null => {
    if (!instance) return null;
    try {
      const layer = instance.heatmapManager.getById(id) as any;
      if (!layer) return null;
      const h = layer.heatmap;
      if (!h) return null;
      const data = h.getData?.();
      const rFromData = data?.data?.[0]?.radius;
      if (typeof rFromData === "number") return rFromData;
      const renderer = h._renderer;
      const cfg = renderer?.config;
      if (cfg && typeof cfg.radius === "number") return cfg.radius;
      return null;
    } catch (e) {
      return null;
    }
  };

  // 计算经纬度范围
  const getBounds = (pts: Array<{ x: number; y: number }>) => {
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));
    return { minX, minY, maxX, maxY };
  };

  // 创建外部KDE影像图层
  // 构建调色板：将梯度停靠转换为 256 档 RGB 映射
  const buildPalette = (gradient: Record<string, string>): Uint8ClampedArray => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new Uint8ClampedArray(256 * 4);
    const lg = ctx.createLinearGradient(0, 0, 256, 0);
    const stops = Object.keys(gradient)
      .map((k) => ({ pos: Math.max(0, Math.min(1, Number(k))), color: gradient[k] }))
      .sort((a, b) => a.pos - b.pos);
    stops.forEach((s) => lg.addColorStop(s.pos, s.color));
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, 256, 1);
    const img = ctx.getImageData(0, 0, 256, 1);
    return img.data;
  };

  const createExternalKDEImagery = (instance: XgEarth) => {
    try {
      const { minX, minY, maxX, maxY } = getBounds(points);
      const width = 512;
      const height = 512;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2d context not available");

      // 将经纬度点映射到像素网格
      const pixelData = points.map((p) => ({
        x: Math.round(((p.x - minX) / (maxX - minX)) * (width - 1)),
        y: Math.round(((maxY - p.y) / (maxY - minY)) * (height - 1)),
        value: p.value,
      }));

      const sigmaBase = 40;
      const sigma = Math.max(0.1, sigmaBase * 0.5);

      let grid: Float64Array | null = null;
      try {
        const est: any = (density2d as any)(pixelData, {
          x: (d: any) => d.x,
          y: (d: any) => d.y,
          weight: (d: any) => {
            const vRaw = typeof d.value === "number" ? d.value : 0;
            return Math.max(0, Math.min(100, vRaw));
          },
          bandwidth: [sigma, sigma],
          extent: [[0, width], [0, height]],
          bins: [width, height],
        });
        if (typeof est.grid === "function") {
          grid = est.grid();
        } else {
          const pts: any[] = Array.from(est as any);
          const arr = new Float64Array(width * height);
          for (const p of pts) {
            const xi = Math.max(0, Math.min(width - 1, Math.round((p as any).x ?? 0)));
            const yi = Math.max(0, Math.min(height - 1, Math.round((p as any).y ?? 0)));
            const z = (p as any).z ?? (p as any).value ?? 0;
            arr[yi * width + xi] = z as number;
          }
          grid = arr;
        }
      } catch (e) {
        // 简单回退：手动卷积
        const acc = new Float32Array(width * height);
        const windowR = Math.max(1, Math.floor(3 * sigma));
        const twoSigma2 = 2 * sigma * sigma;
        for (let i = 0; i < pixelData.length; i++) {
          const p = pixelData[i];
          const x = p.x;
          const y = p.y;
          const vRaw = typeof p.value === "number" ? p.value : 0;
          const v = Math.max(0, Math.min(100, vRaw));
          const startX = Math.max(0, x - windowR);
          const endX = Math.min(width - 1, x + windowR);
          const startY = Math.max(0, y - windowR);
          const endY = Math.min(height - 1, y + windowR);
          for (let yy = startY; yy <= endY; yy++) {
            const dy = yy - y;
            const dy2 = dy * dy;
            const rowOffset = yy * width;
            for (let xx = startX; xx <= endX; xx++) {
              const dx = xx - x;
              const dist2 = dx * dx + dy2;
              const w = Math.exp(-dist2 / twoSigma2);
              acc[rowOffset + xx] += w * v;
            }
          }
        }
        grid = new Float64Array(acc);
      }

      const img = ctx.getImageData(0, 0, width, height);
      const arr = img.data;
      let maxAcc = 0;
      for (let i = 0; i < (grid as Float64Array).length; i++) if ((grid as Float64Array)[i] > maxAcc) maxAcc = (grid as Float64Array)[i];

      // 色带着色：根据示例页的 gradient 生成调色板并上色
      const palette = buildPalette(baseHeatmapOptions.gradient);
      const minOpacity = Math.round(((baseHeatmapOptions.minOpacity ?? 0) as number) * 255);
      const maxOpacity255 = Math.round(((baseHeatmapOptions.maxOpacity ?? 0.8) as number) * 255);
      for (let i = 0, p = 0; i < (grid as Float64Array).length; i++, p += 4) {
        const aNorm = maxAcc > 0 ? Math.min(255, Math.round(((grid as Float64Array)[i] / maxAcc) * 255)) : 0;
        const idx = aNorm * 4;
        arr[p] = palette[idx];
        arr[p + 1] = palette[idx + 1];
        arr[p + 2] = palette[idx + 2];
        // 透明度按照归一化值并限制在 [minOpacity, maxOpacity]
        arr[p + 3] = Math.max(minOpacity, Math.min(maxOpacity255, aNorm));
      }
      ctx.putImageData(img, 0, 0);

      const url = canvas.toDataURL();
      const rect = Rectangle.fromDegrees(minX, minY, maxX, maxY);
      const layer = instance.viewer.imageryLayers.addImageryProvider(
        new SingleTileImageryProvider({
          url,
          rectangle: rect,
          tileWidth: width,
          tileHeight: height,
        })
      );
      setExternalImagery(layer);
      setCurrentRadiusExternal(sigmaBase);
      // 添加权重点图层
      addWeightsLayer(instance, weightsExternalId);
    } catch (e: any) {
      setStatusExternal("error");
      setErrorMsgExternal(e?.message || String(e));
      console.error("[HeatmapExample] createExternalKDEImagery failed:", e);
    }
  };

  const initEarthCommon = (instance: XgEarth) => {
    try {
      instance.viewer.scene.camera.setView({
        destination: Cartesian3.fromDegrees(116.4074, 39.9042, 5000000),
      });
    } catch (e) {
      console.warn("[HeatmapExample] camera setView failed:", e);
    }
  };

  const handleInitClassic = useCallback(
    (instance: XgEarth) => {
      setEarthClassic(instance);
      setStatusClassic("ready");
      initEarthCommon(instance);

      try {
        const opts = buildOptions("radialGradient"); // 自动半径：不提供 radius
        if (!instance.heatmapManager.isExists(classicId)) {
          instance.heatmapManager.add(classicId, opts);
        }
        setCurrentRadiusClassic(readCurrentRadius(instance, classicId));
        // 添加点权重图层
        addWeightsLayer(instance, weightsClassicId);
      } catch (e: any) {
        console.error("[HeatmapExample] radialGradient add failed:", e);
        setStatusClassic("error");
        setErrorMsgClassic(e?.message || String(e));
      }
    },
    [points, addWeightsLayer]
  );

  const handleInitGaussian = useCallback(
    (instance: XgEarth) => {
      setEarthGaussian(instance);
      setStatusGaussian("ready");
      initEarthCommon(instance);

      try {
        const opts = buildOptions("gaussian"); // 自动半径：不提供 radius
        if (!instance.heatmapManager.isExists(gaussianId)) {
          instance.heatmapManager.add(gaussianId, opts);
        }
        setCurrentRadiusGaussian(readCurrentRadius(instance, gaussianId));
        // 添加点权重图层
        addWeightsLayer(instance, weightsGaussianId);
      } catch (e: any) {
        console.error("[HeatmapExample] gaussian add failed:", e);
        setStatusGaussian("error");
        setErrorMsgGaussian(e?.message || String(e));
      }
    },
    [points, addWeightsLayer]
  );

  // 新增：External KDE 初始化
  const handleInitExternal = useCallback(
    (instance: XgEarth) => {
      setEarthExternal(instance);
      setStatusExternal("ready");
      initEarthCommon(instance);
      // 使用独立的影像覆盖，不通过 heatmapManager
      createExternalKDEImagery(instance);
    },
    [points]
  );

  const switchAutoManualClassic = (auto: boolean) => {
    setIsAutoClassic(auto);
    if (!earthClassic) return;
    if (auto) {
      // 重建为自动半径：移除后不带 radius 再添加
      earthClassic.heatmapManager.remove(classicId);
      earthClassic.heatmapManager.add(
        classicId,
        buildOptions("radialGradient")
      );
    } else {
      earthClassic.heatmapManager.update(classicId, {
        radius: manualRadiusClassic,
      });
    }
    setCurrentRadiusClassic(readCurrentRadius(earthClassic, classicId));
  };

  const switchAutoManualGaussian = (auto: boolean) => {
    setIsAutoGaussian(auto);
    if (!earthGaussian) return;
    if (auto) {
      earthGaussian.heatmapManager.remove(gaussianId);
      earthGaussian.heatmapManager.add(gaussianId, buildOptions("gaussian"));
    } else {
      earthGaussian.heatmapManager.update(gaussianId, {
        radius: manualRadiusGaussian,
      });
    }
    setCurrentRadiusGaussian(readCurrentRadius(earthGaussian, gaussianId));
  };

  const updateClassicRadius = (r: number) => {
    setManualRadiusClassic(r);
    if (!earthClassic) return;
    earthClassic.heatmapManager.update(classicId, { radius: r });
    setCurrentRadiusClassic(readCurrentRadius(earthClassic, classicId));
  };

  const updateGaussianRadius = (r: number) => {
    setManualRadiusGaussian(r);
    if (!earthGaussian) return;
    earthGaussian.heatmapManager.update(gaussianId, { radius: r });
    setCurrentRadiusGaussian(readCurrentRadius(earthGaussian, gaussianId));
  };

  return (
    <div className={styles.container}>
      <div className={styles.compareGrid}>
        {/* 左侧：经典模糊 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>经典模糊 (radialGradient)</h3>
            <div className={styles.radiusDisplay}>
              当前半径：
              {currentRadiusClassic != null
                ? Math.round(currentRadiusClassic)
                : "-"}
            </div>
          </div>
          <div className={styles.canvas}>
            <Earth onInit={handleInitClassic} />
          </div>
          {statusClassic === "ready" && earthClassic && (
            <ToolBar coreRef={{ current: earthClassic } as any} />
          )}
          {statusClassic === "error" && (
            <div className={styles.errorTip}>
              <strong>错误：</strong> {errorMsgClassic || "未知错误"}
            </div>
          )}

          <div className={styles.controls}>
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={!isAutoClassic}
                onChange={(e) =>
                  switchAutoManualClassic(!e.target.checked ? true : false)
                }
              />
              <span>手动半径</span>
            </label>
            <div className={styles.inputRow}>
              <input
                type="range"
                min={8}
                max={200}
                step={1}
                value={manualRadiusClassic}
                disabled={isAutoClassic}
                onChange={(e) => updateClassicRadius(Number(e.target.value))}
              />
              <input
                type="number"
                min={8}
                max={200}
                step={1}
                value={manualRadiusClassic}
                disabled={isAutoClassic}
                onChange={(e) => {
                  const v = Math.max(8, Math.min(200, Number(e.target.value)));
                  updateClassicRadius(v);
                }}
                className={styles.numberInput}
              />
            </div>
          </div>
        </div>

        {/* 中间：严格高斯 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>严格高斯 (gaussian)</h3>
            <div className={styles.radiusDisplay}>
              当前半径：
              {currentRadiusGaussian != null
                ? Math.round(currentRadiusGaussian)
                : "-"}
            </div>
          </div>
          <div className={styles.canvas}>
            <Earth onInit={handleInitGaussian} />
          </div>
          {statusGaussian === "ready" && earthGaussian && (
            <ToolBar coreRef={{ current: earthGaussian } as any} />
          )}
          {statusGaussian === "error" && (
            <div className={styles.errorTip}>
              <strong>错误：</strong> {errorMsgGaussian || "未知错误"}
            </div>
          )}

          <div className={styles.controls}>
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={!isAutoGaussian}
                onChange={(e) =>
                  switchAutoManualGaussian(!e.target.checked ? true : false)
                }
              />
              <span>手动半径</span>
            </label>
            <div className={styles.inputRow}>
              <input
                type="range"
                min={8}
                max={200}
                step={1}
                value={manualRadiusGaussian}
                disabled={isAutoGaussian}
                onChange={(e) => updateGaussianRadius(Number(e.target.value))}
              />
              <input
                type="number"
                min={8}
                max={200}
                step={1}
                value={manualRadiusGaussian}
                disabled={isAutoGaussian}
                onChange={(e) => {
                  const v = Math.max(8, Math.min(200, Number(e.target.value)));
                  updateGaussianRadius(v);
                }}
                className={styles.numberInput}
              />
            </div>
          </div>
        </div>

        {/* 右侧：加权KDE（externalKDE） */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>加权KDE (external)</h3>
            <div className={styles.radiusDisplay}>
              当前半径：
              {currentRadiusExternal != null
                ? Math.round(currentRadiusExternal)
                : "-"}
            </div>
          </div>
          <div className={styles.canvas}>
            <Earth onInit={handleInitExternal} />
          </div>
          {statusExternal === "ready" && earthExternal && (
            <ToolBar coreRef={{ current: earthExternal } as any} />
          )}
          {statusExternal === "error" && (
            <div className={styles.errorTip}>
              <strong>错误：</strong> {errorMsgExternal || "未知错误"}
            </div>
          )}
          <div className={styles.controls}>
            <div className={styles.inputRow}>
              <span>此模式使用外部KDE适配器，当前展示自动半径</span>
            </div>
          </div>
        </div>
      </div>

      {/* 全局参数控件 */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>全局参数</h3>
        </div>
        <div className={styles.controls}>
          <div className={styles.inputRow}>
            <span>最小不透明度</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={globalMinOpacity}
              onChange={(e) => applyMinOpacity(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={globalMinOpacity}
              onChange={(e) => applyMinOpacity(Number(e.target.value))}
              className={styles.numberInput}
            />
          </div>

          <div className={styles.inputRow}>
            <span>blur（强度）</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={globalBlur}
              onChange={(e) => applyBlur(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={globalBlur}
              onChange={(e) => applyBlur(Number(e.target.value))}
              className={styles.numberInput}
            />
          </div>

          <div className={styles.inputRow}>
            <span>等值线平滑</span>
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={contourSmooth}
                onChange={(e) => applyContourSmooth(e.target.checked)}
              />
              <span>启用</span>
            </label>
          </div>

          <div className={styles.inputRow}>
            <span>低端裁剪</span>
            <input
              type="range"
              min={0}
              max={0.2}
              step={0.01}
              value={epsilonLow}
              onChange={(e) => applyEpsilonLow(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={0.2}
              step={0.01}
              value={epsilonLow}
              onChange={(e) => applyEpsilonLow(Number(e.target.value))}
              className={styles.numberInput}
            />
          </div>
          <div className={styles.inputRow}>
            <span>高端裁剪</span>
            <input
              type="range"
              min={0}
              max={0.2}
              step={0.01}
              value={epsilonHigh}
              onChange={(e) => applyEpsilonHigh(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={0.2}
              step={0.01}
              value={epsilonHigh}
              onChange={(e) => applyEpsilonHigh(Number(e.target.value))}
              className={styles.numberInput}
            />
          </div>

          <div className={styles.inputRow}>
            <span>阈值模式</span>
            <select
              value={thresholdMode}
              onChange={(e) => applyThresholdMode(e.target.value as any)}
              className={styles.select}
            >
              <option value="equalInterval">等距</option>
              <option value="quantile">分位</option>
              <option value="paletteStops">色带档位</option>
            </select>
          </div>

          <div className={styles.inputRow}>
            <button className={styles.toggleButton} onClick={toggleWeightsVisibility}>
              {showWeightsLayer ? "隐藏权重点图层" : "显示权重点图层"}
            </button>
          </div>
        </div>
        <div className={styles.readme}>
          <div>• 手动半径支持滑块与数值输入，范围 [8, 200]</div>
          <div>• 三侧展示为：经典模糊、严格高斯、加权KDE适配器，便于对比</div>
          <div>
            • 已关闭平滑与阈值裁剪，并将最小不透明度设为
            0，以保证等值线与热图外层贴合
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapExample;
