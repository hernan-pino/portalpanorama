# ROADMAP — Portal Panorama

Documento central de seguimiento del proyecto.

---

## 📍 ESTADO HOY (2026-06-01)

### Dónde estamos

- **El sitio funciona y está desplegado** en `portal-panorama.vercel.app`.
- La BD (Neon PostgreSQL) **solo tiene el seed inicial**: 6 categorías, 1 admin, 6 listings de ejemplo. **No hay datos reales.**
- El intento de importar 1449 lugares desde Excel **se ejecutó una vez pero ya no está en la BD**. Las fotos de Google nunca cargaron (API key da 4xx).

### Decisión actual (importante)

El usuario decidió **pausar la importación de datos** y **rediseñar el modelo del producto desde lo conceptual** antes de cargar más lugares.

Motivos: el modelo actual mezcla "panorama" (lugar permanente) y "evento" (temporal) en una sola entidad `Listing`, sin sub-tipos definidos y con campos que aplican a unos lugares y a otros no. Cargar 1449 lugares con un modelo poco claro genera más problemas que valor.

### Próximo paso inmediato

1. Responder las preguntas de **[PRODUCTO.md](PRODUCTO.md)** — definir qué es el producto, qué entidades tiene, qué MVP queremos.
2. Con esas respuestas, **rediseñar el schema de BD** (panorama vs evento separados, sub-tipos, campos comunes vs específicos).
3. Migrar / resetear la BD al modelo nuevo.
4. Cargar lugares **a mano** (sin import masivo) hasta validar el concepto.

### Qué se descartó del Paso 8

- **Script de import desde Excel** (`import-from-excel.ts`) — ❌ eliminado
- **Script de fix de fotos** (`fix-photos.ts`) — ❌ eliminado
- **Deps `@vercel/blob` y `xlsx`** — ❌ eliminadas
- **Carpeta `datosNegoios/`** (Excel fuente) — ❌ eliminada
- **Comando `npm run db:import`** — ❌ eliminado

### Qué quedó del Paso 8 (a revisar cuando rediseñemos modelo)

Estos archivos siguen en el código y **están enchufados al flujo de la app**. Se revisan/borran/refactorizan en la **Fase 9** cuando ya tengamos el modelo nuevo:

- `src/application/ports/GoogleReviewRepository.ts`
- `src/infrastructure/db/PrismaGoogleReviewRepository.ts`
- `src/domain/listing/ListingAttributes.ts`
- `src/domain/shared/Communes.ts`
- Campos en schema: `commune`, `googlePlaceId`, `googleRating`, `googleReviewCount`, `attributes`, modelo `GoogleReview`
- Referencias a estos campos en use cases, search, página de lugar

### Bloqueos activos

- 🚫 **API key de Google Maps** para fotos da 4xx. No es bloqueante por ahora porque ya no vamos a importar desde Google — pero si en el futuro decidimos integrarnos a Google Places, hay que arreglar la key (restricciones IP/Referer, habilitar Places API New, o cuota).

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
**Estado:** ✅ COMPLETADO
**Qué se hizo:**
- Repo transferido a hernan-pino/portalpanorama (privado)
- Proyecto creado en Vercel, conectado a GitHub (deploy automático en cada push a main)
- 10 env vars configuradas en producción (Flow con placeholders, Resend pendiente)
- Fix: `postinstall: prisma generate` para que Vercel genere el cliente Prisma
- Fix: Next.js 15.3.2 → 15.5.18 (CVE-2025-66478, Vercel bloqueaba versiones vulnerables)
- Fix: prop `userName` no usada eliminada de MobileNav (error ESLint en build)
**URL producción:** https://portal-panorama.vercel.app
**Commit de cierre:** 067083f

---

## Fase 8 — Pre-launch: Consumer-Only + Datos Reales

**Objetivo:** Dejar el sitio listo para el primer wave de usuarios reales.
- Scope consumer-only (sin flujo de negocios público)
- Datos reales de Google Maps (1000+ negocios, Santiago completo)
- Mobile polish en los puntos identificados
- Schema extensible por categoría (`attributes JSONB`)

**Contexto clave:**
- El site es ahora un directorio de consumo puro: buscar, guardar, reseñar
- Los CTAs de "Listar mi local" se eliminaron del sitio público
- Los tabs placeholder se simplifican: solo lo que funciona queda activo
- El schema se extiende con `lat`, `lng`, `businessHours`, `googlePlaceId`, `attributes`

---

