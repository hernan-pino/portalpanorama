import { Brand } from '@domain/brand/Brand'
import { PlaceCardView } from './PlaceRepository'

// Página pública de la marca: identidad + sus sucursales publicadas (tarjetas).
// Denormalizado; no es el agregado de dominio.
export interface BrandPageView {
  id: string
  slug: string
  name: string
  logoUrl?: string
  description?: string
  website?: string
  instagram?: string
  socialLinks: { network: string; url: string }[]
  places: PlaceCardView[]
}

// Fila de la tabla del admin (con conteo de sucursales para el panel).
export interface BrandAdminRow {
  id: string
  slug: string
  name: string
  logoUrl?: string
  placeCount: number
  updatedAt: Date
}

// Opción para el selector "Marca" del form de Place.
export interface BrandOption {
  id: string
  name: string
}

export interface BrandRepository {
  // ── Agregado de dominio (CRUD admin) ──
  findById(id: string): Promise<Brand | null>
  save(brand: Brand): Promise<void>

  // ── Read-models para la UI ──
  // Página pública /marca/[slug]: marca + sucursales PUBLISHED. Null si no existe.
  getPageBySlug(slug: string): Promise<BrandPageView | null>

  // ── Admin ──
  listForAdmin(): Promise<BrandAdminRow[]>
  // Marcas para el selector del form de Place (id + nombre, orden alfabético).
  listForOptions(): Promise<BrandOption[]>
}
