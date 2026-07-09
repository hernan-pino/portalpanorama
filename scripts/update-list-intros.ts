// One-off SEO (sesión 25): actualiza `intro` y `description` de las guías YA creadas
// para que la primera frase repita el título (el seed es first-write-wins y no las toca).
// Solo esos 2 campos — nunca pisa portada, pins ni nada editado en el admin.
//
//   npx tsx --env-file=.env.local scripts/update-list-intros.ts --dry          # local, previsualiza
//   npx tsx --env-file=.env.local scripts/update-list-intros.ts                # local, ejecuta
//   npx tsx --env-file=.env.local scripts/update-list-intros.ts --prod --dry   # prod, previsualiza
//   npx tsx --env-file=.env.local scripts/update-list-intros.ts --prod         # prod (requiere PROD_DB_URL)
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { CURATED_LISTS } from './curated-lists.data'

const DRY = process.argv.includes('--dry')
const PROD = process.argv.includes('--prod')

const connectionString = PROD ? process.env.PROD_DB_URL : process.env.DATABASE_URL
if (!connectionString) {
  console.error(`✗ Falta ${PROD ? 'PROD_DB_URL' : 'DATABASE_URL'} en .env.local`)
  process.exit(1)
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function main() {
  console.log(`\nActualización de intros (${PROD ? 'PROD' : 'local'}) ${DRY ? '— DRY-RUN, no escribe' : ''}\n`)
  for (const list of CURATED_LISTS) {
    const existing = await prisma.curatedList.findUnique({
      where: { slug: list.slug },
      select: { id: true, intro: true, description: true },
    })
    if (!existing) {
      console.log(`  • ${list.slug} → no existe en esta BD (se salta)`)
      continue
    }
    const introChanged = existing.intro !== (list.intro ?? null)
    const descChanged = existing.description !== (list.description ?? null)
    if (!introChanged && !descChanged) {
      console.log(`  • ${list.slug} → ya al día`)
      continue
    }
    if (!DRY) {
      await prisma.curatedList.update({
        where: { id: existing.id },
        data: { intro: list.intro ?? null, description: list.description ?? null },
      })
    }
    console.log(`  • ${list.slug} → actualizada (${[introChanged && 'intro', descChanged && 'description'].filter(Boolean).join(' + ')})`)
  }
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
