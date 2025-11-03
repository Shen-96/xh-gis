import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import { xhgis } from "vite-plugin-xhgis";
import { resolve } from "path";

export default defineConfig({
  // 基础路径，用于 GitHub Pages 等子路径部署
  base: process.env.BASE || "/",
  plugins: [
    cesium(),
    react(),
    xhgis(),
    // 重写构建产物中的静态资源路径为包含 base 前缀
    {
      name: "rewrite-html-paths",
      transformIndexHtml(html) {
        const base = process.env.BASE || "/";
        // 统一处理以根路径开头的资源，将其改为 base 前缀
        return html
          // Cesium 注入的样式与脚本
          .replace(/href="\/cesium\//g, `href="${base}cesium/`)
          .replace(/src="\/cesium\//g, `src="${base}cesium/`)
          // Vite 静态资源
          .replace(/href="\/assets\//g, `href="${base}assets/`)
          .replace(/src="\/assets\//g, `src="${base}assets/`)
          // Favicon
          .replace(/href="\/vite.svg"/g, `href="${base}vite.svg"`);
      },
    } as Plugin,
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@xh-gis/engine": resolve(__dirname, "../engine/dist/index.js"),
      "@xh-gis/widgets": resolve(__dirname, "../widgets/dist/index.js"),
    },
    // 去重 React 相关包，确保仅打入一个版本
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["scheduler"],
  },
  server: {
    port: 3001,
    open: true,
    host: true,
    fs: {
      allow: [".."],
    },
  },
  assetsInclude: ["**/*.jpg", "**/*.png", "**/*.gif", "**/*.svg"],
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
});
