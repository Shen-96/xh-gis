/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 */
export default `
float median(float r, float g, float b) { return max(min(r, g), min(max(r, g), b)); }

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    float time = fract(czm_frameNumber * 0.01 * speed);
    vec2 uv = vec2(fract(st.s * repeat.x - time), fract(st.t * repeat.y));
    vec4 tex = texture(image, uv);
    float distMSDF = median(tex.r, tex.g, tex.b);
    float distSDF = tex.a;
    float center = 0.5;
    float isMSDF = abs(distMSDF - center) > 0.001 ? 1.0 : 0.0;
    float sigDist = isMSDF > 0.5 ? (distMSDF - center) : (distSDF - center);
    float w = max(fwidth(sigDist), 0.0001) * smooth;
    float alpha = smoothstep(-w, w, sigDist);
    material.alpha = alpha;
    material.diffuse = color.rgb;
    return material;
}
`;
