uniform sampler2D texPositions;
uniform sampler2D texVelocities;
uniform float uDeltaTime;
uniform vec3 uForce;         // external force
uniform float uDamping;      // velocity damping factor
uniform float uBoundaryRadius;

varying vec2 vUv;

void main() {
  vec3 pos = texture2D(texPositions, vUv).xyz;
  vec3 vel = texture2D(texVelocities, vUv).xyz;

  // === 1) Basic acceleration from external force ===
  vec3 accel = uForce;

  // === 2) Boundary check (simple bounding sphere) ===
  float dist = length(pos);
  if (dist > uBoundaryRadius) {
    // push them back inside by adding acceleration
    vec3 dirBack = -normalize(pos);
    // scale by how far beyond the boundary we are, e.g. *2.0 for strength
    accel += dirBack * (dist - uBoundaryRadius) * 2.0;
  }

  // === 3) Euler update velocity ===
  // v_new = v_old + accel * dt
  vel += accel * uDeltaTime;

  // === 4) Damping ===
  // e.g. v *= 1 - (damping * dt)
  vel *= 1.0 - (uDamping * uDeltaTime);

  gl_FragColor = vec4(vel, 1.0);
}
