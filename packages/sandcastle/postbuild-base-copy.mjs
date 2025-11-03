/*
 * 将构建产物中的资源复制到 BASE 子路径目录，例如 dist/xh-gis/
 */
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

  // 复制 favicon（如果存在）到 BASE/
  const srcFavicon = join(distRoot, 'vite.svg');
  if (existsSync(srcFavicon)) {
    copyFileSync(srcFavicon, join(targetRoot, 'vite.svg'));
  }

  console.log(`✅ 构建后资源已复制到子路径: ${base}`);
}

main();