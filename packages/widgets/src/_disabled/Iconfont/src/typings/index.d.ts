/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-06-07 16:46:36
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-02-28 11:07:50
 */

import React from "react";

export type IconFontProps = {
  icon: string;
  style?: React.CSSProperties;
  iconColor?: string;
  iconSize?: number | string;
  className?: any;
  title?: string;
  mark?: string | number;
  onlnkey?: string | number;
  onClick?: () => void;
};

export interface ISymbolProps {
  icon: string;
  iconSize?: number;
  className?: any;
  onClick?: () => void;
}
