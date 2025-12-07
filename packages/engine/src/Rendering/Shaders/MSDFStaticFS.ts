export default `
uniform vec4 color;
uniform sampler2D image;
uniform vec2 repeat;
uniform float smooth;
uniform float center;

float median(float r, float g, float b) { return max(min(r, g), min(max(r, g), b)); }

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    vec2 uv = vec2(fract(st.s * repeat.x), fract(st.t * repeat.y));
    vec4 tex = texture(image, uv);

    float dist = median(tex.r, tex.g, tex.b) - center;
    float w = max(fwidth(dist), 0.0001) * smooth;
    float alpha = smoothstep(-w, w, dist);

    material.alpha = alpha;
    material.diffuse = color.rgb;
    return material;
}
`;
