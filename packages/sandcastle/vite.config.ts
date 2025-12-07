/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-10-10 14:53:03
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-07 09:26:11
 */
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import { xhgis } from "vite-plugin-xhgis";
import { resolve } from "path";
import thumbnailPlugin from "./dev/thumbnailPlugin";

export default defineConfig({
  // 基础路径，用于 GitHub Pages 等子路径部署
  base: process.env.BASE || "/",
  plugins: [
    react(),
    cesium(),
    // 指定 monorepo 中引擎包路径与基础资源 URL，由插件负责拷贝到 public
    xhgis({
      baseUrl: "/xh-gis/Assets",
    }),
    thumbnailPlugin(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@xh-gis/engine": resolve(__dirname, "../engine/dist"),
      "@xh-gis/widgets": resolve(__dirname, "../widgets/dist/index.js"),
    },
    // 去重 React 相关包，确保仅打入一个版本
    dedupe: ["react", "react-dom"],
  },
  define: {},
  // optimizeDeps: {},
  server: {
    port: 5000,
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
