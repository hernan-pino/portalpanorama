import { OwnedPlaceRow, PlaceRepository } from '../ports/PlaceRepository'

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
  checklist: DashboardChecklistItem[]
  completedCount: number
  totalCount: number
  completenessPct: number
}

export interface DashboardTotals {
  placeCount: number
  visits: number
  saves: number
  avgRating?: number
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
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(userId: string): Promise<BusinessDashboardOutput> {
    const rows = await this.placeRepo.findManagedByUser(userId)

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
        checklist,
        completedCount,
        totalCount,
        completenessPct: Math.round((completedCount / totalCount) * 100),
      }
    })

    const rated = places.filter((p) => p.googleRating != null)
    const totals: DashboardTotals = {
      placeCount: places.length,
      visits: places.reduce((sum, p) => sum + p.visitCount, 0),
      saves: places.reduce((sum, p) => sum + p.saveCount, 0),
      avgRating:
        rated.length > 0
          ? rated.reduce((sum, p) => sum + (p.googleRating ?? 0), 0) / rated.length
          : undefined,
      avgCompletenessPct:
        places.length > 0
          ? Math.round(places.reduce((sum, p) => sum + p.completenessPct, 0) / places.length)
          : 0,
    }

    return { places, totals }
  }
}
