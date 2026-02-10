import * as THREE from 'three'
import { latLongToVector3 } from './latLongtoVector3'

type PlaneCoord = {
  lat: number
  lon: number
  headingDeg: number
}

const DEFAULT_PLANES: PlaneCoord[] = [
  { lat: 37.6213, lon: -122.379, headingDeg: 80 },   // SFO
  { lat: 40.6413, lon: -73.7781, headingDeg: 120 },  // JFK
  { lat: 51.4700, lon: -0.4543, headingDeg: 45 },    // LHR
  { lat: -23.4356, lon: -46.4731, headingDeg: 300 }, // GRU
  { lat: 35.5494, lon: 139.7798, headingDeg: 200 },  // HND
  { lat: -33.8688, lon: 151.2093, headingDeg: 20 },  // SYD
  { lat: 25.2528, lon: 55.3644, headingDeg: 10 },    // DXB
  { lat: 48.8566, lon: 2.3522, headingDeg: 260 }     // Paris
]

function buildPlaneMesh(color = 0xffffff) {
  const body = new THREE.ConeGeometry(0.08, 0.35, 6)
  const mat = new THREE.MeshBasicMaterial({ color })
  const mesh = new THREE.Mesh(body, mat)
  mesh.rotation.x = Math.PI / 2
  return mesh
}

export function createPlanes(radius: number, planes: PlaneCoord[] = DEFAULT_PLANES) {
  const group = new THREE.Group()
  const up = new THREE.Vector3(0, 1, 0)

  for (const plane of planes) {
    const pos = latLongToVector3(plane.lat, plane.lon, radius * 1.03)
    const normal = pos.clone().normalize()
    const mesh = buildPlaneMesh(0xffffff)
    mesh.position.copy(pos)

    const qAlign = new THREE.Quaternion().setFromUnitVectors(up, normal)
    mesh.quaternion.copy(qAlign)

    const heading = THREE.MathUtils.degToRad(plane.headingDeg)
    mesh.rotateOnAxis(normal, heading)

    mesh.renderOrder = 6
    mesh.frustumCulled = false
    group.add(mesh)
  }

  return group
}
