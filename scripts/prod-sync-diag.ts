// DIAGNÓSTICO read-only del sync local→prod. NO escribe nada.
// Compara la BD local (DATABASE_URL) con prod (PROD_DB_URL) para scopear el sync:
// qué lugares cuisine-tagged ya existen en prod, cuáles faltan, estado de la capa CUISINE.
//
//   npx tsx --env-file=.env.local scripts/prod-sync-diag.ts
//
// Requiere PROD_DB_URL en .env.local (connection string DIRECTA del branch prod de Neon).
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const PROD_URL = process.env.PROD_DB_URL
const LOCAL_URL = process.env.DATABASE_URL
if (!PROD_URL) {
  console.error('✗ Falta PROD_DB_URL en .env.local (string directa del branch prod de Neon).')
  process.exit(1)
}
if (!LOCAL_URL) {
  console.error('✗ Falta DATABASE_URL en .env.local.')
  process.exit(1)
}

const local = new PrismaClient({ adapter: new PrismaPg({ connectionString: LOCAL_URL }) })
const prod = new PrismaClient({ adapter: new PrismaPg({ connectionString: PROD_URL }) })

async function main() {
  // --- Lugares cuisine-tagged en LOCAL (slug → tags de cocina) ---
  const localCuisine = await local.place.findMany({
    where: { tags: { some: { tag: { layer: 'CUISINE' } } } },
    select: {
      slug: true,
      name: true,
      tags: { where: { tag: { layer: 'CUISINE' } }, select: { tag: { select: { slug: true } } } },
    },
    orderBy: { name: 'asc' },
  })

  // --- Catálogo CUISINE en local vs prod ---
  const localCuisineTags = await local.tag.findMany({ where: { layer: 'CUISINE' }, select: { slug: true } })
  const prodCuisineTags = await prod.tag.findMany({ where: { layer: 'CUISINE' }, select: { slug: true } })

  // --- Totales de Place ---
  const [localTotal, prodTotal] = await Promise.all([local.place.count(), prod.place.count()])

  // --- Cuáles de los cuisine-tagged locales existen en prod (por slug) ---
  const slugs = localCuisine.map((p) => p.slug)
  const prodMatches = await prod.place.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true },
  })
  const prodSlugSet = new Set(prodMatches.map((p) => p.slug))
  const inProd = localCuisine.filter((p) => prodSlugSet.has(p.slug))
  const missing = localCuisine.filter((p) => !prodSlugSet.has(p.slug))

  // --- MUT ---
  const mutLocal = await local.place.findFirst({ where: { slug: { contains: 'mut' } }, select: { slug: true, name: true } })
  const mutInProd = mutLocal ? await prod.place.findFirst({ where: { slug: mutLocal.slug }, select: { slug: true } }) : null

  console.log('========== DIAGNÓSTICO SYNC local → prod ==========')
  console.log(`Places totales:   local=${localTotal}   prod=${prodTotal}`)
  console.log(`Tags CUISINE:     local=${localCuisineTags.length}   prod=${prodCuisineTags.length}`)
  console.log(`Cuisine-tagged en local: ${localCuisine.length}`)
  console.log(`  → ya existen en prod (solo falta etiquetar): ${inProd.length}`)
  console.log(`  → NO están en prod (crear + etiquetar):       ${missing.length}`)

  if (missing.length) {
    console.log('\n--- Faltan en prod (crear): ---')
    for (const p of missing) {
      const cui = p.tags.map((t) => t.tag.slug).join(', ')
      console.log(`  • ${p.name}  [${p.slug}]  cuisine: ${cui}`)
    }
  }

  console.log(`\nMUT en local: ${mutLocal ? mutLocal.name + ' [' + mutLocal.slug + ']' : 'NO'}`)
  console.log(`MUT en prod:  ${mutInProd ? 'sí' : 'NO (hay que crearlo)'}`)
  console.log('===================================================')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await local.$disconnect(); await prod.$disconnect() })
