// /*
//  * @class {MeasureTool} 测量工具
//  * @param {viewer} viewer 三维视图
//  * @param {target} string 测量工具放置的div的id
//  * @param {classname} string 样式名
//  * @param {terrainProvider} terrain 地形
//  * @param {show} bool 是否显示界面
//  * */
// import {
//   ArcType,
//   CallbackProperty,
//   Cartesian2,
//   Cartesian3,
//   Cartographic,
//   Color,
//   defined,
//   EllipsoidGeodesic,
//   HeightReference,
//   LabelStyle,
//   Matrix4,
//   NearFarScalar,
//   PolylineArrowMaterialProperty,
//   PolylineDashMaterialProperty,
//   PolylineOutlineMaterialProperty,
//   sampleTerrainMostDetailed,
//   ScreenSpaceEventHandler,
//   ScreenSpaceEventType,
//   Transforms,
//   VerticalOrigin,
//   Viewer,
// } from "cesium";

// class MeasureTool {
//   readonly name: string;
//   viewer: Viewer & { container: HTMLElement };
//   terrainProvider: any;
//   options: {
//     viewer: any;
//     terrainProvider: any;
//     show: boolean;
//     target: string;
//     classname: string;
//   };
//   dom: HTMLElement;
//   bMeasuring: boolean;
//   measureIds: string[];
//   handler: ScreenSpaceEventHandler | null;
//   classList: any;

//   constructor(option: {
//     viewer: any;
//     terrainProvider: any;
//     show: boolean;
//     target: string;
//     classname: string;
//   }) {
//     this.name = "MeasureTool";
//     this.viewer = option.viewer;
//     this.terrainProvider = option.terrainProvider;
//     this.options = option;

//     if (option.show !== false) {
//       if (option.target) {
//         const dom = document.getElementById(option.target);
//         if (dom) {
//           this.dom = dom;
//           this.dom.classList.add("measureTool");
//           if (option.classname) {
//             this.dom.classList.add(option.classname);
//           }
//         }
//       } else {
//         const div = document.createElement("div");
//         div.className =
//           "measureTool measureTool_" +
//           (option.classname ? " " + option.classname : "");
//         document.body.appendChild(div);
//         this.dom = div;
//       }

//       //空间测量距离
//       const btnDistance = document.createElement("div");
//       btnDistance.className = "measureItem";
//       btnDistance.innerHTML = "空间距离";
//       btnDistance.onclick = () => {
//         this.classList.add("selItembox1");
//         this.btnclick("空间距离");
//       };
//       this.dom.appendChild(btnDistance);

//       //地表测量距离
//       const btnGroundDistance = document.createElement("div");
//       btnGroundDistance.className = "measureItem";
//       btnGroundDistance.innerHTML = "地表距离";
//       btnGroundDistance.onclick = () => {
//         this.classList.add("selItembox1");
//         this.btnclick("地表距离");
//       };
//       this.dom.appendChild(btnGroundDistance);

//       //地表测量面积
//       const btnArea = document.createElement("div");
//       btnArea.className = "measureItem";
//       btnArea.innerHTML = "地表面积";
//       btnArea.onclick = () => {
//         this.classList.add("selItembox1");
//         this.btnclick("地表面积");
//       };
//       this.dom.appendChild(btnArea);

//       //高度差
//       const btnAltitude = document.createElement("div");
//       btnAltitude.className = "measureItem";
//       btnAltitude.innerHTML = "高度差";
//       btnAltitude.onclick = () => {
//         this.classList.add("selItembox1");
//         this.btnclick("高度差");
//       };
//       this.dom.appendChild(btnAltitude);

//       //三角测量
//       const btnTriangle = document.createElement("div");
//       btnTriangle.className = "measureItem";
//       btnTriangle.innerHTML = "三角测量";
//       btnTriangle.onclick = () => {
//         this.classList.add("selItembox1");
//         this.btnclick("三角测量");
//       };
//       this.dom.appendChild(btnTriangle);

//       //方位角
//       const btnAngle = document.createElement("div");
//       btnAngle.className = "measureItem";
//       btnAngle.innerHTML = "方位角";
//       btnAngle.onclick = () => {
//         this.classList.add("selItembox1");
//         this.btnclick("方位角");
//       };
//       this.dom.appendChild(btnAngle);

//       //清除结果
//       const btnClear = document.createElement("div");
//       btnClear.className = "measureItem";
//       btnClear.innerHTML = "清除结果";
//       btnClear.onclick = () => {
//         this.btnclick("清除结果");
//       };
//       this.dom.appendChild(btnClear);
//       //
//       // //事件
//       document.onclick = function (e) {
//         const len = document.querySelectorAll(".selItembox1").length;
//         if (
//           e.target?.className !== "" &&
//           e.target?.className.indexOf("selItembox1") >= 0 &&
//           len == 1
//         ) {
//           return;
//         }
//         if (len > 0) {
//           if (len > 1) {
//             const all = document.querySelectorAll(".selItembox1");
//             for (let a = 0; a < all.length; a++) {
//               if (all[a] !== e.target) {
//                 all[a].classList.remove("selItembox1");
//               }
//             }
//           } else {
//             document
//               .querySelector(".selItembox1")
//               ?.classList.remove("selItembox1");
//           }
//         }
//       };
//     }
//     this.bMeasuring = false;
//     this.viewer.container.style.cursor = "";
//     this.measureIds = [];
//     this.handler = null;
//   }

//   private initDom() {

//   }

//   measureLineSpace() {
//     this.btnclick("空间距离");
//   }
//   groundMeasureLineSpace() {
//     this.btnclick("地表距离");
//   }
//   measureAreaSpace() {
//     this.btnclick("地表面积");
//   }
//   altitude() {
//     this.btnclick("高度差");
//   }
//   Triangle() {
//     this.btnclick("三角测量");
//   }
//   measureAngle() {
//     this.btnclick("方位角");
//   }
//   Clear() {
//     this.btnclick("清除结果");
//   }
//   finishMeasure() {
//     this._finishMeasure();
//   }

//   //点击事件
//   btnclick(type: string) {
//     if (type != "清除结果") {
//       if (this.bMeasuring)
//         if (this.handler && !this.handler.isDestroyed()) this.handler.destroy();
//     }

//     switch (type) {
//       case "空间距离":
//         this.bMeasuring = true;
//         this.viewer.container.style.cursor = "crosshair";
//         this._measureLineSpace();
//         break;
//       case "地表距离":
//         this.bMeasuring = true;
//         this.viewer.container.style.cursor = "crosshair";
//         this._groundMeasureLineSpace();
//         break;
//       case "地表面积":
//         this.bMeasuring = true;
//         this.viewer.container.style.cursor = "crosshair";
//         this._measureAreaSpace();

