/*
 * @Descripttion: Widgets 包构建后压缩脚本
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-08-25
 */
import { minify } from 'terser';
import { readFileSync, writeFileSync, readdirSync, statSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, extname, dirname } from 'path';

// 递归复制CSS文件到dist目录
function copyCSSFiles(sourceDir = './src', destDir = './dist') {
  const items = readdirSync(sourceDir);
  
  for (const item of items) {
    const sourcePath = join(sourceDir, item);
    const destPath = join(destDir, item);
    const stat = statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // 递归处理子目录
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true });
      }
      copyCSSFiles(sourcePath, destPath);
    } else if (extname(item) === '.css') {
      // 复制 CSS 文件
      copyFileSync(sourcePath, destPath);
      console.log(`✓ CSS文件复制完成: ${item}`);
    }
  }
}

// 递归压缩目录中的所有 JS 文件
async function compressDirectory(dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 递归处理子目录
      await compressDirectory(fullPath);
    } else if (extname(item) === '.js') {
      // 压缩 JS 文件
      await compressFile(fullPath);
    }
  }
}

// 压缩单个文件
async function compressFile(filePath) {
  try {
    const code = readFileSync(filePath, 'utf8');
    // 针对 Core/index.js 保留 console 输出，避免 drop_console
    const keepConsole = /\/Core\/index\.js$/.test(filePath);
    
    const result = await minify(code, {
      ecma: 2020,
      compress: {
        drop_console: keepConsole ? false : true,
        drop_debugger: true,
        passes: 3,
        pure_funcs: [],
      },
      format: {
        comments: false,
        beautify: false,
      },
      mangle: {
        toplevel: false, // 避免混淆顶层导出名称
        reserved: [
          // React 相关
          'React', 'Component', 'useState', 'useEffect', 'useRef',
          // Cesium 全局
          'Cesium',
          // XH-GIS 导出名称（避免误混淆）
          'WidgetEarth', 'WidgetMap', 'WidgetStatusBar', 'WidgetTimeLine', 'WidgetToolBar', 'WidgetPlottingToolbar', 'WidgetPlottingList',
          'XgEarth', 'XgMap'
        ],
      },
    });
    
    if (result.code) {
      writeFileSync(filePath, result.code);
      console.log(`✓ 压缩完成: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ 压缩失败: ${filePath}`, error.message);
  }
}

// 开始构建流程
console.log('开始构建 Widgets 包...');

// 首先复制所有CSS文件
console.log('开始复制 CSS 文件...');
copyCSSFiles();

// 然后压缩JavaScript文件
console.log('开始压缩 JavaScript 文件...');
compressDirectory('./dist')
  .then(() => {
    console.log('✅ Widgets 包构建完成！');
  })
  .catch((error) => {
    console.error('❌ 构建过程中出现错误:', error);
    process.exit(1);
  });