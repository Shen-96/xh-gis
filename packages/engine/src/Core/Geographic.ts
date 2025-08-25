/*
 * @Descripttion:
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-05-27 13:37:36
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-04-17 09:57:01
 */

class Geographic {
  /**
   * @descripttion: 地理坐标
   * @param {number} longitude 经度
   * @param {number} latitude 纬度
   * @param {number} altitude 高程
   * @author: EV-申小虎
   */
  constructor(longitude: number, latitude: number, altitude = 0) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
  }

  longitude: number;
  latitude: number;
  altitude: number;
}

export default Geographic;
