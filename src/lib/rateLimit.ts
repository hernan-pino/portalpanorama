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

// ─── Limiter DURABLE (Upstash Redis) ────────────────────────────────────────────
// El limiter en memoria de arriba no sirve en Vercel (cada instancia cuenta aparte
// y se resetea en cold start). Este usa Upstash vía REST (ventana fija con INCR +
// PEXPIRE NX) y es compartido entre instancias. Sin Upstash configurado, cae al
// limiter en memoria. Ante error de red, FALLA ABIERTO (no bloquea) para no tumbar
// el sitio por un problema del store. Pensado para endpoints abusables de bajo
// volumen (autocomplete, registro, reset, reportes); NO para cada vista de página
// (eso lo cubre Vercel Firewall, sin gastar cuota de Upstash).

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export async function rateLimitDurable(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // Sin store remoto (ej. dev local sin envs): degrada al limiter en memoria.
    return rateLimit(key, limit, windowMs)
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      // INCR cuenta el hit; PEXPIRE NX fija la ventana solo en el primer hit.
      body: JSON.stringify([
        ['INCR', `rl:${key}`],
        ['PEXPIRE', `rl:${key}`, windowMs, 'NX'],
      ]),
      signal: controller.signal,
      cache: 'no-store',
    }).finally(() => clearTimeout(timeout))

    if (!res.ok) return { ok: true, retryAfterSec: 0 } // falla abierto

    const data = (await res.json()) as Array<{ result?: number; error?: string }>
    const count = data[0]?.result ?? 0
    if (count > limit) {
      // Aproximamos el retry-after a la ventana completa (suficiente para el header).
      return { ok: false, retryAfterSec: Math.ceil(windowMs / 1000) }
    }
    return { ok: true, retryAfterSec: 0 }
  } catch {
    return { ok: true, retryAfterSec: 0 } // timeout / red caída → falla abierto
  }
}
