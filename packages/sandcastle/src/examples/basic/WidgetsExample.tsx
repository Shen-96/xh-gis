import React, { useState, useCallback, useRef } from 'react';
import { WidgetEarth as Earth, WidgetMap as Map, WidgetTimeLine as TimeLine, WidgetPlottingList as PlottingList, WidgetToolBar as ToolBar } from '@xh-gis/widgets';
import { XgEarth, XgMap, AbstractCore, CoreType } from '@xh-gis/engine';
import styles from './WidgetsExample.module.css';

interface Widget {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

const WidgetsExample: React.FC = () => {
  const [selectedWidget, setSelectedWidget] = useState<string>('earth');
  const [componentInstance, setComponentInstance] = useState<XgEarth | XgMap | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const coreRef = useRef<AbstractCore<CoreType> | null>(null);

  const handleComponentInit = useCallback((instance: XgEarth | XgMap) => {
    console.log('XH-GIS Component initialized:', instance);
    setComponentInstance(instance);
    // 正确设置ref的current属性
    coreRef.current = instance as AbstractCore<CoreType>;
    setStatus('ready');
    
    // 使用正确的相机API设置初始位置
    if (instance && instance.viewer && instance.viewer.scene.camera) {
      try {
        const { Cartesian3 } = (window as any).Cesium || {};
        if (Cartesian3) {
          instance.viewer.scene.camera.setView({
            destination: Cartesian3.fromDegrees(116.4074, 39.9042, 8000000)
          });
        }
      } catch (error) {
        console.warn('设置相机位置失败:', error);
      }
    }
  }, []);

  const widgets: Widget[] = [
    { id: 'earth', name: 'Earth组件', icon: '🌍', description: '3D地球组件', category: 'core' },
    { id: 'map', name: 'Map组件', icon: '🗺️', description: '2D地图组件', category: 'core' },
    { id: 'toolbar', name: '工具栏', icon: '🧰', description: '地图操作工具栏', category: 'navigation' },
    { id: 'timeline', name: '时间轴', icon: '⏰', description: '时间控制组件', category: 'control' },
    { id: 'plottinglist', name: '标绘列表', icon: '📋', description: '标绘图形管理', category: 'control' },
    { id: 'popup', name: '弹窗', icon: '💬', description: '信息展示弹窗', category: 'display' },
    { id: 'legend', name: '图例', icon: '🎨', description: '图层图例显示', category: 'display' },
  ];

  const categories = {
    core: { name: '核心组件', color: '#ef4444' },
    navigation: { name: '导航控件', color: '#3b82f6' },
    control: { name: '控制组件', color: '#10b981' },
    display: { name: '显示组件', color: '#8b5cf6' },
  };

  const groupedWidgets = widgets.reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, Widget[]>);

