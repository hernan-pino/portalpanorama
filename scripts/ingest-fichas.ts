// Ingesta de fichas investigadas (salida JSON de la skill `ficha-lugar`) → crea
// Places y, por defecto, los PUBLICA. Resuelve nombres del catálogo → IDs, resuelve
// la marca (creándola si no existe), rehospeda imágenes con el pipeline de "Traer"
// (ImportImageFromUrlUseCase) y reporta lo que no calza.
//
//   npx tsx --env-file=.env.local scripts/ingest-fichas.ts [carpeta-o-archivo] [--review] [--dry]
//   (por defecto: tmp/fichas/*.json — cada .json es una ficha; o un array de fichas)
//
// Publicación: cada ficha se PUBLICA salvo que ella misma pida revisión
// (`_meta.requiere_revision: true`, p. ej. cerrado temporalmente / dato dudoso), que
// quedan en PENDING_REVIEW para mirarlas a mano. `--review` fuerza TODO a PENDING_REVIEW.
//
// Flujo completo: [agente investigador] escribe los JSON → este script los ingesta y
// publica (las dudosas quedan en revisión) → revisás esas pocas en /admin/lugares.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { prisma } from '../src/lib/db'
import { container } from '../src/lib/container'
import type { PlaceFormOptions } from '../src/application/place/GetPlaceFormOptionsUseCase'
import type { PlaceWriteInput, PlaceImageInput } from '../src/application/place/PlaceWriteInput'
import type { BrandWriteInput } from '../src/application/brand/BrandWriteInput'
import { PriceRange } from '../src/domain/place/PriceRange'
import { ReservationPolicy } from '../src/domain/place/ReservationPolicy'
import { RainPolicy } from '../src/domain/place/RainPolicy'

// ── Contrato de entrada (salida de la skill ficha-lugar). Todo opcional salvo lo
//    mínimo para crear: nombre + categoría + subcategoría + comuna. ──
// Datos de la marca cuando la ficha trae el objeto (no solo el nombre).
interface MarcaInput {
  nombre: string
  descripcion?: string | null
  logo_url?: string | null
  sitio_web?: string | null
  instagram?: string | null
  redes_extra?: { red: string; url: string }[] | null
}

