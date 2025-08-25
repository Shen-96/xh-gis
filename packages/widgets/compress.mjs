/*
 * @Descripttion: Widgets 包构建后压缩脚本
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-08-25
 */
import { minify } from 'terser';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

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
    
    const result = await minify(code, {
      compress: {
        drop_console: false, // 保留 console，如需去掉可设为 true
        drop_debugger: true, // 去掉 debugger
        pure_funcs: [], // 可以指定纯函数进行优化
      },
      format: {
        comments: false, // 去掉所有注释
        beautify: false, // 不美化，保持压缩
      },
      mangle: {
        reserved: ['React', 'Component', 'useState', 'useEffect', 'useRef'], // 保留 React 相关变量名不被混淆
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
console.log('开始压缩 Widgets 包的 JavaScript 文件...');
compressDirectory('./dist')
  .then(() => {
    console.log('✅ Widgets 包压缩完成！');
  })
  .catch((error) => {
    console.error('❌ 压缩过程中出现错误:', error);
    process.exit(1);
  });