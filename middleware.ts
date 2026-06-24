import { auth } from '@lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserRole } from './src/domain/user/UserRole'

const PROTECTED_ROUTES = ['/dashboard', '/mi-cuenta']
const ADMIN_ROUTES = ['/admin']
// Páginas de catálogo público: el blanco principal del scraping.
const CONTENT_ROUTES = ['/lugar', '/explorar']

// Crawlers legítimos que SÍ deben pasar (SEO + previews de redes). Se chequea
// primero para no bloquearlos nunca por el filtro de abajo.
const GOOD_BOTS =
  /(googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandex(bot)?|applebot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|pinterest|chrome-lighthouse)/i

// Herramientas HTTP no-navegador: scraping casi seguro. Lista negra de TOOLS (no
// lista blanca de navegadores), así no se cae ningún navegador real ni crawler bueno.
// Es un filtro barato y stateless en el edge: no gasta cuota de Upstash. Atrapa a los
// scrapers perezosos; la defensa dura (rate-limit por volumen + challenge) vive en
// Vercel Firewall. Spoofear un UA de navegador lo evade — por eso es solo una capa.
const SCRAPER_UA =
  /(python-requests|urllib|aiohttp|httpx|scrapy|curl\/|libcurl|wget|libwww|java\/|jakarta|go-http-client|okhttp|node-fetch|axios\/|undici|guzzle|mechanize|colly|apache-httpclient|httpclient|restsharp|postmanruntime|insomnia|headlesschrome)/i

function isBlockedScraper(ua: string | null): boolean {
  if (!ua || ua.trim() === '') return true // sin User-Agent = casi siempre script/bot
  if (GOOD_BOTS.test(ua)) return false
  return SCRAPER_UA.test(ua)
}

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isAuthenticated = !!session?.user

  const isContentRoute = CONTENT_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  if (isContentRoute && isBlockedScraper(req.headers.get('user-agent'))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))

  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session?.user?.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/mi-cuenta/:path*', '/admin/:path*', '/lugar/:path*', '/explorar'],
}
