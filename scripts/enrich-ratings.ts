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
//   --no-coords       apunta solo a los lugares no-archivados SIN lat/lng (backfill de
//                     coordenadas); implica --force. Las coords curadas nunca se pisan.
//   --with-photos     además rehospeda hasta 2 fotos de Google Maps en las fichas SIN
//                     imágenes (no pisa las curadas). Ignorado en --dry.
//                     ⚠️ Cada foto cuesta 3 operaciones del cupo de Vercel Blob (una por
//                     variante responsive: 400/800/1600 px) y el plan gratis son 2.000 al
//                     mes. A 2 fotos rinde ~166 lugares/mes; a 3 rendía ~111. Por eso 2.
//   --with-schedule   además escribe el horario que publica Google en las fichas SIN
//                     horario (no pisa los curados: llevan matices que Google no da).
//                     Avisa ⛔ si Google marca el local cerrado (temporal o permanente).
//
// Requiere APIFY_TOKEN en el entorno (.env.local). Costo: ~US$1,50/1.000 lugares;
// para tu volumen entra en el free de Apify.
import { prisma } from '../src/lib/db'
import { container } from '../src/lib/container'
import { PlaceStatus } from '../src/domain/place/PlaceStatus'
import { parkingLabel } from '../src/components/place/parkingLabels'

interface Target {
  id: string
  name: string
}

async function selectTargets(ids: string[], force: boolean, noCoords: boolean): Promise<Target[]> {
  if (ids.length > 0) {
    return prisma.place.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
  }
  if (noCoords) {
    // Backfill de coordenadas: solo los no-archivados que aún no tienen lat/lng. El
    // use case re-consulta (force) pero nunca pisa coords curadas.
    return prisma.place.findMany({
      where: { status: { not: PlaceStatus.ARCHIVED }, lat: null },
      select: { id: true, name: true },
      orderBy: { updatedAt: 'desc' },
    })
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
  const noCoords = args.includes('--no-coords')
  const force = args.includes('--force') || noCoords
  const withPhotos = args.includes('--with-photos') && !dry
  const withSchedule = args.includes('--with-schedule')
  const ids = args.filter((a) => !a.startsWith('--'))

  if (dry) console.log('— MODO DRY: resuelve el match y el score, NO escribe —')
  if (noCoords) console.log('— Backfill de coordenadas: solo lugares no-archivados sin lat/lng —')
  if (withPhotos) console.log('— Fotos: rehospedo hasta 3 de Google Maps en las fichas sin imágenes —')
  if (withSchedule) console.log('— Horario: escribo el de Google en las fichas que no tienen uno —')
  const targets = await selectTargets(ids, force, noCoords)
  console.log(`${targets.length} lugar(es) a enriquecer\n`)

  const uc = container.getEnrichPlaceRatingUseCase()
  const photosUc = withPhotos ? container.getAttachPlacePhotosUseCase() : null
  let updated = 0
  let skipped = 0
  let notFound = 0
  let needsCheck = 0
  let coordsSet = 0
  let scheduleSet = 0
  let parkingSet = 0
  const closed: string[] = []
  const suspect: string[] = []

  for (const t of targets) {
    try {
      const res = await uc.execute({ placeId: t.id, force, dryRun: dry, withSchedule })
      if (res.status === 'skipped') {
        skipped++
        console.log(`· ${t.name} — ya tiene rating (usa --force para refrescar)`)
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
          `score ${res.score.toFixed(2)} · ${r.photoUrls.length} foto(s) encontradas` +
          `${res.coordsSet ? ` · 📍 coords ${r.latitude!.toFixed(5)}, ${r.longitude!.toFixed(5)}` : ''}`,
      )
      if (res.coordsSet) coordsSet++
      if (!res.nameMatch) needsCheck++
      if (res.scheduleSet) {
        scheduleSet++
        console.log(`    🕒 horario: ${res.scheduleSet}`)
      }
      if (res.parkingSet) {
        parkingSet++
        console.log(`    🅿️  estacionamiento: ${res.parkingSet.map(parkingLabel).join(' · ')}`)
      }
      if (res.scheduleSuspect) {
        const days = res.scheduleSuspect.map((d) => `${d.day} ${d.hours}`).join(' · ')
        if (res.scheduleSet) {
          // Se escribió el resto de la semana; solo se descartó el/los día(s) malo(s).
          console.log(`    🕒⚠️  día(s) descartado(s) por tramo absurdo (el resto sí se escribió): ${days}`)
        } else {
          // No quedó ningún día creíble: la ficha se queda sin horario para un humano.
          suspect.push(t.name)
          console.log(`    🕒⚠️  horario NO escrito, Google trae un tramo absurdo: ${days}`)
        }
      }
      // Google sabe si el local dejó de operar. Es el dato que la investigación web
      // no puede confirmar y el motivo de varias fichas trabadas en revisión.
      if (res.result.permanentlyClosed || res.result.temporarilyClosed) {
        const kind = res.result.permanentlyClosed ? 'CERRADO PERMANENTEMENTE' : 'cerrado temporalmente'
        closed.push(`${t.name} (${kind})`)
        console.log(`    ⛔ Google lo marca ${kind} — NO publicar`)
      }

      if (photosUc && r.photoUrls.length > 0) {
        const ph = await photosUc.execute({ placeId: t.id, photoUrls: r.photoUrls, max: 2 })
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
      `${dry ? ' (DRY, no se escribió)' : ''}, ${skipped} omitido(s), ${notFound} sin match` +
      `, 📍 ${coordsSet} con coords nuevas` +
      `${withSchedule ? `, 🕒 ${scheduleSet} con horario nuevo` : ''}` +
      `, 🅿️ ${parkingSet} con estacionamiento nuevo.`,
  )
  if (needsCheck > 0) {
    console.log(`⚠️  ${needsCheck} con match dudoso (marcados REVISAR): confírmalos a mano en /admin/lugares.`)
  }
  if (closed.length > 0) {
    console.log(`\n⛔ ${closed.length} que Google marca cerrado(s) — NO publicar:`)
    closed.forEach((c) => console.log(`   · ${c}`))
  }
  if (suspect.length > 0) {
    console.log(`\n🕒⚠️  ${suspect.length} sin horario escrito (dato malo de Google) — cárgalo a mano:`)
    suspect.forEach((s) => console.log(`   · ${s}`))
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
