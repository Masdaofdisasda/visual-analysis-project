uniform float uIntensityScale;

varying float vLifeFrac;

// Approximate RGB from Kelvin temperature (in range ~1000K to 10000K)
// based on https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
vec3 blackbody(float kelvin) {
    float t = kelvin / 1000.0;

    float r = clamp(
        t <= 66.0 ? 1.0 :
        1.292936186062745 * pow(t - 60.0, -0.1332047592),
        0.0, 1.0
    );

    float g = clamp(
        t <= 66.0 ?
        0.39008157876901960784 * log(t) - 0.63184144378862745098 :
        1.12989086089529411765 * pow(t - 60.0, -0.0755148492),
        0.0, 1.0
    );

    float b = clamp(
        t >= 66.0 ? 1.0 :
        t <= 19.0 ? 0.0 :
        0.54320678911019607843 * log(t - 10.0) - 1.19625408914,
        0.0, 1.0
    );

    return vec3(r, g, b);
}

void main() {
    float dist = length(gl_PointCoord - 0.5);
    if (dist > 0.5) discard;

    // vLifeFrac goes from 0 (new) to 1 (old)
    // Map this to 10000K (new) → 1000K (old)
    float temperature = mix(35000.0, 1000.0, vLifeFrac);
    vec3 color = blackbody(temperature) * uIntensityScale;

    gl_FragColor = vec4(color, 1.0);
}
