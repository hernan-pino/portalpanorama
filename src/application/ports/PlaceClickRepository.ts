import { PlaceClickKind } from '@domain/place/PlaceClickKind'

// Conteo de clics de contacto de UNA ficha, desglosado por tipo (lo que muestra el
// panel del dueño). `total` = suma de los demás.
export interface PlaceClickCounts {
  directions: number
  website: number
  instagram: number
  phone: number
  menu: number
  social: number
  total: number
}

export const EMPTY_CLICK_COUNTS: PlaceClickCounts = {
  directions: 0,
  website: 0,
  instagram: 0,
  phone: 0,
  menu: 0,
  social: 0,
  total: 0,
}

export interface PlaceClickRepository {
  // Registra un clic anónimo en un enlace de acción de la ficha.
  record(placeId: string, kind: PlaceClickKind): Promise<void>
  // Conteos por tipo de los lugares pedidos (para el panel). Los lugares sin
  // clics pueden no venir en el mapa: el caller cae a EMPTY_CLICK_COUNTS.
  countsByPlaceIds(placeIds: string[]): Promise<Map<string, PlaceClickCounts>>
}
