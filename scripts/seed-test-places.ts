// Siembra lugares de PRUEBA publicados para verificar la UI con datos (home,
// explorar, carrusel de relacionados, ficha). NO es seed de catálogo ni de prod.
// Usa los use cases reales (respeta invariantes + la validación categoría/subcat).
// Todos en una misma comuna para que se relacionen entre sí (carrusel con flechas).
//
//   Correr:   npx tsx --env-file=.env.local scripts/seed-test-places.ts
//   Borrar:   npx tsx --env-file=.env.local scripts/seed-test-places.ts --clean
//
// Los lugares de prueba se marcan con el prefijo de slug TEST_PREFIX para poder
// borrarlos sin tocar contenido real.

import { prisma } from '../src/lib/db'
import { container } from '../src/lib/container'
import type { PlaceWriteInput } from '../src/application/place/PlaceWriteInput'
import { PriceRange } from '../src/domain/place/PriceRange'

const COMMUNE_SLUG = 'providencia'
const IMG = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`

type Spec = {
  name: string
  description: string
  category: string
  subcategory: string
  priceRange?: PlaceWriteInput['priceRange']
  googleRating: number
  googleReviewCount: number
  audience: number // cuántos tags de cada capa tomar del pool
  occasion: number
  vibe: number
  image: string
}

const SPECS: Spec[] = [
  {
    name: 'Café Volta (prueba)',
    description: 'Cafetería de especialidad con tostado propio, pan de masa madre y mesas al sol. Ideal para trabajar de día o juntarse a la tarde.',
    category: 'gastronomia', subcategory: 'cafe-cafeteria',
    priceRange: PriceRange.FROM_5000_TO_15000, googleRating: 4.7, googleReviewCount: 1280,
    audience: 2, occasion: 2, vibe: 2, image: 'photo-1501339847302-ac426a4a7cbb',
  },
  {
    name: 'Parque de los Reyes (prueba)',
    description: 'Gran parque urbano con ciclovías, áreas verdes y juegos. Perfecto para ir en familia un fin de semana.',
    category: 'naturaleza', subcategory: 'parque-urbano',
    priceRange: PriceRange.FREE, googleRating: 4.5, googleReviewCount: 4300,
    audience: 2, occasion: 2, vibe: 1, image: 'photo-1441974231531-c6227db76b6e',
  },
  {
    name: 'Galería Norte (prueba)',
    description: 'Galería de arte contemporáneo con muestras rotativas de artistas chilenos emergentes. Entrada liberada.',
    category: 'arte-cultura', subcategory: 'galeria-de-arte',
    priceRange: PriceRange.FREE, googleRating: 4.6, googleReviewCount: 320,
    audience: 1, occasion: 2, vibe: 2, image: 'photo-1545989253-02cc26577f88',
  },
  {
    name: 'Bar Lumen (prueba)',
    description: 'Bar de coctelería de autor y vinilos en vivo los jueves. Ambiente íntimo, ideal para after office o una cita.',
    category: 'vida-nocturna', subcategory: 'club-de-jazz-blues',
    priceRange: PriceRange.FROM_15000_TO_30000, googleRating: 4.4, googleReviewCount: 540,
    audience: 2, occasion: 1, vibe: 2, image: 'photo-1514933651103-005eec06c04b',
  },
]

const TEST_NAME_MARK = '(prueba)'

async function clean() {
  const places = await prisma.place.findMany({
    where: { name: { contains: TEST_NAME_MARK } },
    select: { id: true, name: true },
  })
  for (const p of places) {
    await prisma.place.delete({ where: { id: p.id } })
    console.log('  ✗ borrado:', p.name)
  }
  console.log(`Listo. ${places.length} lugar(es) de prueba borrado(s).`)
}

async function seed() {
  const commune = await prisma.commune.findFirst({ where: { slug: COMMUNE_SLUG } })
  if (!commune) throw new Error(`No existe la comuna "${COMMUNE_SLUG}" en la BD.`)

  const categories = await prisma.category.findMany({
    where: { isActive: true, eventOnly: false },
    include: { subcategories: true },
  })
  const tagsByLayer = new Map<string, string[]>()
  for (const t of await prisma.tag.findMany({ select: { id: true, layer: true } })) {
    const arr = tagsByLayer.get(t.layer) ?? []
    arr.push(t.id)
    tagsByLayer.set(t.layer, arr)
  }
  const pick = (layer: string, n: number) => (tagsByLayer.get(layer) ?? []).slice(0, n)

  for (const s of SPECS) {
    const cat = categories.find((c) => c.slug === s.category)
    const sub = cat?.subcategories.find((x) => x.slug === s.subcategory)
    if (!cat || !sub) throw new Error(`Categoría/subcat no encontrada: ${s.category}/${s.subcategory}`)

    const input: PlaceWriteInput = {
      name: s.name,
      description: s.description,
      categoryId: cat.id,
      subcategoryId: sub.id,
      communeId: commune.id,
      priceRange: s.priceRange,
      paymentMethods: ['Efectivo', 'Débito', 'Crédito'],
      parkingOptions: [],
      socialLinks: [],
      googleRating: s.googleRating,
      googleReviewCount: s.googleReviewCount,
      tagIds: [
        ...pick('AUDIENCE', s.audience),
        ...pick('OCCASION', s.occasion),
        ...pick('VIBE', s.vibe),
      ],
      images: [{ url: IMG(s.image), alt: s.name, isPrimary: true, sortOrder: 0 }],
      points: [],
    }

    const { placeId } = await container.getCreatePlaceUseCase().execute(input)
    await container.getPublishPlaceUseCase().execute(placeId)
    console.log('  ✓ publicado:', s.name)
  }
  console.log(`Listo. ${SPECS.length} lugares de prueba publicados en ${commune.name}.`)
}

const mode = process.argv.includes('--clean') ? 'clean' : 'seed'
;(mode === 'clean' ? clean() : seed())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
