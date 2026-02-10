import * as THREE from 'three'
import { latLongToVector3 } from './latLongtoVector3'

export function createCountryMeshes(
  geojson: any,
  radius: number
) {
  const group = new THREE.Group()

  for (const feature of geojson.features) {
    const geom = feature.geometry
    const polys = geom.type === 'MultiPolygon'
      ? geom.coordinates
      : [geom.coordinates]

    for (const poly of polys) {
      for (const ring of poly) {
        const shape = new THREE.Shape()

        ring.forEach(([lng, lat]: [number, number], i: number) => {
          const v = latLongToVector3(lat, lng, radius * 0.996)

          if (i === 0) shape.moveTo(v.x, v.y)
          else shape.lineTo(v.x, v.y)
        })

        const geometry = new THREE.ShapeGeometry(shape)

        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.0, // 👈 invisível
          depthWrite: false
        })

        const mesh = new THREE.Mesh(geometry, material)

        mesh.userData = {
          name: feature.properties.NAME,
          iso: feature.properties.ISO_A2
        }

        group.add(mesh)
      }
    }
  }

  return group
}
