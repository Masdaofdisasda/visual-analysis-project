uniform sampler2D positions;
uniform float uDeltaTime;
uniform float uFrequency;

varying vec2 vUv;

void main() {
  // Read current position from the positions texture
    vec3 pos = texture2D(positions, vUv).rgb;

    // Calculate rotation angle (example: rotate 1 radian per second)
    float angle = uDeltaTime;
    float c = cos(angle);
    float s = sin(angle);

    // Standard 2D rotation around Y-axis in the XZ plane
    float x = pos.x;
    float z = pos.z;
    float newX = c * x - s * z;
    float newZ = s * x + c * z;

    // Update pos
    pos.x = newX;
    pos.z = newZ;

    // Write out the updated position
    gl_FragColor = vec4(pos, 1.0);
}
