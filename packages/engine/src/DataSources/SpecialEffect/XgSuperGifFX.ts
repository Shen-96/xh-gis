/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-11-02 09:59:43
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-03-25 06:59:02
 */
// @ts-nocheck

import {
  BillboardCollection,
  Cartesian3,
  Matrix4,
  Transforms,
  defined,
} from "cesium";
import {
  HorizontalOriginValueType,
  SpecialEffectOptions,
  VerticalOriginValueType,
  XgSuperGifFxStyleOptions,
} from "../../types";
import { SpecialEffectType } from "../../enum";
import CoordinateUtils from "../../Core/CoordinateUtils";
import GraphicUtils from "../../Core/GraphicUtils";
import AbstractSpecialEffect from "./AbstractSpecialEffect";
// import SuperGif from "libgif";
import { cloneDeep } from "lodash";

export default class XgSuperGifFX extends AbstractSpecialEffect<XgSuperGifFxStyleOptions> {
  #frames: Array<string>;
  #timer?: NodeJS.Timeout;
  readonly ready: Promise<XgSuperGifFX>;

  constructor({
    id,
    name,
    availability,
    show,
    graphics,
  }: SpecialEffectOptions<XgSuperGifFxStyleOptions>) {
    super({
      id,
      name,
      availability,
      show,
      graphics,
      type: SpecialEffectType.SUPERGIF,
    });
    // this.init();
    this.#frames = [];
    this.#timer;
    this.ready = this.init();
  }

  protected _initPosition(): Cartesian3 | undefined {
    return CoordinateUtils.positionOptionsToCar3(this.graphics.position ?? {});
  }

  _updatePosition(val?: Cartesian3): void {
    const prevPos = CoordinateUtils.positionOptionsToCar3(
      this._getGraphics().position ?? {}
    );

    /// 去重
    if (!Cartesian3.equals(prevPos, val)) {
      this._getGraphics().position = val && {
        cartesian: CoordinateUtils.car3ToCartesian3Value(val),
      };

      this._updateModelMatrix();
    }
  }

  protected async init() {
    const { position, image } = this.graphics;

    if (!defined(position))
      throw new Error(
        `create special effect failed , invaild style : ${JSON.stringify(
          this.graphics
        )}`
      );

    /// 先将gif切成序列帧 顺便设置图片的初始大小
    /// 再根据图片高度归一化
    this.#frames = image ? await this.#createFramesFromGIF(image) : [];

    const modelMatrix = this.computeModelMatrix(),
      billboards = new BillboardCollection({
        modelMatrix,
      }),
      style = cloneDeep(this.graphics);

    delete style["width"];
    delete style["height"];

    billboards.add({
      position: Cartesian3.ZERO,
      ...GraphicUtils.createBillboardConstructorOptionsByStyle({
        alignedAxis: {
          unitCartesian: [0, 0, 0],
        },
        ...style,
        image: this.#frames[0],
      }),
    });

    this._getPrimitives().add(billboards);

    this.show && this.play();

    return this;
  }

  play() {
    if (this.#timer) return;

    const { delay, loop, iterations } = this.graphics,
      ms = (delay ?? 2000) / this.#frames.length,
      billboards = this._getPrimitives().get(0);

    if (!billboards) return;

    this.show = true;

    let index = 0,
      iterationNumber = 0;

    this.#timer = setInterval(() => {
      index++;
      index = index > this.#frames.length ? (index = 0) : index;

      /// 循环节点
      index == 0 && loop == false && iterationNumber++;

      const billboard = billboards.get(0);
      billboard.image = this.#frames[index];

      /// 清除计时器
      if (iterationNumber > (iterations ?? 0)) {
        clearInterval(this.#timer);
        this.#timer = undefined;

        this.show = false;
      }
    }, ms);
  }

  /**
   * @descripttion: 渲染帧数组
   * @param {string} url gif地址
   * @param {string} frames 帧数组
   * @param {number} interval 时间周期(毫秒)
   * @return {*}
   * @author: EV-申小虎
   */
  async #createFramesFromGIF(url: string) {
    // 创建图片元素
    const img = document.createElement("img");
    img.src = url;
    // gif库需要img标签配置下面两个属性
    img.setAttribute("rel:animated_src", url);
    img.setAttribute("rel:auto_play", "0");
    document.body.appendChild(img);

    // 新建gif实例
    // const rub = new SuperGif({ gif: img }),
    //   promise = new Promise<Array<string>>((resolve) => {
    //     rub.load(() => {
    //       const frames: Array<{ data: ImageData }> = rub.get_frames();
    //       // const frames = [];
    //       // for (let i = 1; i <= rub.get_length(); i++) {
    //       //     // 遍历gif实例的每一帧
    //       //     rub.move_to(i);
    //       //     const frameCvs = <HTMLCanvasElement>(rub.get_canvas());
    //       //     // frameImg = document.createElement("img");

    //       //     // frameImg.src = frameCvs.toDataURL('image/png');

    //       //     // this.graphics.width = this.graphics.width ?? frameCvs.width;
    //       //     // this.graphics.height = this.graphics.height ?? frameCvs.height;

    //       //     // const ctx = frameCvs.getContext("2d");

    //       //     // ctx?.clearRect(0, 0, this.graphics.width, this.graphics.height);

    //       //     // ctx?.drawImage(frameImg, 0, 0, this.graphics.width, this.graphics.height);

    //       //     frames.push(frameCvs.toDataURL('image/png'));
    //       // }

    //       resolve(
    //         frames.map(({ data }, index) => {
    //           const canvas = document.createElement("canvas"),
    //             context = canvas.getContext("2d");

    //           if (index == 0) {
    //             this._getGraphics().width = this.graphics.width ?? data.width;
    //             this._getGraphics().height =
    //               this.graphics.height ?? data.height;
    //           }

    //           // 设置Canvas的宽度和高度与ImageData相同
    //           canvas.width = this.graphics.width!;
    //           canvas.height = this.graphics.height!;

    //           // 将ImageData绘制到Canvas上
    //           context?.putImageData(
    //             data,
    //             0,
    //             0,
    //             0,
    //             0,
    //             this.graphics.width!,
    //             this.graphics.height!
    //           );

    //           // 将Canvas内容导出为图片
    //           return canvas.toDataURL("image/png");
    //         })
    //       );

    //       // document.body.removeChild(img);
    //     });
    //   });

    return [] as string[];
  }

  computeModelMatrix(): Matrix4 {
    const { position } = this.graphics,
      /// 初始坐标
      originPos = position
        ? CoordinateUtils.positionOptionsToCar3(position)
        : Cartesian3.ZERO;

    if (!originPos) throw `无有效坐标，${this.graphics}`;

    const originModelMx = Transforms.eastNorthUpToFixedFrame(originPos);
    // originRotation = Matrix4.getRotation(originModelMx, new Matrix3()),
    // /// 向局部z轴负向平移
    // zDirection = Cartesian3.UNIT_Z,
    // /// 平移距离
    // distance = (0) / 2,
    // /// 平移向量
    // transVector = Cartesian3.multiplyByScalar(zDirection, distance, new Cartesian3()),
    // /// 旋转到x轴上的矩阵，用于计算平移量
    // localTransRotation = Matrix3.multiply(originRotation, Matrix3.IDENTITY, new Matrix3()),
    // /// 局部平移量
    // local2WorldTranslation = Matrix3.multiplyByVector(localTransRotation, transVector, new Cartesian3()),
    // updateModelMx = Matrix4.multiply(Matrix4.fromTranslation(local2WorldTranslation), originModelMx, new Matrix4());

    return originModelMx;
  }
}
