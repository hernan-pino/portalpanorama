// Captura TODAS las pantallas del producto (móvil + desktop) para el paquete que se
// le entrega a Claude Design (no puede navegar URLs: solo ve imágenes).
//
//   1) npx tsx --env-file=.env.local scripts/design-shots-setup.ts   (cuentas de prueba)
//   2) npx next dev                                                  (en otra terminal)
//   3) npx tsx --env-file=.env.local scripts/design-shots.ts         (--solo=05,23 para algunas)
//   4) npx tsx scripts/design-shots-compress.ts                      (PNG → JPEG)
//   5) npx tsx --env-file=.env.local scripts/design-shots-setup.ts --clean
//
// Salida: design_briefs/claude_design/capturas/{movil,desktop}/NN-nombre.png

import { chromium, type Page, type BrowserContext } from 'playwright'
import { mkdirSync } from 'node:fs'
import { prisma } from '../src/lib/db'

const BASE = 'http://localhost:3000'
const OUT = 'design_briefs/claude_design/capturas'

const CREDS = {
  consumidor: { email: 'diseno.consumidor@test.local', password: 'diseno1234' },
  dueno: { email: 'diseno.dueno@test.local', password: 'diseno1234' },
  admin: { email: 'admin@portalpanorama.cl', password: 'admin1234' },
}
type Estado = 'anon' | keyof typeof CREDS

type Shot = {
  n: string
  nombre: string
  path: string
  estado: Estado
  /** Interacción opcional antes de disparar (abrir un modal, desplegar un menú…). */
  antes?: (page: Page) => Promise<void>
  /** Los overlays se capturan en viewport, no en página completa. */
  viewportOnly?: boolean
}

async function login(ctx: BrowserContext, estado: Exclude<Estado, 'anon'>) {
  const page = await ctx.newPage()
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.fill('input[name="email"]', CREDS[estado].email)
  await page.fill('input[name="password"]', CREDS[estado].password)
  // OJO: el primer button[type=submit] del form es el de Google (va arriba y es el
  // preferido). Hay que apuntar al de email o el script termina en accounts.google.com.
  await page.click('button:has-text("Ingresar con email")')
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20_000 })
  if (new URL(page.url()).hostname !== 'localhost') {
    throw new Error(`El login se fue fuera del sitio: ${page.url()}`)
  }
  await page.close()
}

async function capturar(page: Page, shot: Shot, dir: string, esMovil: boolean) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle', timeout: 45_000 })
  // Las imágenes lazy no salen en la captura si no se hace scroll por la página.
  // Se pasa como string: tsx inyecta __name en las funciones y revienta en el browser.
  await page.evaluate(`new Promise((resolve) => {
    let y = 0
    const step = () => {
      window.scrollBy(0, window.innerHeight)
      y += window.innerHeight
      if (y < document.body.scrollHeight) setTimeout(step, 80)
      else { window.scrollTo(0, 0); setTimeout(resolve, 300) }
    }
    step()
  })`)
  if (shot.antes) await shot.antes(page)
  const file = `${dir}/${shot.n}-${shot.nombre}.png`
  await page.screenshot({ path: file, fullPage: !shot.viewportOnly })
  console.log(`  ✓ ${esMovil ? '📱' : '🖥️ '} ${file}`)
}

