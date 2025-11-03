/*
 * @Descripttion: 根包构建后压缩脚本
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-08-25
 */
import { minify } from 'terser';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

// 递归压缩目录中的所有 JS 文件
async function compressDirectory(dir) {
  if (!existsSync(dir)) {
    console.log(`目录不存在: ${dir}`);
    return;
  }
  
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
    
    const result = await minify(code, {
      ecma: 2020,
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
      },
      format: {
        comments: false,
        beautify: false,
      },
      mangle: {
        toplevel: true, // 尽量混淆顶层
        reserved: ['version'], // 保留版本导出
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

// 开始压缩
console.log('开始压缩根包的 JavaScript 文件...');
compressDirectory('./dist')
  .then(() => {
    console.log('✅ 根包压缩完成！');
  })
  .catch((error) => {
    console.error('❌ 压缩过程中出现错误:', error);
    process.exit(1);
  });