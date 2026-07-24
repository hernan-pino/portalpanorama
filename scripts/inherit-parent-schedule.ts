// Escribe un horario heredado del lugar contenedor a los hijos que NO tienen ninguno.
//
// Para qué: en un mall o patio gastronómico, Google publica el horario del recinto pero
// no el de cada puesto (en el MUT, 18 de 98 locales no tenían horario propio). Sin
// horario la ficha no se publica, y cargarlos a mano es inviable a escala. El horario
// del recinto ES la mejor verdad disponible para un local que está adentro: opera dentro
// de esa ventana. El texto va ETIQUETADO con su origen ("horario del MUT") para no
// hacerlo pasar por un dato verificado del puesto.
//
// NUNCA pisa un horario existente (curado o de Google): solo rellena los vacíos.
//
//   npx tsx --env-file=.env.local scripts/inherit-parent-schedule.ts \
//     --parent "Mercado Urbano" --schedule "Lu–Do 10:00–20:00 (horario del MUT)" [--dry]
//
//   --parent <id|nombre>   lugar contenedor cuyos hijos se rellenan
//   --schedule "<texto>"   el horario a escribir (incluye la etiqueta de origen)
//   --exclude "a,b"        nombres (o trozos) a saltar — p. ej. los que Google marca
//                          cerrados: esos no deben publicarse aunque tengan horario
//   --dry                  muestra qué escribiría, sin tocar la BD
import { prisma } from '../src/lib/db'

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const arg = (flag: string): string | null =>
  args.includes(flag) ? (args[args.indexOf(flag) + 1] ?? null) : null

const PARENT = arg('--parent')
const SCHEDULE = arg('--schedule')
const EXCLUDE = (arg('--exclude') ?? '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

async function main() {
  if (!PARENT || !SCHEDULE) {
    console.error('✗ faltan --parent y/o --schedule (ver el encabezado del script)')
    process.exit(1)
  }
  if (DRY) console.log('— MODO DRY: no escribe —')

  const parent = await prisma.place.findFirst({
    where: { OR: [{ id: PARENT }, { name: { contains: PARENT, mode: 'insensitive' } }] },
    select: { id: true, name: true, schedule: true },
  })
  if (!parent) {
    console.error(`✗ no encontré el lugar contenedor "${PARENT}"`)
    process.exit(1)
  }
  console.log(`Contenedor: ${parent.name}`)
  console.log(`Su horario:  ${parent.schedule ?? '(sin horario)'}`)
  console.log(`Se escribirá: ${SCHEDULE}\n`)

  const sinHorario = await prisma.place.findMany({
    where: { parentId: parent.id, schedule: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  let written = 0
  const skipped: string[] = []
  for (const p of sinHorario) {
    if (EXCLUDE.some((e) => p.name.toLowerCase().includes(e))) {
      skipped.push(p.name)
      continue
    }
    if (!DRY) await prisma.place.update({ where: { id: p.id }, data: { schedule: SCHEDULE } })
    console.log(`✓ ${p.name}`)
    written++
  }

  if (skipped.length) {
    console.log(`\nSaltados por --exclude (${skipped.length}):`)
    skipped.forEach((s) => console.log(`  · ${s}`))
  }
  console.log(`\nResumen: ${written} con horario heredado, ${skipped.length} saltado(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
