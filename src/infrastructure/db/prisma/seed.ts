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

  // ── Consumer user ──
  const consumerHash = await bcrypt.hash('usuario1234', 10)
  await prisma.user.upsert({
    where: { email: 'usuario@portalpanorama.cl' },
    update: {},
    create: {
      id: createId(),
      email: 'usuario@portalpanorama.cl',
      name: 'Camila Torres',
      role: 'CONSUMER',
      passwordHash: consumerHash,
    },
  })
  console.log(`  ✓ Usuario consumer: usuario@portalpanorama.cl`)

  // ── Business owner user ──
  const ownerHash = await bcrypt.hash('negocio1234', 10)
  const owner = await prisma.user.upsert({
    where: { email: 'negocio@portalpanorama.cl' },
    update: {},
    create: {
      id: createId(),
      email: 'negocio@portalpanorama.cl',
      name: 'Rodrigo Pérez',
      role: 'BUSINESS_OWNER',
      passwordHash: ownerHash,
    },
  })
  console.log(`  ✓ Usuario negocio: negocio@portalpanorama.cl`)

  // ── Listings ──
  const listingData: Array<{
    slug: string
    name: string
    neighborhood: string
    categorySlug: string
    description: string
    address?: string
    phone?: string
    priceRange?: number
    plan?: 'FREE' | 'PREMIUM'
    tags: { slug: string; name: string }[]
    images: { url: string; alt: string; order: number }[]
  }> = [
    {
      slug: 'la-bodeguita-de-lastarria',
      name: 'La Bodeguita de Lastarria',
      plan: 'PREMIUM',
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
      images: [
        { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80', alt: 'Fachada', order: 0 },
        { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80', alt: 'Interior', order: 1 },
        { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', alt: 'Detalle', order: 2 },
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
      images: [
        { url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80', alt: 'Fachada', order: 0 },
        { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80', alt: 'Interior', order: 1 },
        { url: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1200&q=80', alt: 'Detalle', order: 2 },
      ],
    },
    {
      slug: 'bar-loreto',
      name: 'Bar Loreto',
      plan: 'PREMIUM',
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
      images: [
        { url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80', alt: 'Fachada', order: 0 },
        { url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80', alt: 'Interior', order: 1 },
        { url: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=1200&q=80', alt: 'Detalle', order: 2 },
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
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', alt: 'Fachada', order: 0 },
        { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80', alt: 'Interior', order: 1 },
        { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80', alt: 'Detalle', order: 2 },
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
      images: [
        { url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&q=80', alt: 'Fachada', order: 0 },
        { url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80', alt: 'Interior', order: 1 },
        { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80', alt: 'Detalle', order: 2 },
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
      images: [
        { url: 'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=1200&q=80', alt: 'Fachada', order: 0 },
        { url: 'https://images.unsplash.com/photo-1566054757965-8c4085344c96?w=1200&q=80', alt: 'Interior', order: 1 },
        { url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&q=80', alt: 'Detalle', order: 2 },
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
        plan: data.plan ?? 'FREE',
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
        plan: data.plan ?? 'FREE',
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

    const imgCount = await prisma.listingImage.count({ where: { listingId: listing.id } })
    if (imgCount === 0) {
      await prisma.listingImage.createMany({
        data: data.images.map((img) => ({ id: createId(), listingId: listing.id, ...img })),
      })
    }
  }
  console.log(`  ✓ ${listingData.length} listings publicados`)

  // ── Listing para el usuario negocio ──
  const ambrosia = await prisma.listing.upsert({
    where: { slug: 'ambrosia-bistro' },
    update: { plan: 'PREMIUM' },
    create: {
      id: createId(),
      slug: 'ambrosia-bistro',
      name: 'Ambrosía Bistró',
      description: 'Cocina de autor en el corazón de Providencia. Menú de temporada con ingredientes locales.',
      neighborhood: 'Providencia',
      categoryId: catMap['restaurantes'],
      ownerId: owner.id,
      address: 'Av. Providencia 1234',
      phone: '+56 9 8765 4321',
      status: 'PUBLISHED',
      plan: 'PREMIUM',
    },
  })
  const ambrosiaImgCount = await prisma.listingImage.count({ where: { listingId: ambrosia.id } })
  if (ambrosiaImgCount === 0) {
    await prisma.listingImage.createMany({
      data: [
        { id: createId(), listingId: ambrosia.id, url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80', alt: 'Fachada', order: 0 },
        { id: createId(), listingId: ambrosia.id, url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80', alt: 'Interior', order: 1 },
        { id: createId(), listingId: ambrosia.id, url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80', alt: 'Detalle', order: 2 },
      ],
    })
  }
  console.log(`  ✓ Listing de negocio: Ambrosía Bistró`)

  console.log('Seed completo.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
