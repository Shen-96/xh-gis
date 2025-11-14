import React, { useCallback, useEffect, useRef, useState } from "react";
import { WidgetEarth as Earth } from "@xh-gis/widgets";
import { XgEarth } from "@xh-gis/engine";
import { XgPopup } from "@xh-gis/engine";
import styles from "./XgPopupExample.module.css";

const XgPopupExample: React.FC = () => {
  const earthRef = useRef<XgEarth | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string | null>(null);

  const onInit = useCallback((earth: XgEarth) => {
    earthRef.current = earth;
    setStatus("ready");
  }, []);

  useEffect(() => {
    // 如果页面加载后已有地球实例，可在就绪后自动添加一个演示弹窗
    if (status === "ready" && earthRef.current) {
      try {
        // 放置到北京附近
        new XgPopup({
          xgCore: earthRef.current,
          position: [116.4074, 39.9042, 0],
          element: '<div style="padding:6px 10px">Hello Popup</div>',
          icon: import.meta.env.BASE_URL + "icons/pin.png",
          iconSize: [16, 16],
          maxRange: 20000000,
          offset: [0, 0],
        });
        setMessage("已创建一个字符串内容的弹窗示例");
      } catch (e) {
        console.warn("初始化默认弹窗失败:", e);
      }
    }
  }, [status]);

  const addHtmlPopup = useCallback(() => {
    if (!earthRef.current) return;
    new XgPopup({
      xgCore: earthRef.current,
      position: [121.4737, 31.2304, 0], // 上海
      element: '<div style="padding:8px; font-weight:600">HTML 内容弹窗</div>',
      icon: import.meta.env.BASE_URL + "icons/pin.png",
      iconSize: [18, 18],
      offset: [12, -20],
      maxRange: 20000000,
    });
    setMessage("添加了一个字符串/HTML 内容的弹窗");
  }, []);

  const addDomPopup = useCallback(() => {
    if (!earthRef.current) return;
    const el = document.createElement("div");
    el.style.padding = "8px";
    el.style.background = "rgba(55,55,55,0.9)";
    el.style.border = "1px solid #e5e5e5";
    el.style.borderRadius = "6px";
    el.textContent = "这是一个原生 DOM 元素内容";

    new XgPopup({
      xgCore: earthRef.current,
      position: [114.3055, 30.5928, 0], // 武汉
      element: el,
      icon: import.meta.env.BASE_URL + "icons/pin.png",
      iconSize: [18, 18],
      offset: [8, -16],
      maxRange: 20000000,
    });
    setMessage("添加了一个原生 HTMLElement 内容的弹窗");
  }, []);

  const addReactPopup = useCallback(() => {
    if (!earthRef.current) return;
    const node = (
      <div style={{ padding: 8 }}>
        <div style={{ fontWeight: 600 }}>React 元素内容</div>
        <div style={{ opacity: 0.8 }}>支持 React 18 动态渲染</div>
      </div>
    );

    new XgPopup({
      id: "react-popup",
      xgCore: earthRef.current,
      position: [113.2644, 23.1291, 0], // 广州
      element: node,
      //  icon: import.meta.env.BASE_URL + "icons/pin.png",
      //  iconSize: [18, 18],
      //  offset: [10, -18],
      //  maxRange: 20000000,
    });
    setMessage("添加了一个 ReactElement 内容的弹窗");
  }, []);

  const addReactArrayPopup = useCallback(() => {
    if (!earthRef.current) return;
    const nodes = [
      <span key="a" style={{ marginRight: 6 }}>
        A
      </span>,
      <span key="b">B</span>,
    ];
    new XgPopup({
      xgCore: earthRef.current,
      position: [104.0665, 30.5728, 0], // 成都
      element: nodes as any,
      icon: import.meta.env.BASE_URL + "icons/pin.png",
      iconSize: [18, 18],
      offset: [10, -18],
      maxRange: 20000000,
    });
    setMessage("添加了一个 ReactElement[] 内容的弹窗");
  }, []);

  return (
    <div className={styles.example}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>XgPopup 弹窗示例</h1>
          <p className={styles.description}>
            演示 XgPopup 在沙盒中的使用，覆盖字符串、原生 DOM、ReactElement
            以及数组四种形态。
          </p>
        </div>

        <div className={styles.contentSingle}>
          <div className={styles.mapSection}>
            <div className={styles.mapContainer}>
              <Earth onInit={onInit} />
            </div>
            <div className={styles.controls} style={{ marginTop: 10 }}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={addHtmlPopup}
              >
                添加字符串/HTML 弹窗
              </button>
              <button className={styles.button} onClick={addDomPopup}>
                添加原生 DOM 弹窗
              </button>
              <button className={styles.button} onClick={addReactPopup}>
                添加 React 元素弹窗
              </button>
              <button className={styles.button} onClick={addReactArrayPopup}>
                添加 React 元素数组弹窗
              </button>
            </div>
            {message && (
              <div className={styles.codeBlock}>
                <code>{message}</code>
              </div>
            )}
            <div className={styles.codeBlock}>
              <code>{`// 关键 DOM 结构由 Widgets 自动渲染：
// <div class="xh-gis-viewer">
//   <div class="xh-gis-viewer-scene"></div>
//   <div class="xh-gis-popup-container"></div>
// </div>

// 基本用法：
new XgPopup({
  xgCore: earth,
  position: [116.4074, 39.9042, 0],
  element: '<div style="padding:8px">Hello Popup</div>',
});`}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XgPopupExample;
