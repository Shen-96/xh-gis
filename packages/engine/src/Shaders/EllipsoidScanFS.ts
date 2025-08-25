/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-04-25 16:02:17
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2023-04-25 16:04:37
 */

export default `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * speed * 0.01);
    float alpha = smooth ? abs(smoothstep(0.9,1.,fract(-st.s - time))) : fract(st.s - time) < .9 ? 0.2 : .7;
    alpha += .1;
    material.alpha = alpha;
    material.diffuse = color.rgb;
    return material;
}
`;
