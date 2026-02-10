import * as THREE from 'three'
import { latLongToVector3 } from './latLongtoVector3'

export type StoryPreset = {
  centerLat: number
  centerLon: number
  spotRadiusDeg: number
  ringRadiusDeg: number
}

const GLOW_VERT = /* glsl */ `
varying vec3 vDir;

void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const GLOW_FRAG = /* glsl */ `
precision mediump float;

uniform float uTime;
uniform float uOpacity;
uniform float uMix;
uniform vec3 uCenterDir;
uniform float uInnerCos;
uniform float uOuterCos;

varying vec3 vDir;

vec3 googlePaletteSmooth(float t) {
  vec3 c0 = vec3(0.2588, 0.5216, 0.9569); // blue
  vec3 c1 = vec3(0.2039, 0.6588, 0.3255); // green
  vec3 c2 = vec3(0.9843, 0.7373, 0.0196); // yellow
  vec3 c3 = vec3(0.9176, 0.2627, 0.2078); // red

  float a = smoothstep(0.0, 1.0, sin(t * 6.2831) * 0.5 + 0.5);
  vec3 mix1 = mix(c0, c1, a);
  vec3 mix2 = mix(c2, c3, a);
  return mix(mix1, mix2, smoothstep(0.0, 1.0, cos(t * 3.1416) * 0.5 + 0.5));
}

void main() {
  vec3 dir = normalize(vDir);
  float d = dot(dir, normalize(uCenterDir));

  // Soft spherical "spot" mask using dot thresholds (cosine space).
  float m = smoothstep(uOuterCos, uInnerCos, d);
  m = pow(m, 1.35);

  // Very subtle shimmer and color drift (Google-ish, not "carnaval").
  float t = fract(uTime * 0.035 + dir.x * 0.14 + dir.y * 0.18 + dir.z * 0.10);
  float shimmer = 0.86 + 0.14 * sin(uTime * 1.3 + (dir.x + dir.y + dir.z) * 7.0);
  vec3 color = googlePaletteSmooth(t) * shimmer;

  float a = m * uOpacity * uMix;
  gl_FragColor = vec4(color, a);
}
`

const RING_VERT = /* glsl */ `
attribute float aT;
uniform float uPulse;
varying float vT;

