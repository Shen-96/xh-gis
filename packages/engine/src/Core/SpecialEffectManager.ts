/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2022-10-26 16:46:08
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:36:32
 */
import LayerManager from "./LayerManager";
import type {
  XgConeFxGraphicOptions,
  XgEllipsoidFxGraphicOptions,
} from "../types";
import {
  Clock,
  ConstantPositionProperty,
  createGuid,
  SampledPositionProperty,
  VelocityOrientationProperty,
} from "cesium";
import AbstractStereoSpecialEffect from "../DataSources/SpecialEffect/AbstractStereoSpecialEffect";
import { SpecialEffectType } from "../enum";
import AbstractSpecialEffect from "../DataSources/SpecialEffect/AbstractSpecialEffect";
import XgConeFX from "../DataSources/SpecialEffect/XgConeFX";
import XgEllipsoidFX from "../DataSources/SpecialEffect/XgEllipsoidFX";
import AbstractManager from "./AbstractManager";
import AbstractCore from "./AbstractCore";

export default class SpecialEffectManager extends AbstractManager {
  readonly #layerManager: PartialPrivate<LayerManager>;
  readonly #specialEffectArr: Array<AbstractSpecialEffect>;

  /**
   * @descripttion: 构造函数
   * @param {Viewer} viewer 视窗
   * @return {*}
   * @author: EV-申小虎
   */
  constructor(core: AbstractCore) {
    super(core);
    this.#layerManager = core.layerManager;
    this.#specialEffectArr = [];
    this.#init();
  }

