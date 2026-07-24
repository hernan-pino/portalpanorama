import { $Enums, Prisma, PrismaClient } from '@prisma/client'
import {
  FacetCount,
  PlaceFacets,
  PlaceSuggestion,
  SearchParams,
  SearchResult,
  SearchService,
} from '@application/ports/SearchService'
import { placeCardArgs, toPlaceCardView } from '../db/placeCardView'
import { fuzzyScore, normalize, tokenizeQuery, MATCH_THRESHOLD } from './fuzzy'

const DEFAULT_LIMIT = 20
const PUBLISHED = $Enums.PlaceStatus.PUBLISHED

// ── Caché en memoria del dataset del autocompletado ──────────────────────────────
// `suggest` puntúa con tolerancia a typos EN JS (fuzzyScore), así que necesita el set
// completo de lugares publicados: un LIKE en SQL no lo reemplaza (escribiendo "sushilab"
// mal igual tiene que aparecer). El problema no era puntuar 500 filas —eso son
// milisegundos—, sino traerlas de Neon EN CADA TECLA: medido, 2.764 ms con 510 lugares,
// y empeora con cada carga. El dataset solo cambia cuando se publica o edita un lugar,
// así que se guarda en memoria con un TTL corto: la primera tecla lo paga, el resto de
// la sesión de tipeo sale gratis. TTL bajo para que una publicación se vea al toque.
type SuggestRow = {
  slug: string
  name: string
  category: { name: string }
  subcategory: { name: string }
  commune: { name: string }
  images: { url: string }[]
}
const SUGGEST_TTL_MS = 60_000
let suggestCache: { rows: SuggestRow[]; at: number } | null = null

// Etiquetas humanas de los buckets de presupuesto (orden = de menor a mayor).
const PRICE_LABELS: Record<$Enums.PriceRange, string> = {
  FREE: 'Gratis',
  UNDER_5000: 'Menos de $5.000',
  FROM_5000_TO_15000: '$5.000–$15.000',
  FROM_15000_TO_30000: '$15.000–$30.000',
  OVER_30000: 'Más de $30.000',
}
const PRICE_ORDER: $Enums.PriceRange[] = [
  'FREE',
  'UNDER_5000',
  'FROM_5000_TO_15000',
  'FROM_15000_TO_30000',
  'OVER_30000',
]

function byCountThenLabel(a: FacetCount, b: FacetCount): number {
  return b.count - a.count || a.label.localeCompare(b.label, 'es')
}

// Orden elegido por el usuario (sesión 27). El enum PriceRange está declarado de
// menor a mayor → asc = más barato primero; los sin presupuesto van al final en
// ambas direcciones. El score desempata el precio; el nombre desempata siempre.
function buildOrderBy(sort: SearchParams['sort']): Prisma.PlaceOrderByWithRelationInput[] {
  switch (sort) {
    case 'name':
      return [{ name: 'asc' }]
    case 'price_asc':
      return [{ priceRange: { sort: 'asc', nulls: 'last' } }, { score: 'desc' }, { name: 'asc' }]
    case 'price_desc':
      return [{ priceRange: { sort: 'desc', nulls: 'last' } }, { score: 'desc' }, { name: 'asc' }]
    default:
      return [{ score: 'desc' }, { name: 'asc' }]
  }
}

export class PostgresFTSSearchService implements SearchService {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Búsqueda: solo publicados, filtros vivos, orden por reputación (score) ──
  async search(params: SearchParams): Promise<SearchResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? DEFAULT_LIMIT
    const skip = (page - 1) * limit
    const where = await this.buildWhere(params)

    const [rows, total] = await Promise.all([
      this.prisma.place.findMany({
        where,
        orderBy: buildOrderBy(params.sort),
        skip,
        take: limit,
        ...placeCardArgs,
      }),
      this.prisma.place.count({ where }),
    ])

