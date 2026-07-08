import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { container } from './container'

// Lecturas públicas cacheadas (Data Cache de Next) para las páginas de contenido.
//
// Por qué: cada navegación era SSR dinámico esperando a Neon antes del primer
// byte (LCP de ~7s en móvil). Estos read-models son globales (no dependen de la
// sesión — los corazones/save-context van aparte y nunca se cachean acá), así
// que se sirven desde el caché y se refrescan:
//   - por tiempo (`revalidate`): cubre los cambios que entran por fuera de la
//     app (ingest/enrich/prod-sync escriben directo a la BD), y
//   - por tag (`revalidateTag` en las actions del admin): las ediciones del
//     admin se reflejan al tiro.
//
// El wrapper exterior `cache()` (React) dedupea dentro del mismo request:
// generateMetadata + page comparten una sola ejecución por render.

export const CACHE_TAGS = {
  // Cualquier mutación de lugares/marcas (afecta fichas, búsqueda y facetas).
  places: 'places',
  // Mutaciones de listas curadas (afecta /guias, /lista/[slug] y la home).
  curatedLists: 'curated-lists',
} as const

const FIVE_MINUTES = 300

// Ficha completa + relacionados. Errores (PlaceNotFoundError) no se cachean:
// unstable_cache solo guarda resultados exitosos.
export const getPlaceDetailCached = cache((slug: string) =>
  unstable_cache(
    () => container.getGetPlaceBySlugUseCase().execute(slug),
    ['place-detail', slug],
    { revalidate: FIVE_MINUTES, tags: [CACHE_TAGS.places] },
  )(),
)

// Página completa de una guía/lista curada (destacados + menciones + grilla).
// Su regla resuelve sobre lugares publicados → también depende del tag places.
export const getCuratedListPageCached = cache((slug: string) =>
  unstable_cache(
    () => container.getGetCuratedListBySlugUseCase().execute(slug),
    ['curated-list-page', slug],
    { revalidate: FIVE_MINUTES, tags: [CACHE_TAGS.curatedLists, CACHE_TAGS.places] },
  )(),
)

// Índice de guías publicadas (home + /guias).
export const getPublishedCuratedListsCached = cache(
  unstable_cache(
    () => container.getListPublishedCuratedListsUseCase().execute(),
    ['curated-lists-published'],
    { revalidate: FIVE_MINUTES, tags: [CACHE_TAGS.curatedLists] },
  ),
)

// Catálogo de categorías (home + explorar). Cambia solo con seed/admin.
export const getCategoriesCached = cache(
  unstable_cache(
    () => container.getGetCategoriesUseCase().execute(),
    ['categories'],
    { revalidate: FIVE_MINUTES, tags: [CACHE_TAGS.places] },
  ),
)

// Facetas de búsqueda con contadores (home + explorar).
export const getPlaceFacetsCached = cache(
  unstable_cache(
    () => container.getGetPlaceFacetsUseCase().execute(),
    ['place-facets'],
    { revalidate: FIVE_MINUTES, tags: [CACHE_TAGS.places] },
  ),
)

// "Lo mejor valorado" de la home (búsqueda sin filtros, orden por reputación).
export const getHomeRecommendedCached = cache(
  unstable_cache(
    () => container.getSearchPlacesUseCase().execute({ limit: 12 }),
    ['home-recommended'],
    { revalidate: FIVE_MINUTES, tags: [CACHE_TAGS.places] },
  ),
)
