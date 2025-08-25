/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2024-06-19 18:45:12
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-07-09 18:33:41
 */

import "../index.css";
import clsx from "clsx";
import React from "react";

export type IconSvgProps = React.PropsWithChildren<{
  className?: string;
  title?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  style?: React.CSSProperties;
}>;

const IconSvg: React.FC<IconSvgProps> = ({
  className,
  children,
  onClick,
  style,
  title,
}) => {
  return (
    <div
      className={clsx("iconfont", className)}
      style={{ display: "contents", ...style }}
      onClick={onClick}
      title={title}
    >
      <span>{children}</span>
    </div>
  );
};

export default IconSvg;
