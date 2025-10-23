import {
  EllipsoidSurfaceAppearance,
  GeometryInstance,
  Material,
  Primitive,
  Rectangle,
  RectangleGeometry,
  Viewer,
  Event,
  SingleTileImageryProvider,
  ImageryLayer,
  ImageMaterialProperty,
  Entity,
  PolylineGraphics,
  Color,
  Cartesian3,
  PolygonHierarchy,
  ScreenSpaceEventHandler,
} from "cesium";
import h337 from "./HeatmapJS"; // 使用本地 TypeScript 版本实现
import { contours, ContourMultiPolygon } from "d3-contour";

export interface IHeatmap {
  addData(point: any | any[]): this;
  removeData(point: any | any[]): this;
  setData(data: any): this;
  setDataMax(max: number): this;
  setDataMin(min: number): this;
  configure(options: any): this;
  getValueAt(position: { x: number; y: number }): number;
  getData(): any;
  getDataURL(): string;
  getColorPalette(): Uint8ClampedArray;
  repaint(): this;
  _renderer: any;
}

export interface ContourLineOption {
  show?: boolean;
  contourCount?: number;
  width?: number;
  color?: string;
  thresholdMode?: "equalInterval" | "quantile" | "custom";
  epsilonLowRatio?: number; // 低端偏移比例 (0-0.2)，默认 0.01
  epsilonHighRatio?: number; // 高端偏移比例 (0-0.2)，默认 0.01
  smooth?: boolean; // 是否平滑 d3-contour
  customThresholds?: number[]; // 自定义阈值（alpha 值 0-255）
}

export interface BaseHeatmapConfiguration {
  /**
   * A background color string in form of hexcode, color name, or rgb(a)
   */
  backgroundColor?: string | undefined;

  /**
   * The blur factor that will be applied to all datapoints. The higher the
   * blur factor is, the smoother the gradients will be
   * Default value: 0.85
   */
  blur?: number | undefined;

  /**
   * An object that represents the gradient.
   * Syntax: {[key: number in range [0,1]]: color}
   */
  gradient?: { [key: string]: string } | undefined;

  /**
   * The maximal opacity the highest value in the heatmap will have. (will be
   * overridden if opacity set)
   * Default value: 0.6
   */
  maxOpacity?: number | undefined;

  /**
   * The minimum opacity the lowest value in the heatmap will have (will be
   * overridden if opacity set)
   */
  minOpacity?: number | undefined;

  /**
   * A global opacity for the whole heatmap. This overrides maxOpacity and
   * minOpacity if set
   * Default value: 0.6
   */
  opacity?: number | undefined;

  /**
   * The radius each datapoint will have (if not specified on the datapoint
   * itself)
   */
  radius?: number | undefined;

  /**
   * The property name of the value/weight in a datapoint
   * Default value: 'value'
   */
  valueField?: undefined;

  /**
   * Pass a callback to receive extrema change updates. Useful for DOM
   * legends.
   */
  onExtremaChange?: (() => void) | undefined;

  /**
   * Indicate whether the heatmap should use a global extrema or a local
   * extrema (the maximum and minimum of the currently displayed viewport)
   */
  useLocalExtrema?: boolean | undefined;
}
export interface HeatmapPoint {
  x: number;
  y: number;
  value?: number;
}

export interface HeatmapConfiguration extends BaseHeatmapConfiguration {}
export interface HeatmapDataOption {
  max?: number; //数据最大值
  min?: number; //数据最小值
}

export type RenderType = "primitive" | "imagery" | "entity";
export interface HeatmapOption {
  noLisenerCamera?: boolean; //不监听相机
  cameraHeightDistance?: number; //相机高度的差值，大于这个值时重新渲染底图
  renderType?: RenderType; //渲染类型
  points: HeatmapPoint[];
  bounds?: number[];
  heatmapOptions?: BaseHeatmapConfiguration;
  heatmapDataOptions?: HeatmapDataOption;
  zoomToLayer?: boolean;
  onRadiusChange?: (radius: number) => void;
  contourLineOption?: ContourLineOption;
}

export type Bounds = [number, number, number, number];

const Max = (arr: number[]) => {
  let len = arr.length;
  let max = -Infinity;

  while (len--) {
    max = arr[len] > max ? arr[len] : max;
  }
  return max;
};

const Min = (arr: number[]) => {
  let len = arr.length;
  let min = Infinity;

  while (len--) {
    min = arr[len] < min ? arr[len] : min;
  }
  return min;
};

