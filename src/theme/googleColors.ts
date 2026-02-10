import * as THREE from 'three'

export const GOOGLE_COLORS = {
  blue: new THREE.Color('#4285F4'),
  red: new THREE.Color('#EA4335'),
  yellow: new THREE.Color('#FBBC05'),
  green: new THREE.Color('#34A853'),
  lightBlue: new THREE.Color('#8AB4F8'),
  deepBlue: new THREE.Color('#1A73E8'),
  white: new THREE.Color('#FFFFFF')
}

export function googlePaletteLerp(t: number) {
  const c = GOOGLE_COLORS
  if (t < 0.25) return c.blue.clone().lerp(c.green, t / 0.25)
  if (t < 0.5) return c.green.clone().lerp(c.yellow, (t - 0.25) / 0.25)
  if (t < 0.75) return c.yellow.clone().lerp(c.red, (t - 0.5) / 0.25)
  return c.red.clone().lerp(c.blue, (t - 0.75) / 0.25)
}
