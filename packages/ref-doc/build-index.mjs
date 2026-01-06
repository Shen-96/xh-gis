/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2026-01-06 10:59:03
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2026-01-06 12:01:30
 */
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { resolve, join } from "path";

const distRoot = resolve(process.cwd(), "dist");
if (!existsSync(distRoot)) mkdirSync(distRoot, { recursive: true });

function collectLinksByPackage(baseDir, packagePrefix) {
  const groups = ["classes", "interfaces", "enums", "modules", "types", "functions"];
  const result = [];
  for (const g of groups) {
    const dir = join(baseDir, g);
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".html") && f.startsWith(packagePrefix))
      .map((f) => {
        // 移除包前缀，只保留类名/接口名等
        const name = f.replace(packagePrefix, "").replace(/\.html$/, "");
        return {
          name: decodeURIComponent(name),
          href: `./${g}/${f}`,
        };
      })
      // 过滤掉无用的 "html" 模块（这是 TypeDoc 自动生成的主入口模块视图）
      .filter((item) => !(g === "modules" && item.name === "html"))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (files.length) {
      result.push({ group: g, items: files });
    }
  }
  return result;
}

// 分别收集 engine 和 widgets 的 API
// 重命名后使用 engine- 和 widgets- 前缀（替代原来的 engine_dist. 和 widgets_dist.）
const engineSections = collectLinksByPackage(distRoot, "engine-");
const widgetsSections = collectLinksByPackage(distRoot, "widgets-");

// 按类型分组并排序
function organizeSections(sections) {
  const organized = {};
  sections.forEach((sec) => {
    if (!organized[sec.group]) {
      organized[sec.group] = { group: sec.group, items: [] };
    }
    organized[sec.group].items.push(...sec.items);
  });
  
  // 对每个分组内的项按字母顺序排序
  Object.values(organized).forEach((sec) => {
    sec.items.sort((a, b) => a.name.localeCompare(b.name));
  });
  
  // 按类型顺序排序
  const order = ["classes", "interfaces", "enums", "modules", "types", "functions"];
  return Object.values(organized).sort((a, b) => {
    return order.indexOf(a.group) - order.indexOf(b.group);
  });
}

const engineOrganized = organizeSections(engineSections);
const widgetsOrganized = organizeSections(widgetsSections);

const renderSection = (title, sections) => {
  if (!sections.length) return "";
  const columns = sections
    .map((sec) => {
      const links = sec.items
        .map((it) => `<a class="symbol" href="${it.href}">${it.name}</a>`)
        .join("");
      return `<div class="column"><h3>${sec.group}</h3>${links}</div>`;
    })
    .join("");
  return `<section><h2>${title}</h2><div class="columns">${columns}</div></section>`;
};

