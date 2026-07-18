'use client'

import { useUserLocation } from './UserLocationProvider'
import { haversineKm, describeDistance } from '@lib/geo'
import { PinIcon, WalkIcon } from './PinIcon'

// Isla cliente: muestra "a 12 min a pie" (distancias cortas) o "a X km de ti" si el
// usuario compartió su ubicación y el lugar tiene coordenadas. Sin permiso o sin
// coords no renderiza nada (decisión de UX s38: el dato aparece solo cuando hay algo
// real que mostrar).
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
  const { text, walking } = describeDistance(haversineKm(coords, { lat, lng }))
  return (
    <span className={className}>
      {walking ? <WalkIcon size={12} /> : <PinIcon size={12} />}
      {text}
    </span>
  )
}
