// Siembra las cuentas necesarias para capturar los estados con sesión del paquete
// para Claude Design (ver design_briefs/claude_design/). Revertir SIEMPRE al terminar:
//
//   npx tsx --env-file=.env.local scripts/design-shots-setup.ts
//   npx tsx --env-file=.env.local scripts/design-shots-setup.ts --clean
//
// No toca contenido real: solo crea 2 usuarios marcados y presta un Place como
// ficha del dueño (guarda el ownerId previo para restaurarlo, que hoy es null).

import { prisma } from '../src/lib/db'
import { createId } from '@paralleldrive/cuid2'
import bcrypt from 'bcryptjs'

const CONSUMER_EMAIL = 'diseno.consumidor@test.local'
const OWNER_EMAIL = 'diseno.dueno@test.local'
const PASSWORD = 'diseno1234'
// La ficha que el dueño "gestiona" durante las capturas.
const OWNED_PLACE_SLUG = 'osaka'

async function clean() {
  const owned = await prisma.place.findMany({ where: { ownerId: { not: null } }, select: { id: true, slug: true } })
  if (owned.length) {
    await prisma.place.updateMany({ where: { id: { in: owned.map((p) => p.id) } }, data: { ownerId: null } })
    console.log(`  ✓ ownerId revertido a null en: ${owned.map((p) => p.slug).join(', ')}`)
  }
  const users = await prisma.user.findMany({
    where: { email: { in: [CONSUMER_EMAIL, OWNER_EMAIL] } },
    select: { id: true, email: true },
  })
  for (const u of users) {
    await prisma.user.delete({ where: { id: u.id } }) // cascada: profile, colecciones, clicks
    console.log(`  ✓ usuario borrado: ${u.email}`)
  }
  await prisma.placeClick.deleteMany({ where: { place: { slug: OWNED_PLACE_SLUG } } })
  console.log('Limpieza lista ✅')
}

async function setup() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  // ── Consumidor con listas guardadas (para que /mi-cuenta no salga vacía) ──
  const consumer = await prisma.user.upsert({
    where: { email: CONSUMER_EMAIL },
    update: {},
    create: { id: createId(), email: CONSUMER_EMAIL, name: 'Camila Torres', role: 'USER', passwordHash },
  })
  const places = await prisma.place.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true },
    orderBy: { score: 'desc' },
    take: 9,
  })
  const listas = [
    { name: 'Favoritos', items: places.slice(0, 4) },
    { name: 'Cita con la Fran', items: places.slice(4, 7) },
    { name: 'Ir con los cabros', items: places.slice(7, 9) },
  ]
  for (const l of listas) {
    const col = await prisma.collection.create({
      data: { id: createId(), name: l.name, ownerId: consumer.id },
    })
    await prisma.collectionItem.createMany({
      data: l.items.map((p, i) => ({ collectionId: col.id, placeId: p.id, sortOrder: i })),
    })
  }
  // Historial de visitas (alimenta "Mi historial")
  await prisma.visitHistory.createMany({
    data: places.slice(0, 6).map((p) => ({ id: createId(), userId: consumer.id, placeId: p.id })),
    skipDuplicates: true,
  })
  console.log(`  ✓ consumidor: ${CONSUMER_EMAIL} / ${PASSWORD} — 3 listas + historial`)

  // ── Dueño con una ficha gestionada + perfil verificado ──
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {},
    create: { id: createId(), email: OWNER_EMAIL, name: 'Rodrigo Fuentes', role: 'USER', passwordHash },
  })
  await prisma.businessProfile.upsert({
    where: { userId: owner.id },
    update: { verifiedAt: new Date() },
    create: {
      id: createId(),
      userId: owner.id,
      contactEmail: OWNER_EMAIL,
      contactPhone: '+56 9 1234 5678',
      verifiedAt: new Date(),
    },
  })
  const place = await prisma.place.findUnique({ where: { slug: OWNED_PLACE_SLUG }, select: { id: true, name: true } })
  if (!place) throw new Error(`No existe el lugar ${OWNED_PLACE_SLUG}`)
  await prisma.place.update({ where: { id: place.id }, data: { ownerId: owner.id } })

  // Clics de contacto, para que el panel muestre números reales y no ceros.
  const tipos = ['DIRECTIONS', 'WEBSITE', 'PHONE', 'INSTAGRAM', 'MENU'] as const
  const clicks = []
  for (let i = 0; i < 47; i++) {
    clicks.push({
      id: createId(),
      placeId: place.id,
      type: tipos[i % tipos.length],
      createdAt: new Date(Date.now() - i * 3600_000 * 6),
    })
  }
  await prisma.placeClick.createMany({ data: clicks })
  console.log(`  ✓ dueño: ${OWNER_EMAIL} / ${PASSWORD} — gestiona "${place.name}" + 47 clics`)
  console.log(`  ✓ admin del seed: admin@portalpanorama.cl / admin1234`)
  console.log('Setup listo ✅  (recuerda correr con --clean al terminar)')
}

const main = process.argv.includes('--clean') ? clean : setup
main().finally(() => prisma.$disconnect())
