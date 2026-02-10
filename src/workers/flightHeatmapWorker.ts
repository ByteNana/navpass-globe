// WebWorker: builds a heatmap texture (RGBA8) from packed Bezier routes.
//
// Message in:
//   { routes: Float32Array, width: number, height: number }
//
// routes stride (11 floats):
//   p0x,p0y,p0z, p1x,p1y,p1z, p2x,p2y,p2z, traffic, trafficCount
//
// Message out:
//   { data: ArrayBuffer }

type InMsg = {
  routes: Float32Array
  width: number
  height: number
}

const ROUTE_STRIDE = 11
const SAMPLES_PER_ROUTE = 84

type KernelTap = { dx: number; dy: number; w: number }

function buildGaussianKernel(radius: number, sigma: number): KernelTap[] {
  const taps: KernelTap[] = []
  const denom = 2 * sigma * sigma
  let sum = 0

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const d2 = dx * dx + dy * dy
      const w = Math.exp(-d2 / denom)
      taps.push({ dx, dy, w })
      sum += w
    }
  }

  if (sum > 0) {
    for (let i = 0; i < taps.length; i++) {
      taps[i].w /= sum
    }
  }

  return taps
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function powFast(v: number, e: number) {
  return Math.pow(v, e)
}

self.onmessage = (ev: MessageEvent<InMsg>) => {
  const routes = ev.data.routes
  const width = Math.max(1, Math.floor(ev.data.width))
  const height = Math.max(1, Math.floor(ev.data.height))

  const heat = new Float32Array(width * height)
  const kernel = buildGaussianKernel(4, 2.15)

  const routeCount = Math.floor(routes.length / ROUTE_STRIDE)
  const invSamples = 1 / Math.max(1, SAMPLES_PER_ROUTE)
  const twoPi = Math.PI * 2
  const invTwoPi = 1 / twoPi
  const invPi = 1 / Math.PI

  for (let i = 0; i < routeCount; i++) {
    const o = i * ROUTE_STRIDE
    const p0x = routes[o + 0]
    const p0y = routes[o + 1]
    const p0z = routes[o + 2]
    const p1x = routes[o + 3]
    const p1y = routes[o + 4]
    const p1z = routes[o + 5]
    const p2x = routes[o + 6]
    const p2y = routes[o + 7]
    const p2z = routes[o + 8]
    const traffic = routes[o + 9]
    const trafficCount = routes[o + 10]

    // Same weighting used in the main thread version.
    const traffic01 = clamp((traffic - 0.62) / (1.22 - 0.62), 0, 1)
    const routeWeight = trafficCount * (0.75 + traffic01 * 0.55)
    const perSample = routeWeight * invSamples

    for (let s = 0; s < SAMPLES_PER_ROUTE; s++) {
      const t = s / (SAMPLES_PER_ROUTE - 1)
      const omt = 1 - t
      const omt2 = omt * omt
      const tt = t * t
      const k0 = omt2
      const k1 = 2 * omt * t
      const k2 = tt

      let x = p0x * k0 + p1x * k1 + p2x * k2
      let y = p0y * k0 + p1y * k1 + p2y * k2
      let z = p0z * k0 + p1z * k1 + p2z * k2

      const len = Math.sqrt(x * x + y * y + z * z)
      if (len < 1e-9) continue
      x /= len
      y /= len
      z /= len

      // Matches vector3ToLatLon + (lon + 180) mapping:
      // theta = atan2(z, -x) in [-pi, pi], u = theta / (2pi) wrapped to [0,1)
      const theta = Math.atan2(z, -x)
      let u = theta * invTwoPi
      u = u - Math.floor(u)

      // v = (asin(y) / pi) + 0.5
      let v = Math.asin(clamp(y, -1, 1)) * invPi + 0.5
      v = clamp(v, 0, 1)

      const cx = (u * width) | 0
      const cy = (v * height) | 0

      for (let k = 0; k < kernel.length; k++) {
        const tap = kernel[k]
        const xx = (cx + tap.dx + width) % width
        const yy = Math.max(0, Math.min(height - 1, cy + tap.dy))
        heat[yy * width + xx] += perSample * tap.w
      }
    }
  }

  let max = 0
  for (let i = 0; i < heat.length; i++) {
    if (heat[i] > max) max = heat[i]
  }
  max = Math.max(1e-6, max)

  const out = new Uint8Array(width * height * 4)
  for (let i = 0; i < heat.length; i++) {
    let v = heat[i] / max
    v = clamp(v, 0, 1)
    v = powFast(v, 0.55)

    const b = (v * 255 + 0.5) | 0
    const o = i * 4
    out[o + 0] = b
    out[o + 1] = b
    out[o + 2] = b
    out[o + 3] = 255
  }

  ;(self as any).postMessage({ data: out.buffer }, [out.buffer])
}

