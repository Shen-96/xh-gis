/*
 * @Descripttion: Frustum Effect Example
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

const FrustumFxExample: React.FC = () => {
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

    // Create Frustum FX instances
    const modelMatrix = Transforms.eastNorthUpToFixedFrame(center);
    const rM = Matrix4.getRotation(modelMatrix, new Matrix3());
    const orientation = Quaternion.fromRotationMatrix(rM);

    const fxList = [
      {
        id: "frustum-1",
        pos: center,
        fov: CesiumMath.toRadians(30),
        aspectRatio: 16 / 9,
        near: 100,
        far: 5000,
        color: "rgba(255, 0, 0, 0.15)",
        outlineColor: "rgba(255, 0, 0, 0.9)",
      },
      {
        id: "frustum-2",
        pos: center,
        fov: CesiumMath.toRadians(45),
        aspectRatio: 4 / 3,
        near: 200,
        far: 6000,
        color: "rgba(0, 255, 0, 0.15)",
        outlineColor: "rgba(0, 255, 0, 0.9)",
      },
      {
        id: "frustum-3",
        pos: center,
        fov: CesiumMath.toRadians(60),
        aspectRatio: 1,
        near: 150,
        far: 4000,
        color: "rgba(0, 0, 255, 0.15)",
        outlineColor: "rgba(0, 0, 255, 0.9)",
      },
      {
        id: "frustum-4",
        pos: center,
        fov: CesiumMath.toRadians(25),
        aspectRatio: 21 / 9,
        near: 50,
        far: 3000,
        color: "rgba(255, 255, 0, 0.15)",
        outlineColor: "rgba(255, 255, 0, 0.9)",
      },
    ];

    const offsetDist = 40000;
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
      new FX.XgFrustumFX({
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
          fov: cfg.fov,
          aspectRatio: cfg.aspectRatio,
          near: cfg.near,
          far: cfg.far,
          material: {
            fill: true,
            color: cfg.color,
            materialType: MaterialType.SolidColor,
            outline: true,
            outlineColor: cfg.outlineColor,
            outlineWidth: 2,
            outlineMaterialType: MaterialType.SolidColor,
            uniforms: {},
          },
        },
      })
    );

    fxInstances.forEach((fx) => e.fxManager.add(fx));
  }, []);

  return <Earth onInit={handleInit} />;
};

export default FrustumFxExample;

