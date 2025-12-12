/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-12-12 10:31:11
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-12 11:19:10
 */
/*
 * @Descripttion: Ellipsoid Effect Example
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 */
import React, { useCallback, useState } from "react";
import { WidgetEarth as Earth } from "@xh-gis/widgets";
import { XgEarth, FX, MaterialType } from "@xh-gis/engine";
import {
  Cartesian3,
  Math as CesiumMath,
  HeadingPitchRange,
  Quaternion,
  Matrix3,
  Matrix4,
  Transforms,
} from "cesium";

const EllipsoidFxExample: React.FC = () => {
  const [earth, setEarth] = useState<XgEarth | null>(null);

  const handleInit = useCallback((e: XgEarth) => {
    setEarth(e);
    const viewer = e.viewer;

    // Set initial view
    const center = Cartesian3.fromDegrees(120.1551, 30.2741, 0);
    viewer.camera.lookAt(
      center,
      new HeadingPitchRange(
        CesiumMath.toRadians(0),
        CesiumMath.toRadians(-30),
        250000
      )
    );
    viewer.camera.lookAtTransform(Matrix4.IDENTITY); // Unlock camera

    // Create Ellipsoid FX
    const modelMatrix = Transforms.eastNorthUpToFixedFrame(center);
    const rM = Matrix4.getRotation(modelMatrix, new Matrix3());
    const orientation = Quaternion.fromRotationMatrix(rM);

    const fxList = [
      {
        id: "ellipsoid-electric-east",
        pos: center,
        radii: [12000, 8000, 10000],
        materialType: MaterialType.EllipsoidElectric,
        uniforms: { speed: 5.0, color: "rgba(0,255,255,1.0)" },
        outlineColor: "rgba(0,255,255,0.8)",
      },
      {
        id: "ellipsoid-scan-north",
        pos: center,
        radii: [8000, 12000, 10000],
        materialType: MaterialType.EllipsoidScan,
        uniforms: { speed: 2.0, color: "rgba(255,255,0,1.0)", smooth: false },
        outlineColor: "rgba(255,255,0,0.8)",
      },
      {
        id: "ellipsoid-spiral-west",
        pos: center,
        radii: [10000, 10000, 6000],
        materialType: MaterialType.EllipsoidSpiral,
        uniforms: { speed: 3.0, color: "rgba(255,0,255,1.0)" },
        outlineColor: "rgba(255,0,255,0.8)",
      },
      {
        id: "ellipsoid-wave-south",
        pos: center,
        radii: [6000, 12000, 10000],
        materialType: MaterialType.EllipsoidWave,
        uniforms: { speed: 1.5, color: "rgba(0,255,0,1.0)" },
        outlineColor: "rgba(0,255,0,0.8)",
      },
    ];

    const offsetDist = 50000;
    const r = Matrix4.getRotation(modelMatrix, new Matrix3());
    const east = Matrix3.getColumn(r, 0, new Cartesian3());
    const north = Matrix3.getColumn(r, 1, new Cartesian3());
    const dirs = [
      Cartesian3.multiplyByScalar(east, offsetDist, new Cartesian3()),
      Cartesian3.multiplyByScalar(north, offsetDist, new Cartesian3()),
      Cartesian3.multiplyByScalar(east, -offsetDist, new Cartesian3()),
      Cartesian3.multiplyByScalar(north, -offsetDist, new Cartesian3()),
    ];

    const fxInstances = fxList.map((cfg, idx) =>
      new FX.XgEllipsoidFX({
        id: cfg.id,
        show: true,
        graphics: {
          position: {
            cartesian: [
              center.x + dirs[idx].x,
              center.y + dirs[idx].y,
              center.z + dirs[idx].z,
            ],
          },
          orientation: [
            orientation.x,
            orientation.y,
            orientation.z,
            orientation.w,
          ],
          radii: cfg.radii as [number, number, number],
          material: {
            fill: true,
            color: "rgba(255,255,255,0.15)",
            materialType: cfg.materialType,
            outline: true,
            outlineMaterialType: cfg.materialType,
            outlineColor: cfg.outlineColor,
            outlineWidth: 2,
            uniforms: cfg.uniforms as any,
          },
        },
      })
    );

    fxInstances.forEach((fx) => e.fxManager.add(fx));
  }, []);

  return <Earth onInit={handleInit} />;
};

export default EllipsoidFxExample;
