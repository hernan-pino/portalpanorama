'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { LatLng } from '@lib/geo'

// Estado de la ubicación del usuario, compartido por la página (el botón "Cerca de
// mí" la pide una vez y todas las tarjetas + la ficha la leen). El permiso es opt-in
// explícito: nunca se pide solo al cargar (decisión de UX s38).
// 'denied' = el usuario bloqueó el permiso · 'unavailable' = permiso ok pero el
// sistema no entrega posición (ubicación del SO apagada, sin proveedor) · 'timeout'
// = tardó demasiado. Se distinguen para dar un mensaje accionable.
type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable' | 'timeout'

interface UserLocation {
  coords: LatLng | null
  status: LocationStatus
  request: () => void
  clear: () => void
}

const UserLocationContext = createContext<UserLocation | null>(null)

// La ubicación concedida se recuerda solo por la sesión de pestaña: al reabrir el
// navegador se vuelve a pedir (no la persistimos en localStorage a propósito).
const STORAGE_KEY = 'pp:userloc'

export function UserLocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<LatLng | null>(null)
  const [status, setStatus] = useState<LocationStatus>('idle')

  // Rehidrata la ubicación ya concedida en esta sesión → la ficha muestra la
  // distancia sin volver a pedir permiso ni requerir el botón.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<LatLng>
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        setCoords({ lat: parsed.lat, lng: parsed.lng })
        setStatus('granted')
      }
    } catch {
      // sessionStorage no disponible (modo privado, etc.): se ignora.
    }
  }, [])

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(next)
        setStatus('granted')
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // Sin persistencia: la distancia igual funciona en esta página.
        }
      },
      (err) => {
        // 1 = PERMISSION_DENIED · 2 = POSITION_UNAVAILABLE · 3 = TIMEOUT
        setStatus(err.code === 1 ? 'denied' : err.code === 3 ? 'timeout' : 'unavailable')
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  const clear = useCallback(() => {
    setCoords(null)
    setStatus('idle')
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // idem
    }
  }, [])

  return (
    <UserLocationContext.Provider value={{ coords, status, request, clear }}>
      {children}
    </UserLocationContext.Provider>
  )
}

// Fuera del provider (ej. la tarjeta en la home, que no lo monta) devuelve un estado
// inerte en vez de reventar: la distancia simplemente no se muestra.
const INERT: UserLocation = { coords: null, status: 'idle', request: () => {}, clear: () => {} }

export function useUserLocation(): UserLocation {
  return useContext(UserLocationContext) ?? INERT
}
