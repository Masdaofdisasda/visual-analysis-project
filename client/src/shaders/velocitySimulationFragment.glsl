uniform sampler2D texPositions;
uniform sampler2D texVelocities;
uniform float uDeltaTime;
uniform vec3 uGlobalForce; // e.g. some uniform force or external steering

varying vec2 vUv;

void main() {
  vec3 pos = texture2D(texPositions, vUv).xyz;
  vec3 vel = texture2D(texVelocities, vUv).xyz;

  // For example, a gravitational center at (0,0,0):
  vec3 toCenter = -pos;
  float dist = length(toCenter);
  // e.g. gravitational force scaled by dist
  vec3 accel = normalize(toCenter) * (1.0 / (dist * dist + 0.1));

  // Combine with uniform external forces
  accel += uGlobalForce;

  // Euler: v(t+dt) = v(t) + a(t)*dt
  vel += accel * uDeltaTime;

  gl_FragColor = vec4(vel, 1.0);
}
