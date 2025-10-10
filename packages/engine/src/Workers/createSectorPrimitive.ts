import {
  Primitive,
  Cartesian3,
  EllipsoidGeometry,
  GeometryInstance,
  PerInstanceColorAppearance,
  Matrix4,
  Math as CesiumMath,
  Matrix3,
  HeadingPitchRoll,
  createGuid,
} from "cesium";
import type { Attitude, SectorGraphicOptions } from "../types";

function computeModelMatrix(
  modelMatrix: Matrix4,
  attitude?: Attitude,
  translation?: Cartesian3
) {
  /// 初始参数
  const { azimuth, elevation, roll } = attitude || {};

  /// 初始旋转角
  const initRotation = Matrix3.fromRotationY(CesiumMath.toRadians(0.0));
  /// 局部调整姿态
  const hpr = HeadingPitchRoll.fromDegrees(
    azimuth ?? 0,
    elevation ?? 0,
    roll ?? 0,
    new HeadingPitchRoll()
  );
  /// 局部旋转角
  const localRotation = Matrix3.fromHeadingPitchRoll(hpr, new Matrix3());
  /// 最终旋转角
  const rotation = Matrix3.multiply(initRotation, localRotation, new Matrix3());
  /// 最终旋转矩阵
  const rotationMatrix4 = Matrix4.fromRotation(rotation, new Matrix4());

  /// 初始平移矩阵
  const initTranslationMatrix4 = Matrix4.fromTranslation(
    new Cartesian3(0, 0, 0),
    new Matrix4()
  );
  /// 局部平移量
  /// 注意旋转平面
  const localTranslation = new Cartesian3(
    translation?.z ?? 0,
    translation?.y ?? 0,
    translation?.x ?? 0
  );
  /// 局部平移矩阵
  const localTranslationMatrix4 = Matrix4.fromTranslation(localTranslation);
  /// 最终平移矩阵
  const translationMatrix4 = Matrix4.multiply(
    initTranslationMatrix4,
    localTranslationMatrix4,
    new Matrix4()
  );

  /// 缩放->旋转->平移
  /// 变换矩阵
  const transformMatrix4 = Matrix4.multiply(
    rotationMatrix4,
    translationMatrix4,
    new Matrix4()
  );

  /// 特效模型矩阵
  const effectModelMatrix4 = Matrix4.multiply(
    modelMatrix,
    transformMatrix4,
    new Matrix4()
  );

  return effectModelMatrix4;
}

function createSectorPrimitive(
  id = createGuid(),
  style: SectorGraphicOptions,
  modelMatrix: Matrix4,
  attitude?: Attitude,
  translation?: Cartesian3
) {
  const { radius, minimumClock, maximumClock, material } = style,
    r = (radius ?? 1) * 1000;

  /// 扇形
  const geometry = new EllipsoidGeometry({
      radii: new Cartesian3(r, r, r),
      innerRadii: new Cartesian3(0.01, 0.01, 0.01),
      minimumCone: CesiumMath.toRadians(90.0),
      maximumCone: CesiumMath.toRadians(90.0),
      minimumClock,
      maximumClock,
    }),
    /// 模型矩阵
    primitiveModelMatrix = computeModelMatrix(
      modelMatrix,
      attitude,
      translation
    );

  const geometryInstance = new GeometryInstance({
    id,
    geometry,
    // attributes: {
    //   color: ColorGeometryInstanceAttribute.fromColor(
    //     Color.fromCssColorString(material?.fillColor ?? "rgba(255,255,0,0.6)")
    //   ),
    // },
  });

  const primitive = new Primitive({
    geometryInstances: geometryInstance,
    modelMatrix: primitiveModelMatrix,
    appearance: new PerInstanceColorAppearance({
      flat: true,
      translucent: true,
    }),
  });

  return primitive;
}

export default createSectorPrimitive;
