// Enriquece lugares con su reputación de Google (rating, nº de reseñas, place_id) +
// recalcula el score bayesiano, vía el adapter de Apify detrás del port
// PlaceRatingProvider. NO cambia el estado de la ficha ni publica: el control humano
// vive en el admin. Imprime el local que matcheó Google (nombre + dirección) y un
// flag ⚠️ cuando no se parece al buscado, para revisar a mano solo los dudosos.
//
//   npx tsx --env-file=.env.local scripts/enrich-ratings.ts [opciones] [placeId...]
//
//   (sin args)        enriquece TODOS los lugares no-archivados que aún no tienen rating
//   placeId...        enriquece solo esos ids (aunque ya tengan rating)
//   --dry             resuelve el match y el score pero NO escribe (previsualizar)
//   --force           re-consulta también los que ya tienen rating (refresca)
//   --with-photos     además rehospeda hasta 3 fotos de Google Maps en las fichas SIN
//                     imágenes (no pisa las curadas). Ignorado en --dry.
//
// Requiere APIFY_TOKEN en el entorno (.env.local). Costo: ~US$1,50/1.000 lugares;
// para tu volumen entra en el free de Apify.
import { prisma } from '../src/lib/db'
import { container } from '../src/lib/container'
import { PlaceStatus } from '../src/domain/place/PlaceStatus'

interface Target {
  id: string
  name: string
}

async function selectTargets(ids: string[], force: boolean): Promise<Target[]> {
  if (ids.length > 0) {
    return prisma.place.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
  }
  return prisma.place.findMany({
    where: {
      status: { not: PlaceStatus.ARCHIVED },
      ...(force ? {} : { googlePlaceId: null }),
    },
    select: { id: true, name: true },
    orderBy: { updatedAt: 'desc' },
  })
}

async function main() {
  const args = process.argv.slice(2)
  const dry = args.includes('--dry')
  const force = args.includes('--force')
  const withPhotos = args.includes('--with-photos') && !dry
  const ids = args.filter((a) => !a.startsWith('--'))

  if (dry) console.log('— MODO DRY: resuelve el match y el score, NO escribe —')
  if (withPhotos) console.log('— Fotos: rehospedo hasta 3 de Google Maps en las fichas sin imágenes —')
  const targets = await selectTargets(ids, force)
  console.log(`${targets.length} lugar(es) a enriquecer\n`)

  const uc = container.getEnrichPlaceRatingUseCase()
  const photosUc = withPhotos ? container.getAttachPlacePhotosUseCase() : null
  let updated = 0
  let skipped = 0
  let notFound = 0
  let needsCheck = 0

  for (const t of targets) {
    try {
      const res = await uc.execute({ placeId: t.id, force, dryRun: dry })
      if (res.status === 'skipped') {
        skipped++
        console.log(`· ${t.name} — ya tiene rating (usá --force para refrescar)`)
        continue
      }
      if (res.status === 'not-found') {
        notFound++
        console.log(`✗ ${t.name} — Google no devolvió ningún lugar`)
        continue
      }
      updated++
      const r = res.result
      const flag = res.nameMatch ? '✓' : '⚠️ REVISAR'
      console.log(
        `${flag} ${t.name} → ${r.matchedName ?? '(sin nombre)'}` +
          `${r.matchedAddress ? ` · ${r.matchedAddress}` : ''}`,
      )
      console.log(
        `    rating ${r.googleRating ?? '—'} (${r.googleReviewCount ?? 0} reseñas) · ` +
          `score ${res.score.toFixed(2)} · ${r.photoUrls.length} foto(s) encontradas`,
      )
      if (!res.nameMatch) needsCheck++

      if (photosUc && r.photoUrls.length > 0) {
        const ph = await photosUc.execute({ placeId: t.id, photoUrls: r.photoUrls, max: 3 })
        if (ph.status === 'attached') console.log(`    📷 ${ph.count} foto(s) rehospedadas a la ficha`)
        else if (ph.reason === 'has-images') console.log(`    📷 (ya tenía imágenes, no se tocó)`)
        else console.log(`    📷 no se pudo adjuntar (${ph.reason})`)
      }
    } catch (e) {
      skipped++
      console.log(`✗ ${t.name} — ERROR: ${(e as Error).message}`)
    }
  }

  console.log(
    `\nResumen: ${updated} enriquecido(s)` +
      `${dry ? ' (DRY, no se escribió)' : ''}, ${skipped} omitido(s), ${notFound} sin match.`,
  )
  if (needsCheck > 0) {
    console.log(`⚠️  ${needsCheck} con match dudoso (marcados REVISAR): confirmá a mano en /admin/lugares.`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error('FALLÓ:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
