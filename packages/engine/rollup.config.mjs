/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2025-08-18 17:21:04
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-18 18:32:24
 */
// rollup.config.mjs
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts", // TypeScript 入口文件
  output: {
    dir: "dist", // 输出目录
    format: "esm", // 推荐 ES 模块格式，适合库
    preserveModules: true, // 可选，保留原始模块结构
    preserveModulesRoot: "src", // 可选，保持 src 目录结构
  },
  external: ["lodash", "react", "react-dom", "react-dom/client", "cesium"], // 将常见外部包标记为 external，避免被打入产物
  plugins: [
    resolve(), // 解析 node_modules 中的包（如 cesium）
    commonjs(), // 将 CommonJS 转为 ES Module（比如 Cesium）
    json(), // 支持导入 package.json 等 JSON 文件
    typescript(), // 编译 TypeScript
    // 只使用 copy 插件来处理 Assets 文件夹，保持目录结构
    copy({
      targets: [{ src: "src/Assets", dest: "dist" }],
    }),
    // 启用压缩与安全混淆，保留必要名称
    terser({
      ecma: 2020,
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
      },
      format: {
        comments: false,
        beautify: false,
      },
      mangle: {
        toplevel: true,
        reserved: [
          'Cesium',
          'XgEarth', 'XgMap', 'GraphicManager', 'LayerManager', 'HeatmapOption', 'CoreType', 'AbstractCore'
        ],
      },
    }),
  ],
};
