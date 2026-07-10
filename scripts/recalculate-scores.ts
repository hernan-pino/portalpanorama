// Re-bate el score bayesiano de TODOS los lugares (RecalculateScoresUseCase) con el
// prior por categoría (sesión 27). Correr tras cambiar la fórmula o tras una carga
// grande (el prior de la categoría cambia y arrastra los scores).
//
//   npx tsx --env-file=.env.local scripts/recalculate-scores.ts --dry          # local, previsualiza
//   npx tsx --env-file=.env.local scripts/recalculate-scores.ts                # local, ejecuta
//   npx tsx --env-file=.env.local scripts/recalculate-scores.ts --prod --dry   # prod, previsualiza
//   npx tsx --env-file=.env.local scripts/recalculate-scores.ts --prod         # prod (requiere PROD_DB_URL)
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaPlaceRepository } from '../src/infrastructure/db/PrismaPlaceRepository'
import { RecalculateScoresUseCase } from '../src/application/place/RecalculateScoresUseCase'
import { Score } from '../src/domain/place/Score'
import { revalidateRemote } from './revalidate-remote'

const DRY = process.argv.includes('--dry')
const PROD = process.argv.includes('--prod')

const connectionString = PROD ? process.env.PROD_DB_URL : process.env.DATABASE_URL
if (!connectionString) {
  console.error(`✗ Falta ${PROD ? 'PROD_DB_URL' : 'DATABASE_URL'} en .env.local`)
  process.exit(1)
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
const repo = new PrismaPlaceRepository(prisma)

async function main() {
  console.log(`\nRecálculo de scores (${PROD ? 'PROD' : 'local'}) ${DRY ? '— DRY-RUN, no escribe' : ''}\n`)

  const [stats, globalAverage, categories] = await Promise.all([
    repo.categoryRatingStats(),
    repo.globalAverageRating(),
    prisma.category.findMany({ select: { id: true, name: true } }),
  ])
  const nameOf = new Map(categories.map((c) => [c.id, c.name]))
  const statsBy = new Map(stats.map((s) => [s.categoryId, s]))

  console.log(`Prior global (fallback): ${globalAverage.toFixed(3)} · guard: ≥${Score.MIN_CATEGORY_SAMPLE} lugares con rating\n`)
  for (const s of [...stats].sort((a, b) => b.ratedCount - a.ratedCount)) {
    const prior = Score.prior(s, globalAverage)
    const fallback = s.ratedCount < Score.MIN_CATEGORY_SAMPLE
    console.log(
      `  ${nameOf.get(s.categoryId) ?? s.categoryId}: promedio ${s.average.toFixed(3)} (${s.ratedCount} con rating) → prior ${prior.toFixed(3)}${fallback ? ' (global, muestra chica)' : ''}`,
    )
  }

  // Preview: cuántos scores cambian y los que más se mueven.
  const rows = await prisma.place.findMany({
    select: { id: true, name: true, categoryId: true, googleRating: true, googleReviewCount: true, score: true },
  })
  const changes = rows
    .map((r) => {
      const prior = Score.prior(statsBy.get(r.categoryId), globalAverage)
      const next = Score.bayesian(r.googleRating, r.googleReviewCount, prior)
      return { name: r.name, categoryId: r.categoryId, score: r.score, next, delta: next - r.score }
    })
    .filter((c) => Math.abs(c.delta) > 1e-9)

  console.log(`\n${changes.length} de ${rows.length} lugares cambian de score. Los que más se mueven:`)
  for (const m of [...changes].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 10)) {
    console.log(
      `  ${m.name} (${nameOf.get(m.categoryId) ?? m.categoryId}): ${m.score.toFixed(4)} → ${m.next.toFixed(4)} (${m.delta > 0 ? '+' : ''}${m.delta.toFixed(4)})`,
    )
  }

  if (DRY) {
    console.log('\nDRY-RUN: no se escribió nada')
    await prisma.$disconnect()
    return
  }

  const { updated } = await new RecalculateScoresUseCase(repo).execute()
  console.log(`\n✓ ${updated} scores re-batidos`)
  await prisma.$disconnect()
  // Las lecturas públicas se cachean 1 h: invalidar para que el orden nuevo se vea al tiro.
  if (PROD) await revalidateRemote()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
