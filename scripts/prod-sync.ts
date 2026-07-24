// SYNC de contenido local → prod. Copia catálogo + lugares nuevos + tags de cocina.
// Resuelve TODA FK contra prod por su clave natural (slug). Nunca toca usuarios.
// Nunca QUITA tags en prod (la fase 3 es aditiva). Idempotente: re-correrlo no duplica.
//
//   npx tsx --env-file=.env.local scripts/prod-sync.ts --dry   # previsualiza, no escribe
//   npx tsx --env-file=.env.local scripts/prod-sync.ts         # ejecuta
//
// Requiere PROD_DB_URL (string DIRECTA del branch prod de Neon) + DATABASE_URL en .env.local.
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { revalidateRemote } from './revalidate-remote'

const DRY = process.argv.includes('--dry')
const PROD_URL = process.env.PROD_DB_URL
const LOCAL_URL = process.env.DATABASE_URL
if (!PROD_URL) { console.error('✗ Falta PROD_DB_URL en .env.local'); process.exit(1) }
if (!LOCAL_URL) { console.error('✗ Falta DATABASE_URL en .env.local'); process.exit(1) }

const local = new PrismaClient({ adapter: new PrismaPg({ connectionString: LOCAL_URL }) })
const prod = new PrismaClient({ adapter: new PrismaPg({ connectionString: PROD_URL }) })

function log(...a: unknown[]) { console.log(...a) }
const tag = DRY ? '[dry]' : '[exec]'

