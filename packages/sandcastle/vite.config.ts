import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import { resolve } from "path";

export default defineConfig({
  plugins: [cesium(), react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@xh-gis/engine": resolve(__dirname, "../engine/dist/index.js"),
      "@xh-gis/widgets": resolve(__dirname, "../widgets/dist/index.js"),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    fs: {
      allow: ['..']
    }
  },
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg'],
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
