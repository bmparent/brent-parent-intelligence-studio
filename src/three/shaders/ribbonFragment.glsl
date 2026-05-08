uniform vec3 uColor;
uniform float uOpacity;

varying vec2 vUv;
varying float vRibbon;

void main() {
  float center = smoothstep(0.5, 0.12, abs(vUv.x - 0.5));
  float dash = smoothstep(0.28, 0.98, vRibbon);
  float alpha = center * (0.24 + dash * 0.62) * uOpacity;
  gl_FragColor = vec4(uColor, alpha);
}
