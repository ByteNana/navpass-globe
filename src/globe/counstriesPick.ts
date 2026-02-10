import * as THREE from 'three'
import { latLongToVector3 } from './latLongtoVector3'

export function createCountriesPick(geojson: any, radius: number) {
  const group = new THREE.Group()

  for (const feature of geojson.features) {
    const geom = feature.geometry
    const polys = geom.type === 'MultiPolygon'
      ? geom.coordinates
      : [geom.coordinates]

    for (const poly of polys) {
      const shape = new THREE.Shape()

      poly[0].forEach((coord: number[], i: number) => {
        const v = latLongToVector3(coord[1], coord[0], radius)
        if (i === 0) shape.moveTo(v.x, v.y)
        else shape.lineTo(v.x, v.y)
      })

      const geometry = new THREE.ShapeGeometry(shape)
      const material = new THREE.MeshBasicMaterial({
        visible: false,
        side: THREE.FrontSide
      })


      const mesh = new THREE.Mesh(geometry, material)
      mesh.userData = {
        country: feature.properties
      }
      mesh.renderOrder = 2
      mesh.userData.feature = feature

      group.add(mesh)
    }
  }

  return group
}
