import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";
import {
  HeatmapLayer,
  HeatmapOption,
  HeatmapConfiguration,
  HeatmapDataOption,
  ContourLineOption,
} from "../DataSources/Heatmap/HeatmapLayer";

export interface HeatmapRecord {
  id: string;
  instance: HeatmapLayer;
}

/**
 * 热度图管理器
 */
export default class HeatmapManager extends AbstractManager {
  private readonly records: Map<string, HeatmapRecord> = new Map();

  constructor(core: AbstractCore) {
    super(core);
  }

  /** 创建热度图 */
  add(id: string, options: HeatmapOption): HeatmapLayer {
    if (this.records.has(id)) {
      throw new Error(`Heatmap with id '${id}' already exists`);
    }
    const heatmap = new HeatmapLayer(this.viewer, options);
    this.records.set(id, { id, instance: heatmap });
    return heatmap;
  }

  /** 判断是否存在 */
  isExists(id: string): boolean {
    return this.records.has(id);
  }

  /** 获取实例 */
  getById(id: string): HeatmapLayer | undefined {
    return this.records.get(id)?.instance;
  }

  /** 更新热度图配置 */
  update(
    id: string,
    cfg: {
      heatmap?: HeatmapConfiguration;
      dataRange?: HeatmapDataOption;
      radius?: number;
      contour?: ContourLineOption;
    }
  ): void {
    const inst = this.records.get(id)?.instance;
    if (!inst) return;
    if (cfg.dataRange) inst.updateHeatMapMaxMin(cfg.dataRange);
    if (cfg.heatmap) inst.updateHeatmap(cfg.heatmap);
    if (typeof cfg.radius === "number") inst.updateRadius(cfg.radius);
    if (cfg.contour) inst.updateContourLineOption(cfg.contour);
  }

  /** 移除热度图 */
  remove(id: string): boolean {
    const rec = this.records.get(id);
    if (!rec) return false;
    rec.instance.remove();
    this.records.delete(id);
    return true;
  }

  /** 清空所有热度图 */
  clearAll(): void {
    this.records.forEach((rec) => rec.instance.remove());
    this.records.clear();
  }
}
