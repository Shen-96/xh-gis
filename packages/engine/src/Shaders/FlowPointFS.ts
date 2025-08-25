/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-03-29 14:44:48
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-04-14 11:14:09
 */

export default `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * 0.01 * speed);
    vec4 bgImage = texture(background, st);
    float x = reverse ? -st.s + 1. : st.s;
    vec4 ptImage = texture(point, vec2(fract(x - time), st.t));
    //vec4 exclusion = bgImage + ptImage - (2. * bgImage * ptImage);
    material.diffuse = bgImage.rgb + ptImage.rgb;
    material.alpha = bgImage.a;
    return material;
}
`;
