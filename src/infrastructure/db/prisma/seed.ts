import { loadEnvFile } from 'node:process'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createId } from '@paralleldrive/cuid2'
import bcrypt from 'bcryptjs'

try { loadEnvFile('.env.local') } catch { }

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database…')

  // ── Categories ──
  const categories = [
    { slug: 'restaurantes', name: 'Restaurantes' },
    { slug: 'cafes',        name: 'Cafés' },
    { slug: 'bares',        name: 'Bares' },
    { slug: 'museos',       name: 'Museos' },
    { slug: 'tiendas',      name: 'Tiendas' },
    { slug: 'servicios',    name: 'Servicios' },
  ]

  const catMap: Record<string, string> = {}
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { id: createId(), slug: cat.slug, name: cat.name },
    })
    catMap[cat.slug] = record.id
  }
  console.log(`  ✓ ${categories.length} categorías`)

  // ── Admin user ──
  const adminId = createId()
  const passwordHash = await bcrypt.hash('admin1234', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@portalpanorama.cl' },
    update: {},
    create: {
      id: adminId,
      email: 'admin@portalpanorama.cl',
      name: 'Admin',
      role: 'ADMIN',
      passwordHash,
    },
  })
  console.log(`  ✓ Usuario admin: ${admin.email}`)

  // ── Listings ──
  const listingData = [
    {
      slug: 'la-bodeguita-de-lastarria',
      name: 'La Bodeguita de Lastarria',
      neighborhood: 'Lastarria',
      categorySlug: 'restaurantes',
      description:
        'Cocina chilena de mercado con carta que cambia según la temporada. Ambiente íntimo en una casona del siglo XIX restaurada con gusto. El lomo a lo pobre aquí se hace con papas fritas en aceite de pato.',
      address: 'Rosal 358, Lastarria',
      phone: '+56 2 2632 7000',
      priceRange: 3,
      tags: [
        { slug: 'chilena', name: 'Cocina chilena' },
        { slug: 'mercado', name: 'De mercado' },
        { slug: 'vinos', name: 'Carta de vinos' },
      ],
    },
    {
      slug: 'cafe-the-clinic',
      name: 'Café The Clinic',
      neighborhood: 'Bellavista',
      categorySlug: 'cafes',
      description:
        'El café del semanario de humor político más leído de Chile. Terraza en Bellavista, sandwiches enormes, cerveza artesanal y la mejor ensalada de berros de Santiago.',
      address: 'Patio Bellavista, Constitución 30',
      phone: '+56 2 2730 1040',
      priceRange: 2,
      tags: [
        { slug: 'terraza', name: 'Terraza' },
        { slug: 'brunch', name: 'Brunch' },
        { slug: 'pet-friendly', name: 'Pet friendly' },
      ],
    },
    {
      slug: 'bar-loreto',
      name: 'Bar Loreto',
      neighborhood: 'Italia',
      categorySlug: 'bares',
      description:
        'Cantina italiana en barrio Italia. Vinos de autor, tablas de embutidos importados y una selección de vermú que no encontrarás en ningún otro bar de Santiago.',
      address: 'Loreto 49, Providencia',
      phone: '+56 2 2209 8300',
      priceRange: 3,
      tags: [
        { slug: 'vermut', name: 'Vermú' },
        { slug: 'vinos-naturales', name: 'Vinos naturales' },
        { slug: 'cocteleria', name: 'Coctelería' },
      ],
    },
    {
      slug: 'museo-de-la-moda',
      name: 'Museo de la Moda',
      neighborhood: 'Vitacura',
      categorySlug: 'museos',
      description:
        'La colección de moda más importante de Latinoamérica. Más de 10.000 piezas que van desde los años 1600 hasta el presente. Vale la pena la visita solo por la sala Chanel.',
      address: 'Av. Vitacura 4562, Vitacura',
      phone: '+56 2 2219 3623',
      priceRange: 2,
      tags: [
        { slug: 'moda', name: 'Moda' },
        { slug: 'historia', name: 'Historia' },
        { slug: 'arte', name: 'Arte' },
      ],
    },
    {
      slug: 'tienda-deco-italia',
      name: 'Deco Italia',
      neighborhood: 'Italia',
      categorySlug: 'tiendas',
      description:
        'Diseño chileno contemporáneo. Muebles, cerámica y textiles de productores nacionales. El espacio fue una vieja ferretería que conserva el piso de madera original.',
      address: 'Condell 1460, Providencia',
      priceRange: 3,
      tags: [
        { slug: 'diseno-chileno', name: 'Diseño chileno' },
        { slug: 'ceramica', name: 'Cerámica' },
        { slug: 'regalos', name: 'Regalos' },
      ],
    },
    {
      slug: 'galeria-animal',
      name: 'Galería Animal',
      neighborhood: 'Lastarria',
      categorySlug: 'servicios',
      description:
        'La galería de arte contemporáneo más influyente de Chile. Representa a más de 30 artistas nacionales e internacionales. Entrada libre, siempre hay algo interesante.',
      address: 'Av. Nueva Costanera 3731, Vitacura',
      priceRange: 1,
      tags: [
        { slug: 'arte-contemporaneo', name: 'Arte contemporáneo' },
        { slug: 'entrada-libre', name: 'Entrada libre' },
        { slug: 'galeria', name: 'Galería' },
      ],
    },
  ]

  for (const data of listingData) {
    const catId = catMap[data.categorySlug]
    const listing = await prisma.listing.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description,
        address: data.address ?? null,
        phone: data.phone ?? null,
        priceRange: data.priceRange ?? null,
        status: 'PUBLISHED',
      },
      create: {
        id: createId(),
        slug: data.slug,
        name: data.name,
        description: data.description,
        neighborhood: data.neighborhood,
        categoryId: catId,
        ownerId: admin.id,
        address: data.address ?? null,
        phone: data.phone ?? null,
        priceRange: data.priceRange ?? null,
        status: 'PUBLISHED',
        plan: 'FREE',
      },
    })

    for (const tag of data.tags) {
      await prisma.listingTag.upsert({
        where: { listingId_slug: { listingId: listing.id, slug: tag.slug } },
        update: {},
        create: {
          id: createId(),
          listingId: listing.id,
          slug: tag.slug,
          name: tag.name,
          status: 'ACTIVE',
        },
      })
    }
  }
  console.log(`  ✓ ${listingData.length} listings publicados`)

  console.log('Seed completo.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
