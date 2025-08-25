/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-01-11 14:13:10
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-09-07 13:21:10
 */

import { Cartesian3, Matrix3, Matrix4, HeadingPitchRoll } from 'cesium';
import { Attitude } from '..';

/**
 * @descripttion: 计算模型矩阵
 * @return {*}
 * @author: EV-申小虎
 */
// function computeModelMatrix(
//     modelMatrix = Matrix4.IDENTITY,
//     attitude?: Attitude,
//     translation?: {
//         direction: Cartesian3;
//         value: Cartesian3;
//     },
//     result = new Matrix4()
// ) {
//     const { azimuth, elevation, roll } = attitude ?? {};

//     /// 初始姿态
//     const hpr = HeadingPitchRoll.fromDegrees(
//         azimuth ?? 0,
//         elevation ?? 0,
//         roll ?? 0,
//         new HeadingPitchRoll()
//     ),
//         /// 局部旋转矩阵
//         localRotation = Matrix3.fromHeadingPitchRoll(hpr, new Matrix3()),
//         /// 旋转矩阵
//         rotationMatrix = Matrix4.fromRotation(localRotation, new Matrix4()),
//         /// 局部平移矩阵
//         localTranslation = new Cartesian3(
//             translation?.z ?? 0,
//             translation?.y ?? 0,
//             translation?.x ?? 0
//         ),
//         /// 平移矩阵
//         translationMatrix = Matrix4.fromTranslation(localTranslation);

//     /// 缩放->旋转->平移
//     /// 变换矩阵
//     const transformMatrix = Matrix4.multiply(
//         rotationMatrix,
//         translationMatrix,
//         new Matrix4()
//     );

//     /// 特效模型矩阵
//     Matrix4.multiply(
//         modelMatrix,
//         transformMatrix,
//         result
//     );

//     return result;
// }

/**
 * @descripttion: 更新模型矩阵
 * @return {*}
 * @author: EV-申小虎
 */
function computeModelMatrix(
  modelMatrix = Matrix4.IDENTITY,
  attitude?: Attitude,
  translation?: Cartesian3,
  result = new Matrix4()
) {
  const { azimuth, elevation, roll } = attitude || {};

  /// 初始姿态
  const hpr = HeadingPitchRoll.fromDegrees(
      azimuth ?? 0,
      elevation ?? 0,
      roll ?? 0,
      new HeadingPitchRoll()
    ),
    /// 局部旋转矩阵
    localRotation = Matrix3.fromHeadingPitchRoll(hpr, new Matrix3()),
    /// 旋转矩阵
    rotationMatrix = Matrix4.fromRotation(localRotation, new Matrix4()),
    /// 局部平移矩阵
    localTranslation = new Cartesian3(
      translation?.z ?? 0,
      translation?.y ?? 0,
      translation?.x ?? 0
    ),
    /// 平移矩阵
    translationMatrix = Matrix4.fromTranslation(localTranslation);

  /// 缩放->旋转->平移
  /// 变换矩阵
  const transformMatrix = Matrix4.multiply(
    rotationMatrix,
    translationMatrix,
    new Matrix4()
  );

  /// 特效模型矩阵
  Matrix4.multiply(modelMatrix, transformMatrix, result);

  return result;
}

export default computeModelMatrix;
