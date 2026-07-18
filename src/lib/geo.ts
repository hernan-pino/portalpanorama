// Cálculo de distancia para "a X de ti" en tarjetas y fichas. Es una conveniencia
// de presentación (mide desde la ubicación del usuario que mira, no del lugar), por
// eso vive en lib/ y no en el dominio: no es una invariante de negocio del Place.

export interface LatLng {
  lat: number
  lng: number
}

const EARTH_RADIUS_KM = 6371

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Distancia en km por la fórmula del haversine (esfera terrestre). Suficiente para
// "a X de ti" dentro de la ciudad; no pretende precisión geodésica.
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

// "a 350 m de ti" (< 1 km, redondeado a 10 m) / "a 1,2 km de ti" (coma decimal
// chilena vía toLocaleString). Enteros sobre 10 km ("a 14 km de ti").
export function formatDistance(km: number): string {
  if (km < 1) {
    const m = Math.round((km * 1000) / 10) * 10
    return `a ${m} m de ti`
  }
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km)
  return `a ${rounded.toLocaleString('es-CL')} km de ti`
}
