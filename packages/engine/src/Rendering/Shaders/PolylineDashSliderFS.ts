/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-03-29 14:44:48
 * @LastEditors: Xiaohu.Shen
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

    float sliderLocalLength = sliderLength * czm_pixelRatio;

    vec2 st = materialInput.st;
    float timePhase = fract(timeSeconds * speed);
    float dir = reverse ? -1.0 : 1.0;

    // 方案A：视窗锚定单滑块
    float viewportWidth = czm_viewport.z;
    float centerX = mod(dir * timePhase * viewportWidth, viewportWidth);

    bool insideX = abs(pos.x - centerX) <= (sliderLocalLength * 0.5);
    bool insideY = abs(st.t - 0.5) <= (sliderHeightRatio * 0.5);
    if (insideX && insideY) {
        fragColor = sliderColor;
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
