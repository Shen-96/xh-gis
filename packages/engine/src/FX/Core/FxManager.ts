/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-02 17:50:09
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-04 14:56:48
 */
import BaseManager from "../../Core/BaseManager";
import LayerManager from "../../Core/LayerManager";
import AbstractFx from "./AbstractFx";
import {
  Cartesian3,
  Clock,
  Entity,
  HeadingPitchRoll,
  JulianDate,
  Matrix3,
  Matrix4,
  Model,
  Primitive,
  Quaternion,
} from "cesium";

type FxBindingMode = "position" | "orientation" | "position_and_orientation";

type FxAnchor = {
  translation?: Cartesian3; // 局部坐标系下的偏移（米）
  rotation?: HeadingPitchRoll | Quaternion; // 局部坐标系下的旋转
};

type FxSweep = {
  axis?: "x" | "y" | "z";
  speed?: number; // 弧度/秒
  min?: number; // 最小扫角（相对基准，弧度）
  max?: number; // 最大扫角（相对基准，弧度）
};

type FxBindingOptions = {
  mode?: FxBindingMode;
  anchor?: FxAnchor;
  sweep?: FxSweep;
};

type FxBindingRecord = {
  fxId: string;
  target: Entity | Model | Primitive;
  options: FxBindingOptions;
  lastTime?: JulianDate;
  paused?: boolean;
  sweepAngle?: number; // 当前扫角（相对基准，弧度）
  sweepDir?: 1 | -1; // 当前扫角方向（1 正向，-1 反向）
};

// FX 管理器：在兼容旧实现的基础上，提供特效与实体/模型的绑定更新能力
export default class FxManager extends BaseManager {
  #bindings = new Map<string, FxBindingRecord>();
  #tickListener?: (clock: Clock) => void;
  #layerManager: PartialPrivate<LayerManager>;
  #fxArr: Array<AbstractFx> = [];
  #pausedAll = false;

  constructor(core: any) {
    super(core);
    this.#layerManager = core.layerManager;
    this.#tickListener = (clock: Clock) => this.#onTick(clock);
    this.viewer.clock.onTick.addEventListener(this.#tickListener);
  }

  /**
   * 绑定特效到目标（实体/模型/图元），使其随目标更新。
   */
  attach(
    fxId: string,
    target: Entity | Model | Primitive,
    options: FxBindingOptions = {}
  ): boolean {
    if (!fxId || !target) return false;
    const record: FxBindingRecord = {
      fxId,
      target,
      options: {
        mode: options.mode ?? "position_and_orientation",
        anchor: options.anchor ?? {},
        sweep: options.sweep ?? {},
      },
      sweepAngle: 0,
      sweepDir: 1,
      lastTime: undefined,
    };
    // 迁移初始 orientation 到 anchor.rotation（若未设置），以统一绑定后的微调入口
    try {
      const fx = this.getById(fxId) as any;
      const initOri = fx?.orientation;
      if (
        initOri &&
        initOri instanceof Quaternion &&
        !record.options.anchor?.rotation
      ) {
        record.options.anchor = {
          ...(record.options.anchor ?? {}),
          rotation: initOri,
        };
      }
    } catch {}
    this.#bindings.set(fxId, record);
    // 调用生命周期钩子
    try {
      const fx = this.getById(fxId);
      fx?.onAttach();
    } catch {}
    return true;
  }

  /** 解除绑定 */
  detach(fxId: string): boolean {
    const ok = this.#bindings.delete(fxId);
    if (ok) {
      try {
        const fx = this.getById(fxId);
        fx?.onDetach();
      } catch {}
    }
    return ok;
  }

  /** 更新绑定配置 */
  updateBinding(fxId: string, options: Partial<FxBindingOptions>): boolean {
    const record = this.#bindings.get(fxId);
    if (!record) return false;
    record.options = { ...record.options, ...options };
    // 若更新了扫角范围，调整当前扫角到合法区间
    const s = record.options.sweep;
    if (s && typeof s.min === "number" && typeof s.max === "number" && s.min < s.max) {
      const ang = record.sweepAngle ?? 0;
      record.sweepAngle = Math.min(s.max, Math.max(s.min, ang));
      if (record.sweepAngle === s.max) record.sweepDir = -1;
      else if (record.sweepAngle === s.min) record.sweepDir = 1;
    }
    return true;
  }

  /** 时钟驱动：逐绑定更新特效的位姿 */
  #onTick(clock: Clock) {
    if (this.#pausedAll) return;
    const time = clock.currentTime;
    for (const record of this.#bindings.values()) {
      if (record.paused) continue;
      const fx = this.getById(record.fxId);
      if (!fx) continue;

      const { position, orientation } = this.#getTargetPose(record.target, time);
      const { mode, anchor, sweep } = record.options;

      // 基于锚点与扫描动画合成最终姿态
      const endPos = this.#applyAnchorTranslation(position, orientation, anchor);
      const endOri = this.#applyAnchorRotation(orientation, anchor);
      const dt = record.lastTime
        ? Math.max(0, JulianDate.secondsDifference(time, record.lastTime))
        : 0;
      const finalOri = this.#applySweep(endOri, record, dt);

      // 根据模式更新特效
      try {
        switch (mode) {
          case "position":
            fx.setPosition(endPos);
            break;
          case "orientation":
            fx.setOrientation(finalOri);
            break;
          case "position_and_orientation":
          default:
            // 批量位姿更新，避免两次模型矩阵重算
            fx.setPose(endPos, finalOri);
            break;
        }
      } catch {}

      record.lastTime = time;
    }
  }

  /** 获取目标的世界位姿 */
  #getTargetPose(target: Entity | Model | Primitive, time: JulianDate): {
    position?: Cartesian3;
    orientation?: Quaternion;
  } {
    // Entity：优先用属性，其次用 computeModelMatrix
    // Model/Primitive：使用其 modelMatrix 推导
    try {
      // Entity
      if ((target as Entity).position || (target as Entity).computeModelMatrix) {
        const ent = target as Entity;
        const pos = ent.position?.getValue(time);
        let ori = ent.orientation?.getValue(time) as Quaternion | undefined;
        if (!ori && typeof ent.computeModelMatrix === "function") {
          const mx = ent.computeModelMatrix(time);
          if (mx) {
            const rot = Matrix4.getRotation(mx, new Matrix3());
            ori = Quaternion.fromRotationMatrix(rot);
          }
        }
        return { position: pos, orientation: ori };
      }

      // Model
      if ((target as Model).modelMatrix) {
        const mdl = target as Model;
        const mx = mdl.modelMatrix;
        const pos = Matrix4.getTranslation(mx, new Cartesian3());
        const rot = Matrix4.getRotation(mx, new Matrix3());
        const ori = Quaternion.fromRotationMatrix(rot);
        return { position: pos, orientation: ori };
      }

      // Primitive（有 modelMatrix 的）
      if ((target as any).modelMatrix) {
        const pm = target as any as Primitive & { modelMatrix: Matrix4 };
        const mx = pm.modelMatrix;
        const pos = Matrix4.getTranslation(mx, new Cartesian3());
        const rot = Matrix4.getRotation(mx, new Matrix3());
        const ori = Quaternion.fromRotationMatrix(rot);
        return { position: pos, orientation: ori };
      }
    } catch {}
    return {};
  }

