uniform float uTime;
uniform float uFlow;

varying vec2 vUv;
varying float vRibbon;

void main() {
  vUv = uv;
  vec3 p = position;
  p.x += sin(uv.y * 16.0 + uTime * 1.7) * 0.018 * uFlow;
  p.y += cos(uv.y * 11.0 + uTime * 1.2) * 0.014 * uFlow;
  vRibbon = sin(uv.y * 18.0 - uTime * 2.4) * 0.5 + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
