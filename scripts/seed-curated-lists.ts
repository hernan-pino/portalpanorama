import { loadEnvFile } from 'node:process'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createId } from '@paralleldrive/cuid2'
import { CURATED_LISTS, type SeedCuratedList } from './curated-lists.data'

// Aplica las guías definidas en `curated-lists.data.ts` a la BD destino.
//
// MODO: "admin manda tras crear" (first-write-wins). El seed CREA la lista la
// primera vez (idempotente por slug). Si la lista YA existe, NO la toca: a partir
// de la creación, el dueño es el admin → las ediciones a mano en /admin/listas
// quedan y nunca se revierten.
//
// Consecuencia: editar una guía YA creada en este archivo NO se propaga sola (la
// lista ya existe → se salta). Para cambiar una existente: edítala en /admin/listas,
// o bórrala ahí y el próximo deploy la recrea desde el código.
//
// - Conservador: jamás borra ni toca listas que no estén en el archivo.
// - Robusto: si un lugar referenciado no existe en la BD, salta ese destacado con
//   un aviso (no rompe el deploy).
// Corre en el build de Vercel (después de `prisma migrate deploy`) y a mano con
// `npm run db:seed:lists`. En local lee `.env.local`; en Vercel usa process.env.

try { loadEnvFile('.env.local') } catch {}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!connectionString) throw new Error('DIRECT_URL / DATABASE_URL no seteada')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

// Serializa la regla a JSON plano omitiendo campos vacíos (igual que el repo).
function ruleToJson(rule: SeedCuratedList['rule']): Prisma.InputJsonValue {
  const out: Record<string, Prisma.InputJsonValue> = {}
  for (const [k, v] of Object.entries(rule)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v as Prisma.InputJsonValue
  }
  return out
}

async function seedList(list: SeedCuratedList): Promise<'created' | 'exists'> {
  // First-write-wins: si ya existe, el admin es el dueño → no se toca.
  const existing = await prisma.curatedList.findUnique({
    where: { slug: list.slug },
    select: { id: true },
  })
  if (existing) return 'exists'

  // Resolver lugares por slug (los que falten se saltan con aviso).
  const slugs = list.pins.map((p) => p.placeSlug)
  const places = await prisma.place.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  })
  const idBySlug = new Map(places.map((p) => [p.slug, p.id]))
  const missing = slugs.filter((s) => !idBySlug.has(s))
  if (missing.length > 0) {
    console.warn(`  ⚠️  "${list.slug}": lugares no encontrados (se saltan): ${missing.join(', ')}`)
  }
  const pins = list.pins
    .filter((p) => idBySlug.has(p.placeSlug))
    .map((p, i) => ({ placeId: idBySlug.get(p.placeSlug)!, blurb: p.blurb ?? null, sortOrder: i }))

  const id = createId()
  await prisma.curatedList.create({
    data: {
      id,
      slug: list.slug,
      name: list.name,
      kind: list.kind,
      description: list.description ?? null,
      intro: list.intro ?? null,
      coverImageUrl: list.coverImageUrl ?? null,
      rule: ruleToJson(list.rule),
      sort: list.sort ?? 'score_desc',
      isPublished: list.isPublished,
      publishedAt: list.isPublished ? new Date() : null,
      pins: { create: pins },
    },
  })

  return 'created'
}

async function main() {
  console.log(`Seed de listas curadas: ${CURATED_LISTS.length} definida(s).`)
  for (const list of CURATED_LISTS) {
    const result = await seedList(list)
    const label = result === 'created' ? 'creada' : 'ya existe (la maneja el admin)'
    console.log(`  • ${list.slug} → ${label}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
