// Trae la reputación de Google (rating, nº de reseñas, place_id) y fotos del lugar
// a partir de su nombre + comuna. La implementación concreta (Outscraper) vive en
// infraestructura; el dominio/aplicación solo conoce esta interfaz. Permite mockear
// en tests y cambiar de proveedor sin tocar el use case.

export interface RatingQuery {
  // Nombre del lugar tal como lo conoce la gente (lo que se busca en Maps).
  name: string
  // Comuna para desambiguar (cadenas, nombres repetidos). Opcional pero recomendado.
  commune?: string
  // Si ya conocemos el place_id, búsqueda exacta (2ª pasada): evita el matching difuso.
  knownPlaceId?: string
}

export interface RatingResult {
  googlePlaceId: string
  googleRating?: number
  googleReviewCount?: number
  // Lo que devolvió Google (nombre + dirección del local que matcheó), para que el
  // humano confirme que es el lugar correcto antes de fiarse del dato.
  matchedName?: string
  matchedAddress?: string
  // URLs de fotos del lugar en Google Maps (portada primero). Sin etiqueta de tipo:
  // Google no distingue fachada/interior. El caller decide si las rehospeda.
  photoUrls: string[]
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
