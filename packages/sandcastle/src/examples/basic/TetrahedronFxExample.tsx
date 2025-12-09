/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: trae@example.com
 * @Date: 2025-12-09 10:09:33
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-09 14:21:19
 * @WeChat: yingnan55
 * @Version: 1.0.0
 */
import React, { useCallback, useState } from "react";
import { WidgetEarth as Earth } from "@xh-gis/widgets";
import { XgEarth, FX, MaterialType } from "@xh-gis/engine";
import {
  Cartesian3,
  Math as CesiumMath,
  DebugModelMatrixPrimitive,
  Matrix3,
  Matrix4,
  Quaternion,
  Transforms,
  HeadingPitchRange,
} from "cesium";

const TetrahedronFxExample: React.FC = () => {
  const [earth, setEarth] = useState<XgEarth | null>(null);

  const handleInit = useCallback((e: XgEarth) => {
    setEarth(e);
    const viewer = e.viewer;
    viewer.scene.camera.setView({
      destination: Cartesian3.fromDegrees(120.1551, 30.2741, 200000),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-30),
        roll: 0,
      },
    });

    const center = Cartesian3.fromDegrees(120.1551, 30.2741, 0);
    const modelMatrix = Transforms.eastNorthUpToFixedFrame(center);
    const rM = Matrix4.getRotation(modelMatrix, new Matrix3());
    const orientation = Quaternion.fromRotationMatrix(rM);
    const fx = new FX.XgTetrahedronFX({
      id: "tetra-fx",
      show: true,
      graphics: {
        position: { cartesian: [center.x, center.y, center.z] },
        orientation: [
          orientation.x,
          orientation.y,
          orientation.z,
          orientation.w,
        ],
        edgeLength: 20000,
        material: {
          fill: true,
          color: "rgba(255, 255, 255, 0.6)",
          materialType: MaterialType.SolidColor,
          outline: true,
          outlineColor: "rgba(255, 128, 0, 0.95)",
          outlineWidth: 1,
          outlineMaterialType: MaterialType.SolidColor,
          uniforms: {},
        },
      },
    });
    e.fxManager.add(fx);
    const range = 20000 * 5;
    viewer.camera.lookAt(
      center,
      new HeadingPitchRange(
        CesiumMath.toRadians(0),
        CesiumMath.toRadians(-25),
        range
      )
    );
    const m = fx.getPrimitives().get(0)?.modelMatrix;
    if (m) {
      const mm = Matrix4.clone(m, new Matrix4());
      viewer.scene.primitives.add(
        new DebugModelMatrixPrimitive({ modelMatrix: mm, length: 30000 })
      );
    }
  }, []);

  return <Earth onInit={handleInit} />;
};

export default TetrahedronFxExample;
