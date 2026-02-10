import * as THREE from 'three'

export function createDepthMaskSphere(radius: number) {
  const geometry = new THREE.SphereGeometry(radius * 1.0005, 96, 96)

  // IMPORTANTE:
  // - colorWrite: false => não desenha cor (invisível)
  // - depthWrite: true  => escreve depth (oclusão real)
  const material = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: true,
    depthTest: true
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.renderOrder = 0 // desenha primeiro, antes de linhas/pontos
  mesh.frustumCulled = false
  return mesh
}
