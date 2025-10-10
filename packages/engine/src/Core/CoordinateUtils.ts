/*
 * @Descripttion: 坐标转化工具
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2020-11-17 09:55:50
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:34:10
 */
import {
  Viewer,
  Ellipsoid,
  Cartesian3,
  defined,
  Math as CesiumMath,
  Cartesian2,
  Scene,
  WebMercatorProjection,
  Cartographic,
  Globe,
  NearFarScalar,
  Color,
  Entity,
  GeographicProjection,
  Rectangle,
  Quaternion,
} from "cesium";
import Geographic from "./Geographic";
import MathUtils from "./MathUtils";
import type {
  PositionOptions,
  NearFarScalarValue,
  ColorOptions,
  ProjectionPoint,
  Point,
  Point2Deg,
  Point3Deg,
  CartographicDegreesValue,
  CartographicRectangleDegreesValue,
  Cartesian3Value,
  PositionListOptions,
  Cartesian3ListValue,
  RectangleCoordinatesOptions,
  AlignedAxisOptions,
  UnitQuaternionValue,
} from "../types";

const xPI = (Math.PI * 3000.0) / 180.0;
const a = 6378245.0;
const ee = 0.006693421622965943;

/**
 * @descripttion: 转化工具
 * @author: EV-申小虎
 */
class CoordinateUtils {
  static alignedAxisOptionsToCar3(val: AlignedAxisOptions) {
    const { unitCartesian } = val;

    return unitCartesian ? Cartesian3.fromArray(unitCartesian) : undefined;
  }

  static positionOptionsToCar3(position: PositionOptions) {
    const { cartesian, cartographicDegrees } = position;

    return cartesian
      ? Cartesian3.fromArray(cartesian)
      : cartographicDegrees
      ? Cartesian3.fromDegrees(
          cartographicDegrees[0],
          cartographicDegrees[1],
          cartographicDegrees[2]
        )
      : undefined;
  }

  static cartesian3ListValueToCar3Arr(cartesian: Cartesian3ListValue) {
    const number = Math.floor(cartesian.length / 3),
      car3Arr: Array<Cartesian3> = [];

    for (let index = 0; index < number; index++) {
      const elementX = cartesian[3 * index];
      const elementY = cartesian[3 * index + 1];
      const elementZ = cartesian[3 * index + 2];

      car3Arr.push(Cartesian3.fromElements(elementX, elementY, elementZ));
    }

    return car3Arr;
  }

  static positionListOptionsToCar3Arr(position: PositionListOptions) {
    const { cartesian, cartographicDegrees } = position;

    return cartesian
      ? this.cartesian3ListValueToCar3Arr(cartesian)
      : cartographicDegrees
      ? Cartesian3.fromDegreesArrayHeights(cartographicDegrees)
      : [];
  }

  static rectangleCoordinatesOptionsToCar3Arr(
    coordinates: RectangleCoordinatesOptions
  ) {
    const { wsenDegrees } = coordinates;

    return wsenDegrees ? this.wsenDegrees2Cartesian3Arr(wsenDegrees) : [];
  }

  static rectangleCoordinatesOptionsToRectangle(
    coordinates: RectangleCoordinatesOptions
  ) {
    const { wsenDegrees } = coordinates;

    return wsenDegrees
      ? Rectangle.fromCartesianArray(
          this.wsenDegrees2Cartesian3Arr(wsenDegrees)
        )
      : undefined;
  }

  static quaternionToUnitQuaternionValue(val: Quaternion): UnitQuaternionValue {
    return [val.x, val.y, val.z, val.w];
  }

  static unitQuaternionValueToQuaternion(val: UnitQuaternionValue) {
    return val.length != 4
      ? undefined
      : new Quaternion(val[0], val[1], val[2], val[3]);
  }

