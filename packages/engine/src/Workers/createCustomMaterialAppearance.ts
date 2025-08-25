/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-04-25 15:57:38
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-08-14 18:47:43
 */

import { Cartesian3, Color, Material, MaterialAppearance } from "cesium";
import { GraphicOptions } from "..";
import EllipsoidScanFS from "../Shaders/EllipsoidScanFS";
import EllipsoidElectricFS from "../Shaders/EllipsoidElectricFS";
import EllipsoidSpiralFS from "../Shaders/EllipsoidSpiralFS";
import EllipsoidWaveFS from "../Shaders/EllipsoidWaveFS";
import { MaterialType } from "..";

export function createCustomMaterialAppearance(
  style: any,
  params?: { startPosition?: Cartesian3 }
) {
  let result: MaterialAppearance | undefined;

  switch (style.material?.customTexture?.type) {
    case MaterialType.EllipsoidScan:
      result = new MaterialAppearance({
        material: new Material({
          fabric: {
            uniforms: {
              color: Color.fromCssColorString(
                style.material?.customTexture?.uniforms?.color ?? "#ffff00"
              ),
              speed: style.material?.customTexture?.uniforms?.speed ?? 1,
              smooth: style.material?.customTexture?.uniforms?.smooth ?? false,
            },
            source: EllipsoidScanFS,
          },
        }),
      });
      break;
    case MaterialType.EllipsoidElectric:
      result = new MaterialAppearance({
        material: new Material({
          fabric: {
            uniforms: {
              color: Color.fromCssColorString(
                style.material?.customTexture?.uniforms?.color ?? "#ffff00"
              ),
              speed: style.material?.customTexture?.uniforms?.speed ?? 1,
            },
            source: EllipsoidElectricFS,
          },
        }),
      });
      break;
    case MaterialType.EllipsoidSpiral:
      result = new MaterialAppearance({
        material: new Material({
          fabric: {
            uniforms: {
              color: Color.fromCssColorString(
                style.material?.customTexture?.uniforms?.color ?? "#ffff00"
              ),
              speed: style.material?.customTexture?.uniforms?.speed ?? 1,
            },
            source: EllipsoidSpiralFS,
          },
        }),
      });
      break;
    case MaterialType.EllipsoidWave:
      result = new MaterialAppearance({
        material: new Material({
          fabric: {
            uniforms: {
              color: Color.fromCssColorString(
                style.material?.customTexture?.uniforms?.color ?? "#ffff00"
              ),
              speed: style.material?.customTexture?.uniforms?.speed ?? 1,
            },
            source: EllipsoidWaveFS,
          },
        }),
      });
      break;

    default:
      result = new MaterialAppearance({
        material: Material.fromType("Color", {
          color: Color.fromCssColorString(
            style.material?.fillColor ?? "rgba(255,255,0,0.3)"
          ),
        }),
      });
      break;
  }

  return result;
}