  /** 应用锚点平移（局部→世界） */
  #applyAnchorTranslation(
    basePos: Cartesian3 | undefined,
    baseOri: Quaternion | undefined,
    anchor?: FxAnchor
  ): Cartesian3 | undefined {
    if (!basePos || !anchor?.translation) return basePos;
    const rot = baseOri ? Matrix3.fromQuaternion(baseOri) : Matrix3.IDENTITY;
    const local = anchor.translation;
    const worldOffset = Matrix3.multiplyByVector(rot, local, new Cartesian3());
    return Cartesian3.add(basePos, worldOffset, new Cartesian3());
  }

  /** 应用锚点旋转（局部） */
  #applyAnchorRotation(
    baseOri: Quaternion | undefined,
    anchor?: FxAnchor
  ): Quaternion | undefined {
    if (!baseOri) return baseOri;
    if (!anchor?.rotation) return baseOri;
    const anchorQ =
      anchor.rotation instanceof Quaternion
        ? anchor.rotation
        : Quaternion.fromHeadingPitchRoll(anchor.rotation);
    const q = Quaternion.clone(baseOri);
    return Quaternion.multiply(q, anchorQ, new Quaternion());
  }

  /** 应用扫角动画（局部） */
  #applySweep(
    baseOri: Quaternion | undefined,
    record: FxBindingRecord,
    dt?: number
  ): Quaternion | undefined {
    if (!baseOri || !dt) return baseOri;
    const sweep = record.options.sweep;
    if (!sweep || !sweep.axis || !sweep.speed) return baseOri;

    const hasBounds =
      typeof sweep.min === "number" &&
      typeof sweep.max === "number" &&
      sweep.min < sweep.max;

    let angle = record.sweepAngle ?? 0;
    let dir = record.sweepDir ?? 1;

    if (hasBounds) {
      angle += (sweep.speed ?? 0) * dt * dir;
      if (angle > (sweep.max as number)) {
        angle = sweep.max as number;
        dir = -1;
      } else if (angle < (sweep.min as number)) {
        angle = sweep.min as number;
        dir = 1;
      }
    } else {
      // 无范围：持续累积旋转
      angle += (sweep.speed ?? 0) * dt;
    }

    record.sweepAngle = angle;
    record.sweepDir = dir;

    let rot: Matrix3;
    switch (sweep.axis) {
      case "x":
        rot = Matrix3.fromRotationX(angle);
        break;
      case "y":
        rot = Matrix3.fromRotationY(angle);
        break;
      case "z":
      default:
        rot = Matrix3.fromRotationZ(angle);
        break;
    }
    const sweepQ = Quaternion.fromRotationMatrix(rot);
    return Quaternion.multiply(baseOri, sweepQ, new Quaternion());
  }

  // ----- FX 集合管理（替代旧 SpecialEffectManager API） -----
  add(specialEffect: AbstractFx) {
    let result = false;
    if (this.isExists(specialEffect.id)) return result;

    this.#fxArr.push(specialEffect);
    this.#layerManager.add(
      specialEffect.id,
      specialEffect.getPrimitives(),
      specialEffect.show
    );
    result = true;

    return result;
  }

  isExists(id: string) {
    return this.#fxArr.findIndex((item) => item.id === id) >= 0;
  }

  getById(id: string): AbstractFx | undefined {
    const res = this.#fxArr.find((item) => item.id === id);
    return res;
  }

  removeById(id: string) {
    let result = false;
    if (this.isExists(id)) {
      const index = this.#fxArr.findIndex((item) => item.id == id);
      this.#layerManager.removeById(id, true);
      this.#fxArr.splice(index, 1);
      result = true;
    }
    return result;
  }

  clearAll() {
    this.#fxArr.forEach((fx) => {
      this.#layerManager.removeById(fx.id, true);
      try { fx.onDetach(); } catch {}
    });
    this.#fxArr.splice(0, this.#fxArr.length);
  }

  /** 工厂：创建并注册 FX（不绑定目标） */
  create(type: any, options: any): AbstractFx | undefined {
    try {
      const fx: AbstractFx = new type(options);
      if (!this.add(fx)) return undefined;
      return fx;
    } catch {
      return undefined;
    }
  }

  /** 工厂：创建并绑定到目标 */
  createAndAttach(
    type: any,
    options: any,
    target: Entity | Model | Primitive,
    bindingOptions: FxBindingOptions = {}
  ): AbstractFx | undefined {
    const fx = this.create(type, options);
    if (!fx) return undefined;
    const ok = this.attach(fx.id, target, bindingOptions);
    return ok ? fx : undefined;
  }

  // ----- 批量能力 -----
  /** 批量创建 FX（不绑定目标），返回成功创建的列表 */
  createMany(
    items: Array<{ type: any; options: any }>
  ): Array<AbstractFx> {
    const created: Array<AbstractFx> = [];
    for (const it of items) {
      const fx = this.create(it.type, it.options);
      if (fx) created.push(fx);
    }
    return created;
  }

  /** 批量绑定：按输入列表绑定现有 FX 到目标，返回成功计数 */
  attachMany(
    items: Array<{
      fxId: string;
      target: Entity | Model | Primitive;
      options?: FxBindingOptions;
    }>
  ): number {
    let count = 0;
    for (const it of items) {
      if (this.attach(it.fxId, it.target, it.options ?? {})) count++;
    }
    return count;
  }

  /** 批量创建并绑定，返回成功创建且绑定的 FX 列表 */
  createAndAttachMany(
    items: Array<{
      type: any;
      options: any;
      target: Entity | Model | Primitive;
      bindingOptions?: FxBindingOptions;
    }>
  ): Array<AbstractFx> {
    const result: Array<AbstractFx> = [];
    for (const it of items) {
      const fx = this.createAndAttach(
        it.type,
        it.options,
        it.target,
        it.bindingOptions ?? {}
      );
      if (fx) result.push(fx);
    }
    return result;
  }

  // ----- 暂停 / 恢复能力 -----
  /** 暂停所有绑定的位姿更新 */
  pauseAllBindings(): void {
    this.#pausedAll = true;
  }

  /** 恢复所有绑定的位姿更新 */
  resumeAllBindings(): void {
    this.#pausedAll = false;
  }

  /** 暂停指定 FX 的绑定更新 */
  pauseBinding(fxId: string): boolean {
    const rec = this.#bindings.get(fxId);
    if (!rec) return false;
    rec.paused = true;
    return true;
  }

  /** 恢复指定 FX 的绑定更新 */
  resumeBinding(fxId: string): boolean {
    const rec = this.#bindings.get(fxId);
    if (!rec) return false;
    rec.paused = false;
    return true;
  }
}