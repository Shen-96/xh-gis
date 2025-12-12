/*
 * @Descripttion: Circle Ripple Material Example
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 */
import React, { useCallback, useState } from "react";
import { WidgetEarth as Earth } from "@xh-gis/widgets";
import { XgEarth, GraphicType, MaterialType, Point3Deg } from "@xh-gis/engine";
import {
  Cartesian3,
  Math as CesiumMath,
  HeadingPitchRange,
  Matrix4,
  Color,
} from "cesium";

const CircleRippleExample: React.FC = () => {
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
        CesiumMath.toRadians(-60),
        200000
      )
    );
    viewer.camera.lookAtTransform(Matrix4.IDENTITY); // Unlock camera

    const gm = e.graphicManager;

    // Create multiple circles with different CircleRipple material configurations
    const circleConfigs = [
      {
        id: "circle-ripple-1",
        center: [120.1551, 30.2741, 0] as Point3Deg,
        radius: 5000,
        color: Color.CYAN,
        speed: 1.0,
        count: 1, // Single ripple expanding
        gradient: 0.2,
        label: "单波纹扩散",
      },
      {
        id: "circle-ripple-2",
        center: [120.2551, 30.2741, 0] as Point3Deg,
        radius: 5000,
        color: Color.YELLOW,
        speed: 2.0,
        count: 3, // Multiple ripples
        gradient: 0.3,
        label: "多波纹 (3层)",
      },
      {
        id: "circle-ripple-3",
        center: [120.0551, 30.2741, 0] as Point3Deg,
        radius: 5000,
        color: Color.MAGENTA,
        speed: 1.5,
        count: 5, // More ripples
        gradient: 0.1,
        label: "多波纹 (5层)",
      },
      {
        id: "circle-ripple-4",
        center: [120.1551, 30.3741, 0] as Point3Deg,
        radius: 5000,
        color: Color.LIME,
        speed: 0.8,
        count: 8, // Many ripples
        gradient: 0.4,
        label: "多波纹 (8层)",
      },
      {
        id: "circle-ripple-5",
        center: [120.1551, 30.1741, 0] as Point3Deg,
        radius: 5000,
        color: Color.ORANGE,
        speed: 3.0,
        count: 2, // Fast double ripple
        gradient: 0.5,
        label: "快速双波纹",
      },
    ];

    circleConfigs.forEach((config) => {
      // Circle needs two points: center and a point on the radius
      // Calculate a point on the radius (north of center)
      const centerCar3 = Cartesian3.fromDegrees(
        config.center[0],
        config.center[1],
        config.center[2]
      );
      // Approximate radius in degrees (rough conversion)
      const radiusDeg = config.radius / 111000; // ~111km per degree
      const radiusPoint: Point3Deg = [
        config.center[0],
        config.center[1] + radiusDeg,
        config.center[2],
      ];

      const circle = gm.create(GraphicType.CIRCLE);
      circle.setPositions([config.center, radiusPoint]);
      circle.setStyle({
        fill: true,
        color: config.color.toCssColorString(),
        materialType: MaterialType.CircleRipple,
        outline: false,
        outlineColor: Color.BLACK.toCssColorString(),
        outlineWidth: 1,
        outlineMaterialType: MaterialType.SolidColor,
        uniforms: {
          color: config.color.toCssColorString(),
          speed: config.speed,
          count: config.count,
          gradient: config.gradient,
        },
      });
      gm.add(circle);

      // Add label to identify each circle
      const label = gm.create(GraphicType.LABEL) as any;
      if (label.setPosition) {
        label.setPosition(config.center);
      }
      if (label.setStyle) {
        label.setStyle({
          text: config.label,
          fontSize: 14,
          fontFamily: "sans-serif",
          color: Color.WHITE.toCssColorString(),
          outlineColor: Color.BLACK.toCssColorString(),
          outlineWidth: 2,
          pixelOffset: [0, -40],
          verticalOrigin: "BOTTOM",
        });
      }
      gm.add(label);
    });
  }, []);

  return <Earth onInit={handleInit} />;
};

export default CircleRippleExample;

