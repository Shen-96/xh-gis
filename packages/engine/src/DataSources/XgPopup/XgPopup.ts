/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2024-06-13 15:16:12
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:47:14
 */

import { Cartesian2, Cartesian3, Cartographic } from "cesium";
import CoordinateUtils from "../../Core/CoordinateUtils";
import AbstractPopup, { AbstractPopupOptions } from "./AbstractPopup";

export type XgPopupOptions = AbstractPopupOptions;

export class XgPopup extends AbstractPopup {
  private windowMouseMoveHandler?: (e: MouseEvent) => void;
  private windowMouseUpHandler?: (e: MouseEvent) => void;

  constructor(options: XgPopupOptions) {
    super(options);
  }

  protected updateElement(): void {
    const popDiv = document.getElementById(this.guid);
    if (!popDiv) return;

    // 若之前渲染过 React 内容，更新前先卸载
    this.reactRoot?.unmount?.();
    this.reactRoot = undefined;

    /// 标牌内容
    /// 若element的类型为string，则直接赋值给innerHTML
    if (typeof this.element === "string") popDiv.innerHTML = this.element;
    /// 若element的类型为Element，则添加到div中
    else if (this.element instanceof HTMLElement) {
      // 不移除自身节点，直接替换子节点，避免节点抖动
      popDiv.replaceChildren(this.element);
    } else if (this.isReactElement(this.element) || this.isReactElementsArray(this.element)) {
      popDiv.innerHTML = "";
      // 仅在需要时动态导入 react-dom/client，避免将 React 打进核心包
      import("react-dom/client")
        .then((mod) => {
          const root = mod.createRoot(popDiv);
          try {
            root.render(this.element as any);
          } catch (err) {
            console.error("XgPopup React render error:", err);
          }
          this.reactRoot = root;
        })
        .catch(() => {
          // 动态导入失败时，不阻断；可选择输出告警或降级
          console.warn("Failed to import react-dom/client");
        });
    }
  }

