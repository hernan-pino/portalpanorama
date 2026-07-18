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

// Bajo este umbral el dato útil es el tiempo caminando, no los metros (s38).
const WALKABLE_KM = 1.5
// Caminar no sigue la línea recta: las calles obligan a rodear. 1.4 en malla urbana.
const DETOUR_FACTOR = 1.4
// Paso promedio a pie en ciudad.
const WALK_KMH = 5
// Minutos que no dependen de la distancia: salir del edificio, llegar a la esquina,
// cruzar, esperar el semáforo. A 150 m esta fricción PESA MÁS que la caminata misma,
// y sin ella el cálculo quedaba en la mitad del tiempo real (probado en la calle,
// s38: decía 2 min donde eran ~5).
const FIXED_MIN = 2

// Cómo se muestra una distancia. `walking` distingue el caso "se camina" para que la
// UI elija el ícono (peatón vs pin) sin repetir el umbral.
export interface DistanceLabel {
  text: string
  walking: boolean
}

// Bajo 1,5 km devuelve "a 8 min a pie"; sobre eso, la distancia en línea recta.
//
// El tiempo es una ESTIMACIÓN, no una ruta: no consultamos ninguna API de rutas (cobra
// por consulta y serían ~24 por carga). Se calibró contra caminatas reales y tiende a
// quedar corto en distancias muy cortas, donde el trazado de la manzana manda. Ante la
// duda conviene que sobre-estime: llegar antes de lo dicho no molesta a nadie.
export function describeDistance(km: number): DistanceLabel {
  if (km < WALKABLE_KM) {
    const walked = (km * DETOUR_FACTOR) / WALK_KMH * 60
    const minutes = Math.max(1, Math.round(FIXED_MIN + walked))
    return { text: `a ${minutes} min a pie`, walking: true }
  }
  return { text: formatDistance(km), walking: false }
}
