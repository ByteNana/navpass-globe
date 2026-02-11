precision mediump float;

uniform float uTime;
uniform float uCameraDistance;
uniform vec3 uColorMul;
uniform float uAlphaMul;

varying vec3 vColor;
varying float vSeed;
varying float vFacing;

void main() {
  // Coordenada dentro do ponto (0–1)
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);

  // círculo
  if (d > 0.5) discard;

  // glow suave
  float alpha = smoothstep(0.5, 0.1, d);

  float shimmer = 0.9 + 0.1 * sin(uTime * 2.2 + vSeed * 6.2831);
  float zoom = clamp((32.0 - uCameraDistance) / 16.0, 0.0, 1.0);
  float zoomFade = 0.35 + 0.65 * zoom;

  float limb = smoothstep(0.02, 0.18, vFacing);
  limb = pow(limb, 1.25);

  gl_FragColor = vec4(vColor * uColorMul * shimmer, alpha * zoomFade * uAlphaMul * limb);
}
