import React, { useState, useCallback, useMemo } from 'react';
import { WidgetEarth as Earth } from '@xh-gis/widgets';
import { XgEarth, GraphicManager, GraphicType, SymbolType } from '@xh-gis/engine';
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

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
    { id: 'freehand_line', name: '徒手线', icon: '✍️', description: '徒手绘制线段' },
    { id: 'curve', name: '曲线', icon: '〰️', description: '绘制曲线' },
    { id: 'straight_arrow', name: '直箭头', icon: '➡️', description: '绘制直线箭头（线）' },
    { id: 'curved_arrow', name: '曲线箭头', icon: '➰', description: '绘制曲线箭头（线）' },
    { id: 'polygon', name: '多边形', icon: '🔷', description: '绘制多边形区域' },
    { id: 'freehand_polygon', name: '徒手面', icon: '✍️', description: '徒手绘制多边形' },
    { id: 'rectangle', name: '矩形', icon: '▭', description: '绘制矩形' },
    { id: 'fixed_ratio_rectangle', name: '等比矩形', icon: '▭', description: '固定比例矩形' },
    { id: 'circle', name: '圆', icon: '⭕', description: '绘制圆形' },
    { id: 'ellipse', name: '椭圆', icon: '🫧', description: '绘制椭圆' },
    { id: 'sector', name: '扇形', icon: '🧀', description: '绘制扇形' },
    { id: 'lune', name: '弦月', icon: '🌙', description: '绘制弦月形' },
    { id: 'triangle', name: '三角形', icon: '🔺', description: '绘制三角形' },
    { id: 'kidney_shaped', name: '肾形', icon: '🫘', description: '绘制肾形面' },
    { id: 'straight_tail_arrow', name: '直尾箭头', icon: '➡️', description: '绘制直尾箭头（面）' },
    { id: 'straight_tail_right_arrow', name: '直尾右箭头', icon: '➡️', description: '绘制直尾右箭头（面）' },
    { id: 'free_flat_tail_arrow', name: '自定义平尾箭头', icon: '➡️', description: '绘制自定义平尾箭头（面）' },
    { id: 'fixed_flat_tail_arrow', name: '固定平尾箭头', icon: '➡️', description: '绘制固定平尾箭头（面）' },
    { id: 'free_swallow_tail_arrow', name: '自定义燕尾箭头', icon: '🕊️', description: '绘制燕尾箭头（面）' },
    { id: 'fixed_swallow_tail_arrow', name: '固定燕尾箭头', icon: '🕊️', description: '绘制固定燕尾箭头（面）' },
    { id: 'double_arrow', name: '双箭头', icon: '⮕⮕', description: '绘制双箭头（面）' },
    // Symbol 类型
    { id: 'symbol_zy_tj', name: '战役突击方向', icon: '🎯', description: '符号：战役突击方向' },
    { id: 'symbol_zy_ftj', name: '战役反突击方向', icon: '🎯', description: '符号：战役反突击方向' },
    { id: 'symbol_lh_hl_dj', name: '联合火力打击方向', icon: '🎯', description: '符号：联合火力打击方向' },
    { id: 'symbol_jq_lh_hl_dj', name: '精确火力打击方向', icon: '🎯', description: '符号：精确火力打击方向' },
    { id: 'symbol_jg', name: '进攻方向', icon: '🎯', description: '符号：进攻方向' },
    { id: 'symbol_jg_zx', name: '进攻方向（直线/折线）', icon: '🎯', description: '符号：进攻方向（直线/折线）' },
    { id: 'symbol_fcj', name: '反冲击方向', icon: '🎯', description: '符号：反冲击方向' },
    { id: 'symbol_bbs_tp_dd', name: '不标示突破地段的作战行动', icon: '🎯', description: '符号：不标示突破地段的作战行动' },
  ];

  const categories: { id: string; name: string; tools: string[] }[] = [
    { id: 'basic', name: '基础', tools: ['point'] },
    { id: 'lines', name: '线', tools: ['freehand_line', 'curve'] },
    { id: 'line_arrows', name: '箭头（线）', tools: ['straight_arrow', 'curved_arrow'] },
    { id: 'polygons', name: '面', tools: [
      'polygon', 'freehand_polygon', 'rectangle', 'fixed_ratio_rectangle',
      'circle', 'ellipse', 'sector', 'lune', 'triangle', 'kidney_shaped'
    ] },
    { id: 'area_arrows', name: '箭头（面）', tools: [
      'straight_tail_arrow', 'straight_tail_right_arrow',
      'free_flat_tail_arrow', 'fixed_flat_tail_arrow',
      'free_swallow_tail_arrow', 'fixed_swallow_tail_arrow', 'double_arrow'
    ] },
    { id: 'symbols', name: '符号', tools: [
      'symbol_zy_tj', 'symbol_zy_ftj', 'symbol_lh_hl_dj', 'symbol_jq_lh_hl_dj',
      'symbol_jg', 'symbol_jg_zx', 'symbol_fcj', 'symbol_bbs_tp_dd'
    ] },
  ];

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim();
    return categories
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter((id) => {
          const t = tools.find((tt) => tt.id === id);
          if (!t) return false;
          if (!term) return true;
          return t.name.includes(term) || t.description.includes(term);
        }),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [searchTerm]);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  // 抽取参数化的绘制入口，选中工具后直接调用
  const startDrawing = useCallback((toolId: string) => {
    if (!graphicManager || !earthInstance) {
      console.warn('引擎或绘制管理器未初始化');
      return;
    }

    try {
      // 根据传入的工具ID进行绘制
      switch (toolId) {
        case 'point':
          graphicManager.setDrawEventHandler(GraphicType.POINT, (position, self) => {
            console.log('点绘制完成:', position);
            setDrawnShapes(prev => [...prev, { type: 'point', id: Date.now() }]);
          });
          break;
        case 'freehand_line':
          graphicManager.setDrawEventHandler(GraphicType.FREEHAND_LINE, (positions, self) => {
            console.log('徒手线绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'freehand_line', id: Date.now() }]);
          });
          break;
        case 'curve':
          graphicManager.setDrawEventHandler(GraphicType.CURVE, (positions, self) => {
            console.log('曲线绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'curve', id: Date.now() }]);
          });
          break;
        case 'straight_arrow':
          graphicManager.setDrawEventHandler(GraphicType.STRAIGHT_ARROW, (positions, self) => {
            console.log('直箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'straight_arrow', id: Date.now() }]);
          });
          break;
        case 'curved_arrow':
          graphicManager.setDrawEventHandler(GraphicType.CURVE_ARROW, (positions, self) => {
            console.log('曲线箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'curved_arrow', id: Date.now() }]);
          });
          break;
        case 'polygon':
          graphicManager.setDrawEventHandler(GraphicType.POLYGON, (positions, self) => {
            console.log('多边形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'polygon', id: Date.now() }]);
          });
          break;
        case 'freehand_polygon':
          graphicManager.setDrawEventHandler(GraphicType.FREEHAND_POLYGON, (positions, self) => {
            console.log('徒手面绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'freehand_polygon', id: Date.now() }]);
          });
          break;
        case 'rectangle':
          graphicManager.setDrawEventHandler(GraphicType.RECTANGLE, (positions, self) => {
            console.log('矩形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'rectangle', id: Date.now() }]);
          });
          break;
        case 'fixed_ratio_rectangle':
          graphicManager.setDrawEventHandler(GraphicType.FIXED_RATIO_RECTANGLE, (positions, self) => {
            console.log('等比矩形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'fixed_ratio_rectangle', id: Date.now() }]);
          });
          break;
        case 'circle':
          graphicManager.setDrawEventHandler(GraphicType.CIRCLE, (positions, self) => {
            console.log('圆形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'circle', id: Date.now() }]);
          });
          break;
        case 'ellipse':
          graphicManager.setDrawEventHandler(GraphicType.ELLIPSE, (positions, self) => {
            console.log('椭圆绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'ellipse', id: Date.now() }]);
          });
          break;
        case 'sector':
          graphicManager.setDrawEventHandler(GraphicType.SECTOR, (positions, self) => {
            console.log('扇形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'sector', id: Date.now() }]);
          });
          break;
        case 'lune':
          graphicManager.setDrawEventHandler(GraphicType.LUNE, (positions, self) => {
            console.log('弦月绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'lune', id: Date.now() }]);
          });
          break;
        case 'triangle':
          graphicManager.setDrawEventHandler(GraphicType.TRIANGLE, (positions, self) => {
            console.log('三角形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'triangle', id: Date.now() }]);
          });
          break;
        case 'kidney_shaped':
          graphicManager.setDrawEventHandler(GraphicType.KIDNEY_SHAPED, (positions, self) => {
            console.log('肾形绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'kidney_shaped', id: Date.now() }]);
          });
          break;
        case 'straight_tail_arrow':
          graphicManager.setDrawEventHandler(GraphicType.STRAIGHT_TAIL_ARROW, (positions, self) => {
            console.log('直尾箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'straight_tail_arrow', id: Date.now() }]);
          });
          break;
        case 'straight_tail_right_arrow':
          graphicManager.setDrawEventHandler(GraphicType.STRAIGHT_TAIL_RIGHT_ARROW, (positions, self) => {
            console.log('直尾右箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'straight_tail_right_arrow', id: Date.now() }]);
          });
          break;
        case 'free_flat_tail_arrow':
          graphicManager.setDrawEventHandler(GraphicType.FREE_FLAT_TAIL_ARROW, (positions, self) => {
            console.log('自定义平尾箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'free_flat_tail_arrow', id: Date.now() }]);
          });
          break;
        case 'fixed_flat_tail_arrow':
          graphicManager.setDrawEventHandler(GraphicType.FIXED_FLAT_TAIL_ARROW, (positions, self) => {
            console.log('固定平尾箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'fixed_flat_tail_arrow', id: Date.now() }]);
          });
          break;
        case 'free_swallow_tail_arrow':
          graphicManager.setDrawEventHandler(GraphicType.FREE_SWALLOW_TAIL_ARROW, (positions, self) => {
            console.log('自定义燕尾箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'free_swallow_tail_arrow', id: Date.now() }]);
          });
          break;
        case 'fixed_swallow_tail_arrow':
          graphicManager.setDrawEventHandler(GraphicType.FIXED_SWALLOW_TAIL_ARROW, (positions, self) => {
            console.log('固定燕尾箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'fixed_swallow_tail_arrow', id: Date.now() }]);
          });
          break;
        case 'double_arrow':
          graphicManager.setDrawEventHandler(GraphicType.DOUBLE_ARROW, (positions, self) => {
            console.log('双箭头绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'double_arrow', id: Date.now() }]);
          });
          break;
        case 'symbol_zy_tj':
          graphicManager.setDrawEventHandler(SymbolType.战役突击方向, (positions, self) => {
            console.log('符号·战役突击方向绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'symbol_zy_tj', id: Date.now() }]);
          });
          break;
        case 'symbol_zy_ftj':
          graphicManager.setDrawEventHandler(SymbolType.战役反突击方向, (positions, self) => {
            console.log('符号·战役反突击方向绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'symbol_zy_ftj', id: Date.now() }]);
          });
          break;
        case 'symbol_lh_hl_dj':
          graphicManager.setDrawEventHandler(SymbolType.联合火力打击方向, (positions, self) => {
            console.log('符号·联合火力打击方向绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'symbol_lh_hl_dj', id: Date.now() }]);
          });
          break;
        case 'symbol_jq_lh_hl_dj':
          graphicManager.setDrawEventHandler(SymbolType.精确火力打击方向, (positions, self) => {
            console.log('符号·精确火力打击方向绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'symbol_jq_lh_hl_dj', id: Date.now() }]);
          });
          break;
        case 'symbol_jg':
          graphicManager.setDrawEventHandler(SymbolType.进攻方向, (positions, self) => {
            console.log('符号·进攻方向绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'symbol_jg', id: Date.now() }]);
          });
          break;
        case 'symbol_jg_zx':
          // @ts-ignore
          graphicManager.setDrawEventHandler(SymbolType['进攻方向（直线/折线）'], (positions, self) => {
            console.log('符号·进攻方向（直线/折线）绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'symbol_jg_zx', id: Date.now() }]);
          });
          break;
        case 'symbol_fcj':
          graphicManager.setDrawEventHandler(SymbolType.反冲击方向, (positions, self) => {
            console.log('符号·反冲击方向绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'symbol_fcj', id: Date.now() }]);
          });
          break;
        case 'symbol_bbs_tp_dd':
          graphicManager.setDrawEventHandler(SymbolType.不标示突破地段的作战行动, (positions, self) => {
            console.log('符号·不标示突破地段的作战行动绘制完成:', positions);
            setDrawnShapes(prev => [...prev, { type: 'symbol_bbs_tp_dd', id: Date.now() }]);
          });
          break;
        default:
          console.warn('未知的绘制工具:', toolId);
          return;
      }
      console.log('开始绘制:', toolId);
    } catch (error) {
      console.error('绘制失败:', error);
    }
  }, [graphicManager, earthInstance]);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    // 选中即进入绘制
    startDrawing(toolId);
  };

  const simulateDrawing = useCallback(() => {
    // 直接复用参数化入口，避免重复逻辑并保留按钮触发
    startDrawing(selectedTool);
  }, [startDrawing, selectedTool]);

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
            <div className={styles.actionsSection}>
              <h3 className={styles.sectionTitle}>⚡ 操作</h3>
              <div className={styles.actions}>
                <button onClick={simulateDrawing} className={styles.drawButton}>
                  开始绘制 ✏️
                </button>
                <button onClick={clearAll} className={styles.clearButton}>
                  清空画布 🗑️
                </button>
                <button
                  onClick={() => {
                    if (!graphicManager) return;
                    const data = graphicManager.serializeAll();
                    const text = JSON.stringify(data, null, 2);
                    console.log('导出标绘:', text);
                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard.writeText(text).then(() => {
                        console.log('已复制到剪贴板');
                      }).catch(() => {});
                    }
                  }}
                  className={styles.exportButton}
                >
                  导出标绘 📤
                </button>
              </div>
            </div>

            <div className={styles.toolsSection}>
              <h3 className={styles.sectionTitle}>🛠️ 绘制工具</h3>
              <div className={styles.searchBar}>
                <input
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索工具名称或说明..."
                />
              </div>
              <div className={styles.tools}>
                {filteredCategories.map((cat) => (
                  <div key={cat.id} className={styles.category}>
                    <button
                      className={styles.categoryHeader}
                      onClick={() => toggleCategory(cat.id)}
                      title={cat.name}
                    >
                      <span className={styles.categoryTitle}>{cat.name}</span>
                      <span className={styles.categoryCount}>{cat.tools.length}</span>
                      <span className={styles.categoryToggle}>
                        {openCategories[cat.id] !== false ? '▾' : '▸'}
                      </span>
                    </button>
                    {openCategories[cat.id] !== false && (
                      <div className={styles.categoryTools}>
                        {cat.tools.map((id) => {
                          const tool = tools.find((t) => t.id === id);
                          if (!tool) return null;
                          return (
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
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
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