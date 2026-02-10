precision mediump float;

uniform float uTime;
uniform vec3 uOriginColor;
uniform vec3 uDestColor;
uniform float uAlpha;

varying float vRole;
varying float vSeed;
varying float vMix;
varying float vFacing;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float glow = smoothstep(0.5, 0.14, d);
  float core = smoothstep(0.24, 0.0, d);
  float ringOuter = smoothstep(0.5, 0.42, d);
  float ringInner = smoothstep(0.34, 0.26, d);
  float ring = clamp(ringOuter - ringInner, 0.0, 1.0);

  float shimmer = 0.9 + 0.1 * sin(uTime * 5.4 + vSeed * 6.2831);
  vec3 col = mix(uOriginColor, uDestColor, step(0.5, vRole));

  float alpha = (glow * 0.45 + ring * 0.9 + core * 0.6) * uAlpha * shimmer * vMix;

  // Horizon fade helper: keeps endpoint pulses from abruptly clipping at the limb.
  float limb = smoothstep(0.02, 0.18, vFacing);
  limb = pow(limb, 1.35);
  alpha *= limb;

  gl_FragColor = vec4(col, alpha);
}
