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
import url from "@rollup/plugin-url";

export default {
  input: "src/index.ts", // TypeScript 入口文件
  output: {
    dir: "dist", // 输出目录
    format: "esm", // 推荐 ES 模块格式，适合库
    preserveModules: true, // 可选，保留原始模块结构
    preserveModulesRoot: "src", // 可选，保持 src 目录结构
  },
  plugins: [
    resolve(), // 解析 node_modules 中的包（如 cesium）
    commonjs(), // 将 CommonJS 转为 ES Module（比如 Cesium）
    typescript(), // 编译 TypeScript
    url({
      // 处理图片等静态资源
      limit: 8192, // 小于 8KB 的图片转为 base64（可选）
      include: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
      emitFiles: true, // 必须！让图片输出到 dist 目录
    }),
  ],
};