/**
 * 热度图
 */
export class HeatmapLayer {
  private viewer: Viewer;
  private element?: HTMLElement;
  private initOptions: HeatmapOption;
  private heatmapOptions?: HeatmapConfiguration;
  private heatmapDataOptions?: HeatmapDataOption;
  private provider?: any;
  private heatmap?: IHeatmap;
  private cameraMoveEnd?: Event.RemoveCallback;
  private bounds: Bounds = [0, 0, 0, 0];
  private lastCameraHeight = 0;
  private initRadius = 10;
  private contourLineOption?: ContourLineOption;
  private contourLineEntities: Entity[] = [];
  constructor(viewer: Viewer, options: HeatmapOption) {
    this.viewer = viewer;
    this.initOptions = { ...options };
    if (this.initOptions?.points) {
      const bounds: Bounds = this.getBounds(this.initOptions.points);
      this.bounds = bounds;
      const { container, width, height } = this.createContainer(bounds);
      this.element = container;
      const datas = [];
      const values: number[] = [];
      for (let i in this.initOptions.points) {
        const point = this.initOptions.points[i];
        const x = ((point.x - bounds[0]) / (bounds[2] - bounds[0])) * width; //屏幕坐标x
        const y = ((bounds[3] - point.y) / (bounds[3] - bounds[1])) * height; //屏幕坐标y
        const dataPoint = {
          x: x,
          y: y,
          value: point.value,
        };
        if (typeof point.value === "number") values.push(point.value);
        datas.push(dataPoint);
      }

      //数据的最大值和最小值
      let _min = values.length > 100000 ? Min(values) : Math.min(...values);
      let _max = values.length > 100000 ? Max(values) : Math.max(...values);
      if (this.initOptions?.heatmapDataOptions) {
        const { min, max } = this.initOptions.heatmapDataOptions;
        if (typeof min === "number") {
          _min = min;
        }
        if (typeof max === "number") {
          _max = max;
        }
      }
      this.heatmapDataOptions = { min: _min, max: _max };

      const data = {
        max: _max,
        min: _min,
        data: datas,
      };

      const defaultOptions = {
        maxOpacity: 0.9,
        // minimum opacity. any value > 0 will produce
        // no transparent gradient transition
        minOpacity: 0.1,
        gradient: {
          ".3": "blue",
          ".5": "green",
          ".7": "yellow",
          ".95": "red",
        },
      };
      const _options = this.initOptions.heatmapOptions
        ? { ...defaultOptions, ...this.initOptions.heatmapOptions }
        : defaultOptions;

      // 初始化配置与半径
      this.heatmapOptions = { ..._options };
      if (typeof this.heatmapOptions.radius === "number") {
        this.initRadius = this.heatmapOptions.radius;
      }

      const options = {
        ...this.heatmapOptions,
        container,
      };
      this.heatmap = h337.create(options) as unknown as IHeatmap;
      this.heatmap.setData(data as any);
      this.createLayer();
      if (this.initOptions.contourLineOption) {
        this.contourLineOption = { ...this.initOptions.contourLineOption };
        if (this.contourLineOption.show) {
          this.drawContourLine();
        }
      }

      if (!this.initOptions.noLisenerCamera) {
        this.addLisener();
      }

      if (this.initOptions.zoomToLayer && bounds) {
        this.viewer.camera.flyTo({
          destination: Rectangle.fromDegrees(...bounds),
        });
      }
    }
  }

  /**
   * 设置数据的最大最小值
   * @param dataOption
   */
  updateHeatMapMaxMin(dataOption: HeatmapDataOption) {
    const { min, max } = dataOption;
    if (this.heatmap) {
      if (typeof min === "number") {
        this.heatmap.setDataMin(min);
        if (this.heatmapDataOptions) this.heatmapDataOptions.min = min;
      }
      if (typeof max === "number") {
        this.heatmap.setDataMax(max);
        if (this.heatmapDataOptions) this.heatmapDataOptions.max = max;
      }
    }
    this.updateLayer();
  }

  /**
   * 更新热度图配置
   * @param options
   */
  updateHeatmap(options: HeatmapConfiguration) {
    if (this.heatmap) {
      const { heatmapOptions } = this;
      this.heatmap.configure({ ...heatmapOptions, ...options });
      this.updateLayer();
    }
  }

