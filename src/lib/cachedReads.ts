import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { container } from './container'

// Lecturas públicas cacheadas (Data Cache de Next) para las páginas de contenido.
//
// Por qué: cada navegación era SSR dinámico esperando a Neon antes del primer
// byte (LCP de ~7s en móvil). Estos read-models son globales (no dependen de la
// sesión — los corazones/save-context van aparte y nunca se cachean acá), así
// que se sirven desde el caché y se refrescan:
//   - por tag (`revalidateTag`): las actions del admin lo llaman directo, y los
//     scripts de carga (prod-sync/ingest/enrich) pegan a POST /api/revalidate
//     al terminar → el contenido nuevo se ve al tiro, y
//   - por tiempo (`revalidate`, 1 hora): red de seguridad para cualquier
//     escritura externa que olvide invalidar. Con 5 min el caché estaba casi
//     siempre frío (360+ fichas) y el TTFB de ficha llegaba a 1.8s en móvil.
//
// El wrapper exterior `cache()` (React) dedupea dentro del mismo request:
// generateMetadata + page comparten una sola ejecución por render.

export const CACHE_TAGS = {
  // Cualquier mutación de lugares/marcas (afecta fichas, búsqueda y facetas).
  places: 'places',
  // Mutaciones de listas curadas (afecta /guias, /lista/[slug] y la home).
  curatedLists: 'curated-lists',
} as const

const ONE_HOUR = 3600

// Ficha completa + relacionados. Errores (PlaceNotFoundError) no se cachean:
// unstable_cache solo guarda resultados exitosos.
export const getPlaceDetailCached = cache((slug: string) =>
  unstable_cache(
    () => container.getGetPlaceBySlugUseCase().execute(slug),
    ['place-detail', slug],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.places] },
  )(),
)

// Página completa de una guía/lista curada (destacados + menciones + grilla).
// Su regla resuelve sobre lugares publicados → también depende del tag places.
export const getCuratedListPageCached = cache((slug: string) =>
  unstable_cache(
    () => container.getGetCuratedListBySlugUseCase().execute(slug),
    ['curated-list-page', slug],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.curatedLists, CACHE_TAGS.places] },
  )(),
)

// Índice de guías publicadas (home + /guias).
export const getPublishedCuratedListsCached = cache(
  unstable_cache(
    () => container.getListPublishedCuratedListsUseCase().execute(),
    ['curated-lists-published'],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.curatedLists] },
  ),
)

// Catálogo de categorías (home + explorar). Cambia solo con seed/admin.
export const getCategoriesCached = cache(
  unstable_cache(
    () => container.getGetCategoriesUseCase().execute(),
    ['categories'],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.places] },
  ),
)

// Facetas de búsqueda con contadores (home + explorar).
export const getPlaceFacetsCached = cache(
  unstable_cache(
    () => container.getGetPlaceFacetsUseCase().execute(),
    ['place-facets'],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.places] },
  ),
)

// "Lo mejor valorado" de la home (búsqueda sin filtros, orden por reputación).
export const getHomeRecommendedCached = cache(
  unstable_cache(
    () => container.getSearchPlacesUseCase().execute({ limit: 12 }),
    ['home-recommended'],
    { revalidate: ONE_HOUR, tags: [CACHE_TAGS.places] },
  ),
)
