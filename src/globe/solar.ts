import { latLongToVector3 } from './latLongtoVector3'

function toDegrees(rad: number) {
  return (rad * 180) / Math.PI
}

function normalizeLongitude(lon: number) {
  let v = lon
  while (v > 180) v -= 360
  while (v < -180) v += 360
  return v
}

export function getSunDirectionUTC(date: Date) {
  const year = date.getUTCFullYear()
  const start = Date.UTC(year, 0, 0)
  const now = date.getTime()
  const dayOfYear = Math.floor((now - start) / 86400000)

  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()
  const utcMinutes = hours * 60 + minutes + seconds / 60

  const gamma =
    (2 * Math.PI / 365) * (dayOfYear - 1 + (utcMinutes - 720) / 1440)

  const eqTime =
    229.18 * (
      0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)
    )

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)

  const subsolarLat = toDegrees(decl)
  const subsolarLon = normalizeLongitude((720 - utcMinutes - eqTime) / 4)

  return latLongToVector3(subsolarLat, subsolarLon, 1).normalize()
}
