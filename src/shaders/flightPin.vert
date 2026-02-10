attribute float aKind; // 0 = hover, 1 = selected
attribute float aSeed;

uniform float uTime;
uniform float uCameraDistance;
uniform float uHoverMix;
uniform float uSelectedMix;

varying float vKind;
varying float vSeed;
varying float vMix;
varying float vFacing;
varying float vZoom;

void main() {
  vKind = aKind;
  vSeed = aSeed;

  float kind = step(0.5, aKind);
  float showMix = mix(uHoverMix, uSelectedMix, kind);
  vMix = showMix;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float dist = max(1.0, -mvPosition.z);

  float zoom = clamp((32.0 - uCameraDistance) / 16.0, 0.0, 1.0);
  vZoom = zoom;

  float pulse = 0.84 + 0.16 * sin(uTime * 2.2 + aSeed * 6.2831 + kind * 1.7);
  float base = mix(2.35, 3.55, zoom);
  float pointSize = base * pulse * showMix * (240.0 / dist);

  // Horizon fade helper.
  vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vFacing = dot(normalize(worldPos), normalize(cameraPosition));

  gl_PointSize = clamp(pointSize, 0.0, 52.0);
  gl_Position = projectionMatrix * mvPosition;
}

