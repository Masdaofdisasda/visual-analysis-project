uniform sampler2D texPositions;
uniform sampler2D texVelocities;
uniform float uDeltaTime;
uniform float uMaxLife;         // maximum lifetime in seconds
uniform float uTime;            // for random seed

varying vec2 vUv;

// A tiny 2D->2D hash function
vec2 rand2(vec2 p) {
  // fract(sin(dot(...)) * largeConstant) approach
  float n = sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453;
  return fract(vec2(n, n*1.12345));
}

vec3 randomSphere(vec2 seed) {
  // 2 random values in [0..1]
  vec2 r2 = rand2(seed);
  float theta = acos(r2.x * 2.0 - 1.0); // [0..π]
  float phi = r2.y * 2.0 * 3.14159265;  // [0..2π]

  float rr = 1.0; // spawn radius if you want
  float sinT = sin(theta);
  float x = rr * sinT * cos(phi);
  float y = rr * sinT * sin(phi);
  float z = rr * cos(theta);
  return vec3(x, y, z);
}

void main() {
    vec4 posAge = texture2D(texPositions, vUv);
    vec4 velData = texture2D(texVelocities, vUv);

    vec3 pos = posAge.xyz;
    float age = posAge.w;

    vec3 vel = velData.xyz;

    // 1) increment age
    age += uDeltaTime;

    // 2) check if we exceed lifetime
    if(age > uMaxLife) {
        // respawn
        vec2 r2 = rand2(vUv + uTime);
        vec3 spawnPos = randomSphere(r2) * 0.1;

        pos = spawnPos;
        age = 0.0;

        // optional: also reset velocity
        // e.g. random small velocity
        vec2 r2vel = rand2(vUv + uTime * 1.2345);
        vel = (vec3(r2vel - 0.5, 0.0) * 2.0) * 0.3;
    }
    else {
        // normal Euler position update
        pos += vel * uDeltaTime;
    }

    gl_FragColor = vec4(pos, age); // store updated pos & new age
}
