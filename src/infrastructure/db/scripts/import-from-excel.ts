import { loadEnvFile } from 'node:process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createId } from '@paralleldrive/cuid2'
import * as XLSX from 'xlsx'
import { put } from '@vercel/blob'

try { loadEnvFile('.env.local') } catch { }

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// ── Categorías ──────────────────────────────────────────────────────────────

const KEYWORD_TO_CATEGORY: Record<string, { slug: string; name: string }> = {
  'bares':                   { slug: 'bares',           name: 'Bares' },
  'rooftop bars':            { slug: 'bares',           name: 'Bares' },
  'cervecerias artesanales': { slug: 'bares',           name: 'Bares' },
  'restaurantes':            { slug: 'restaurantes',    name: 'Restaurantes' },
  'cafeterias':              { slug: 'cafes',           name: 'Cafés y Heladerías' },
  'heladerias':              { slug: 'cafes',           name: 'Cafés y Heladerías' },
  'discotecas':              { slug: 'vida-nocturna',   name: 'Vida Nocturna' },
  'karaokes':                { slug: 'vida-nocturna',   name: 'Vida Nocturna' },
  'musica':                  { slug: 'vida-nocturna',   name: 'Vida Nocturna' },
  'museos':                  { slug: 'cultura',         name: 'Cultura' },
  'teatros':                 { slug: 'cultura',         name: 'Cultura' },
  'galerias':                { slug: 'cultura',         name: 'Cultura' },
  'cines':                   { slug: 'cultura',         name: 'Cultura' },
  'centros culturales':      { slug: 'cultura',         name: 'Cultura' },
  'bibliotecas':             { slug: 'cultura',         name: 'Cultura' },
  'parques':                 { slug: 'outdoor',         name: 'Aire Libre' },
  'senderos':                { slug: 'outdoor',         name: 'Aire Libre' },
  'miradores':               { slug: 'outdoor',         name: 'Aire Libre' },
  'jardines botanicos':      { slug: 'outdoor',         name: 'Aire Libre' },
  'zoologicos':              { slug: 'outdoor',         name: 'Aire Libre' },
  'escape rooms':            { slug: 'entretenimiento', name: 'Entretenimiento' },
  'bowling':                 { slug: 'entretenimiento', name: 'Entretenimiento' },
  'karting':                 { slug: 'entretenimiento', name: 'Entretenimiento' },
  'paintball':               { slug: 'entretenimiento', name: 'Entretenimiento' },
  'ferias artesanales':      { slug: 'entretenimiento', name: 'Entretenimiento' },
  'clases de cocina':        { slug: 'entretenimiento', name: 'Entretenimiento' },
  'talleres':                { slug: 'entretenimiento', name: 'Entretenimiento' },
  'gimnasios':               { slug: 'deportes',        name: 'Deporte' },
  'centros deportivos':      { slug: 'deportes',        name: 'Deporte' },
  'dojos':                   { slug: 'deportes',        name: 'Deporte' },
  'deportes':                { slug: 'deportes',        name: 'Deporte' },
  'piscinas publicas':       { slug: 'deportes',        name: 'Deporte' },
}

// ── Mapeo de comunas a neighborhood válido ───────────────────────────────────
// Los barrios válidos del dominio están en Neighborhoods.ts.
// Comunas que no tienen barrio equivalente → 'Santiago Centro'

const COMMUNE_TO_NEIGHBORHOOD: Record<string, string> = {
  'Santiago':          'Santiago Centro',
  'Providencia':       'Providencia',
  'Ñuñoa':            'Ñuñoa',
  'Las Condes':        'Las Condes',
  'Vitacura':          'Vitacura',
  'La Reina':          'La Reina',
  'Macul':             'Macul',
  'San Miguel':        'San Miguel',
  'Recoleta':          'Recoleta',
  'Independencia':     'Independencia',
  'Estación Central':  'Estación Central',
  'Maipú':             'Maipú',
  'Lo Barnechea':      'Lo Barnechea',
}

function communeToNeighborhood(commune: string): string {
  return COMMUNE_TO_NEIGHBORHOOD[commune] ?? 'Santiago Centro'
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function buildUniqueSlug(name: string, commune: string): Promise<string> {
  const base = normalizeSlug(`${name} ${commune}`)
  let candidate = base
  let attempt = 0
  while (await prisma.listing.findUnique({ where: { slug: candidate } })) {
    attempt++
    candidate = `${base}-${attempt}`
  }
  return candidate
}

function mapPriceRange(precio: unknown): number | null {
  const map: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }
  const v = String(precio ?? '').trim()
  return map[v] ?? null
}

function parseBusinessHours(periodos: unknown): object | null {
  if (!periodos) return null
  try { return JSON.parse(String(periodos)) } catch { return null }
}