  /**
   * @descripttion: 笛卡尔坐标转换为三维地理坐标
   * @param {Viewer} viewer 视图
   * @param {Cartesian3} cartesian3 笛卡尔坐标
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ToGeographic(cartesian3: Cartesian3, ellipsoid = Ellipsoid.WGS84) {
    const cartographic = ellipsoid.cartesianToCartographic(cartesian3),
      lat = CesiumMath.toDegrees(cartographic.latitude),
      lon = CesiumMath.toDegrees(cartographic.longitude),
      alt = cartographic.height,
      gcs = new Geographic(lon, lat, alt);

    return gcs;
  }

  /**
   * @descripttion: 笛卡尔坐标转换为三维地理坐标
   * @param {Viewer} viewer 视图
   * @param {Cartesian3} cartesian3 笛卡尔坐标
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ArrToGeographicArr(
    arr: Cartesian3[],
    ellipsoid = Ellipsoid.WGS84
  ) {
    return arr.map((car3) => this.car3ToGeographic(car3, ellipsoid));
  }

  /**
   * @descripttion: 笛卡尔坐标转换为三维地理坐标
   * @param {Viewer} viewer 视图
   * @param {Cartesian3} cartesian3 笛卡尔坐标
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ToPoint3Deg(
    cartesian3: Cartesian3,
    ellipsoid = Ellipsoid.WGS84
  ): Point3Deg {
    const cartographic = ellipsoid.cartesianToCartographic(cartesian3),
      lat = CesiumMath.toDegrees(cartographic.latitude),
      lon = CesiumMath.toDegrees(cartographic.longitude),
      alt = cartographic.height;

    return [lon, lat, alt];
  }

  static car3ArrToPoint3DegArr(
    arr: Cartesian3[],
    ellipsoid = Ellipsoid.WGS84
  ): Point3Deg[] {
    return arr.map((car3) => this.car3ToPoint3Deg(car3, ellipsoid));
  }

  /**
   * @descripttion: 笛卡尔坐标转换为二维地理坐标
   * @param {Viewer} viewer 视图
   * @param {Cartesian3} cartesian3 笛卡尔坐标
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ToPoint(
    cartesian3: Cartesian3,
    ellipsoid = Ellipsoid.WGS84
  ): Point {
    const cartographic = ellipsoid.cartesianToCartographic(cartesian3),
      lat = CesiumMath.toDegrees(cartographic.latitude),
      lon = CesiumMath.toDegrees(cartographic.longitude),
      alt = cartographic.height;

    return [lon, lat];
  }

  /**
   * @descripttion: 笛卡尔坐标转换为二维地理坐标
   * @param {Viewer} viewer 视图
   * @param {Cartesian3} cartesian3 笛卡尔坐标
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ArrToPointArr(
    arr: Cartesian3[],
    ellipsoid = Ellipsoid.WGS84
  ): Point[] {
    return arr.map((car3) => this.car3ToPoint(car3, ellipsoid));
  }

  /**
   * @descripttion: 笛卡尔坐标转二维投影坐标
   * @param {Viewer} viewer
   * @param {Cartesian3} cartesian3
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ToProjectionPnt(
    cartesian3: Cartesian3,
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ): ProjectionPoint {
    const cartographic =
        projection.ellipsoid.cartesianToCartographic(cartesian3),
      // webMercator = new WebMercatorProjection(ellipsoid),
      // projection = webMercator.project(cartographic);
      // geographicProjection = new GeographicProjection(ellipsoid),
      car3 = projection.project(cartographic);

    return [car3.x, car3.y];
  }

  static car3ArrToProjectionPntArr(
    arr: Array<Cartesian3>,
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ): Array<ProjectionPoint> {
    const result: Array<ProjectionPoint> = [];

    arr.forEach((car3) => {
      const pnt = this.car3ToProjectionPnt(car3, projection);

      result.push(pnt);
    });

    return result;
  }

  /**
   * @descripttion:
   * @param {Array} arr
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ToCartesian3Value(cartesian: Cartesian3): Cartesian3Value {
    return [cartesian.x, cartesian.y, cartesian.z];
  }

  /**
   * @descripttion:
   * @param {Array} arr
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ArrToCartesian3ListValue(arr: Array<Cartesian3>) {
    const result: Array<number> = [];

    arr.forEach((car3) => {
      if (defined(car3)) {
        result.push(car3.x);
        result.push(car3.y);
        result.push(car3.z);
      }
    });

    return result;
  }

  /**
   * @descripttion:
   * @param {Array} arr
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ArrToCartographicDegreesListValue(arr: Array<Cartesian3>) {
    const result: Array<number> = [];

    arr.forEach((car3) => {
      const gcs = this.car3ToGeographic(car3);
      result.push(gcs.longitude);
      result.push(gcs.latitude);
      result.push(gcs.altitude ?? 0);
    });

    return result;
  }

  /**
   * @descripttion:
   * @param {Array} arr
   * @return {*}
   * @author: EV-申小虎
   */
  static car3ArrToCartographicRectangleDegreesValue(
    wsen: [Cartesian3, Cartesian3]
  ): CartographicRectangleDegreesValue {
    return [
      this.car3ToGeographic(wsen[0]).longitude,
      this.car3ToGeographic(wsen[0]).latitude,
      this.car3ToGeographic(wsen[1]).longitude,
      this.car3ToGeographic(wsen[1]).latitude,
    ];
  }

  static car3ToGeographicInCHN(
    cartesian3: Cartesian3,
    figure: number,
    isString: true,
    ellipsoid?: Ellipsoid
  ): string;
  static car3ToGeographicInCHN(
    cartesian3: Cartesian3,
    figure: number,
    isString: false,
    ellipsoid?: Ellipsoid
  ): { 经度: string; 纬度: string; 高度: string };
  /**
   * @descripttion: 世界坐标转换为中文经纬度
   * @param {Viewer} viewer 视图
   * @param {Cartesian3} cartesian3 世界坐标
   * @param {number} figure 小数位数
   * @param {boolean} isString 是否字符串
   * @return {string}
   * @author: EV-申小虎
   */
  static car3ToGeographicInCHN(
    cartesian3: Cartesian3,
    figure: number,
    isString: boolean,
    ellipsoid = Ellipsoid.WGS84
  ) {
    if (!defined(cartesian3)) return undefined;
    const cartographic = ellipsoid.cartesianToCartographic(cartesian3),
      lat = figure
        ? Number(CesiumMath.toDegrees(cartographic.latitude)).toFixed(figure)
        : CesiumMath.toDegrees(cartographic.latitude),
      lon = figure
        ? Number(CesiumMath.toDegrees(cartographic.longitude)).toFixed(figure)
        : CesiumMath.toDegrees(cartographic.longitude),
      alt = figure
        ? Number(cartographic.height).toFixed(figure)
        : cartographic.height;

    return isString
      ? `经度：${lon}   纬度：${lat}   高度：${alt}`
      : { 经度: lon, 纬度: lat, 高度: alt };
  }

