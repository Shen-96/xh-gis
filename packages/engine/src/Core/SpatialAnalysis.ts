// /*
//  * @Descripttion: xxx
//  * @Author: EV-申小虎
//  * @version: 1.0.0
//  * @Date: 2022-07-19 10:29:27
//  * @LastEditors: EV-申小虎
//  * @LastEditTime: 2025-02-27 08:03:21
//  */
// import {
//   BoundingSphere,
//   Cartesian3,
//   Cartographic,
//   ConstantPositionProperty,
//   createGuid,
//   CustomDataSource,
//   defined,
//   EllipsoidGeodesic,
//   Viewer,
// } from "cesium";
// import {
//   GraphicManager,
//   SpatialAnalysisCallback,
//   MathUtils,
//   Geographic,
// } from "..";
// import CoordinateUtils from "./CoordinateUtils";
// import { SymbolType } from "xh-gis";
// import AbstractManager from "./AbstractManager";
// import AbstractCore from "./AbstractCore";

// export default class SpatialAnalysis extends AbstractManager {
//   #graphicManager: PartialPrivate<GraphicManager>;
//   /// 测量对象的数据源集合
//   readonly #dataSourceList: Array<{ id: string; dataSource: CustomDataSource }>;

//   constructor(core: AbstractCore) {
//     super(core);
//     this.#graphicManager = core.graphicManager;
//     this.#dataSourceList = [];
//   }

//   #distanceUnitDisplay(val: number) {
//     return val > 1000
//       ? `${(val / 1000).toFixed(2)} 公里`
//       : `${val.toFixed(2)} 米`;
//   }

//   point(callback?: SpatialAnalysisCallback<Geographic, Cartesian3>) {
//     /// 数据源id
//     const guid = createGuid(),
//       /// 活跃实体id
//       activeId = createGuid(),
//       /// 测量结果标注文本数据源
//       dataSource = new CustomDataSource(guid);

//     /// 向视图中添加数据源
//     this.#dataSourceList.push({ id: guid, dataSource });
//     this.viewer.dataSources.add(dataSource);
//     /// 开始标绘
//     this.#graphicManager.setDrawEventHandler(
//       GraphicType.POINT,
//       {
//         isDrawResult: false,
//       },
//       (res) => {
//         const { coordinate, active } = res,
//           gcs = CoordinateUtils.car3ToGeographic(coordinate),
//           strGcs = CoordinateUtils.pointToStr([
//             Number(gcs.longitude.toPrecision(8)),
//             Number(gcs.latitude.toPrecision(8)),
//           ]);

//         /// 根据坐标绘制测量结果
//         if (defined(coordinate)) {
//           const activeEntity = dataSource.entities.getOrCreateEntity(activeId);
//           if (active) {
//             activeEntity.show = true;
//             activeEntity.position = new ConstantPositionProperty(coordinate);
//             activeEntity.label = this.#graphicManager
//               .createByType(
//                 GraphicType.POINT,
//                 coordinate.clone(),
//                 createGuid(),
//                 `(${strGcs.strLon},${strGcs.strLat})`
//               )
//               ._getEntity().label;
//           } else {
//             activeEntity.show = false;

//             /// 渲染标绘文本
//             const label = this.#graphicManager.createByType(
//               GraphicType.POINT,
//               coordinate,
//               createGuid(),
//               `(${strGcs.strLon},${strGcs.strLat})`
//             );
//             label && dataSource.entities.add(label._getEntity());
//           }

//           /// 回调
//           callback?.({
//             coordinate,
//             result: gcs,
//             active,
//           });
//         }
//       }
//     );
//   }

