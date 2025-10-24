/*
 * Lightweight TypeScript re-implementation of heatmap.js v2 API used by CesiumHeatmap
 * Focuses on Canvas2d rendering and the subset of features our engine relies on.
 */

export interface HeatmapPoint {
  x: number;
  y: number;
  value?: number;
  radius?: number;
}

export interface HeatmapSetDataOptions {
  max: number;
  min?: number;
  data: HeatmapPoint[];
}

export interface HeatmapConfiguration {
  container: HTMLElement;
  canvas?: HTMLCanvasElement;
  backgroundColor?: string;
  blur?: number; // 0.85 default
  gradient?: { [key: string]: string };
  maxOpacity?: number; // used when opacity is not set
  minOpacity?: number;
  opacity?: number; // global opacity
  radius?: number; // default radius
  valueField?: string; // default 'value'
  onExtremaChange?: (info: {
    min: number;
    max: number;
    gradient: { [key: string]: string };
  }) => void;
  useGradientOpacity?: boolean;
  kernelMode?: "radialGradient" | "gaussian";
}

type RenderAllPayload = { min: number; max: number; data: HeatmapPoint[] };

const DefaultConfig: {
  defaultRadius: number;
  defaultGradient: Record<string, string>;
  defaultMaxOpacity: number;
  defaultMinOpacity: number;
  defaultBlur: number;
  defaultValueField: string;
} = {
  defaultRadius: 40,
  defaultGradient: {
    "0.25": "rgb(0,0,255)",
    "0.55": "rgb(0,255,0)",
    "0.85": "yellow",
    "1.0": "rgb(255,0,0)",
  },
  defaultMaxOpacity: 1,
  defaultMinOpacity: 0,
  defaultBlur: 0.85,
  defaultValueField: "value",
};

class Coordinator {
  private handlers: Record<string, Function[]> = {};
  on(event: string, handler: Function) {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(handler);
  }
  emit(event: string, data: any) {
    (this.handlers[event] || []).forEach((h) => h(data));
  }
}

class HeatmapStore {
  private _data: HeatmapPoint[] = [];
  private _min = 0;
  private _max = 1;
  private _coordinator: Coordinator | null = null;

  setCoordinator(coordinator: Coordinator) {
    this._coordinator = coordinator;
  }

  addData(points: HeatmapPoint | HeatmapPoint[]): this {
    const arr = Array.isArray(points) ? points : [points];
    for (const p of arr) {
      this._data.push({ ...p });
      if (typeof p.value === "number") {
        if (p.value > this._max) this._max = p.value;
        if (p.value < this._min) this._min = p.value;
      }
    }
    if (this._coordinator) {
      this._coordinator.emit("renderpartial", {
        min: this._min,
        max: this._max,
        data: arr,
      });
    }
    return this;
  }

  setData(payload: HeatmapSetDataOptions): this {
    this._data = payload.data.map((p) => ({ ...p }));
    this._max = payload.max;
    this._min = typeof payload.min === "number" ? payload.min : 0;
    if (this._coordinator) {
      this._coordinator.emit("renderall", this._getInternalData());
    }
    return this;
  }

  setDataMax(max: number): this {
    this._max = max;
    if (this._coordinator) {
      this._coordinator.emit("renderall", this._getInternalData());
      this._coordinator.emit("extremachange", {
        min: this._min,
        max: this._max,
      });
    }
    return this;
  }

  setDataMin(min: number): this {
    this._min = min;
    if (this._coordinator) {
      this._coordinator.emit("renderall", this._getInternalData());
      this._coordinator.emit("extremachange", {
        min: this._min,
        max: this._max,
      });
    }
    return this;
  }

  getData(): HeatmapSetDataOptions {
    return {
      min: this._min,
      max: this._max,
      data: this._data.map((p) => ({ ...p })),
    };
  }

  _getInternalData(): RenderAllPayload {
    return { min: this._min, max: this._max, data: this._data };
  }
}

class Canvas2dRenderer {
  public shadowCanvas: HTMLCanvasElement;
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shadowCtx: CanvasRenderingContext2D;
  private _width = 1;
  private _height = 1;
  private _renderBoundaries: [number, number, number, number] = [
    10000, 10000, 0, 0,
  ];
  private _palette: Uint8ClampedArray;
  private _blur = DefaultConfig.defaultBlur;
  private _opacity = 0;
  private _maxOpacity = DefaultConfig.defaultMaxOpacity * 255;
  private _minOpacity = DefaultConfig.defaultMinOpacity * 255;
  private _useGradientOpacity = false;
  private _kernelMode: "radialGradient" | "gaussian" = "radialGradient";
  private _accBuffer?: Float32Array; // 高斯模式下的线性累加缓冲
  private _accMax = 1; // 当前边界内的最大累加值

