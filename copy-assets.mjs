/*
 * @Description: 拷贝 engine 包的静态资源到根包
 * @Author: xh-gis
 * @Date: 2025-01-16
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 递归拷贝目录
 * @param {string} src 源目录
 * @param {string} dest 目标目录
 */
function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.warn(`源目录不存在: ${src}`);
    return;
  }

  // 创建目标目录
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const files = readdirSync(src);
  
  for (const file of files) {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    const stat = statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`已拷贝: ${srcPath} -> ${destPath}`);
    }
  }
}

/**
 * 主函数：拷贝 engine 包的 Assets 到根包
 */
function copyEngineAssets() {
  console.log('🚀 开始拷贝 engine 包的静态资源...');
  
  const engineAssetsPath = join(__dirname, 'packages/engine/dist/Assets');
  const rootAssetsPath = join(__dirname, 'dist/Assets');
  
  try {
    copyDir(engineAssetsPath, rootAssetsPath);
    console.log('✅ 静态资源拷贝完成！');
    console.log(`📁 源目录: ${engineAssetsPath}`);
    console.log(`📁 目标目录: ${rootAssetsPath}`);
  } catch (error) {
    console.error('❌ 拷贝静态资源时出错:', error);
    process.exit(1);
  }
}

// 执行拷贝
copyEngineAssets();