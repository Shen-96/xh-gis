/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @version: 1.0.0
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
    material.diffuse = bgImage.rgb + ptImage.rgb;
    material.alpha = bgImage.a;
    return material;
}
`;
