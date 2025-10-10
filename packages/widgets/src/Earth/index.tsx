/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2024-09-14 15:21:25
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 19:00:05
 */

import { FC, memo } from "react";
import { CoreType } from "@xh-gis/engine";
import Core, { CoreProps } from "../Core";

type Props = Omit<CoreProps<CoreType.EARTH>, "coreType">;

const Earth: FC<Props> = (props) => {
  // @ts-ignore
  return <Core coreType={CoreType.EARTH} {...props} />;
};

export default memo(Earth);