void main() {
  vT = aT;
  vec3 p = position * (1.0 + uPulse);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const RING_FRAG = /* glsl */ `
precision mediump float;

uniform float uTime;
uniform float uOpacity;
uniform float uMix;
varying float vT;

vec3 googlePaletteSmooth(float t) {
  vec3 c0 = vec3(0.2588, 0.5216, 0.9569); // blue
  vec3 c1 = vec3(0.2039, 0.6588, 0.3255); // green
  vec3 c2 = vec3(0.9843, 0.7373, 0.0196); // yellow
  vec3 c3 = vec3(0.9176, 0.2627, 0.2078); // red

  float a = smoothstep(0.0, 1.0, sin(t * 6.2831) * 0.5 + 0.5);
  vec3 mix1 = mix(c0, c1, a);
  vec3 mix2 = mix(c2, c3, a);
  return mix(mix1, mix2, smoothstep(0.0, 1.0, cos(t * 3.1416) * 0.5 + 0.5));
}

void main() {
  float flow = vT + uTime * 0.055;
  float hue = fract(flow);
  float shimmer = 0.72 + 0.28 * sin((flow + uTime * 0.16) * 6.2831);
  vec3 color = googlePaletteSmooth(hue) * shimmer;
  gl_FragColor = vec4(color, uOpacity * uMix);
}
`

function buildRingGeometry(
  centerDir: THREE.Vector3,
  ringAngleRad: number,
  radius: number,
  segments = 220
) {
  const c = centerDir.clone().normalize()
  const arbitrary = Math.abs(c.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
  const u = new THREE.Vector3().crossVectors(arbitrary, c).normalize()
  const v = new THREE.Vector3().crossVectors(c, u).normalize()

  const positions = new Float32Array((segments + 1) * 3)
  const tValues = new Float32Array(segments + 1)

  const cosA = Math.cos(ringAngleRad)
  const sinA = Math.sin(ringAngleRad)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const theta = t * Math.PI * 2
    const cs = Math.cos(theta)
    const sn = Math.sin(theta)

    const dir = new THREE.Vector3()
      .copy(c)
      .multiplyScalar(cosA)
      .add(u.clone().multiplyScalar(sinA * cs))
      .add(v.clone().multiplyScalar(sinA * sn))
      .normalize()
      .multiplyScalar(radius)

    positions[i * 3 + 0] = dir.x
    positions[i * 3 + 1] = dir.y
    positions[i * 3 + 2] = dir.z
    tValues[i] = t
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aT', new THREE.BufferAttribute(tValues, 1))
  geo.computeBoundingSphere()
  return geo
}

export function createStoryHighlight(globeRadius: number) {
  const group = new THREE.Group()
  group.visible = false

  const glowMat = new THREE.ShaderMaterial({
    vertexShader: GLOW_VERT,
    fragmentShader: GLOW_FRAG,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.22 },
      uMix: { value: 0 },
      uCenterDir: { value: new THREE.Vector3(0, 0, 1) },
      uInnerCos: { value: 0.9 },
      uOuterCos: { value: 0.7 }
    }
  })

  const glowMesh = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius * 1.0018, 64, 64),
    glowMat
  )
  // Draw between inner sphere (1) and borders (2) so it "underlights" the lines.
  glowMesh.renderOrder = 1.55
  glowMesh.frustumCulled = false
  group.add(glowMesh)

  const ringMat = new THREE.ShaderMaterial({
    vertexShader: RING_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.55 },
      uMix: { value: 0 },
      uPulse: { value: 0 }
    }
  })

  let ring: THREE.Line | null = null
  let currentMix = 0
  let targetMix = 0
  let pulsePhase = Math.random() * Math.PI * 2

  function setPreset(preset: StoryPreset | null) {
    if (!preset) {
      targetMix = 0
      return
    }

    const centerDir = latLongToVector3(preset.centerLat, preset.centerLon, 1).normalize()
    const spotRadiusRad = THREE.MathUtils.degToRad(preset.spotRadiusDeg)
    const ringRadiusRad = THREE.MathUtils.degToRad(preset.ringRadiusDeg)

    glowMat.uniforms.uCenterDir.value.copy(centerDir)
    glowMat.uniforms.uOuterCos.value = Math.cos(spotRadiusRad)
    glowMat.uniforms.uInnerCos.value = Math.cos(spotRadiusRad * 0.62)

    // Rebuild ring geometry per preset (few presets, cheap and predictable).
    const ringGeo = buildRingGeometry(centerDir, ringRadiusRad, globeRadius * 1.0105)
    if (ring) {
      ring.geometry.dispose()
      ring.geometry = ringGeo
    } else {
      ring = new THREE.Line(ringGeo, ringMat)
      ring.renderOrder = 26
      ring.frustumCulled = false
      group.add(ring)
    }

    pulsePhase = Math.random() * Math.PI * 2
    targetMix = 1
    group.visible = true
  }

  function update(timeSeconds: number, cameraDistance: number) {
    glowMat.uniforms.uTime.value = timeSeconds
    ringMat.uniforms.uTime.value = timeSeconds

    // Fade in/out smoothly.
    const smoothing = targetMix > currentMix ? 0.085 : 0.11
    currentMix += (targetMix - currentMix) * smoothing
    glowMat.uniforms.uMix.value = currentMix
    ringMat.uniforms.uMix.value = currentMix

    // Zoom-adaptive opacity: far = cleaner/subtler, near = richer.
    const zoomFactor = THREE.MathUtils.clamp((28 - cameraDistance) / 12, 0, 1)
    glowMat.uniforms.uOpacity.value = 0.16 + 0.10 * zoomFactor
    ringMat.uniforms.uOpacity.value = 0.30 + 0.40 * zoomFactor

    ringMat.uniforms.uPulse.value = 0.004 + 0.003 * Math.sin(timeSeconds * 1.2 + pulsePhase)

    // When fully faded out, hide (keeps CPU/GPU quieter).
    if (targetMix === 0 && currentMix < 0.01) {
      group.visible = false
    }
  }

  return {
    group,
    setPreset,
    update
  }
}