async function uploadPhotoToBlob(
  googleUrl: string,
  slug: string,
  index: number,
): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return googleUrl
  try {
    const res = await fetch(googleUrl, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const { url } = await put(`listings/${slug}/photo-${index}.jpg`, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
    })
    return url
  } catch {
    return null
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const inputFile = process.argv[2]
  if (!inputFile) {
    console.error('Usage: npx tsx src/infrastructure/db/scripts/import-from-excel.ts <file.xlsx>')
    process.exit(1)
  }

  const resolvedPath = path.resolve(inputFile)
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`)
    process.exit(1)
  }

  // Read rows from xlsx
  const wb = XLSX.readFile(resolvedPath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
  console.log(`Loaded ${rows.length} rows from ${path.basename(resolvedPath)}`)

  // Upsert categories
  const categoryCache: Record<string, string> = {}
  const allCategories = [...new Set(Object.values(KEYWORD_TO_CATEGORY).map((c) => c.slug))]
  for (const entry of Object.values(KEYWORD_TO_CATEGORY)) {
    if (categoryCache[entry.slug]) continue
    const record = await prisma.category.upsert({
      where: { slug: entry.slug },
      update: { name: entry.name },
      create: { id: createId(), slug: entry.slug, name: entry.name },
    })
    categoryCache[record.slug] = record.id
  }
  console.log(`Categories ready: ${allCategories.join(', ')}`)

  // Admin user
  const admin = await prisma.user.findUnique({ where: { email: 'admin@portalpanorama.cl' } })
  if (!admin) throw new Error('Admin user not found — run seed first: npx prisma db seed')

  const counts = { created: 0, updated: 0, skipped: 0, reviews: 0 }

  for (const row of rows) {
    const name = String(row['nombre'] ?? '').trim()
    if (!name) { counts.skipped++; continue }

    const rawKeyword = String(row['keyword_1'] ?? '').trim().toLowerCase()
    const catEntry = KEYWORD_TO_CATEGORY[rawKeyword]
    if (!catEntry) {
      console.warn(`  ⚠ Skip "${name}" — keyword sin mapeo: "${rawKeyword}"`)
      counts.skipped++
      continue
    }
    const categoryId = categoryCache[catEntry.slug]
    if (!categoryId) { counts.skipped++; continue }

    const commune = String(row['comuna'] ?? '').trim()
    const neighborhood = communeToNeighborhood(commune)
    const googlePlaceId = String(row['place_id'] ?? '').trim() || null

    const tipos = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
      .map((n) => row[`tipo_${n}`])
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '')

    const updateData = {
      name,
      description: String(row['descripcion'] ?? '').trim() || null,
      address: String(row['direccion'] ?? '').trim() || null,
      commune: commune || null,
      neighborhood,
      phone: String(row['telefono_nacional'] ?? '').trim() || null,
      website: (() => {
        const w = String(row['sitio_web'] ?? '').trim()
        if (!w) return null
        try { const u = new URL(w); return ['http:', 'https:'].includes(u.protocol) ? w : null } catch { return null }
      })(),
      priceRange: mapPriceRange(row['precio']),
      lat: row['latitud'] ? Number(row['latitud']) : null,
      lng: row['longitud'] ? Number(row['longitud']) : null,
      businessHours: parseBusinessHours(row['horario_periodos']) ?? Prisma.DbNull,
      googlePlaceId,
      googleRating: row['rating'] ? Number(row['rating']) : null,
      googleReviewCount: row['total_reviews'] ? Number(row['total_reviews']) : null,
      attributes: tipos.length > 0 ? { tipos } : Prisma.DbNull,
      status: 'PUBLISHED' as const,
      plan: 'FREE' as const,
    }

    const existingListing = googlePlaceId
      ? await prisma.listing.findUnique({ where: { googlePlaceId } })
      : null

    let listingId: string

    if (existingListing) {
      await prisma.listing.update({ where: { id: existingListing.id }, data: updateData })
      listingId = existingListing.id
      counts.updated++
    } else {
      const slug = await buildUniqueSlug(name, commune)
      const created = await prisma.listing.create({
        data: {
          id: createId(),
          slug,
          categoryId,
          ownerId: admin.id,
          ...updateData,
        },
      })
      listingId = created.id
      counts.created++

      // Upload photos (only for new listings)
      const slug2 = slug
      const photoUrls = [row['foto_1'], row['foto_2'], row['foto_3']]
        .map((u) => (typeof u === 'string' && u.trim() ? u.trim() : null))
        .filter((u): u is string => u !== null)

      const uploadedUrls: string[] = []
      for (let i = 0; i < photoUrls.length; i++) {
        const blobUrl = await uploadPhotoToBlob(photoUrls[i], slug2, i + 1)
        if (blobUrl) uploadedUrls.push(blobUrl)
      }

      if (uploadedUrls.length > 0) {
        await prisma.listingImage.createMany({
          data: uploadedUrls.map((url, idx) => ({
            id: createId(),
            listingId,
            url,
            alt: name,
            order: idx,
          })),
        })
      }
    }

    // Upsert Google reviews (delete + recreate)
    const reviews = [1, 2, 3, 4, 5].flatMap((n) => {
      const author = String(row[`resena_${n}_autor`] ?? '').trim()
      const body = String(row[`resena_${n}_texto`] ?? '').trim()
      const rating = row[`resena_${n}_rating`] ? Number(row[`resena_${n}_rating`]) : null
      const dateRaw = row[`resena_${n}_fecha`] ? String(row[`resena_${n}_fecha`]) : null
      if (!author || !body || !rating) return []
      let publishedAt = new Date()
      if (dateRaw) {
        const parsed = new Date(dateRaw)
        if (!isNaN(parsed.getTime())) publishedAt = parsed
      }
      return [{ authorName: author, body, rating, publishedAt }]
    })

    if (reviews.length > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.googleReview.deleteMany({ where: { listingId } })
        await tx.googleReview.createMany({
          data: reviews.map((r) => ({ id: createId(), listingId, ...r })),
        })
      })
      counts.reviews += reviews.length
    }

    const action = existingListing ? 'updated' : 'created'
    if (counts.created % 50 === 0 || counts.updated % 50 === 0) {
      process.stdout.write(`  … ${counts.created} created, ${counts.updated} updated, ${counts.skipped} skipped\r`)
    }
    void action
  }

  console.log(`\n✅ Import complete:`)
  console.log(`   created:  ${counts.created}`)
  console.log(`   updated:  ${counts.updated}`)
  console.log(`   skipped:  ${counts.skipped}`)
  console.log(`   reviews:  ${counts.reviews}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