//         break;
//       case "高度差":
//         this.bMeasuring = true;
//         this.viewer.container.style.cursor = "crosshair";
//         this._altitude();
//         break;
//       case "三角测量":
//         this.bMeasuring = true;
//         this.viewer.container.style.cursor = "crosshair";
//         this._Triangle();
//         break;
//       case "方位角":
//         this.bMeasuring = true;
//         this.viewer.container.style.cursor = "crosshair";
//         this._measureAngle();
//         break;
//       case "清除结果":
//         //删除事先记录的id
//         for (let jj = 0; jj < this.measureIds.length; jj++) {
//           this.viewer.entities.removeById(this.measureIds[jj]);
//         }
//         this.measureIds.length = 0;
//         if (this.handler && !this.handler.isDestroyed())
//           this.handler && this.handler.destroy();
//         break;
//       default:
//         break;
//     }
//   }

//   _finishMeasure() {
//     this.btnclick("清除结果");
//     this.bMeasuring = false;
//     this.viewer.container.style.cursor = "";

//     const measureTool = document.querySelector(".measureTool");
//     measureTool?.parentNode?.removeChild(measureTool);
//   }

//   //空间距离测量
//   _measureLineSpace() {
//     const viewer = this.viewer;
//     this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
//     const positions: any[] = [];
//     let poly: null = null;
//     let distance = 0;
//     let cartesian = null;
//     let floatingPoint;
//     //监听移动事件
//     this.handler.setInputAction((movement: { endPosition: Cartesian2 }) => {
//       //移动结束位置
//       cartesian = viewer.scene.pickPosition(movement.endPosition);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.endPosition);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       //判断点是否在画布上
//       if (defined(cartesian)) {
//         if (positions.length >= 2) {
//           if (!defined(poly)) {
//             //画线
//             poly = new PolyLinePrimitive(positions);
//           } else {
//             positions.pop();
//             // cartesian.y += (1 + Math.random());
//             positions.push(cartesian);
//           }
//         }
//       }
//     }, ScreenSpaceEventType.MOUSE_MOVE);
//     //监听单击事件
//     this.handler.setInputAction(function (movement) {
//       cartesian = viewer.scene.pickPosition(movement.position);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.position);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }

//       if (defined(cartesian)) {
//         if (positions.length == 0) {
//           positions.push(cartesian.clone());
//         }
//         positions.push(cartesian);
//         const distance_add = parseFloat(getSpaceDistance(positions));
//         distance += distance_add;
//         //在三维场景中添加Label
//         const textDisance =
//           (distance > 1000
//             ? (distance / 1000).toFixed(3) + "千米"
//             : distance.toFixed(2) + "米") +
//           "\n(+" +
//           (distance_add > 1000
//             ? (distance_add / 1000).toFixed(3) + "千米"
//             : distance_add + "米") +
//           ")";
//         // var textDisance = distance + "米";
//         // if (distance > 1000) {
//         //     textDisance = (parseFloat(distance) / 1000).toFixed(3) + "千米";
//         // }
//         floatingPoint = viewer.entities.add({
//           name: "空间直线距离",
//           position: positions[positions.length - 1],
//           point: {
//             pixelSize: 5,
//             color: Color.RED,
//             outlineColor: Color.WHITE,
//             outlineWidth: 2,
//             heightReference: HeightReference.NONE,
//           },
//           label: {
//             text: textDisance,
//             font: "18px sans-serif",
//             fillColor: Color.CHARTREUSE,
//             style: LabelStyle.FILL_AND_OUTLINE,
//             outlineWidth: 2,
//             verticalOrigin: VerticalOrigin.BOTTOM,
//             pixelOffset: new Cartesian2(20, -20),
//             disableDepthTestDistance: Number.POSITIVE_INFINITY,
//             heightReference: HeightReference.NONE,
//           },
//         });
//         this.measureIds.push(floatingPoint.id);
//       }
//     }, ScreenSpaceEventType.LEFT_CLICK);
//     //监听双击事件
//     this.handler.setInputAction(function (movement) {
//       this.handler.destroy(); //关闭事件句柄
//       positions.pop(); //最后一个点无效
//       this.bMeasuring = false;
//       viewer.container.style.cursor = "";
//     }, ScreenSpaceEventType.RIGHT_CLICK);

//     //绘线效果1
//     var PolyLinePrimitive = (() => {
//       function _(positions) {
//         this.options = {
//           name: "直线",
//           polyline: {
//             show: true,
//             positions: [],
//             arcType: ArcType.NONE,
//             // material: new PolylineOutlineMaterialProperty({
//             //     color: Color.CHARTREUSE
//             // }),
//             material: Color.CHARTREUSE,
//             // depthFailMaterial: new PolylineOutlineMaterialProperty({
//             //     color: Color.RED
//             // }),
//             width: 2,
//           },
//         };
//         this.positions = positions;
//         this._init();
//       }
//       _.prototype._init = () => {
//         const _self = this;
//         const _update = () => {
//           return _self.positions;
//         };
//         //实时更新polyline.positions
//         this.options.polyline.positions = new CallbackProperty(_update, false);
//         const et = viewer.entities.add(this.options);
//         this.measureIds.push(et.id);
//       };

//       return _;
//     })();

//     //空间两点距离计算函数
//     function getSpaceDistance(positions) {
//       let distance_ = 0;
//       if (positions.length > 2) {
//         const point1cartographic = Cartographic.fromCartesian(
//           positions[positions.length - 3]
//         );
//         const point2cartographic = Cartographic.fromCartesian(
//           positions[positions.length - 2]
//         );
//         /**根据经纬度计算出距离**/
//         const geodesic = new EllipsoidGeodesic();
//         geodesic.setEndPoints(point1cartographic, point2cartographic);
//         let s = geodesic.surfaceDistance;
//         //console.log(Math.sqrt(Math.pow(distance_, 2) + Math.pow(endheight, 2)));
//         //返回两点之间的距离
//         s = Math.sqrt(
//           Math.pow(s, 2) +
//             Math.pow(point2cartographic.height - point1cartographic.height, 2)
//         );
//         distance_ = distance_ + s;
//       }
//       return distance_.toFixed(2);
//     }
//   }

//   //贴地测量距离函数
//   _groundMeasureLineSpace() {
//     const viewer = this.viewer;
//     const terrainProvider = this.terrainProvider;
//     viewer.scene.globe.depthTestAgainstTerrain = true;

