// Publica las fichas que quedaron en PENDING_REVIEW y que YA cumplen el estándar de
// publicación (horario + al menos una imagen). Es el paso que falta cuando la carga se
// hace "Google primero": desde la s37 el investigador NO trae horario ni fotos (los trae
// `enrich-ratings` de Google, que es más confiable que las webs de los locales), así que
// toda ficha nace en PENDING_REVIEW y el enrich la completa DESPUÉS. `enrich-ratings` a
// propósito no cambia el estado, y `prod-sync` solo exporta PUBLISHED → sin este paso la
// tanda nunca llega a prod.
//
// NO relaja el estándar: aplica exactamente el mismo criterio que el ingestor
// (isPublishable en ingest-fichas.ts), solo que evaluado después del enriquecimiento.
// Lo que no cumple se queda donde está, con el motivo impreso.
//
//   npx tsx --env-file=.env.local scripts/publish-ready.ts [opciones]
//
//   (sin args)         evalúa TODAS las fichas en PENDING_REVIEW
//   --parent <id|nombre>  solo los hijos de ese lugar contenedor (ej. una tanda del MUT)
//   --dry              muestra qué publicaría, sin escribir
//   --min-rating <n>   además exige rating de Google ≥ n (no filtra a los que no tienen)
//
// Tras escribir contra la BD de prod invalida el caché (si no, los lugares no aparecen
// aunque estén en la BD).
import { prisma } from '../src/lib/db'
import { revalidateRemote } from './revalidate-remote'

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const parentArg = args[args.indexOf('--parent') + 1]
const PARENT = args.includes('--parent') ? parentArg : null
const MIN_RATING = args.includes('--min-rating')
  ? Number(args[args.indexOf('--min-rating') + 1])
  : null

async function main() {
  if (DRY) console.log('— MODO DRY: no escribe —')

  let parentId: string | undefined
  if (PARENT) {
    const p = await prisma.place.findFirst({
      where: { OR: [{ id: PARENT }, { name: { contains: PARENT, mode: 'insensitive' } }] },
      select: { id: true, name: true },
    })
    if (!p) {
      console.error(`✗ no encontré el lugar padre "${PARENT}"`)
      process.exit(1)
    }
    parentId = p.id
    console.log(`Filtrando por hijos de: ${p.name}`)
  }

  const candidatos = await prisma.place.findMany({
    where: { status: 'PENDING_REVIEW', ...(parentId ? { parentId } : {}) },
    select: {
      id: true, name: true, schedule: true, googleRating: true,
      _count: { select: { images: true } },
    },
    orderBy: { name: 'asc' },
  })

  if (!candidatos.length) {
    console.log('No hay fichas en PENDING_REVIEW que evaluar.')
    return
  }

  const listos: typeof candidatos = []
  const quedan: { name: string; motivo: string }[] = []

  for (const c of candidatos) {
    const faltas: string[] = []
    if (!c.schedule) faltas.push('sin horario')
    if (c._count.images === 0) faltas.push('sin foto')
    if (MIN_RATING !== null && c.googleRating !== null && c.googleRating < MIN_RATING) {
      faltas.push(`rating ${c.googleRating} < ${MIN_RATING}`)
    }
    if (faltas.length) quedan.push({ name: c.name, motivo: faltas.join(' + ') })
    else listos.push(c)
  }

  for (const c of listos) {
    if (!DRY) await prisma.place.update({ where: { id: c.id }, data: { status: 'PUBLISHED' } })
    console.log(`✓ ${c.name}${DRY ? ' — publicaría' : ' — PUBLICADO'}`)
  }

  if (quedan.length) {
    console.log(`\nSiguen en PENDING_REVIEW (${quedan.length}):`)
    for (const q of quedan) console.log(`  · ${q.name} — ${q.motivo}`)
  }

  console.log(`\nResumen: ${listos.length} publicada(s), ${quedan.length} en revisión.`)

  if (!DRY && listos.length) await revalidateRemote()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