  const renderWidgetDemo = (widgetId: string) => {
    switch (widgetId) {
      case 'earth':
        return (
          <div className={styles.componentDemo}>
            {status === 'loading' && (
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingIcon}>🌍</div>
                <div className={styles.loadingText}>正在加载Earth组件...</div>
              </div>
            )}
            <Earth onInit={handleComponentInit} />
            {status === 'ready' && componentInstance && (
              <div className={styles.componentInfo}>
                <div className={styles.infoItem}>
                  <strong>组件类型:</strong> Earth (3D地球)
                </div>
                <div className={styles.infoItem}>
                  <strong>引擎版本:</strong> {componentInstance.version || 'Unknown'}
                </div>
                <div className={styles.infoItem}>
                  <strong>状态:</strong> <span className={styles.statusReady}>已就绪</span>
                </div>
              </div>
            )}
            {status === 'ready' && componentInstance && (
              <ToolBar coreRef={coreRef as React.RefObject<AbstractCore<CoreType>>} />
            )}
          </div>
        );
      case 'map':
        return (
          <div className={styles.componentDemo}>
            {status === 'loading' && (
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingIcon}>🗺️</div>
                <div className={styles.loadingText}>正在加载Map组件...</div>
              </div>
            )}
            <Map onInit={handleComponentInit} />
            {status === 'ready' && componentInstance && (
              <div className={styles.componentInfo}>
                <div className={styles.infoItem}>
                  <strong>组件类型:</strong> Map (2D地图)
                </div>
                <div className={styles.infoItem}>
                  <strong>引擎版本:</strong> {componentInstance.version || 'Unknown'}
                </div>
                <div className={styles.infoItem}>
                  <strong>状态:</strong> <span className={styles.statusReady}>已就绪</span>
                </div>
              </div>
            )}
            {status === 'ready' && componentInstance && (
              <ToolBar coreRef={coreRef as React.RefObject<AbstractCore<CoreType>>} />
            )}
          </div>
        );
      case 'timeline':
        return (
          <div className={styles.timelineDemo}>
            <div className={styles.timelineActual}>
              <TimeLine 
                coreRef={coreRef as React.RefObject<AbstractCore<CoreType>>}
                systemTime={true}
                visible={true}
                shouldAnimate={false}
              />
            </div>
            <div className={styles.demoDescription}>
              时间轴组件用于控制时间相关的动画和数据展示。请先加载Earth或Map组件以查看完整功能。
            </div>
          </div>
        );
      case 'plottinglist':
        return (
          <div className={styles.plottingListDemo}>
            <div className={styles.plottingListActual}>
              <PlottingList 
                coreRef={coreRef as React.RefObject<AbstractCore<CoreType>>}
              />
            </div>
            <div className={styles.demoDescription}>
              标绘列表组件用于显示和管理已创建的标绘图形。请先加载Earth或Map组件并创建一些标绘图形以查看列表。
            </div>
          </div>
        );
      case 'toolbar':
        return (
          <div className={styles.toolbarDemo}>
            <div className={styles.toolbarActual}>
              <ToolBar coreRef={coreRef as React.RefObject<AbstractCore<CoreType>>} />
            </div>
            <div className={styles.demoDescription}>
              工具栏组件提供常用的地图操作功能，包括图层管理和图形标绘功能。
            </div>
          </div>
        );
      case 'popup':
        return (
          <div className={styles.popupDemo}>
            <div className={styles.popup}>
              <div className={styles.popupHeader}>
                <h4>位置信息</h4>
                <button className={styles.popupClose}>✕</button>
              </div>
              <div className={styles.popupContent}>
                <p><strong>经度:</strong> 116.4074°</p>
                <p><strong>纬度:</strong> 39.9042°</p>
                <p><strong>高度:</strong> 45.2m</p>
                <p><strong>地址:</strong> 北京市东城区</p>
              </div>
            </div>
            <div className={styles.demoDescription}>
              弹窗组件用于显示地点信息、属性数据等详细内容
            </div>
          </div>
        );
      case 'legend':
        return (
          <div className={styles.legendDemo}>
            <div className={styles.legend}>
              <div className={styles.legendTitle}>图层图例</div>
              <div className={styles.legendItem}>
                <div className={styles.legendSymbol} style={{ background: '#ef4444' }}></div>
                <span>重要区域</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendSymbol} style={{ background: '#10b981' }}></div>
                <span>普通区域</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendSymbol} style={{ background: '#3b82f6' }}></div>
                <span>特殊区域</span>
              </div>
            </div>
            <div className={styles.demoDescription}>
              图例组件用于显示地图图层的样式说明和分类信息
            </div>
          </div>
        );
      default:
        return <div className={styles.emptyDemo}>选择一个组件查看演示</div>;
    }
  };

  return (
    <div className={styles.example}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>UI组件示例</h1>
          <p className={styles.description}>
            展示XH-GIS Widgets包中的各种React组件，包括核心地图组件和辅助UI组件
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>📦 组件列表</h3>
            
            {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => (
              <div key={category} className={styles.category}>
                <h4 
                  className={styles.categoryTitle}
                  style={{ color: categories[category as keyof typeof categories].color }}
                >
                  {categories[category as keyof typeof categories].name}
                </h4>
                <div className={styles.widgetList}>
                  {categoryWidgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => {
                        setSelectedWidget(widget.id);
                        setStatus('loading');
                        setComponentInstance(null);
                      }}
                      className={`${styles.widgetItem} ${
                        selectedWidget === widget.id ? styles.widgetItemActive : ''
                      }`}
                    >
                      <span className={styles.widgetIcon}>{widget.icon}</span>
                      <div className={styles.widgetInfo}>
                        <div className={styles.widgetName}>{widget.name}</div>
                        <div className={styles.widgetDescription}>{widget.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.demoSection}>
            <div className={styles.demoHeader}>
              <h3 className={styles.demoTitle}>
                {widgets.find(w => w.id === selectedWidget)?.icon} {widgets.find(w => w.id === selectedWidget)?.name} 演示
              </h3>
            </div>
            <div className={styles.demoArea}>
              {renderWidgetDemo(selectedWidget)}
            </div>
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>📋 组件特性</h3>
            <ul className={styles.featureList}>
              <li>✅ React + TypeScript</li>
              <li>✅ 模块化设计</li>
              <li>✅ 主题定制</li>
              <li>✅ 响应式布局</li>
              <li>✅ 事件回调</li>
              <li className={status === 'ready' ? styles.statusReady : styles.statusPending}>
                {status === 'ready' ? '✅' : '⏳'} 组件状态: {status === 'ready' ? '已就绪' : '加载中'}
              </li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>📝 使用示例</h3>
            <pre className={styles.codeBlock}>
              <code>{`import { WidgetEarth, WidgetMap, WidgetTimeLine, WidgetPlottingList, WidgetToolBar } from '@xh-gis/widgets';

// 使用 Widget 前缀的 Earth 组件
<WidgetEarth onInit={(earth) => {
  console.log('Earth initialized:', earth);
  const { Cartesian3 } = window.Cesium;
  earth.viewer.scene.camera.setView({
    destination: Cartesian3.fromDegrees(
      116.4074, 39.9042, 10000000
    )
  });
}} />

// 使用 Widget 前缀的 Map 组件  
<WidgetMap onInit={(map) => {
  console.log('Map initialized:', map);
}} />

// 使用 Widget 前缀的 TimeLine 组件
<WidgetTimeLine 
  coreRef={coreRef}
  systemTime={true}
  visible={true}
  shouldAnimate={false}
/>

// 使用 Widget 前缀的 PlottingList 组件
<WidgetPlottingList 
  coreRef={coreRef}
/>

// 使用 Widget 前缀的 ToolBar 组件
<WidgetToolBar 
  coreRef={coreRef}
/>`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetsExample;