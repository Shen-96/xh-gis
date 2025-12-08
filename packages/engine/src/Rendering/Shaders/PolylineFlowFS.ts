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
    float s = fract(st.s * repeat.x - time);
    float v = sample1D ? clamp(0.5 + (st.t - 0.5) * vScale, 0.0, 1.0) : fract(st.t * repeat.y);
    vec4 colorImage = texture(image, vec2(s, v));
    material.alpha = colorImage.a;
    material.diffuse = colorImage.rgb ;
    return material;
}
`;
