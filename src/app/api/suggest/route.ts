import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { container } from '@lib/container'

// Autocompletado de la barra de búsqueda. Transporte puro: valida el input y
// delega en el use case. La tolerancia (parcial/acentos/typos) vive en el dominio
// de búsqueda, no acá.
const schema = z.object({ q: z.string().max(80).default('') })

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse({ q: req.nextUrl.searchParams.get('q') ?? '' })
  if (!parsed.success) return NextResponse.json({ suggestions: [] })

  const suggestions = await container.getSuggestPlacesUseCase().execute(parsed.data.q)
  return NextResponse.json({ suggestions })
}
