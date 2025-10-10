import React, { useState, useCallback } from 'react';
import { Earth } from '@xh-gis/widgets';
import { XgEarth, GraphicManager, GraphicType } from '@xh-gis/engine';
import styles from './DrawingExample.module.css';

interface DrawingTool {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const DrawingExample: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('point');
  const [drawnShapes, setDrawnShapes] = useState<Array<{ type: string; id: number }>>([]);
  const [earthInstance, setEarthInstance] = useState<XgEarth | null>(null);
  const [graphicManager, setGraphicManager] = useState<GraphicManager | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const handleEarthInit = useCallback((earth: XgEarth) => {
    console.log('XH-GIS Earth initialized for drawing:', earth);
    setEarthInstance(earth);
    setStatus('ready');
    
    // 使用earth的graphicManager
    if (earth.graphicManager) {
      setGraphicManager(earth.graphicManager as GraphicManager);
      console.log('GraphicManager initialized:', earth.graphicManager);
    }
    
    // 设置初始相机位置
    if (earth && earth.viewer && earth.viewer.scene.camera) {
      try {
        const { Cartesian3 } = (window as any).Cesium || {};
        if (Cartesian3) {
          earth.viewer.scene.camera.setView({
            destination: Cartesian3.fromDegrees(116.4074, 39.9042, 5000000)
          });
        }
      } catch (error) {
        console.warn('设置相机位置失败:', error);
      }
    }
  }, []);

  const tools: DrawingTool[] = [
    { id: 'point', name: '点', icon: '📍', description: '绘制地理标记点' },
    { id: 'line', name: '线', icon: '📏', description: '绘制线条路径' },
    { id: 'polygon', name: '面', icon: '🔷', description: '绘制多边形区域' },
    { id: 'circle', name: '圆', icon: '⭕', description: '绘制圆形区域' },
    { id: 'arrow', name: '箭头', icon: '➡️', description: '绘制方向箭头' },
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const simulateDrawing = useCallback(() => {
    if (!graphicManager || !earthInstance) {
      console.warn('引擎或绘制管理器未初始化');
      return;
    }

    const newShape = {
      type: selectedTool,
      id: Date.now()
    };

    try {
      // 根据选中的工具进行绘制
      switch (selectedTool) {
        case 'point':
          // 使用正确的GraphicManager API绘制点
          graphicManager.setDrawEventHandler(GraphicType.POINT, (position, self) => {
            console.log('点绘制完成:', position);
            setDrawnShapes(prev => [...prev, { type: 'point', id: Date.now() }]);
          });
          break;
        case 'line':
          // 绘制线
          graphicManager.setDrawEventHandler(GraphicType.FREEHAND_LINE, (positions, self) => {
            console.log('线绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'line', id: Date.now() }]);
          });
          break;
        case 'polygon':
          // 绘制多边形
          graphicManager.setDrawEventHandler(GraphicType.POLYGON, (positions, self) => {
            console.log('多边形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'polygon', id: Date.now() }]);
          });
          break;
        case 'circle':
          // 绘制圆形
          graphicManager.setDrawEventHandler(GraphicType.CIRCLE, (positions, self) => {
            console.log('圆形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'circle', id: Date.now() }]);
          });
          break;
        case 'arrow':
          // 绘制箭头
          graphicManager.setDrawEventHandler(GraphicType.STRAIGHT_ARROW, (positions, self) => {
            console.log('箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'arrow', id: Date.now() }]);
          });
          break;
        default:
          console.warn('未知的绘制工具:', selectedTool);
          return;
      }
      
      console.log('开始绘制:', selectedTool);
    } catch (error) {
      console.error('绘制失败:', error);
    }
  }, [selectedTool, graphicManager, earthInstance]);

  const clearAll = useCallback(() => {
    setDrawnShapes([]);
    
    // 清空地图上的所有图形
    if (graphicManager) {
      try {
        graphicManager.removeAll();
        console.log('已清空所有图形');
      } catch (error) {
        console.warn('清空图形失败:', error);
      }
    }
  }, [graphicManager]);

  return (
    <div className={styles.example}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>图形绘制示例</h1>
          <p className={styles.description}>
            演示XH-GIS Engine的图形绘制功能，支持点、线、面等多种几何图形
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <div className={styles.toolsSection}>
              <h3 className={styles.sectionTitle}>🛠️ 绘制工具</h3>
              <div className={styles.tools}>
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={`${styles.tool} ${
                      selectedTool === tool.id ? styles.toolActive : ''
                    }`}
                  >
                    <span className={styles.toolIcon}>{tool.icon}</span>
                    <div className={styles.toolInfo}>
                      <div className={styles.toolName}>{tool.name}</div>
                      <div className={styles.toolDescription}>{tool.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actionsSection}>
              <h3 className={styles.sectionTitle}>⚡ 操作</h3>
              <div className={styles.actions}>
                <button onClick={simulateDrawing} className={styles.drawButton}>
                  开始绘制 ✏️
                </button>
                <button onClick={clearAll} className={styles.clearButton}>
                  清空画布 🗑️
                </button>
              </div>
            </div>

            <div className={styles.shapesSection}>
              <h3 className={styles.sectionTitle}>📝 已绘制图形</h3>
              <div className={styles.shapesList}>
                {drawnShapes.length === 0 ? (
                  <div className={styles.emptyShapes}>
                    暂无绘制图形
                  </div>
                ) : (
                  drawnShapes.map((shape) => {
                    const tool = tools.find(t => t.id === shape.type);
                    return (
                      <div key={shape.id} className={styles.shapeItem}>
                        <span className={styles.shapeIcon}>{tool?.icon}</span>
                        <span className={styles.shapeName}>{tool?.name}</span>
                        <button 
                          onClick={() => setDrawnShapes(prev => 
                            prev.filter(s => s.id !== shape.id)
                          )}
                          className={styles.removeShape}
                        >
                          ❌
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className={styles.mapSection}>
            <div className={styles.mapContainer}>
              {status === 'loading' && (
                <div className={styles.mapPlaceholder}>
                  <div className={styles.mapContent}>
                    <div className={styles.mapIcon}>🗺️</div>
                    <div className={styles.mapText}>
                      正在加载绘制环境...
                    </div>
                  </div>
                </div>
              )}
              
              <Earth onInit={handleEarthInit} />
              
              {status === 'ready' && (
                <div className={styles.mapOverlay}>
                  <div className={styles.toolStatus}>
                    当前工具: {tools.find(t => t.id === selectedTool)?.icon} {tools.find(t => t.id === selectedTool)?.name}
                  </div>
                  <div className={styles.shapeCount}>
                    已绘制: {drawnShapes.length} 个图形
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>📋 功能特性</h3>
            <ul className={styles.featureList}>
              <li>✅ 多种几何图形绘制</li>
              <li>✅ 实时交互式绘制</li>
              <li>✅ 图形编辑和删除</li>
              <li>✅ 属性信息设置</li>
              <li>✅ 导入导出功能</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>📝 代码示例</h3>
            <pre className={styles.codeBlock}>
              <code>{`import { GraphicManager, GraphicType } from '@xh-gis/engine';

// 使用图形管理器
const graphicManager = earth.graphicManager;

// 绘制点
graphicManager.setDrawEventHandler(
  GraphicType.POINT, 
  (position, self) => {
    console.log('点绘制完成:', position);
  }
);

// 绘制多边形
graphicManager.setDrawEventHandler(
  GraphicType.POLYGON,
  (positions, self) => {
    console.log('多边形绘制完成:', positions);
  }
);`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingExample;