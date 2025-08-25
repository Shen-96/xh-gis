/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2024-09-14 15:21:25
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-06-05 11:06:46
 */

import "../index.css";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { FC, memo } from "react";
import { CoreType } from "@xh-gis/engine";
import Core, { CoreProps } from "../Core";

type Props = Omit<CoreProps<CoreType.MAP>, "coreType">;

const Map: FC<Props> = (props) => {
  // @ts-ignore
  return <Core coreType={CoreType.MAP} {...props} />;
};

export default memo(Map);
