/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-03-30 16:58:33
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2024-12-31 07:51:00
 */
import React from "react";
import { IconFontProps } from "../typings";
import clsx from "clsx";

const regex = /icon-(.*)/;

/**
 * @descripttion: Symbol矢量图标
 * @param {*} props 参数
 * @return {React.FC} 组件
 * @author: EV-申小虎
 */
const IconFontClass: React.FC<IconFontProps> = ({
  icon,
  style,
  iconColor,
  iconSize,
  className,
  title,
  onClick,
}) => {
  const result = icon.match(regex)?.find((_i, index) => index === 0);
  if (!result) {
    return null;
  }

  return (
    <i
      className={clsx("iconfont", icon, className)}
      style={iconSize ? { ...style, fontSize: iconSize } : style}
      title={title}
      onClick={onClick}
    >
      {iconColor ? (
        <style key={`style-${result}`} type="text/css">
          {`.${icon}::before{
             color:${iconColor};
          }`}
        </style>
      ) : null}
    </i>
  );
};

export default React.memo(IconFontClass);
