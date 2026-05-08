uniform float uTime;
uniform vec3 uCoreColor;
uniform vec3 uMemoryColor;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vPulse;

float scanline(vec3 p) {
  return smoothstep(0.2, 1.0, sin((p.y + uTime * 0.18) * 42.0) * 0.5 + 0.5);
}

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.2);
  float inner = 0.28 + 0.22 * sin(uTime * 1.8 + vWorldPosition.y * 3.0);
  vec3 color = mix(uCoreColor, uMemoryColor, fresnel + vPulse * 0.4);
  float alpha = 0.22 + fresnel * 0.55 + inner * 0.18 + scanline(vWorldPosition) * 0.05;
  gl_FragColor = vec4(color, alpha);
}
