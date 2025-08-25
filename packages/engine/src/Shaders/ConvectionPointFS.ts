/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-03-29 14:44:48
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-11-04 16:18:20
 */

export default `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * 0.01 * speed);
    vec4 bgImage = texture(background, st);
    vec4 ptImage = texture(point, vec2(fract(st.s - time), st.t));
    vec4 pt2Image = texture(point, vec2(fract(-st.s + 1. - time), st.t));
    material.alpha = bgImage.a;
    material.diffuse = abs(bgImage.rgb - ptImage.rgb - pt2Image.rgb));
    return material;
}
`;
