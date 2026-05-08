uniform float uTime;
uniform float uScroll;
uniform float uFocus;
uniform vec2 uPointer;

attribute float aSeed;

varying float vAlpha;
varying float vBand;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float wave(float value, float seed) {
  return sin(value + seed * 6.28318) * cos(value * 0.47 + seed * 4.0);
}

void main() {
  vec3 p = position;
  float t = uTime * 0.18;
  float lane = floor(aSeed * 16.0);
  float ring = 1.4 + hash(lane + 9.1) * 3.7;
  float angle = aSeed * 31.416 + uScroll * 5.4;
  vec3 structured = vec3(cos(angle) * ring, sin(angle * 0.77) * ring * 0.48, sin(angle) * ring);

  p.x += wave(t * 2.2 + p.z * 0.55, aSeed) * 0.38;
  p.y += wave(t * 2.7 + p.x * 0.35, aSeed + 0.13) * 0.25;
  p.z += wave(t * 1.8 + p.y * 0.42, aSeed + 0.39) * 0.32;

  float organize = smoothstep(0.10, 0.72, uScroll);
  p = mix(p, structured, organize * 0.68);

  float pointerFalloff = smoothstep(3.8, 0.0, distance(p.xy, uPointer * vec2(4.2, 2.6)));
  p.xy += normalize(p.xy - uPointer * vec2(3.2, 2.1) + 0.001) * pointerFalloff * (0.18 + uFocus * 0.22);
  p *= 1.0 + uFocus * 0.035 * sin(uTime * 2.1 + aSeed * 20.0);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = (0.8 + hash(aSeed * 91.0) * 1.45 + uFocus * 0.6) * (150.0 / -mvPosition.z);

  vAlpha = mix(0.35, 0.85, pointerFalloff) + organize * 0.12;
  vBand = fract(lane / 6.0 + uScroll);
}
