# ROADMAP — Portal Panorama

Documento central de seguimiento. Se actualiza al cerrar cada paso.
Leído por `/retomar` al iniciar sesión y por `/cerrar-fase` al cerrar un paso.

---

## Fases completadas

| Fase | Descripción | Commit |
|------|-------------|--------|
| 0 | Documentos fundacionales | — |
| 1 | Domain layer (entidades + VOs) | — |
| 2 | Application layer (use cases) | — |
| 3 | Infrastructure (Prisma, adapters) | — |
| 4A | Fundación + Auth | 105e9ed |
| 4B | Páginas públicas | 18092c0 |
| 4C | Dashboard de negocio | e250ca0 |
| 4D | Dashboard de usuario | 4732535 |
| 4E | Admin + Webhooks Flow | f078890 |
| 5 | Composition root (wire-up DI) | b837487 |
| 6 | Fidelidad visual al handoff | e695a1e |

---

## Fase 7 — Cerrar MVP completo

**Objetivo:** Todos los flujos de usuario funcionales end-to-end. Feature-by-feature (función + diseño juntos).

**Contexto clave:**
- 3 tipos de cuenta: CONSUMER / BUSINESS_OWNER (FREE o PREMIUM) / ADMIN
- El plan FREE/PREMIUM vive en `Listing.plan`, no en el User
- Un CONSUMER puede convertirse en BUSINESS_OWNER desde su dashboard
- El checkout `/listar-mi-local` crea la cuenta de negocio + listing en un flow guiado
- Dashboards reestructurados a tabs (una página, params de query)

---

### Paso 7.1 — Header + bifurcación de auth
**Estado:** ✅ COMPLETADO
**Commit:** 0da2709
**Archivos:** `src/components/layout/Header.tsx`
**Qué hace:**
- Agrega botón "Listar mi local" → `/listar-mi-local`
- Si CONSUMER logueado: muestra nombre + "Listar mi negocio"
- Si BUSINESS_OWNER: muestra nombre + "Mi negocio" → `/mi-negocio`
- Si ADMIN: igual que antes
**Commit de cierre:** —

---

### Paso 7.2 — Checkout flow `/listar-mi-local` (4 pasos)
**Estado:** ✅ COMPLETADO
**Commit:** 3337b6f
**Archivos nuevos:**
```
src/app/listar-mi-local/
  layout.tsx          (step indicator, 4 pasos)
  step1/page.tsx      (elegir plan Free vs Premium)
  step2/page.tsx      (datos del negocio + cuenta si no está logueado)
  step3/page.tsx      (pago Flow — solo Premium)
  step4/page.tsx      (confirmación + CTA al panel)
  actions.ts          (createBusinessAction, startSubscriptionAction)
```
**Precio:** Free $0, Premium $24.900/mes (−20% anual = $19.900/mes)
**Bifurcación:** plan=free → step2→step4, plan=premium → step2→step3→step4
**Referencia visual:** `screenshots/listarmilocal.png`
**Commit de cierre:** —

---

### Paso 7.3 — Dashboard negocio `/mi-negocio?tab=...`
**Estado:** ✅ COMPLETADO
**Commit de cierre:** 2ce5d8d
**Archivos nuevos/modificados:**
```
src/app/mi-negocio/
  layout.tsx          (sidebar 9 tabs + header con KPIs)
  page.tsx            (redirect a ?tab=resumen)
  tabs/
    Resumen.tsx       (KPIs, gráfico 7d, reviews recientes, estado ficha)
    Fichas.tsx        (mis listings, editar, publicar, agregar)
    Resenas.tsx       (reviews recibidas + responder)
    Estadisticas.tsx  (6 meses, fuente de tráfico)
    Eventos.tsx       (publicar/gestionar eventos)
    Plan.tsx          (facturación, upgrade/cancel)
    Guardados.tsx     (hereda del dashboard usuario)
    Listas.tsx        (hereda del dashboard usuario)
    Perfil.tsx        (identidad del negocio)
  actions.ts          (respondToReviewAction, createEventAction)
```
**Redirects:** `/dashboard` → `/mi-negocio`, `/dashboard/suscripcion` → `/mi-negocio?tab=plan`
**Referencia visual:** `screenshots/dashboardnegocio.png`
**Commit de cierre:** —

---

