// Trae la reputación de Google (rating, nº de reseñas, place_id) y fotos del lugar
// a partir de su nombre + comuna. La implementación concreta (Outscraper) vive en
// infraestructura; el dominio/aplicación solo conoce esta interfaz. Permite mockear
// en tests y cambiar de proveedor sin tocar el use case.
import { ParkingOption } from '@domain/place/ParkingOption'

export interface RatingQuery {
  // Nombre del lugar tal como lo conoce la gente (lo que se busca en Maps).
  name: string
  // Dirección de la ficha. Clave para fijar la SUCURSAL correcta cuando la marca
  // tiene varios locales (Emporio La Rosa Lastarria vs Providencia): sin esto, Maps
  // devuelve la que rankea primero, que puede no ser la de la ficha.
  address?: string
  // Comuna para desambiguar (cadenas, nombres repetidos). Opcional pero recomendado.
  commune?: string
  // Si ya conocemos el place_id, búsqueda exacta (2ª pasada): evita el matching difuso.
  knownPlaceId?: string
}

// Un día de la grilla semanal, ya normalizado por el adapter (el formato crudo del
// proveedor —"10 AM to 8:30 PM"— no cruza el port). `hours` viene en 24h local:
// "10:00–20:30", "10:00–14:00, 16:00–20:00" (jornada partida), "cerrado" o "24 horas".
export interface OpeningHoursDay {
  day: 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo'
  hours: string
}

export interface RatingResult {
  googlePlaceId: string
  googleRating?: number
  googleReviewCount?: number
  // Grilla semanal según Google. Vacía/ausente si el local no la publica.
  openingHours?: OpeningHoursDay[]
  // Estado operativo según Google. Un local cerrado no debería quedar publicado:
  // el caller decide qué hacer (acá solo se informa).
  temporarilyClosed?: boolean
  permanentlyClosed?: boolean
  // Lo que devolvió Google (nombre + dirección del local que matcheó), para que el
  // humano confirme que es el lugar correcto antes de fiarse del dato.
  matchedName?: string
  matchedAddress?: string
  // URLs de fotos del lugar en Google Maps (portada primero). Sin etiqueta de tipo:
  // Google no distingue fachada/interior. El caller decide si las rehospeda.
  photoUrls: string[]
  // Coordenadas del lugar según Google (centroide del pin). El caller decide si las
  // persiste; conviene NO pisar coords curadas a mano (Google a veces apunta al techo).
  latitude?: number
  longitude?: number
  // Dónde estacionar, según la sección "Estacionamiento" de Google. Ausente si Google
  // no la publica (pasa seguido, incluso en malls): ausente ≠ "no tiene".
  parkingOptions?: ParkingOption[]
}

// Error accionable y seguro de mostrar (sin filtrar internals: keys, endpoints).
export class RatingLookupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RatingLookupError'
  }
}

export interface PlaceRatingProvider {
  // Devuelve la reputación + fotos, o null si no hubo ninguna coincidencia para la query.
  lookup(query: RatingQuery): Promise<RatingResult | null>
}
