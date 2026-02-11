attribute float size;
attribute float aSeed;

varying vec3 vColor;
varying float vSeed;
varying float vFacing;

void main() {
  vColor = color;
  vSeed = aSeed;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // Horizon fade helper (helps prevent hard clipping at the limb).
  vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vFacing = dot(normalize(worldPos), normalize(cameraPosition));

  float pointSize = size * (152.0 / max(1.0, -mvPosition.z));
  gl_PointSize = clamp(pointSize, 1.0, 9.0);

  gl_Position = projectionMatrix * mvPosition;
}
