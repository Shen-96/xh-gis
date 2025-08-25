/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-03-29 14:44:48
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-04-27 12:52:11
 */

export default `
in float v_polylineAngle;

const float maskLength = 16.0;

mat2 rotate(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat2(
        c, s,
        -s, c
    );
}


czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);

    vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;

    // Get the relative position within the dash from 0 to 1
    float dashPosition = fract(pos.x / (dashLength * czm_pixelRatio));
    // Figure out the mask index.
    float maskIndex = floor(dashPosition * maskLength);
    // Test the bit mask.
    float maskTest = floor(dashPattern / pow(2.0, maskIndex));
    vec4 fragColor = (mod(maskTest, 2.0) < 1.0) ? gapColor : color;

    vec2 st = materialInput.st;
    /// 滑块的归化坐标
    vec2 sliderUV = vec2(fract(czm_frameNumber * 0.01 * speed), .5);
    /// 偏移量
    float offsetX = reverse ? -sliderUV.x + 1. - st.s : sliderUV.x - st.s;

    /// 起点屏幕坐标
    vec4 startPosWinC = czm_modelToWindowCoordinates(vec4(startPosition, 1.));
    /// 旋转后坐标
    vec2 startPos = rotate(v_polylineAngle) * startPosWinC.xy;

    if(abs(pos.x - startPos.x) * abs(offsetX) / st.s < (sliderLength / 2. * czm_pixelRatio)){
        fragColor = sliderColor * 1.5;
    }

    if (fragColor.a < 0.005) {   // matches 0/255 and 1/255
        discard;
    }

    fragColor = czm_gammaCorrect(fragColor);
    material.emission = fragColor.rgb;
    //material.diffuse = fragColor.rgb;
    material.alpha = fragColor.a;
    return material;
}
`;