  protected render(): void {
    this.xgCore.popupManager.set(this.id, this);
    /// TODO: 实现 XgPopup 的渲染逻辑，若已存在，则报错
    /// 创建div
    const popDiv = document.createElement("div"),
      iconDiv = document.createElement("div"),
      linkDiv = document.createElement("div");

    /// 标牌id
    popDiv.id = this.guid;
    /// 标牌class
    popDiv.className = "xh-gis-popup";

    /// 标牌图标id
    iconDiv.id = this.guid + "_" + "icon";
    /// 标牌图标class
    iconDiv.className = "xh-gis-popup-icon";
    /// 标牌图标内容
    if (this.icon) {
      iconDiv.style.width = this.iconSize[0] + "px";
      iconDiv.style.height = this.iconSize[1] + "px";
      iconDiv.style.backgroundImage = `url(${this.icon})`;
      iconDiv.style.backgroundSize = "contain";
      iconDiv.style.backgroundRepeat = "no-repeat";
      iconDiv.style.backgroundPosition = "center";
    }

    /// 连线id
    linkDiv.id = this.guid + "_" + "link";
    /// 连线class
    linkDiv.className = "xh-gis-popup-link";

    /// 标牌内容
    /// 若element的类型为string，则直接赋值给innerHTML
    if (typeof this.element === "string") popDiv.innerHTML = this.element;
    /// 若element的类型为Element，则添加到div中
    else if (this.element instanceof HTMLElement)
      popDiv.appendChild(this.element);
    else if (this.isReactElement(this.element) || this.isReactElementsArray(this.element)) {
      import("react-dom/client")
        .then((mod) => {
          const root = mod.createRoot(popDiv);
          try {
            root.render(this.element as any);
          } catch (err) {
            console.error("XgPopup React render error:", err);
          }
          this.reactRoot = root;
        })
        .catch(() => {
          console.warn("Failed to import react-dom/client");
        });
    }

    /// 向popupContainer添加元素
    /// 找到popupContainer
    const popupContainer = this.xgCore.container.parentElement?.querySelector(
      ".xh-gis-popup-container"
    );

    /// 若存在popupContainer，则添加元素
    if (popupContainer) {
      popupContainer.appendChild(popDiv);
      popupContainer.appendChild(iconDiv);
      popupContainer.appendChild(linkDiv);
    }

    /// 添加鼠标按下监听事件
    popDiv.addEventListener("mousedown", (e) => {
      this.isMouseDown = true;

      /// 记录鼠标按下时的屏幕坐标
      const { clientX, clientY } = e as MouseEvent;
      this.mouseDownScreenPosition = Cartesian2.fromElements(clientX, clientY);

      popDiv.style.zIndex = "999";
    });

    /// 添加鼠标左键松开监听事件
    popDiv.addEventListener("mouseup", () => {
      this.isMouseDown = false;
      this.mouseDownScreenPosition = Cartesian2.ZERO;
      this.offset = [
        this.offset[0] + this.mouseMoveOffset[0],
        this.offset[1] + this.mouseMoveOffset[1],
      ];
      this.mouseMoveOffset = [0, 0];

      popDiv.style.zIndex = "2";
    });

    /// 添加鼠标移出监听事件
    // popDiv.addEventListener('mouseout', () => {
    //   this.isMouseDown = false;
    //   this.mouseDownScreenPosition = Cartesian2.ZERO;
    //   this.offset = [
    //     this.offset[0] + this.mouseMoveOffset[0],
    //     this.offset[1] + this.mouseMoveOffset[1]
    //   ];
    //   this.mouseMoveOffset = [0, 0];
    //   popDiv.style.zIndex = '2';
    // });

    /// 添加鼠标移动监听事件
    popDiv.addEventListener("mousemove", (e) => {
      if (this.isMouseDown) {
        const { clientX, clientY } = e as MouseEvent;

        this.mouseMoveOffset = [
          /// 计算鼠标在x轴上的偏移量
          clientX - this.mouseDownScreenPosition.x,
          /// 计算鼠标在y轴上的偏移量
          clientY - this.mouseDownScreenPosition.y,
        ];
      }
    });

    this.windowMouseMoveHandler = (e: MouseEvent) => {
      if (this.isMouseDown) {
        const { clientX, clientY } = e;
        this.mouseMoveOffset = [
          clientX - this.mouseDownScreenPosition.x,
          clientY - this.mouseDownScreenPosition.y,
        ];
      }
    };
    window.addEventListener("mousemove", this.windowMouseMoveHandler);

    this.windowMouseUpHandler = () => {
      if (this.isMouseDown) {
        this.isMouseDown = false;
        this.mouseDownScreenPosition = Cartesian2.ZERO;
        this.offset = [
          this.offset[0] + this.mouseMoveOffset[0],
          this.offset[1] + this.mouseMoveOffset[1],
        ];
        this.mouseMoveOffset = [0, 0];

        const popDivEl = document.getElementById(this.guid);
        popDivEl && (popDivEl.style.zIndex = "2");
      }
    };
    window.addEventListener("mouseup", this.windowMouseUpHandler);

    const renderFrame = () => {
      const popDiv = document.getElementById(this.guid),
        iconDiv = document.getElementById(this.guid + "_" + "icon"),
        linkDiv = document.getElementById(this.guid + "_" + "link");

      const isPointOnBackside = CoordinateUtils.isPointOnBackside(
        this.xgCore.scene,
        this.car3Position
      );

      if (!isPointOnBackside && this.show) {
        const popLeftTopPosition = this.calulatePopLeftTopPosition();
        /// 修改元素位置
        if (popDiv && linkDiv) {
          popDiv.style.display = "block";
          linkDiv.style.display = "block";

          const top = popLeftTopPosition?.y ?? -1000,
            left = popLeftTopPosition?.x ?? -1000;

          popDiv.style.top = top + "px";
          popDiv.style.left = left + "px";

          this.drawLine(popDiv);

          /// 超出可视距离隐藏
          const cameraPositionWC = Cartographic.toCartesian(
              this.xgCore.roamManager.camera.positionCartographic
            ),
            distance = Cartesian3.distance(cameraPositionWC, this.car3Position);

          popDiv.style.display =
            distance >= (this.maxRange ?? Number.MAX_SAFE_INTEGER)
              ? "none"
              : "block";

          linkDiv.style.display =
            distance >= (this.maxRange ?? Number.MAX_SAFE_INTEGER)
              ? "none"
              : "block";
        }

        /// 更新图标位置
        const iconLeftTopPosition = this.calulateIconLeftTopPosition();
        if (iconDiv) {
          iconDiv.style.display = "block";

          const top = iconLeftTopPosition?.y ?? -1000,
            left = iconLeftTopPosition?.x ?? -1000;

          iconDiv.style.top = top + "px";
          iconDiv.style.left = left + "px";
        }
      } else {
        /// 地球背面不显示
        if (popDiv && linkDiv && iconDiv) {
          popDiv.style.display = "none";
          linkDiv.style.display = "none";
          iconDiv.style.display = "none";
        }
      }

      this.animationId = requestAnimationFrame(renderFrame);
    };

    this.animationId = requestAnimationFrame(renderFrame);

    // this.xgCore.sceneListenerManager.add(
    //   this.guid,
    //   SceneListenerType.postRender,
    //   () => {
    //     const popLeftTopPosition = this.calulatePopLeftTopPosition();

    //     /// 修改元素位置
    //     if (defined(popLeftTopPosition)) {
    //       const top = popLeftTopPosition.y,
    //         left = popLeftTopPosition.x;

    //       popDiv.style.top = top + "px";
    //       popDiv.style.left = left + "px";

    //       this.drawLine(popDiv);

    //       /// 超出可视距离隐藏
    //       const cameraPositionWC = Cartographic.toCartesian(
    //           this.xgCore.roamManager.camera.positionCartographic
    //         ),
    //         distance = Cartesian3.distance(cameraPositionWC, this.car3Position);

    //       popDiv.style.display =
    //         distance >= (this.maxRange ?? Number.MAX_SAFE_INTEGER)
    //           ? "none"
    //           : "block";

    //       linkDiv.style.display =
    //         distance >= (this.maxRange ?? Number.MAX_SAFE_INTEGER)
    //           ? "none"
    //           : "block";
    //     }

    //     /// 更新图标位置
    //     const iconLeftTopPosition = this.calulateIconLeftTopPosition();
    //     if (defined(iconLeftTopPosition)) {
    //       const top = iconLeftTopPosition.y,
    //         left = iconLeftTopPosition.x;

    //       iconDiv.style.top = top + "px";
    //       iconDiv.style.left = left + "px";
    //     }
    //   }
    // );
  }