    return {
      items: rows.map(toPlaceCardView),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    }
  }

  private async buildWhere(params: SearchParams): Promise<Prisma.PlaceWhereInput> {
    const where: Prisma.PlaceWhereInput = { status: PUBLISHED }

    if (params.categorySlug) where.category = { slug: params.categorySlug }
    if (params.subcategorySlug) where.subcategory = { slug: params.subcategorySlug }
    if (params.communeSlug) where.commune = { slug: params.communeSlug }
    if (params.neighborhoodSlug) where.neighborhood = { slug: params.neighborhoodSlug }
    if (params.priceRanges?.length) where.priceRange = { in: params.priceRanges }
    if (params.walkInOnly) where.reservation = $Enums.ReservationPolicy.WALK_IN

    // Metro: por estación y/o por línea (M2M).
    if (params.metroStationSlug || params.metroLineCode) {
      where.metroStation = {
        ...(params.metroStationSlug ? { slug: params.metroStationSlug } : {}),
        ...(params.metroLineCode ? { lines: { some: { code: params.metroLineCode } } } : {}),
      }
    }

    // Texto: match tolerante en la app (parcial + sin acentos + typos) → IDs, que
    // se intersectan con el resto de filtros. Así "cafi" no devuelve 0 resultados.
    if (params.query?.trim()) {
      where.id = { in: await this.fuzzyMatchIds(params.query) }
    }

    // Tags seleccionados: la ficha debe tener TODOS (cada filtro acota), por eso
    // un AND con un `some` por slug (silla de ruedas Y baño, no "o").
    const tagSlugs = [
      ...(params.socialTagSlugs ?? []),
      ...(params.accessTagSlugs ?? []),
      ...(params.vibeTagSlugs ?? []),
      ...(params.occasionTagSlugs ?? []),
      ...(params.experienceTagSlugs ?? []),
      ...(params.cuisineTagSlugs ?? []),
    ]
    if (tagSlugs.length) {
      where.AND = tagSlugs.map((slug) => ({ tags: { some: { tag: { slug } } } }))
    }

    return where
  }

  // ── Facetas estáticas con contadores (P3). La UI oculta las de count 0. ──
  async getFacets(): Promise<PlaceFacets> {
    const [categories, subcategories, communes, neighborhoods, priceRanges, metroLines, tags] =
      await Promise.all([
        this.categoryFacets(),
        this.subcategoryFacets(),
        this.communeFacets(),
        this.neighborhoodFacets(),
        this.priceRangeFacets(),
        this.metroLineFacets(),
        this.tagFacets(),
      ])
    return {
      categories,
      subcategories,
      communes,
      neighborhoods,
      priceRanges,
      metroLines,
      social: tags.social,
      access: tags.access,
      vibe: tags.vibe,
      occasion: tags.occasion,
      experience: tags.experience,
    }
  }

  private async categoryFacets(): Promise<FacetCount[]> {
    const groups = await this.prisma.place.groupBy({
      by: ['categoryId'],
      where: { status: PUBLISHED },
      _count: { _all: true },
    })
    if (groups.length === 0) return []
    const cats = await this.prisma.category.findMany({
      where: { id: { in: groups.map((g) => g.categoryId) } },
      select: { id: true, slug: true, name: true },
    })
    const meta = new Map(cats.map((c) => [c.id, c]))
    return groups
      .map((g) => {
        const c = meta.get(g.categoryId)
        return { value: c?.slug ?? '', label: c?.name ?? '', count: g._count._all }
      })
      .filter((f) => f.value)
      .sort(byCountThenLabel)
  }

  private async subcategoryFacets(): Promise<FacetCount[]> {
    const groups = await this.prisma.place.groupBy({
      by: ['subcategoryId'],
      where: { status: PUBLISHED },
      _count: { _all: true },
    })
    if (groups.length === 0) return []
    const subs = await this.prisma.subcategory.findMany({
      where: { id: { in: groups.map((g) => g.subcategoryId) } },
      select: { id: true, slug: true, name: true },
    })
    const meta = new Map(subs.map((s) => [s.id, s]))
    return groups
      .map((g) => {
        const s = meta.get(g.subcategoryId)
        return { value: s?.slug ?? '', label: s?.name ?? '', count: g._count._all }
      })
      .filter((f) => f.value)
      .sort(byCountThenLabel)
  }

  private async communeFacets(): Promise<FacetCount[]> {
    const groups = await this.prisma.place.groupBy({
      by: ['communeId'],
      where: { status: PUBLISHED },
      _count: { _all: true },
    })
    if (groups.length === 0) return []
    const communes = await this.prisma.commune.findMany({
      where: { id: { in: groups.map((g) => g.communeId) } },
      select: { id: true, slug: true, name: true },
    })
    const meta = new Map(communes.map((c) => [c.id, c]))
    return groups
      .map((g) => {
        const c = meta.get(g.communeId)
        return { value: c?.slug ?? '', label: c?.name ?? '', count: g._count._all }
      })
      .filter((f) => f.value)
      .sort(byCountThenLabel)
  }

  private async neighborhoodFacets(): Promise<FacetCount[]> {
    const groups = await this.prisma.place.groupBy({
      by: ['neighborhoodId'],
      where: { status: PUBLISHED, neighborhoodId: { not: null } },
      _count: { _all: true },
    })
    const ids = groups.map((g) => g.neighborhoodId).filter((id): id is string => id != null)
    if (ids.length === 0) return []
    const hoods = await this.prisma.neighborhood.findMany({
      where: { id: { in: ids } },
      select: { id: true, slug: true, name: true },
    })
    const meta = new Map(hoods.map((h) => [h.id, h]))
    return groups
      .map((g) => {
        const h = g.neighborhoodId ? meta.get(g.neighborhoodId) : undefined
        return { value: h?.slug ?? '', label: h?.name ?? '', count: g._count._all }
      })
      .filter((f) => f.value)
      .sort(byCountThenLabel)
  }

  private async priceRangeFacets(): Promise<FacetCount[]> {
    const groups = await this.prisma.place.groupBy({
      by: ['priceRange'],
      where: { status: PUBLISHED, priceRange: { not: null } },
      _count: { _all: true },
    })
    const counts = new Map(groups.map((g) => [g.priceRange, g._count._all]))
    return PRICE_ORDER.map((pr) => ({
      value: pr,
      label: PRICE_LABELS[pr],
      count: counts.get(pr) ?? 0,
    })).filter((f) => f.count > 0)
  }

  private async metroLineFacets(): Promise<FacetCount[]> {
    // Un place tiene una estación; la estación tiene 1+ líneas (M2M). El conteo por
    // línea suma los places de sus estaciones.
    const groups = await this.prisma.place.groupBy({
      by: ['metroStationId'],
      where: { status: PUBLISHED, metroStationId: { not: null } },
      _count: { _all: true },
    })
    const ids = groups.map((g) => g.metroStationId).filter((id): id is string => id != null)
    if (ids.length === 0) return []
    const stations = await this.prisma.metroStation.findMany({
      where: { id: { in: ids } },
      select: { id: true, lines: { select: { code: true, name: true } } },
    })
    const stationLines = new Map(stations.map((s) => [s.id, s.lines]))

    const byLine = new Map<string, { label: string; count: number }>()
    for (const g of groups) {
      if (!g.metroStationId) continue
      const lines = stationLines.get(g.metroStationId) ?? []
      for (const line of lines) {
        const entry = byLine.get(line.code) ?? { label: line.name, count: 0 }
        entry.count += g._count._all
        byLine.set(line.code, entry)
      }
    }
    return [...byLine.entries()]
      .map(([code, { label, count }]) => ({ value: code, label, count }))
      .sort((a, b) => a.value.localeCompare(b.value, 'es'))
  }

  private async tagFacets(): Promise<{
    social: FacetCount[]
    access: FacetCount[]
    vibe: FacetCount[]
    occasion: FacetCount[]
    experience: FacetCount[]
  }> {
    const empty = { social: [], access: [], vibe: [], occasion: [], experience: [] }
    const groups = await this.prisma.placeTag.groupBy({
      by: ['tagId'],
      where: { place: { status: PUBLISHED } },
      _count: { _all: true },
    })
    if (groups.length === 0) return empty
    const tags = await this.prisma.tag.findMany({
      where: { id: { in: groups.map((g) => g.tagId) } },
      select: { id: true, slug: true, name: true, layer: true },
    })
    const meta = new Map(tags.map((t) => [t.id, t]))

    const social: FacetCount[] = []
    const access: FacetCount[] = []
    const vibe: FacetCount[] = []
    const occasion: FacetCount[] = []
    const experience: FacetCount[] = []
    for (const g of groups) {
      const t = meta.get(g.tagId)
      if (!t) continue
      const fc: FacetCount = { value: t.slug, label: t.name, count: g._count._all }
      if (t.layer === $Enums.TagLayer.AUDIENCE) social.push(fc)
      else if (t.layer === $Enums.TagLayer.SERVICE) access.push(fc)
      else if (t.layer === $Enums.TagLayer.VIBE) vibe.push(fc)
      else if (t.layer === $Enums.TagLayer.OCCASION) occasion.push(fc)
      else if (t.layer === $Enums.TagLayer.EXPERIENCE) experience.push(fc)
      // SPECIFIC = condicional por categoría, no es faceta universal del rail.
    }
    social.sort(byCountThenLabel)
    access.sort(byCountThenLabel)
    vibe.sort(byCountThenLabel)
    occasion.sort(byCountThenLabel)
    experience.sort(byCountThenLabel)
    return { social, access, vibe, occasion, experience }
  }

  // ── Texto tolerante (MVP, catálogo chico → en la app, no en SQL) ──
  // La consulta se separa en palabras significativas (sin "lugares/para/con"…) y
  // CADA una debe matchear algo del lugar: nombre, rubro/tags, comuna/barrio o
  // descripción. Así "ramen providencia" o "para ir con niños" funcionan; antes
  // la frase completa se comparaba como un solo string y casi siempre daba 0.
  private async fuzzyMatchIds(query: string): Promise<string[]> {
    const rows = await this.prisma.place.findMany({
      where: { status: PUBLISHED },
      select: {
        id: true,
        name: true,
        description: true,
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        commune: { select: { name: true } },
        neighborhood: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
    })
    const tokens = tokenizeQuery(query)
    if (tokens.length === 0) return rows.map((r) => r.id)

    return rows
      .filter((r) => {
        const rubro = [r.category.name, r.subcategory.name, ...r.tags.map((t) => t.tag.name)].join(' ')
        const zona = [r.commune.name, r.neighborhood?.name ?? ''].join(' ')
        const desc = r.description ? normalize(r.description) : ''
        return tokens.every(
          (tok) =>
            fuzzyScore(r.name, tok) >= MATCH_THRESHOLD ||
            fuzzyScore(rubro, tok) * 0.85 >= MATCH_THRESHOLD ||
            fuzzyScore(zona, tok) >= MATCH_THRESHOLD ||
            // La descripción es texto largo: solo substring y con palabras de 3+
            // letras (el fuzzy o los términos cortos darían puro ruido).
            (tok.length >= 3 && desc.includes(tok)),
        )
      })
      .map((r) => r.id)
  }

  // ── Autocompletado: lugares por nombre (y rubro como respaldo), mejor primero ──
  // Dataset del autocompletado, memoizado (ver el comentario del caché arriba).
  private async suggestRows(): Promise<SuggestRow[]> {
    const now = Date.now()
    if (suggestCache && now - suggestCache.at < SUGGEST_TTL_MS) return suggestCache.rows
    const rows = await this.prisma.place.findMany({
      where: { status: PUBLISHED },
      select: {
        slug: true,
        name: true,
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        commune: { select: { name: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1, select: { url: true } },
      },
    })
    suggestCache = { rows, at: now }
    return rows
  }

  async suggest(query: string, limit: number): Promise<PlaceSuggestion[]> {
    if (query.trim().length < 2) return []
    const rows = await this.suggestRows()
    return rows
      .map((r) => {
        const rubro = Math.max(fuzzyScore(r.subcategory.name, query), fuzzyScore(r.category.name, query))
        const score = Math.max(fuzzyScore(r.name, query), rubro * 0.85)
        return { r, score }
      })
      .filter((x) => x.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score || a.r.name.localeCompare(b.r.name, 'es'))
      .slice(0, limit)
      .map(({ r }) => ({
        slug: r.slug,
        name: r.name,
        categoryName: r.category.name,
        communeName: r.commune.name,
        coverUrl: r.images[0]?.url,
      }))
  }
}