//     this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
//     const positions = [];
//     let poly = null;
//     // var tooltip = document.getElementById("toolTip");
//     let distance = 0;
//     let cartesian = null;
//     let floatingPoint;
//     // tooltip.style.display = "block";

//     this.handler.setInputAction(function (movement) {
//       // tooltip.style.left = movement.endPosition.x + 3 + "px";
//       // tooltip.style.top = movement.endPosition.y - 25 + "px";
//       // tooltip.innerHTML = '<p>单击开始，右击结束</p>';
//       cartesian = viewer.scene.pickPosition(movement.endPosition);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.endPosition);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       const p = Cartographic.fromCartesian(cartesian);
//       p.height = viewer.scene.sampleHeight(p);
//       cartesian = viewer.scene.globe.ellipsoid.cartographicToCartesian(p);
//       //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
//       if (positions.length >= 2) {
//         if (!defined(poly)) {
//           poly = new PolyLinePrimitive(positions);
//         } else {
//           positions.pop();
//           // cartesian.y += (1 + Math.random());
//           positions.push(cartesian);
//         }
//         // console.log("distance: " + distance);
//         // tooltip.innerHTML='<p>'+distance+'米</p>';
//       }
//     }, ScreenSpaceEventType.MOUSE_MOVE);

//     this.handler.setInputAction(function (movement) {
//       // tooltip.style.display = "none";
//       // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
//       cartesian = viewer.scene.pickPosition(movement.position);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.position);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       const p = Cartographic.fromCartesian(cartesian);
//       p.height = viewer.scene.sampleHeight(p);
//       cartesian = viewer.scene.globe.ellipsoid.cartographicToCartesian(p);
//       if (positions.length == 0) {
//         positions.push(cartesian.clone());
//       }
//       positions.push(cartesian);
//       getSpaceDistance(positions);
//     }, ScreenSpaceEventType.LEFT_CLICK);

//     this.handler.setInputAction(function (movement) {
//       this.handler.destroy(); //关闭事件句柄
//       positions.pop(); //最后一个点无效
//       // viewer.entities.remove(floatingPoint);
//       // tooltip.style.display = "none";
//       this.bMeasuring = false;
//       viewer.container.style.cursor = "";
//     }, ScreenSpaceEventType.RIGHT_CLICK);

//     var PolyLinePrimitive = (() => {
//       const _ = (positions: any) => {
//         this.options = {
//           name: "直线",
//           polyline: {
//             show: true,
//             positions: [],
//             material: Color.GOLD,
//             width: 2,
//             clampToGround: true,
//           },
//         };
//         this.positions = positions;
//         this._init();
//       };

//       _.prototype._init = () => {
//         const _self = this;
//         const _update = () => {
//           return _self.positions;
//         };
//         //实时更新polyline.positions
//         this.options.polyline.positions = new CallbackProperty(_update, false);
//         const et = viewer.entities.add(this.options);
//         this.measureIds.push(et.id);
//       };

//       return _;
//     })();

//     //空间两点距离计算函数
//     function getSpaceDistance(positions) {
//       let distance_ = 0;
//       if (positions.length > 2) {
//         const positions_ = [];
//         const sp = Cartographic.fromCartesian(positions[positions.length - 3]);
//         const ep = Cartographic.fromCartesian(positions[positions.length - 2]);
//         const geodesic = new EllipsoidGeodesic();
//         geodesic.setEndPoints(sp, ep);
//         const s = geodesic.surfaceDistance;
//         positions_.push(sp);
//         let num = parseInt((s / 100).toFixed(0));
//         num = num > 200 ? 200 : num;
//         num = num < 20 ? 20 : num;
//         for (let i = 1; i < num; i++) {
//           const res = geodesic.interpolateUsingSurfaceDistance(
//             (s / num) * i,
//             new Cartographic()
//           );
//           res.height = viewer.scene.sampleHeight(res);
//           positions_.push(res);
//         }
//         positions_.push(ep);
//         // var promise = sampleTerrainMostDetailed(terrainProvider, positions_);
//         // when(promise, function (updatedPositions) {
//         for (let ii = 0; ii < positions_.length - 1; ii++) {
//           geodesic.setEndPoints(positions_[ii], positions_[ii + 1]);
//           const d = geodesic.surfaceDistance;
//           distance_ =
//             Math.sqrt(
//               Math.pow(d, 2) +
//                 Math.pow(positions_[ii + 1].height - positions_[ii].height, 2)
//             ) + distance_;
//         }
//         //在三维场景中添加Label
//         const distance_add = parseFloat(distance_.toFixed(2));
//         distance += distance_add;
//         const textDisance =
//           (distance > 1000
//             ? (distance / 1000).toFixed(3) + "千米"
//             : distance.toFixed(2) + "米") +
//           "\n(+" +
//           (distance_add > 1000
//             ? (distance_add / 1000).toFixed(3) + "千米"
//             : distance_add + "米") +
//           ")";

