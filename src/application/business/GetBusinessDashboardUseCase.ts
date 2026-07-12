import { OwnedPlaceRow, PlaceRepository } from '../ports/PlaceRepository'
import {
  EMPTY_CLICK_COUNTS,
  PlaceClickCounts,
  PlaceClickRepository,
} from '../ports/PlaceClickRepository'

export interface DashboardChecklistItem {
  label: string
  done: boolean
}

export interface DashboardPlace {
  id: string
  slug: string
  name: string
  status: string
  categoryName: string
  communeName: string
  coverUrl?: string
  googleRating?: number
  visitCount: number
  saveCount: number
  // Intención de contacto: lo accionable para el dueño (el rating de Google ya se
  // ve en su propia ficha, así que no ocupa espacio en el panel).
  clicks: PlaceClickCounts
  checklist: DashboardChecklistItem[]
  completedCount: number
  totalCount: number
  completenessPct: number
}

export interface DashboardTotals {
  placeCount: number
  visits: number
  saves: number
  clicks: number
  avgCompletenessPct: number
}

export interface BusinessDashboardOutput {
  places: DashboardPlace[]
  totals: DashboardTotals
}

// Qué campos cuentan para el "estado de tu ficha" y cuánto pesan. Todo lo que
// el dueño puede completar/mejorar directo desde su panel; nada estructural
// (nombre/categoría/ubicación los controla el admin). Umbral de galería: 3+ fotos.
const GALLERY_MIN = 3

function buildChecklist(r: OwnedPlaceRow): DashboardChecklistItem[] {
  return [
    { label: 'Foto de portada', done: !!r.coverUrl },
    { label: `Galería (${GALLERY_MIN}+ fotos)`, done: r.imageCount >= GALLERY_MIN },
    { label: 'Descripción', done: r.hasDescription },
    { label: 'Horario', done: r.hasSchedule },
    { label: 'Teléfono', done: r.hasPhone },
    { label: 'Web o Instagram', done: r.hasWebsite || r.hasInstagram },
    { label: 'Carta o menú', done: r.hasMenu },
    { label: 'Rango de precio', done: r.hasPrice },
  ]
}

// Panel de negocio: las fichas que el usuario gestiona (propias + de sus marcas),
// con su engagement real y el estado de completitud de cada ficha. Vacío = el
// usuario aún no tiene ningún negocio aprobado.
export class GetBusinessDashboardUseCase {
  constructor(
    private readonly placeRepo: PlaceRepository,
    private readonly clickRepo: PlaceClickRepository,
  ) {}

  async execute(userId: string): Promise<BusinessDashboardOutput> {
    const rows = await this.placeRepo.findManagedByUser(userId)
    // Un solo groupBy para todas las fichas del panel (no una query por ficha).
    const clicksByPlace = await this.clickRepo.countsByPlaceIds(rows.map((r) => r.id))

    const places: DashboardPlace[] = rows.map((r) => {
      const checklist = buildChecklist(r)
      const completedCount = checklist.filter((i) => i.done).length
      const totalCount = checklist.length
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        status: r.status,
        categoryName: r.categoryName,
        communeName: r.communeName,
        coverUrl: r.coverUrl,
        googleRating: r.googleRating,
        visitCount: r.visitCount,
        saveCount: r.saveCount,
        clicks: clicksByPlace.get(r.id) ?? { ...EMPTY_CLICK_COUNTS },
        checklist,
        completedCount,
        totalCount,
        completenessPct: Math.round((completedCount / totalCount) * 100),
      }
    })

    const totals: DashboardTotals = {
      placeCount: places.length,
      visits: places.reduce((sum, p) => sum + p.visitCount, 0),
      saves: places.reduce((sum, p) => sum + p.saveCount, 0),
      clicks: places.reduce((sum, p) => sum + p.clicks.total, 0),
      avgCompletenessPct:
        places.length > 0
          ? Math.round(places.reduce((sum, p) => sum + p.completenessPct, 0) / places.length)
          : 0,
    }

    return { places, totals }
  }
}
