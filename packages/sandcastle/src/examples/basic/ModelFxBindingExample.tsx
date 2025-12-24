import React, { useCallback, useState } from "react";
import { WidgetEarth as Earth } from "@xh-gis/widgets";
import { XgEarth, FX, MaterialType } from "@xh-gis/engine";
import styles from "./ModelFxBindingExample.module.css";
import {
  Cartesian3,
  HeadingPitchRoll,
  Math as CesiumMath,
  Color,
  Transforms,
  CallbackProperty,
  ConstantProperty,
  SampledPositionProperty,
  VelocityOrientationProperty,
  JulianDate,
  ClockRange,
  Matrix4,
  Quaternion,
} from "cesium";

const ModelFxBindingExample: React.FC = () => {
  const [earth, setEarth] = useState<XgEarth | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const handleInit = useCallback((e: XgEarth) => {
    setEarth(e);
    setStatus("ready");

    try {
      e.layerManager.addPublicLayer({
        imageLayer: "TDT_TER",
      });
      const viewer = e.viewer;
      const { camera } = viewer.scene;
      camera.setView({
        destination: Cartesian3.fromDegrees(120.1551, 30.2741, 300000), // 杭州上空
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-45),
          roll: 0,
        },
      });

      // 加载 GLB 模型（飞机），并让其按圆形轨迹绕圈飞行，显示路径
      const url = `${import.meta.env.BASE_URL}models/Cesium_Air.glb`;
      const centerDeg = { lon: 120.1551, lat: 30.2741 };
      const altitude = 12000; // 米
      const radius = 20000; // 圆半径（米）
      const duration = 120; // 一个完整圈的时长（秒）
      const steps = 360; // 采样步数

      const startTime = JulianDate.now();
      const stopTime = JulianDate.addSeconds(
        startTime,
        duration,
        new JulianDate()
      );
      viewer.clock.startTime = startTime.clone();
      viewer.clock.stopTime = stopTime.clone();
      viewer.clock.currentTime = startTime.clone();
      viewer.clock.clockRange = ClockRange.LOOP_STOP;
      viewer.clock.multiplier = 1;
      viewer.clock.shouldAnimate = true;

      const centerPos = Cartesian3.fromDegrees(
        centerDeg.lon,
        centerDeg.lat,
        altitude
      );
      const enuTransform = Transforms.eastNorthUpToFixedFrame(centerPos);
      const positionProperty = new SampledPositionProperty();
      for (let i = 0; i <= steps; i++) {
        const t = (duration * i) / steps;
        const theta = (2 * Math.PI * i) / steps;
        const localOffset = new Cartesian3(
          Math.cos(theta) * radius,
          Math.sin(theta) * radius,
          0
        );
        const worldPos = Matrix4.multiplyByPoint(
          enuTransform,
          localOffset,
          new Cartesian3()
        );
        positionProperty.addSample(
          JulianDate.addSeconds(startTime, t, new JulianDate()),
          worldPos
        );
      }

      // 调整模型朝向（VelOri 基于运动方向，模型需加 180° 偏航修正）
      const velOri = new VelocityOrientationProperty(positionProperty);

      const entity = viewer.entities.add({
        position: positionProperty,
        orientation: velOri,
        path: {
          show: true,
          leadTime: Number.POSITIVE_INFINITY,
          trailTime: Number.POSITIVE_INFINITY,
          width: 2,
          material: Color.GOLD,
          resolution: 1,
        },
        model: {
          uri: url,
          scale: 1.0,
          minimumPixelSize: 64,
          color: Color.WHITE,
        },
      });

      // 摄像机跟随飞机，并设置视角相对机体的偏移
      entity.viewFrom = new ConstantProperty(
        new Cartesian3(-2000, -2000, 1000)
      );
      // 使用 flyTo 确保模型加载完成后再绑定相机跟随，避免异步加载导致的相机设置失败
      viewer.flyTo(entity).then(() => {
        viewer.trackedEntity = entity;
      });

      // 创建并绑定视锥 FX 到飞机模型实体，实现扫描效果
      const fxId = "plane-frustum-fx";
      const ok = e.fxManager.attach(fxId, entity, {
        mode: "position_and_orientation",
        // anchor: {
        //   translation: new Cartesian3(1, 0, 0), // 向机身前方偏移一些
        //   rotation: new HeadingPitchRoll(CesiumMath.toRadians(180), 0, 0),
        // },
        // 使用局部 Z 轴扫角，视觉上更接近“左右摆动”扫描
        // 限制扫角在 [-15°, 15°] 范围内振荡（断言避免类型报错）
        sweep: {
          axis: "y",
          speed: CesiumMath.toRadians(20),
          min: CesiumMath.toRadians(-30),
          max: CesiumMath.toRadians(30),
        },
      });

      if (ok) {
        // 如果 FX 不存在则创建并添加一个视锥效果，位置将由绑定逻辑实时更新
        if (!e.fxManager.isExists(fxId)) {
          const frustumFx = new FX.XgFrustumFX({
            id: fxId,
            show: true,
            graphics: {
              position: { cartesian: [centerPos.x, centerPos.y, centerPos.z] },
              fov: CesiumMath.toRadians(25),
              aspectRatio: 16 / 9,
              near: 30,
              far: 3000,
              material: {
                fill: true,
                color: "rgba(0, 255, 255, 0.12)",
                materialType: MaterialType.SolidColor,
                outline: true,
                outlineColor: "rgba(0, 255, 255, 0.9)",
                outlineWidth: 1,
                outlineMaterialType: MaterialType.SolidColor,
                uniforms: {},
              },
            },
          });
          e.fxManager.add(frustumFx);
        }
      }

      // 创建并绑定圆锥 FX，跟随飞机移动（与视锥同源绑定）
      const coneFxId = "plane-cone-fx";
      const coneAttachOk = e.fxManager.attach(coneFxId, entity, {
        mode: "position_and_orientation",
        // 可选：通过 anchor 在机体局部坐标系中做微调
        anchor: {
          translation: new Cartesian3(0, 0, 0),
          rotation: new HeadingPitchRoll(0, CesiumMath.toRadians(-90), 0),
        },
      });
      if (coneAttachOk) {
        if (!e.fxManager.isExists(coneFxId)) {
          const coneFx = new FX.XgConeFX({
            id: coneFxId,
            show: true,
            graphics: {
              position: { cartesian: [centerPos.x, centerPos.y, centerPos.z] },
              length: 600,
              bottomRadius: 200,
              material: {
                fill: true,
                color: "rgba(255, 128, 0, 0.20)",
                materialType: MaterialType.SolidColor,
                outline: true,
                outlineColor: "rgba(255, 128, 0, 0.95)",
                outlineWidth: 1,
                outlineMaterialType: MaterialType.SolidColor,
                uniforms: {},
              },
            },
          });
          e.fxManager.add(coneFx);
        }
      }
    } catch (err) {
      console.error("示例初始化失败", err);
      setStatus("error");
    }
  }, []);

  return (
    <div className={styles.example}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>模型加载与FX绑定示例</h1>
          <p className={styles.description}>
            加载飞机 GLB 模型到
            Entity，并绑定视锥特效实现“卫星扫描/机载扫描”效果。
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.mapSection}>
            <div className={styles.mapContainer}>
              {status === "loading" && (
                <div className={styles.loadingPlaceholder}>
                  <div className={styles.loadingIcon}>✈️</div>
                  <div>正在加载示例...</div>
                </div>
              )}

              <Earth onInit={handleInit} />
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>📋 功能点</h3>
              <ul>
                <li>加载本地 GLB 模型：`/models/J-15.glb`</li>
                <li>
                  绑定 FX 到实体：`fxManager.attach(fxId, entity, options)`
                </li>
                <li>锚点支持局部平移与旋转，便于调整 FX 相对机体位置</li>
                <li>
                  扫角动画模拟扫描摆动：
                  <code>
                    sweep: {"{"} axis: &apos;y&apos;, speed {"}"}
                  </code>
                </li>
              </ul>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>📝 代码片段</h3>
              <pre className={styles.codeBlock}>
                <code>{`// 加载 Entity 模型
const entity = viewer.entities.add({
  position,
  orientation: Cesium.Transforms.headingPitchRollQuaternion(position, hpr),
  model: { uri: '/models/J-15.glb', scale: 1.0 }
});

// 绑定 FX 跟随
earth.fxManager.attach('plane-frustum-fx', entity, {
  mode: 'position_and_orientation',
  anchor: { translation: new Cartesian3(0, 0, -30) },
  sweep: { axis: 'y', speed: Cesium.Math.toRadians(15) }
});`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelFxBindingExample;