  constructor(private config: HeatmapConfiguration) {
    const container = config.container;
    const shadowCanvas = (this.shadowCanvas = document.createElement("canvas"));
    const canvas = (this.canvas =
      config.canvas || document.createElement("canvas"));

    const computed = getComputedStyle(container) || ({} as any);
    canvas.className = "heatmap-canvas";
    this._width =
      canvas.width =
      shadowCanvas.width =
        parseInt(String(computed.width || "256").replace(/px/, ""), 10) || 256;
    this._height =
      canvas.height =
      shadowCanvas.height =
        parseInt(String(computed.height || "256").replace(/px/, ""), 10) || 256;

    const sctx = shadowCanvas.getContext("2d");
    const cctx = canvas.getContext("2d");
    if (!sctx || !cctx) throw new Error("2d context not available");
    this.shadowCtx = sctx;
    this.ctx = cctx;

    canvas.style.cssText = shadowCanvas.style.cssText =
      "position:absolute;left:0;top:0;";
    container.style.position = "relative";
    container.appendChild(canvas);

    this._palette = this._getColorPalette(config);
    this._setStyles(config);
  }

  private _ensureAccBuffer(): void {
    if (
      !this._accBuffer ||
      this._accBuffer.length !== this._width * this._height
    ) {
      this._accBuffer = new Float32Array(this._width * this._height);
    }
  }

  private _getColorPalette(config: HeatmapConfiguration): Uint8ClampedArray {
    const gradientConfig = (config.gradient ||
      DefaultConfig.defaultGradient) as Record<string, string>;
    const paletteCanvas = document.createElement("canvas");
    const paletteCtx = paletteCanvas.getContext("2d")!;
    paletteCanvas.width = 256;
    paletteCanvas.height = 1;
    const gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
    for (const key in gradientConfig) {
      gradient.addColorStop(parseFloat(key), gradientConfig[key]);
    }
    paletteCtx.fillStyle = gradient;
    paletteCtx.fillRect(0, 0, 256, 1);
    return paletteCtx.getImageData(0, 0, 256, 1).data;
  }

  private _getPointTemplate(
    radius: number,
    blurFactor: number
  ): HTMLCanvasElement {
    const tplCanvas = document.createElement("canvas");
    const tplCtx = tplCanvas.getContext("2d")!;
    const x = radius;
    const y = radius;
    tplCanvas.width = tplCanvas.height = radius * 2;
    if (blurFactor === 1) {
      tplCtx.beginPath();
      tplCtx.arc(x, y, radius, 0, 2 * Math.PI, false);
      tplCtx.fillStyle = "rgba(0,0,0,1)";
      tplCtx.fill();
    } else {
      const gradient = tplCtx.createRadialGradient(
        x,
        y,
        radius * blurFactor,
        x,
        y,
        radius
      );
      gradient.addColorStop(0, "rgba(0,0,0,1)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      tplCtx.fillStyle = gradient;
      tplCtx.fillRect(0, 0, 2 * radius, 2 * radius);
    }
    return tplCanvas;
  }

  updateConfig(config: HeatmapConfiguration): void {
    this.config = { ...this.config, ...config };
    if (config.gradient) this._palette = this._getColorPalette(this.config);
    this._setStyles(this.config);
  }

  private _setStyles(config: HeatmapConfiguration): void {
    this._blur = config.blur == null ? DefaultConfig.defaultBlur : config.blur;
    if (config.backgroundColor)
      this.canvas.style.backgroundColor = config.backgroundColor;
    this._opacity = Math.round((config.opacity || 0) * 255);
    this._maxOpacity = Math.round(
      (config.maxOpacity != null
        ? config.maxOpacity
        : DefaultConfig.defaultMaxOpacity) * 255
    );
    this._minOpacity = Math.round(
      (config.minOpacity != null
        ? config.minOpacity
        : DefaultConfig.defaultMinOpacity) * 255
    );
    this._useGradientOpacity = !!config.useGradientOpacity;
    this._kernelMode = config.kernelMode || "radialGradient";
    if (this._kernelMode === "gaussian") this._ensureAccBuffer();
  }

  renderPartial(payload: RenderAllPayload): void {
    if (this._kernelMode === "gaussian") {
      this._drawAlphaGaussian(payload);
      this._colorize();
    } else {
      this._drawAlpha(payload);
      this._colorize();
    }
  }

  renderAll(payload: RenderAllPayload): void {
    this._clear();
    if (this._kernelMode === "gaussian") {
      this._drawAlphaGaussian(payload);
      this._colorize();
    } else {
      this._drawAlpha(payload);
      this._colorize();
    }
  }

  private _clear(): void {
    this.shadowCtx.clearRect(0, 0, this._width, this._height);
    this.ctx.clearRect(0, 0, this._width, this._height);
    this._renderBoundaries = [10000, 10000, 0, 0];
    if (this._kernelMode === "gaussian" && this._accBuffer) {
      this._accBuffer.fill(0);
      this._accMax = 1;
    }
  }

  private _drawAlpha(payload: RenderAllPayload): void {
    const min = payload.min;
    const max = payload.max;
    const data = payload.data || [];
    const blur = 1 - (this._blur || 0);
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const x = point.x;
      const y = point.y;
      const radius =
        point.radius ?? this.config.radius ?? DefaultConfig.defaultRadius;
      const value = Math.min(
        typeof point.value === "number" ? point.value : 1,
        max
      );
      const rectX = x - radius;
      const rectY = y - radius;
      const tpl = this._getPointTemplate(radius, blur);
      this.shadowCtx.globalAlpha = (value - min) / (max - min || 1);
      this.shadowCtx.drawImage(tpl, rectX, rectY);
      if (rectX < this._renderBoundaries[0]) this._renderBoundaries[0] = rectX;
      if (rectY < this._renderBoundaries[1]) this._renderBoundaries[1] = rectY;
      if (rectX + 2 * radius > this._renderBoundaries[2])
        this._renderBoundaries[2] = rectX + 2 * radius;
      if (rectY + 2 * radius > this._renderBoundaries[3])
        this._renderBoundaries[3] = rectY + 2 * radius;
    }
  }