  destroy(): void {
    /// TODO: 实现 XgPopup 的销毁逻辑
    /// 先销毁监听事件
    // this.xgCore.sceneListenerManager.removeById(this.guid);
    if (this.animationId !== -1) {
      cancelAnimationFrame(this.animationId);
      this.animationId = -1;
    }

    // 移除 window 事件监听
    if (this.windowMouseMoveHandler) {
      window.removeEventListener("mousemove", this.windowMouseMoveHandler);
      this.windowMouseMoveHandler = undefined;
    }
    if (this.windowMouseUpHandler) {
      window.removeEventListener("mouseup", this.windowMouseUpHandler);
      this.windowMouseUpHandler = undefined;
    }

    // 卸载可能存在的 React 根
    this.reactRoot?.unmount?.();
    this.reactRoot = undefined;

    /// 找到div并移除
    const popDiv = document.getElementById(this.guid);
    popDiv && popDiv.remove();
    /// 找到图标并移除
    const iconDiv = document.getElementById(this.guid + "_" + "icon");
    iconDiv && iconDiv.remove();
    /// 找到连线并移除
    const linkDiv = document.getElementById(this.guid + "_" + "link");
    linkDiv && linkDiv.remove();

    this.xgCore.popupManager.delete(this.id);
  }
}