  /**
   * 更新半径
   * @param radius
   */
  updateRadius(radius: number) {
    if (this.heatmap) {
      const { heatmapOptions } = this;
      const currentData = this.heatmap.getData();
      if (currentData?.data) {
        for (let i in currentData.data) {
          const data = currentData.data[i];
          data.radius = radius;
        }
      }
      this.heatmap.setData(currentData);
      this.heatmapOptions = { ...heatmapOptions, ...{ radius } };
      this.updateLayer();
      if (this.initOptions?.onRadiusChange) {
        this.initOptions.onRadiusChange(radius);
      }
    }
  }

  /**
   * 更新等值线配置
   * @param options
   */
  updateContourLineOption(options: ContourLineOption) {
    this.contourLineOption = { ...this.contourLineOption, ...options };
    this.drawContourLine();
  }

  /**
   * 移除
   */
  remove() {
    if (this.element) {
      document.body.removeChild(this.element);
      this.element = undefined;
    }
    if (this.provider instanceof ImageryLayer) {
      this.viewer.imageryLayers.remove(this.provider);
    } else if (this.provider instanceof Primitive) {
      this.viewer.scene.primitives.remove(this.provider);
    } else if (this.provider instanceof Entity) {
      this.viewer.entities.remove(this.provider);
    }
    this.provider = undefined;
    if (this.cameraMoveEnd) {
      this.viewer.camera.moveEnd.removeEventListener(this.cameraMoveEnd);
      this.cameraMoveEnd = undefined;
    }
    this.clearContourLine();
    this.heatmap = undefined;
  }

  private createLayer() {
    if (this.initOptions.renderType === "primitive") {
      this.createPrimitive();
    } else if (this.initOptions.renderType === "imagery") {
      this.createSingleTileImageryLayer();
    } else {
      this.createEntity();
    }
  }

  private createPrimitive() {
    if (this.heatmap) {
      const url = this.heatmap.getDataURL();
      this.provider = this.viewer.scene.primitives.add(
        new Primitive({
          geometryInstances: new GeometryInstance({
            geometry: new RectangleGeometry({
              rectangle: Rectangle.fromDegrees(...this.bounds),
              vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            }),
          }),
          appearance: new EllipsoidSurfaceAppearance({
            aboveGround: false,
          }),
          show: true,
        })
      );
      if (this.provider) {
        this.provider.appearance.material = new Material({
          fabric: {
            type: "Image",
            uniforms: {
              image: url,
            },
          },
        });
      }
    }
  }

  private createSingleTileImageryLayer() {
    if (this.heatmap) {
      const url = this.heatmap.getDataURL();
      // 从渲染器或容器读取实际画布尺寸，作为单瓦片的宽高
      const renderer = (this.heatmap as any)._renderer;
      const canvas: HTMLCanvasElement | undefined = renderer?.canvas;
      const rect = this.element?.getBoundingClientRect();
      const tileWidth = Math.max(1, Math.floor((canvas?.width ?? rect?.width ?? 256)));
      const tileHeight = Math.max(1, Math.floor((canvas?.height ?? rect?.height ?? 256)));
      this.provider = this.viewer.imageryLayers.addImageryProvider(
        new SingleTileImageryProvider({
          url: url,
          rectangle: Rectangle.fromDegrees(...this.bounds),
          tileWidth,
          tileHeight,
        })
      );
    }
  }

  private getImageMaterialProperty() {
    if (this.heatmap) {
      const url = this.heatmap.getDataURL();
      const material = new ImageMaterialProperty({
        image: url,
      });
      return material;
    }
  }

  private createEntity() {
    this.provider = this.viewer.entities.add({
      show: true,
      rectangle: {
        coordinates: Rectangle.fromDegrees(...this.bounds),
        material: this.getImageMaterialProperty(),
      },
    });
  }

  private updateLayer() {
    if (this.heatmap) {
      const src = this.heatmap.getDataURL();
      if (this.provider instanceof ImageryLayer) {
        if (this.provider) {
          this.viewer.imageryLayers.remove(this.provider);
        }
        this.createSingleTileImageryLayer();
      } else if (this.provider instanceof Primitive) {
        this.provider.appearance.material.uniforms.image = src;
      } else if (this.provider instanceof Entity) {
        if (this.provider.rectangle) {
          const material = this.getImageMaterialProperty();
          if (material) {
            this.provider.rectangle.material = material;
          }
        }
      }
      if (this.contourLineOption?.show) {
        this.drawContourLine();
      }
    }
  }