  private _drawAlphaGaussian(payload: RenderAllPayload): void {
    const min = payload.min;
    const max = payload.max;
    const data = payload.data || [];
    this._ensureAccBuffer();
    const width = this._width;
    const height = this._height;

    // 累加所有点（使用原始权重值进行线性累加）
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      const baseRadius =
        point.radius ?? this.config.radius ?? DefaultConfig.defaultRadius;
      const valueRaw = typeof point.value === "number" ? point.value : min;
      const clampedValue = Math.max(min, Math.min(max, valueRaw));

      // 将 radius 映射为高斯 sigma 的比例：经验 0.5
      const sigma = Math.max(0.1, baseRadius * 0.5);
      const windowR = Math.max(1, Math.floor(3 * sigma));
      const twoSigma2 = 2 * sigma * sigma;

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
          const idx = rowOffset + xx;
          this._accBuffer![idx] += w * clampedValue;
        }
      }

      // 更新渲染边界为当前点影响范围
      const rectX = startX;
      const rectY = startY;
      const rectW = endX - startX;
      const rectH = endY - startY;
      if (rectX < this._renderBoundaries[0]) this._renderBoundaries[0] = rectX;
      if (rectY < this._renderBoundaries[1]) this._renderBoundaries[1] = rectY;
      if (startX + rectW > this._renderBoundaries[2])
        this._renderBoundaries[2] = startX + rectW;
      if (startY + rectH > this._renderBoundaries[3])
        this._renderBoundaries[3] = startY + rectH;
    }

    // 计算当前边界内的最大累加值用于归一化（KDE 场强范围）
    const boundaries = this._renderBoundaries;
    const bStartX = Math.max(0, boundaries[0]);
    const bStartY = Math.max(0, boundaries[1]);
    const bEndX = Math.min(width - 1, boundaries[2]);
    const bEndY = Math.min(height - 1, boundaries[3]);

    let maxAcc = 0;
    for (let yy = bStartY; yy <= bEndY; yy++) {
      const rowOffset = yy * width;
      for (let xx = bStartX; xx <= bEndX; xx++) {
        const v = this._accBuffer![rowOffset + xx];
        if (v > maxAcc) maxAcc = v;
      }
    }
    this._accMax = Math.max(1e-6, maxAcc);

    // 将累加值写入 shadowCtx 的 alpha 通道（按场强最大值归一化）
    const img = this.shadowCtx.getImageData(
      bStartX,
      bStartY,
      Math.max(1, bEndX - bStartX),
      Math.max(1, bEndY - bStartY)
    );
    const dataArr = img.data;
    let p = 0;
    for (let yy = bStartY; yy < bEndY; yy++) {
      const rowOffset = yy * width;
      for (let xx = bStartX; xx < bEndX; xx++) {
        const v = this._accBuffer![rowOffset + xx];
        const alpha = Math.max(
          0,
          Math.min(255, Math.round((v / this._accMax) * 255))
        );
        // RGB 先置零，后续 _colorize 会根据 alpha 着色
        dataArr[p++] = 0; // R
        dataArr[p++] = 0; // G
        dataArr[p++] = 0; // B
        dataArr[p++] = alpha; // A
      }
    }
    this.shadowCtx.putImageData(img, bStartX, bStartY);
  }

  private _colorize(): void {
    const boundaries = this._renderBoundaries;
    const startX = Math.max(0, boundaries[0]);
    const startY = Math.max(0, boundaries[1]);
    const endX = Math.min(this._width - 1, boundaries[2]);
    const endY = Math.min(this._height - 1, boundaries[3]);
    const image = this.shadowCtx.getImageData(
      startX,
      startY,
      endX - startX,
      endY - startY
    );
    const imageData = image.data;
    const palette = this._palette;
    const opacity = this._opacity;
    const maxOpacity = this._maxOpacity;
    const minOpacity = this._minOpacity;
    const useGradientOpacity = this._useGradientOpacity;

    // colorize alpha values
    for (let i = 3; i < imageData.length; i += 4) {
      const alpha = imageData[i];
      const offset = alpha * 4;
      imageData[i - 3] = palette[offset];
      imageData[i - 2] = palette[offset + 1];
      imageData[i - 1] = palette[offset + 2];

      if (opacity > 0) {
        imageData[i] = opacity;
      } else {
        if (alpha < minOpacity) {
          imageData[i] = 0;
        } else if (alpha > maxOpacity) {
          imageData[i] = maxOpacity;
        } else {
          imageData[i] = alpha;
        }
      }
    }

    this.ctx.putImageData(image, startX, startY);
  }

  setDimensions(width: number, height: number): void {
    this._width = width;
    this._height = height;
    this.canvas.width = this.shadowCanvas.width = width;
    this.canvas.height = this.shadowCanvas.height = height;
    if (this._kernelMode === "gaussian") this._ensureAccBuffer();
  }

  getValueAt(point: { x: number; y: number }): number {
    const img = this.shadowCtx.getImageData(point.x, point.y, 1, 1);
    const data = img.data[3];
    return data;
  }

  getDataURL(): string {
    return this.canvas.toDataURL();
  }

  getColorPalette(): Uint8ClampedArray {
    return this._palette;
  }
}

