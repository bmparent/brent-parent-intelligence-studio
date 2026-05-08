uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vAlpha;
varying float vBand;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float core = smoothstep(0.5, 0.06, d);
  float edge = smoothstep(0.24, 0.5, d);
  float shimmer = 0.78 + 0.22 * sin(uTime * 2.8 + vBand * 18.0);
  vec3 color = mix(uColorA, uColorB, vBand);
  float alpha = core * vAlpha * shimmer * (1.0 - edge * 0.62) * 0.42;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(color, alpha);
}
