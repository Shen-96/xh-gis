import React, { useCallback, useState } from 'react';
import { Earth } from '@xh-gis/widgets';
import { XgEarth } from '@xh-gis/engine';
import styles from './BasicMapExample.module.css';

const BasicMapExample: React.FC = () => {
  const [earthInstance, setEarthInstance] = useState<XgEarth | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const handleEarthInit = useCallback((earth: XgEarth) => {
    console.log('XH-GIS Earth initialized:', earth);
    setEarthInstance(earth);
    setStatus('ready');
    
    // 使用正确的相机API设置初始视角到北京
    if (earth && earth.viewer && earth.viewer.scene.camera) {
      try {
        const { Cartesian3 } = (window as any).Cesium || {};
        if (Cartesian3) {
          earth.viewer.scene.camera.setView({
            destination: Cartesian3.fromDegrees(116.4074, 39.9042, 15000000)
          });
        }
      } catch (error) {
        console.warn('设置相机位置失败:', error);
      }
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (earthInstance && earthInstance.viewer && earthInstance.viewer.scene.camera) {
      try {
        const { Cartesian3, Math: CesiumMath } = (window as any).Cesium || {};
        if (Cartesian3 && CesiumMath) {
          const camera = earthInstance.viewer.scene.camera;
          const currentHeight = camera.positionCartographic.height;
          const newHeight = Math.max(currentHeight * 0.5, 1000);
          
          camera.flyTo({
            destination: Cartesian3.fromDegrees(
              CesiumMath.toDegrees(camera.positionCartographic.longitude),
              CesiumMath.toDegrees(camera.positionCartographic.latitude),
              newHeight
            ),
            duration: 1.0
          });
        }
      } catch (error) {
        console.warn('缩放操作失败:', error);
      }
    }
  }, [earthInstance]);

  const handleZoomOut = useCallback(() => {
    if (earthInstance && earthInstance.viewer && earthInstance.viewer.scene.camera) {
      try {
        const { Cartesian3, Math: CesiumMath } = (window as any).Cesium || {};
        if (Cartesian3 && CesiumMath) {
          const camera = earthInstance.viewer.scene.camera;
          const currentHeight = camera.positionCartographic.height;
          const newHeight = Math.min(currentHeight * 2.0, 50000000);
          
          camera.flyTo({
            destination: Cartesian3.fromDegrees(
              CesiumMath.toDegrees(camera.positionCartographic.longitude),
              CesiumMath.toDegrees(camera.positionCartographic.latitude),
              newHeight
            ),
            duration: 1.0
          });
        }
      } catch (error) {
        console.warn('缩放操作失败:', error);
      }
    }
  }, [earthInstance]);

  const handleResetView = useCallback(() => {
    if (earthInstance && earthInstance.viewer && earthInstance.viewer.scene.camera) {
      try {
        const { Cartesian3 } = (window as any).Cesium || {};
        if (Cartesian3) {
          earthInstance.viewer.scene.camera.flyTo({
            destination: Cartesian3.fromDegrees(116.4074, 39.9042, 15000000),
            duration: 2.0
          });
        }
      } catch (error) {
        console.warn('重置视图失败:', error);
      }
    }
  }, [earthInstance]);

  return (
    <div className={styles.example}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>基础地图示例</h1>
          <p className={styles.description}>
            使用XH-GIS Engine创建一个基本的3D地球，支持缩放、旋转等基础交互操作
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.mapSection}>
            <div className={styles.mapContainer}>
              {status === 'loading' && (
                <div className={styles.loadingPlaceholder}>
                  <div className={styles.loadingIcon}>🌍</div>
                  <div className={styles.loadingText}>正在加载XH-GIS地球引擎...</div>
                </div>
              )}
              
              <Earth onInit={handleEarthInit} />
            </div>
            
            {/* 控制按钮 */}
            {status === 'ready' && (
              <div className={styles.controls}>
                <button onClick={handleZoomIn} className={styles.controlButton}>
                  🔍 放大
                </button>
                <button onClick={handleZoomOut} className={styles.controlButton}>
                  🔍 缩小
                </button>
                <button onClick={handleResetView} className={styles.controlButton}>
                  🏠 重置视图
                </button>
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>📋 功能特性</h3>
              <ul className={styles.featureList}>
                <li>✅ 3D地球渲染</li>
                <li>✅ 鼠标交互控制</li>
                <li>✅ 缩放和旋转</li>
                <li>✅ 地形显示</li>
                <li>✅ 高性能渲染</li>
                <li className={status === 'ready' ? styles.statusReady : styles.statusPending}>
                  {status === 'ready' ? '✅' : '⏳'} 引擎状态: {status === 'ready' ? '已就绪' : '加载中'}
                </li>
              </ul>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>🛠️ 技术栈</h3>
              <div className={styles.techStack}>
                <span className={styles.tech}>XH-GIS Engine</span>
                <span className={styles.tech}>WebGL</span>
                <span className={styles.tech}>TypeScript</span>
                <span className={styles.tech}>React</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>📝 代码示例</h3>
              <pre className={styles.codeBlock}>
                <code>{`import { Earth } from '@xh-gis/widgets';
import { XgEarth } from '@xh-gis/engine';

// 使用Earth组件
<Earth onInit={(earth) => {
  // 通过全局Cesium对象使用API
  const { Cartesian3 } = window.Cesium;
  earth.viewer.scene.camera.setView({
    destination: Cartesian3.fromDegrees(
      116.4074, 39.9042, 15000000
    )
  });
}} />`}</code>
              </pre>
            </div>
            
            {earthInstance && (
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>🎮 实时控制</h3>
                <div className={styles.runtimeControls}>
                  <p className={styles.controlDescription}>
                    引擎版本: {earthInstance.version || 'Unknown'}
                  </p>
                  <div className={styles.buttonGroup}>
                    <button onClick={handleZoomIn} className={styles.actionButton}>
                      放大视图
                    </button>
                    <button onClick={handleZoomOut} className={styles.actionButton}>
                      缩小视图
                    </button>
                    <button onClick={handleResetView} className={styles.actionButton}>
                      重置视图
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicMapExample;