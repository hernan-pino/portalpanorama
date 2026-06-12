// Matching tolerante para la búsqueda del MVP (≤100 lugares): se hace en la app,
// no en SQL. Cubre las 3 formas que pidió el producto: substring (parcial: "caf"
// → "café"), sin acentos ("cafe" = "café") y typos por distancia de edición
// ("cafi" ≈ "café"). Cuando el catálogo crezca, esto se reemplaza por Meilisearch
// (Fase 2), que trae typo-tolerance nativo — el port SearchService no cambia.

// Umbral de inclusión: un score por debajo de esto no se considera match.
export const MATCH_THRESHOLD = 0.5

// lowercase + sin acentos + espacios colapsados. La base de toda comparación.
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Distancia de Levenshtein (DP clásico, sin optimizar: las palabras son cortas).
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    prev = curr
  }
  return prev[b.length]
}

// Cuántos typos se toleran según el largo de la consulta. Corto = 0 (el substring
// ya cubre; permitir typos en 3 letras da demasiados falsos positivos).
function maxTypos(len: number): number {
  return len < 4 ? 0 : Math.floor(len / 4)
}

// Score 0..1 de qué tan bien `query` matchea `text`.
//  - substring (con bonus si es prefijo de la cadena) → 0.9–1.0
//  - typo dentro de la tolerancia contra alguna palabra → 0.5–0.85
//  - nada → 0
export function fuzzyScore(text: string, query: string): number {
  const t = normalize(text)
  const q = normalize(query)
  if (!q || !t) return 0

  if (t.includes(q)) return t.startsWith(q) ? 1 : 0.9

  const tolerance = maxTypos(q.length)
  if (tolerance === 0) return 0

  let best = 0
  for (const word of t.split(' ')) {
    if (!word) continue
    // Contra la palabra entera y contra su prefijo del largo de la consulta
    // (para que "cafi" matchee "cafetería" por su comienzo "cafe").
    const dist = Math.min(levenshtein(q, word), levenshtein(q, word.slice(0, q.length)))
    if (dist <= tolerance) best = Math.max(best, 1 - dist / (q.length + 1))
  }
  return best
}

// Conveniencia: ¿pasa el umbral?
export function fuzzyMatches(text: string, query: string): boolean {
  return fuzzyScore(text, query) >= MATCH_THRESHOLD
}
