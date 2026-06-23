import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { container } from '@lib/container'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'

// Autocompletado de la barra de búsqueda. Transporte puro: valida el input y
// delega en el use case. La tolerancia (parcial/acentos/typos) vive en el dominio
// de búsqueda, no acá.
const schema = z.object({ q: z.string().max(80).default('') })

export async function GET(req: NextRequest) {
  // Anti-scraping: el autocomplete es el vector más fácil de enumerar. Tope generoso
  // por IP (un humano tipeando con debounce no lo roza; un bot sí). Durable (Upstash).
  const ip = await clientIp()
  if (!(await rateLimitDurable(`suggest:${ip}`, 60, 60_000)).ok) {
    return NextResponse.json({ suggestions: [] }, { status: 429 })
  }

  const parsed = schema.safeParse({ q: req.nextUrl.searchParams.get('q') ?? '' })
  if (!parsed.success) return NextResponse.json({ suggestions: [] })

  const suggestions = await container.getSuggestPlacesUseCase().execute(parsed.data.q)
  return NextResponse.json({ suggestions })
}