interface FichaJSON {
  basicos?: { nombre?: string; descripcion?: string; url_menu?: string | null }
  // Marca/Negocio: solo si el lugar es sucursal de una marca con varios locales
  // (Emporio La Rosa, Starbucks…). El ingestor la resuelve → brandId (la crea si no
  // existe). NO usar para locales independientes de una sola sede.
  //
  // Acepta dos formas:
  //   - string  → solo el nombre (compat): la marca se crea vacía si no existe.
  //   - objeto  → nombre + datos de la marca (descripción/logo/redes). Si la marca
  //     todavía no existe, se crea ya enriquecida (logo rehospedado); si ya existe,
  //     NO se pisa (los datos cargados a mano ganan).
  marca?: string | MarcaInput | null
  categorizacion?: {
    categoria?: string; subcategoria?: string
    categoria_secundaria?: string | null; subcategoria_secundaria?: string | null
  }
  ubicacion?: {
    direccion?: string | null; comuna?: string; barrio?: string | null
    estacion_metro?: string | null; si_llueve?: string | null
    latitud?: number | null; longitud?: number | null
    detalle_acceso?: string | null; referencia?: string | null; parte_de?: string | null
  }
  presupuesto_operacion?: {
    rango_precio?: string | null; reserva?: string | null
    metodos_pago?: string[] | null; horario?: string | null
  }
  contacto_redes?: {
    telefono?: string | null; sitio_web?: string | null; instagram?: string | null
    redes_extra?: { red: string; url: string }[] | null
  }
  reputacion_google?: { estrellas?: number | null; n_resenas?: number | null; place_id?: string | null }
  tags?: Partial<Record<'audience' | 'occasion' | 'vibe' | 'experience' | 'service' | 'specific', string[]>>
  spots?: { nombre: string; descripcion?: string | null }[]
  imagenes?: { url: string; alt?: string | null; credito?: string | null; portada?: boolean }[]
  // Señal de la skill para no publicar automáticamente (cerrado temporal/permanente,
  // datos en conflicto, confianza baja). Si va true → queda PENDING_REVIEW con el motivo.
  _meta?: { requiere_revision?: boolean; motivo_revision?: string | null }
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// Mapas label→enum tolerantes (acepta el label del form, variantes y el valor del enum).
function toPrice(v?: string | null): PriceRange | undefined {
  if (!v) return undefined
  const n = norm(v)
  if (n.includes('gratis') || n === 'free') return PriceRange.FREE
  if (n.includes('menos') || n.includes('under') || n === 'under 5000') return PriceRange.UNDER_5000
  if (n.includes('30 000') && (n.includes('mas') || n.includes('over'))) return PriceRange.OVER_30000
  if (n.includes('15 000') && n.includes('30 000')) return PriceRange.FROM_15000_TO_30000
  if (n.includes('5 000') && n.includes('15 000')) return PriceRange.FROM_5000_TO_15000
  if (Object.values(PriceRange).includes(v as PriceRange)) return v as PriceRange
  return undefined
}
function toReservation(v?: string | null): ReservationPolicy | undefined {
  if (!v) return undefined
  const n = norm(v)
  if (n.includes('requiere')) return ReservationPolicy.REQUIRED
  if (n.includes('recomend')) return ReservationPolicy.RECOMMENDED
  if (n.includes('sin reserva') || n.includes('walk')) return ReservationPolicy.WALK_IN
  if (Object.values(ReservationPolicy).includes(v as ReservationPolicy)) return v as ReservationPolicy
  return undefined
}
function toRain(v?: string | null): RainPolicy | undefined {
  if (!v) return undefined
  const n = norm(v)
  if (n.includes('suspend')) return RainPolicy.SUSPENDED
  if (n.includes('traslad') || n.includes('techad') || n.includes('reloc')) return RainPolicy.RELOCATED
  if (n.includes('funciona igual') || n.includes('continu')) return RainPolicy.CONTINUES
  if (Object.values(RainPolicy).includes(v as RainPolicy)) return v as RainPolicy
  return undefined
}

type Warn = string[]

// Normaliza el campo `marca` (string suelto o objeto) a una forma común, o null si
// no viene / viene vacío.
function normalizeMarca(raw: FichaJSON['marca']): MarcaInput | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    const nombre = raw.trim()
    return nombre ? { nombre } : null
  }
  const nombre = raw.nombre?.trim()
  return nombre ? { ...raw, nombre } : null
}

// Arma el BrandWriteInput para crear una marca nueva a partir de los datos de la ficha.
// Rehospeda el logo (si vino una URL) con el mismo pipeline de "Traer" que las fotos,
// para que `next/image` pueda renderizarlo (host permitido).
async function buildBrandWriteInput(marca: MarcaInput, warn: Warn): Promise<BrandWriteInput> {
  let logoUrl: string | undefined
  if (marca.logo_url?.trim()) {
    try {
      const { url } = await container.getImportImageFromUrlUseCase().execute({ url: marca.logo_url.trim() })
      logoUrl = url
    } catch (e) {
      warn.push(`logo de marca omitido (no se pudo traer): ${marca.logo_url} — ${(e as Error).message}`)
    }
  }
  const socialLinks = (marca.redes_extra ?? [])
    .filter((r) => r?.red?.trim() && r?.url?.trim())
    .map((r) => ({ network: r.red.trim(), url: r.url.trim() }))
  return {
    name: marca.nombre,
    logoUrl,
    description: marca.descripcion?.trim() || undefined,
    website: marca.sitio_web?.trim() || undefined,
    instagram: marca.instagram?.trim() || undefined,
    socialLinks,
  }
}