  static rectangle2WsenDegrees(
    rectangle: Rectangle
  ): CartographicRectangleDegreesValue {
    if (!defined(rectangle)) throw new Error("无效的rectangle");

    return [
      CesiumMath.toDegrees(rectangle.west),
      CesiumMath.toDegrees(rectangle.south),
      CesiumMath.toDegrees(rectangle.east),
      CesiumMath.toDegrees(rectangle.north),
    ];
  }

  static wsenDegrees2Cartesian3Arr(
    wsenDegrees: CartographicRectangleDegreesValue
  ) {
    if (!Array.isArray(wsenDegrees)) return [];

    return Cartesian3.fromDegreesArray([
      wsenDegrees[0],
      wsenDegrees[1],
      wsenDegrees[0],
      wsenDegrees[3],
      wsenDegrees[2],
      wsenDegrees[3],
      wsenDegrees[2],
      wsenDegrees[1],
    ]);
  }

  static rectangle2Cartesian3Arr(rectangle: Rectangle): Array<Cartesian3> {
    return this.wsenDegrees2Cartesian3Arr(
      this.rectangle2WsenDegrees(rectangle)
    );
  }

  /**
   * @descripttion: 经纬度转为世界坐标
   * @param {Geographic} gcs 地理坐标
   * @param {Ellipsoid} ellipsoid 椭球体
   * @return {*}
   * @author: EV-申小虎
   */
  static gcsToCartesian3(gcs: Geographic, ellipsoid = Ellipsoid.WGS84) {
    return Cartesian3.fromDegrees(
      gcs.longitude,
      gcs.latitude,
      gcs.altitude,
      ellipsoid
    );
  }

  static gcsToCartographicDegreesValue(
    gcs: Geographic
  ): CartographicDegreesValue {
    return [gcs.longitude, gcs.latitude, gcs.altitude ?? 0];
  }

  static gcsToPoint3Deg(gcs: Geographic): Point3Deg {
    return [gcs.longitude, gcs.latitude, gcs.altitude ?? 0];
  }

  /**
   * @descripttion: 经纬度转为投影坐标
   * @param {Geographic} gcs 地理坐标
   * @param {Ellipsoid} ellipsoid 椭球体
   * @return {*}
   * @author: EV-申小虎
   */
  static gcs2ProjPnt(
    gcs: Geographic,
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ): ProjectionPoint {
    const cartographic = Cartographic.fromDegrees(
        gcs.longitude,
        gcs.latitude,
        gcs.altitude
      ),
      car3 = projection.project(cartographic);

    return [car3.x, car3.y];
  }

  /**
   * @descripttion: 投影坐标转为世界坐标
   * @param {ProjectionPoint} projPnt
   * @param {Ellipsoid} ellipsoid
   * @return {*}
   * @author: EV-申小虎
   */
  static projPnt2Cartesian3(
    projPnt: ProjectionPoint,
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ) {
    // const webMercator = new WebMercatorProjection(ellipsoid),
    //     cartographic = webMercator.unproject(new Cartesian3(projPnt[0], projPnt[1])),
    //     geographicProjection = new GeographicProjection(ellipsoid),
    //     projection = geographicProjection.project(cartographic);

    const cartographic = projection.unproject(
      new Cartesian3(projPnt[0], projPnt[1])
    );

    return Cartographic.toCartesian(cartographic, projection.ellipsoid);
  }

  /**
   * @descripttion: 投影坐标转为世界坐标
   * @param {ProjectionPoint} projPnt
   * @param {Ellipsoid} ellipsoid
   * @return {*}
   * @author: EV-申小虎
   */
  static projPntArr2Cartesian3Arr(
    projPnt: ProjectionPoint[],
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ) {
    return projPnt.map((pnt) => {
      return this.projPnt2Cartesian3(pnt, projection);
    });
  }

  /**
   * @descripttion: 投影坐标转为地理坐标
   * @param {ProjectionPoint} projPnt
   * @param {Ellipsoid} ellipsoid
   * @return {*}
   * @author: EV-申小虎
   */
  static projPnt2Geographic(
    projPnt: ProjectionPoint,
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ) {
    const cartographic = projection.unproject(
        new Cartesian3(projPnt[0], projPnt[1])
      ),
      lat = CesiumMath.toDegrees(cartographic.latitude),
      lon = CesiumMath.toDegrees(cartographic.longitude);

    return new Geographic(lon, lat);
  }