### Paso 8.1 — Consumer-only en todo el sitio + header mobile fix
**Estado:** ✅ COMPLETADO
**Archivos:**
- `src/components/layout/Header.tsx` — quitar "Listar mi local/negocio", wrapper `.topbar__auth`, solo "Iniciar sesión" para invitados
- `src/components/layout/MobileNav.tsx` — quitar CTAs de listar, solo "Iniciar sesión" para invitados
- `src/app/globals.css` — `.topbar__auth { display: none }` en ≤960px (fix overflow), `overflow-x: hidden` en html/body
- `src/app/(main)/page.tsx` — sección `biz-cta` comentada (FASE 9), no eliminada
- `src/components/layout/Footer.tsx` — "Negocios" → "Cuenta" (Registrarse + Iniciar sesión)
- Nav desktop y mobile: link "Planes" comentado (FASE 9)
**Commit de cierre:** 3596349

---

### Paso 8.2 — Cleanup UI: tabs placeholder + footer mobile + eventos
**Estado:** ✅ COMPLETADO
**Archivos:**
- `src/app/globals.css` — footer 600px: padding reducido, brand-display 40px fijo, footer__bottom apilado vertical
- `src/app/(main)/eventos/page.tsx` — reemplazado por página "Próximamente" estática (sin container ni search)
- `src/app/(main)/mi-cuenta/SidebarNav.tsx` — Historial eliminado del nav; Listas y Eventos con badge "Pronto"
- `src/app/(main)/mi-cuenta/tabs/Listas.tsx` — mock data eliminado, placeholder "Próximamente" coherente con TabEventos
**Commit de cierre:** da13423

---

### Paso 8.3 — Schema migration: geo + horarios + atributos por categoría
**Estado:** 🔁 EN REVISIÓN — código hecho, pero el modelo se va a rediseñar en Fase 9 (ver "Estado hoy" arriba)
**Estado original:** ✅ COMPLETADO
**Archivos:**
- `src/infrastructure/db/prisma/schema.prisma` — +8 campos en `Listing` (lat, lng, commune, businessHours, googlePlaceId, googleRating, googleReviewCount, attributes JSONB) + modelo `GoogleReview` + índices compuestos
- `src/domain/listing/ListingAttributes.ts` — tipos TS para `attributes` JSONB
- `src/domain/shared/Communes.ts` — 24 comunas RM como const array
- `src/domain/listing/Listing.ts` — campos googleRating, googleReviewCount, commune en entidad
- `src/infrastructure/db/PrismaListingRepository.ts` — mapper actualizado, neighborhood soft-fail
**Commit de cierre:** a524149

---

### Paso 8.4 — Import pipeline Google Maps → BD
**Estado:** 🔁 EN REVISIÓN — script eliminado el 2026-06-01. La estrategia "import masivo desde Google" se descartó. Ver "Estado hoy" arriba.
**Estado original:** ✅ COMPLETADO
**Archivos nuevos/modificados:**
- `src/infrastructure/db/scripts/import-from-excel.ts` — upsert 1449 listings por googlePlaceId, fotos a Vercel Blob, GoogleReview delete+recreate, mapeo 32 keywords → 8 categorías
- `src/application/ports/GoogleReviewRepository.ts` — port GoogleReviewRepository (GoogleReviewDTO)
- `src/infrastructure/db/PrismaGoogleReviewRepository.ts` — implementación
- `src/application/listing/GetListingWithReviewsUseCase.ts` — googleReviews en output, Promise.all paralelo
- `src/application/ports/SearchService.ts` — commune + isGoogleRating en tipos
- `src/infrastructure/search/PostgresFTSSearchService.ts` — filtro commune + fallback Google rating (×2 escala 1-10)
- `src/lib/parseSearchParams.ts` — parsea ?comuna=
- `src/components/listing/ListingCard.tsx` — badge "G" cuando isGoogleRating
- `src/app/(main)/explorar/page.tsx` — filtro ?comuna=
- `src/app/(main)/lugar/[slug]/page.tsx` — sub-sección Google reviews
- `src/lib/container.ts` — wire PrismaGoogleReviewRepository
- `package.json` — script db:import, deps @vercel/blob + xlsx
**Resultado import:** 1399 creados, 50 actualizados, 0 skipped, 6559 reseñas
**Commit de cierre:** a524149

---

### Paso 8.4.1 — Fixes post-import: categorías, deploy, Google reviews UI
**Estado:** 🔁 EN REVISIÓN — script `fix-photos.ts` eliminado el 2026-06-01. El filtro de Google reviews en la UI sigue activo (se revisa en Fase 9).
**Estado original:** ✅ COMPLETADO
**Qué se hizo:**
- `src/domain/shared/Categories.ts` — agregados 5 slugs del import (outdoor, cultura, vida-nocturna, entretenimiento, deportes) que faltaban; sin ellos `isValidCategorySlug()` descartaba la mayoría de los filtros
- `src/infrastructure/db/scripts/import-from-excel.ts` — `let` → `const` (ESLint estaba bloqueando el deploy en Vercel)
- `src/infrastructure/db/scripts/fix-photos.ts` (nuevo) — reimporta fotos con `?key=GOOGLE_MAPS_API_KEY&maxWidthPx=800`
- `src/app/(main)/lugar/[slug]/page.tsx` — ícono real de Google (4 colores) en avatar + filtro `rating >= 4` en Google reviews
- `src/app/globals.css` — `.review__avatar--google` con fondo claro y borde
**Resultado fix-photos:** 0/1386 success — la API key sigue dando 4xx (revisar restricciones de key en Google Cloud Console)
**Commits:** 2a76f9a (categorías) · f4155ec (eslint + script fotos) · 4a45992 (Google reviews UI)

