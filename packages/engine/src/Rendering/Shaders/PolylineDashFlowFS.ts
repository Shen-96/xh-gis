/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-07 20:04:16
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-08 10:44:53
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

    // base dash
    float dashPosition = fract(pos.x / (dashLength * czm_pixelRatio));
    float maskIndex = floor(dashPosition * maskLength);
    float maskTest = floor(dashPattern / pow(2.0, maskIndex));

    float flow = fract(timeSeconds * speed);
    float flowPos = fract(dashPosition + (reverse ? flow : -flow));
    float flowMaskIndex = floor(flowPos * maskLength);
    float flowMaskTest = floor(dashPattern / pow(2.0, flowMaskIndex));
    vec4 fragColor = (mod(flowMaskTest, 2.0) < 1.0) ? gapColor : color;

    if (fragColor.a < 0.005) {
        discard;
    }

    fragColor = czm_gammaCorrect(fragColor);
    material.emission = fragColor.rgb;
    material.alpha = fragColor.a;
    return material;
}
`;