//         // var textDisance = distance + "米";
//         // if (distance > 1000) {
//         //     textDisance = (distance / 1000).toFixed(3) + "千米";
//         // }
//         floatingPoint = viewer.entities.add({
//           name: "空间直线距离",
//           position: positions[positions.length - 1],
//           point: {
//             pixelSize: 5,
//             color: Color.RED,
//             outlineColor: Color.WHITE,
//             outlineWidth: 2,
//             // disableDepthTestDistance: Number.POSITIVE_INFINITY
//           },
//           label: {
//             text: textDisance,
//             font: "18px sans-serif",
//             fillColor: Color.GOLD,
//             style: LabelStyle.FILL_AND_OUTLINE,
//             outlineWidth: 2,
//             verticalOrigin: VerticalOrigin.BOTTOM,
//             disableDepthTestDistance: Number.POSITIVE_INFINITY,
//             pixelOffset: new Cartesian2(20, -20),
//             // disableDepthTestDistance: Number.POSITIVE_INFINITY
//           },
//         });
//         this.measureIds.push(floatingPoint.id);
//         // });
//       }
//     }
//     //空间两点距离计算函数
//     function getSpaceDistance_(positions) {
//       let distance_ = 0;
//       if (positions.length > 2) {
//         const positions_ = [];
//         const sp = Cartographic.fromCartesian(positions[positions.length - 3]);
//         const ep = Cartographic.fromCartesian(positions[positions.length - 2]);
//         const geodesic = new EllipsoidGeodesic();
//         geodesic.setEndPoints(sp, ep);
//         const s = geodesic.surfaceDistance;
//         positions_.push(sp);
//         let num = parseInt((s / 100).toFixed(0));
//         num = num > 200 ? 200 : num;
//         num = num < 20 ? 20 : num;
//         for (let i = 1; i < num; i++) {
//           const res = geodesic.interpolateUsingSurfaceDistance(
//             (s / num) * i,
//             new Cartographic()
//           );
//           positions_.push(res);
//         }
//         positions_.push(ep);
//         const promise = sampleTerrainMostDetailed(terrainProvider, positions_);
//         when(promise, function (updatedPositions) {
//           for (let ii = 0; ii < positions_.length - 1; ii++) {
//             geodesic.setEndPoints(positions_[ii], positions_[ii + 1]);
//             const d = geodesic.surfaceDistance;
//             distance_ =
//               Math.sqrt(
//                 Math.pow(d, 2) +
//                   Math.pow(positions_[ii + 1].height - positions_[ii].height, 2)
//               ) + distance_;
//           }
//           distance = parseFloat(distance_.toFixed(2));
//           //在三维场景中添加Label
//           let textDisance = distance + "米";
//           if (distance > 1000) {
//             textDisance = (distance / 1000).toFixed(3) + "千米";
//           }
//           floatingPoint = viewer.entities.add({
//             name: "空间直线距离",
//             position: positions[positions.length - 1],
//             point: {
//               pixelSize: 5,
//               color: Color.RED,
//               outlineColor: Color.WHITE,
//               outlineWidth: 2,
//             },
//             label: {
//               text: textDisance,
//               font: "18px sans-serif",
//               fillColor: Color.GOLD,
//               style: LabelStyle.FILL_AND_OUTLINE,
//               outlineWidth: 2,
//               verticalOrigin: VerticalOrigin.BOTTOM,
//               pixelOffset: new Cartesian2(20, -20),
//             },
//           });
//           this.measureIds.push(floatingPoint.id);
//         });
//       }
//     }
//   }
//   //内部测量面积函数
//   _measureAreaSpace() {
//     const viewer = this.viewer;
//     // 鼠标事件
//     this.handler = new ScreenSpaceEventHandler(
//       viewer.scene._imageryLayerCollection
//     );
//     const positions = [];
//     const tempPoints = [];
//     let polygon = null;
//     // var tooltip = document.getElementById("toolTip");
//     let cartesian = null;
//     let floatingPoint; //浮动点
//     // tooltip.style.display = "block";

//     this.handler.setInputAction(function (movement) {
//       // tooltip.style.left = movement.endPosition.x + 3 + "px";
//       // tooltip.style.top = movement.endPosition.y - 25 + "px";
//       // tooltip.innerHTML ='<p>单击开始，右击结束</p>';
//       cartesian = viewer.scene.pickPosition(movement.endPosition);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.endPosition);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
//       if (positions.length >= 2) {
//         if (!defined(polygon)) {
//           polygon = new PolygonPrimitive(positions);
//         } else {
//           positions.pop();
//           // cartesian.y += (1 + Math.random());
//           positions.push(cartesian);
//         }
//         // tooltip.innerHTML='<p>'+distance+'米</p>';
//       }
//     }, ScreenSpaceEventType.MOUSE_MOVE);

//     this.handler.setInputAction(function (movement) {
//       // tooltip.style.display = "none";
//       cartesian = viewer.scene.pickPosition(movement.position);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.position);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
//       if (positions.length == 0) {
//         positions.push(cartesian.clone());
//       }
//       //positions.pop();
//       positions.push(cartesian);
//       //在三维场景中添加点
//       const cartographic = Cartographic.fromCartesian(
//         positions[positions.length - 1]
//       );
//       const longitudeString = Math.toDegrees(cartographic.longitude);
//       const latitudeString = Math.toDegrees(cartographic.latitude);
//       const heightString = cartographic.height;
//       tempPoints.push({
//         lon: longitudeString,
//         lat: latitudeString,
//         hei: heightString,
//       });
//       floatingPoint = viewer.entities.add({
//         name: "多边形面积",
//         position: positions[positions.length - 1],
//         point: {
//           pixelSize: 3,
//           color: Color.RED,
//           outlineColor: Color.WHITE,
//           outlineWidth: 2,
//           heightReference: HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       this.measureIds.push(floatingPoint.id);
//     }, ScreenSpaceEventType.LEFT_CLICK);

//     this.handler.setInputAction(function (movement) {
//       this.handler.destroy();
//       positions.pop();
//       //tempPoints.pop();
//       // viewer.entities.remove(floatingPoint);
//       // tooltip.style.display = "none";
//       //在三维场景中添加点
//       // var cartographic = Cartographic.fromCartesian(positions[positions.length - 1]);
//       // var longitudeString = Math.toDegrees(cartographic.longitude);
//       // var latitudeString = Math.toDegrees(cartographic.latitude);
//       // var heightString = cartographic.height;
//       // tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});
//       let a = getArea(tempPoints);
//       if (a < 0.001) {
//         a = (a * 1000000).toFixed(4) + "平方米";
//       } else {
//         a = a.toFixed(4) + "平方公里";
//       }
//       const textArea = a;
//       const et = viewer.entities.add({
//         name: "多边形面积",
//         position: positions[positions.length - 1],
//         // point : {
//         //  pixelSize : 5,
//         //  color : Color.RED,
//         //  outlineColor : Color.WHITE,
//         //  outlineWidth : 2,
//         //  heightReference:HeightReference.CLAMP_TO_GROUND
//         // },
//         label: {
//           text: textArea,
//           font: "18px sans-serif",
//           fillColor: Color.CYAN,
//           style: LabelStyle.FILL_AND_OUTLINE,
//           outlineWidth: 2,
//           verticalOrigin: VerticalOrigin.BOTTOM,
//           pixelOffset: new Cartesian2(20, -40),
//           disableDepthTestDistance: Number.POSITIVE_INFINITY,
//           heightReference: HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       this.measureIds.push(et.id);
//       this.bMeasuring = false;
//       viewer.container.style.cursor = "";
//     }, ScreenSpaceEventType.RIGHT_CLICK);

//     const radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
//     const degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

//     //计算多边形面积
//     function getArea(points) {
//       let res = 0;
//       //拆分三角曲面

//       for (let i = 0; i < points.length - 2; i++) {
//         const j = (i + 1) % points.length;
//         const k = (i + 2) % points.length;
//         const totalAngle = Angle(points[i], points[j], points[k]);

//         const dis_temp1 = distance(positions[i], positions[j]);
//         const dis_temp2 = distance(positions[j], positions[k]);
//         res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
//       }
//       return res / 1000000.0;
//     }