class Heatmap {
  private _config: HeatmapConfiguration;
  private _coordinator: Coordinator;
  private _renderer: Canvas2dRenderer;
  private _store: HeatmapStore;

  constructor(config: HeatmapConfiguration) {
    this._config = { ...config };
    this._coordinator = new Coordinator();
    this._renderer = new Canvas2dRenderer(config);
    this._store = new HeatmapStore();

    this._coordinator.on("renderpartial", (data: RenderAllPayload) =>
      this._renderer.renderPartial(data)
    );
    this._coordinator.on("renderall", (data: RenderAllPayload) =>
      this._renderer.renderAll(data)
    );
    this._coordinator.on(
      "extremachange",
      (data: { min: number; max: number }) => {
        this._config.onExtremaChange &&
          this._config.onExtremaChange({
            min: data.min,
            max: data.max,
            gradient: this._config.gradient || DefaultConfig.defaultGradient,
          });
      }
    );
    this._store.setCoordinator(this._coordinator);
  }

  addData(point: HeatmapPoint | HeatmapPoint[]): this {
    this._store.addData(point);
    return this;
  }

  removeData(point: HeatmapPoint | HeatmapPoint[]): this {
    // no-op in lightweight impl
    return this;
  }

  setData(data: HeatmapSetDataOptions): this {
    this._store.setData(data);
    return this;
  }

  setDataMax(max: number): this {
    this._store.setDataMax(max);
    return this;
  }

  setDataMin(min: number): this {
    this._store.setDataMin(min);
    return this;
  }

  configure(config: Partial<HeatmapConfiguration>): this {
    this._config = { ...this._config, ...config } as HeatmapConfiguration;
    this._renderer.updateConfig(this._config);
    this._coordinator.emit("renderall", this._store._getInternalData());
    return this;
  }

  repaint(): this {
    this._coordinator.emit("renderall", this._store._getInternalData());
    return this;
  }

  getData(): HeatmapSetDataOptions {
    return this._store.getData();
  }

  getDataURL(): string {
    return this._renderer.getDataURL();
  }

  getColorPalette(): Uint8ClampedArray {
    return this._renderer.getColorPalette();
  }

  getValueAt(point: { x: number; y: number }): number {
    return this._renderer.getValueAt(point);
  }

  // expose renderer for CesiumHeatmap to read shadowCanvas
  get _rendererInstance() {
    return this._renderer;
  }
}

export default {
  create(config: HeatmapConfiguration) {
    const h = new Heatmap(config);
    // 兼容旧接口：暴露 _renderer 供上层读取 shadowCanvas
    (h as any)._renderer = (h as any)._rendererInstance;
    return h as any;
  },
};
