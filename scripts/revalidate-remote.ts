// Invalida el Data Cache del sitio en prod (POST /api/revalidate) tras escribir
// directo a la BD. Lo usan prod-sync y update-list-intros; también corre solo:
//
//   npx tsx --env-file=.env.local scripts/revalidate-remote.ts
//
// Requiere REVALIDATE_SECRET en .env.local (el mismo cargado en Vercel). Si
// falta o falla, avisa y sigue: el caché igual se refresca solo en ≤1 hora.
const BASE_URL = process.env.REVALIDATE_BASE_URL ?? 'https://portalpanorama.cl'

export async function revalidateRemote(): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    console.warn('⚠️ REVALIDATE_SECRET no seteado → el caché de prod se refresca solo en ≤1 h')
    return
  }
  try {
    const res = await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
    if (res.ok) {
      const body = (await res.json()) as { revalidated: string[] }
      console.log(`✓ caché de prod invalidado (tags: ${body.revalidated.join(', ')})`)
    } else {
      console.warn(`⚠️ revalidate falló (HTTP ${res.status}) → el caché se refresca solo en ≤1 h`)
    }
  } catch (e) {
    console.warn('⚠️ revalidate falló →  el caché se refresca solo en ≤1 h:', e)
  }
}

// Ejecutable directo (además de importable).
if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/revalidate-remote.ts')) {
  revalidateRemote()
}
