'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { LatLng } from '@lib/geo'

// Estado de la ubicación del usuario, compartido por todo el sitio: el usuario la
// concede una vez y las tarjetas + la ficha leen de acá.
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
// Marca de "el usuario apagó la distancia a propósito". Sin esto, el permiso del
// navegador sigue concedido y el auto-restore de abajo la volvería a encender,
// pasando por encima de su decisión.
const OFF_KEY = 'pp:userloc:off'

export function UserLocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<LatLng | null>(null)
  const [status, setStatus] = useState<LocationStatus>('idle')

  // Pide la posición al sistema. Si el permiso ya está concedido el navegador no
  // muestra ningún diálogo; si no, este es el momento en que aparece el nativo.
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
          sessionStorage.removeItem(OFF_KEY)
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

  // Restaura la ubicación al montar, en CUALQUIER página. Dos fuentes, en orden:
  //
  // 1. sessionStorage — instantáneo, sin tocar el GPS.
  // 2. El permiso del navegador (Permissions API) — la fuente de verdad real. Si el
  //    usuario ya concedió antes, volvemos a pedir la posición nosotros: el navegador
  //    NO abre ningún diálogo porque el permiso ya está dado.
  //
  // El paso 2 es lo que mantiene viva la distancia al navegar entre páginas y en
  // visitas siguientes. Antes dependíamos solo de sessionStorage y bastaba que fallara
  // para que la feature se cayera entera y hubiera que apretar "Cerca de mí" de nuevo
  // en cada página (bug reportado en s38).
  useEffect(() => {
    let cancelled = false

    try {
      // Apagó la distancia a mano: se respeta y no se auto-restaura.
      if (sessionStorage.getItem(OFF_KEY)) return
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LatLng>
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          setCoords({ lat: parsed.lat, lng: parsed.lng })
          setStatus('granted')
          return
        }
      }
    } catch {
      // sessionStorage no disponible (modo privado, etc.): seguimos al permiso.
    }

    // Sin caché: le preguntamos al navegador si el permiso ya está concedido. La
    // Permissions API solo consulta el estado guardado, no abre ningún diálogo.
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) return
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((p) => {
        if (!cancelled && p.state === 'granted') request()
      })
      .catch(() => {
        // Safari viejo no soporta query('geolocation'): queda el opt-in manual.
      })

    return () => {
      cancelled = true
    }
  }, [request])

  const clear = useCallback(() => {
    setCoords(null)
    setStatus('idle')
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.setItem(OFF_KEY, '1')
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

// Fuera del provider devuelve un estado inerte en vez de reventar: la distancia
// simplemente no se muestra.
const INERT: UserLocation = { coords: null, status: 'idle', request: () => {}, clear: () => {} }

export function useUserLocation(): UserLocation {
  return useContext(UserLocationContext) ?? INERT
}