  #init() {
    this.viewer.clock.onTick.addEventListener((clock: Clock) => {
      const time = clock.currentTime.clone();

      this.#specialEffectArr.forEach((fx) => {
        /// 更新有效性
        const availability = fx.availability,
          isAvaliable = availability
            ? availability.findIntervalContainingDate(time) != undefined
            : true;

        fx._getPrimitives().show = fx.show && isAvaliable;

        /// 若position是引用类型，则保持更新
        if (
          fx.position instanceof ConstantPositionProperty ||
          fx.position instanceof SampledPositionProperty
        ) {
          const position = fx.position.getValue(time);

          fx._updatePosition(position);
        }

        /// 若orientation是引用类型，则保持更新
        if (
          fx instanceof AbstractStereoSpecialEffect &&
          fx.orientation instanceof VelocityOrientationProperty
        ) {
          const orientation = fx.orientation.getValue(time);

          fx._updateOrientation(orientation);
        }
      });
    });
  }

  // #updateModelMatrix(
  //     specialEffect: SpecialEffect,
  //     // time?: JulianDate,
  //     modelMatrix: Matrix4,
  //     // attitude?: Attitude,
  //     // translation?: Cartesian3
  // ) {
  //     const count = specialEffect._fxs.length;
  //     //     trackedEntity = specialEffect._trackedEntity,
  //     //     basicModelMatrix =
  //     //         modelMatrix ??
  //     //         (time && trackedEntity?.computeModelMatrix(time.clone(), new Matrix4()));

  //     // try {
  //     //     if (basicModelMatrix)
  //     for (let index = 0; index < count; index++) {
  //         const primitive: Primitive | undefined =
  //             specialEffect._fxs.get(index);

  //         if (primitive) {
  //             //                 let lastModelMatrix: Matrix4 | undefined = undefined;

  //             //                 lastModelMatrix = computeModelMatrix(
  //             //                     basicModelMatrix,
  //             //                     attitude,
  //             //                     translation
  //             //                 );

  //             //                 if (!lastModelMatrix)
  //             //                     throw new Error(
  //             //                         `update model matrix failed,invalid model matrix ${specialEffect}`
  //             //                     );

  //             primitive.modelMatrix = modelMatrix;
  //         }
  //     }
  //     // } catch (error) {
  //     //     console.log(error);
  //     // }
  // }

  // #updateMaterial(
  //     specialEffect: SpecialEffect,
  //     material: CustomGraphicMaterialOptions<GraphicStyleValueType.FILL_AND_OUTLINE>
  // ) {
  //     const { fill, fillColor, outline, outlineColor } = material,
  //         count = specialEffect._fxs.length,
  //         type = specialEffect._type,
  //         style = specialEffect._style;

  //     for (let index = 0; index < count; index++) {
  //         const primitive: Primitive | undefined =
  //             specialEffect._fxs.get(index),
  //             geometryInstances = primitive?.geometryInstances;

  //         if (geometryInstances && !Array.isArray(geometryInstances)) {
  //             const id = geometryInstances.id;

  //             switch (id) {
  //                 case GeometryInstanceIdType["3d-fill"]:
  //                     primitive.show = fill ?? true;
  //                     break;
  //                 case GeometryInstanceIdType["3d-outline"]:
  //                     primitive.show = outline ?? true;
  //                     break;
  //                 // case GeometryInstanceIdType["2d"]:
  //                 //     primitive.show = projection ?? false;
  //                 //     break;
  //                 default:
  //                     break;
  //             }
  //         }
  //     }
  // }

  // /**
  //  * @descripttion: 创建圆锥特效
  //  * @return {*}
  //  * @author: EV-申小虎
  //  */
  // #createCylinderEffect(
  //     id = createGuid(),
  //     type: SpecialEffectType,
  //     style: CylinderGraphicOptions,
  //     modelMatrix: Matrix4,
  //     show = true
  //     // trackedEntity?: Entity,
  //     // attitude?: Attitude,
  //     // translation?: Cartesian3,
  //     // availability?: TimeIntervalCollection
  // ) {
  //     const specialEffect: SpecialEffect = {
  //         // availability,
  //         _id: id,
  //         _type: type,
  //         _style: style,
  //         // _trackedEntity: trackedEntity,
  //         _fxs: new PrimitiveCollection(),
  //         // updateModelMatrix: (time, modelMatrix, attitude, translation) => {
  //         //     this.#updateModelMatrix(
  //         //         specialEffect,
  //         //         time,
  //         //         modelMatrix,
  //         //         attitude,
  //         //         translation
  //         //     );
  //         // },
  //         show: {
  //             get: () => specialEffect._fxs.show,
  //             set: (val) => specialEffect._fxs.show = val
  //         },
  //         updateModelMatrix: (modelMatrix) => {
  //             this.#updateModelMatrix(
  //                 specialEffect,
  //                 modelMatrix,
  //                 // attitude,
  //                 // translation
  //             );
  //         },
  //         updateMaterial: (material) => {
  //             this.#updateMaterial(specialEffect, material);
  //         },
  //     };

  //     const { length, topRadius, bottomRadius, material } = style,
  //         fill = material?.fill ?? true,
  //         outline = material?.outline ?? false;

  //     /// 对应的投影图元
  //     // projection = material?.projection ?? false;

  //     if (
  //         !(
  //             MathUtils.isPositiveNumber(length) &&
  //             MathUtils.isPositiveNumber(topRadius, true) &&
  //             MathUtils.isPositiveNumber(bottomRadius)
  //         )
  //     )
  //         throw new Error(
  //             `create special effect failed , invaild style : ${JSON.stringify(
  //                 style
  //             )}`
  //         );

  //     /// 创建对应2维要素
  //     /// 扇形
  //     // const SectorGraphicOptions: SectorGraphicOptions = {
  //     //     radius: range / Math.cos(CesiumMath.toRadians(angle)),
  //     //     angle: 2 * angle,
  //     // },
  //     // sectorPrimitive = createSectorPrimitive(
  //     //     undefined,
  //     //     SectorGraphicOptions,
  //     //     modelMatrix,
  //     //     attitude,
  //     //     translation
  //     // ),
  //     const coneFillPrimitive = createCylinderPrimitive(
  //         GeometryInstanceIdType["3d-fill"],
  //         style,
  //         modelMatrix,
  //     ),
  //         coneOutlinePrimitive = createCylinderOutlinePrimitive(
  //             GeometryInstanceIdType["3d-outline"],
  //             style,
  //             modelMatrix,
  //             this.viewer.scene.maximumAliasedLineWidth
  //         );

  //     /// 二维投影的图元
  //     // sectorPrimitive.show = projection;
  //     // specialEffect._specialEffect.add(sectorPrimitive);
  //     /// 三维填充图元
  //     if (coneFillPrimitive) {
  //         coneFillPrimitive.show = fill;
  //         specialEffect._fxs.add(coneFillPrimitive);
  //     }
  //     /// 三维外框线图元
  //     if (coneOutlinePrimitive) {
  //         coneOutlinePrimitive.show = outline;
  //         specialEffect._fxs.add(coneOutlinePrimitive);
  //     }

  //     specialEffect._fxs.show = show;
  //     return specialEffect;
  // }

  // #createPolylineEffect(
  //     id = createGuid(),
  //     type: SpecialEffectType,
  //     style: PolylineGraphicOptions,
  //     availability?: TimeIntervalCollection
  // ) {
  //     const { positions } = style;

  //     const car3Arr = Cartesian3.fromDegreesArrayHeights(positions?.cartographicDegrees ?? []);

  //     if (Array.isArray(car3Arr)) {
  //         const specialEffect: SpecialEffect = {
  //             // availability,
  //             _id: id,
  //             _type: type,
  //             _style: style,
  //             // _trackedEntity: undefined,
  //             _fxs: new PrimitiveCollection(),
  //             show: {
  //                 get: () => specialEffect._fxs.show,
  //                 set: (val) => specialEffect._fxs.show = val
  //             },
  //             updateMaterial: (material) => {
  //                 this.#updateMaterial(specialEffect, material);
  //             },
  //             updateModelMatrix: () => { }
  //         };
  //         const primitive = createPolylinePrimitive(id, style, car3Arr);

  //         specialEffect._fxs.add(primitive);
  //         return specialEffect;
  //     }

  //     return undefined;
  // }

  // /// 椭球特效
  // #createEllipsoidEffect(
  //     id = createGuid(),
  //     type: SpecialEffectType,
  //     style: EllipsoidGraphicOptions,
  //     modelMatrix: Matrix4,
  //     show = true
  // ) {
  //     const specialEffect: SpecialEffect = {
  //         // availability,
  //         _id: id,
  //         _type: type,
  //         _style: style,
  //         // _trackedEntity: trackedEntity,
  //         _fxs: new PrimitiveCollection(),
  //         // updateModelMatrix: (time, modelMatrix, attitude, translation) => {
  //         //     this.#updateModelMatrix(
  //         //         specialEffect,
  //         //         time,
  //         //         modelMatrix,
  //         //         attitude,
  //         //         translation
  //         //     );
  //         // },
  //         show: {
  //             get: () => specialEffect._fxs.show,
  //             set: (val) => specialEffect._fxs.show = val
  //         },
  //         updateModelMatrix: (modelMatrix) => {
  //             this.#updateModelMatrix(
  //                 specialEffect,
  //                 modelMatrix,
  //                 // attitude,
  //                 // translation
  //             );
  //         },
  //         updateMaterial: (material) => {
  //             this.#updateMaterial(specialEffect, material);
  //         },
  //     };

  //     const { radii, material } = style,
  //         fill = material?.fill ?? true,
  //         outline = material?.outline ?? false;

  //     /// 对应的投影图元
  //     // projection = material?.projection ?? false;

  //     if (!defined(radii))
  //         throw new Error(
  //             `create special effect failed , invaild style : ${JSON.stringify(
  //                 style
  //             )}`
  //         );

  //     /// 创建对应2维要素
  //     /// 扇形
  //     // const SectorGraphicOptions: SectorGraphicOptions = {
  //     //     radius: range / Math.cos(CesiumMath.toRadians(angle)),
  //     //     angle: 2 * angle,
  //     // },
  //     // sectorPrimitive = createSectorPrimitive(
  //     //     undefined,
  //     //     SectorGraphicOptions,
  //     //     modelMatrix,
  //     //     attitude,
  //     //     translation
  //     // ),
  //     const fillPrimitive = createEllipsoidPrimitive(
  //         GeometryInstanceIdType["3d-fill"],
  //         style,
  //         modelMatrix,
  //     ),
  //         outlinePrimitive = createEllipsoidOutlinePrimitive(
  //             GeometryInstanceIdType["3d-outline"],
  //             style,
  //             modelMatrix,
  //             this.viewer.scene.maximumAliasedLineWidth
  //         );
  //     // scanPrimitive = createEllipsoidPrimitive(
  //     //     'scan',
  //     //     {
  //     //         radii: style.radii,
  //     //         innerRadii: new Cartesian3(0.01, 0.01, 0.01),
  //     //         maximumCone: CesiumMath.PI_OVER_TWO,
  //     //         maximumClock: CesiumMath.toRadians(95.0),
  //     //         minimumClock: CesiumMath.toRadians(90.0),
  //     //     },
  //     //     modelMatrix
  //     // );

  //     /// 二维投影的图元
  //     // sectorPrimitive.show = projection;
  //     // specialEffect._specialEffect.add(sectorPrimitive);
  //     /// 三维填充图元
  //     if (fillPrimitive) {
  //         fillPrimitive.show = fill;
  //         specialEffect._fxs.add(fillPrimitive);
  //     }
  //     /// 三维外框线图元
  //     if (outlinePrimitive) {
  //         outlinePrimitive.show = outline;
  //         specialEffect._fxs.add(outlinePrimitive);
  //     }
  //     // if (scanPrimitive) {
  //     //     scanPrimitive.show = true;
  //     //     specialEffect._fxs.add(scanPrimitive);

  //     //     this.viewer.scene.preUpdate.addEventListener(() => {
  //     //         Matrix4.multiplyByMatrix3(
  //     //             scanPrimitive.modelMatrix,
  //     //             Matrix3.fromRotationZ(
  //     //                 CesiumMath.toRadians(1)
  //     //             ),
  //     //             scanPrimitive.modelMatrix
  //     //         );
  //     //     });
  //     // }

  //     specialEffect._fxs.show = show;
  //     return specialEffect;
  // }

  create(
    id: string,
    type: SpecialEffectType.CONE,
    graphics: XgConeFxGraphicOptions,
    name?: string,
    show?: boolean
  ): XgConeFX;
  create(
    id: string,
    type: SpecialEffectType.ELLIPSOID,
    graphics: XgEllipsoidFxGraphicOptions,
    name?: string,
    show?: boolean
  ): XgEllipsoidFX;

  create(
    id = createGuid(),
    type: SpecialEffectType,
    graphics: any,
    name?: any,
    show = true
  ) {
    try {
      /// 锥体类型
      if (type == SpecialEffectType.CONE) {
        return new XgConeFX({
          id,
          name,
          show,
          graphics,
        });
      }

      /// 圆锥类型
      // if (type == SpecialEffectType.CYLINDER) {
      //     return this.#createCylinderEffect(id, type, style as CylinderGraphicOptions, modelMatrix, show);
      // }

      if (type == SpecialEffectType.ELLIPSOID) {
        return new XgEllipsoidFX({
          id,
          name,
          show,
          graphics,
        });
      }

      return undefined;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  add(specialEffect: AbstractSpecialEffect) {
    let result = false;
    if (this.isExists(specialEffect.id)) return result;

    this.#specialEffectArr.push(specialEffect);
    this.#layerManager.add(
      specialEffect.id,
      specialEffect._getPrimitives(),
      specialEffect.show
    );
    result = true;

    return result;
  }

  /**
   * @descripttion: 是否存在图层
   * @param {string} id 图层唯一标识
   * @return {boolean} 查询结果
   * @author: EV-申小虎
   */
  isExists(id: string) {
    return this.#specialEffectArr.findIndex((item) => item.id === id) >= 0;
  }

  getById(id: string): AbstractSpecialEffect | undefined {
    const res = this.#specialEffectArr.find((item) => item.id === id);

    return res;
  }

  removeById(id: string) {
    let result = false;

    if (this.isExists(id)) {
      const index = this.#specialEffectArr.findIndex((item) => item.id == id);

      this.#layerManager.removeById(id, true);
      this.#specialEffectArr.splice(index, 1);

      result = true;
    }

    return result;
  }

  /**
   * @descripttion: 清除所有特效
   * @return {null}
   * @author: EV-申小虎
   */
  clearAll() {
    this.#specialEffectArr.forEach((fx) => {
      this.#layerManager.removeById(fx.id, true);
    });

    this.#specialEffectArr.splice(0, this.#specialEffectArr.length);
  }
}
