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
  onExtremaChange?: (info: { min: number; max: number; gradient: { [key: string]: string } }) => void;
  useGradientOpacity?: boolean;
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
  private cStore: Record<string, Array<(data: any) => void>> = {};
  on(evtName: string, callback: (data: any) => void): void {
    if (!this.cStore[evtName]) this.cStore[evtName] = [];
    this.cStore[evtName].push(callback);
  }
  emit(evtName: string, data: any): void {
    const list = this.cStore[evtName];
    if (!list) return;
    for (let i = 0; i < list.length; i++) list[i](data);
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
      this._coordinator.emit("extremachange", { min: this._min, max: this._max });
    }
    return this;
  }

  setDataMin(min: number): this {
    this._min = min;
    if (this._coordinator) {
      this._coordinator.emit("renderall", this._getInternalData());
      this._coordinator.emit("extremachange", { min: this._min, max: this._max });
    }
    return this;
  }

  getData(): HeatmapSetDataOptions {
    return { min: this._min, max: this._max, data: this._data.map((p) => ({ ...p })) };
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
  private _renderBoundaries: [number, number, number, number] = [10000, 10000, 0, 0];
  private _palette: Uint8ClampedArray;
  private _blur = DefaultConfig.defaultBlur;
  private _opacity = 0;
  private _maxOpacity = DefaultConfig.defaultMaxOpacity * 255;
  private _minOpacity = DefaultConfig.defaultMinOpacity * 255;
  private _useGradientOpacity = false;

  constructor(private config: HeatmapConfiguration) {
    const container = config.container;
    const shadowCanvas = (this.shadowCanvas = document.createElement("canvas"));
    const canvas = (this.canvas = config.canvas || document.createElement("canvas"));

    const computed = getComputedStyle(container) || ({} as any);
    canvas.className = "heatmap-canvas";
    this._width = canvas.width = shadowCanvas.width = parseInt(String(computed.width || "256").replace(/px/, ""), 10) || 256;
    this._height = canvas.height = shadowCanvas.height = parseInt(String(computed.height || "256").replace(/px/, ""), 10) || 256;

    const sctx = shadowCanvas.getContext("2d");
    const cctx = canvas.getContext("2d");
    if (!sctx || !cctx) throw new Error("2d context not available");
    this.shadowCtx = sctx;
    this.ctx = cctx;

    canvas.style.cssText = shadowCanvas.style.cssText = "position:absolute;left:0;top:0;";
    container.style.position = "relative";
    container.appendChild(canvas);

    this._palette = this._getColorPalette(config);
    this._setStyles(config);
  }

  private _getColorPalette(config: HeatmapConfiguration): Uint8ClampedArray {
    const gradientConfig = (config.gradient || DefaultConfig.defaultGradient) as Record<string, string>;
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

  private _getPointTemplate(radius: number, blurFactor: number): HTMLCanvasElement {
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
      const gradient = tplCtx.createRadialGradient(x, y, radius * blurFactor, x, y, radius);
      gradient.addColorStop(0, "rgba(0,0,0,1)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      tplCtx.fillStyle = gradient;
      tplCtx.fillRect(0, 0, 2 * radius, 2 * radius);
    }
    return tplCanvas;
  }

  updateConfig(config: HeatmapConfiguration): void {
    if (config.gradient) this._palette = this._getColorPalette(config);
    this._setStyles(config);
  }

  private _setStyles(config: HeatmapConfiguration): void {
    this._blur = config.blur == null ? DefaultConfig.defaultBlur : config.blur;
    if (config.backgroundColor) this.canvas.style.backgroundColor = config.backgroundColor;
    this._opacity = Math.round((config.opacity || 0) * 255);
    this._maxOpacity = Math.round((config.maxOpacity != null ? config.maxOpacity : DefaultConfig.defaultMaxOpacity) * 255);
    this._minOpacity = Math.round((config.minOpacity != null ? config.minOpacity : DefaultConfig.defaultMinOpacity) * 255);
    this._useGradientOpacity = !!config.useGradientOpacity;
  }

  setDimensions(width: number, height: number): void {
    this._width = width;
    this._height = height;
    this.canvas.width = this.shadowCanvas.width = width;
    this.canvas.height = this.shadowCanvas.height = height;
  }

  renderPartial(payload: RenderAllPayload): void {
    this._drawAlpha(payload);
    this._colorize();
  }

  renderAll(payload: RenderAllPayload): void {
    this._clear();
    this._drawAlpha(payload);
    this._colorize();
  }

  private _clear(): void {
    this.shadowCtx.clearRect(0, 0, this._width, this._height);
    this.ctx.clearRect(0, 0, this._width, this._height);
    this._renderBoundaries = [10000, 10000, 0, 0];
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
      const radius = point.radius || DefaultConfig.defaultRadius;
      const value = Math.min(typeof point.value === "number" ? point.value : 1, max);
      const rectX = x - radius;
      const rectY = y - radius;
      const tpl = this._getPointTemplate(radius, blur);
      this.shadowCtx.globalAlpha = (value - min) / (max - min || 1);
      this.shadowCtx.drawImage(tpl, rectX, rectY);
      if (rectX < this._renderBoundaries[0]) this._renderBoundaries[0] = rectX;
      if (rectY < this._renderBoundaries[1]) this._renderBoundaries[1] = rectY;
      if (rectX + 2 * radius > this._renderBoundaries[2]) this._renderBoundaries[2] = rectX + 2 * radius;
      if (rectY + 2 * radius > this._renderBoundaries[3]) this._renderBoundaries[3] = rectY + 2 * radius;
    }
  }

  private _colorize(): void {
    let x = this._renderBoundaries[0];
    let y = this._renderBoundaries[1];
    let width = this._renderBoundaries[2] - x;
    let height = this._renderBoundaries[3] - y;
    const maxWidth = this._width;
    const maxHeight = this._height;

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + width > maxWidth) width = maxWidth - x;
    if (y + height > maxHeight) height = maxHeight - y;

    const img = this.shadowCtx.getImageData(x, y, width, height);
    const imgData = img.data;
    const len = imgData.length;
    const palette = this._palette;
    const opacity = this._opacity;
    const maxOpacity = this._maxOpacity;
    const minOpacity = this._minOpacity;
    const useGradientOpacity = this._useGradientOpacity;

    for (let i = 3; i < len; i += 4) {
      const alpha = imgData[i];
      const offset = alpha * 4;
      if (!offset) continue;
      let finalAlpha = alpha;
      if (opacity > 0) finalAlpha = opacity;
      else {
        if (alpha < maxOpacity) finalAlpha = alpha < minOpacity ? minOpacity : alpha;
        else finalAlpha = maxOpacity;
      }
      imgData[i - 3] = palette[offset];
      imgData[i - 2] = palette[offset + 1];
      imgData[i - 1] = palette[offset + 2];
      imgData[i] = useGradientOpacity ? palette[offset + 3] : finalAlpha;
    }
    this.ctx.putImageData(img, x, y);
    this._renderBoundaries = [10000, 10000, 0, 0];
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

    this._coordinator.on("renderpartial", (data: RenderAllPayload) => this._renderer.renderPartial(data));
    this._coordinator.on("renderall", (data: RenderAllPayload) => this._renderer.renderAll(data));
    this._coordinator.on("extremachange", (data: { min: number; max: number }) => {
      this._config.onExtremaChange &&
        this._config.onExtremaChange({ min: data.min, max: data.max, gradient: this._config.gradient || DefaultConfig.defaultGradient });
    });
    this._store.setCoordinator(this._coordinator);
  }

  addData(points: HeatmapPoint | HeatmapPoint[]): this {
    this._store.addData(points);
    return this;
  }

  removeData(..._args: any[]): this {
    // not used in our engine; keep API for compatibility
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

const heatmapFactory = {
  create(config: HeatmapConfiguration) {
    const h = new Heatmap(config);
    // provide compatibility: CesiumHeatmap expects _renderer field
    (h as any)._renderer = (h as any)._rendererInstance;
    return h as any;
  },
  register(_pluginKey: string, _plugin: any) {
    // plugin system not implemented in TS port
  },
};

export default heatmapFactory;