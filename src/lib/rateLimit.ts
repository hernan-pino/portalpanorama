import { headers } from 'next/headers'

// Rate limiter en memoria (ventana fija), best-effort. En serverless el estado vive
// por instancia y se reinicia en cold start: mitiga abuso casual (spam de reportes,
// alta de bots), NO es una defensa dura. Para algo robusto, reemplazar el store por
// Redis/Upstash detrás de esta misma firma sin tocar los callers.

interface Window {
  count: number
  resetAt: number
}

const windows = new Map<string, Window>()
const MAX_KEYS = 10_000 // poda defensiva para que el Map no crezca sin límite

export interface RateLimitResult {
  ok: boolean
  retryAfterSec: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()

  if (windows.size > MAX_KEYS) {
    for (const [k, w] of windows) if (now >= w.resetAt) windows.delete(k)
  }

  const w = windows.get(key)
  if (!w || now >= w.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSec: 0 }
  }
  if (w.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((w.resetAt - now) / 1000) }
  }
  w.count += 1
  return { ok: true, retryAfterSec: 0 }
}

// IP del cliente desde los headers del proxy. 'unknown' si no se puede determinar
// (todas las 'unknown' comparten cubo: es aceptable para un limiter best-effort).
export async function clientIp(): Promise<string> {
  const h = await headers()
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return h.get('x-real-ip')?.trim() || 'unknown'
}