---

### Paso 8.5 — QA + deploy datos reales
**Estado:** ❌ CANCELADO — la estrategia de "1000+ listings importados de Google" se descartó. Reemplazado por Fase 9.

---

### Paso 8.6 — Mobile QA final
**Estado:** ⏸️ POSPUESTO — se hace después de que el modelo nuevo (Fase 9) esté listo y haya datos reales para revisar.

---

### Paso 8.7 — Limpieza parcial del import descartado
**Estado:** ✅ COMPLETADO (2026-06-01)
**Qué se hizo:**
- Eliminados `src/infrastructure/db/scripts/import-from-excel.ts` y `fix-photos.ts`
- Eliminadas deps `@vercel/blob` y `xlsx` de `package.json`
- Eliminado script `db:import` de `package.json`
- Eliminada carpeta `datosNegoios/` (Excel fuente)
- `.gitignore` actualizado con `.env.vercel`, `datosNegoios/`, `.claude/scheduled_tasks.lock`
- Typecheck verificado sin errores
**Commit de cierre:** (pendiente — se commitea junto con la reorganización de docs)

---

## Fase 9 — Rediseño del producto (en preparación)

**Objetivo:** redefinir conceptualmente qué es Portal Panorama, qué entidades tiene, y qué entra al MVP. Después, alinear el código (schema, dominio, UI) al modelo nuevo.

**Disparador:** completar las respuestas de [PRODUCTO.md](PRODUCTO.md).

---

### Paso 9.1 — Responder PRODUCTO.md
**Estado:** 🔄 EN CURSO (esperando que el usuario responda las preguntas)
**Qué hay que hacer:** El usuario responde los 11 bloques de preguntas en [PRODUCTO.md](PRODUCTO.md). Conversamos juntos y refinamos hasta tener:
- Una visión de 1 párrafo del producto
- Un modelo de entidades definitivo (panorama vs evento, sub-tipos, campos comunes vs específicos)
- Un scope de MVP chico y claro
- Un plan de 3 fases máximo
**Commit de cierre:** —

---

### Paso 9.2 — Diseñar el schema nuevo
**Estado:** ⬜ PENDIENTE (depende de 9.1)
**Qué hay que hacer:**
- Decidir si `Listing` se separa en `Place` + `Event` o se mantiene unificado
- Decidir sub-tipos de `Place` (restorán, bar, museo, etc.) y sus campos específicos
- Decidir qué campos del modelo actual se conservan, cuáles se borran, cuáles se renombran
- Escribir el nuevo `schema.prisma`
- Documentar la decisión en `ARCHITECTURE.md`
**Archivos a modificar:** `src/infrastructure/db/prisma/schema.prisma`, `ARCHITECTURE.md`, archivos en `src/domain/`
**Commit de cierre:** —

---

### Paso 9.3 — Migrar la BD al modelo nuevo
**Estado:** ⬜ PENDIENTE (depende de 9.2)
**Qué hay que hacer:**
- `prisma migrate reset` en local (borra todo, parte limpio)
- Generar nueva migración con `prisma migrate dev`
- Actualizar `seed.ts` con datos coherentes al modelo nuevo
- En producción (Neon): `prisma migrate deploy` cuando esté validado en local
**Riesgo:** destructivo. La BD se borra. Pero como solo hay seed data, no hay pérdida real.
**Commit de cierre:** —

---

### Paso 9.4 — Refactorizar dominio, use cases y UI al modelo nuevo
**Estado:** ⬜ PENDIENTE (depende de 9.2)
**Qué hay que hacer:**
- Adaptar entidades en `src/domain/` al modelo nuevo
- Adaptar use cases en `src/application/`
- Adaptar páginas y componentes en `src/app/` y `src/components/`
- Borrar lo que ya no aplica (probablemente: `GoogleReviewRepository`, `ListingAttributes`, campos en schema, sub-sección de Google reviews en la ficha)
- Decidir qué hacer con `Communes.ts` (probablemente se queda — las comunas RM son útiles igual)
- Verificar typecheck + tests
**Commit de cierre:** —

---