  /**
   * @descripttion: 投影坐标转为地理坐标（数组形式）
   * @param {ProjectionPoint} projPnt
   * @param {Ellipsoid} ellipsoid
   * @return {*}
   * @author: EV-申小虎
   */
  static projPnt2Point(
    projPnt: ProjectionPoint,
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ): Point2Deg {
    const cartographic = projection.unproject(
        new Cartesian3(projPnt[0], projPnt[1])
      ),
      lat = CesiumMath.toDegrees(cartographic.latitude),
      lon = CesiumMath.toDegrees(cartographic.longitude);

    return [lon, lat];
  }

  /**
   * @descripttion: 投影坐标转为地理坐标（数组形式）
   * @param {ProjectionPoint} projPnt
   * @param {Ellipsoid} ellipsoid
   * @return {*}
   * @author: EV-申小虎
   */
  static projPntArr2PointArr(
    projPntArr: ProjectionPoint[],
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ): Point2Deg[] {
    return projPntArr.map((proj) => this.projPnt2Point(proj, projection));
  }

  static geocentricToGeodetic(
    X: number,
    Y: number,
    Z: number,
    a: number = 6378245.0,
    f: number = 1 / 298.257223563
  ): { longitude: number; latitude: number; height: number } {
    const b = a * (1 - f); // 短半轴
    const e2 = 1 - Math.pow(b / a, 2); // 第一偏心率的平方
    const ep2 = Math.pow(a / b, 2) - 1; // 第二偏心率的平方

    const p = Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2)); // 从地心到点在赤道平面上的投影的距离
    const theta = Math.atan2(Z * a, p * b); // 从赤道平面到点的垂线与赤道平面的夹角
    const latitude = Math.atan2(
      Z + ep2 * b * Math.pow(Math.sin(theta), 3),
      p - e2 * a * Math.pow(Math.cos(theta), 3)
    );
    const longitude = Math.atan2(Y, X);

    const N = a / Math.sqrt(1 - e2 * Math.pow(Math.sin(latitude), 2)); // 卯酉圈的半径
    const height = p / Math.cos(latitude) - N; // 点到卯酉圈的高度

    return {
      longitude: longitude * (180 / Math.PI),
      latitude: latitude * (180 / Math.PI),
      height: height,
    };
  }

  /**
   * @descripttion: 投影坐标数值组转为世界坐标
   * @param {ProjectionPoint} projPnt
   * @param {Ellipsoid} ellipsoid
   * @return {*}
   * @author: EV-申小虎
   */
  static projectionsToCartesian3Arr(
    projections: Array<number>,
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84),
    result?: Array<Cartesian3>
  ) {
    if (projections.length < 2 || projections.length % 2 !== 0) {
      console.error(
        "the number of coordinates must be a multiple of 2 and at least 2"
      );
    }

    const length = projections.length;
    if (!defined(result)) {
      result = new Array<Cartesian3>(length / 2);
    } else {
      result!.length = length / 2;
    }

    for (let i = 0; i < length; i += 2) {
      const x = projections[i];
      const y = projections[i + 1];
      const index = i / 2;

      result![index] = this.projPnt2Cartesian3([x, y], projection);
    }

    return result!;
  }

  /**
   * @descripttion: 根据经纬度获取地表高程
   * @param {Globe} globe
   * @param {Point2Deg} point
   * @return {*}
   * @author: EV-申小虎
   */
  static getTerrainHeight(globe: Globe, point: Point2Deg) {
    const cartographic = Cartographic.fromDegrees(point[0], point[1]),
      height = globe.getHeight(cartographic);
    return height;
  }

  /**
   * @descripttion: 相对高度世界坐标转为绝对高度世界坐标
   * @param {Cartesian3} relCar3
   * @param {Globe} globe
   * @return {*}
   * @author: EV-申小虎
   */
  static relative2AbsoluteCar3(relCar3: Cartesian3, globe: Globe) {
    const cartographic = Cartographic.fromCartesian(relCar3),
      height = globe.getHeight(cartographic),
      absCartographic = Cartographic.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height + (height ?? 0)
      ),
      absCar3 = Cartographic.toCartesian(absCartographic);

    return absCar3;
  }

  static cartesianToCanvasCoordinates(scene: Scene, position: Cartesian3) {
    return scene.cartesianToCanvasCoordinates(position, Cartesian2.ZERO);
  }

  static value2NearFarScalar(data: NearFarScalarValue) {
    return new NearFarScalar(data[0], data[1], data[2], data[3]);
  }

  static value2Color(data: ColorOptions) {
    const { rgba } = data;
    return rgba
      ? Color.fromBytes(rgba[0], rgba[1], rgba[2], rgba[3])
      : Color.WHITE;
  }

  /**
   * @descripttion: 根据枚举值获取键
   * @param {T} enumType
   * @param {T} value
   * @return {*}
   * @author: EV-申小虎
   */
  static getKeyByEnumValue<T>(
    enumType: T,
    value: T[keyof T]
  ): string | undefined {
    for (const key in enumType) {
      if (enumType[key] === value) {
        return key;
      }
    }
    return undefined;
  }

  /**
   * @descripttion: 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换（即 百度 转 谷歌、高德）
   * @param {Geographic} gcs
   * @return {*}
   * @author: EV-申小虎
   */
  static bd09ToGCJ02(gcs: Geographic) {
    const xpi = (Math.PI * 3000.0) / 180.0;
    const x = gcs.longitude - 0.0065;
    const y = gcs.latitude - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xpi);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xpi);
    const gglng = z * Math.cos(theta);
    const gglat = z * Math.sin(theta);
    return new Geographic(gglng, gglat);
  }

  /**
   * @descripttion: 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换（即谷歌、高德 转 百度）
   * @param lng
   * @param lat
   * @returns {*[]}
   */
  static gcj02ToBD09(gcs: Geographic) {
    const z =
      Math.sqrt(gcs.longitude * gcs.longitude + gcs.latitude * gcs.latitude) +
      0.00002 * Math.sin(gcs.latitude * xPI);
    const theta =
      Math.atan2(gcs.latitude, gcs.longitude) +
      0.000003 * Math.cos(gcs.longitude * xPI);
    const bdlng = z * Math.cos(theta) + 0.0065;
    const bdlat = z * Math.sin(theta) + 0.006;
    return new Geographic(bdlng, bdlat);
  }

  /**
   * @descripttion: WGS84转GCj02
   * @param {Geographic} gcs 地理坐标
   * @return {*}
   * @author: EV-申小虎
   */
  static wgs84ToGCJ02(gcs: Geographic) {
    if (outofchina(gcs)) {
      return gcs;
    }
    const retGeographic = new Geographic(
        gcs.longitude - 105.0,
        gcs.latitude - 35.0
      ),
      dGeographic = transformGeographic(retGeographic),
      radlat = (gcs.latitude / 180.0) * Math.PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic),
      dlat =
        (dGeographic.latitude * 180.0) /
        (((a * (1 - ee)) / (magic * sqrtmagic)) * Math.PI),
      dlng =
        (dGeographic.longitude * 180.0) /
        ((a / sqrtmagic) * Math.cos(radlat) * Math.PI),
      mglat = gcs.latitude + dlat,
      mglng = gcs.longitude + dlng;
    // return [mglng - 0.00838994979859, mglat - 0.003615617752074]
    return new Geographic(mglng, mglat);
  }

  /**
   * @descripttion: GCJ02 转换为 WGS84
   * @param {Geographic} gcs
   * @return {*}
   * @author: EV-申小虎
   */
  static gcj02ToWGS84(gcs: Geographic) {
    if (outofchina(gcs)) {
      return gcs;
    }
    const retGeographic = new Geographic(
        gcs.longitude - 105.0,
        gcs.latitude - 35.0
      ),
      dGeographic = transformGeographic(retGeographic),
      radlat = (gcs.latitude / 180.0) * Math.PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic),
      dlat =
        (dGeographic.latitude * 180.0) /
        (((a * (1 - ee)) / (magic * sqrtmagic)) * Math.PI),
      dlng =
        (dGeographic.longitude * 180.0) /
        ((a / sqrtmagic) * Math.cos(radlat) * Math.PI),
      mglat = gcs.latitude + dlat,
      mglng = gcs.longitude + dlng;
    return new Geographic(gcs.longitude * 2 - mglng, gcs.latitude * 2 - mglat);
  }

  /**
   * @descripttion: 度转度°分′秒″
   * @param {number} degree 角度（-180-180）
   * @return {*}
   * @author: EV-申小虎
   */
  static toDMS(degree: number) {
    if (typeof degree == "undefined") {
      return null;
    }
    /// 是否为负数
    const isNegative = degree < 0,
      /// 转为字符串
      strVal = String(Math.abs(degree));
    /// 获取小数点位置索引
    let i = strVal.indexOf(".");
    /// 获取度
    const strDu = i < 0 ? degree : strVal.substring(0, i);
    let strFen: number | string = 0,
      strMiao: number | string = 0;

    if (i > 0) {
      strFen = Number("0" + strVal.substring(i));
      strFen = strFen * 60;
      i = (strFen + "").indexOf(".");
      if (i > 0) {
        strMiao = Number("0" + (strFen + "").substring(i));
        strFen = (strFen + "").substring(0, i); //获取分
        strMiao = strMiao * 60 + "";
        i = strMiao.indexOf(".");
        strMiao = strMiao.substring(0, i + 4); //取到小数点后面三位
        strMiao = parseFloat(strMiao).toFixed(2); //精确小数点后面两位
      }
    }

    return {
      degree: isNegative ? -Number(strDu) : Number(strDu),
      minute: isNegative ? -Number(strFen) : Number(strFen),
      second: isNegative ? -Number(strMiao) : Number(strMiao),
    };
  }

  /**
   * @descripttion: 度转度°分′秒″
   * @example
   * // -113.211568° -----> 113°12'41.645''W
   * // 78.982145° -----> 78°58'55.722''N
   * @param {ProjectionPoint} point
   * @return {*}
   * @author: EV-申小虎
   */
  static pointToDMS(point: Point2Deg, CHN = false) {
    const lon = MathUtils.toDMS(point[0]),
      lat = MathUtils.toDMS(point[1]),
      strLon = `${
        CHN ? (Number(lon?.degree) > 0 ? "东经" : "西经") : ""
      }${Math.abs(lon?.degree || 0)}°${Math.abs(lon?.minute || 0)}'${Math.abs(
        lon?.second || 0
      )}"${CHN ? "" : Number(lon?.degree) > 0 ? "E" : "W"}`,
      strLat = `${
        CHN ? (Number(lat?.degree) > 0 ? "北纬" : "南纬") : ""
      }${Math.abs(lat?.degree || 0)}°${Math.abs(lat?.minute || 0)}'${Math.abs(
        lat?.second || 0
      )}"${CHN ? "" : Number(lat?.degree) > 0 ? "N" : "S"}`;

    return {
      strLon,
      strLat,
    };
  }

  /**
   * @descripttion: 度转度°分′秒″
   * @example
   * // -113.211568° -----> 113°12'41.645''W
   * // 78.982145° -----> 78°58'55.722''N
   * @param {ProjectionPoint} point
   * @return {*}
   * @author: EV-申小虎
   */
  static pointToStr(point: Point2Deg, CHN = false) {
    const lon = point[0],
      lat = point[1],
      strLon = `${CHN ? (Number(lon) > 0 ? "东经" : "西经") : ""}${Math.abs(
        lon ?? 0
      )}°${CHN ? "" : Number(lon) > 0 ? "E" : "W"}`,
      strLat = `${CHN ? (Number(lat) > 0 ? "北纬" : "南纬") : ""}${Math.abs(
        lat ?? 0
      )}°${CHN ? "" : Number(lat) > 0 ? "N" : "S"}`;

    return {
      strLon,
      strLat,
    };
  }

  static pointToCar3(point: Point3Deg) {
    return Cartesian3.fromDegrees(point[0], point[1], point[2]);
  }

  static point3DegArrToCar3Arr(points: Point3Deg[]) {
    return points.map((point) => this.pointToCar3(point));
  }

  static pointToGCS(point: Point3Deg) {
    return new Geographic(point[0], point[1], point[2]);
  }

  static point3DegToProjPnt(
    point: Point3Deg,
    projection:
      | WebMercatorProjection
      | GeographicProjection = new WebMercatorProjection(Ellipsoid.WGS84)
  ): ProjectionPoint {
    const cartographic = Cartographic.fromDegrees(point[0], point[1], point[2]),
      car3 = projection.project(cartographic);

    return [car3.x, car3.y];
  }

  static point3DegArrToProjPointArr(points: Point3Deg[]) {
    return points.map((point) => this.point3DegToProjPnt(point));
  }

  /**
   * @descripttion: 度°分′秒″转度
   * @param {number} degree 度（0-180）
   * @param {number} minute 分（0-60）
   * @param {number} second 秒（0-60）
   * @param {number} precision 数值精度（默认为最高精度6）
   * @return {*}
   * @author: EV-申小虎
   */
  static toDegree(
    degree: number,
    minute: number,
    second: number,
    precision = 6
  ) {
    /// 精确到小数点后最多六位
    precision =
      precision > 6 || precision < 0 || typeof precision == "undefined"
        ? 6
        : precision;
    const d = typeof degree == "undefined" ? 0 : Math.abs(degree),
      m = typeof minute == "undefined" ? 0 : Math.abs(minute / 60),
      s = typeof second == "undefined" ? 0 : Math.abs(second / 3600);
    let total = d + m + s;
    total = total > 180 ? 180 : total;

    return parseFloat(total.toFixed(precision));
  }

  /**
   * @descripttion: 通过几何关系检测点是否在地球背面
   * @param {Scene} scene
   * @param {Cartesian3} position
   * @return {*}
   * @author: EV-申小虎
   */
  static isPointOnBackside(scene: Scene, position: Cartesian3) {
    const camera = scene.camera;
    const ellipsoid = scene.globe.ellipsoid;

    // 1. 计算相机到目标点的向量（从相机指向目标点）
    const cameraToPosition = Cartesian3.subtract(
      position,
      camera.position,
      new Cartesian3()
    );

    // 2. 计算目标点处的地表法向量（指向外，即远离地心方向）
    const normal = ellipsoid.geodeticSurfaceNormal(position, new Cartesian3());

    // 3. 点积：若结果>0，说明目标点在相机视线的"背面"（被地球遮挡）
    const dotProduct = Cartesian3.dot(cameraToPosition, normal);
    return dotProduct > 0;
  }

  /**
   * @descripttion: 根据屏幕坐标获取场景坐标（需开启地形深度探测）
   * @param {Scene} scene
   * @param {Cartesian2} screenPosition
   * @return {*}
   * @author: EV-申小虎
   */
  static getSceneCartesian3(
    scene: Scene,
    screenPosition: Cartesian2
  ): Cartesian3 | null {
    let result: Cartesian3 | null = null;

    /// 1.先判断浏览器是否支持深度拾取
    if (!scene.pickPositionSupported) {
      console.error("获取场景坐标失败，error:", "该浏览器不支持深度拾取！");
      return result;
    }

    /// 2.再判断是否开启了地形深度探测
    if (!scene.globe.depthTestAgainstTerrain) {
      console.error("获取场景坐标失败，error:", "未开启地形深度探测！");
      return result;
    }

    /// 3.开始获取场景坐标
    /// 场景坐标，从场景的深度缓冲区中拾取相应的位置
    result = scene.pickPosition(screenPosition);

    return result;
  }

  /**
   * @descripttion: 根据屏幕坐标获取视点坐标（需开启地形深度探测）
   * @param {Viewer} viewer
   * @param {Cartesian2} screenPosition
   * @return {*}
   * @author: EV-申小虎
   */
  static getViewCartesian3(
    viewer: Viewer,
    screenPosition: Cartesian2
  ): Cartesian3 | null {
    let result: Cartesian3 | null = null;

    /// 1.先判断浏览器是否支持深度拾取
    if (!viewer.scene.pickPositionSupported) {
      console.error("获取视点坐标失败，error:", "该浏览器不支持深度拾取！");
      return result;
    }

    /// 2.再判断是否开启了地形深度探测
    // if (!viewer.scene.globe.depthTestAgainstTerrain) {
    //   console.error("获取视点坐标失败，error:", "未开启地形深度探测！");
    //   return result;
    // }

    /// 3.开始获取视点坐标
    /// 获取视野中心点到球上的射线
    const pickRay = viewer.camera.getPickRay(screenPosition);
    /// 视点坐标
    result =
      (pickRay && viewer.scene.globe.pick(pickRay, viewer.scene)) || null;

    return result;
  }

  /**
   * @descripttion: 根据屏幕坐标获取椭球体地表坐标（不需开启地形深度探测）
   * @param {Viewer} viewer
   * @param {Cartesian2} screenPosition
   * @return {*}
   * @author: EV-申小虎
   */
  static getSurfaceCartesian3(
    viewer: Viewer,
    screenPosition: Cartesian2
  ): Cartesian3 | null {
    let result: Cartesian3 | null = null;

    /// 1.先判断浏览器是否支持深度拾取
    if (!viewer.scene.pickPositionSupported) {
      console.error("获取地表坐标失败，error:", "该浏览器不支持深度拾取！");
      return result;
    }

    /// 2.开始获取地表坐标
    result = viewer.camera.pickEllipsoid(screenPosition) ?? null;

    return result;
  }

  /**
   * @descripttion: 根据屏幕坐标获取选中对象
   * @param {Viewer} viewer
   * @param {Cartesian2} screenPosition
   * @return {*}
   * @author: EV-申小虎
   */
  static getPickedObject(viewer: Viewer, screenPosition: Cartesian2) {
    let result: { id?: Entity } | undefined = undefined;

    /// 1.先判断浏览器是否支持深度拾取
    // if (!viewer.scene.pickPositionSupported) {
    //     console.error("获取对象失败，error:", "该浏览器不支持深度拾取！");
    //     return result;
    // }

    /// 2.再判断是否开启了地形深度探测
    // if (!viewer.scene.globe.depthTestAgainstTerrain) {
    //     console.error("获取对象失败，error:", "未开启地形深度探测！");
    //     return result;
    // }

    /// 3.开始获取选中对象
    result = viewer.scene.pick(screenPosition);

    return result;
  }

  ///  秒数转化为时分秒
  static secondsToHMS(value: number, withDay = false) {
    //  秒
    let second = parseInt(value.toString());
    //  分
    let minute = 0;
    //  小时
    let hour = 0;
    //  天
    let day = 0;
    //  如果秒数大于60，将秒数转换成整数
    if (second > 60) {
      //  获取分钟，除以60取整数，得到整数分钟
      minute = parseInt((second / 60).toString());
      //  获取秒数，秒数取佘，得到整数秒数
      second = parseInt((second % 60).toString());
      //  如果分钟大于60，将分钟转换成小时
      if (minute > 60) {
        //  获取小时，获取分钟除以60，得到整数小时
        hour = parseInt((minute / 60).toString());
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        minute = parseInt((minute % 60).toString());
        //  如果小时大于24，将小时转换成天
        if (withDay && hour > 23) {
          //  获取天数，获取小时除以24，得到整天数
          day = parseInt((hour / 24).toString());
          //  获取天数后取余的小时，获取小时除以24取余的小时
          hour = parseInt((hour % 24).toString());
        }
      }
    }

    const secondStr = second > 9 ? second : "0" + second,
      minuteStr = minute > 9 ? minute : "0" + minute,
      hourStr = hour > 9 ? hour : "0" + hour;

    let result = `${hourStr}:${minuteStr}:${secondStr}`;

    if (withDay && day > 0) {
      result = "" + parseInt(day.toString()) + "D" + result;
    }

    return {
      H: hourStr,
      M: minuteStr,
      S: secondStr,
    };
  }
  static secondsToHMSInStr(value: number, withDay = false) {
    //  秒
    let second = parseInt(value.toString());
    //  分
    let minute = 0;
    //  小时
    let hour = 0;
    //  天
    let day = 0;
    //  如果秒数大于60，将秒数转换成整数
    if (second > 60) {
      //  获取分钟，除以60取整数，得到整数分钟
      minute = parseInt((second / 60).toString());
      //  获取秒数，秒数取佘，得到整数秒数
      second = parseInt((second % 60).toString());
      //  如果分钟大于60，将分钟转换成小时
      if (minute > 60) {
        //  获取小时，获取分钟除以60，得到整数小时
        hour = parseInt((minute / 60).toString());
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        minute = parseInt((minute % 60).toString());
        //  如果小时大于24，将小时转换成天
        if (withDay && hour > 23) {
          //  获取天数，获取小时除以24，得到整天数
          day = parseInt((hour / 24).toString());
          //  获取天数后取余的小时，获取小时除以24取余的小时
          hour = parseInt((hour % 24).toString());
        }
      }
    }

    const secondStr = second > 9 ? second : "0" + second,
      minuteStr = minute > 9 ? minute : "0" + minute,
      hourStr = hour > 9 ? hour : "0" + hour;

    let result = `${hourStr}:${minuteStr}:${secondStr}`;

    if (withDay && day > 0) {
      result = "" + parseInt(day.toString()) + "天" + result;
    }

    return result;
  }

  static secondsToHMSInCHN(value: number, withDay = false) {
    //  秒
    let second = parseInt(value.toString());
    //  分
    let minute = 0;
    //  小时
    let hour = 0;
    //  天
    let day = 0;
    //  如果秒数大于60，将秒数转换成整数
    if (second > 60) {
      //  获取分钟，除以60取整数，得到整数分钟
      minute = parseInt((second / 60).toString());
      //  获取秒数，秒数取佘，得到整数秒数
      second = parseInt((second % 60).toString());
      //  如果分钟大于60，将分钟转换成小时
      if (minute > 60) {
        //  获取小时，获取分钟除以60，得到整数小时
        hour = parseInt((minute / 60).toString());
        //  获取小时后取佘的分，获取分钟除以60取佘的分
        minute = parseInt((minute % 60).toString());
        //  如果小时大于24，将小时转换成天
        if (withDay && hour > 23) {
          //  获取天数，获取小时除以24，得到整天数
          day = parseInt((hour / 24).toString());
          //  获取天数后取余的小时，获取小时除以24取余的小时
          hour = parseInt((hour % 24).toString());
        }
      }
    }

    let result = "";
    if (second > 0) result = "" + parseInt(second.toString()) + "秒";
    if (minute > 0) {
      result = "" + parseInt(minute.toString()) + "分" + result;
    }
    if (hour > 0) {
      result = "" + parseInt(hour.toString()) + "小时" + result;
    }
    if (withDay && day > 0) {
      result = "" + parseInt(day.toString()) + "天" + result;
    }

    return result;
  }
}
export default CoordinateUtils;

