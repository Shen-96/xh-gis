import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import { xhgis } from "vite-plugin-xhgis";
import { resolve } from "path";

export default defineConfig({
  // 基础路径，用于 GitHub Pages 等子路径部署
  base: process.env.BASE || "/",
  plugins: [
    react(),
    cesium(),
    // 指定 monorepo 中引擎包路径与基础资源 URL，由插件负责拷贝到 public
    xhgis({
      baseUrl: "/xh-gis/Assets",
      xhgisPath: "../engine",
      debug: false,
    }),
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
  define: {
    // 显式为 Cesium 设置资源基础路径，适配子路径部署
    CESIUM_BASE_URL: JSON.stringify((process.env.BASE || "/").replace(/\/$/, "") + "/cesium"),
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
