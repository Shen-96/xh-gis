// /*
//  * @Descripttion:
//  * @Author: EV-申小虎
//  * @version: 1.0.0
//  * @Date: 2020-11-11 11:30:13
//  * @LastEditors: EV-申小虎
//  * @LastEditTime: 2023-11-02 11:17:16
//  */

// import {
//   Ion,
//   Cartesian2,
//   Cartesian3,
//   Entity,
//   Ray,
//   Viewer,
//   WebMapTileServiceImageryProvider,
//   CallbackProperty,
//   ImageMaterialProperty,
//   Color,
//   CustomDataSource,
//   Math as CesiumMath,
//   defined,
//   Cartographic,
//   createGuid,
//   sampleTerrain,
//   HeadingPitchRoll,
//   SkyBox,
//   Rectangle,
//   ScreenSpaceEventType,
//   SingleTileImageryProvider,
//   SkyAtmosphere,
//   Sun
// } from 'cesium';
// import {
//   SceneListenerType,
//   SceneListenerManager,
//   MathUtils,
//   MouseHandlerManager,
//   ParticleManager,
//   LayerManager,
//   Geographic,
//   AnimationManager,
//   SpatialAnalysis,
//   GraphicManager,
//   SpecialEffectManager,
//   TimeManager,
//   WeatherManager,
//   RoamManager
// } from '..';
// // import SuperGif from 'libgif';
// import GlobeBG from '../Assets/globeBG.jpg';
// import SkyBoxPX from '../Assets/SkyBox/skybox_px.jpg';
// import SkyBoxNX from '../Assets/SkyBox/skybox_nx.jpg';
// import SkyBoxPY from '../Assets/SkyBox/skybox_py.jpg';
// import SkyBoxNY from '../Assets/SkyBox/skybox_ny.jpg';
// import SkyBoxPZ from '../Assets/SkyBox/skybox_pz.jpg';
// import SkyBoxNZ from '../Assets/SkyBox/skybox_nz.jpg';

// /**
//  * 圆形画布
//  */
// interface ICanvasCircle {
//   color: Color;
//   blur?: Color;
//   lineWidth?: number;
// }

// /**
//  * 圆形材质带坐标
//  */
// export interface ICircleWithPosition extends ICanvasCircle {
//   gcs: Geographic;
// }

// /// token
// Ion.defaultAccessToken =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNTg2OTNhYi1hM2JmLTQyYTItOWE1NS0wMzNjMzAyZDI3NGYiLCJpZCI6MjU5MTAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODY4MzI4NDV9.2DP9UQowHfxa656C1UZT7vVvMk39xJSPTL83-Ce-Ypg';
// // Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMTYxYjE3Zi0yM2ZjLTQzOTUtOTUyZS0wNGRlYTI0NzZkNWEiLCJpZCI6MjU5LCJpYXQiOjE2MjI1Nzc1NzF9.wBdlWsqCoHM9tpplqxAPCdQWsERtxJc65IFZRf4g0z4';

// let viewerOptions: Viewer.ConstructorOptions = {
//   animation: false, /// 是否创建动画小器件，左下角仪表，默认为true
//   baseLayerPicker: false, /// 是否显示图层选择器，默认为true
//   fullscreenButton: false, /// 是否显示全屏按钮，默认为true
//   //vrButton: true, /// 是否显示VR按钮，默认false
//   geocoder: false, /// 是否显示geocoder小器件，右上角查询按钮，默认为true
//   homeButton: false, /// 是否显示Home按钮，默认为true
//   infoBox: false, /// 是否显示信息框，默认为true
//   sceneModePicker: false, /// 是否显示3D/2D选择器，默认为true
//   //selectionIndicator: false, /// 是否显示选取指示器组件，默认为true
//   timeline: false, /// 是否显示时间轴，默认为true
//   navigationHelpButton: false, /// 是否显示右上角的帮助按钮，默认为true
//   navigationInstructionsInitiallyVisible: false, /// 是否导航说明初始可见，默认为true
//   //scene3DOnly: true, /// 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源，默认false
//   shouldAnimate: true, /// 是否开始时间动画，默认为true
//   /// 如果为true，如果出现渲染循环错误，此小部件将自动向用户显示包含错误的HTML面板
//   //   showRenderLoopErrors: true,
//   /// 天空盒纹理
//   skyBox: new SkyBox({
//     sources: {
//       positiveX: SkyBoxPX,
//       negativeX: SkyBoxNX,
//       positiveY: SkyBoxPY,
//       negativeY: SkyBoxNY,
//       positiveZ: SkyBoxPZ,
//       negativeZ: SkyBoxNZ
//     },
//     show: true
//   }),
//   skyAtmosphere: new SkyAtmosphere(), /// 大气层
//   automaticallyTrackDataSourceClocks: false, /// 自动追踪最近添加的数据源的时钟设置，默认为true
//   // useDefaultRenderLoop: false,/// 默认为true，如果不需要控制渲染循环，则设为false
//   // requestRenderMode: false, /// 减少Cesium渲染新帧的总时间并减少Cesium在应用程序中的总体CPU使用率，默认为false
//   // maximumRenderTimeChange: 2, /// 如果场景中的元素没有随仿真时间变化，请考虑将设置maximumRenderTimeChange为较高的值，例如Infinity，默认为0.0
//   // contextOptions: {
//   //     requestWebgl2: true, /// 使用webgl2.0
//   // },
//   // msaaSamples: 4, /// 使用msaa采样算法，提高渲染效果，需要更高性能
//   // terrainProvider: Cesium.createWorldTerrain(),
//   imageryProvider: new SingleTileImageryProvider({
//     url: GlobeBG,
//     rectangle: Rectangle.MAX_VALUE
//   })
// };

