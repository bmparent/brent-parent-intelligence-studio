uniform float uTime;
uniform float uPulse;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vPulse;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec3 p = position;
  float ripple = sin((position.y + position.x) * 8.0 + uTime * 2.2) * 0.025;
  p += normal * (ripple + uPulse * 0.06);
  vec4 worldPosition = modelMatrix * vec4(p, 1.0);
  vWorldPosition = worldPosition.xyz;
  vPulse = ripple + uPulse;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
