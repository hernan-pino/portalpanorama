'use client'

import { useUserLocation } from './UserLocationProvider'
import { haversineKm, formatDistance } from '@lib/geo'

// Isla cliente: muestra "a X de ti" si el usuario compartió su ubicación y el lugar
// tiene coordenadas. Sin permiso o sin coords no renderiza nada (decisión de UX s38:
// el dato aparece solo cuando hay algo real que mostrar).
export function PlaceDistance({
  lat,
  lng,
  className,
}: {
  lat?: number
  lng?: number
  className?: string
}) {
  const { coords } = useUserLocation()
  if (!coords || lat == null || lng == null) return null
  const km = haversineKm(coords, { lat, lng })
  return <span className={className}>{formatDistance(km)}</span>
}