// /**
//  * @descripttion: 定制化视图
//  * @author: EV-申小虎
//  */
// export default class CustomViewer {
//   /// 视图对象
//   readonly viewer: Viewer;
//   /// 时间管理器
//   readonly timeManager: PartialPrivate<TimeManager>;
//   /// 图层记录管理器
//   readonly layerManager: PartialPrivate<LayerManager>;
//   /// 风力天气管理器
//   readonly weatherManager: PartialPrivate<WeatherManager>;
//   /// 粒子管理器
//   readonly particleManager: PartialPrivate<ParticleManager>;
//   /// 漫游工具
//   readonly roamManager: PartialPrivate<RoamManager>;
//   /// 鼠标事件管理器
//   readonly mouseHandlerManager: PartialPrivate<MouseHandlerManager>;
//   /// 场景事件管理器
//   readonly sceneListenerManager: PartialPrivate<SceneListenerManager>;
//   /// 动画管理器
//   readonly animationManager: PartialPrivate<AnimationManager>;
//   /// 绘画管理器
//   readonly graphicManager: PartialPrivate<GraphicManager>;
//   /// 空间分析
//   readonly spatialAnalysis: PartialPrivate<SpatialAnalysis>;
//   /// 特效管理器
//   readonly specialEffectManager: PartialPrivate<SpecialEffectManager>;

//   /**
//    * @descripttion: 初始化参数
//    * @param {Document} container 容器
//    * @param {Object} layerLevel 图层级别
//    * @param {String} hostUrl 用户地址
//    * @param {Object} viewerOptions 视图参数
//    * @return {type} 球
//    */
//   constructor(
//     container: string | Element,
//     viewerOptions: Viewer.ConstructorOptions | undefined = undefined
//   ) {
//     this.viewer = this.#initViewer(container, viewerOptions);
//     this.timeManager = new TimeManager(this.viewer); /// 时间管理器
//     this.layerManager = new LayerManager(this.viewer); /// 图层记录管理器
//     this.weatherManager = new WeatherManager(this.viewer); /// 天气管理器
//     this.particleManager = new ParticleManager(this.viewer); /// 粒子管理器
//     this.roamManager = new RoamManager(this.viewer); /// 漫游工具
//     this.mouseHandlerManager = new MouseHandlerManager(this.viewer); /// 鼠标事件管理器
//     this.sceneListenerManager = new SceneListenerManager(this.viewer);
//     this.animationManager = new AnimationManager(
//       this.viewer,
//       this.roamManager,
//       this.particleManager,
//       this.weatherManager
//     ); /// 动画管理器
//     this.graphicManager = new GraphicManager(
//       this.viewer,
//       this.mouseHandlerManager
//     ); /// 绘图管理器
//     this.spatialAnalysis = new SpatialAnalysis(this.viewer, this.graphicManager); /// 空间分析
//     this.specialEffectManager = new SpecialEffectManager(
//       this.viewer,
//       this.layerManager
//     ); /// 特效管理器
//   }

//   /**
//    * @descripttion: cesium视图初始化
//    * @param {Viewer.ConstructorOptions} options
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   #initViewer(
//     container: Element | string,
//     options?: Viewer.ConstructorOptions
//   ): Viewer {
//     options && (viewerOptions = { ...viewerOptions, ...options });

//     const viewer = new Viewer(container, viewerOptions);

//     /// 设置图像渲染像素化处理
//     viewer.resolutionScale = window.devicePixelRatio;

//     /// 去锯齿
//     viewer.scene.postProcessStages.fxaa.enabled = true;

//     /// 移除鼠标右键监听事件
//     viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
//       ScreenSpaceEventType.LEFT_DOUBLE_CLICK
//     );

//     //设置相机视野框改变幅度触发相机改变事件
//     viewer.scene.camera.percentageChanged = 0.1;

//     /// 显示太阳
//     viewer.scene.sun = new Sun();

//     /// 开启近地光照
//     viewer.scene.globe.enableLighting = true;

//     //dem调试模式
//     // viewer.extend(Cesium.viewerCesiumInspectorMixin);

//     /// 隐藏版权声明
//     viewer.cesiumWidget.creditContainer.remove();

//     return viewer;
//   }

//   /**
//    * @descripttion: 初始化视图框
//    * @param {callback} callback 返回值
//    * @return {void}
//    * @author: EV-申小虎
//    */
//   initFullExtend(
//     position: Cartesian3 = Cartesian3.fromDegrees(
//       107.7004,
//       35.5588,
//       17894750.737236
//     ),
//     callback?: (res: boolean) => void
//   ) {
//     /// 17894750
//     this.viewer.camera.flyTo({
//       destination: position,
//       duration: 5,
//       easingFunction: time => time * (2 - time),
//       complete: () => {
//         callback && callback(true);
//       }
//     });
//   }