//     /*角度*/
//     function Angle(p1, p2, p3) {
//       const bearing21 = Bearing(p2, p1);
//       const bearing23 = Bearing(p2, p3);
//       let angle = bearing21 - bearing23;
//       if (angle < 0) {
//         angle += 360;
//       }
//       return angle;
//     }
//     /*方向*/
//     function Bearing(from, to) {
//       const lat1 = from.lat * radiansPerDegree;
//       const lon1 = from.lon * radiansPerDegree;
//       const lat2 = to.lat * radiansPerDegree;
//       const lon2 = to.lon * radiansPerDegree;
//       let angle = -Math.atan2(
//         Math.sin(lon1 - lon2) * Math.cos(lat2),
//         Math.cos(lat1) * Math.sin(lat2) -
//           Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
//       );
//       if (angle < 0) {
//         angle += Math.PI * 2.0;
//       }
//       angle = angle * degreesPerRadian; //角度
//       return angle;
//     }

//     var PolygonPrimitive = (() => {
//       function _(positions) {
//         this.options = {
//           name: "多边形",
//           polygon: {
//             hierarchy: [],
//             // perPositionHeight : true,
//             material: Color.DARKTURQUOISE.withAlpha(0.4),
//             outlineColor: Color.CYAN.withAlpha(0.8),
//             // heightReference:20000
//           },
//         };

//         this.hierarchy = {
//           positions,
//         };
//         this._init();
//       }

//       _.prototype._init = () => {
//         const _self = this;
//         const _update = () => {
//           return _self.hierarchy;
//         };
//         //实时更新polygon.hierarchy
//         this.options.polygon.hierarchy = new CallbackProperty(_update, false);
//         const et = viewer.entities.add(this.options);
//         this.measureIds.push(et.id);
//       };

//       return _;
//     })();

//     function distance(point1, point2) {
//       const point1cartographic = Cartographic.fromCartesian(point1);
//       const point2cartographic = Cartographic.fromCartesian(point2);
//       /**根据经纬度计算出距离**/
//       const geodesic = new EllipsoidGeodesic();
//       geodesic.setEndPoints(point1cartographic, point2cartographic);
//       let s = geodesic.surfaceDistance;
//       //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
//       //返回两点之间的距离
//       s = Math.sqrt(
//         Math.pow(s, 2) +
//           Math.pow(point2cartographic.height - point1cartographic.height, 2)
//       );
//       return s;
//     }
//   }

//   //高度差
//   _altitude() {
//     const viewer = this.viewer;
//     const trianArr = [];
//     let distanceLineNum = 0;
//     let Line1, Line2;
//     let H;
//     let floatingPoint; //浮动点
//     this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
//     this.handler.setInputAction(function (movement) {
//       let cartesian = viewer.scene.pickPosition(movement.endPosition);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.endPosition);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
//       if (distanceLineNum === 1) {
//         const cartographic = Cartographic.fromCartesian(cartesian);
//         const lon = Math.toDegrees(cartographic.longitude);
//         const lat = Math.toDegrees(cartographic.latitude);
//         const MouseHeight = cartographic.height;
//         trianArr.length = 3;
//         trianArr.push(lon, lat, MouseHeight);
//         draw_Triangle();
//       }
//     }, ScreenSpaceEventType.MOUSE_MOVE);
//     this.handler.setInputAction(function (movement) {
//       let cartesian = viewer.scene.pickPosition(movement.position);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.position);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }

//       // var cartesian = viewer.scene.pickPosition(movement.position);
//       const cartographic = Cartographic.fromCartesian(cartesian);
//       const lon = Math.toDegrees(cartographic.longitude);
//       const lat = Math.toDegrees(cartographic.latitude);
//       const MouseHeight = cartographic.height;

//       floatingPoint = viewer.entities.add({
//         name: "多边形面积",
//         position: cartesian,
//         point: {
//           pixelSize: 3,
//           color: Color.RED,
//           outlineColor: Color.WHITE,
//           outlineWidth: 2,
//           heightReference: HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       this.measureIds.push(floatingPoint.id);

//       distanceLineNum++;
//       if (distanceLineNum === 1) {
//         trianArr.push(lon, lat, MouseHeight);
//       } else {
//         trianArr.length = 3;
//         trianArr.push(lon, lat, MouseHeight);
//         this.handler.destroy();
//         this.bMeasuring = false;
//         viewer.container.style.cursor = "";
//         draw_Triangle();
//       }
//     }, ScreenSpaceEventType.LEFT_CLICK);

//     this.handler.setInputAction(function (movement) {
//       this.handler.destroy();
//       this.bMeasuring = false;
//       viewer.container.style.cursor = "";
//     }, ScreenSpaceEventType.RIGHT_CLICK);

//     function draw_Triangle() {
//       if (defined(Line1)) {
//         //更新三角线
//         Line1.polyline.positions =
//           trianArr[5] > trianArr[2]
//             ? new Cartesian3.fromDegreesArrayHeights([
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[5],
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[2],
//               ])
//             : new Cartesian3.fromDegreesArrayHeights([
//                 trianArr[3],
//                 trianArr[4],
//                 trianArr[2],
//                 trianArr[3],
//                 trianArr[4],
//                 trianArr[5],
//               ]);
//         Line2.polyline.positions =
//           trianArr[5] > trianArr[2]
//             ? new Cartesian3.fromDegreesArrayHeights([
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[5],
//                 trianArr[3],
//                 trianArr[4],
//                 trianArr[5],
//               ])
//             : new Cartesian3.fromDegreesArrayHeights([
//                 trianArr[3],
//                 trianArr[4],
//                 trianArr[2],
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[2],
//               ]);

//         //高度
//         var height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
//         H.position =
//           trianArr[5] > trianArr[2]
//             ? Cartesian3.fromDegrees(
//                 trianArr[0],
//                 trianArr[1],
//                 (trianArr[2] + trianArr[5]) / 2
//               )
//             : Cartesian3.fromDegrees(
//                 trianArr[3],
//                 trianArr[4],
//                 (trianArr[2] + trianArr[5]) / 2
//               );
//         H.label.text = "高度差:" + height + "米";
//         return;
//       }
//       Line1 = viewer.entities.add({
//         name: "triangleLine",
//         polyline: {
//           positions:
//             trianArr[5] > trianArr[2]
//               ? new Cartesian3.fromDegreesArrayHeights([
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[5],
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[2],
//                 ])
//               : new Cartesian3.fromDegreesArrayHeights([
//                   trianArr[3],
//                   trianArr[4],
//                   trianArr[2],
//                   trianArr[3],
//                   trianArr[4],
//                   trianArr[5],
//                 ]),
//           arcType: ArcType.NONE,
//           width: 2,
//           material: new PolylineOutlineMaterialProperty({
//             color: Color.CHARTREUSE,
//           }),
//           depthFailMaterial: new PolylineOutlineMaterialProperty({
//             color: Color.RED,
//           }),
//         },
//       });
//       this.measureIds.push(Line1.id);
//       Line2 = viewer.entities.add({
//         name: "triangleLine",
//         polyline: {
//           positions:
//             trianArr[5] > trianArr[2]
//               ? new Cartesian3.fromDegreesArrayHeights([
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[5],
//                   trianArr[3],
//                   trianArr[4],
//                   trianArr[5],
//                 ])
//               : new Cartesian3.fromDegreesArrayHeights([
//                   trianArr[3],
//                   trianArr[4],
//                   trianArr[2],
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[2],
//                 ]),
//           arcType: ArcType.NONE,
//           width: 2,

