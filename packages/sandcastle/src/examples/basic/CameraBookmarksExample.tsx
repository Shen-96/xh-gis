import React, { useCallback, useMemo, useRef, useState } from 'react';
import { WidgetEarth as Earth } from '@xh-gis/widgets';
import { XgEarth } from '@xh-gis/engine';
import { WidgetCameraBookmarks as CameraBookmarks } from '@xh-gis/widgets';
import styles from './BasicMapExample.module.css';

type Bookmark = {
  id: string;
  name: string;
  lon: number;
  lat: number;
  height: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
};

const CameraBookmarksExample: React.FC = () => {
  const [earth, setEarth] = useState<XgEarth | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const counterRef = useRef<number>(1);

  const defaults: Bookmark[] = useMemo(
    () => [
      {
        id: 'bj',
        name: '北京上空',
        lon: 116.4074,
        lat: 39.9042,
        height: 15000000,
        headingDeg: 0,
        pitchDeg: -35,
        rollDeg: 0,
      },
      {
        id: 'sh',
        name: '上海上空',
        lon: 121.4737,
        lat: 31.2304,
        height: 12000000,
        headingDeg: 20,
        pitchDeg: -35,
        rollDeg: 0,
      },
      {
        id: 'cd',
        name: '成都上空',
        lon: 104.0665,
        lat: 30.5728,
        height: 12000000,
        headingDeg: -20,
        pitchDeg: -35,
        rollDeg: 0,
      },
    ],
    []
  );

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(defaults);

  const handleInit = useCallback((e: XgEarth) => {
    setEarth(e);
    setStatus('ready');
    try {
      const Cesium = (window as any).Cesium || {};
      const { Cartesian3, Math: CesiumMath } = Cesium;
      if (Cartesian3 && CesiumMath) {
        const b = defaults[0];
        e.viewer.scene.camera.setView({
          destination: Cartesian3.fromDegrees(b.lon, b.lat, b.height),
          orientation: {
            heading: CesiumMath.toRadians(b.headingDeg),
            pitch: CesiumMath.toRadians(b.pitchDeg),
            roll: CesiumMath.toRadians(b.rollDeg),
          },
        });
      }
    } catch (err) {
      setMessage('初始化相机失败');
    }
  }, [defaults]);

  const addCurrentBookmark = useCallback(() => {
    if (!earth) return;
    try {
      const Cesium = (window as any).Cesium || {};
      const { Cartographic, Math: CesiumMath } = Cesium;
      const cam = earth.viewer?.scene?.camera;
      if (!cam || !Cartographic || !CesiumMath) return;
      const carto = Cartographic.fromCartesian(cam.position);
      const lon = CesiumMath.toDegrees(carto.longitude);
      const lat = CesiumMath.toDegrees(carto.latitude);
      const height = carto.height;
      const name = `书签${counterRef.current++}`;
      const bm: Bookmark = {
        id: `cur-${Date.now()}`,
        name,
        lon,
        lat,
        height,
        headingDeg: CesiumMath.toDegrees(cam.heading),
        pitchDeg: CesiumMath.toDegrees(cam.pitch),
        rollDeg: CesiumMath.toDegrees(cam.roll),
      };
      setBookmarks((prev) => [bm, ...prev]);
      setMessage(`已保存当前视角为「${name}」`);
    } catch {
      setMessage('保存当前视角失败');
    }
  }, [earth]);

  const applyBookmark = useCallback(
    (bm: Bookmark) => {
      if (!earth) return;
      try {
        const Cesium = (window as any).Cesium || {};
        const { Cartesian3, Math: CesiumMath } = Cesium;
        if (!Cartesian3 || !CesiumMath) return;
        earth.viewer.scene.camera.flyTo({
          destination: Cartesian3.fromDegrees(bm.lon, bm.lat, bm.height),
          orientation: {
            heading: CesiumMath.toRadians(bm.headingDeg),
            pitch: CesiumMath.toRadians(bm.pitchDeg),
            roll: CesiumMath.toRadians(bm.rollDeg),
          },
          duration: 1.5,
        });
        setMessage(`已应用书签「${bm.name}」`);
      } catch {
        setMessage('应用书签失败');
      }
    },
    [earth]
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <div className={styles.example}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>相机书签示例</h1>
          <p className={styles.description}>保存并管理常用视角，快速飞行到预设位置</p>
        </div>

        <div className={styles.content}>
          <div className={styles.mapSection}>
            <div className={styles.mapContainer}>
              {status === 'loading' && (
                <div className={styles.loadingPlaceholder}>
                  <div className={styles.loadingIcon}>🎥</div>
                  <div className={styles.loadingText}>正在加载地球引擎...</div>
                </div>
              )}
              <Earth onInit={handleInit} />
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <CameraBookmarks
                coreRef={{ current: earth } as any}
                onChange={(list: Bookmark[]) => setBookmarks(list)}
              />
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>当前状态</h3>
              <div style={{ color: status === 'ready' ? 'var(--sc-success, #10b981)' : 'var(--sc-muted, #64748b)' }}>
                {status === 'ready' ? '✅ 引擎已就绪' : '⏳ 加载中'}
              </div>
              {message && (
                <div style={{ marginTop: 8, color: '#334155' }}>{message}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraBookmarksExample;
