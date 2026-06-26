import type { CuratedListPageView } from '@application/ports/CuratedListRepository'
import { absoluteUrl } from '@lib/siteUrl'

// JSON-LD schema.org/ItemList de la lista curada: los lugares en orden (destacados
// primero, luego el resto de la regla). Google y los LLMs lo usan para entender la
// landing como un ranking editorial de lugares — la pata SEO de las guías.
export function curatedListJsonLd(list: CuratedListPageView): Record<string, unknown> {
  const ordered = [...list.pinned.map((p) => p.place), ...list.rest]

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.name,
    url: absoluteUrl(`/lista/${list.slug}`),
    numberOfItems: ordered.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: ordered.map((place, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/lugar/${place.slug}`),
      name: place.name,
    })),
  }

  if (list.description) ld.description = list.description

  return ld
}