//           // material: new PolylineOutlineMaterialProperty({
//           material: new PolylineDashMaterialProperty({
//             color: Color.CHARTREUSE,
//             // dashLength: 5,
//             // dashPattern: 10,
//             // gapColor:Color.YELLOW
//           }),
//           // depthFailMaterial: new PolylineOutlineMaterialProperty({
//           depthFailMaterial: new PolylineDashMaterialProperty({
//             color: Color.RED,
//           }),
//         },
//       });
//       this.measureIds.push(Line2.id);

//       // 空间
//       const lineDistance = Cartesian3.distance(
//         Cartesian3.fromDegrees(trianArr[0], trianArr[1]),
//         Cartesian3.fromDegrees(trianArr[3], trianArr[4])
//       ).toFixed(2);
//       //高度
//       var height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
//       H = viewer.entities.add({
//         name: "lineZ",
//         position:
//           trianArr[5] > trianArr[2]
//             ? Cartesian3.fromDegrees(
//                 trianArr[0],
//                 trianArr[1],
//                 (trianArr[2] + trianArr[5]) / 2
//               )
//             : Cartesian3.fromDegrees(
//                 trianArr[3],
//                 trianArr[4],
//                 (trianArr[2] + trianArr[5]) / 2
//               ),
//         label: {
//           text: "高度差:" + height + "米",
//           translucencyByDistance: new NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
//           font: "45px 楷体",
//           fillColor: Color.WHITE,
//           outlineColor: Color.BLACK,
//           style: LabelStyle.FILL_AND_OUTLINE,
//           outlineWidth: 3,
//           disableDepthTestDistance: Number.POSITIVE_INFINITY,
//           scale: 0.5,
//           pixelOffset: new Cartesian2(0, -10),
//           backgroundColor: new Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
//           backgroundPadding: new Cartesian2(10, 10),
//           verticalOrigin: VerticalOrigin.BOTTOM,
//         },
//       });
//       this.measureIds.push(H.id);
//     }
//   }

//   //三角测量
//   _Triangle() {
//     const viewer = this.viewer;
//     const trianArr = [];
//     let distanceLineNum = 0;
//     let XLine;
//     let X, Y, H;
//     let floatingPoint; //浮动点
//     this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
//     this.handler.setInputAction(function (movement) {
//       let cartesian = viewer.scene.pickPosition(movement.endPosition);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.endPosition);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
//       if (distanceLineNum === 1) {
//         const cartographic = Cartographic.fromCartesian(cartesian);
//         const lon = Math.toDegrees(cartographic.longitude);
//         const lat = Math.toDegrees(cartographic.latitude);
//         const MouseHeight = cartographic.height;
//         trianArr.length = 3;
//         trianArr.push(lon, lat, MouseHeight);
//         draw_Triangle();
//       }
//     }, ScreenSpaceEventType.MOUSE_MOVE);
//     this.handler.setInputAction(function (movement) {
//       let cartesian = viewer.scene.pickPosition(movement.position);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.position);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }

//       // var cartesian = viewer.scene.pickPosition(movement.position);
//       const cartographic = Cartographic.fromCartesian(cartesian);
//       const lon = Math.toDegrees(cartographic.longitude);
//       const lat = Math.toDegrees(cartographic.latitude);
//       const MouseHeight = cartographic.height;

//       floatingPoint = viewer.entities.add({
//         name: "多边形面积",
//         position: cartesian,
//         point: {
//           pixelSize: 3,
//           color: Color.RED,
//           outlineColor: Color.WHITE,
//           outlineWidth: 2,
//           heightReference: HeightReference.CLAMP_TO_GROUND,
//         },
//       });
//       this.measureIds.push(floatingPoint.id);

//       distanceLineNum++;
//       if (distanceLineNum === 1) {
//         trianArr.push(lon, lat, MouseHeight);
//       } else {
//         trianArr.length = 3;
//         trianArr.push(lon, lat, MouseHeight);
//         this.handler.destroy();
//         this.bMeasuring = false;
//         viewer.container.style.cursor = "";
//         draw_Triangle();
//       }
//     }, ScreenSpaceEventType.LEFT_CLICK);

//     this.handler.setInputAction(function (movement) {
//       this.handler.destroy();
//       this.bMeasuring = false;
//       viewer.container.style.cursor = "";
//     }, ScreenSpaceEventType.RIGHT_CLICK);

//     function draw_Triangle() {
//       if (defined(XLine)) {
//         //更新三角线
//         XLine.polyline.positions =
//           trianArr[5] > trianArr[2]
//             ? new Cartesian3.fromDegreesArrayHeights([
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[2],
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[5],
//                 trianArr[3],
//                 trianArr[4],
//                 trianArr[5],
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[2],
//               ])
//             : new Cartesian3.fromDegreesArrayHeights([
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[2],
//                 trianArr[3],
//                 trianArr[4],
//                 trianArr[5],
//                 trianArr[3],
//                 trianArr[4],
//                 trianArr[2],
//                 trianArr[0],
//                 trianArr[1],
//                 trianArr[2],
//               ]);

//         // 空间
//         var lineDistance = Cartesian3.distance(
//           Cartesian3.fromDegrees(trianArr[0], trianArr[1]),
//           Cartesian3.fromDegrees(trianArr[3], trianArr[4])
//         ).toFixed(2);
//         //高度
//         var height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
//         //直线距离
//         var strLine = Math.sqrt(
//           Math.pow(lineDistance, 2) + Math.pow(height, 2)
//         ).toFixed(2);