//   /**
//    * @descripttion: 获取当前层级
//    * @param {Viewer} viewer
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   getCurrentLevel(viewer: Viewer) {
//     const height = Math.ceil(viewer.camera.positionCartographic.height),
//       A = 40487.57,
//       B = 0.00007096758,
//       C = 91610.74,
//       D = -40467.74;
//     return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)));
//   }

//   /**
//    * @descripttion: 根据层级获取地形高程
//    * @param {Cartesian3} car3 笛卡尔坐标
//    * @param {number} level 层级
//    * @return {Promise} 回调
//    * @author: EV-申小虎
//    */
//   getTerrainHeightByLevel(
//     viewer: Viewer,
//     longitude: number,
//     latitude: number,
//     level: number
//   ) {
//     const cartographic = Cartographic.fromDegrees(longitude, latitude),
//       cartographics: Cartographic[] = [cartographic],
//       promise = sampleTerrain(
//         viewer.scene.terrainProvider,
//         level,
//         cartographics
//       );
//     return promise;
//   }

//   /**
//    * 获取当前视野中心位置
//    * @return {Object} 位置信息
//    */
//   getCameraGeographic() {
//     /// 获取相机地理坐标
//     const cartographic = this.viewer.camera.positionCartographic.clone(),
//       lon = CesiumMath.toDegrees(cartographic.longitude ?? 0),
//       lat = CesiumMath.toDegrees(cartographic.latitude ?? 0),
//       height = cartographic.height ?? 0,
//       gcs = new Geographic(lon, lat, height);

//     return gcs;
//   }

//   /**
//    * @descripttion: 获取相机当前朝向
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   getCameraOrientation() {
//     /// 相机参数
//     const roll = this.viewer.camera.roll ?? 0,
//       heading = this.viewer.camera.heading ?? 0,
//       pitch = this.viewer.camera.pitch ?? 0,
//       orientation = new HeadingPitchRoll(heading, pitch, roll);

//     return orientation;
//   }

//   /**
//    * @descripttion: 获取相机当前朝向(度)
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   getCameraOrientationInDeg() {
//     /// 相机参数
//     const roll = this.viewer.camera.roll ?? 0,
//       heading = this.viewer.camera.heading ?? 0,
//       pitch = this.viewer.camera.pitch ?? 0;

//     return {
//       heading: CesiumMath.toDegrees(heading),
//       pitch: CesiumMath.toDegrees(pitch),
//       roll: CesiumMath.toDegrees(roll)
//     };
//   }

//   /**
//    * @descripttion: 获取相机视点位置
//    * @param {*} viewer cesium视图
//    * @return {Cartesian3} 视点
//    * @author: EV-申小虎
//    */
//   getViewPosition(viewer: Viewer) {
//     //相机方向
//     const direction = viewer.camera.direction.clone(),
//       //相机中心点
//       center = viewer.camera.position.clone(),
//       //以相机中心点、相机方向创建射线
//       cameraRay = new Ray(center, direction),
//       //射线与地球场景交点
//       result = viewer.scene.globe.pick(cameraRay, viewer.scene);

//     return result;
//   }

//   /**--------------------------------------------------------
//    * --------------------------渲染-------------------------
//    * -------------------------------------------------------
//    */

//   /**
//    * @descripttion: 绘制圆形(带阴影)图片
//    * @param {number} radius 半径
//    * @param {Color} color 颜色
//    * @param {boolean} reverse 是否反向
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   drawCircleImage(
//     radius: number,
//     color: Color,
//     blur?: Color,
//     lineWidth?: number,
//     reverse = false
//   ) {
//     const width = radius * 2,
//       colorCss = color.toCssColorString(),
//       blurCss = blur
//         ? blur.toCssColorString()
//         : lineWidth
//           ? Color.TRANSPARENT.toCssColorString()
//           : color.withAlpha(0.2).toCssColorString();

//     // 创建画布
//     const canvas = document.createElement('canvas');
//     canvas.width = width;
//     canvas.height = width;

//     // 填充画布内容
//     const ctx = canvas.getContext('2d')!;

//     // 开始画圆
//     ctx.beginPath();
//     ctx.arc(radius, radius, radius, 0, 360 * Math.PI);
//     ctx.closePath();

//     // 创建渐变
//     const grd = ctx.createRadialGradient(
//       radius,
//       radius,
//       lineWidth ? radius - lineWidth : radius / 2,
//       radius,
//       radius,
//       radius
//     );
//     if (reverse) {
//       grd.addColorStop(0, colorCss);
//       grd.addColorStop(1, blurCss);
//     } else {
//       grd.addColorStop(0, blurCss);
//       grd.addColorStop(1, colorCss);
//     }

//     // 填充样式
//     ctx.fillStyle = grd;
//     ctx.fill();

//     return canvas;
//   }

//   /**
//    * @descripttion: 渲染帧数组
//    * @param {string} url gif地址
//    * @param {string} frames 帧数组
//    * @param {number} interval 时间周期(毫秒)
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   async drawImagefromGIF(url: string) {
//     // let index = 0;
//     const frames: string[] = [];

//     await (function createFramesFromGIF(imageArr: string[]) {
//       // 创建图片元素
//       const img = document.createElement('img');
//       img.src = url;
//       // gif库需要img标签配置下面两个属性
//       img.setAttribute('rel:animated_src', url);
//       img.setAttribute('rel:auto_play', '0');
//       document.body.appendChild(img);
//       // 新建gif实例
//       const rub = new SuperGif({ gif: img });
//       return new Promise(resolve => {
//         rub.load(() => {
//           for (let i = 1; i <= rub.get_length(); i++) {
//             // 遍历gif实例的每一帧
//             rub.move_to(i);
//             const frameCvs = <HTMLCanvasElement>rub.get_canvas();
//             imageArr.push(frameCvs.toDataURL('image/png'));
//           }
//           // document.body.removeChild(img);
//           resolve(imageArr);
//         });
//       });
//     })(frames);

//     // return new CallbackProperty(() => {
//     //     if (frames.length) {
//     //         if (index < frames.length - 1) {
//     //             index += 500 / interval;
//     //         } else {
//     //             index = 0;
//     //         }
//     //         return frames[Math.floor(index)];
//     //     }
//     //     return url; //因为loadGif是异步的，在解析完成之前先使用原图
//     // }, false);

//     return frames;
//   }

//   /**
//    * @descripttion: 渲染图片带居中文字
//    * @param {string} url
//    * @param {string} text
//    * @param {Color} fontColor
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   drawTextImagefromImg(url: string, text: string, fontColor: Color) {
//     const img = new Image();
//     img.src = url;
//     // 创建画布
//     const canvas = document.createElement('canvas');
//     img.onload = () => {
//       //图片加载完成，才可处理
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext('2d');
//       ctx!.fillStyle = 'rgba(255, 255, 255, 0)';
//       ctx!.fillRect(0, 0, canvas.width, canvas.height);
//       ctx!.drawImage(img, 0, 0);
//       ctx!.save();
//       ctx!.font = text + 'px Arial';
//       ctx!.textBaseline = 'middle'; //更改字号后，必须重置对齐方式，否则居中麻烦。设置文本的垂直对齐方式
//       ctx!.textAlign = 'center';
//       // let tw = ctx!.measureText(text).width;
//       const ftop = canvas.height / 2 - 5;
//       const fleft = canvas.width / 2;
//       //cxt.fillStyle="#ff0000";
//       //cxt.fillRect(fleft-tw/2,ftop-fsz/2,tw,fsz);//矩形在画布居中方式
//       //cxt.fillStyle="#ffffff";
//       ctx!.fillText(text, fleft, ftop); //文本元素在画布居中方式
//       ctx!.strokeStyle = fontColor.toCssColorString();
//       ctx!.strokeText(text, fleft, ftop); //文字边框
//     };
//     return canvas;
//   }

//   /**
//    * @descripttion: 根据序列帧渲染图片
//    * @param {string} frames 序列帧
//    * @param {number} interval 周期
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   drawImagefromSequenceFrame(frames: string[], interval = 5000) {
//     let index = 0;
//     const image = new CallbackProperty(() => {
//       if (frames.length) {
//         if (index < frames.length - 1) {
//           index += 500 / interval;
//         } else {
//           index = 0;
//         }
//         return frames[Math.floor(index)];
//       } else {
//         return frames[0]; //因为loadGif是异步的，在解析完成之前先使用原图
//       }
//     }, false);
//     return image;
//   }

//   /**
//    * @descripttion: 创建pop元素
//    * @param {string} id 元素id
//    * @param {object} style 元素样式
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   createPopupElement(
//     id: string,
//     style: { backgroundImage: string; width?: number; height?: number },
//     title = '',
//     content?: HTMLElement
//   ) {
//     /// 判断是否已存在该id元素
//     const htmlElement = document.getElementById(id);
//     if (htmlElement || !id) return;
//     /// 创建div
//     const popDiv = document.createElement('div'),
//       popBefore = document.createElement('div');
//     /// 标牌id
//     popDiv.id = id;
//     /// 标牌样式
//     //// flex布局
//     popDiv.style.display = 'block';
//     // popDiv.style.alignItems = 'center';
//     // popDiv.style.justifyContent = 'center';
//     // popDiv.style.alignContent = 'center';
//     //// 自动换行
//     popDiv.style.flexWrap = 'warp';
//     popDiv.style.wordBreak = 'normal';
//     //// 绝对定位
//     popDiv.style.position = 'absolute';
//     popDiv.style.zIndex = '2';
//     popDiv.style.width = `${style.width || 300}px`;
//     // popDiv.style.minWidth = `50px`;
//     popDiv.style.height = `${style.height || 200}px`;
//     // popDiv.style.minHeight = `30px`;
//     popDiv.style.backgroundImage = `url(${style.backgroundImage})`;
//     popDiv.style.backgroundRepeat = 'no-repeat';
//     popDiv.style.backgroundSize = '100% 100%';
//     // popDiv.innerText = title;
//     popDiv.style.textAlign = 'center';
//     popDiv.style.fontSize = '0.2667rem';
//     popDiv.style.color = 'white';

//     /// before元素样式
//     //// 布局
//     popBefore.style.display = 'block';
//     popBefore.style.width = '0';
//     popBefore.style.borderWidth = '15px 8px 8px 8px';
//     popBefore.style.borderStyle = 'solid';
//     popBefore.style.borderColor =
//       'rgba(23, 107, 145, 0.7) transparent transparent transparent';
//     popBefore.style.position = 'absolute';
//     popBefore.style.transform = 'translateX(-50%)';
//     popBefore.style.left = '50%';
//     popBefore.style.top = '100%';

//     /// 标题
//     if (title) {
//       const header = document.createElement('p');
//       header.innerText = title;
//       /// 向标牌中插入标题
//       popDiv.appendChild(header);
//     }

//     /// 标牌内容
//     content && popDiv.appendChild(content);
//     /// 向标牌中插入before
//     popDiv.appendChild(popBefore);
//     /// 向body中添加元素
//     document.body.appendChild(popDiv);

//     return popDiv;
//   }

//   /**
//    * @descripttion: 渲染元素到球上
//    * @param {Viewer} viewer 视图
//    * @param {HTMLDivElement} elementOrId 元素或者元素ID
//    * @param {Cartesian3} position 位置
//    * @param {Cartesian2} offset 偏移量
//    * @param {number} visualDistance
//    * @return {*} 监听索引
//    * @author: EV-申小虎
//    */
//   renderElement2Scene(
//     viewer: Viewer,
//     elementOrId: HTMLDivElement | string,
//     position: Cartesian3,
//     offset: Cartesian2 = new Cartesian2(-41, 0),
//     visualDistance = 1500
//   ) {
//     /// 元素
//     const htmlOverlay =
//       elementOrId instanceof HTMLDivElement
//         ? elementOrId
//         : document.getElementById(elementOrId);

//     /// 判断元素有效
//     if (!htmlOverlay || !htmlOverlay.id) {
//       console.log(Error('无有效元素或元素无有效ID'));
//       return;
//     }
//     /// 创建监听方法
//     const listener = () => {
//       /// 获取相机位置
//       const canvasPosition =
//           viewer.scene.cartesianToCanvasCoordinates(position),
//         /// 相机与业务点距离
//         distance = Cartesian3.distance(
//           viewer.camera.position.clone(),
//           position
//         );
//       /// 修改元素位置
//       if (defined(canvasPosition) && htmlOverlay) {
//         const top = Number(
//           (canvasPosition.y - htmlOverlay.offsetHeight + offset.x).toFixed(0)
//         );
//         const left = Number(
//           (canvasPosition.x - htmlOverlay.offsetWidth / 2 + offset.y).toFixed(0)
//         );
//         htmlOverlay.style.width = 300 + 'px';
//         htmlOverlay.style.height = 200 + 'px';
//         htmlOverlay.style.fontSize = `${14}px`;
//         htmlOverlay.style.top = top + 'px';
//         htmlOverlay.style.left = left + 'px';
//         /// 超出可视距离隐藏
//         htmlOverlay.style.display =
//           distance >= visualDistance ? 'none' : 'block';
//       }
//     };

//     /// 添加监听
//     this.sceneListenerManager.add?.(
//       htmlOverlay.id,
//       SceneListenerType.preRender,
//       listener
//     );

//     /// 返回监听索引
//     return htmlOverlay.id;
//   }

//   /**
//    * @descripttion: 销毁元素
//    * @param {string} id
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   destroySceneElement(id: string) {
//     let result = false;
//     if (!this.sceneListenerManager.isExists?.(id)) return result;
//     const htmlElement = document.getElementById(id);
//     if (htmlElement) {
//       /// 移除元素
//       htmlElement.remove();
//       /// 删除监听
//       this.sceneListenerManager.removeByCode?.(id);
//       result = true;
//     }
//     return result;
//   }

//   /**
//    * @descripttion: 创建扩散圆实体
//    * @param {Geographic} gcs 地理坐标
//    * @param {number} maxA 长半轴
//    * @param {number} maxB 短半轴
//    * @param {number} interval 扩散周期(ms)
//    * @param {HTMLCanvasElement} canvas 画布
//    * @return {Entity}
//    * @author: EV-申小虎
//    */
//   createDiffuseEllipse(
//     gcs: Geographic,
//     maxA: number,
//     maxB: number,
//     canvas: HTMLCanvasElement,
//     interval = 5000,
//     entityOptions?: Entity.ConstructorOptions
//   ) {
//     let r1 = 0,
//       r2 = 0;
//     const maxR = (maxA + maxB) / 2;
//     function changeR1() {
//       //这是callback，参数不能内传
//       r1 = r1 + 500 / interval;
//       if (r1 >= maxA) {
//         r1 = 0;
//       }
//       return r1;
//     }
//     function changeR2() {
//       r2 = r2 + 500 / interval;
//       if (r2 >= maxB) {
//         r2 = 0;
//       }
//       return r2;
//     }

//     return new Entity({
//       description: 'Diffuse_Circle',
//       position: MathUtils.gcsToCartesian3(gcs),
//       show: true,
//       ellipse: {
//         height: 0.01,
//         // heightReference: HeightReference.CLAMP_TO_GROUND,
//         semiMajorAxis: new CallbackProperty(changeR1, false),
//         semiMinorAxis: new CallbackProperty(changeR2, false),
//         material: new ImageMaterialProperty({
//           image: canvas,
//           repeat: new Cartesian2(1.0, 1.0), //指定图像在每个方向上重复的次数,默认为Cesium.Cartesian2(1.0, 1.0),{Cartesian2}类型
//           transparent: true, // 默认为false，当图像具有透明性时设置为true（例如，当png具有透明部分时）
//           color: new CallbackProperty(function () {
//             const alp = 1 - r1 / maxR;
//             return Color.WHITE.withAlpha(alp);
//             //entity的颜色透明 并不影响材质，并且 entity也会透明
//           }, false)
//         })
//       },
//       ...entityOptions
//     });
//   }

//   /**
//    * @descripttion: 创建波纹扩散圆实体
//    * @param {string} name 名称
//    * @param {Geographic} gcs 坐标
//    * @param {number} maxRadius 最大半径
//    * @param {number} quantity 波纹数量
//    * @param {number} interval 扩散周期(ms)
//    * @param {HTMLCanvasElement} canvas 画布
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   renderRippleDiffuseCircle(
//     name: string,
//     gcs: Geographic,
//     maxRadius: number,
//     canvas: HTMLCanvasElement,
//     quantity = 3,
//     interval = 5000
//   ) {
//     // 创建波纹
//     let index = 0;
//     const timer = setInterval(() => {
//       let r1 = 0,
//         r2 = 0;
//       const step = CesiumMath.lerp(0, maxRadius, 5 / interval);

//       const callbackRadius = new CallbackProperty(() => {
//         r1 += step;
//         r1 >= maxRadius && (r1 = 0);
//         return CesiumMath.lerp(r1, maxRadius, step);
//       }, false);

//       const callbackRadius2 = new CallbackProperty(() => {
//         r2 += step;
//         r2 >= maxRadius && (r2 = 0);
//         return CesiumMath.lerp(r2, maxRadius, step);
//       }, false);

//       const entity = new Entity({
//         description: 'Diffuse_Ripple',
//         position: MathUtils.gcsToCartesian3(gcs),
//         show: true,
//         ellipse: {
//           height: 0.01,
//           // heightReference: HeightReference.CLAMP_TO_GROUND,
//           semiMajorAxis: callbackRadius,
//           semiMinorAxis: callbackRadius2,
//           material: new ImageMaterialProperty({
//             image: canvas,
//             repeat: new Cartesian2(1.0, 1.0), //指定图像在每个方向上重复的次数,默认为Cesium.Cartesian2(1.0, 1.0),{Cartesian2}类型
//             transparent: true, // 默认为false，当图像具有透明性时设置为true（例如，当png具有透明部分时）
//             color: new CallbackProperty(function () {
//               const alp = 1 - (r1 + r2) / 2 / maxRadius;
//               return Color.WHITE.withAlpha(alp);
//               //entity的颜色透明 并不影响材质，并且 entity也会透明
//             }, false)
//           })
//         }
//       });

//       this.viewer.entities.add(entity);
//       index++;
//       index === 3 && clearTimeout(timer);
//     }, interval / quantity);
//   }

//   /**
//    * @descripttion: 批量创建扩散圆实体
//    * @param {ICircleWithPosition} arr 数组
//    * @param {string} name 数据源名称
//    * @param {number} maxA 长半轴
//    * @param {number} maxB 短半轴
//    * @param {number} canvasRadius 画布半径(pixel)
//    * @param {number} interval 扩散周期(ms)
//    * @param {boolean} reverse 是否反转
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   batchCreationDiffuseEllipse(
//     arr: ICircleWithPosition[],
//     name: string,
//     maxA: number,
//     maxB: number,
//     canvasRadius: number,
//     interval = 5000,
//     reverse = false
//   ) {
//     // 变化回调
//     let r1 = 0,
//       r2 = 0;
//     const callbackR1 = new CallbackProperty(() => {
//       //这是callback，参数不能内传
//       r1 = r1 + 500 / interval;
//       if (r1 >= maxA) {
//         r1 = 0;
//       }
//       return r1;
//     }, false);
//     const callbackR2 = new CallbackProperty(() => {
//       r2 = r2 + 500 / interval;
//       if (r2 >= maxB) {
//         r2 = 0;
//       }
//       return r2;
//     }, false);
//     // 创建数据源
//     const datasource = new CustomDataSource(name);
//     arr.forEach(({ color, blur, lineWidth, gcs }) => {
//       const canvas = this.drawCircleImage(
//         canvasRadius,
//         color,
//         blur,
//         lineWidth,
//         reverse
//       );
//       const entity = new Entity({
//         position: MathUtils.gcsToCartesian3(gcs),
//         ellipse: {
//           height: 0.01,
//           semiMajorAxis: callbackR1,
//           semiMinorAxis: callbackR2,
//           material: new ImageMaterialProperty({
//             image: canvas,
//             repeat: new Cartesian2(1, 1),
//             transparent: true
//           })
//         }
//       });
//       // 添加实体
//       datasource.entities.add(entity);
//     });
//     // 返回数据源
//     return datasource;
//   }

//   /**
//    * @descripttion: 创建私有实体
//    * @param {string} flag
//    * @param {Entity} options
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   createPrivateEntity(
//     options: Entity.ConstructorOptions | undefined,
//     flag: string | number = 'private'
//   ) {
//     return new Entity({
//       ...options,
//       properties: {
//         ...options?.properties,
//         pteFlag: flag
//       }
//     });
//   }

//   /**
//    * @descripttion: 是否为私有实体
//    * @param {Entity} entity
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   isPrivateEntity(entity: Entity) {
//     return entity.properties?.hasProperty('pteFlag') ?? false;
//   }

//   /**
//    * @descripttion: 获取父链上的所有实体
//    * @param {Entity} entity
//    * @return {*} 索引为0的是实体的父级，后依次为父级的父级...
//    * @author: EV-申小虎
//    */
//   getParentChainEntities(
//     entity: Entity,
//     result: Array<Entity> = []
//   ): Array<Entity> {
//     const parentEntity = entity.parent;

//     if (!parentEntity) return result;

//     result.push(parentEntity);
//     return this.getParentChainEntities(parentEntity, result);
//   }

//   /**
//    * @descripttion: 创建选择框
//    * @param {Cartesian3} position
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   // private createSelectedEntity(position: Cartesian3) {
//   //     return new Entity({
//   //         id: "selected",
//   //         position: position,
//   //         billboard: {
//   //             image: SelectionBox,
//   //             scale: 1,
//   //             // scaleByDistance: new NearFarScalar(20000, 1, 5000000, 0.4),
//   //             // distanceDisplayCondition:new Cesium.DistanceDisplayCondition(10.0, 1100000.0),
//   //             // label: {
//   //             //   text: item['enterName'],
//   //             //   font: '20px Helvetica',
//   //             //   outlineColor: new Cesium.Color(0, 1),
//   //             //   outlineWidth: 2,
//   //             //   showBackground: false,
//   //             //   style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//   //             //   backgroundColor: new Cesium.Color(90 / 255, 181 / 255, 1.3),	//背景颜色
//   //             //   fillColor: new Cesium.Color(1, 1, 1, 1),			//填充颜色
//   //             //   horizontalOrigin: Cesium.HorizontalOrigin.LEFT,			//广告牌在文字的方位
//   //             //   pixelOffset: new Cesium.Cartesian2(20.0, -30.0),	//label 向右偏移 billboard的1/2的宽度
//   //             //   distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10.0, 80000.0),
//   //             //   disableDepthTestDistance: 100.0,
//   //         },
//   //         // },
//   //     });
//   // }

//   /**
//    * @descripttion: 设置当前选中实体
//    * @param {*}
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   //   setSelectedEntity(position: Cartesian3) {
//   //     /// 移除上一个选择框
//   //     this.viewer.entities.removeById("selected");
//   //     /// 创建选择框
//   //     const entity = this.createSelectedEntity(position);

//   //     entity && this.viewer.entities.add(entity);
//   //   }

//   /**
//    * @descripttion: 移除选则框
//    * @param {*}
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   //   removeSelectedEntity() {
//   //     this.viewer.entities.removeById("selected");
//   //   }

//   /*
//    * @descripttion: 渲染鼠标跟随框
//    * @param {string} id
//    * @param {string} tip
//    * @param {CSSStyleDeclaration} style
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   renderMouseTip(
//     id: string = createGuid(),
//     tip = '请在场景中，选择发生位置',
//     style?: CSSStyleDeclaration
//   ): string {
//     const toolTip = document.createElement('div'),
//       popBefore = document.createElement('div'),
//       container = this.viewer.container;

//     /// 设置容器样式
//     toolTip.id = id;
//     toolTip.style.position = 'absolute';
//     toolTip.style.zIndex = '2';
//     toolTip.innerHTML = tip;
//     toolTip.style.color = style?.color || '#FFF';
//     toolTip.style.margin = style?.margin || '5px';
//     toolTip.style.backgroundColor = style?.backgroundColor || '#636770c7';
//     toolTip.style.border = style?.border || '1px solid #16abd8b5';
//     toolTip.style.borderRadius = style?.borderRadius || '5px';
//     //伪元素标签
//     /// before元素样式
//     popBefore.style.display = 'block';
//     popBefore.style.width = '0';
//     popBefore.style.borderWidth = '5px 11px 5px 5px';
//     popBefore.style.borderStyle = 'solid';
//     popBefore.style.borderColor =
//       'transparent #16abd8b5 transparent transparent';
//     popBefore.style.position = 'absolute';
//     popBefore.style.transform = 'translateY(-50%)';
//     popBefore.style.left = '-15px';
//     popBefore.style.top = '50%';
//     /// 添加提示框到容器上
//     container?.appendChild(toolTip);
//     /// 添加伪元素到信息框
//     toolTip.appendChild(popBefore);
//     /// 鼠标移动监听
//     this.mouseHandlerManager.addMouseMoveHandler?.(id, ({ screenPosition }) => {
//       /// 修改元素位置
//       if (screenPosition) {
//         toolTip.style.top = screenPosition.y + 'px';
//         toolTip.style.left = screenPosition.x + 15 + 'px';
//       }
//     });
//     return id;
//   }

//   /**
//    * @descripttion: 移除鼠标跟随框
//    * @param {string} id
//    * @return {*}
//    * @author: EV-申小虎
//    */
//   removeMouseTipByID(id: string) {
//     this.mouseHandlerManager.destroyHandlerById?.(id);
//     const htmlElement = document.getElementById(id);
//     if (htmlElement) {
//       /// 移除元素
//       htmlElement.remove();
//     }
//   }

//   /**
//    *创建飞行轨迹线
//    * @param {*} data 点数据
//    * @returns {null} null
//    */
//   // createFlyLines(data) {
//   //     const center = data.center;
//   //     const cities = data.points;
//   //     const startPoint = Cesium.Cartesian3.fromDegrees(
//   //         center.lon,
//   //         center.lat,
//   //         0,
//   //     );
//   //     //创建实体数据集
//   //     let dataSource = new Cesium.CustomDataSource('数据中心');
//   //     //中心点
//   //     dataSource.entities.add(new Cesium.Entity({
//   //         position: startPoint,
//   //         point: {
//   //             pixelSize: center.size,
//   //             color: center.color,
//   //         },
//   //     }));
//   //     // this.viewer.entities.add({
//   //     //     position: startPoint,
//   //     //     point: {
//   //     //         pixelSize: center.size,
//   //     //         color: center.color
//   //     //     }
//   //     // });
//   //     //大批量操作时，临时禁用事件可以提高性能
//   //     // this.viewer.entities.suspendEvents();
//   //     //散点
//   //     cities.forEach(city => {
//   //         let material = new PolylineTrailMaterialProperty({
//   //             color: new Cesium.Color.fromCssColorString('rgba(84,112,155,.5)'),
//   //             duration: 3000,
//   //             trailImage: './assets/flyPolyline/colors2.png',
//   //         });
//   //         const endPoint = Cesium.Cartesian3.fromDegrees(city.lon, city.lat);
//   //         //终点
//   //         dataSource.entities.add(new Cesium.Entity({
//   //             position: endPoint,
//   //             point: {
//   //                 pixelSize: city.size - 10,
//   //                 color: city.color,
//   //             },
//   //         }));
//   //         //抛物线
//   //         dataSource.entities.add(new Cesium.Entity({
//   //             polyline: {
//   //                 positions: this.generateCurve(endPoint, startPoint),
//   //                 width: Math.round(Math.random() * 4),
//   //                 material: material,
//   //             },
//   //         }));
//   //         // this.viewer.entities.add({
//   //         //     position: endPoint,
//   //         //     point: {
//   //         //         pixelSize: city.size - 10,
//   //         //         color: city.color
//   //         //     }
//   //         // });
//   //         // this.viewer.entities.add({
//   //         //     polyline: {
//   //         //         positions: this.generateCurve(startPoint, endPoint),
//   //         //         width: 2,
//   //         //         material: material
//   //         //     }
//   //         // });
//   //     });
//   //     this.viewer.dataSources.add(dataSource);
//   //     this.layerRecordsManager.add('code', 0, dataSource);
//   //     // this.viewer.entities.resumeEvents();
//   //     this.viewer.flyTo(this.viewer.entities);
//   // }

//   /**
//    * 渲染流动曲线
//    * @param {Object} startPoint 起点
//    * @param {Object} endPoint 终点
//    * @returns {Array} 曲线
//    */
//   // generateCurve(startPoint, endPoint) {
//   //     let addPointCartesian = new Cesium.Cartesian3();
//   //     Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian);
//   //     let midPointCartesian = new Cesium.Cartesian3();
//   //     Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian);
//   //     let midPointCartographic = Cesium.Cartographic.fromCartesian(
//   //         midPointCartesian,
//   //     );
//   //     midPointCartographic.height =
//   //         Cesium.Cartesian3.distance(startPoint, endPoint) / 5;
//   //     let midPoint = new Cesium.Cartesian3();
//   //     Cesium.Ellipsoid.WGS84.cartographicToCartesian(
//   //         midPointCartographic,
//   //         midPoint,
//   //     );
//   //     let spline = new Cesium.CatmullRomSpline({
//   //         times: [0.5, 1.0],
//   //         points: [startPoint, midPoint, endPoint],
//   //     });
//   //     let curvePoints = [];
//   //     for (let i = 0, len = 200; i < len; i++) {
//   //         curvePoints.push(spline.evaluate(i / len));
//   //     }
//   //     return curvePoints;
//   // }
//   //------------------------------------------------------------------------------
// }
