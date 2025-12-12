/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 23:15:06
 * @LastEditors: Xiaohu.Shen
 */
export default `
uniform vec4 color;
uniform float speed;
uniform sampler2D image;
uniform vec2 repeat;
uniform float lineWidthPx;
uniform float imageHeightPx;
uniform float mode;
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * 0.01 * speed);
    float s = fract(st.s * repeat.x - time);
    float texH = max(imageHeightPx, 1.0);
    float lw = max(lineWidthPx, 1.0);
    float ratio = lw / texH; // 线宽与纹理高度的比值
    float v;
    float modeF = mode; // 0-fit, 1-fill, 2-repeatY
    if (modeF < 0.5) {
        // 居中取带宽为 ratio 的采样窗口
        float offset = 0.5 - 0.5 * ratio;
        v = clamp(offset + st.t * ratio, 0.0, 1.0);
    } else if (modeF < 1.5) {
        // 直接填充整张纹理
        v = st.t;
    } else {
        // 纵向按比率重复采样
        v = fract(st.t * ratio * repeat.y);
    }
    vec4 colorImage = texture(image, vec2(s, v));
    vec3 tinted = colorImage.rgb * color.rgb;
    float baseAlpha = 0.15;
    material.alpha = clamp(colorImage.a + baseAlpha, 0.0, 1.0);
    material.diffuse = tinted;
    return material;
}
`;
