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
 * 递归拷贝目录，但跳过根目录中的重复文件
 * @param {string} src 源目录
 * @param {string} dest 目标目录
 * @param {boolean} isRoot 是否为根目录
 */
function copyDir(src, dest, isRoot = false) {
  if (!existsSync(src)) {
    console.warn(`源目录不存在: ${src}`);
    return;
  }

  // 创建目标目录
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const files = readdirSync(src);
  
  // 定义应该跳过的根目录文件（这些文件应该只存在于子目录中）
  const skipInRoot = [
    'point_orange.png', 'point_red.png', 'point_yellow.png', 'purple_box.png', 'red_borders.png',
    'blast.gif', 'circular.jpg', 'fire.png', 'fountain.png', 'smoke.png',
    'skybox_nx.jpg', 'skybox_ny.jpg', 'skybox_nz.jpg', 'skybox_px.jpg', 'skybox_py.jpg', 'skybox_pz.jpg',
    'tycho2t3_80_mx.jpg', 'tycho2t3_80_my.jpg', 'tycho2t3_80_mz.jpg', 'tycho2t3_80_px.jpg', 'tycho2t3_80_py.jpg', 'tycho2t3_80_pz.jpg',
    'wall.png', 'globe_1.png', 'globe_2.png'
  ];
  
  for (const file of files) {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    const stat = statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, false);
    } else {
      // 如果是根目录且文件在跳过列表中，则跳过
      if (isRoot && skipInRoot.includes(file)) {
        console.log(`跳过根目录重复文件: ${file}`);
        continue;
      }
      
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
    copyDir(engineAssetsPath, rootAssetsPath, true);
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