//   /**
//    * @descripttion: 地表距离测量
//    * @param {function} callback 测量结果回调
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   surfaceDistance(
//     callback?: SpatialAnalysisCallback<Array<number>, Array<Cartesian3>>
//   ) {
//     /// 数据源id
//     const guid = createGuid(),
//       /// 活跃测量结果
//       activeId = createGuid(),
//       /// 每两点间距离集合
//       distanceList: Array<number> = [],
//       /// 测量结果标注文本数据源
//       dataSource = new CustomDataSource();

//     /// 向视图中添加数据源
//     this.#dataSourceList.push({ id: guid, dataSource });
//     this.viewer.dataSources.add(dataSource);
//     /// 开始标绘
//     this.#graphicManager.setDrawEventHandler(
//       GraphicType.POLYLINE,
//       {
//         graphics: {
//           ctrlPnt: {
//             icon: {
//               show: false,
//             },
//           },
//         },
//         isDrawResult: false,
//       },
//       (res) => {
//         const { coordinate, active, isEnded } = res;

//         /// 根据坐标绘制测量结果
//         if (Array.isArray(coordinate) && coordinate.length > 1) {
//           const lastPosition = coordinate[coordinate.length - 1],
//             prevPositon = coordinate[coordinate.length - 2],
//             /// 转换坐标
//             startPnt = Cartographic.fromCartesian(prevPositon),
//             endPnt = Cartographic.fromCartesian(lastPosition),
//             /// 获取中点坐标，用于标绘文本
//             midPositon = Cartesian3.midpoint(
//               prevPositon,
//               lastPosition,
//               new Cartesian3()
//             ),
//             /// 根据椭球，实例化测地线
//             geodesic = new EllipsoidGeodesic(startPnt, endPnt),
//             /// 获取贴地距离
//             surfaceDistance = geodesic.surfaceDistance;

//           /// 活跃实体
//           const activeEntity = dataSource.entities.getOrCreateEntity(activeId);
//           if (active) {
//             /// 绘制活跃测量结果
//             activeEntity.show = true;
//             activeEntity.position = new ConstantPositionProperty(midPositon);
//             activeEntity.label = this.#graphicManager
//               .createByType(
//                 GraphicType.LABEL,
//                 midPositon,
//                 createGuid(),
//                 this.#distanceUnitDisplay(surfaceDistance)
//               )
//               ._getEntity().label;
//           } else {
//             activeEntity.show = false;

//             /// 测量结果文本
//             const label = this.#graphicManager.createByType(
//               GraphicType.LABEL,
//               midPositon,
//               createGuid(),
//               this.#distanceUnitDisplay(surfaceDistance)
//             );
//             label && dataSource.entities.add(label._getEntity());

//             /// 保存结果
//             distanceList.push(surfaceDistance);
//           }

//           /// 结束测量
//           if (isEnded) {
//             /// 设置数据源标识
//             dataSource.name = `sys_spatial_analysis_${guid}`;

//             /// 绘制控制点
//             coordinate.forEach((car3) => {
//               const ctrlPnt = this.#graphicManager.createByType(
//                 GraphicType.POINT,
//                 car3,
//                 createGuid()
//               );
//               ctrlPnt && dataSource.entities.add(ctrlPnt._getEntity());
//             });
//             /// 绘制测量过程
//             /// 多段线
//             const polyline = this.#graphicManager.createByType(
//               GraphicType.POLYLINE,
//               coordinate,
//               `sys_${createGuid()}`
//             );
//             polyline && dataSource.entities.add(polyline._getEntity());
//           }

//           /// 回调
//           callback?.({
//             ...res,
//             id: guid,
//             result: distanceList,
//           });
//         }
//       }
//     );
//   }

//   /**
//    * @descripttion: 多边形面积
//    * @param {void} callback 测量结果回调
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   polygonArea(callback?: SpatialAnalysisCallback<number, Array<Cartesian3>>) {
//     /// 数据源id
//     const guid = createGuid(),
//       activeId = createGuid(),
//       /// 测量结果标注文本数据源
//       dataSource = new CustomDataSource();

//     /// 向视图中添加数据源
//     this.#dataSourceList.push({ id: guid, dataSource });
//     this.viewer.dataSources.add(dataSource);
//     /// 开始标绘
//     this.#graphicManager.setDrawEventHandler(
//       GraphicType.POLYGON,
//       {
//         graphics: {
//           ctrlPnt: {
//             icon: {
//               show: false,
//             },
//           },
//         },
//         isDrawResult: false,
//       },
//       (res) => {
//         const { coordinate, isEnded } = res;

//         /// 根据坐标绘制测量结果
//         if (Array.isArray(coordinate) && coordinate.length > 2) {
//           /// 转换坐标
//           const boundingSphere = BoundingSphere.fromPoints(coordinate),
//             /// 获取中点坐标，用于标绘文本
//             midPositon = boundingSphere.center.clone(),
//             /// 获取测量结果
//             result = MathUtils.getPositionsArea(coordinate);

//           /// 活跃实体
//           const activeEntity = dataSource.entities.getOrCreateEntity(activeId);
//           activeEntity.show = true;
//           activeEntity.position = new ConstantPositionProperty(midPositon);
//           activeEntity.label = this.#graphicManager
//             .createByType(
//               GraphicType.LABEL,
//               midPositon,
//               createGuid(),
//               `${(result / 1000000).toFixed(2)} 平方公里`
//             )
//             ._getEntity().label;

//           /// 结束测量
//           if (isEnded) {
//             /// 设置数据源标识
//             dataSource.name = `sys_spatial_analysis_${guid}`;

//             /// 控制点
//             coordinate.forEach((car3) => {
//               const point = this.#graphicManager.createByType(
//                 GraphicType.POINT,
//                 car3,
//                 `sys_${createGuid()}`
//               );
//               point && dataSource.entities.add(point._getEntity());
//             });
//             /// 填充面
//             const polygon = this.#graphicManager.createByType(
//               GraphicType.POLYGON,
//               coordinate,
//               `sys_${createGuid()}`
//             );
//             polygon && dataSource.entities.add(polygon._getEntity());
//           }

//           /// 回调
//           callback?.({
//             ...res,
//             id: guid,
//             result,
//           });
//         }
//       }
//     );
//   }

//   /**
//    * @descripttion: 根据id移除测量结果
//    * @param {string} id
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   removeById(id: string) {
//     const index = this.#dataSourceList.findIndex((item) => item.id == id);

//     if (index > -1) {
//       const record = this.#dataSourceList[index];
//       /// 清除渲染的量测结果
//       this.viewer.dataSources.remove(record.dataSource, true);
//       this.#dataSourceList.splice(index, 1);
//     }
//   }

//   /**
//    * @descripttion: 清除所有量算结果
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   removeAll() {
//     this.#dataSourceList.forEach((item) => {
//       /// 清除渲染的量测结果
//       this.viewer.dataSources.remove(item.dataSource, true);
//     });
//     /// 清除本地记录
//     this.#dataSourceList.splice(0);
//   }
// }