async function main() {
  log(`\n========== SYNC local → prod ${DRY ? '(DRY-RUN, no escribe)' : '(EJECUTA)'} ==========\n`)

  // ─── FASE 1 — Catálogo (upsert por clave natural, idempotente) ───────────────
  log('── Fase 1: catálogo ──')

  // Categorías (slug único)
  const lCats = await local.category.findMany()
  for (const c of lCats) {
    if (!DRY) await prod.category.upsert({
      where: { slug: c.slug },
      create: { id: c.id, slug: c.slug, name: c.name, sortOrder: c.sortOrder, isActive: c.isActive, eventOnly: c.eventOnly },
      update: { name: c.name, sortOrder: c.sortOrder, isActive: c.isActive, eventOnly: c.eventOnly },
    })
  }
  const prodCatBySlug = new Map((await prod.category.findMany()).map((c) => [c.slug, c.id]))
  log(`  categorías: ${lCats.length}`)

  // Subcategorías (única por categoryId+slug) → resolver categoría prod por slug
  const lSubs = await local.subcategory.findMany({ include: { category: true } })
  let subCreated = 0
  for (const s of lSubs) {
    const prodCatId = prodCatBySlug.get(s.category.slug)
    if (!prodCatId) { log(`  ⚠️ subcat ${s.slug}: categoría ${s.category.slug} no está en prod`); continue }
    const existing = await prod.subcategory.findFirst({ where: { categoryId: prodCatId, slug: s.slug } })
    if (!existing) { subCreated++; if (!DRY) await prod.subcategory.create({ data: { id: s.id, slug: s.slug, name: s.name, categoryId: prodCatId } }) }
  }
  log(`  subcategorías: ${lSubs.length} (faltaban ${subCreated})`)

  // Comunas
  const lComm = await local.commune.findMany()
  for (const c of lComm) if (!DRY) await prod.commune.upsert({ where: { slug: c.slug }, create: { id: c.id, slug: c.slug, name: c.name }, update: { name: c.name } })
  log(`  comunas: ${lComm.length}`)

  // Barrios (+ link M2M a comunas por slug)
  const lNeigh = await local.neighborhood.findMany({ include: { communes: true } })
  for (const n of lNeigh) {
    if (DRY) continue
    const communeConnect = n.communes.map((c) => ({ slug: c.slug }))
    await prod.neighborhood.upsert({
      where: { slug: n.slug },
      create: { id: n.id, slug: n.slug, name: n.name, communes: { connect: communeConnect } },
      update: { name: n.name, communes: { connect: communeConnect } },
    })
  }
  log(`  barrios: ${lNeigh.length}`)

  // Estaciones de metro (slug único; las líneas ya están en prod por el seed)
  const lMetro = await local.metroStation.findMany()
  for (const m of lMetro) if (!DRY) await prod.metroStation.upsert({ where: { slug: m.slug }, create: { id: m.id, slug: m.slug, name: m.name, lat: m.lat, lng: m.lng }, update: { name: m.name } })
  log(`  metro: ${lMetro.length}`)

  // Tags (slug único; categoryId condicional → resolver por slug de categoría)
  const lTags = await local.tag.findMany({ include: { category: true } })
  for (const t of lTags) {
    const catId = t.category ? prodCatBySlug.get(t.category.slug) ?? null : null
    if (!DRY) await prod.tag.upsert({ where: { slug: t.slug }, create: { id: t.id, slug: t.slug, name: t.name, layer: t.layer, categoryId: catId }, update: { name: t.name, layer: t.layer, categoryId: catId } })
  }
  const cuisineCount = lTags.filter((t) => t.layer === 'CUISINE').length
  log(`  tags: ${lTags.length} (CUISINE: ${cuisineCount})`)

  // Marcas
  const lBrands = await local.brand.findMany()
  for (const b of lBrands) if (!DRY) await prod.brand.upsert({
    where: { slug: b.slug },
    create: { id: b.id, slug: b.slug, name: b.name, logoUrl: b.logoUrl, description: b.description, website: b.website, instagram: b.instagram, socialLinks: b.socialLinks ?? undefined },
    update: { name: b.name, logoUrl: b.logoUrl, description: b.description, website: b.website, instagram: b.instagram, socialLinks: b.socialLinks ?? undefined },
  })
  log(`  marcas: ${lBrands.length}`)

  // Mapas de resolución prod (releídos tras upsert). En --dry, Fase 1 no escribió,
  // así que se hace overlay del catálogo local (con su id) para previsualizar bien
  // Fases 2-3. En exec es no-op (prod ya tiene todo tras el upsert).
  const pCat = new Map((await prod.category.findMany()).map((c) => [c.slug, c.id]))
  for (const c of lCats) if (!pCat.has(c.slug)) pCat.set(c.slug, c.id)
  const pSubBy = new Map((await prod.subcategory.findMany({ include: { category: true } })).map((s) => [`${s.category.slug}|${s.slug}`, s.id]))
  for (const s of lSubs) { const k = `${s.category.slug}|${s.slug}`; if (!pSubBy.has(k)) pSubBy.set(k, s.id) }
  const pComm = new Map((await prod.commune.findMany()).map((c) => [c.slug, c.id]))
  for (const c of lComm) if (!pComm.has(c.slug)) pComm.set(c.slug, c.id)
  const pNeigh = new Map((await prod.neighborhood.findMany()).map((n) => [n.slug, n.id]))
  for (const n of lNeigh) if (!pNeigh.has(n.slug)) pNeigh.set(n.slug, n.id)
  const pMetro = new Map((await prod.metroStation.findMany()).map((m) => [m.slug, m.id]))
  for (const m of lMetro) if (!pMetro.has(m.slug)) pMetro.set(m.slug, m.id)
  const pTag = new Map((await prod.tag.findMany()).map((t) => [t.slug, t.id]))
  for (const t of lTags) if (!pTag.has(t.slug)) pTag.set(t.slug, t.id)
  const pBrand = new Map((await prod.brand.findMany()).map((b) => [b.slug, b.id]))
  for (const b of lBrands) if (!pBrand.has(b.slug)) pBrand.set(b.slug, b.id)

  // ─── FASE 2 — Lugares que faltan en prod (crear con relaciones) ──────────────
  log('\n── Fase 2: lugares nuevos ──')
  const prodSlugs = new Set((await prod.place.findMany({ select: { slug: true } })).map((p) => p.slug))

  const lPlaces = await local.place.findMany({
    include: {
      category: true, subcategory: { include: { category: true } },
      secondaryCategory: true, secondarySubcategory: { include: { category: true } },
      commune: true, neighborhood: true, metroStation: true, brand: true, parent: true,
      images: true, points: true, tags: { include: { tag: true } },
    },
  })
  const missing = lPlaces.filter((p) => !prodSlugs.has(p.slug))
  const toCreate = missing.filter((p) => p.status === 'PUBLISHED')
  const skipped = missing.filter((p) => p.status !== 'PUBLISHED')
  if (skipped.length) log(`  ⚠️ se saltan ${skipped.length} no-PUBLISHED: ${skipped.map((p) => `${p.name}(${p.status})`).join(', ')}`)

  // Padres primero (parentId)
  toCreate.sort((a, b) => (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0))

  function resolvePlace(p: typeof toCreate[number]) {
    const errs: string[] = []
    const categoryId = pCat.get(p.category.slug); if (!categoryId) errs.push(`cat ${p.category.slug}`)
    const subcategoryId = pSubBy.get(`${p.subcategory.category.slug}|${p.subcategory.slug}`); if (!subcategoryId) errs.push(`subcat ${p.subcategory.slug}`)
    const communeId = pComm.get(p.commune.slug); if (!communeId) errs.push(`comuna ${p.commune.slug}`)
    const secondaryCategoryId = p.secondaryCategory ? (pCat.get(p.secondaryCategory.slug) ?? null) : null
    const secondarySubcategoryId = p.secondarySubcategory ? (pSubBy.get(`${p.secondarySubcategory.category.slug}|${p.secondarySubcategory.slug}`) ?? null) : null
    const neighborhoodId = p.neighborhood ? (pNeigh.get(p.neighborhood.slug) ?? null) : null
    const metroStationId = p.metroStation ? (pMetro.get(p.metroStation.slug) ?? null) : null
    const brandId = p.brand ? (pBrand.get(p.brand.slug) ?? null) : null
    const tagIds = p.tags.map((pt) => ({ slug: pt.tag.slug, id: pTag.get(pt.tag.slug) }))
    const missingTags = tagIds.filter((t) => !t.id).map((t) => t.slug); if (missingTags.length) errs.push(`tags ${missingTags.join(',')}`)
    return { categoryId, subcategoryId, communeId, secondaryCategoryId, secondarySubcategoryId, neighborhoodId, metroStationId, brandId, tagIds, errs }
  }

  let created = 0
  for (const p of toCreate) {
    const r = resolvePlace(p)
    // parentId: el padre puede ser un place recién creado o ya existente en prod
    let parentId: string | null = null
    if (p.parent) {
      const pp = await prod.place.findUnique({ where: { slug: p.parent.slug }, select: { id: true } })
      parentId = pp?.id ?? null
      if (!parentId && !toCreate.find((x) => x.slug === p.parent!.slug)) r.errs.push(`parent ${p.parent.slug} no está en prod`)
    }
    if (r.errs.length) { log(`  ⚠️ SKIP ${p.name}: ${r.errs.join(' · ')}`); continue }
    log(`  ${tag} crear ${p.name} [${p.slug}]  (${p.images.length} img, ${p.tags.length} tags)`)
    if (DRY) { created++; continue }
    await prod.place.create({
      data: {
        id: p.id, slug: p.slug, name: p.name, description: p.description, menuUrl: p.menuUrl,
        categoryId: r.categoryId!, subcategoryId: r.subcategoryId!,
        secondaryCategoryId: r.secondaryCategoryId, secondarySubcategoryId: r.secondarySubcategoryId,
        address: p.address, communeId: r.communeId!, neighborhoodId: r.neighborhoodId, lat: p.lat, lng: p.lng,
        metroStationId: r.metroStationId, accessDetail: p.accessDetail, reference: p.reference, rainPolicy: p.rainPolicy,
        priceRange: p.priceRange, reservation: p.reservation, paymentMethods: p.paymentMethods, parkingOptions: p.parkingOptions, schedule: p.schedule,
        phone: p.phone, website: p.website, instagram: p.instagram, socialLinks: p.socialLinks ?? undefined,
        googlePlaceId: p.googlePlaceId, googleRating: p.googleRating, googleReviewCount: p.googleReviewCount, score: p.score,
        isPremium: p.isPremium, ownerId: null, status: p.status, parentId, brandId: r.brandId,
        createdAt: p.createdAt, updatedAt: p.updatedAt,
        images: { create: p.images.map((im) => ({ id: im.id, url: im.url, alt: im.alt, credit: im.credit, isPrimary: im.isPrimary, sortOrder: im.sortOrder })) },
        points: { create: p.points.map((pt) => ({ id: pt.id, name: pt.name, description: pt.description, kind: pt.kind, sortOrder: pt.sortOrder })) },
        tags: { create: r.tagIds.map((t) => ({ tagId: t.id! })) },
      },
    })
    created++
  }
  log(`  ${tag} lugares creados: ${created}/${toCreate.length}`)

  // ─── FASE 3 — Tags CUISINE aditivos a lugares que YA están en prod ───────────
  log('\n── Fase 3: tags CUISINE aditivos (lugares ya en prod) ──')
  const existing = lPlaces.filter((p) => prodSlugs.has(p.slug))
  let added = 0, touched = 0
  for (const p of existing) {
    const cuisineTags = p.tags.filter((pt) => pt.tag.layer === 'CUISINE')
    if (!cuisineTags.length) continue
    const prodPlace = await prod.place.findUnique({ where: { slug: p.slug }, select: { id: true, tags: { select: { tagId: true } } } })
    if (!prodPlace) continue
    const have = new Set(prodPlace.tags.map((t) => t.tagId))
    let placeTouched = false
    for (const ct of cuisineTags) {
      const tid = pTag.get(ct.tag.slug)
      if (!tid) { log(`  ⚠️ tag ${ct.tag.slug} no resolvió en prod`); continue }
      if (have.has(tid)) continue
      added++; placeTouched = true
      if (!DRY) await prod.placeTag.create({ data: { placeId: prodPlace.id, tagId: tid } })
    }
    if (placeTouched) { touched++; log(`  ${tag} +cuisine → ${p.name} (${cuisineTags.map((c) => c.tag.slug).join(',')})`) }
  }
  log(`  ${tag} PlaceTags CUISINE agregados: ${added} en ${touched} lugares`)

  log(`\n========== ${DRY ? 'DRY-RUN listo (no se escribió nada)' : 'SYNC COMPLETO'} ==========\n`)

  // El sitio cachea las lecturas públicas 1 h: tras escribir a la BD de prod
  // hay que invalidar el caché para que el contenido nuevo se vea al tiro.
  if (!DRY) await revalidateRemote()
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await local.$disconnect(); await prod.$disconnect() })
