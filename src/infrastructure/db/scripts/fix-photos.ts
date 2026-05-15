import { loadEnvFile } from 'node:process'
import * as path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createId } from '@paralleldrive/cuid2'
import * as XLSX from 'xlsx'
import { put } from '@vercel/blob'

try { loadEnvFile('.env.local') } catch { }

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY
if (!GOOGLE_KEY) throw new Error('GOOGLE_MAPS_API_KEY not set')
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function downloadAndUpload(rawUrl: string, slug: string, index: number): Promise<string | null> {
  const url = `${rawUrl}?key=${GOOGLE_KEY}&maxWidthPx=800`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const { url: blobUrl } = await put(`listings/${slug}/photo-${index}.jpg`, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
    })
    return blobUrl
  } catch {
    return null
  }
}

async function main() {
  const inputFile = process.argv[2]
  if (!inputFile) {
    console.error('Usage: npx tsx src/infrastructure/db/scripts/fix-photos.ts <file.xlsx>')
    process.exit(1)
  }

  const wb = XLSX.readFile(path.resolve(inputFile))
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
  console.log(`Loaded ${rows.length} rows`)

  // Build map: googlePlaceId → photo URLs
  const photoMap = new Map<string, string[]>()
  for (const row of rows) {
    const placeId = String(row['place_id'] ?? '').trim()
    if (!placeId) continue
    const urls = [row['foto_1'], row['foto_2'], row['foto_3']]
      .map((u) => (typeof u === 'string' && u.trim() ? u.trim() : null))
      .filter((u): u is string => u !== null)
    if (urls.length > 0) photoMap.set(placeId, urls)
  }
  console.log(`Photo map: ${photoMap.size} entries with photos`)

  // Find listings that have googlePlaceId but no images
  const listings = await prisma.listing.findMany({
    where: { googlePlaceId: { not: null }, images: { none: {} } },
    select: { id: true, slug: true, name: true, googlePlaceId: true },
  })
  console.log(`Listings without photos: ${listings.length}`)

  const counts = { success: 0, failed: 0, noData: 0 }

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i]
    const urls = photoMap.get(listing.googlePlaceId!)
    if (!urls || urls.length === 0) { counts.noData++; continue }

    const uploadedUrls: string[] = []
    for (let j = 0; j < urls.length; j++) {
      const blobUrl = await downloadAndUpload(urls[j], listing.slug, j + 1)
      if (blobUrl) uploadedUrls.push(blobUrl)
    }

    if (uploadedUrls.length > 0) {
      await prisma.listingImage.createMany({
        data: uploadedUrls.map((url, idx) => ({
          id: createId(),
          listingId: listing.id,
          url,
          alt: listing.name,
          order: idx,
        })),
      })
      counts.success++
    } else {
      counts.failed++
    }

    if ((i + 1) % 50 === 0) {
      process.stdout.write(`  … ${i + 1}/${listings.length} | ok:${counts.success} fail:${counts.failed}\r`)
    }
  }

  console.log(`\n✅ Fix photos complete:`)
  console.log(`   success: ${counts.success}`)
  console.log(`   failed:  ${counts.failed}`)
  console.log(`   no data: ${counts.noData}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
