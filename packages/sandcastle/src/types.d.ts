/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-10-10 14:53:03
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-03 10:45:34
 */
declare module "fast-kde";

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const content: string;
  export default content;
}
