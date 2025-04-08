uniform sampler2D texPositions;
uniform float uMaxLife;

varying float vLifeFrac; // pass to fragment

void main() {
    vec4 posAge = texture2D(texPositions, position.xy);
    vec3 pos = posAge.xyz;
    float age = posAge.w;

    float lifeFrac = clamp(age / uMaxLife, 0.0, 1.0);
    vLifeFrac = lifeFrac;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);

    gl_PointSize = mix(3.0, 0.0, lifeFrac); // shrink to 0 at end of life
}