// Resuelve una ficha contra el catálogo. Devuelve el input listo o null si falta
// algo obligatorio; acumula advertencias de lo que se omitió.
async function resolveFicha(
  f: FichaJSON,
  opts: PlaceFormOptions,
  parentNameToId: Map<string, string>,
  warn: Warn,
  dry: boolean,
): Promise<PlaceWriteInput | null> {
  const name = f.basicos?.nombre?.trim()
  if (!name || name.length < 2) {
    warn.push('sin nombre válido → omitida')
    return null
  }

  // Categoría + subcategoría (obligatorias)
  const cat = opts.categories.find((c) => norm(c.name) === norm(f.categorizacion?.categoria ?? ''))
  if (!cat) {
    warn.push(`categoría no encontrada: "${f.categorizacion?.categoria ?? ''}"`)
    return null
  }
  const sub = cat.subcategories.find((s) => norm(s.name) === norm(f.categorizacion?.subcategoria ?? ''))
  if (!sub) {
    warn.push(`subcategoría no encontrada en ${cat.name}: "${f.categorizacion?.subcategoria ?? ''}"`)
    return null
  }

  // Categoría secundaria (par opcional)
  let secCatId: string | undefined
  let secSubId: string | undefined
  if (f.categorizacion?.categoria_secundaria) {
    const sc = opts.categories.find((c) => norm(c.name) === norm(f.categorizacion!.categoria_secundaria!))
    const ss = sc?.subcategories.find((s) => norm(s.name) === norm(f.categorizacion?.subcategoria_secundaria ?? ''))
    if (sc && ss) {
      secCatId = sc.id
      secSubId = ss.id
    } else {
      warn.push('categoría secundaria no resuelta (se omite el par)')
    }
  }

  // Comuna (obligatoria)
  const commune = opts.communes.find((c) => norm(c.name) === norm(f.ubicacion?.comuna ?? ''))
  if (!commune) {
    warn.push(`comuna no encontrada: "${f.ubicacion?.comuna ?? ''}"`)
    return null
  }

  // Barrio + metro (opcionales)
  let neighborhoodId: string | undefined
  if (f.ubicacion?.barrio) {
    // Tolerante al prefijo "Barrio " (catálogo "Barrio Lastarria" ↔ ficha "Lastarria").
    const stripBarrio = (s: string) => norm(s).replace(/^barrio /, '')
    const target = stripBarrio(f.ubicacion.barrio)
    const nb = opts.neighborhoods.find((n) => stripBarrio(n.name) === target)
    if (nb && nb.communeIds.includes(commune.id)) neighborhoodId = nb.id
    else warn.push(`barrio omitido (no encontrado o no pertenece a ${commune.name}): "${f.ubicacion.barrio}"`)
  }
  let metroStationId: string | undefined
  if (f.ubicacion?.estacion_metro) {
    const st = opts.metroStations.find((m) => norm(m.name) === norm(f.ubicacion!.estacion_metro!))
    if (st) metroStationId = st.id
    else warn.push(`estación de metro omitida (no encontrada): "${f.ubicacion.estacion_metro}"`)
  }

  // Tags (todas las capas a un solo array de ids; los topes los valida el dominio)
  const tagIds: string[] = []
  const tagBuckets = f.tags ?? {}
  for (const list of Object.values(tagBuckets)) {
    for (const tagName of list ?? []) {
      const t = opts.tags.find((x) => norm(x.name) === norm(tagName))
      if (t) tagIds.push(t.id)
      else warn.push(`tag omitido (no en catálogo): "${tagName}"`)
    }
  }

  // Padre (contenedor) — del mapa de existentes + creados en esta corrida
  let parentId: string | undefined
  if (f.ubicacion?.parte_de) {
    const pid = parentNameToId.get(norm(f.ubicacion.parte_de))
    if (pid) parentId = pid
    else warn.push(`padre no encontrado aún: "${f.ubicacion.parte_de}" (cárgalo primero y reasigná)`)
  }

  // Lluvia: solo si alguna categoría es Naturaleza
  const isNature = norm(cat.name).includes('naturaleza') || (secCatId && opts.categories.find((c) => c.id === secCatId && norm(c.name).includes('naturaleza')))
  const rainPolicy = isNature ? toRain(f.ubicacion?.si_llueve) : undefined

  // Imágenes: rehospedar cada URL con el pipeline de "Traer"
  const images: PlaceImageInput[] = []
  const rawImgs = f.imagenes ?? []
  for (let i = 0; i < rawImgs.length; i++) {
    const img = rawImgs[i]
    if (!img?.url) continue
    if (dry) {
      // En seco no rehospedamos (evita subir blobs huérfanos); solo dejamos constancia.
      images.push({ url: img.url, alt: img.alt ?? undefined, credit: img.credito ?? undefined,
        isPrimary: Boolean(img.portada), sortOrder: images.length })
      continue
    }
    try {
      const { url } = await container.getImportImageFromUrlUseCase().execute({ url: img.url })
      images.push({
        url,
        alt: img.alt ?? undefined,
        credit: img.credito ?? undefined,
        isPrimary: Boolean(img.portada),
        sortOrder: images.length,
      })
    } catch (e) {
      warn.push(`imagen omitida (no se pudo traer): ${img.url} — ${(e as Error).message}`)
    }
  }
  // Garantiza exactamente una portada si hay imágenes
  if (images.length > 0 && !images.some((im) => im.isPrimary)) images[0].isPrimary = true

  const normalizeUrl = (u?: string | null) =>
    u ? (u.startsWith('http') ? u : `https://${u}`) : undefined

  return {
    name,
    description: f.basicos?.descripcion?.trim() || undefined,
    menuUrl: normalizeUrl(f.basicos?.url_menu),
    categoryId: cat.id,
    subcategoryId: sub.id,
    secondaryCategoryId: secCatId,
    secondarySubcategoryId: secSubId,
    address: f.ubicacion?.direccion ?? undefined,
    communeId: commune.id,
    neighborhoodId,
    lat: f.ubicacion?.latitud ?? undefined,
    lng: f.ubicacion?.longitud ?? undefined,
    metroStationId,
    accessDetail: f.ubicacion?.detalle_acceso ?? undefined,
    reference: f.ubicacion?.referencia ?? undefined,
    rainPolicy,
    priceRange: toPrice(f.presupuesto_operacion?.rango_precio),
    reservation: toReservation(f.presupuesto_operacion?.reserva),
    paymentMethods: (f.presupuesto_operacion?.metodos_pago ?? []).map((s) => s.trim()).filter(Boolean),
    schedule: f.presupuesto_operacion?.horario ?? undefined,
    phone: f.contacto_redes?.telefono ?? undefined,
    website: normalizeUrl(f.contacto_redes?.sitio_web),
    instagram: f.contacto_redes?.instagram ?? undefined,
    socialLinks: (f.contacto_redes?.redes_extra ?? [])
      .filter((r) => r.red && r.url)
      .map((r) => ({ network: r.red, url: normalizeUrl(r.url)! })),
    googlePlaceId: f.reputacion_google?.place_id ?? undefined,
    googleRating: f.reputacion_google?.estrellas ?? undefined,
    googleReviewCount: f.reputacion_google?.n_resenas ?? undefined,
    parentId,
    tagIds,
    images,
    points: (f.spots ?? []).map((sp, i) => ({
      name: sp.nombre,
      description: sp.descripcion ?? undefined,
      sortOrder: i,
    })),
  }
}

