import * as THREE from 'three'

export function vector3ToLatLon(v: THREE.Vector3) {
  const n = v.clone().normalize()

  // latitude
  const lat = Math.asin(n.y) * (180 / Math.PI)

  // theta do seu forward: atan2(z, -x)
  const theta = Math.atan2(n.z, -n.x) * (180 / Math.PI)

  // desfaz o (lon + 180)
  let lon = theta - 180

  // normaliza pra [-180, 180]
  if (lon < -180) lon += 360
  if (lon > 180) lon -= 360

  return { lat, lon }
}
