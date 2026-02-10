import * as THREE from 'three'

export function createStarfield(count = 6000, radius = 400) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  const color = new THREE.Color()

  for (let i = 0; i < count; i++) {
    const r = radius * Math.pow(Math.random(), 0.4)
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(phi)

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z

    // estrelas levemente azuladas/brancas
    color.setHSL(0.6, 0.2, Math.random() * 0.3 + 0.7)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
    size: 0.7,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    depthTest: true   // ✅ IMPORTANTE
    })


  const stars = new THREE.Points(geometry, material)
  stars.renderOrder = -50
  return stars
}
