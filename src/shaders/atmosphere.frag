uniform vec3 uCameraPos;

varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 viewDir = normalize(uCameraPos - vWorldPos);

  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(clamp(fresnel, 0.0, 1.0), 3.0);

  vec3 color = vec3(0.3, 0.6, 1.0);
  gl_FragColor = vec4(color, fresnel * 0.05);
}
