uniform sampler2D texPositions;
uniform sampler2D texVelocities;
uniform float uDeltaTime;

varying vec2 vUv;

void main() {
  vec3 pos = texture2D(texPositions, vUv).xyz;
  vec3 vel = texture2D(texVelocities, vUv).xyz;

  pos += vel * uDeltaTime; // Euler integration step

  gl_FragColor = vec4(pos, 1.0);
}
