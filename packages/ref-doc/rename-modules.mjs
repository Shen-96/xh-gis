/*
 * @Descripttion: 重命名 TypeDoc 生成的文件，去掉 engine_dist. 和 widgets_dist. 前缀
 * @Author: Xiaohu.Shen
 * @Date: 2026-01-06
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, renameSync } from "fs";
import { resolve, join, dirname } from "path";

const dist = resolve(process.cwd(), "dist");

// 映射关系：旧名称 -> 新名称
const renameMap = new Map();

// 需要处理的目录
const dirs = ["classes", "interfaces", "enums", "modules", "functions", "types", "variables"];

/**
 * 收集所有需要重命名的文件
 * 将 engine_dist.xxx 重命名为 engine-xxx
 * 将 widgets_dist.xxx 重命名为 widgets-xxx
 */
function collectRenames() {
  dirs.forEach((dir) => {
    const dirPath = resolve(dist, dir);
    if (!existsSync(dirPath)) return;

    const files = readdirSync(dirPath).filter((f) => f.endsWith(".html") || (!f.includes(".") && dir === "modules"));
    files.forEach((file) => {
      // 检查是否有 engine_dist. 或 widgets_dist. 前缀
      if (file.startsWith("engine_dist.")) {
        // 对于模块文件 engine_dist.html，重命名为 engine.html
        if (file === "engine_dist.html") {
          renameMap.set(join(dir, file), join(dir, "engine.html"));
        } else {
          const newName = file.replace("engine_dist.", "engine-");
          renameMap.set(join(dir, file), join(dir, newName));
        }
      } else if (file.startsWith("widgets_dist.")) {
        // 对于模块文件 widgets_dist.html，重命名为 widgets.html
        if (file === "widgets_dist.html") {
          renameMap.set(join(dir, file), join(dir, "widgets.html"));
        } else {
          const newName = file.replace("widgets_dist.", "widgets-");
          renameMap.set(join(dir, file), join(dir, newName));
        }
      } else if (dir === "modules" && (file === "engine-html" || file === "widgets-html")) {
        // 修复已经错误重命名的文件
        if (file === "engine-html") {
          renameMap.set(join(dir, file), join(dir, "engine.html"));
        } else if (file === "widgets-html") {
          renameMap.set(join(dir, file), join(dir, "widgets.html"));
        }
      }
    });
  });
}

/**
 * 重命名文件
 */
function renameFiles() {
  let renamedCount = 0;
  renameMap.forEach((newPath, oldPath) => {
    const oldFull = resolve(dist, oldPath);
    const newFull = resolve(dist, newPath);
    try {
      renameSync(oldFull, newFull);
      renamedCount++;
    } catch (e) {
      console.warn(`⚠️ 重命名失败: ${oldPath} -> ${newPath}`, e?.message || e);
    }
  });
  console.log(`✅ 已重命名 ${renamedCount} 个文件`);
  return renamedCount;
}

/**
 * 替换 HTML 文件中的链接引用
 */
