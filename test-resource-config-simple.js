// 直接测试ResourceConfig模块
const fs = require('fs');
const path = require('path');

// 读取编译后的ResourceConfig文件
const resourceConfigPath = path.join(__dirname, 'packages/engine/dist/Core/ResourceConfig.js');

if (fs.existsSync(resourceConfigPath)) {
  console.log('ResourceConfig 文件存在，测试资源配置系统...');
  
  // 模拟浏览器环境
  global.window = {
    location: {
      hostname: 'localhost',
      port: '3000',
      protocol: 'http:'
    }
  };
  
  try {
    const { setResourceConfig, getResourceUrl } = require(resourceConfigPath);
    
    console.log('\n=== 测试默认配置 ===');
    console.log('globe.jpg ->', getResourceUrl('globe.jpg'));
    console.log('SkyBox/skybox_px.jpg ->', getResourceUrl('SkyBox/skybox_px.jpg'));
    
    console.log('\n=== 测试开发环境配置 ===');
    setResourceConfig({ isDevelopment: true });
    console.log('globe.jpg ->', getResourceUrl('globe.jpg'));
    console.log('SkyBox/skybox_px.jpg ->', getResourceUrl('SkyBox/skybox_px.jpg'));
    
    console.log('\n=== 测试生产环境配置 ===');
    setResourceConfig({ isDevelopment: false });
    console.log('globe.jpg ->', getResourceUrl('globe.jpg'));
    console.log('SkyBox/skybox_px.jpg ->', getResourceUrl('SkyBox/skybox_px.jpg'));
    
    console.log('\n=== 测试自定义基础路径 ===');
    setResourceConfig({ basePath: '/static', isDevelopment: true });
    console.log('globe.jpg ->', getResourceUrl('globe.jpg'));
    
    console.log('\n=== 测试路径映射 ===');
    setResourceConfig({ 
      pathMapping: { 
        'globe.jpg': '/custom/globe.jpg' 
      } 
    });
    console.log('globe.jpg ->', getResourceUrl('globe.jpg'));
    console.log('other.jpg ->', getResourceUrl('other.jpg'));
    
    console.log('\n✅ 资源配置系统测试完成！');
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
} else {
  console.log('ResourceConfig 文件不存在，请先构建项目');
}