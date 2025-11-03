/*
 * 将构建产物中的资源复制到 BASE 子路径目录，例如 dist/xh-gis/
 */
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  ensureDir(dest);
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dest, name);
    const st = statSync(s);
    if (st.isDirectory()) {
      copyDir(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

function main() {
  const base = process.env.BASE || '/';
  const baseDir = base.replace(/^\/+|\/+$/g, '');
  if (!baseDir) {
    console.log('BASE 未设置为子路径，跳过复制。');
    return;
  }

  const distRoot = join(__dirname, 'dist');
  const targetRoot = join(distRoot, baseDir);
  ensureDir(targetRoot);

  // 复制 assets 到 BASE/assets
  const srcAssets = join(distRoot, 'assets');
  const destAssets = join(targetRoot, 'assets');
  copyDir(srcAssets, destAssets);

  // 复制 cesium 到 BASE/cesium
  const srcCesium = join(distRoot, 'cesium');
  const destCesium = join(targetRoot, 'cesium');
  copyDir(srcCesium, destCesium);

  // 确保根目录也存在 cesium 资源，避免 /xh-gis/cesium/* 请求落到根找不到
  const rootCesium = join(distRoot, 'cesium');
  if (!existsSync(rootCesium)) {
    // 使用 Node 模块解析定位 cesium 安装位置，兼容 pnpm 的符号链接结构
    const require = createRequire(import.meta.url);
    let nmCesium = '';
    try {
      const cesiumPkg = require.resolve('cesium/package.json');
      nmCesium = join(dirname(cesiumPkg), 'Build', 'Cesium');
    } catch {}
    if (nmCesium && existsSync(nmCesium)) {
      console.log('⚙️ 未检测到 dist/cesium，尝试从 node_modules/cesium 复制...');
      copyDir(nmCesium, rootCesium);
    } else {
      console.warn('⚠️ 未找到 node_modules/cesium/Build/Cesium，可能导致线上 /cesium/* 404。');
    }
  }

  // 复制 favicon（如果存在）到 BASE/
  const srcFavicon = join(distRoot, 'vite.svg');
  if (existsSync(srcFavicon)) {
    copyFileSync(srcFavicon, join(targetRoot, 'vite.svg'));
  }

  console.log(`✅ 构建后资源已复制到子路径: ${base}`);

  // 创建 .nojekyll 以禁用 Jekyll 处理，确保静态资源（如 Cesium）完整提供
  try {
    copyFileSync(join(__dirname, 'README.md'), join(distRoot, '.nojekyll'));
  } catch {
    // 如果没有 README，用空文件占位
    try { copyFileSync(join(distRoot, '.nojekyll'), join(distRoot, '.nojekyll')); } catch {}
  }
  try {
    copyFileSync(join(__dirname, 'README.md'), join(targetRoot, '.nojekyll'));
  } catch {
    try { copyFileSync(join(targetRoot, '.nojekyll'), join(targetRoot, '.nojekyll')); } catch {}
  }

  // 复制 index.html 为 404.html，方便 GitHub Pages 的 SPA 深链回退
  try {
    copyFileSync(join(distRoot, 'index.html'), join(distRoot, '404.html'));
  } catch (e) {
    console.warn('⚠️ 复制 404.html 失败：', e?.message || e);
  }
}

main();