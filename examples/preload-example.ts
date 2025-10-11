/**
 * XH-GIS 资源预加载示例
 * 提升应用启动性能
 */

/*
import { AbstractCore, resourceManager, resourcePreloader } from '@xh-gis/engine';

// 示例1: 使用 ResourceManager 预加载
async function initializeMapWithPreload() {
  const container = document.getElementById('map-container');
  if (!container) return;

  try {
    // 显示加载进度
    const progressElement = document.getElementById('loading-progress');
    
    // 开始预加载关键资源
    console.log('开始预加载 XH-GIS 资源...');
    
    // 监听预加载进度
    const checkProgress = () => {
      const progress = resourceManager.getPreloadProgress();
      const percentage = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
      
      if (progressElement) {
        progressElement.textContent = `加载进度: ${Math.round(percentage)}% (${progress.loaded}/${progress.total})`;
      }
      
      console.log(`预加载进度: ${progress.loaded}/${progress.total} (${Math.round(percentage)}%)`);
    };

    // 定期检查进度
    const progressInterval = setInterval(checkProgress, 100);
    
    // 执行预加载
    await resourceManager.preloadResources();
    
    clearInterval(progressInterval);
    checkProgress(); // 最后一次更新进度
    
    console.log('资源预加载完成！');
    
    // 隐藏加载界面
    if (progressElement) {
      progressElement.style.display = 'none';
    }
    
    // 初始化地图（此时关键资源已预加载）
    const core = new AbstractCore(container, {
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      geocoder: false,
      animation: false,
      timeline: false,
    });
    
    console.log('地图初始化完成！');
    
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
}

// 示例2: 直接使用 ResourcePreloader
async function customPreloadExample() {
  try {
    // 获取当前配置的资源基础路径
    const config = resourceManager.getConfig();
    const basePath = config.basePath || '/xh-gis/Assets';
    
    console.log('使用自定义预加载器...');
    
    // 预加载关键资源
    await resourcePreloader.preloadCriticalResources(basePath);
    
    // 检查特定资源是否已预加载
    const isGlobePreloaded = resourcePreloader.isPreloaded(`${basePath}/globe.jpg`);
    console.log('地球纹理是否已预加载:', isGlobePreloaded);
    
    // 获取预加载进度
    const progress = resourcePreloader.getPreloadProgress();
    console.log('预加载完成:', progress);
    
  } catch (error) {
    console.error('预加载失败:', error);
  }
}

// 示例3: React 组件中的使用
function MapComponentWithPreload() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        // 开始预加载
        const progressInterval = setInterval(() => {
          const progress = resourceManager.getPreloadProgress();
          setLoadingProgress(progress);
        }, 100);

        // 执行预加载
        await resourceManager.preloadResources();
        
        clearInterval(progressInterval);
        
        // 初始化地图
        const core = new AbstractCore(mapRef.current, {
          // 配置选项...
        });
        
        setIsLoading(false);
        
      } catch (error) {
        console.error('地图初始化失败:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  if (isLoading) {
    const percentage = loadingProgress.total > 0 
      ? (loadingProgress.loaded / loadingProgress.total) * 100 
      : 0;
      
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%' 
      }}>
        <div>
          <div>正在加载地图资源...</div>
          <div>进度: {Math.round(percentage)}% ({loadingProgress.loaded}/{loadingProgress.total})</div>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

// 使用方法：
// 1. 在应用启动时调用 initializeMapWithPreload()
// 2. 或者在 React 组件中使用 MapComponentWithPreload
// 3. 或者使用自定义预加载逻辑 customPreloadExample()
*/

/**
 * 预加载功能说明：
 * 
 * 1. 自动预加载：
 *    - resourceManager.preloadResources() 会自动预加载关键资源
 *    - 包括地球纹理和天空盒纹理等启动必需的资源
 * 
 * 2. 进度监控：
 *    - resourceManager.getPreloadProgress() 获取预加载进度
 *    - 可以实现加载进度条和用户反馈
 * 
 * 3. 资源检查：
 *    - resourceManager.isResourcePreloaded() 检查特定资源是否已预加载
 *    - 可以用于条件加载和性能优化
 * 
 * 4. 性能优势：
 *    - 减少地图初始化时的资源加载时间
 *    - 提供更流畅的用户体验
 *    - 支持加载进度显示
 */