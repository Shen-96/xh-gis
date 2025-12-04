/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-02 17:50:01
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-02 17:52:01
 */
import type { Cartesian3, Matrix4, PrimitiveCollection, Quaternion } from "cesium";

/**
 * FX 抽象基类：统一对外接口，供 FX 管理器与具体特效实现继承。
 * - 标准化 id/show 与图元集合访问
 * - 标准化位姿更新（位置/姿态）与矩阵重算触发
 * - 可选的材质更新钩子
 */
export default abstract class AbstractFx {
  readonly id: string;
  show: boolean;
  #disposed = false;

  constructor(id: string, show = true) {
    this.id = id;
    this.show = show;
  }

  // 图元集合访问（仅供子类与内部使用）
  protected abstract _getPrimitives(): PrimitiveCollection;

  // 位姿更新（由 FxManager 调用）；具体实现可做幂等防抖
  protected _updatePosition(_position?: Cartesian3): void {}
  protected _updateOrientation(_orientation?: Quaternion): void {}

  // 批量位姿更新：默认依次调用，具体子类可覆盖以抑制重复重算
  setPose(position?: Cartesian3, orientation?: Quaternion): void {
    this.setPosition(position);
    this.setOrientation(orientation);
  }

  // 对外公开的统一接口：供管理器或外部调用
  setPosition(position?: Cartesian3): void {
    this._updatePosition(position);
  }
  setOrientation(orientation?: Quaternion): void {
    this._updateOrientation(orientation);
  }
  getPrimitives(): PrimitiveCollection {
    return this._getPrimitives();
  }

  // 计算模型矩阵（供子类实现）；FxManager/子类在更新后调用重算
  abstract computeModelMatrix(): Matrix4;

  // 通用材质更新钩子（子类可覆盖实现）
  updateMaterial(_material: any): void {}

  // 生命周期钩子（默认空实现）
  onAttach(): void {}
  onDetach(): void {}

  // 显示控制：统一入口，子类可覆盖以同步集合状态
  setVisible(show: boolean): void {
    this.show = show;
  }

  // 资源释放：默认标记为已释放，子类可覆盖做清理
  dispose(): void {
    this.#disposed = true;
  }

  get disposed(): boolean {
    return this.#disposed;
  }
}