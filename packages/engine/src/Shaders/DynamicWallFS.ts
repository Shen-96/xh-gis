/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-02-16 16:52:25
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-04-14 10:08:06
 */

export default `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * 0.01 * speed);
    vec4 colorImage = texture(image, vec2(fract(st.t - time), st.t));
    vec4 fragColor;
    fragColor.rgb = color.rgb / 1.0;
    fragColor = czm_gammaCorrect(fragColor);
    material.alpha = colorImage.a * color.a;
    material.diffuse = color.rgb;
    material.emission = fragColor.rgb;
    return material;
}`;
