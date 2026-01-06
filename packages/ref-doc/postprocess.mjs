import { existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { gzipSync, gunzipSync } from "zlib";

const dist = resolve(process.cwd(), "dist");
const assetsSrc = resolve(process.cwd(), "assets");
const assetsDist = resolve(dist, "assets");

function ensureAssets() {
  if (!existsSync(assetsDist)) mkdirSync(assetsDist, { recursive: true });
  ["xh-custom.css", "xh-custom.js"].forEach((f) => {
    const src = join(assetsSrc, f);
    const dst = join(assetsDist, f);
    try {
      copyFileSync(src, dst);
      console.log(`✓ 复制资产: assets/${f}`);
    } catch (e) {
      console.warn(`⚠️ 复制失败: ${f}`, e?.message || e);
    }
  });
}

function processHtmlDir(dir) {
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter((f) => f.endsWith(".html"));
  files.forEach((f) => {
    const full = join(dir, f);
    let html = readFileSync(full, "utf8");
    // Insert custom css/js references if missing
    if (!html.includes("xh-custom.css")) {
      // 计算相对路径：从当前文件到 assets 目录
      // 例如：dist/classes/xxx.html -> ../assets/
      html = html.replace(
        /(<\/head>)/i,
        `<link rel="stylesheet" href="../assets/xh-custom.css"/>\n<script async src="../assets/xh-custom.js"></script>\n$1`
      );
    }
    writeFileSync(full, html, "utf8");
  });
}

/**
 * 修复 navigation.js 中的导航数据
 * TypeDoc 将导航数据压缩并 base64 编码存储在 navigation.js 中
 */
function fixNavigationJs() {
  const navJsPath = resolve(dist, "assets", "navigation.js");
  if (!existsSync(navJsPath)) {
    console.warn("⚠️ navigation.js 不存在，跳过修复");
    return;
  }

  try {
    let navJs = readFileSync(navJsPath, "utf8");
    
    // 提取 base64 数据
    const base64Match = navJs.match(/window\.navigationData\s*=\s*"data:application\/octet-stream;base64,([^"]+)"/);
    if (!base64Match) {
      console.warn("⚠️ 无法找到 navigationData，跳过修复");
      return;
    }

    const base64Data = base64Match[1];
    
    // 解码 base64
    const compressedData = Buffer.from(base64Data, "base64");
    
    // 解压缩（gzip）
    const decompressedData = gunzipSync(compressedData);
    let navDataStr = decompressedData.toString("utf8");
    
    // 替换旧的命名
    // 注意：替换顺序很重要！必须先处理完整的文件名，再处理前缀
    let modified = false;
    const originalStr = navDataStr;
    
    // 1. 先替换完整的文件名（必须在替换前缀之前）
    // 替换 engine_dist.html 为 engine.html
    navDataStr = navDataStr.replace(/engine_dist\.html/g, () => {
      modified = true;
      return "engine.html";
    });
    
    // 替换 widgets_dist.html 为 widgets.html
    navDataStr = navDataStr.replace(/widgets_dist\.html/g, () => {
      modified = true;
      return "widgets.html";
    });
    
    // 2. 然后替换路径中的 engine/dist 和 widgets/dist
    // 替换 engine/dist 为 engine
    navDataStr = navDataStr.replace(/engine\/dist/g, () => {
      modified = true;
      return "engine";
    });
    
    // 替换 widgets/dist 为 widgets
    navDataStr = navDataStr.replace(/widgets\/dist/g, () => {
      modified = true;
      return "widgets";
    });
    
    // 3. 再替换前缀（这样不会影响已经处理过的 .html 文件）
    // 替换 engine_dist. 为 engine-
    navDataStr = navDataStr.replace(/engine_dist\./g, () => {
      modified = true;
      return "engine-";
    });
    
    // 替换 widgets_dist. 为 widgets-
    navDataStr = navDataStr.replace(/widgets_dist\./g, () => {
      modified = true;
      return "widgets-";
    });
    
    // 4. 最后修复错误的命名（如果之前替换产生了 engine-html）
    // 替换 engine-html 为 engine.html
    navDataStr = navDataStr.replace(/engine-html/g, () => {
      modified = true;
      return "engine.html";
    });
    
    // 替换 widgets-html 为 widgets.html
    navDataStr = navDataStr.replace(/widgets-html/g, () => {
      modified = true;
      return "widgets.html";
    });
    
    if (!modified) {
      console.log("ℹ️ navigation.js 中无需修复");
      return;
    }
    
    // 重新压缩
    const newCompressedData = gzipSync(navDataStr, { level: 9 });
    
    // 重新编码为 base64
    const newBase64Data = newCompressedData.toString("base64");
    
    // 替换 navigation.js 中的 base64 数据
    navJs = navJs.replace(
      /window\.navigationData\s*=\s*"data:application\/octet-stream;base64,[^"]+"/,
      `window.navigationData = "data:application/octet-stream;base64,${newBase64Data}"`
    );
    
    // 写回文件
    writeFileSync(navJsPath, navJs, "utf8");
    console.log("✅ navigation.js 导航数据已修复");
  } catch (e) {
    console.error("❌ 修复 navigation.js 失败:", e?.message || e);
  }
}

function run() {
  ensureAssets();
  // 合并后，所有类型目录直接在 dist 下
  ["classes", "interfaces", "enums", "modules", "functions", "types"].forEach((g) => {
    processHtmlDir(resolve(dist, g));
  });
  // 处理其他可能的 HTML 文件（如 index.html, modules.html 等）
  const rootFiles = readdirSync(dist).filter((f) => f.endsWith(".html") && f !== "index.html");
  rootFiles.forEach((f) => {
    const full = join(dist, f);
    let html = readFileSync(full, "utf8");
    if (!html.includes("xh-custom.css")) {
      html = html.replace(
        /(<\/head>)/i,
        `<link rel="stylesheet" href="./assets/xh-custom.css"/>\n<script async src="./assets/xh-custom.js"></script>\n$1`
      );
      writeFileSync(full, html, "utf8");
    }
  });
  console.log("✅ 详情页已注入自定义布局脚本与样式");
  
  // 修复 navigation.js 中的导航数据
  fixNavigationJs();
}

run();