const html = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>XH-GIS API 文档索引</title>
    <style>
      :root { --fg:#0f172a; --muted:#64748b; --bg:#ffffff; --border:#e2e8f0; --chip:#f1f5f9; }
      [data-theme="dark"] { --fg:#f1f5f9; --muted:#94a3b8; --bg:#0f172a; --border:#1e293b; --chip:#1e293b; }
      * { box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif; margin: 0; color: var(--fg); background: var(--bg); transition: background-color 0.2s, color 0.2s; }
      header { position: sticky; top: 0; background: var(--bg); border-bottom: 1px solid var(--border); padding: 12px 16px; z-index: 10; }
      header .row { display: flex; align-items: center; gap: 12px; max-width: 1200px; margin: 0 auto; }
      header .brand { font-weight: 700; letter-spacing: 0.4px; }
      header input { flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); outline: none; background: var(--bg); color: var(--fg); }
      header .theme-toggle { display: flex; align-items: center; gap: 8px; }
      header .theme-toggle label { font-size: 12px; color: var(--muted); }
      header .theme-toggle select { padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); outline: none; cursor: pointer; font-size: 12px; }
      main { max-width: 1400px; margin: 0 auto; padding: 24px 16px; }
      section { margin: 0 0 32px; }
      section > h2 { margin: 0 0 16px; font-size: 18px; font-weight: 600; color: var(--muted); }
      .columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
      .column { border: 1px solid var(--border); border-radius: 8px; padding: 12px; background: var(--bg); max-height: 75vh; overflow-y: auto; }
      .column h3 { margin: 0 0 12px; font-size: 13px; font-weight: 600; color: var(--muted); text-transform: capitalize; }
      .symbol { display: inline-block; padding: 4px 6px; margin: 2px; border-radius: 6px; text-decoration: none; color: var(--fg); background: var(--chip); border: 1px solid var(--border); font-size: 12px; transition: background-color 0.2s; }
      .symbol:hover { background: var(--border); }
      .footer { padding: 16px; border-top: 1px solid var(--border); color: var(--muted); text-align: center; }
      @media (max-width: 1024px) { .columns { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 640px) { .columns { grid-template-columns: repeat(1, 1fr); } }
      @media (prefers-color-scheme: dark) {
        :root:not([data-theme]) { --fg:#f1f5f9; --muted:#94a3b8; --bg:#0f172a; --border:#1e293b; --chip:#1e293b; }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="row">
        <div class="brand">XH-GIS API</div>
        <input id="search" type="text" placeholder="Search symbols... (Ctrl+K)" />
        <div class="theme-toggle">
          <label for="theme-select">Theme:</label>
          <select id="theme-select">
            <option value="os">OS</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </header>
    <main>
      ${renderSection("packages/engine", engineOrganized)}
      ${renderSection("packages/widgets", widgetsOrganized)}
    </main>
    <div class="footer">Need help? Visit the community forum.</div>
    <script>
      // 主题切换功能
      (function() {
        const themeSelect = document.getElementById('theme-select');
        const getStoredTheme = () => localStorage.getItem('tsd-theme') || 'os';
        const setTheme = (theme) => {
          if (theme === 'os') {
            // 跟随系统：移除 data-theme 属性，让 CSS 的 @media (prefers-color-scheme: dark) 处理
            document.documentElement.removeAttribute('data-theme');
          } else {
            document.documentElement.dataset.theme = theme;
          }
        };
        
        // 初始化主题
        const storedTheme = getStoredTheme();
        themeSelect.value = storedTheme;
        setTheme(storedTheme);
        
        // 监听主题选择变化
        themeSelect.addEventListener('change', (e) => {
          const theme = e.target.value;
          localStorage.setItem('tsd-theme', theme);
          setTheme(theme);
        });
        
        // 监听系统主题变化（仅在 os 模式下）
        if (storedTheme === 'os') {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (getStoredTheme() === 'os') {
              setTheme('os');
            }
          });
        }
      })();
      
      // 搜索功能
      const q = document.getElementById('search');
      const all = Array.from(document.querySelectorAll('.symbol'));
      
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          q.focus();
        }
      });

      q.addEventListener('input', () => {
        const term = q.value.trim().toLowerCase();
        all.forEach(a => {
          const show = !term || a.textContent.toLowerCase().includes(term);
          a.style.display = show ? 'inline-block' : 'none';
        });
        
        // 隐藏没有可见项的列
        document.querySelectorAll('.column').forEach(col => {
          const visibleSymbols = col.querySelectorAll('.symbol[style*="inline-block"], .symbol:not([style*="none"])');
          const hasVisible = Array.from(visibleSymbols).some(el => {
            const style = el.getAttribute('style') || '';
            return !style.includes('display: none');
          });
          col.style.display = hasVisible || !term ? 'block' : 'none';
        });
        
        // 隐藏没有可见列的分组
        document.querySelectorAll('section').forEach(section => {
          const visibleColumns = section.querySelectorAll('.column[style*="block"], .column:not([style*="none"])');
          const hasVisible = Array.from(visibleColumns).some(el => {
            const style = el.getAttribute('style') || '';
            return !style.includes('display: none');
          });
          section.style.display = hasVisible || !term ? 'block' : 'none';
        });
      });
    </script>
  </body>
</html>`;

writeFileSync(resolve(distRoot, "index.html"), html, "utf8");
console.log("✅ 合并索引页已生成: dist/index.html");
