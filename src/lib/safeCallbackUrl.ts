// Devuelve un destino post-login SEGURO: solo rutas internas relativas. Evita el
// open-redirect (ej. ?callbackUrl=https://evil.tld o //evil.tld). Si el valor no
// es una ruta interna válida, cae al fallback.
export function safeCallbackUrl(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback
  // Debe empezar con "/" (ruta interna) y NO con "//" (protocol-relative → externo).
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback
  // Descarta cualquier cosa con esquema o backslash raro.
  if (/[\\]|^\/\W*https?:/i.test(raw)) return fallback
  return raw
}
