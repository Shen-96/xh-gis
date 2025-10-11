// 测试新的资源配置系统
import { setResourceConfig, getResourceUrl, getResourceConfig } from './packages/engine/dist/Core/ResourceConfig.js';

console.log('=== 测试资源配置系统 ===\n');

// 1. 测试默认配置
console.log('1. 默认配置测试:');
console.log('默认配置:', getResourceConfig());
console.log('默认 globe.jpg URL:', getResourceUrl('globe.jpg'));
console.log('默认 SkyBox/skybox_px.jpg URL:', getResourceUrl('SkyBox/skybox_px.jpg'));
console.log('');

// 2. 测试开发环境配置（模拟 Next.js 开发环境）
console.log('2. Next.js 开发环境配置测试:');
setResourceConfig({
  isDevelopment: true,
  basePath: '/Assets'
});
console.log('开发环境配置:', getResourceConfig());
console.log('开发环境 globe.jpg URL:', getResourceUrl('globe.jpg'));
console.log('开发环境 SkyBox/skybox_px.jpg URL:', getResourceUrl('SkyBox/skybox_px.jpg'));
console.log('');

// 3. 测试生产环境配置
console.log('3. 生产环境配置测试:');
setResourceConfig({
  isDevelopment: false,
  basePath: './Assets'
});
console.log('生产环境配置:', getResourceConfig());
console.log('生产环境 globe.jpg URL:', getResourceUrl('globe.jpg'));
console.log('生产环境 SkyBox/skybox_px.jpg URL:', getResourceUrl('SkyBox/skybox_px.jpg'));
console.log('');

// 4. 测试自定义路径映射
console.log('4. 自定义路径映射测试:');
setResourceConfig({
  isDevelopment: true,
  basePath: '/static',
  pathMapping: {
    'SkyBox/': 'textures/skybox/',
    'globe.jpg': 'images/earth.jpg'
  }
});
console.log('路径映射配置:', getResourceConfig());
console.log('映射后 globe.jpg URL:', getResourceUrl('globe.jpg'));
console.log('映射后 SkyBox/skybox_px.jpg URL:', getResourceUrl('SkyBox/skybox_px.jpg'));
console.log('');

// 5. 测试自定义 URL 解析器
console.log('5. 自定义 URL 解析器测试:');
setResourceConfig({
  urlResolver: (resourcePath, config) => {
    return `https://cdn.example.com/assets/${resourcePath}`;
  }
});
console.log('自定义解析器配置:', getResourceConfig());
console.log('自定义解析器 globe.jpg URL:', getResourceUrl('globe.jpg'));
console.log('自定义解析器 SkyBox/skybox_px.jpg URL:', getResourceUrl('SkyBox/skybox_px.jpg'));
console.log('');

console.log('=== 测试完成 ===');