function transformGeographic(gcs: Geographic) {
  let retLat =
    -100.0 +
    2.0 * gcs.longitude +
    3.0 * gcs.latitude +
    0.2 * gcs.latitude * gcs.latitude +
    0.1 * gcs.longitude * gcs.latitude +
    0.2 * Math.sqrt(Math.abs(gcs.longitude));
  retLat +=
    ((20.0 * Math.sin(6.0 * gcs.longitude * Math.PI) +
      20.0 * Math.sin(2.0 * gcs.longitude * Math.PI)) *
      2.0) /
    3.0;
  retLat +=
    ((20.0 * Math.sin(gcs.latitude * Math.PI) +
      40.0 * Math.sin((gcs.latitude / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  retLat +=
    ((160.0 * Math.sin((gcs.latitude / 12.0) * Math.PI) +
      320 * Math.sin((gcs.latitude * Math.PI) / 30.0)) *
      2.0) /
    3.0;
  let retLng =
    300.0 +
    gcs.longitude +
    2.0 * gcs.latitude +
    0.1 * gcs.longitude * gcs.longitude +
    0.1 * gcs.longitude * gcs.latitude +
    0.1 * Math.sqrt(Math.abs(gcs.longitude));
  retLng +=
    ((20.0 * Math.sin(6.0 * gcs.longitude * Math.PI) +
      20.0 * Math.sin(2.0 * gcs.longitude * Math.PI)) *
      2.0) /
    3.0;
  retLng +=
    ((20.0 * Math.sin(gcs.longitude * Math.PI) +
      40.0 * Math.sin((gcs.longitude / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  retLng +=
    ((150.0 * Math.sin((gcs.longitude / 12.0) * Math.PI) +
      300.0 * Math.sin((gcs.longitude / 30.0) * Math.PI)) *
      2.0) /
    3.0;
  return new Geographic(retLng, retLat);
}

/**
 * @descripttion:
 * @param {Geographic} gcs
 * @return {*}
 * @author: EV-申小虎
 */
function outofchina(gcs: Geographic) {
  return (
    gcs.longitude < 72.004 ||
    gcs.longitude > 137.8347 ||
    gcs.latitude < 0.8293 ||
    gcs.latitude > 55.8271 ||
    false
  );
}
