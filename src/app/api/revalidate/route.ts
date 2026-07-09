import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@lib/cachedReads'
import { revalidateSecret } from '@lib/revalidateSecret'

// Invalida el Data Cache de las lecturas públicas (fichas, guías, home, facetas).
// Lo llaman los scripts de carga (prod-sync, update-list-intros, etc.) al
// terminar de escribir directo a la BD — así el contenido nuevo se ve al tiro
// sin esperar el timer de 1 hora. Protegido por REVALIDATE_SECRET.
export async function POST(request: Request) {
  if (!revalidateSecret) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET no configurado' }, { status: 503 })
  }
  if (request.headers.get('x-revalidate-secret') !== revalidateSecret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const tags = Object.values(CACHE_TAGS)
  for (const tag of tags) revalidateTag(tag)
  return NextResponse.json({ revalidated: tags })
}