async function main() {
  // Ids/slugs reales, resueltos contra la BD local.
  const place = await prisma.place.findFirst({
    where: { status: 'PUBLISHED', images: { some: {} }, googleRating: { not: null } },
    orderBy: { score: 'desc' },
    select: { id: true, slug: true },
  })
  const conMarca = await prisma.place.findFirst({
    where: { status: 'PUBLISHED', brandId: { not: null } },
    select: { slug: true, brand: { select: { slug: true } } },
  })
  const lista = await prisma.curatedList.findFirst({ select: { id: true, slug: true } })
  const marca = await prisma.brand.findFirst({ select: { id: true, slug: true } })
  if (!place || !lista || !marca) throw new Error('Faltan datos base en la BD local')
  const fichaSlug = conMarca?.slug ?? place.slug
  const marcaSlug = conMarca?.brand?.slug ?? marca.slug
  const dueñoSlug = 'osaka' // el que presta design-setup.ts

  const shots: Shot[] = [
    // ── Público (sin sesión) ──
    { n: '01', nombre: 'home', path: '/', estado: 'anon' },
    { n: '02', nombre: 'explorar', path: '/explorar', estado: 'anon' },
    { n: '03', nombre: 'explorar-filtrado', path: '/explorar?categoria=gastronomia&presupuesto=MODERADO', estado: 'anon' },
    { n: '04', nombre: 'explorar-busqueda', path: '/explorar?q=cafe+para+trabajar', estado: 'anon' },
    { n: '05', nombre: 'ficha-lugar', path: `/lugar/${fichaSlug}`, estado: 'anon' },
    { n: '06', nombre: 'lista-curada', path: `/lista/${lista.slug}`, estado: 'anon' },
    { n: '07', nombre: 'marca', path: `/marca/${marcaSlug}`, estado: 'anon' },
    { n: '08', nombre: 'guias', path: '/guias', estado: 'anon' },
    { n: '09', nombre: 'como-ordenamos', path: '/como-ordenamos', estado: 'anon' },
    { n: '10', nombre: 'para-negocios', path: '/para-negocios', estado: 'anon' },
    { n: '11', nombre: 'login', path: '/login', estado: 'anon' },
    { n: '12', nombre: 'registro', path: '/registro', estado: 'anon' },
    { n: '13', nombre: 'recuperar', path: '/recuperar', estado: 'anon' },
    { n: '14', nombre: 'terminos', path: '/terminos', estado: 'anon' },
    { n: '15', nombre: 'privacidad', path: '/privacidad', estado: 'anon' },
    {
      n: '16',
      nombre: 'menu-movil-anon',
      path: '/',
      estado: 'anon',
      viewportOnly: true,
      antes: async (page) => {
        const btn = page.locator('[aria-label*="menú" i], .topbar__burger, button:has-text("Menú")').first()
        if (await btn.isVisible().catch(() => false)) {
          await btn.click()
          await page.waitForTimeout(500)
        }
      },
    },

    // ── Consumidor (con sesión) ──
    { n: '20', nombre: 'home-con-sesion', path: '/', estado: 'consumidor' },
    { n: '21', nombre: 'mi-cuenta', path: '/mi-cuenta', estado: 'consumidor' },
    { n: '22', nombre: 'mi-cuenta-perfil', path: '/mi-cuenta/perfil', estado: 'consumidor' },
    {
      n: '23',
      nombre: 'modal-guardar',
      path: '/explorar',
      estado: 'consumidor',
      viewportOnly: true,
      antes: async (page) => {
        const heart = page.locator('button[aria-label*="uardar"]').first()
        await heart.click().catch(() => {})
        await page.waitForTimeout(700)
      },
    },
    { n: '24', nombre: 'reclamar-ficha', path: `/reclamar/${fichaSlug}`, estado: 'consumidor' },

    // ── Dueño de negocio ──
    { n: '30', nombre: 'panel-negocio', path: '/mi-negocio', estado: 'dueno' },
    { n: '31', nombre: 'editor-ficha-dueno', path: `/mi-negocio/${dueñoSlug}/editar`, estado: 'dueno' },
    { n: '32', nombre: 'wizard-negocio-nuevo', path: '/mi-negocio/nuevo', estado: 'dueno' },

    // ── Admin ──
    { n: '40', nombre: 'admin-inicio', path: '/admin', estado: 'admin' },
    { n: '41', nombre: 'admin-lugares', path: '/admin/lugares', estado: 'admin' },
    { n: '42', nombre: 'admin-lugar-editar', path: `/admin/lugares/${place.id}`, estado: 'admin' },
    { n: '43', nombre: 'admin-lugar-nuevo', path: '/admin/lugares/nuevo', estado: 'admin' },
    { n: '44', nombre: 'admin-marcas', path: '/admin/marcas', estado: 'admin' },
    { n: '45', nombre: 'admin-marca-editar', path: `/admin/marcas/${marca.id}`, estado: 'admin' },
    { n: '46', nombre: 'admin-listas', path: '/admin/listas', estado: 'admin' },
    { n: '47', nombre: 'admin-lista-editar', path: `/admin/listas/${lista.id}`, estado: 'admin' },
    { n: '48', nombre: 'admin-reclamos', path: '/admin/reclamos', estado: 'admin' },
    { n: '49', nombre: 'admin-reportes', path: '/admin/reportes', estado: 'admin' },
    { n: '50', nombre: 'admin-usuarios', path: '/admin/usuarios', estado: 'admin' },
    { n: '51', nombre: 'admin-analytics', path: '/admin/analytics', estado: 'admin' },
    { n: '52', nombre: 'admin-cobertura', path: '/admin/cobertura', estado: 'admin' },
  ]

  const browser = await chromium.launch()
  const viewports = [
    { id: 'movil', viewport: { width: 390, height: 844 }, dsf: 2, movil: true },
    { id: 'desktop', viewport: { width: 1440, height: 900 }, dsf: 1, movil: false },
  ]

  for (const vp of viewports) {
    const dir = `${OUT}/${vp.id}`
    mkdirSync(dir, { recursive: true })
    console.log(`\n── ${vp.id} (${vp.viewport.width}px) ──`)

    const contexts = new Map<Estado, BrowserContext>()
    for (const estado of ['anon', 'consumidor', 'dueno', 'admin'] as Estado[]) {
      const ctx = await browser.newContext({
        viewport: vp.viewport,
        deviceScaleFactor: vp.dsf,
        isMobile: vp.movil,
        hasTouch: vp.movil,
        locale: 'es-CL',
        reducedMotion: 'reduce',
      })
      if (estado !== 'anon') await login(ctx, estado)
      contexts.set(estado, ctx)
    }

    // --solo=21,23 → recaptura solo esas pantallas (sin rehacer las 74).
    const solo = process.argv.find((a) => a.startsWith('--solo='))?.split('=')[1]?.split(',')
    for (const shot of solo ? shots.filter((s) => solo.includes(s.n)) : shots) {
      const page = await contexts.get(shot.estado)!.newPage()
      try {
        await capturar(page, shot, dir, vp.movil)
      } catch (e) {
        console.log(`  ✗ ${shot.n}-${shot.nombre}: ${(e as Error).message.split('\n')[0]}`)
      }
      await page.close()
    }
    for (const ctx of contexts.values()) await ctx.close()
  }

  await browser.close()
  console.log('\nCapturas listas ✅')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