//         X.position = Cartesian3.fromDegrees(
//           (trianArr[0] + trianArr[3]) / 2,
//           (trianArr[1] + trianArr[4]) / 2,
//           Math.max(trianArr[2], trianArr[5])
//         );
//         H.position =
//           trianArr[5] > trianArr[2]
//             ? Cartesian3.fromDegrees(
//                 trianArr[0],
//                 trianArr[1],
//                 (trianArr[2] + trianArr[5]) / 2
//               )
//             : Cartesian3.fromDegrees(
//                 trianArr[3],
//                 trianArr[4],
//                 (trianArr[2] + trianArr[5]) / 2
//               );
//         Y.position = Cartesian3.fromDegrees(
//           (trianArr[0] + trianArr[3]) / 2,
//           (trianArr[1] + trianArr[4]) / 2,
//           (trianArr[2] + trianArr[5]) / 2
//         );
//         X.label.text = "水平距离:" + lineDistance + "米";
//         H.label.text = "高度差:" + height + "米";
//         Y.label.text = "空间距离:" + strLine + "米";
//         return;
//       }
//       XLine = viewer.entities.add({
//         name: "triangleLine",
//         polyline: {
//           positions:
//             trianArr[5] > trianArr[2]
//               ? new Cartesian3.fromDegreesArrayHeights([
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[2],
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[5],
//                   trianArr[3],
//                   trianArr[4],
//                   trianArr[5],
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[2],
//                 ])
//               : new Cartesian3.fromDegreesArrayHeights([
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[2],
//                   trianArr[3],
//                   trianArr[4],
//                   trianArr[5],
//                   trianArr[3],
//                   trianArr[4],
//                   trianArr[2],
//                   trianArr[0],
//                   trianArr[1],
//                   trianArr[2],
//                 ]),
//           arcType: ArcType.NONE,
//           width: 2,
//           material: new PolylineOutlineMaterialProperty({
//             color: Color.YELLOW,
//           }),
//           depthFailMaterial: new PolylineOutlineMaterialProperty({
//             color: Color.RED,
//           }),
//         },
//       });
//       this.measureIds.push(XLine.id);

//       // 空间
//       var lineDistance = Cartesian3.distance(
//         Cartesian3.fromDegrees(trianArr[0], trianArr[1]),
//         Cartesian3.fromDegrees(trianArr[3], trianArr[4])
//       ).toFixed(2);
//       //高度
//       var height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
//       //直线距离
//       var strLine = Math.sqrt(
//         Math.pow(lineDistance, 2) + Math.pow(height, 2)
//       ).toFixed(2);
//       X = viewer.entities.add({
//         name: "lineX",
//         position: Cartesian3.fromDegrees(
//           (trianArr[0] + trianArr[3]) / 2,
//           (trianArr[1] + trianArr[4]) / 2,
//           Math.max(trianArr[2], trianArr[5])
//         ),
//         label: {
//           text: "水平距离:" + lineDistance + "米",
//           translucencyByDistance: new NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
//           font: "45px 楷体",
//           fillColor: Color.WHITE,
//           outlineColor: Color.BLACK,
//           style: LabelStyle.FILL_AND_OUTLINE,
//           outlineWidth: 3,
//           disableDepthTestDistance: Number.POSITIVE_INFINITY,
//           scale: 0.5,
//           pixelOffset: new Cartesian2(0, -10),
//           backgroundColor: new Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
//           backgroundPadding: new Cartesian2(10, 10),
//           verticalOrigin: VerticalOrigin.BOTTOM,
//         },
//       });
//       this.measureIds.push(X.id);
//       H = viewer.entities.add({
//         name: "lineZ",
//         position:
//           trianArr[5] > trianArr[2]
//             ? Cartesian3.fromDegrees(
//                 trianArr[0],
//                 trianArr[1],
//                 (trianArr[2] + trianArr[5]) / 2
//               )
//             : Cartesian3.fromDegrees(
//                 trianArr[3],
//                 trianArr[4],
//                 (trianArr[2] + trianArr[5]) / 2
//               ),
//         label: {
//           text: "高度差:" + height + "米",
//           translucencyByDistance: new NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
//           font: "45px 楷体",
//           fillColor: Color.WHITE,
//           outlineColor: Color.BLACK,
//           style: LabelStyle.FILL_AND_OUTLINE,
//           outlineWidth: 3,
//           disableDepthTestDistance: Number.POSITIVE_INFINITY,
//           scale: 0.5,
//           pixelOffset: new Cartesian2(0, -10),
//           backgroundColor: new Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
//           backgroundPadding: new Cartesian2(10, 10),
//           verticalOrigin: VerticalOrigin.BOTTOM,
//         },
//       });
//       this.measureIds.push(H.id);
//       Y = viewer.entities.add({
//         name: "lineY",
//         position: Cartesian3.fromDegrees(
//           (trianArr[0] + trianArr[3]) / 2,
//           (trianArr[1] + trianArr[4]) / 2,
//           (trianArr[2] + trianArr[5]) / 2
//         ),
//         label: {
//           text: "空间距离:" + strLine + "米",
//           translucencyByDistance: new NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
//           font: "45px 楷体",
//           fillColor: Color.WHITE,
//           outlineColor: Color.BLACK,
//           style: LabelStyle.FILL_AND_OUTLINE,
//           outlineWidth: 3,
//           disableDepthTestDistance: Number.POSITIVE_INFINITY,
//           scale: 0.5,
//           pixelOffset: new Cartesian2(0, -10),
//           backgroundColor: new Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
//           backgroundPadding: new Cartesian2(10, 10),
//           verticalOrigin: VerticalOrigin.BOTTOM,
//         },
//       });
//       this.measureIds.push(Y.id);
//     }
//   }

//   //方位角
//   _measureAngle() {
//     const viewer = this.viewer;
//     const pArr = [];
//     let distanceLineNum = 0;
//     let Line1;
//     let Line2;
//     let angleT;
//     let floatingPoint; //浮动点
//     this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
//     this.handler.setInputAction(function (movement) {
//       let cartesian = viewer.scene.pickPosition(movement.endPosition);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.endPosition);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
//       if (distanceLineNum === 1) {
//         pArr.length = 1;
//         pArr.push(cartesian);
//         draw_Angle();
//       }
//     }, ScreenSpaceEventType.MOUSE_MOVE);
//     this.handler.setInputAction(function (movement) {
//       let cartesian = viewer.scene.pickPosition(movement.position);
//       if (!defined(cartesian)) {
//         const ray = viewer.camera.getPickRay(movement.position);
//         cartesian = viewer.scene.globe.pick(ray, viewer.scene);
//       }
//       // var cartesian = viewer.scene.pickPosition(movement.position);