### Paso 7.4 — Dashboard usuario `/mi-cuenta?tab=...`
**Estado:** ✅ COMPLETADO
**Archivos nuevos/modificados:**
```
src/app/mi-cuenta/
  layout.tsx          (header usuario + sidebar 7 tabs)
  SidebarNav.tsx      (client component con useSearchParams)
  page.tsx            (router de tabs)
  tabs/
    Guardados.tsx     (grid ListingCard con favoritos reales)
    Listas.tsx        (placeholder fiel al screenshot)
    Historial.tsx     (placeholder)
    Resenas.tsx       (datos reales — listing name, rating, body)
    Eventos.tsx       (placeholder)
    Perfil.tsx        (wrappea ProfileForm existente)
    Config.tsx        (placeholder)
src/lib/userDashboardCache.ts  (React cache() deduplica queries)
src/application/user/GetUserDashboardUseCase.ts  (+ reviewRepo + isBusinessOwner)
src/application/ports/ReviewRepository.ts  (+ ReviewWithListingView + findByUserId)
src/infrastructure/db/PrismaReviewRepository.ts  (+ findByUserId con include listing)
src/lib/container.ts  (actualizado)
```
**Redirects:** `/mi-cuenta/favoritos` → `/mi-cuenta?tab=guardados`, `/mi-cuenta/perfil` → `/mi-cuenta?tab=perfil`
**Commit de cierre:** 017c31c (fix label botón: a6e3f...)

---

### Paso 7.5 — Loops básicos en ficha de lugar
**Estado:** ✅ COMPLETADO
**Archivos:**
- `src/app/(main)/lugar/[slug]/ReviewForm.tsx` — form rating 1–10 + body, 3 estados (no-logueado, ya-reseñó, activo)
- `src/app/(main)/lugar/[slug]/FavoriteButton.tsx` — toggle corazón con update optimista
- `src/app/(main)/lugar/[slug]/actions.ts` — submitReviewAction (IDOR-safe: listingId resuelto desde slug) + toggleFavoriteAction
- `src/app/(main)/lugar/[slug]/page.tsx` — integra componentes + "También te puede gustar" + banner "Reclamar ficha"
- `src/application/listing/GetListingWithReviewsUseCase.ts` — acepta userId? opcional, devuelve isFavorite + userReview
- `src/lib/container.ts` — agrega getCreateReviewUseCase
- Fix seguridad XSS: `website` en 3 schemas de actions (nuevo, editar, listar-mi-local) rechaza protocolos no-http/https
**Commit de cierre:** b6b1560 (feat) + fix seguridad en commit siguiente

---

### Paso 7.6 — Perfil público del negocio `/perfil-negocio/[ownerId]`
**Estado:** ✅ COMPLETADO
**Archivos:**
- `src/application/listing/GetOwnerProfileUseCase.ts` — verifica isBusinessOwner(), devuelve OwnerListingDTO[] (no expone plan/pricePerMonth/ownerId)
- `src/application/listing/GetListingWithReviewsUseCase.ts` — agrega `ownerName: string | null` al output
- `src/lib/container.ts` — agrega `getGetOwnerProfileUseCase()`
- `src/app/(main)/perfil-negocio/[ownerId]/page.tsx` — avatar inicial, nombre, miembro-desde, grid de lugares; React.cache() evita doble query
- `src/app/(main)/lugar/[slug]/page.tsx` — sidebar: "Gestionado por [Nombre]" link cuando ownerName != null; "Reclamar ficha" cuando es null
**Nota:** El param `[ownerId]` usa el ID del usuario (CUID2) como identificador. User no tiene slug propio.
**Commit de cierre:** 6c90df1

---

### Paso 7.7 — Imágenes reales (seed con URLs Unsplash)
**Estado:** ✅ COMPLETADO
**Archivos:**
- `src/infrastructure/db/prisma/seed.ts` — 3 imágenes por listing (Fachada/Interior/Detalle, Unsplash w=1200&q=80), inserción idempotente con guard `imgCount === 0`
- `next.config.ts` — `images.unsplash.com` en remotePatterns
- `src/application/ports/SearchService.ts` — `coverUrl?` agregado a `SearchResultItem`
- `src/infrastructure/search/PostgresFTSSearchService.ts` — include `images` en query, mapea primera imagen a `coverUrl`
- `src/app/(main)/page.tsx` — `coverUrl` pasado a ListingCard en ambos grids
- `src/app/(main)/explorar/page.tsx` — `coverUrl` en grid view + imagen real en vista lista
- `src/app/(main)/lugar/[slug]/page.tsx` — `coverUrl: undefined` → `item.coverUrl` en "También te puede gustar"
**Commit de cierre:** 669f114

---

### Paso 7.8 — QA Responsive (960px y 600px + monitores grandes)
**Estado:** ✅ COMPLETADO
**Archivos:**
- `src/app/globals.css` — clases `.dash-*`, responsive dashboards 960px/600px, `form-grid-2` colapso, `--content-max` 1280→1440px
- `src/app/(main)/mi-negocio/layout.tsx` — inline styles → clases `dash-shell/sidebar/content`
- `src/app/(main)/mi-cuenta/layout.tsx` — mismo refactor + `dash-user-header`, `dash-header-meta`
- `src/app/(main)/mi-negocio/SidebarNav.tsx` — inline styles → `dash-sidenav__link` + clase `.active`
- `src/app/(main)/mi-cuenta/SidebarNav.tsx` — mismo refactor
**Commit de cierre:** b878675

---

