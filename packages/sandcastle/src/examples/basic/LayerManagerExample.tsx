import React, { useCallback, useRef, useState } from 'react';
import { Earth, ToolBar } from '@xh-gis/widgets';
import { AbstractCore, CoreType, XgEarth, GraphicType, LayerType } from '@xh-gis/engine';
import styles from './LayerManagerExample.module.css';

const LayerManagerExample: React.FC = () => {
  const [earth, setEarth] = useState<XgEarth | null>(null);
  const [message, setMessage] = useState<string>('');
  const coreRef = useRef<AbstractCore<CoreType> | null>(null);

  const handleInit = useCallback((instance: XgEarth) => {
    setEarth(instance);
    coreRef.current = instance as AbstractCore<CoreType>;
    try {
      const { Cartesian3 } = (window as any).Cesium || {};
      if (Cartesian3) {
        instance.viewer.scene.camera.setView({
          destination: Cartesian3.fromDegrees(116.4074, 39.9042, 8000000)
        });
      }
    } catch {}
  }, []);

  const addBasemapCombo = useCallback(async () => {
    if (!earth) return;
    await earth.layerManager.addBasemapLayers([
      { name: 'tdt_img', type: 'tdt', layer: 'img', show: true },
      { name: 'tdt_label', type: 'tdt', layer: 'cia', show: true },
    ]);
    setMessage('已添加天地图影像与注记');
  }, [earth]);

  const addPublicTdt = useCallback(async () => {
    if (!earth) return;
    await earth.layerManager.addPublicLayer({ imageLayer: 'TDT_IMG', labelLayer: true });
    setMessage('已通过便捷入口添加底图与注记');
  }, [earth]);

  const addGraphicsLayer = useCallback(async () => {
    if (!earth) return;
    await earth.layerManager.addLayersFromConfig([
      {
        id: 'graphics-demo',
        name: '标绘图层',
        type: 'graphic',
        show: true,
        data: [
          // 更显眼的点 + 标签（北京）
          { type: GraphicType.POINT, position: [116.4074, 39.9042], style: { pixelSize: 20, color: '#ff0000', outline: true, outlineColor: '#ffffff', outlineWidth: 3 } },
          { type: GraphicType.LABEL, position: [116.4074, 39.9042], style: { text: '北京', fontSize: 36, fontFamily: 'system-ui', color: '#ffffff', showBackground: true, backgroundColor: '#00000088' } },

          // 明显的折线（北京-天津）
          { type: GraphicType.POLYLINE, positions: [[116.4074, 39.9042], [117.2000, 39.1333]], style: { width: 6, color: '#00ffff', outline: true, outlineColor: '#001b2e', outlineWidth: 2 } },
          { type: GraphicType.LABEL, position: [116.8, 39.6], style: { text: '北京 → 天津', fontSize: 30, fontFamily: 'system-ui', color: '#00ffff' } },

          // 明显的多边形（北京环形区域近似）
          { type: GraphicType.POLYGON, positions: [[116.2, 40.0], [116.6, 40.0], [116.6, 39.8], [116.2, 39.8]], style: { fill: true, color: '#ff000044', materialType: 'SolidColor' as any, outline: true, outlineColor: '#ff0000', outlineWidth: 3 } },
          { type: GraphicType.LABEL, position: [116.4, 39.9], style: { text: '重点区域', fontSize: 28, fontFamily: 'system-ui', color: '#ff0000', showBackground: true, backgroundColor: '#ffffffaa' } },

          // 椭圆（由最小外接矩形两个顶点控制：左上与右下）
          { type: GraphicType.ELLIPSE, positions: [[117.218465, 31.809438], [120.218465, 26.809438]], style: { fill: true, color: '#00ff00aa', outline: true, outlineColor: '#008800', outlineWidth: 3 } },
          { type: GraphicType.LABEL, position: [118.718465, 29.309438], style: { text: '椭圆示例', fontSize: 26, fontFamily: 'system-ui', color: '#00aa00', showBackground: true, backgroundColor: '#ffffffaa' } },

          // 环形一圈点，便于观察
          { type: GraphicType.POINT, position: [116.30, 39.90], style: { pixelSize: 12, color: '#ff9800' } },
          { type: GraphicType.POINT, position: [116.50, 39.90], style: { pixelSize: 12, color: '#ff9800' } },
          { type: GraphicType.POINT, position: [116.50, 39.80], style: { pixelSize: 12, color: '#ff9800' } },
          { type: GraphicType.POINT, position: [116.30, 39.80], style: { pixelSize: 12, color: '#ff9800' } },
        ]
      }
    ]);
    setMessage('已添加标绘图层');
  }, [earth]);

  const clearImagery = useCallback(() => {
    if (!earth) return;
    const removed = earth.layerManager.removeByType(LayerType.IMAGERY, false);
    setMessage(`已移除影像图层数量：${removed}`);
  }, [earth]);

  const clearGraphics = useCallback(() => {
    if (!earth) return;
    const removed = earth.layerManager.removeByType(LayerType.CUSTOM_DATASOURCE, false);
    setMessage(`已移除图形数据源数量：${removed}`);
  }, [earth]);

  return (
    <div className={styles.example}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>LayerManager 示例</h1>
          <p className={styles.description}>演示添加底图组合与配置图层，并展示便捷入口和清理能力</p>
        </div>

        <div className={styles.content}>
          <div>
            <div className={styles.mapContainer}>
              <Earth onInit={handleInit} />
            </div>
            {earth && (
              <div style={{ marginTop: 12 }}>
                <ToolBar coreRef={coreRef as React.RefObject<AbstractCore<CoreType>>} />
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>操作面板</div>

            <div className={styles.panelSection}>
              <div className={styles.row}>
                <button className={`${styles.button} ${styles.primary}`} onClick={addBasemapCombo}>添加底图组合（addBasemapLayers）</button>
                <button className={styles.button} onClick={addPublicTdt}>便捷入口添加天地图（addPublicLayer）</button>
              </div>
            </div>

            <div className={styles.panelSection}>
              <div className={styles.row}>
                <button className={styles.button} onClick={addGraphicsLayer}>添加标绘图层（addLayersFromConfig）</button>
              </div>
            </div>

            <div className={styles.panelSection}>
              <div className={styles.row}>
                <button className={styles.button} onClick={clearImagery}>清空影像图层</button>
                <button className={styles.button} onClick={clearGraphics}>清空实体图层</button>
              </div>
            </div>

            {message && <div className={styles.status}>{message}</div>}

            <div className={styles.codeBlock}>
              <code>{`// 快速示例：添加底图组合
earth.layerManager.addBasemapLayers([
  { name: 'tdt_img', type: 'tdt', layer: 'img', show: true },
  { name: 'tdt_label', type: 'tdt', layer: 'cia', show: true },
]);

// 通过配置添加标绘图层
earth.layerManager.addLayersFromConfig([{ id: 'graphics-demo', type: 'graphic', show: true, data: [
  { type: GraphicType.POINT, position: [116.4074, 39.9042] },
]}]);`}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerManagerExample;