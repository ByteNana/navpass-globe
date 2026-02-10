precision mediump float;

uniform float uTime;
uniform vec3 uHoverColor;
uniform vec3 uSelectedColor;
uniform float uAlpha;

varying float vKind;
varying float vSeed;
varying float vMix;
varying float vFacing;
varying float vZoom;

void main() {
  if (vMix < 0.001) discard;

  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float core = smoothstep(0.20, 0.0, d);
  float glow = smoothstep(0.5, 0.12, d);

  float ringOuter = smoothstep(0.5, 0.41, d);
  float ringInner = smoothstep(0.34, 0.27, d);
  float ring = clamp(ringOuter - ringInner, 0.0, 1.0);

  float kind = step(0.5, vKind);
  vec3 col = mix(uHoverColor, uSelectedColor, kind);

  float shimmer = 0.88 + 0.12 * sin(uTime * 3.4 + vSeed * 6.2831 + kind * 1.2);

  // Tiny breathing halo.
  float breathe = 0.85 + 0.15 * sin(uTime * 1.6 + vSeed * 4.0);

  // Horizon fade so the pin doesn't pop at the limb.
  float limb = smoothstep(0.03, 0.18, vFacing);
  limb = pow(limb, 1.25);

  float zoomFade = 0.55 + 0.45 * vZoom;

  float alpha = (glow * 0.55 + ring * 0.95 + core * 0.65) * uAlpha * shimmer * breathe * vMix * limb * zoomFade;

  // Slightly whiter ring on selected.
  col = mix(col, vec3(1.0), ring * kind * 0.22);

  gl_FragColor = vec4(col, alpha);
}

