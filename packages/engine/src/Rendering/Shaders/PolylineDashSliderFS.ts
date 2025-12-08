/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
 * @Date: 2023-03-29 14:44:48
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-08 17:04:35
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

    /// 视窗锚定单滑块（循环模式，方向由 reverse 控制）
    float viewportWidth = czm_viewport.z;
    float timePhase = fract(timeSeconds * speed);
    float dir = reverse ? -1.0 : 1.0;
    float centerX = mod(dir * timePhase * viewportWidth, viewportWidth);

    /// 计算滑块长度（像素）
    float sliderLengthPx = sliderLength * czm_pixelRatio;
    float mT = materialInput.st.t;
    bool insideX = abs(pos.x - centerX) <= (sliderLengthPx * 0.5);
    bool insideY = abs(mT - 0.5) <= (sliderHeightRatio * 0.5);
    if (insideX && insideY) {
        fragColor = sliderColor;
    }

    if (fragColor.a < 0.005) {   // matches 0/255 and 1/255
        discard;
    }

    fragColor = czm_gammaCorrect(fragColor);
    material.emission = fragColor.rgb;
    material.alpha = fragColor.a;
    return material;
}
`;
