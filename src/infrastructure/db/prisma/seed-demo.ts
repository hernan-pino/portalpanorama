import { loadEnvFile } from 'node:process'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createId } from '@paralleldrive/cuid2'

try { loadEnvFile('.env.local') } catch { }

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

// ──────────────────────────────────────────────────────────────────────────────
// Seed DEMO — SOLO para verificar la ficha/tarjeta en local (Etapa 4E). NO es el
// seed real: los ~100 lugares entran por CSV en la Etapa 5. Idempotente (upsert por
// slug). Cubre el abanico de casos (precio, reserva, lluvia, con/sin metro, rating,
// fotos, categoría secundaria) para ver la degradación con gracia.
// Correr:  npx tsx src/infrastructure/db/prisma/seed-demo.ts
// Borrar:  npx tsx src/infrastructure/db/prisma/seed-demo.ts --clean
// ──────────────────────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Promedio bayesiano (m=50, prior C). Solo ordena; no se muestra.
function bayes(R: number | null, v: number | null, C = 4.3, m = 50): number {
  if (R == null || v == null) return R ?? 0
  return Number(((v / (v + m)) * R + (m / (v + m)) * C).toFixed(4))
}

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`

interface DemoImage { url: string; alt: string; credit?: string }
interface DemoPlace {
  name: string
  description?: string
  menuUrl?: string
  categorySlug: string
  subcategorySlug: string
  secondaryCategorySlug?: string
  address?: string
  communeSlug: string
  neighborhoodSlug?: string
  lat?: number
  lng?: number
  metroStationSlug?: string
  accessDetail?: string
  reference?: string
  rainPolicy?: 'SUSPENDED' | 'RELOCATED' | 'CONTINUES'
  priceRange?: 'FREE' | 'UNDER_5000' | 'FROM_5000_TO_15000' | 'FROM_15000_TO_30000' | 'OVER_30000'
  reservation?: 'REQUIRED' | 'WALK_IN' | 'RECOMMENDED'
  paymentMethods: string[]
  schedule?: string
  phone?: string
  website?: string
  instagram?: string
  googleRating?: number
  googleReviewCount?: number
  images: DemoImage[]
  tagSlugs: string[]
}

const PLACES: DemoPlace[] = [
  {
    name: 'Terraza Rosario',
    description: 'Un café de barrio que al caer la tarde se vuelve bar. Mesas de mármol bajo los parrones, brunch largo los fines de semana y una carta corta de cocina de autor que cambia con lo que hay en la feria. Buen lugar para quedarse horas sin que nadie te apure.',
    menuUrl: 'https://example.com/terrazarosario/carta',
    categorySlug: 'gastronomia', subcategorySlug: 'cafe-cafeteria',
    address: 'Av. Italia 1235, Providencia', communeSlug: 'providencia', neighborhoodSlug: 'barrio-italia',
    lat: -33.4419, lng: -70.6203, metroStationSlug: 'santa-isabel',
    accessDetail: 'Acceso en silla de ruedas por Av. Italia. Baño accesible en el primer piso.',
    reference: 'En la esquina con Girardi, frente a la plaza. Entra por el pasaje de baldosas.',
    rainPolicy: 'RELOCATED',
    priceRange: 'FROM_5000_TO_15000', reservation: 'WALK_IN',
    paymentMethods: ['Efectivo', 'Débito', 'Crédito'],
    schedule: 'Mar a Dom · 9:00–23:00\nLunes cerrado',
    phone: '+56 2 2987 4410', website: 'terrazarosario.cl', instagram: '@terrazarosario',
    googleRating: 4.6, googleReviewCount: 1240,
    images: [
      { url: U('photo-1554118811-1e0d58224f24'), alt: 'Interior del café con plantas', credit: '© Rosario' },
      { url: U('photo-1447933601403-0c6688de566e'), alt: 'Taza de café sobre la barra', credit: '@terrazarosario' },
      { url: U('photo-1504674900247-0877df9cc836'), alt: 'Plato de cocina de autor', credit: 'Foto: J. Pérez' },
      { url: U('photo-1414235077428-338989a2e8c0'), alt: 'Salón con mesas de mármol', credit: '© Rosario' },
      { url: U('photo-1559339352-11d035aa65de'), alt: 'Detalle de la cafetera', credit: '@terrazarosario' },
    ],
    tagSlugs: ['en-pareja', 'con-amigos', 'pet-friendly', 'acceso-silla-de-ruedas', 'bano-disponible', 'tranquilo', 'fotogenico', 'terraza', 'opciones-veganas', 'musica-en-vivo'],
  },
  {
    name: 'Mirador Pablo Neruda',
    description: 'Una terraza urbana en lo alto del cerro, con vista a toda la ciudad y la cordillera de fondo. Punto clásico para ver el atardecer.',
    categorySlug: 'naturaleza', subcategorySlug: 'mirador',
    address: 'Cumbre Cerro San Cristóbal, Recoleta', communeSlug: 'recoleta',
    lat: -33.4250, lng: -70.6320,
    reference: 'Sube por el funicular o el camino de autos; el mirador está pasado el zoológico.',
    rainPolicy: 'SUSPENDED',
    priceRange: 'FREE',
    paymentMethods: [],
    schedule: 'Todos los días · 8:00–20:00',
    images: [
      { url: U('photo-1470770841072-f978cf4d019e'), alt: 'Vista de la ciudad al atardecer', credit: 'Foto: Parquemet' },
    ],
    tagSlugs: ['en-pareja', 'con-ninos-pequenos', 'pet-friendly', 'fotogenico', 'tranquilo', 'al-aire-libre'],
  },
  {
    name: 'Café Forastero',
    description: 'Cafetería de especialidad chica y luminosa, ideal para trabajar o leer con un flat white. Tuestan su propio grano.',
    categorySlug: 'gastronomia', subcategorySlug: 'cafe-cafeteria',
    address: 'Av. Irarrázaval 2020, Ñuñoa', communeSlug: 'nunoa',
    lat: -33.4561, lng: -70.5980, metroStationSlug: 'nunoa',
    priceRange: 'UNDER_5000', reservation: 'RECOMMENDED',
    paymentMethods: ['Efectivo', 'Débito'],
    schedule: 'Lun a Sáb · 8:30–19:00',
    instagram: '@cafeforastero',
    googleRating: 4.5, googleReviewCount: 870,
    images: [
      { url: U('photo-1559925393-8be0ec4767c8'), alt: 'Barra del café', credit: '@cafeforastero' },
      { url: U('photo-1453614512568-c4024d13c247'), alt: 'Mesa junto a la ventana', credit: '@cafeforastero' },
    ],
    tagSlugs: ['ideal-ir-solo-a', 'con-amigos', 'tranquilo', 'de-barrio', 'terraza'],
  },
  {
    name: 'Museo de la Memoria',
    description: 'Espacio dedicado a la memoria de las violaciones a los derechos humanos. Entrada liberada, con visitas guiadas y exposiciones permanentes y temporales.',
    categorySlug: 'arte-cultura', subcategorySlug: 'museo',
    address: 'Matucana 501, Santiago', communeSlug: 'santiago', neighborhoodSlug: 'barrio-yungay',
    lat: -33.4400, lng: -70.6820, metroStationSlug: 'quinta-normal',
    accessDetail: 'Acceso universal en todos los pisos. Baños accesibles y ascensor.',
    reference: 'Frente al Parque Quinta Normal, a una cuadra del metro.',
    priceRange: 'FREE',
    paymentMethods: [],
    schedule: 'Mar a Dom · 10:00–18:00\nLunes cerrado',
    website: 'museodelamemoria.cl',
    googleRating: 4.7, googleReviewCount: 9800,
    images: [
      { url: U('photo-1518998053901-5348d3961a04'), alt: 'Sala de exposición', credit: 'Foto: MMDH' },
      { url: U('photo-1605522561233-768ad7a8fabf'), alt: 'Fachada del museo', credit: 'Foto: MMDH' },
      { url: U('photo-1574182245530-967d9b3831af'), alt: 'Pasillo interior', credit: 'Foto: MMDH' },
    ],
    tagSlugs: ['con-familia', 'con-ninos-pequenos', 'acceso-silla-de-ruedas', 'bano-disponible', 'cerca-del-metro', 'cultureta'],
  },
  {
    name: 'La Vinería de Italia',
    description: 'Bar de vinos con carta de pequeños productores chilenos y tablas para compartir. Ambiente íntimo, ideal para una cita o un after.',
    menuUrl: 'https://example.com/vineria/carta',
    categorySlug: 'gastronomia', subcategorySlug: 'bar',
    address: 'Av. Italia 1450, Providencia', communeSlug: 'providencia', neighborhoodSlug: 'barrio-italia',
    lat: -33.4430, lng: -70.6210, metroStationSlug: 'santa-isabel',
    priceRange: 'OVER_30000', reservation: 'REQUIRED',
    paymentMethods: ['Débito', 'Crédito'],
    schedule: 'Mié a Sáb · 19:00–01:00',
    phone: '+56 2 2123 4567', instagram: '@lavineriadeitalia',
    googleRating: 4.7, googleReviewCount: 540,
    images: [
      { url: U('photo-1510812431401-41d2bd2722f3'), alt: 'Copas de vino en la barra', credit: '@lavineriadeitalia' },
      { url: U('photo-1470158499416-75be9aa0c4db'), alt: 'Tabla para compartir', credit: '@lavineriadeitalia' },
    ],
    tagSlugs: ['en-pareja', 'con-amigos', 'intimo-romantico', 'animado', 'happy-hour', 'musica-en-vivo'],
  },
  {
    name: 'Librería del Pasaje',
    description: 'Librería independiente con foco en literatura latinoamericana y un rincón de café. Hacen lanzamientos y clubes de lectura.',
    categorySlug: 'locales-tiendas', subcategorySlug: 'libreria', secondaryCategorySlug: 'arte-cultura',
    address: 'José Victorino Lastarria 305, Santiago', communeSlug: 'santiago', neighborhoodSlug: 'barrio-lastarria',
    lat: -33.4378, lng: -70.6403, metroStationSlug: 'bellas-artes',
    priceRange: 'UNDER_5000',
    paymentMethods: ['Efectivo', 'Débito', 'Crédito'],
    schedule: 'Lun a Sáb · 11:00–20:00',
    website: 'libreriadelpasaje.cl', instagram: '@libreriadelpasaje',
    googleRating: 4.4, googleReviewCount: 320,
    images: [], // sin fotos → prueba el placeholder del hero y de la tarjeta
    tagSlugs: ['ideal-ir-solo-a', 'tranquilo', 'cultureta', 'con-zona-de-estar'],
  },
  {
    name: 'Parque Bicentenario',
    description: 'Gran parque urbano junto al río con lagunas, áreas de picnic y mucho pasto. Apto para ir con niños, mascotas y pasar la tarde.',
    categorySlug: 'naturaleza', subcategorySlug: 'parque-urbano',
    address: 'Av. Bicentenario 3236, Vitacura', communeSlug: 'vitacura',
    lat: -33.3950, lng: -70.6020,
    reference: 'Entrada principal por Av. Bicentenario; hay estacionamientos a lo largo del parque.',
    rainPolicy: 'CONTINUES',
    priceRange: 'FREE',
    paymentMethods: [],
    schedule: 'Todos los días · 6:00–22:00',
    googleRating: 4.7, googleReviewCount: 9800,
    images: [
      { url: U('photo-1441974231531-c6227db76b6e'), alt: 'Pasto y árboles del parque', credit: 'Foto: Vitacura' },
      { url: U('photo-1426604966848-d7adac402bff'), alt: 'Laguna del parque', credit: 'Foto: Vitacura' },
    ],
    tagSlugs: ['con-familia', 'con-ninos-pequenos', 'pet-friendly', 'al-aire-libre', 'estacionamiento-propio', 'relajado', 'familiar'],
  },
]

async function clean() {
  const slugs = PLACES.map((p) => slugify(p.name))
  const places = await prisma.place.findMany({ where: { slug: { in: slugs } }, select: { id: true } })
  const ids = places.map((p) => p.id)
  if (ids.length === 0) { console.log('Nada que borrar.'); return }
  await prisma.placeTag.deleteMany({ where: { placeId: { in: ids } } })
  await prisma.placeImage.deleteMany({ where: { placeId: { in: ids } } })
  await prisma.place.deleteMany({ where: { id: { in: ids } } })
  console.log(`✓ Borrados ${ids.length} lugares de demo.`)
}

async function main() {
  if (process.argv.includes('--clean')) { await clean(); return }

  // Resolver catálogos por slug
  const [categories, subcategories, communes, neighborhoods, stations, tags] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.subcategory.findMany({ select: { id: true, slug: true, categoryId: true } }),
    prisma.commune.findMany({ select: { id: true, slug: true } }),
    prisma.neighborhood.findMany({ select: { id: true, slug: true } }),
    prisma.metroStation.findMany({ select: { id: true, slug: true } }),
    prisma.tag.findMany({ select: { id: true, slug: true } }),
  ])
  const catId = (s: string) => categories.find((c) => c.slug === s)?.id
  const subId = (catSlug: string, s: string) => {
    const cid = catId(catSlug)
    return subcategories.find((x) => x.slug === s && x.categoryId === cid)?.id
  }
  const communeId = (s: string) => communes.find((c) => c.slug === s)?.id
  const neighborhoodId = (s: string) => neighborhoods.find((n) => n.slug === s)?.id
  const stationId = (s: string) => stations.find((m) => m.slug === s)?.id
  const tagId = (s: string) => tags.find((t) => t.slug === s)?.id

  console.log('Seeding lugares de demo (Etapa 4E)…')
  for (const p of PLACES) {
    const slug = slugify(p.name)
    const categoryId = catId(p.categorySlug)
    const subcategoryId = subId(p.categorySlug, p.subcategorySlug)
    const cId = communeId(p.communeSlug)
    if (!categoryId || !subcategoryId || !cId) {
      console.error(`✗ ${p.name}: catálogo no encontrado (cat=${p.categorySlug} sub=${p.subcategorySlug} comuna=${p.communeSlug}). Saltado.`)
      continue
    }
    const resolvedTags = p.tagSlugs.map((s) => ({ s, id: tagId(s) }))
    const missing = resolvedTags.filter((t) => !t.id).map((t) => t.s)
    if (missing.length) console.warn(`  ! ${p.name}: tags sin match (omitidos): ${missing.join(', ')}`)
    const tagIds = resolvedTags.filter((t) => t.id).map((t) => t.id!)

    const data = {
      slug, name: p.name, description: p.description ?? null, menuUrl: p.menuUrl ?? null,
      categoryId, subcategoryId,
      secondaryCategoryId: p.secondaryCategorySlug ? (catId(p.secondaryCategorySlug) ?? null) : null,
      address: p.address ?? null, communeId: cId,
      neighborhoodId: p.neighborhoodSlug ? (neighborhoodId(p.neighborhoodSlug) ?? null) : null,
      lat: p.lat ?? null, lng: p.lng ?? null,
      metroStationId: p.metroStationSlug ? (stationId(p.metroStationSlug) ?? null) : null,
      accessDetail: p.accessDetail ?? null, reference: p.reference ?? null,
      rainPolicy: p.rainPolicy ?? null,
      priceRange: p.priceRange ?? null, reservation: p.reservation ?? null,
      paymentMethods: p.paymentMethods, schedule: p.schedule ?? null,
      phone: p.phone ?? null, website: p.website ?? null, instagram: p.instagram ?? null,
      googleRating: p.googleRating ?? null, googleReviewCount: p.googleReviewCount ?? null,
      score: bayes(p.googleRating ?? null, p.googleReviewCount ?? null),
      status: 'PUBLISHED' as const,
    }

    const place = await prisma.place.upsert({
      where: { slug },
      update: data,
      create: { id: createId(), createdAt: new Date(), ...data },
    })

    // Imágenes y tags: reemplazo total (idempotente)
    await prisma.placeImage.deleteMany({ where: { placeId: place.id } })
    if (p.images.length) {
      await prisma.placeImage.createMany({
        data: p.images.map((img, i) => ({
          id: createId(), placeId: place.id, url: img.url, alt: img.alt,
          credit: img.credit ?? null, isPrimary: i === 0, sortOrder: i,
        })),
      })
    }
    await prisma.placeTag.deleteMany({ where: { placeId: place.id } })
    if (tagIds.length) {
      await prisma.placeTag.createMany({ data: tagIds.map((tagId) => ({ placeId: place.id, tagId })) })
    }

    console.log(`  ✓ ${p.name}  →  /lugar/${slug}`)
  }
  console.log('Seed demo completo ✅')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