  /**
   * 添加相机的监听
   */
  private addLisener() {
    const maxRadius = 100;
    const minHeight = 6375000;
    const maxHeight = 10000000;
    this.cameraMoveEnd = () => {
      if (this.heatmapOptions && this.heatmap && this.heatmapDataOptions) {
        const h = this.viewer.camera.getMagnitude();
        const distance = this?.initOptions?.cameraHeightDistance
          ? this.initOptions.cameraHeightDistance
          : 1000;
        if (Math.abs(h - this.lastCameraHeight) > distance) {
          this.lastCameraHeight = h;
          // 规范化高度到 [0,1]
          const t = Math.max(0, Math.min(1, (h - minHeight) / (maxHeight - minHeight)));
          // 在 [initRadius, maxRadius] 区间线性插值
          const interp = this.initRadius + (maxRadius - this.initRadius) * t;
          const radius = Math.max(1, Math.floor(interp));
          this.updateRadius(radius);
        }
      }
    };
    this.viewer.camera.moveEnd.addEventListener(this.cameraMoveEnd);
  }

  /**
   * 绘制等值线
   */
  private drawContourLine() {
    this.clearContourLine();
    if (this.heatmap && this.heatmap._renderer.shadowCanvas && this.element) {
      const { width, height } = this.element.getBoundingClientRect();
      const canvas = this.heatmap._renderer.shadowCanvas as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = [];
      for (let i = 0; i < imgData.data.length; i += 4) {
        data.push(imgData.data[i + 3]);
      }
      const alphaMin = data.length ? Min(data) : 0;
      const alphaMax = data.length ? Max(data) : 255;
      if (alphaMax <= alphaMin) {
        return;
      }
      const gradientStops = this.heatmapOptions?.gradient ? Object.keys(this.heatmapOptions.gradient).length : 5;
       const contourCount = typeof this.contourLineOption?.contourCount === "number"
         ? (this.contourLineOption!.contourCount as number)
         : Math.max(1, gradientStops);
      const rangeAlpha = alphaMax - alphaMin;
      const epsLowRatio = Math.max(0, Math.min(0.2, this.contourLineOption?.epsilonLowRatio ?? 0.01));
      const epsHighRatio = Math.max(0, Math.min(0.2, this.contourLineOption?.epsilonHighRatio ?? 0.01));
      let epsilonLow = Math.max(1, Math.round(rangeAlpha * epsLowRatio));
      let epsilonHigh = Math.max(1, Math.round(rangeAlpha * epsHighRatio));
      if (epsilonLow + epsilonHigh >= rangeAlpha) {
        const reduce = Math.max(0, rangeAlpha - 2);
        const scale = reduce > 0 ? reduce / (epsilonLow + epsilonHigh) : 0;
        epsilonLow = Math.max(1, Math.floor(epsilonLow * scale));
        epsilonHigh = Math.max(1, Math.floor(epsilonHigh * scale));
      }
      const lowClip = Math.min(alphaMax - 1, alphaMin + epsilonLow);
      const highClip = Math.max(alphaMin + 1, Math.min(alphaMax - 1, alphaMax - epsilonHigh));
      const thresholds: number[] = [];
      const mode = this.contourLineOption?.thresholdMode ?? "equalInterval";
      if (contourCount > 0 && rangeAlpha > 0 && lowClip < highClip) {
        if (mode === "custom" && Array.isArray(this.contourLineOption?.customThresholds)) {
          const raw = (this.contourLineOption!.customThresholds || []).slice().sort((a, b) => a - b);
          for (const t of raw) {
            const v = Math.max(lowClip, Math.min(highClip, t));
            if (!thresholds.length || Math.abs(thresholds[thresholds.length - 1] - v) > 1e-6) thresholds.push(v);
          }
          if (!thresholds.length || thresholds[thresholds.length - 1] < highClip - 1e-6) thresholds.push(highClip);
        } else if (mode === "quantile") {
          const bins = new Array(256).fill(0);
          for (let i = 0; i < data.length; i++) bins[data[i]]++;
          let trimmedTotal = 0;
          for (let a = lowClip; a <= highClip; a++) trimmedTotal += bins[a];
          const steps = Math.max(1, contourCount);
          const stepSize = trimmedTotal / steps;
          let cumulative = 0;
          let targetIdx = 1;
          for (let a = lowClip; a <= highClip && targetIdx < steps; a++) {
            cumulative += bins[a];
            while (targetIdx < steps && cumulative >= stepSize * targetIdx) {
              thresholds.push(a);
              targetIdx++;
            }
          }
          if (!thresholds.length || thresholds[thresholds.length - 1] < highClip - 1e-6) thresholds.push(highClip);
        } else {
          const stepsCount = Math.max(0, contourCount - 1);
          const effectiveRange = Math.max(0, highClip - lowClip);
          if (stepsCount > 0 && effectiveRange > 0) {
            const step = effectiveRange / stepsCount;
            for (let i = 0; i < stepsCount; i++) thresholds.push(lowClip + step * i);
            if (!thresholds.length || thresholds[thresholds.length - 1] < highClip - 1e-6) thresholds.push(highClip);
          } else {
            thresholds.push(lowClip);
            if (lowClip < highClip) thresholds.push(highClip);
          }
        }
      }
      const _contours = contours()
        .size([width, height])
        .smooth(!!this.contourLineOption?.smooth)
        .thresholds(thresholds)(data);
      const that = this;
      const palette = this.heatmap.getColorPalette();
      _contours.forEach((contour: ContourMultiPolygon) => {
        const thresholdAlpha = (contour as any).value as number;
        const intensity = Math.max(0, Math.min(1, thresholdAlpha / 255));
        const colorIndex = Math.round(intensity * 255);
        contour.coordinates.forEach((polygon: number[][][]) => {
          polygon.forEach((ring: number[][]) => {
            const wDen = Math.max(width - 1, 1);
            const hDen = Math.max(height - 1, 1);
            const positions = ring.map((p: number[]) => {
              const lon =
                that.bounds[0] + (p[0] / wDen) * (that.bounds[2] - that.bounds[0]);
              const lat =
                that.bounds[3] - (p[1] / hDen) * (that.bounds[3] - that.bounds[1]);
              return Cartesian3.fromDegrees(lon, lat);
            });
            const idx = colorIndex * 4;
             const a = palette[idx + 3] / 255;
             const boostedA = Math.min(1, Math.max(0.4, a * 1.5));
             let colorWithAlpha: Color;
             if (this.contourLineOption?.color) {
               const base = Color.fromCssColorString(this.contourLineOption.color) || Color.WHITE;
               colorWithAlpha = new Color(base.red, base.green, base.blue, boostedA);
             } else {
               const r = palette[idx] / 255;
               const g = palette[idx + 1] / 255;
               const b = palette[idx + 2] / 255;
               colorWithAlpha = new Color(r, g, b, boostedA);
             }
             const entity = this.viewer.entities.add({
               polyline: {
                 positions: positions,
                 width: typeof this.contourLineOption?.width === "number" ? this.contourLineOption!.width! : 1,
                 material: colorWithAlpha,
               },
             });
            this.contourLineEntities.push(entity);
          });
        });
      });
    }
  }

