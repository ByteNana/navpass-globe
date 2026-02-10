import * as THREE from 'three'
import { latLongToVector3 } from './latLongtoVector3'

let current: THREE.Object3D | null = null
let currentMat: THREE.ShaderMaterial | null = null
let pulsePhase = Math.random() * Math.PI * 2

const VERT = /* glsl */ `
attribute float aT;
attribute float aSeed;
uniform float uPulse;
varying float vT;
varying float vSeed;

void main() {
  vT = aT;
  vSeed = aSeed;
  vec3 p = position * (1.0 + uPulse);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const FRAG = /* glsl */ `
precision mediump float;
uniform float uTime;
uniform float uOpacity;
varying float vT;
varying float vSeed;

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
  float flow = vT + uTime * 0.06 + vSeed * 0.05;
  float hue = fract(flow);
  float shimmer = 0.75 + 0.25 * sin((flow + uTime * 0.18) * 6.2831);
  vec3 color = googlePaletteSmooth(hue) * shimmer;
  gl_FragColor = vec4(color, uOpacity);
}
`

export function highlightCountryFromFeature(
  feature: any,
  parent: THREE.Object3D,
  radius: number
) {
  if (current) {
    parent.remove(current)
    current = null
  }

  const group = new THREE.Group()

  const geom = feature.geometry
  const polys = geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates]

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.9 },
      uPulse: { value: 0 }
    }
  })
  currentMat = mat
  pulsePhase = Math.random() * Math.PI * 2

  for (const poly of polys) {
    for (const ring of poly) {
      const pts: THREE.Vector3[] = []
      const tValues: number[] = []
      const seedValues: number[] = []
      for (const [lng, lat] of ring) {
        const v = latLongToVector3(lat, lng, radius * 1.008) // acima da superfície (saltar)
        pts.push(v)
      }

      const lineGeom = new THREE.BufferGeometry().setFromPoints(pts)
      const ringSeed = Math.random()
      for (let i = 0; i < pts.length; i++) {
        tValues.push(i / Math.max(1, pts.length - 1))
        seedValues.push(ringSeed)
      }
      lineGeom.setAttribute(
        'aT',
        new THREE.Float32BufferAttribute(tValues, 1)
      )
      lineGeom.setAttribute(
        'aSeed',
        new THREE.Float32BufferAttribute(seedValues, 1)
      )
      const line = new THREE.Line(lineGeom, mat)
      line.renderOrder = 10
      group.add(line)
    }
  }

  parent.add(group)
  current = group
}

export function clearHighlight(parent: THREE.Object3D) {
  if (!current) return
  parent.remove(current)
  current.traverse(obj => {
    if (obj instanceof THREE.Line) {
      obj.geometry.dispose()
    }
  })
  currentMat?.dispose()
  current = null
  currentMat = null
}

export function updateCountryHighlight(timeSeconds: number) {
  if (!currentMat) return
  const pulse = 0.010 + 0.008 * Math.sin(timeSeconds * 1.8 + pulsePhase)
  const alpha = 0.78 + 0.22 * Math.sin(timeSeconds * 1.6 + pulsePhase)
  currentMat.uniforms.uTime.value = timeSeconds
  currentMat.uniforms.uPulse.value = pulse
  currentMat.uniforms.uOpacity.value = alpha
}