### Paso 9.5 — Cargar lugares a mano + validar
**Estado:** ⬜ PENDIENTE (depende de 9.3 y 9.4)
**Qué hay que hacer:**
- Crear formulario admin para cargar lugares uno por uno (o usar `prisma studio` al principio)
- Cargar 10-30 lugares reales bien curados
- Verificar que las búsquedas, filtros, ficha y dashboards funcionan con el modelo nuevo
- Smoke test en producción
**Commit de cierre:** —

---

## Estados posibles de cada paso

| Símbolo | Significado |
|---------|------------|
| ⬜ PENDIENTE | No empezado |
| 🔄 EN CURSO | Trabajo activo |
| ✅ COMPLETADO | Cerrado, commit registrado |
| ⚠️ BLOQUEADO | Esperando decisión o dependencia externa |
| 🔁 EN REVISIÓN | Código existe pero se va a rediseñar; ver nota del paso |
| ❌ CANCELADO | Se descartó; ver nota del paso |
| ⏸️ POSPUESTO | Se hace más adelante, no aplica ahora |

---

## Entorno de desarrollo

- **DB:** Neon PostgreSQL (ver `.env.local` para string de conexión)
- **Dev server:** `npm run dev` → `http://localhost:3000`
- **Seed:** `npx prisma db seed` (idempotente)
- **Migrations:** `npx prisma migrate dev`
- **Tests:** `npm test`
- **Seed actual:** 6 categorías, 1 admin (admin@portalpanorama.cl / admin1234), 6 listings publicados

## Preguntas abiertas / decisiones pendientes

- ~~`UserList` en schema~~ — no existe. Tab "Listas" en `/mi-cuenta` queda como placeholder hasta diseñar la feature (requiere migración + use case).
- ~~Credenciales Flow sandbox~~ — deploy con vars placeholder, activar cuando estén disponibles.
- ~~Dominio final~~ — usar subdominio Vercel (`portal-panorama.vercel.app`) por ahora; apuntar dominio propio después.
- Banner de credenciales dev en `/login` — borrar antes del deploy a producción (Paso 7.10)
- Deuda técnica: rate limiting de reseñas — la restricción una-reseña-por-usuario-por-listing YA está en CreateReviewUseCase. Falta protección contra spammer que reseña muchos listings distintos en ráfaga. Resolver post-MVP con Upstash Ratelimit.
- ~~Error TS preexistente: `subscription.test.ts:86`~~ — resuelto en commit e994aaf.

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
- **Reseñas de Google Maps** — ✅ implementado en Paso 8.4: modelo GoogleReview separado, sub-sección en ficha, 6559 reseñas importadas.
- **Deuda técnica (Paso 8.4):** normalización Google rating (×2 escala 1-10) vive en `PostgresFTSSearchService` — si se agrega Meilisearch, deberá replicarse. Mover al contrato del port como nota cuando se implemente Meilisearch.
- **Seguridad pendiente (Paso 8.4):** `uploadPhotoToBlob` en el script de import no valida el hostname de la URL antes del fetch (SSRF si se entrega un Excel malicioso). El script corre localmente y no en CI, riesgo bajo por ahora. Fix: allowlist de hostnames permitidos antes del fetch.
- **Seguridad pendiente (Paso 8.4):** `?comuna=` acepta cualquier string hasta 60 chars sin allowlist (a diferencia de `barrio` y `categoria`). No es SQL injection (Prisma parametriza), pero permite enumeración. Fix: validar con `isValidCommune()` en `parseSearchParams.ts`.
- **Arquitectura pendiente (Paso 8.4.1):** filtro `googleReviews.filter(gr => gr.rating >= 4)` en `lugar/[slug]/page.tsx` es lógica de negocio (umbral de calidad) en presentation. Mover al use case `GetListingWithReviewsUseCase` o como constante de dominio `GOOGLE_REVIEW_MIN_RATING = 4`.
- **Seguridad pendiente (Paso 8.4.1):** `fix-photos.ts` tiene 3 vulnerabilidades — (a) SSRF: no valida host antes del fetch (allowlist `maps.googleapis.com`, `lh3.googleusercontent.com`); (b) API key en URL puede aparecer en logs si se agrega logging futuro al catch; (c) `slug` desde BD no se re-sanitiza antes del path en Blob. Mitigado por contexto: corre localmente, no en CI, con datos conocidos.
- **Feature pendiente — ranking por rating + cantidad de reviews:** el usuario quiere que listings con mismo rating se ordenen por cantidad de reviews (ej: 4.5 con 700 reviews antes que 4.5 con 10). Implementar como nuevo campo computado (Bayesian average o weighted score) en `Listing` o en `SearchResultItem`.
- **Bloqueo activo — fotos:** la API key de Google Maps devuelve 4xx en todas las URLs (`places.googleapis.com/v1/places/.../photos/...`). El script `fix-photos.ts` no logró subir ninguna foto. Posibles causas: restricción de IP/Referer en la key, falta de habilitar Places API (New), o cuota agotada.
