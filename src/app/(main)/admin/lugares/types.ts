// DTO plano que viaja del form (cliente) a la server action. Todo string porque
// son valores de <input>/<select>; la action valida y coacciona con Zod. Las
// imágenes y tags se modelan como arrays serializables.

export interface PlaceImageValues {
  url: string
  alt: string
  credit: string
  isPrimary: boolean
}

export interface PlaceFormValues {
  name: string
  description: string
  menuUrl: string

  categoryId: string
  subcategoryId: string
  secondaryCategoryId: string
  secondarySubcategoryId: string

  address: string
  communeId: string
  neighborhoodId: string
  lat: string
  lng: string
  metroStationId: string
  accessDetail: string
  reference: string
  rainPolicy: string

  priceRange: string
  reservation: string
  paymentMethods: string[] // multi-selección
  schedule: string

  phone: string
  website: string
  instagram: string

  googlePlaceId: string
  googleRating: string
  googleReviewCount: string

  isPremium: boolean

  tagIds: string[]
  images: PlaceImageValues[]
}

// ── Etiquetas de enums (presentación) para los <select> del form ──
export const PRICE_OPTIONS: { value: string; label: string }[] = [
  { value: 'FREE', label: 'Gratis' },
  { value: 'UNDER_5000', label: 'Menos de $5.000' },
  { value: 'FROM_5000_TO_15000', label: '$5.000–15.000' },
  { value: 'FROM_15000_TO_30000', label: '$15.000–30.000' },
  { value: 'OVER_30000', label: 'Más de $30.000' },
]

export const RESERVATION_OPTIONS: { value: string; label: string }[] = [
  { value: 'REQUIRED', label: 'Requiere reserva' },
  { value: 'RECOMMENDED', label: 'Reserva recomendada' },
  { value: 'WALK_IN', label: 'Sin reserva (llega no más)' },
]

// Métodos de pago para la multi-selección del form (chips). Lista base; al editar
// se preservan también valores antiguos que no estén acá (ver PlaceForm).
export const PAYMENT_OPTIONS = [
  'Efectivo',
  'Débito',
  'Crédito',
  'Transferencia',
  'Mercado Pago',
] as const

export const RAIN_OPTIONS: { value: string; label: string }[] = [
  { value: 'SUSPENDED', label: 'Si llueve se suspende' },
  { value: 'RELOCATED', label: 'Con lluvia se traslada a techado' },
  { value: 'CONTINUES', label: 'Funciona igual con lluvia' },
]

export const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'En revisión',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
}

// Etiquetas de las 4 capas de tags (para agrupar los checkboxes en el form).
export const TAG_LAYER_LABELS: Record<string, string> = {
  SOCIAL: '¿Con quién vas? (máx. 4)',
  SPECIFIC: 'Atributos específicos',
  ACCESS: 'Acceso y logística',
  VIBE: 'Ambiente (máx. 3)',
}

export const TAG_LAYER_ORDER = ['SOCIAL', 'SPECIFIC', 'ACCESS', 'VIBE']
