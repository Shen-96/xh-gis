(() => {
  function injectHero() {
    try {
      const content = document.querySelector(".col-content");
      const titleNode = document.querySelector(".tsd-page-title h1");
      if (!content || !titleNode) return;
      const name = titleNode.textContent?.trim() || "";
      // 合并后不再区分包，尝试从 TypeDoc 生成的元数据中获取包信息
      // 如果找不到，则不显示包信息（类似 Cesium 官方文档）
      const pkgMeta = document.querySelector('meta[name="package"]')?.getAttribute("content");
      const pkg = pkgMeta || "";

      // Try to find first signature in Constructors or functions
      const sig =
        document.querySelector(".tsd-signature") ||
        document.querySelector(".tsd-signature.tsd-kind-constructor");
      const signatureText = sig
        ? sig.textContent?.trim().replace(/\s+/g, " ")
        : `${name}`;

      // Try description paragraph close to title
      const firstDesc =
        document.querySelector(".tsd-comment > .lead") ||
        document.querySelector(".tsd-comment p");
      const descText = firstDesc
        ? firstDesc.textContent?.trim()
        : "";

      const hero = document.createElement("div");
      hero.className = "xh-hero";
      hero.innerHTML = `
        <div class="xh-title">
          <span class="xh-badge">API</span>
          <span>${name}</span>
          ${pkg ? `<span class="xh-package">${pkg}</span>` : ""}
        </div>
        <div class="xh-signature">${signatureText ? signatureText : ""}</div>
        ${descText ? `<div class="xh-desc">${descText}</div>` : ""}
      `;
      const titleWrap = document.querySelector(".tsd-page-title");
      (titleWrap?.parentElement || content).insertBefore(hero, titleWrap?.nextSibling || content.firstChild);
      
      // 如果已经提取了描述到 hero 中，隐藏原始的 TypeDoc 注释部分以避免重复
      if (descText && firstDesc) {
        const commentPanel = firstDesc.closest(".tsd-panel.tsd-comment");
        if (commentPanel) {
          // 检查注释面板中是否包含代码示例或其他重要内容
          const hasCode = commentPanel.querySelector("pre code");
          const hasOtherContent = commentPanel.querySelector(".tsd-comment > *:not(p):not(.lead)");
          
          // 如果只有描述文本，没有代码或其他内容，则隐藏整个面板
          if (!hasCode && !hasOtherContent) {
            commentPanel.style.display = "none";
          } else {
            // 如果有其他内容，只隐藏描述段落本身
            const descParagraphs = commentPanel.querySelectorAll(".tsd-comment p, .tsd-comment .lead");
            descParagraphs.forEach(p => {
              const pText = p.textContent?.trim() || "";
              // 如果段落内容与提取的描述相同或包含在描述中，则隐藏
              if (descText.includes(pText) || pText === descText || pText.startsWith(descText.split('\n')[0]?.trim() || '')) {
                p.style.display = "none";
              }
            });
          }
        }
      }
    } catch {}
  }

  function addSectionHeadings() {
    try {
      const content = document.querySelector(".col-content");
      if (!content) return;
      const sections = [
        { sel: ".tsd-kind-constructor", label: "Constructor" },
        { sel: ".tsd-kind-property,.tsd-kind-accessor", label: "Members" },
        { sel: ".tsd-kind-method", label: "Methods" },
        { sel: ".tsd-kind-type-alias,.tsd-kind-enum-member", label: "Types" }
      ];
      sections.forEach((s) => {
        const first = content.querySelector(s.sel);
        if (first) {
          const wrap = document.createElement("div");
          wrap.className = "xh-section";
          const h = document.createElement("h2");
          h.className = "xh-section-title";
          h.textContent = s.label;
          wrap.appendChild(h);
          content.insertBefore(wrap, first);
        }
      });
    } catch {}
  }

  function cloneParamTable() {
    try {
      const content = document.querySelector(".col-content");
      const hero = document.querySelector(".xh-hero");
      if (!content || !hero) return;
      // Find the parameter table near the first constructor or first signature panel
      const firstPanel = content.querySelector(".tsd-kind-constructor") || content.querySelector(".tsd-panel");
      if (!firstPanel) return;
      const paramTable = firstPanel.querySelector("table");
      if (!paramTable) return;
      const wrapper = document.createElement("div");
      wrapper.className = "xh-section";
      const title = document.createElement("div");
      title.className = "xh-subsection-title";
      title.textContent = "Parameters";
      const cloned = paramTable.cloneNode(true);
      cloned.classList.add("xh-param-table");
      wrapper.appendChild(title);
      wrapper.appendChild(cloned);
      hero.appendChild(wrapper);
    } catch {}
  }

  function injectExamples() {
    try {
      const content = document.querySelector(".col-content");
      const hero = document.querySelector(".xh-hero");
      if (!content || !hero) return;
      const code = content.querySelector(".tsd-comment pre code");
      if (!code) return;
      const details = document.createElement("div");
      details.className = "xh-examples";
      details.innerHTML = `
        <details>
          <summary>Example</summary>
          <pre><code>${code.textContent}</code></pre>
        </details>
      `;
      hero.appendChild(details);
    } catch {}
  }

  function injectLocalNav() {
    try {
      const content = document.querySelector(".col-content");
      if (!content) return;
      const anchors = Array.from(content.querySelectorAll(".xh-section-title"));
      if (!anchors.length) return;
      const bar = document.createElement("div");
      bar.className = "xh-localnav";
      anchors.forEach((h) => {
        const id = h.textContent?.toLowerCase() || "";
        const anchorId = `xh-${id}`;
        if (!h.id) h.id = anchorId;
        const a = document.createElement("a");
        a.href = `#${h.id}`;
        a.textContent = h.textContent || "";
        bar.appendChild(a);
      });
      const titleWrap = document.querySelector(".tsd-page-title");
      (titleWrap?.parentElement || content).insertBefore(bar, titleWrap?.nextSibling || content.firstChild);
    } catch {}
  }

  function injectAssetsOnce() {
    // Ensure CSS is loaded; in our postprocess we already insert link, but fallback if missing
    const hasCss = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some((l) => (l.getAttribute("href") || "").includes("xh-custom.css"));
    if (!hasCss) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      // Respect relative path (same as other assets)
      const base = document.querySelector('link[href*="assets/style.css"]');
      const href = base ? base.getAttribute("href") : "../assets/style.css";
      const prefix = href?.replace(/style\.css$/, "") || "../assets/";
      css.href = `${prefix}xh-custom.css`;
      document.head.appendChild(css);
    }
  }

  function injectSearchEnhancement() {
    try {
      const searchInput = document.querySelector("#tsd-search-field") || document.querySelector(".tsd-widget.search input");
      if (!searchInput) return;
      
      // Add hint to placeholder if not already there
      const currentPlaceholder = searchInput.getAttribute("placeholder") || "Search";
      if (!currentPlaceholder.includes("Ctrl+K")) {
        searchInput.setAttribute("placeholder", `${currentPlaceholder} (Ctrl+K)`);
      }

      // Global keydown listener
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          searchInput.focus();
        }
      });
    } catch {}
  }

  function run() {
    injectAssetsOnce();
    injectHero();
    addSectionHeadings();
    cloneParamTable();
    injectExamples();
    injectLocalNav();
    injectSearchEnhancement();
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    run();
  } else {
    document.addEventListener("DOMContentLoaded", run);
  }
})();
