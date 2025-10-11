/*
Next.js React 组件使用 XH-GIS 示例
支持零配置方案，无需手动调用 setResourceConfig

安装依赖：
npm install react @types/react @xh-gis/engine

使用方法：
1. 配置 next.config.mjs（参考 nextjs-webpack-config.mjs）
2. 直接使用组件，XH-GIS 会自动检测 XH_GIS_BASE_URL

import React, { useEffect, useRef, useState } from 'react';
import { AbstractCore } from '@xh-gis/engine';

interface XHGISMapProps {
  className?: string;
  style?: React.CSSProperties;
}

const XHGISMap: React.FC<XHGISMapProps> = ({ className, style }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<AbstractCore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 无需手动配置 setResourceConfig
        // XH-GIS 会自动检测 webpack 配置中的 XH_GIS_BASE_URL
        
        // 创建 XH-GIS 核心实例
        const core = new AbstractCore(mapRef.current, {
          // 地图配置选项
          homeButton: false,
          sceneModePicker: false,
          baseLayerPicker: false,
          geocoder: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          vrButton: false,
          infoBox: false,
          selectionIndicator: false,
        });

        coreRef.current = core;
        
        // 等待地图初始化完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoading(false);
      } catch (err) {
        console.error('XH-GIS 初始化失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
        setIsLoading(false);
      }
    };

    initializeMap();

    // 清理函数
    return () => {
      if (coreRef.current) {
        coreRef.current.destroy();
        coreRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className={className} style={style}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: 'red',
          fontSize: '14px'
        }}>
          地图加载失败: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1000,
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            正在加载地图...
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
        }}
      />
    </div>
  );
};

export default XHGISMap;

// 使用示例：
// import XHGISMap from './components/XHGISMap';
// 
// function App() {
//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <XHGISMap />
//     </div>
//   );
// }
*/