function loadFichas(target: string): FichaJSON[] {
  const out: FichaJSON[] = []
  const readOne = (file: string) => {
    const parsed = JSON.parse(readFileSync(file, 'utf-8'))
    if (Array.isArray(parsed)) out.push(...parsed)
    else out.push(parsed)
  }
  const st = statSync(target)
  if (st.isDirectory()) {
    for (const f of readdirSync(target).filter((f) => f.endsWith('.json'))) readOne(join(target, f))
  } else {
    readOne(target)
  }
  return out
}

async function main() {
  const args = process.argv.slice(2)
  const dry = args.includes('--dry')
  const forceReview = args.includes('--review')
  const target = args.find((a) => !a.startsWith('--')) ?? 'tmp/fichas'
  if (dry) console.log('— MODO DRY: resuelve y valida, NO crea ni rehospeda —')
  if (forceReview) console.log('— MODO REVIEW: todo queda PENDING_REVIEW (no publica) —')
  console.log(`Leyendo fichas de: ${target}`)
  const fichas = loadFichas(target)
  console.log(`  ${fichas.length} ficha(s) encontradas\n`)

  const opts = await container.getGetPlaceFormOptionsUseCase().execute()
  const nameToId = new Map<string, string>()
  for (const p of opts.parents) nameToId.set(norm(p.name), p.id)
  // Marcas existentes (nombre→id); se crean al vuelo si una ficha trae una nueva.
  const brandNameToId = new Map<string, string>()
  for (const b of opts.brands) brandNameToId.set(norm(b.name), b.id)

  // Procesa "padres" primero (los que son referidos por otra ficha como parte_de),
  // así un contenedor cargado en la misma corrida queda disponible para sus hijos.
  const referidos = new Set(fichas.map((f) => norm(f.ubicacion?.parte_de ?? '')).filter(Boolean))
  const ordered = [...fichas].sort((a, b) => {
    const aIsParent = referidos.has(norm(a.basicos?.nombre ?? '')) ? -1 : 0
    const bIsParent = referidos.has(norm(b.basicos?.nombre ?? '')) ? -1 : 0
    return aIsParent - bIsParent
  })

  let created = 0
  let skipped = 0
  for (const f of ordered) {
    const warn: Warn = []
    const label = f.basicos?.nombre ?? '(sin nombre)'
    try {
      const input = await resolveFicha(f, opts, nameToId, warn, dry)
      if (!input) {
        skipped++
        console.log(`✗ ${label} — OMITIDA`)
        warn.forEach((w) => console.log(`    · ${w}`))
        continue
      }

      // Marca/Negocio: resuelve nombre→brandId (la crea si no existe, ya enriquecida
      // con los datos que trae la ficha; si ya existía, no se pisa).
      const marca = normalizeMarca(f.marca)
      if (marca) {
        const key = norm(marca.nombre)
        let brandId = brandNameToId.get(key)
        if (!brandId) {
          if (dry) {
            warn.push(`marca nueva (se crearía): "${marca.nombre}"${marca.descripcion ? ' (con descripción)' : ''}`)
          } else {
            const write = await buildBrandWriteInput(marca, warn)
            const res = await container.getCreateBrandUseCase().execute(write)
            brandId = res.brandId
            brandNameToId.set(key, brandId)
            warn.push(
              write.description
                ? `marca creada: "${marca.nombre}" (con descripción${write.logoUrl ? ' + logo' : ''})`
                : `marca creada: "${marca.nombre}" — sin descripción, complétala en /admin/marcas`,
            )
          }
        } else {
          brandNameToId.set(key, brandId)
        }
        if (brandId) input.brandId = brandId
      }

      // Revisión: la ficha la pide (cerrado/dudoso) o se forzó con --review.
      const review = forceReview || f._meta?.requiere_revision === true
      const motivo = f._meta?.motivo_revision?.trim()

      if (dry) {
        nameToId.set(norm(input.name), 'dry') // así un hijo del mismo lote resuelve a su padre
        created++
        const destino = review ? 'PENDING_REVIEW' : 'PUBLICADO'
        console.log(`✓ ${label} — OK (resolvería → ${destino}; ${input.tagIds.length} tags, ${input.images.length} imgs)`)
      } else {
        const { placeId } = await container.getCreatePlaceUseCase().execute(input)
        nameToId.set(norm(input.name), placeId) // disponible como padre para los siguientes
        created++
        if (review) {
          console.log(`✓ ${label} — creado PENDING_REVIEW${motivo ? ` (${motivo})` : ''} (${placeId})`)
        } else {
          await container.getPublishPlaceUseCase().execute(placeId)
          console.log(`✓ ${label} — PUBLICADO (${placeId})`)
        }
      }
      if (warn.length) {
        console.log('    a verificar:')
        warn.forEach((w) => console.log(`    · ${w}`))
      }
    } catch (e) {
      skipped++
      console.log(`✗ ${label} — ERROR: ${(e as Error).message}`)
      warn.forEach((w) => console.log(`    · ${w}`))
    }
  }

  console.log(`\nResumen: ${created} creado(s), ${skipped} omitida(s).`)
  console.log('Las publicadas ya están en el sitio. Revisa las que quedaron en PENDING_REVIEW en /admin/lugares.')
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