  /**
   * 清除等值线
   */
  private clearContourLine() {
    this.contourLineEntities.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    this.contourLineEntities = [];
  }

  /**
   *
   * @param points
   * @param expand
   * @returns
   */
  private getBounds(points: HeatmapPoint[]) {
    if (points) {
      let lonMin = 180;
      let lonMax = -180;
      let latMin = 90;
      let latMax = -180;
      points.forEach(function (point) {
        const { x: longitude, y: latitude } = point;
        lonMin = longitude < lonMin ? longitude : lonMin;
        latMin = latitude < latMin ? latitude : latMin;
        lonMax = longitude > lonMax ? longitude : lonMax;
        latMax = latitude > latMax ? latitude : latMax;
      });
      const xRange = lonMax - lonMin ? lonMax - lonMin : 1;
      const yRange = latMax - latMin ? latMax - latMin : 1;
      return [
        lonMin - xRange / 10,
        latMin - yRange / 10,
        lonMax + xRange / 10,
        latMax + yRange / 10,
      ] as Bounds;
    }
    return [0, 0, 0, 0] as Bounds;
  }

  private createContainer(bounds: number[]) {
    const container = document.createElement("div");
    const width = 1000;
    const lonSpan = Math.max(1e-6, Math.abs(bounds[2] - bounds[0]));
    const latSpan = Math.max(1e-6, Math.abs(bounds[3] - bounds[1]));
    const heightRaw = (width / lonSpan) * latSpan;
    const height = Math.max(1, Math.min(4096, Math.round(heightRaw)));
    container.setAttribute(
      "style",
      `width:${width}px;height:${height}px;position:absolute;left:-9999px;top:-9999px;`
    );
    document.body.appendChild(container);
    return { container, width, height };
  }
}
