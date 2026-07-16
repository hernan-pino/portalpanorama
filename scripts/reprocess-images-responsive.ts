// Reprocesa las imágenes ya cargadas al formato responsive (3 anchos: 400/800/1600),
// para que el loader propio de next/image las sirva sin gastar transformaciones de
// Vercel. Convierte las URLs legacy (una sola imagen) en la convención `…-<ancho>.webp`.
//
//   npx tsx --env-file=.env.local scripts/reprocess-images-responsive.ts --dry-run
//   npx tsx --env-file=.env.local scripts/reprocess-images-responsive.ts --limit=3
//   npx tsx --env-file=.env.local scripts/reprocess-images-responsive.ts        (todas)
//
// Para PROD: correr con DATABASE_URL apuntando a la BD de prod (ver PLAN, gotcha
// del PROD_DB_URL temporal). El Blob store es el mismo, así que las variantes nuevas
// quedan disponibles para ambos entornos.
//
// IDEMPOTENTE: salta las URLs que ya siguen la convención responsive.
// NO borra los blobs viejos: el store es compartido con prod (prod aún los referencia
// hasta que también se reprocese). Quedan como huérfanos; limpieza opcional aparte.
import { prisma } from '../src/lib/db'
import { container } from '../src/lib/container'

const RESPONSIVE_RE = /-(?:400|800|1600)\.webp(?:\?|$)/
const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const limitArg = args.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity

const uploader = container.getUploadPlaceImageUseCase()

// Baja la imagen actual, la reprocesa a 3 anchos y devuelve la nueva URL canónica.
// null = ya era responsive o no se pudo bajar (se salta).
async function reprocess(url: string): Promise<string | null> {
  if (RESPONSIVE_RE.test(url)) return null
  const res = await fetch(url)
  if (!res.ok) {
    console.log(`  ⚠️ ${res.status} al bajar …${url.slice(-42)}`)
    return null
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  let filename = 'imagen'
  try {
    filename = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || 'imagen')
  } catch {
    /* fallback */
  }
  const { url: newUrl } = await uploader.execute({ buffer, filename })
  return newUrl
}

// Corre una pasada sobre una tabla: lee filas, reprocesa la url y actualiza.
async function pass<T extends { id: string; url: string | null }>(
  label: string,
  rows: T[],
  update: (id: string, url: string) => Promise<unknown>,
) {
  const pending = rows.filter((r) => r.url && !RESPONSIVE_RE.test(r.url))
  console.log(`\n${label}: ${rows.length} total · ${pending.length} por reprocesar${DRY ? ' (dry-run)' : ''}`)
  let done = 0
  for (const row of pending) {
    if (done >= LIMIT) {
      console.log(`  (límite ${LIMIT} alcanzado)`)
      break
    }
    if (DRY) {
      console.log(`  [dry] …${row.url!.slice(-50)}`)
      done++
      continue
    }
    const newUrl = await reprocess(row.url!)
    if (newUrl) {
      await update(row.id, newUrl)
      done++
      console.log(`  ✓ ${done} · …${newUrl.split('/').pop()!.slice(-46)}`)
    }
  }
  return done
}

async function main() {
  const placeImages = await prisma.placeImage.findMany({ select: { id: true, url: true }, orderBy: { id: 'asc' } })
  const brands = await prisma.brand.findMany({ where: { logoUrl: { not: null } }, select: { id: true, logoUrl: true } })
  const lists = await prisma.curatedList.findMany({ where: { coverImageUrl: { not: null } }, select: { id: true, coverImageUrl: true } })

  const n1 = await pass('PlaceImage', placeImages, (id, url) =>
    prisma.placeImage.update({ where: { id }, data: { url } }),
  )
  const n2 = await pass(
    'Brand.logoUrl',
    brands.map((b) => ({ id: b.id, url: b.logoUrl })),
    (id, url) => prisma.brand.update({ where: { id }, data: { logoUrl: url } }),
  )
  const n3 = await pass(
    'CuratedList.coverImageUrl',
    lists.map((l) => ({ id: l.id, url: l.coverImageUrl })),
    (id, url) => prisma.curatedList.update({ where: { id }, data: { coverImageUrl: url } }),
  )

  console.log(`\n${DRY ? 'Dry-run' : 'Reprocesadas'}: ${n1} fotos · ${n2} logos · ${n3} portadas.`)
}

main().finally(() => prisma.$disconnect())
