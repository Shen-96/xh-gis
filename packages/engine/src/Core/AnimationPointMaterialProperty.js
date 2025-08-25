/*
 * @Descripttion: 
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2021-06-27 18:08:35
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2022-10-24 11:24:54
 */
import * as Cesium from '@/Cesium/Source/Cesium';
import createPropertyDescriptor from "@/Cesium/Source/DataSources/createPropertyDescriptor.js";
import Property from "@/Cesium/Source/DataSources/Property.js";

const source = "czm_material czm_getMaterial(czm_materialInput materialInput)\n" +
    "{\n" +
    "czm_material material = czm_getDefaultMaterial(materialInput);\n" +
    "material.diffuse = 1.5 * color.rgb;\n" +
    "vec2 st = materialInput.st;\n" +
    "float dis = distance(st, vec2(0.5, 0.5));\n" +
    "float per = fract(time);\n" +
    "if(dis > per * 0.5){\n" +
    "material.alpha = 0.0;\n" +
    "discard;\n" +
    "}else {\n" +
    "material.alpha = color.a  * dis / per / 1.0;\n" +
    "}\n" +
    "return material;\n" +
    "}";
function AnimationPointMaterialProperty(color, duration) {
    Cesium.PolylineTrailLinkMaterialProperty = AnimationPointMaterialProperty;
    Cesium.Material.AnimationPointMaterialType = 'AnimationPoint';
    Cesium.Material.AnimationPointMaterialSource = source;
    Cesium.Material._materialCache.addMaterial(Cesium.Material.AnimationPointMaterialType, {
        fabric: {
            type: Cesium.Material.AnimationPointMaterialType,
            uniforms: {
                color: new Cesium.Color(1.0, 0.0, 0.0, 1),
                time: 0
            },
            source: Cesium.Material.AnimationPointMaterialSource
        },
        translucent: function (material) {
            return true;
        }
    });
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = color;
    this.duration = duration;
    this._time = (new Date()).getTime();
}

Object.defineProperties(AnimationPointMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return Property.isConstant(this._color);
        },
    },

    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        },
    },

    color: createPropertyDescriptor("color"),
});

AnimationPointMaterialProperty.prototype.getType = function () {
    return "AnimationPoint";
};

AnimationPointMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.time = ((new Date()).getTime() - this._time) % this.duration / this.duration;
};

AnimationPointMaterialProperty.prototype.equals = function (other) {
    return (
        this === other ||
        other instanceof AnimationPointMaterialProperty &&
        Property.equals(this._color, other._color)
    );
};
export default AnimationPointMaterialProperty;
