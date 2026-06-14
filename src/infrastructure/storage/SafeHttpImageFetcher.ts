import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { ImageFetcher, FetchedImage, ImageFetchError } from '@application/ports/ImageFetcher'

const MAX_BYTES = 15 * 1024 * 1024 // 15 MB, igual que la subida directa
const TIMEOUT_MS = 10_000
const MAX_REDIRECTS = 3

// Descarga una imagen desde una URL arbitraria con guardas anti-SSRF: solo http/https,
// rechaza hosts que resuelvan a IPs privadas/reservadas (incl. metadata 169.254.169.254),
// revalida en cada redirect, limita tamaño y exige content-type de imagen.
export class SafeHttpImageFetcher implements ImageFetcher {
  async fetch(rawUrl: string): Promise<FetchedImage> {
    let current = this.parse(rawUrl)

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await this.assertPublicHost(current.hostname)

      const res = await this.request(current)

      // Redirect: revalidar el destino antes de seguirlo.
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location')
        if (!location) throw new ImageFetchError('La URL respondió un redirect inválido.')
        current = this.parse(new URL(location, current).toString())
        continue
      }

      if (!res.ok) throw new ImageFetchError(`La URL respondió con error (HTTP ${res.status}).`)

      const contentType = res.headers.get('content-type') ?? undefined
      if (contentType && !contentType.startsWith('image/')) {
        throw new ImageFetchError('La URL no apunta a una imagen.')
      }

      const declared = Number(res.headers.get('content-length'))
      if (declared && declared > MAX_BYTES) {
        throw new ImageFetchError(`La imagen supera el límite de ${MAX_BYTES / 1024 / 1024} MB.`)
      }

      const buffer = await this.readCapped(res)
      return { buffer, contentType }
    }

    throw new ImageFetchError('Demasiados redirects al traer la imagen.')
  }

  private parse(rawUrl: string): URL {
    let url: URL
    try {
      url = new URL(rawUrl)
    } catch {
      throw new ImageFetchError('La URL no es válida.')
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new ImageFetchError('Solo se permiten URLs http(s).')
    }
    return url
  }

  private async request(url: URL): Promise<Response> {
    try {
      return await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: 'image/*', 'user-agent': 'PortalPanorama/1.0 (+image-import)' },
      })
    } catch {
      throw new ImageFetchError('No se pudo conectar con esa URL.')
    }
  }

  // Verifica que TODAS las IPs a las que resuelve el host sean públicas.
  private async assertPublicHost(hostname: string): Promise<void> {
    const host = hostname.replace(/^\[|\]$/g, '') // IPv6 entre corchetes
    let addresses: { address: string }[]
    if (isIP(host)) {
      addresses = [{ address: host }]
    } else {
      try {
        addresses = await lookup(host, { all: true })
      } catch {
        throw new ImageFetchError('No se pudo resolver el dominio de la URL.')
      }
    }
    if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
      throw new ImageFetchError('Esa URL apunta a una dirección no permitida.')
    }
  }

  private async readCapped(res: Response): Promise<Buffer> {
    if (!res.body) throw new ImageFetchError('La URL no devolvió contenido.')
    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.length
      if (total > MAX_BYTES) {
        await reader.cancel()
        throw new ImageFetchError(`La imagen supera el límite de ${MAX_BYTES / 1024 / 1024} MB.`)
      }
      chunks.push(value)
    }
    if (total === 0) throw new ImageFetchError('La imagen está vacía.')
    return Buffer.concat(chunks)
  }
}

// Rechaza loopback, link-local (incl. metadata 169.254.169.254), privadas, CGNAT,
// multicast y reservadas. IPv6: loopback, ULA, link-local, multicast y mapped-IPv4.
function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const lower = ip.toLowerCase()
    if (lower === '::1' || lower === '::') return true
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isPrivateV4(mapped[1])
    if (/^(fc|fd)/.test(lower)) return true // ULA fc00::/7
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb'))
      return true // link-local fe80::/10
    if (lower.startsWith('ff')) return true // multicast
    return false
  }
  return isPrivateV4(ip)
}

function isPrivateV4(ip: string): boolean {
  const p = ip.split('.').map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true
  const [a, b] = p
  if (a === 0 || a === 10 || a === 127) return true
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT 100.64/10
  if (a === 169 && b === 254) return true // link-local + metadata
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 192 && b === 0) return true // 192.0.0.0/24 + 192.0.2.0/24
  if (a === 198 && (b === 18 || b === 19)) return true // benchmarking
  if (a >= 224) return true // multicast + reservado
  return false
}
