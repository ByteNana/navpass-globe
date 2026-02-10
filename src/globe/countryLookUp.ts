type Coord = [number, number] // [lon, lat]

function pointInRing(point: Coord, ring: Coord[]) {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

function pointInPolygon(point: Coord, polygon: Coord[][]) {
  // polygon = [outerRing, hole1, hole2...]
  if (!polygon.length) return false

  // deve estar dentro do contorno externo
  if (!pointInRing(point, polygon[0])) return false

  // não pode estar dentro de buracos
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false
  }

  return true
}

/**
 * Retorna o feature do país que contém o ponto (lat, lon)
 */
export function findCountryFeature(
  geojson: any,
  lat: number,
  lon: number
) {
  const point: Coord = [lon, lat]

  for (const feature of geojson.features) {
    const geom = feature.geometry
    if (!geom) continue

    if (geom.type === 'Polygon') {
      if (pointInPolygon(point, geom.coordinates)) {
        return feature
      }
    }

    if (geom.type === 'MultiPolygon') {
      for (const polygon of geom.coordinates) {
        if (pointInPolygon(point, polygon)) {
          return feature
        }
      }
    }
  }

  return null
}