function replaceLinksInHtml() {
  let processedCount = 0;

  // 处理所有目录中的 HTML 文件
  dirs.forEach((dir) => {
    const dirPath = resolve(dist, dir);
    if (!existsSync(dirPath)) return;

    const files = readdirSync(dirPath).filter((f) => f.endsWith(".html"));
    files.forEach((file) => {
      const fullPath = join(dirPath, file);
      let html = readFileSync(fullPath, "utf8");
      let modified = false;

      // 替换所有类型的链接引用
      // 1. href 属性中的引用：engine_dist.xxx -> engine-xxx, widgets_dist.xxx -> widgets-xxx
      html = html.replace(
        /href="([^"]*)(engine_dist\.|widgets_dist\.)([^"]*)"/g,
        (match, prefix, modulePrefix, suffix) => {
          modified = true;
          const newModulePrefix = modulePrefix === "engine_dist." ? "engine-" : "widgets-";
          return `href="${prefix}${newModulePrefix}${suffix}"`;
        }
      );

      // 2. data-base 属性中的引用
      html = html.replace(
        /data-base="([^"]*)(engine_dist\.|widgets_dist\.)([^"]*)"/g,
        (match, prefix, modulePrefix, suffix) => {
          modified = true;
          const newModulePrefix = modulePrefix === "engine_dist." ? "engine-" : "widgets-";
          return `data-base="${prefix}${newModulePrefix}${suffix}"`;
        }
      );

      // 3. 面包屑导航中的文本：engine/dist -> engine, widgets/dist -> widgets
      html = html.replace(
        />engine\/dist</g,
        () => {
          modified = true;
          return ">engine<";
        }
      );
      html = html.replace(
        />widgets\/dist</g,
        () => {
          modified = true;
          return ">widgets<";
        }
      );

      // 4. 标题中的模块名
      html = html.replace(
        /<title>([^<]*)(engine\/dist|widgets\/dist)([^<]*)<\/title>/g,
        (match, prefix, moduleName, suffix) => {
          modified = true;
          const newModuleName = moduleName === "engine/dist" ? "engine" : "widgets";
          return `<title>${prefix}${newModuleName}${suffix}</title>`;
        }
      );

      // 5. h1 标签中的模块名
      html = html.replace(
        /<h1[^>]*>([^<]*)(engine\/dist|widgets\/dist)([^<]*)<\/h1>/g,
        (match, prefix, moduleName, suffix) => {
          modified = true;
          const newModuleName = moduleName === "engine/dist" ? "engine" : "widgets";
          return match.replace(moduleName, newModuleName);
        }
      );

      // 6. 侧边栏导航中的模块名
      html = html.replace(
        /<span[^>]*>([^<]*)(engine\/dist|widgets\/dist)([^<]*)<\/span>/g,
        (match, prefix, moduleName, suffix) => {
          modified = true;
          const newModuleName = moduleName === "engine/dist" ? "engine" : "widgets";
          return match.replace(moduleName, newModuleName);
        }
      );

      // 7. 替换所有 engine_dist. 和 widgets_dist. 前缀（在链接中）
      // 注意：对于模块文件 engine_dist.html，应该替换为 engine.html
      html = html.replace(/engine_dist\.html/g, () => {
        modified = true;
        return "engine.html";
      });
      html = html.replace(/widgets_dist\.html/g, () => {
        modified = true;
        return "widgets.html";
      });
      // 替换路径中的引用（如 ../classes/engine_dist.FxManager.html）
      html = html.replace(/(["'`])([^"'`]*\/)(classes|interfaces|enums|modules|functions|types|variables)\/engine_dist\.([^"'`]+)\1/g, (match, quote, path, dir, name) => {
        modified = true;
        return `${quote}${path}${dir}/engine-${name}${quote}`;
      });
      html = html.replace(/(["'`])([^"'`]*\/)(classes|interfaces|enums|modules|functions|types|variables)\/widgets_dist\.([^"'`]+)\1/g, (match, quote, path, dir, name) => {
        modified = true;
        return `${quote}${path}${dir}/widgets-${name}${quote}`;
      });
      // 替换直接的类名引用（如 engine_dist.FxManager）
      html = html.replace(/engine_dist\./g, () => {
        modified = true;
        return "engine-";
      });
      html = html.replace(/widgets_dist\./g, () => {
        modified = true;
        return "widgets-";
      });
      // 修复错误的模块文件名引用
      html = html.replace(/engine-html/g, () => {
        modified = true;
        return "engine.html";
      });
      html = html.replace(/widgets-html/g, () => {
        modified = true;
        return "widgets.html";
      });
      // 替换 JSON 字符串中的引用（可能在 script 标签中）
      html = html.replace(/"([^"]*\/)engine_dist\.([^"]+)"/g, (match, path, name) => {
        modified = true;
        return `"${path}engine-${name}"`;
      });
      html = html.replace(/"([^"]*\/)widgets_dist\.([^"]+)"/g, (match, path, name) => {
        modified = true;
        return `"${path}widgets-${name}"`;
      });
      // 替换单引号字符串中的引用
      html = html.replace(/'([^']*\/)engine_dist\.([^']+)'/g, (match, path, name) => {
        modified = true;
        return `'${path}engine-${name}'`;
      });
      html = html.replace(/'([^']*\/)widgets_dist\.([^']+)'/g, (match, path, name) => {
        modified = true;
        return `'${path}widgets-${name}'`;
      });

      if (modified) {
        writeFileSync(fullPath, html, "utf8");
        processedCount++;
      }
    });
  });

  // 处理根目录的 HTML 文件
  const rootFiles = readdirSync(dist).filter((f) => f.endsWith(".html"));
  rootFiles.forEach((file) => {
    const fullPath = resolve(dist, file);
    let html = readFileSync(fullPath, "utf8");
    let modified = false;

    // 应用相同的替换规则
    html = html.replace(/engine_dist\.html/g, () => {
      modified = true;
      return "engine.html";
    });
    html = html.replace(/widgets_dist\.html/g, () => {
      modified = true;
      return "widgets.html";
    });
    // 替换路径中的引用
    html = html.replace(/(["'`])([^"'`]*\/)(classes|interfaces|enums|modules|functions|types|variables)\/engine_dist\.([^"'`]+)\1/g, (match, quote, path, dir, name) => {
      modified = true;
      return `${quote}${path}${dir}/engine-${name}${quote}`;
    });
    html = html.replace(/(["'`])([^"'`]*\/)(classes|interfaces|enums|modules|functions|types|variables)\/widgets_dist\.([^"'`]+)\1/g, (match, quote, path, dir, name) => {
      modified = true;
      return `${quote}${path}${dir}/widgets-${name}${quote}`;
    });
    html = html.replace(/engine_dist\./g, () => {
      modified = true;
      return "engine-";
    });
    html = html.replace(/widgets_dist\./g, () => {
      modified = true;
      return "widgets-";
    });
    html = html.replace(/engine\/dist/g, () => {
      modified = true;
      return "engine";
    });
    html = html.replace(/widgets\/dist/g, () => {
      modified = true;
      return "widgets";
    });
    // 修复错误的模块文件名引用
    html = html.replace(/engine-html/g, () => {
      modified = true;
      return "engine.html";
    });
    html = html.replace(/widgets-html/g, () => {
      modified = true;
      return "widgets.html";
    });
    // 替换 JSON 字符串中的引用
    html = html.replace(/"([^"]*\/)engine_dist\.([^"]+)"/g, (match, path, name) => {
      modified = true;
      return `"${path}engine-${name}"`;
    });
    html = html.replace(/"([^"]*\/)widgets_dist\.([^"]+)"/g, (match, path, name) => {
      modified = true;
      return `"${path}widgets-${name}"`;
    });
    // 替换单引号字符串中的引用
    html = html.replace(/'([^']*\/)engine_dist\.([^']+)'/g, (match, path, name) => {
      modified = true;
      return `'${path}engine-${name}'`;
    });
    html = html.replace(/'([^']*\/)widgets_dist\.([^']+)'/g, (match, path, name) => {
      modified = true;
      return `'${path}widgets-${name}'`;
    });

    if (modified) {
      writeFileSync(fullPath, html, "utf8");
      processedCount++;
    }
  });

  console.log(`✅ 已更新 ${processedCount} 个 HTML 文件中的链接`);
}

function run() {
  console.log("🔄 开始重命名模块文件...");
  collectRenames();
  if (renameMap.size === 0) {
    console.log("ℹ️ 没有需要重命名的文件");
    return;
  }
  renameFiles();
  replaceLinksInHtml();
  console.log("✅ 模块重命名完成");
}

run();

