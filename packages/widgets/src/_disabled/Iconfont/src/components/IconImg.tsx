/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-03-30 16:58:33
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2024-12-31 03:17:01
 */
import React from "react";
import { IconFontProps } from "../typings";

/**
 * @descripttion: Symbol矢量图标
 * @param {*} props 参数
 * @return {} 组件
 * @author: EV-申小虎
 */
const IconImg: React.FC<
  Omit<IconFontProps, "iconColor" | "iconSize"> & {
    width?: number | string;
    height?: number | string;
  }
> = ({ className, icon, style, width, height, title, onClick }) => {
  return (
    <span
      className={["iconfont", className].map((item) => item).join(" ")}
      title={title}
      onClick={onClick}
      style={{ display: "flex", ...style }}
    >
      <img src={icon} alt={title} style={{ width, height }} />
    </span>
  );
};

export default React.memo(IconImg);