### Paso 7.9 — QA Visual vs handoff
**Estado:** ✅ COMPLETADO
**Referencia:** `design_handoff_portal_panorama/index.html`
**Páginas revisadas:** Home (`/`), Explorar (`/explorar`)
**Archivos clave modificados:**
- `src/components/listing/ListingCard.tsx` — Premium badge position:absolute sobre imagen
- `src/components/home/FeaturedSlider.tsx` — nuevo Client Component slider con flechas
- `src/components/search/FilterRail.tsx` — header Filtros/Resultados + counts dinámicos por categoría
- `src/app/(main)/page.tsx` — numeración secciones 01/06, eyebrow #04, pull-quote, FeaturedSlider
- `src/app/(main)/explorar/page.tsx` — hero__eyebrow, badge lista, facets en paralelo
- `src/application/ports/SearchService.ts` — CategoryFacet + getCategoryFacets()
- `src/application/listing/GetCategoryFacetsUseCase.ts` — nuevo use case
- `src/infrastructure/search/PostgresFTSSearchService.ts` — implementación getCategoryFacets
- `src/lib/parseSearchParams.ts` — fix seguridad: query.slice(0,100), parseInt en priceRanges
- `src/infrastructure/db/prisma/seed.ts` — 3 listings PREMIUM (La Bodeguita, Bar Loreto, Ambrosía)
- `src/app/globals.css` — featured-slider, filter-rail__header, filter-rail__total
**Commit de cierre:** 15fdac7

---

### Paso 7.10 — Deploy Vercel
**Estado:** ⬜ PENDIENTE
**Qué hacer:**
- Crear proyecto en Vercel conectado al repo
- Configurar env vars: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, RESEND_API_KEY, FLOW_API_KEY, FLOW_SECRET, FLOW_WEBHOOK_SECRET
- Verificar build sin errores de TypeScript
- Configurar URL de webhook Flow en producción
**Commit de cierre:** —

---

## Estados posibles de cada paso

| Símbolo | Significado |
|---------|------------|
| ⬜ PENDIENTE | No empezado |
| 🔄 EN CURSO | Trabajo activo en esta sesión |
| ✅ COMPLETADO | Cerrado con `/cerrar-fase`, commit registrado |
| ⚠️ BLOQUEADO | Esperando decisión o dependencia externa |

---

## Entorno de desarrollo

- **DB:** Neon PostgreSQL (ver `.env.local` para string de conexión)
- **Dev server:** `npm run dev` → `http://localhost:3000`
- **Seed:** `npx prisma db seed` (idempotente)
- **Migrations:** `npx prisma migrate dev`
- **Tests:** `npm test`
- **Seed actual:** 6 categorías, 1 admin (admin@portalpanorama.cl / admin1234), 6 listings publicados

## Preguntas abiertas / decisiones pendientes

- ¿El modelo `UserList` existe en `schema.prisma`? Verificar antes del Paso 7.4 tab Listas
- ¿Credenciales Flow sandbox disponibles? Necesarias para Paso 7.2 step 3 y Paso 7.10
- ¿Dominio final decidido? Necesario para `NEXTAUTH_URL` en Vercel
- Banner de credenciales dev en `/login` — borrar antes del deploy a producción (Paso 7.10)
- Deuda técnica: no hay rate limiting en server actions de escritura (submitReviewAction). Spammer autenticado puede publicar reseñas masivas. Resolver antes de producción con Upstash Ratelimit o middleware.
- Error TS preexistente: `subscription.test.ts:86` — `status: undefined as unknown as string`. Arreglar en QA (Paso 7.9).

### Pendientes UX — anotados, evaluación pendiente

- **Featured grid → slider horizontal**: la primera card del grid asimétrico (span 2 filas) se ve muy grande en tablet/móvil. Alternativa: convertir a scroll horizontal tipo carrusel. Evaluar en Paso 7.9 QA Visual.

---

### Pendientes visuales ficha de lugar — requieren data o features nuevas

Relevados al comparar con el diseño de referencia. Se resuelven en pasos posteriores:
- **Imágenes con captions** (FACHADA, INTERIOR, DETALLE) — campo `alt` existe pero no se renderiza como label. Fácil de agregar con data real (Paso 7.7).
- **Horario de apertura** ("Hoy abierto · 13:00 – 23:30") — no hay campo de horarios en el schema. Requiere nueva migración.
- **Mapa "Cómo llegar"** — requiere lat/lng en el schema + integración Google Maps / Mapbox.
- **Botón "Cómo llegar"** en headline — depende de coordenadas.
- **Reviews con avatar real + fecha relativa** — avatar muestra inicial fija; fecha relativa requiere librería (date-fns) o helper.
- **Botón "Compartir"** — Web Share API, bajo impacto, post-MVP.
- **URL amigable en `/perfil-negocio/`** — actualmente usa CUID2. Requiere campo `businessSlug` en `User`.