//       distanceLineNum++;
//       if (distanceLineNum === 1) {
//         pArr.push(cartesian);
//         floatingPoint = viewer.entities.add({
//           name: "方位角",
//           position: cartesian,
//           point: {
//             pixelSize: 3,
//             color: Color.RED,
//             outlineColor: Color.WHITE,
//             outlineWidth: 2,
//             heightReference: HeightReference.CLAMP_TO_GROUND,
//           },
//         });
//         this.measureIds.push(floatingPoint.id);
//       } else {
//         pArr.length = 1;
//         pArr.push(cartesian);
//         this.handler.destroy();
//         this.bMeasuring = false;
//         viewer.container.style.cursor = "";
//         draw_Angle();
//       }
//     }, ScreenSpaceEventType.LEFT_CLICK);

//     this.handler.setInputAction(function (movement) {
//       this.handler.destroy();
//       this.bMeasuring = false;
//       viewer.container.style.cursor = "";
//     }, ScreenSpaceEventType.RIGHT_CLICK);

//     function draw_Angle() {
//       // 空间
//       const cartographic1 = Cartographic.fromCartesian(pArr[0]);
//       const lon1 = Math.toDegrees(cartographic1.longitude);
//       const lat1 = Math.toDegrees(cartographic1.latitude);
//       const cartographic2 = Cartographic.fromCartesian(pArr[1]);
//       const lon2 = Math.toDegrees(cartographic2.longitude);
//       const lat2 = Math.toDegrees(cartographic2.latitude);
//       const lineDistance = Cartesian3.distance(
//         Cartesian3.fromDegrees(lon1, lat1),
//         Cartesian3.fromDegrees(lon2, lat2)
//       );
//       const localToWorld_Matrix = Transforms.eastNorthUpToFixedFrame(
//         Cartesian3.fromDegrees(lon1, lat1)
//       );
//       const NorthPoint = Cartographic.fromCartesian(
//         Matrix4.multiplyByPoint(
//           localToWorld_Matrix,
//           Cartesian3.fromElements(0, lineDistance, 0),
//           new Cartesian3()
//         )
//       );
//       const npLon = Math.toDegrees(NorthPoint.longitude);
//       const npLat = Math.toDegrees(NorthPoint.latitude);
//       // var angle = Cartesian3.angleBetween(Cartesian3.fromDegrees(lon1, lat1),
//       //     Cartesian3.fromDegrees(lon2, lat2));
//       const angle = courseAngle(lon1, lat1, lon2, lat2);
//       let textDisance = lineDistance.toFixed(2) + "米";
//       if (lineDistance > 1000) {
//         textDisance = (lineDistance / 1000).toFixed(3) + "千米";
//       }
//       if (defined(Line1)) {
//         //更新线
//         Line1.polyline.positions = new Cartesian3.fromDegreesArray([
//           lon1,
//           lat1,
//           npLon,
//           npLat,
//         ]);
//         Line2.polyline.positions = new Cartesian3.fromDegreesArray([
//           lon1,
//           lat1,
//           lon2,
//           lat2,
//         ]);
//         angleT.label.text = "角度:" + angle + "°\n距离:" + textDisance;
//         angleT.position = pArr[1];
//         return;
//       }
//       //北方线
//       Line1 = viewer.entities.add({
//         name: "Angle1",
//         polyline: {
//           positions: new Cartesian3.fromDegreesArray([
//             lon1,
//             lat1,
//             npLon,
//             npLat,
//           ]),
//           width: 3,
//           material: new PolylineDashMaterialProperty({
//             color: Color.RED,
//           }),
//           clampToGround: true,
//         },
//       });
//       this.measureIds.push(Line1.id);
//       //线
//       Line2 = viewer.entities.add({
//         name: "Angle2",
//         polyline: {
//           positions: new Cartesian3.fromDegreesArray([lon1, lat1, lon2, lat2]),
//           width: 10,
//           material: new PolylineArrowMaterialProperty(Color.YELLOW),
//           clampToGround: true,
//         },
//       });
//       this.measureIds.push(Line2.id);

//       //文字
//       angleT = viewer.entities.add({
//         name: "AngleT",
//         position: pArr[1],
//         label: {
//           text: "角度:" + angle + "°\n距离:" + textDisance,
//           translucencyByDistance: new NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
//           font: "45px 楷体",
//           fillColor: Color.WHITE,
//           outlineColor: Color.BLACK,
//           style: LabelStyle.FILL_AND_OUTLINE,
//           outlineWidth: 4,
//           scale: 0.5,
//           pixelOffset: new Cartesian2(0, -40),
//           disableDepthTestDistance: Number.POSITIVE_INFINITY,
//           backgroundColor: new Color.fromCssColorString("rgba(0, 0, 0, 1)"),
//           backgroundPadding: new Cartesian2(10, 10),
//           verticalOrigin: VerticalOrigin.BASELINE,
//         },
//       });
//       this.measureIds.push(angleT.id);
//     }

//     function courseAngle(lng_a, lat_a, lng_b, lat_b) {
//       /////////////方法
//       let dRotateAngle = Math.atan2(
//         Math.abs(lng_a - lng_b),
//         Math.abs(lat_a - lat_b)
//       );
//       if (lng_b >= lng_a) {
//         if (lat_b >= lat_a) {
//         } else {
//           dRotateAngle = Math.PI - dRotateAngle;
//         }
//       } else {
//         if (lat_b >= lat_a) {
//           dRotateAngle = 2 * Math.PI - dRotateAngle;
//         } else {
//           dRotateAngle = Math.PI + dRotateAngle;
//         }
//       }
//       dRotateAngle = (dRotateAngle * 180) / Math.PI;
//       return parseInt(dRotateAngle * 100) / 100;

//       /////方法
//       // //以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
//       // var localToWorld_Matrix = Transforms.eastNorthUpToFixedFrame(new Cartesian3.fromDegrees(lng_a, lat_a));
//       // //求世界坐标到局部坐标的变换矩阵
//       // var worldToLocal_Matrix = Matrix4.inverse(localToWorld_Matrix, new Matrix4());
//       // //a点在局部坐标的位置，其实就是局部坐标原点
//       // var localPosition_A = Matrix4.multiplyByPoint(worldToLocal_Matrix, new Cartesian3.fromDegrees(lng_a, lat_a), new Cartesian3());
//       // //B点在以A点为原点的局部的坐标位置
//       // var localPosition_B = Matrix4.multiplyByPoint(worldToLocal_Matrix, new Cartesian3.fromDegrees(lng_b, lat_b), new Cartesian3());
//       // //弧度
//       // var angle = Math.atan2((localPosition_B.y - localPosition_A.y), (localPosition_B.x - localPosition_A.x))
//       // //角度
//       // var theta = angle * (180 / Math.PI);
//       // if (theta < 0) {
//       //     theta = theta + 360;
//       // }
//       // return theta.toFixed(2);
//     }
//   }
// }
