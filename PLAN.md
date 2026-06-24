# PLAN — Portal Panorama (plan vivo)

**La fuente de verdad del trabajo desde hoy.** Estado actual, lo que falta para lanzar, y el backlog
priorizado. Se actualiza cada vez que avanzamos. Liviano a propósito — para retomar rápido.

- **Qué es el producto / por qué (norte permanente):** [PRD.md](PRD.md)
- **Seguimiento de pasos:** [ROADMAP.md](ROADMAP.md)
- **Modelo de datos:** [SCHEMA.md](SCHEMA.md) · **Capas:** [ARCHITECTURE.md](ARCHITECTURE.md) · **Carga:** [PLANTILLA_CSV.md](PLANTILLA_CSV.md)
- **Bitácora del rediseño (historia + razonamiento de las decisiones):** [PLAN_FASE9.md](PLAN_FASE9.md)

**Última actualización:** 2026-06-24 (sesión 6 — **cierre de lanzamiento + analítica**):
**(1) Dominio `portalpanorama.cl` conectado** — apex = Production, `www` → 308 al apex; DNS en Cloudflare
(CNAME `@` → `…vercel-dns-017.com`, DNS only; los 4 registros de Resend intactos); ambos en Valid Configuration.
`NEXT_PUBLIC_BASE_URL=https://portalpanorama.cl` en Vercel (confirmado vía sitemap en vivo). **(2) GA4 vivo** —
`G-GP1SGZSJ5Q` cableado vía `components/analytics/GoogleAnalytics.tsx` (gtag.js + `next/script`, sin
`@next/third-parties` para no tocar el lockfile), apagado salvo `NEXT_PUBLIC_GA_ID`. **Eventos custom**
(`lib/analytics.ts` → `trackEvent`, no-op si GA bloqueado): `guardar_lugar`, `click_como_llegar` (nuevo
`DirectionsLink`), `compartir_lugar`, `buscar` (search_term), `reportar_lugar`, `sign_up` (modal bienvenida),
`login` (`LoginEventTracker` vía `?ingreso=1`). **(3) Cambiar contraseña logueado** — `ChangePasswordUseCase`
(verifica actual, valida fuerza, distingue OAuth sin pass), `findPasswordHash`/`exists` en UserRepo+Prisma,
sección Seguridad en el tab Perfil con medidor. **(4) Emails con la marca** — plantilla `emailLayout.ts`
(tabla+inline, wordmark, CTA) en bienvenida+reset. Commits: `a512da7`, `3d72658`. 92 tests verdes.
**Falta del usuario (no código):** marcar eventos clave en GA4; **Rate Limit en Vercel Firewall** (`/lugar/*`,
`/explorar`); **resolver los PENDING_REVIEW** (Tengu, Distrito Pop, NOSU/NoSo). Próximo gran hito: el **C.
reevaluación post-MVP** (monetización / próxima feature / go-to-market).

**Sesión previa:** 2026-06-23 (sesión 5 — **prep de deploy, bloque de código sin cuentas externas**):
**(1) Fuerza de contraseña** — política pura `domain/user/PasswordPolicy.ts` (mín. 8 + letra + número para
registrar; score 0-4 premia largo/mayús/símbolos), compartida por el Zod del registro y un **medidor visual**
en vivo (`(auth)/PasswordMeter.tsx`). +6 tests → **92 verdes**. **(2) Recuperar contraseña** — flujo hexagonal
completo: model `PasswordResetToken` (guarda el **hash** del token, single-use `usedAt`, expira 1h), ports
`PasswordResetTokenRepository` + `TokenGenerator`, use cases `RequestPasswordResetUseCase` (respuesta genérica
anti-enumeración) + `ResetPasswordUseCase`, infra `PrismaPasswordResetTokenRepository` + `CryptoTokenGenerator`
(sha256) + `EmailService.sendPasswordReset` + `UserRepository.updatePassword`, páginas `/recuperar` y
`/recuperar/nueva` + link en login + aviso `?reset=1`. **Inerte hasta que llegue la key de Resend** (si el email
falla no rompe ni filtra). **(3) Google cableado pero APAGADO** — provider en `lib/auth.ts` gated por
`googleAuthEnabled` (se enciende solo si existen `AUTH_GOOGLE_ID`+`AUTH_GOOGLE_SECRET`); upsert de User por email
para OAuth; botón "Continuar con Google" condicional (respeta la regla MVP). **(4) Anti-scraping** — limiter
**durable con Upstash** (`lib/rateLimit.ts` → `rateLimitDurable`, REST pipeline INCR+PEXPIRE NX, falla abierto,
cae a memoria sin envs), aplicado a `/api/suggest` (60/min/IP) + migradas las actions registro/reset/reporte.
Payloads ya capados (suggest=6, explorar=24). **Verificado contra la instancia Upstash real.** Rate-limit de
páginas (`/lugar`,`/explorar`) se deja a **Vercel Firewall** (edge, sin quemar cuota free). **(5) Migraciones
Prisma adoptadas** — baseline `0_init` (schema completo, 675 líneas) generado y `migrate resolve --applied`;
local en sync. Prod hará `migrate deploy` limpio. **(6) Borrado** el bloque "DEV — credenciales" del login
(estaba marcado "borrar antes de deploy"). Typecheck limpio. **Upstash configurado** (`.env.local`). **En curso
fuera del código:** dominio **portalpanorama.cl** → nameservers movidos a **Cloudflare** (agustin/brynne) para
poder cargar los registros DNS de **Resend**; esperando propagación. **Pendiente de cuentas del usuario:** Resend
(key + dominio verificado), Google OAuth (client id/secret), Neon prod + env vars en Vercel. **Sin commit todavía.**

**🚀 DEPLOY A PRODUCCIÓN — LIVE (2026-06-23).** La app está **viva** en `portal-panorama.vercel.app`
con los 214 lugares publicados. Camino recorrido en esta sesión: **Resend** dominio `contacto.portalpanorama.cl`
verificado (DNS en Cloudflare, nameservers movidos desde NIC) + envío real OK; **Upstash** configurado;
**Google OAuth** creado y funcionando en prod; **Neon prod = branch `prod`** clonado del branch `production`
(trae los 214 lugares + catálogos + admin + historial de migración, sin migrate/seed manual); **env vars**
cargadas en Vercel (Production); commits pusheados a `main` (estaba 79 commits atrás → subió todo el rediseño
Fase 9 de una). **Tres fixes de prod resueltos en vivo:** (1) `trustHost: true` en NextAuth (sin él, `UntrustedHost`
→ 500 en toda la app porque el Header del layout llama `auth()`); (2) **sharp** no cargaba en linux-x64
(`libvips-cpp.so` missing) → `serverExternalPackages: ['sharp']` + binarios linux agregados al `package-lock.json`
(el lock se había generado en Windows); (3) `AUTH_SECRET` mal cargada en Vercel (corregida por el usuario).
**Pendiente del lanzamiento:** conectar dominio `portalpanorama.cl` (hoy en `*.vercel.app`); **regla de Rate
Limit en Vercel Firewall** para `/lugar`+`/explorar`; **GA4** (analytics, lo quería para el lanzamiento);
estilizar los **emails** con la marca; resolver los **2-3 PENDING_REVIEW**; **mejoras de diseño** (ver backlog).

**Sesión previa:** 2026-06-22 (sesión 4 — parte 2: **Lote oriente cargado — +61 lugares**
[58 en la 1ª pasada + 3 que reintenté tras recortar tags; Pub Golden Music ya existía del Lote 4 →
saltado sin duplicar]. Ataca la concentración Santiago+Providencia [77%] metiendo **Las Condes,
Vitacura, Lo Barnechea, Ñuñoa** + la subcat más flaca **Restaurante** [+30: 6 cocinas × 5] + cafés,
bares, **Cervecería y Mercado/Patio** [estaban en 0], termas, Buin Zoo, Mapulemu, galerías y teatros.
**Catálogo:** se agregó la subcat **Teatro** a *Arte y cultura* [decisión del usuario; sincronizada en
seed + skill `ficha-lugar`] y **5 barrios** al seed [El Golf, Las Tranqueras, Alonso de Córdova, La
Dehesa, Pedro de Valdivia Norte]. **3 en PENDING_REVIEW**: Tengu [muy nuevo, 32 reseñas], Distrito Pop
[pocas reseñas], NOSU/NoSo [conflicto nombre/comuna: el W Santiago es Las Condes no Vitacura, y el resto
se llama NoSo → revisar]. Flujo: 5 corridas del agente `investigador-lugares` con place_ids provistos →
`ingest-fichas` → `enrich --no-coords --with-photos` [coords + fotos de Google, exacto por place_id;
corriendo]. **TOTAL BD: ~211 publicados.** 3 duplicados del Lote 3/4 descartados antes de cargar [RBX,
Patricia Ready, Caupolicán]. Cambios de código sin commit todavía.)

**Sesión previa:** 2026-06-22 (sesión 4 — parte 1: **backfill de coordenadas completo** — los **158
lugares no-archivados ahora tienen lat/lng** [antes faltaban 66: 65 publicados + 1 en revisión]. Vía
flag nuevo `--no-coords` en `enrich-ratings.ts` [apunta solo a los no-archivados sin coords; implica
`--force`, nunca pisa coords curadas — verifica `!place.hasCoordinates()`]. 66/66 con coords, 0 sin
match. El único flag `⚠️ REVISAR` fue el hijo **Happyland Mall Sport**, que matcheó otra sucursal de
la cadena [Happyland Alto Las Condes, Kennedy 9001] — resultó **espurio** [Mall Sport no tiene Happyland;
era un Funtopia que ya no opera] → **borrado** [`DeletePlaceUseCase`]. Mall Sport [padre] quedó intacto
y con coords propias correctas. **→ 153 publicados, 157 no-archivados con coords.** Costo Apify ~$0.44
[66 × ~$0.0067]; saldo del mes: **$3.46/$5 usados → ~$1.54 libres**.
**Insight (cadenas vs. contención):** padre e hijo NO comparten place_id ni coords — cada negocio es su
propia ficha de Google con su pin. El riesgo de mismatch no es la contención sino las **cadenas**
[mismo nombre, muchas sucursales]; el enrich ya pasa la dirección para desambiguar y marca `⚠️ REVISAR`
cuando el nombre no calza. Cambio del script sin commit todavía.)

**Sesión previa:** 2026-06-21 (sesión 3: **Lote 4 cargado — +48 lugares → 160 total** [154
publicados] atacando las 2 categorías flacas: **Juegos y diversión 1→27** y **Vida nocturna 7→26**
publicados [karaokes, escape rooms, arcades, billares, VR, discotecas, clubes de jazz, salas de
conciertos]. Vía 5 corridas del agente `investigador-lugares` → ingesta → enrich `--force --with-photos`.
Las 48 con **coordenadas + fotos** de Google Maps. Marcas nuevas: FUGA Escape Room, Insert Coin Bar.
3 en PENDING_REVIEW [Caleido cerrada, Salón de Pool, Pool Hall Room 9]. Duplicados descartados: Blondie,
La Batuta. **Enrich ahora captura lat/lng** [nueva mejora cableada port→adapter→entidad→use case, no pisa
coords curadas; +2 tests → 86 verdes]. Barrio Universitario agregado al seed [Japimax]. Bar El Bajo →
hijo del GAM. Commiteado en `e3eeea5`.)

**Sesión previa:** 2026-06-21 (sesión 2: **lado usuario cerrado** — vista de detalle de listas
guardadas con gestión; dashboard a 3 tabs reales; **popup de compartir** con redes; **perf de ficha**
[recordVisit con `after()` + queries en paralelo]. Commits: `03ce143`, `455a9e3`, `33d5a05`)

---

## ▶️ PRÓXIMA SESIÓN (anotado 2026-06-23, post-deploy)

**La app ya está LIVE** en `portal-panorama.vercel.app`. Lo que queda, en orden sugerido:

**A. Cerrar el lanzamiento del MVP (terminar el deploy "completo"):**
1. **Conectar el dominio `portalpanorama.cl`** 🔄 **EN CURSO (2026-06-23, sesión 6)** — dominio agregado en
   Vercel (apex = Production, `www` → 308 al apex), DNS cargado en **Cloudflare** (CNAME `@` →
   `25c484b02719a924.vercel-dns-017.com`, DNS only; los 4 registros de Resend intactos). Ambos dominios en
   **Valid Configuration ✓**; SSL de `www` generándose. **Falta del usuario:** setear `NEXT_PUBLIC_BASE_URL`
   = `https://portalpanorama.cl` en Vercel (Production) + redeploy. La redirect URI de prod de Google ya
   está registrada (`portalpanorama.cl/api/auth/callback/google`).
2. **GA4 (analytics)** — ✅ **código cableado (2026-06-23, sesión 6):** `components/analytics/GoogleAnalytics.tsx`
   (gtag.js vía `next/script`, **sin** `@next/third-parties` para no tocar el lockfile en Windows), apagado
   salvo que exista `NEXT_PUBLIC_GA_ID` (leído en `lib/analytics.ts`). **Falta del usuario:** crear la propiedad
   GA4 + Data Stream web → poner `NEXT_PUBLIC_GA_ID` en Vercel. Pixels (Meta/Google Ads) recién cuando se paute.
3. **Regla de Rate Limit en Vercel Firewall** para `/lugar/*` y `/explorar` (anti-scraping a nivel edge;
   el rate-limit de app ya está con Upstash en /api/suggest + actions).
4. **Emails con la marca ✅ HECHO (2026-06-23, sesión 6)** — plantilla branded compartida
   `infrastructure/email/emailLayout.ts` (tabla + inline styles, wordmark "Portal *Panorama*", colores del
   handoff en hex, CTA con botón, preheader, footer); `ResendEmailService` (bienvenida + reset) la usa.
5. **Resolver los 2-3 PENDING_REVIEW** (Tengu, Distrito Pop, NOSU/NoSo) — publicar/archivar/eliminar.
6. **Cambiar contraseña estando logueado ✅ HECHO (2026-06-23, sesión 6)** — `ChangePasswordUseCase`
   (verifica la actual con `PasswordHasher.verify`, valida fuerza con `evaluatePassword`, distingue cuenta
   OAuth sin contraseña → `NoPasswordSetError`); `findPasswordHash`/`exists` en `UserRepository` + Prisma;
   `changePasswordAction`; sección **Seguridad** en el tab Perfil con `ChangePasswordForm` + `PasswordMeter`.
   92 tests verdes, typecheck limpio.

**B. Cambios de diseño (el usuario irá listando):**
- ✅ HECHO: barra de acción de la ficha (móvil) aparece al scrollear, no de entrada.
- 🔄 login/registro desktop sin scroll: el intento de scroll interno del form metía un scrollbar feo →
  se descartó eso y en su lugar se **achicó el footprint del form** (padding vertical, margen de las tabs,
  tamaño del título, márgenes del logo/subtítulo) para que entre en `100dvh - 72px` sin scroll. Verificar
  en distintos altos de ventana; si en pantallas muy bajas aún desborda, la página scrollea (fallback OK).
- Pendiente: el usuario tiene más ajustes de diseño para listar (sesión de diseño con su flujo de refs).

**C. 🧭 HITO ESTRATÉGICO — reevaluación post-MVP (pedido explícito del usuario, 2026-06-23):**
Una vez **completo el deploy del MVP** (punto A), **reevaluar todo lo definido antes de empezar a construir**,
porque el contexto cambió (producto vivo, contenido real cargado). Temas a re-decidir desde cero:
- **Monetización** — estaba parqueada (Money/Flow/self-service post-MVP). ¿Cómo y cuándo se enciende?
  ¿Qué modelo (fichas premium, destacados, suscripción de negocios, ads)? Ver PRD/PLAN_FASE9 para lo que
  estaba definido y desafiarlo.
- **Próximo paso de desarrollo** — ¿qué feature/funcionalidad sigue? (Eventos está apagado; reseñas de
  usuarios apagadas; self-service de negocios sobre Brand parqueado; "abierto/cerrado" requiere horario
  estructurado; filtros OCCASION/EXPERIENCE pendientes). Priorizar con datos reales de uso (GA4).
- **Estrategia de marketing / go-to-market** — cómo se consiguen los primeros usuarios, SEO ya está armado
  (JSON-LD/sitemap), pauta (Meta/Google Ads → ahí entran los pixels), listas curadas como landings.
- **Próximos pasos generales** — revisar el roadmap completo a la luz de tener el producto vivo.

---

## ▶️ Plan de acción — próxima sesión (recomendado)

**Hecho en la sesión 2 (2026-06-21):** ✅ cerrado el lado usuario (detalle de listas guardadas + gestión,
dashboard a 3 tabs reales) · ✅ popup de compartir con redes · ✅ perf de la ficha (recordVisit no bloquea
el render + queries en paralelo). Todo commiteado en `main` (`03ce143`, `455a9e3`, `33d5a05`).
**Pendiente transversal de todo lo anterior:** verificación e2e humana fina + **va a prod con el push**.

Orden sugerido para retomar.

1. **✅ HECHO (sesión 3) — Cargar las categorías flacas.** Juegos y diversión 1→27 y Vida nocturna 7→26
   publicados (Lote 4, +48). Siguiente densidad si se quiere: más comunas núcleo / subcategorías aún
   delgadas. Flujo validado: skill desktop "modo carga" → place_id → agente `investigador-lugares` →
   `ingest-fichas` → `enrich-ratings --force --with-photos`.
2. **✅ HECHO (sesión 4) — Backfill de coordenadas de los lugares VIEJOS.** Se agregó el flag
   `--no-coords` a `enrich-ratings.ts` (apunta solo a los no-archivados sin lat/lng; implica `--force`,
   nunca pisa coords curadas). **66/66 enriquecidos con coords, 0 sin match** → todos los no-archivados ya
   tienen lat/lng. Costo ~$0.44. El único flag REVISAR (hijo **Happyland Mall Sport**) resultó espurio y
   se borró (ver header). **→ 153 publicados.** Habilita pin/mapa y "abierto/cerca".
3. **Preparar el deploy (P0).** (a) **Anti-scraping** ANTES de publicar (ver P0 abajo: rate-limit por IP en
   rutas de catálogo + WAF/bot management + no exponer endpoint JSON masivo). (b) **Registro seguro**
   (fuerza de contraseña + verificación de email). (c) **Checklist de prod**: decidir workflow de BD
   (`db push` vs migraciones) + schema/seed en Neon prod + `RESEND_API_KEY` real + confirmar
   `BLOB_READ_WRITE_TOKEN` + redeploy con la presentation nueva.
4. **Consistencia de CSS (deuda, no bloqueante).** Design system propio: variables (`--s-x`, `--ink-100`…)
   + clases semánticas BEM en `globals.css` (~800 className). **Tailwind v4 importado pero sin usar las
   utilities** (peso muerto salvo el reset) + **~154 `style={{}}` inline** (sobre todo `mi-cuenta/*`, login,
   ProfileForm). Estandarizar en variables+clases, migrar inline recurrentes a clases, y **decidir Tailwind**.

**Optimización ya cubierta (no re-abrir sin necesidad):** ISR de la ficha quedó **descartado a propósito** —
el Header del root layout llama `auth()` (toda la app es dinámica), pero la sesión es **JWT** (sin hit a BD),
así que el costo es bajo; cachear exigiría refactor global del chrome (riesgo alto / payoff bajo). Detalle
en el backlog, ítem (e.2).

---

## 📍 Estado actual

**Fase 9 (rediseño) — Etapa 5 (cargar lugares) 🔄 en curso.**

- La app **compila completa** sobre el modelo `Place`. Etapa 4 (refactor dominio→UI) ✅: ficha,
  explorar y home reescritas con sus refs aprobadas + búsqueda con autocompletado tolerante a typos.
- **Admin CRUD de Place** construido y **verificado e2e** ✅ (lista, form crear/editar ~30 campos,
  publicar/archivar, guard ADMIN + Zod). Es la herramienta para cargar contenido.
- **Flujo de guardado** cerrado ✅ (lista "Favoritos" por defecto + corazón marcado donde ya guardaste).
- **Primera ficha real subida** por el form (2026-06-13).
- **BD local** en el schema nuevo con catálogos completos. **Prod sigue sobre el código viejo** —
  el redeploy va junto con el push de prod.
- **Sesión taxonomía (2026-06-14) ✅:** se rediseñó el catálogo. **Regla de clasificación** ("la
  categoría = por qué vas, no lo incidental"). **8 categorías** (nueva **Entretenimiento** activa para
  venues nocturnos/actividad; la event-only pasó a *Shows y espectáculos*). **6 capas de tags** (antes
  4): `AUDIENCE` (¿con quién?, máx 4) · `OCCASION` (Ideal para, máx 3) · `VIBE` (máx 3) · `EXPERIENCE`
  (incl. `vida nocturna`) · `SERVICE` · `SPECIFIC`. Topes solo en las subjetivas. Decisión registrada:
  cuando se enciendan Eventos, un Place podrá tener su cartelera en su propia ficha (como las fichas
  hijo). Código migrado (12 archivos, compila) + BD local reseedeada. Detalle en [PRD.md](PRD.md).
- **Tests de dominio (2026-06-15) ✅:** primera suite real — **59 tests Vitest** (puros, sin BD,
  <1s) sobre las invariantes críticas: `Score.bayesian` (orden por defecto de la búsqueda), topes de
  tags por capa, anti-ciclo de contenedores, transiciones de estado de `Place`, ownership de
  colecciones (anti-IDOR), VOs `Slug`/`Email` y matching fuzzy. Colocados como `*.test.ts` junto al
  código. Corre con `npm test` o la skill **`/tests`**. Typecheck y `next build` siguen limpios.

---

## 🔎 Auditoría de código (2026-06-15)

Revisión objetiva completa (arquitectura, BD, flujo, seguridad). **Veredicto: el código está bien** —
capas hexagonales respetadas de punta a punta, typecheck limpio, build OK, auth y ownership sólidos
(sin IDOR). Lo que falta no son bugs sino **infra de lanzamiento** + **drift de docs**. Hallazgos
volcados al backlog y al checklist de abajo. Los principales:

- **SEO de ficha inexistente** (era diferenciador del producto): sin JSON-LD, sin `sitemap.ts`/
  `robots.ts`, sin canonical/OG, y **todo renderiza dinámico** (no hay ISR pese a lo que dice
  ARCHITECTURE.md → "SEO"). Ítem (e), ahora bloqueante.
- **Drift de documentación** (corregir; confunde a quien retome con la skill `retomar`):
  `SCHEMA.md` aún describe 4 capas de tags y 7 categorías (real: **6 capas, 8 categorías**);
  el comentario header de `schema.prisma:15` dice "4 capas"; `ARCHITECTURE.md` afirma que el código
  "todavía está sobre `Listing`" (falso, ya migrado) y que las rutas se protegen por `middleware`
  (no existe `middleware.ts`; se hace por layout + re-chequeo en cada action). `lib/config.ts` es
  **código muerto** (nadie lo importa; expone `flowPlanId` de Flow, parqueado) → borrar.
- **Sin rate-limiting** en `reportPlaceAction` (anónimo puede spamear) ni en registro (bots).
- **Faltan `error.tsx` / `loading.tsx` / `not-found.tsx` custom** (solo el default de Next).

---

## ✅ Resueltos recientes (2026-06-20)

- **Bar Flama: las dos sucursales reales son Providencia + Lastarria.** La ficha estaba como "Bar Flama
  (Merced)" pero su contenido describe el bar de Lastarria (pin del usuario: -33.4374816, -70.6420574,
  a ~250 m de Merced 346). Se **renombró** "Bar Flama (Merced)" → **Bar Flama (Lastarria)** (slug
  `bar-flama-lastarria`) y se afinaron las coords al pin, en vez de borrarla (habría dejado solo
  Providencia). Quedan 2 bajo la marca `bar-flama`: Providencia + Lastarria. **Re-enriquecido (2026-06-21) ✅:**
  Apify confirmó el match (Bar Flama · Merced 346, sin flag de revisar), rating **4.5/673**, score 4.51,
  place_id correcto; se borró la foto vieja y se rehospedaron **3 fotos de Google Maps** al Blob.
- **"Cómo llegar" ahora apunta a la ficha de Google del negocio.** Antes el link usaba solo la dirección
  en texto (`destination=<dir>`), que Google a veces geocodifica a un punto. Ahora prefiere el **place_id**
  (`destination_place_id`) cuando existe → abre las indicaciones a la ficha exacta del lugar; cae a
  dirección y luego a coords. Se expuso `googlePlaceId` en el read-model `PlaceDetailView` (ficha pública
  + preview admin). Typecheck OK, verificado en runtime.

- **Filtro "¿Dónde?" con "Ver más" (2026-06-21) ✅.** Comuna y Barrio listan muchas opciones; ahora
  muestran solo las **3 con más resultados** y un link **"Ver más (N)"** que revela el resto (toggle a
  "Ver menos"). `CollapsibleChipSet` ordena por count desc y, si la opción activa queda oculta, arranca
  expandido. Metro queda igual (pocas líneas). En `Filters.tsx` + estilo `.filter-more`.

## ▶️ Próximos pasos (en orden)

> **✅ Brand (MVP mínimo) CONSTRUIDO + e2e OK (2026-06-18) — solo falta prod.** Entidad `Brand` de punta a
> punta: schema (model Brand + `brandId` en Place **y** Event, db push local OK), dominio
> (`Brand` aggregate), aplicación (port `BrandRepository` + use cases create/update/getPage/forEdit/
> listForAdmin + `BrandPageView`), infra (`PrismaBrandRepository` + `brandId` en PrismaPlaceRepository),
> presentation (admin CRUD `/admin/marcas`, selector "Marca" en el form de Place, bloque "Por [Marca] ↗"
> en la ficha, página pública `/marca/[slug]` con grilla de locales + JSON-LD Organization). Typecheck +
> 84 tests verdes; rutas compilan sin error. **e2e OK (2026-06-18)** (marcas reales creadas + vistas en
> `/marca/[slug]`; fix del preview de logo). Solo falta el push a prod. Decisiones en [BRAND_SPEC.md](BRAND_SPEC.md) §10.

0. **✅ HECHO (2026-06-14) — flujo de imágenes (ítem p).** Tres caminos (subir archivo · pegar URL
   permitida · "Traer" desde URL externa con guardas anti-SSRF), todos rehospedan en **Vercel Blob** y
   comprimen a `.webp`. Token de Blob arreglado en `.env.local` (store `portal-panorama-images`).
   Verificado e2e. Detalle en el backlog (p) y PLAN_FASE9.
1. **Cargar ~5 lugares reales a mano** por el form de admin, para validar el flujo end-to-end con
   contenido de verdad (incl. un caso contenedor real: Parquemet → Cerro/Zoo). (NO 100 a mano — el
   grueso va por CSV.) — **desbloqueado**: ya se puede cargar con fotos.
2. **Push a prod (Neon):** migración + seed de catálogos en la BD de producción + redeploy con la
   presentation nueva. Setear `RESEND_API_KEY` real (si no, la bienvenida no se envía).
3. **Importador CSV** (ítem h) — ⤳ **cubierto por otra vía (2026-06-14):** se construyó la
   **ingesta por agente** (ver abajo), que habilita el ritmo sin armar el CSV. El CSV queda como
   alternativa si se prefiere edición en planilla.

---

## 🤖 Carga asistida por agente — ✅ CONSTRUIDA (2026-06-14)

Flujo para cargar lugares en lote con investigación automática + revisión humana:

1. **Skill `ficha-lugar`** (`.claude/skills/`) — investiga un lugar chileno (Google Maps, sitio,
   redes, blogs) y arma la ficha respetando el catálogo actual (5 cats activas, 6 capas de tags,
   enums). Por defecto entrega Markdown; JSON solo si se pide. Incluye la **regla de cuál ficha de
   Google usar** (padre-hijo): Parquemet usa el rating del parque, el Cerro el suyo, el funicular = spot.
2. **Agente `investigador-lugares`** (`.claude/agents/`) — corre la skill para una lista de nombres y
   escribe un JSON por lugar en `tmp/fichas/`. No toca la BD.
3. **Script `scripts/ingest-fichas.ts`** — lee los JSON, resuelve nombres→IDs del catálogo (reusa
   `GetPlaceFormOptionsUseCase`), **rehospeda las imágenes** con el pipeline de "Traer", crea cada
   lugar como **PENDING_REVIEW** (borrador, nunca publica) y **reporta lo que no calza**. Tiene `--dry`
   (valida sin crear ni rehospedar). Maneja contenedores (ordena padres primero).
4. **Control humano:** se revisa y publica a mano en `/admin/lugares` (con el Preview). El gate vive
   en el admin, no en el JSON.

**Verificado e2e (2026-06-14):** dry-run resolvió todo el catálogo de una ficha; corrida real creó el
borrador con imagen rehospedada; limpieza OK. `tmp/` quedó en `.gitignore`.

---

## 🧩 Feature lugares contenedores + spots — ✅ CONSTRUIDA (2026-06-14)

Caso real al cargar fichas: Parquemet contiene Cerro San Cristóbal / Zoológico; el MUT contiene
locales. Se modeló en **dos niveles**, sin reintroducir "tipo" de Place (el padre es un Place normal
que además agrupa). Razonamiento en [PLAN_FASE9.md](PLAN_FASE9.md) (bullet "DECISIÓN CERRADA — Lugares
contenedores"). **Compila y reseed local OK; falta probarla cargando un caso real (Parquemet) por el
form, y va a prod con el push.**

1. **Hijos CON ficha** (Zoo, Cerro: tienen rating/horario y filtran solos) → `Place.parentId String?`
   self-relation, **cardinalidad 1**, `onDelete: SetNull`. Anti-ciclo: self-parent en el dominio +
   chequeo transitivo de ancestros en `UpdatePlaceUseCase` (`findAncestorIds`). UI: **1 nivel**. En la
   ficha del padre van como `PlaceCard` **variante lista** bajo "Qué hay en [X]" (distinta de "También
   te puede gustar"). En la ficha del hijo: badge "Parte de [X] ↗" (solo si el padre está publicado).
2. **Spots SIN ficha** (miradores, kioscos) → tabla `PlacePoint { id, placeId, name, description?,
   kind?, sortOrder }`. **Cuelgan de cualquier Place, incluido un hijo.** Lista de texto, sin
   filtro/reseña/link, agrupada con los hijos bajo "Qué hay en [X]".

**Qué quedó pendiente / cómo afinarlo:** el selector de padre del form lista todos los lugares y solo
excluye el propio (en edición); los ciclos transitivos los rechaza el servidor con mensaje, no la UI.
Los hijos del padre se muestran solo si están PUBLISHED.

---

## 📋 Backlog (pendientes, no bloquean el lanzamiento salvo lo marcado)

**Calidad / bloqueante de lanzamiento:**
- **(p) Flujo de imágenes ✅ HECHO (2026-06-14)** — tres caminos para poner una foto, todos terminan
  rehospedados en **Vercel Blob** y comprimidos a `.webp` (`sharp`, ≤2000px, q80): (1) **subir archivo**
  desde el form; (2) **pegar URL** de un host permitido; (3) **"Traer" desde una URL externa** (blog/web):
  el server la descarga con **guardas anti-SSRF** (bloquea IPs privadas/metadata, redirect revalidado,
  límite 15MB, timeout, valida content-type), comprime y rehospeda. Verificado e2e contra el Blob real.
  Hexagonal: ports `ImageProcessor`/`StorageService`/`ImageFetcher`, use cases `UploadPlaceImageUseCase`
  + `ImportImageFromUrlUseCase`, actions con guard ADMIN. **UploadThing** queda como alternativa no
  cableada. **Caveat anotado:** rehospedar fotos de terceros (blogs, Google Maps) es responsabilidad
  de copyright/ToS del usuario. Decisión + comparativa de costos en PLAN_FASE9.md.
- **(g) Páginas legales ✅ HECHO (2026-06-15)** — `/terminos` y `/privacidad` creadas con contenido
  real (Ley 19.628: datos, cookies, derechos ARCO, contacto). **Pendiente: revisión por abogado**
  antes de lanzar (hoy es un borrador sólido, no texto legal validado).
- **(e) SEO de la ficha:** ✅ **HECHO (2026-06-15)** — JSON-LD `LocalBusiness` (con address/geo/
  aggregateRating/sameAs), metadata rica (canonical + OpenGraph + Twitter), `metadataBase` global,
  `sitemap.ts` (rutas estáticas + un `<url>` por lugar publicado, vía use case nuevo) y `robots.ts`
  (bloquea admin/cuenta/api/auth). Verificado en runtime.
  - **(e.2) Perf de la ficha — parcial (2026-06-21).** ✅ **`recordVisit` ya no bloquea el render**
    (corre con `after()` de `next/server`, tras enviar la respuesta) + las dos queries del usuario
    (ficha + contexto de guardado) van **en paralelo** (`Promise.all`). ⏸️ **ISR descartado por ahora:**
    toda la app es dinámica porque el **Header del root layout llama `auth()`** (no solo la ficha); pero
    la sesión es **JWT** (`strategy: 'jwt'`), así que `auth()` no pega a la BD y el costo "dinámico" es
    bajo. Cachear por SEO/escala exigiría convertir el Header a auth-en-cliente (refactor global del
    chrome, riesgo alto / payoff bajo con JWT) → proyecto aparte si se necesita.
- **(q) Docs desincronizados ✅ HECHO (2026-06-15)** — `SCHEMA.md` (6 capas / 8 cats + socialLinks +
  contenedores + ya migrado), header y comentarios de `schema.prisma`, `ARCHITECTURE.md` (código
  migrado + protección por layout/action). `lib/config.ts` borrado.
- **(r) Páginas de error/estado ✅ HECHO (2026-06-15)** — `error.tsx`, `loading.tsx`, `not-found.tsx`
  custom con el estilo del sitio (`.status-screen`).
- **(s) Rate-limiting ✅ HECHO (2026-06-15)** — `lib/rateLimit.ts` (ventana fija en memoria,
  best-effort) en reportes (5/10min por IP) y registro (5/h por IP). Para algo robusto, mover el store
  a Redis/Upstash detrás de la misma firma.

**Seguridad del registro (i):** (i.1) formato email ✅ ya valida · (i.2) **fuerza de contraseña** (hoy
solo `min(8)`; sumar reglas + medidor) · (i.3) **verificación de email** (token de un uso + gateo) —
más adelante; requiere `RESEND_API_KEY` real + considerar rate-limit anti-bots.

**Mejoras del form de admin:**
- **(x) Lista admin: eliminar + filtros + archivados separados ✅ HECHO (2026-06-20)** — la tabla de
  `/admin/lugares` ahora tiene **borrado duro** (`DeletePlaceUseCase` + `delete()` en port/repo; las
  relaciones caen por Cascade/SetNull, sin huérfanos; botón "Eliminar" con confirmación irreversible,
  aparte de Archivar que preserva historial) + **filtros** (pestañas por estado con conteo, búsqueda por
  nombre, dropdown de categoría; client-side sobre `PlacesAdminList`) + **archivados separados** (el
  default "Activos" excluye ARCHIVED; los archivados viven en su propia pestaña). Typecheck + 84 tests OK.
  **Modal de confirmación (2026-06-21):** "Eliminar" ahora abre un modal (no `window.confirm`) con un
  **checkbox de confirmación** ("Sí, entiendo que es permanente…") y el botón Eliminar **deshabilitado
  hasta tildarlo**. (Fix de paso: la variable CSS inexistente `--bg-base`/`--fg-base` dejaba la pestaña
  "Activos" sin texto y un input de perfil sin fondo → `--bg-raised`/`--ink-100`.)
- **(k) Autosave del borrador** — ⏸️ descartado por el usuario (problema raro; no vale la pena).
- **(n) Botón "Preview" ✅ HECHO (2026-06-15)** — `PlacePreview` cliente que abre un overlay con la
  ficha real (reusa las clases `.ficha`), resuelve ids→nombres desde las `options` del form y usa
  `<img>` plano (la URL en preview puede ser de un host fuera de la allowlist). No toca BD ni guarda.
- **(m) Mejor captura de lat/lng** — link de Google Maps / mini-mapa con pin / geocoding desde dirección. Decidir costo vs. fricción.
- **(a'') Validar en el use case ✅ HECHO (2026-06-15)** — `assertCategoryConsistency` (compartido por
  create/update) verifica contra el catálogo asignable que la subcategoría (principal y secundaria)
  pertenezca a su categoría; lanza `PlaceCategoryMismatchError` (DomainError, surface en la action).
  Se inyectó `CategoryRepository` en ambos use cases. +5 tests.

**Sistema de tags — sesión dedicada (o) + (j): ✅ HECHA (2026-06-14).** Se rediseñó a 6 capas (ver
"Estado actual"). Quedan 3 colas:
- **(o.4) Podar SPECIFIC** — se quitaron los que se duplicaban con capas universales; falta la poda fina
  de "atributos que no hacen sentido", lista por categoría para vetar.
- **(o.6) Sumar "Ideal para" (OCCASION) y "Experiencia" como filtros** — hoy viven en la ficha pero el
  FilterRail solo filtra ¿con quién?/servicios/vibe. Pasada de UI aparte (toca FilterRail + parseSearchParams).
- **(o.7) Tags pendientes de pulir:** revisar exclusiones mutuas; `LGBT+ friendly` recién agregado.

**Schema / modelo:**
- **(w) Entidad `Brand` / Negocio (marca con varias sucursales) — ✅ CONSTRUIDA (2026-06-17), falta e2e humano + prod.**
  Agrupa las sucursales de una marca bajo una identidad comercial + bloque "Por [Marca] ↗" en la ficha +
  página `/marca/[slug]` con todas sus sucursales publicadas. Eje nuevo (`brandId`), ortogonal a `parentId`
  (contención) y `ownerId` (gestión). **Insight Brand×Eventos (caso "Honesto Mike"):** Brand es la
  **entidad paraguas**; debajo cuelgan **Places** (real hoy) y **Events** (futuro), independientes —
  `brandId` es FK explícito en **ambos** (`Event.brandId` reservado mientras Eventos sigue apagado; una
  marca puede tener solo eventos sin local). Hexagonal de punta a punta (domain `Brand` · port
  `BrandRepository` · use cases · `PrismaBrandRepository` · admin CRUD + selector en form Place + ficha +
  `/marca/[slug]` con JSON-LD Organization). Typecheck + 84 tests OK. Decisiones en [BRAND_SPEC.md](BRAND_SPEC.md) §10.
  **Brand vs. Cuenta (§11, 2026-06-17):** cuenta gestiona marca agrupa lugares (cadena, no lo mismo); en
  MVP la marca la crea el **admin** (no hay cuentas de negocio), el flujo "el dueño se registra y agrega
  lugares" es self-service post-MVP montado encima de Brand. Puerta barata reservada: **`Brand.ownerId`
  nullable** (relación `BrandOwner`→User parqueada, el dominio/repos aún no la usan; db push aplicado local).
  **e2e humano ✅ (2026-06-18):** el usuario creó marcas reales por el admin (incl. Bar Flama) y se ven en
  `/marca/[slug]`. **Fix (2026-06-18):** el preview del logo en el form de marca usaba `next/image` y
  tumbaba la página (error boundary) al pegar una URL de host no permitido → ahora usa `<img>` plano como
  el form de Place. **Mejora (2026-06-18):** la skill `ficha-lugar` + ingesta ahora crean la marca **con
  descripción/logo/links auto** (campo `marca` como objeto), no vacía; si la marca ya existe no se pisa.
  **Falta:** solo el push a prod (db push de la BD de producción incluirá el model Brand + las 2 columnas
  `brandId` + `Brand.ownerId`).
- **(l) Redes sociales múltiples ✅ HECHO (2026-06-15)** — `socialLinks Json?` `[{network,url}]` en
  Place (WhatsApp/Facebook/TikTok…); Instagram queda como campo principal aparte. Cableado de punta a
  punta (dominio → form admin → ficha → JSON-LD `sameAs`), BD local migrada. Auditoría: el resto del
  schema MVP está **completo** vs. PRD; horario estructurado sigue siendo post-MVP por decisión.

**Pulido visual / deuda:**
- **(u) Ficha en 2 columnas en desktop (pedido del usuario 2026-06-14, ANOTADO, no hecho)** — al usuario le
  gustaba más el diseño original de la ficha en desktop: **izquierda** la info (descripción + tags + redes),
  **derecha** un contenedor con los Datos prácticos (sticky). Hoy la ficha es de 1 columna apilada. Es solo
  layout en `≥` desktop (móvil sigue apilado); revisar `.ficha__sheet`/`.ficha__section` + grid. No urgente.
- **(f) Flechas de carrusel ✅ HECHO (2026-06-15)** — `PlaceRail` se generalizó (props `scrollClassName`
  + `className`, sin tocar la home) y la ficha "También te puede gustar" ahora lo reusa con flechas en
  desktop. Por qué no se veían en la home: solo aparecen ≥861px y se autoocultan cuando no hay más
  scroll (`:disabled{visibility:hidden}`) — con pocas tarjetas que caben, no se muestran (correcto).
- **(c) Ícono en el read-model de categorías** — hoy la home los hardcodea. (2026-06-15: se sumó el
  ícono de **Entretenimiento**, que faltaba y caía al fallback de Gastronomía; sigue hardcodeado, el
  fix de fondo es moverlos al read-model.)
- **(t) Rediseño del home (pre-lanzamiento, vía Claude Design) ⏳ DIFERIDO por decisión del usuario** —
  lo verá cerca del MVP. Objetivos a capturar en el brief: (1) categorías/subcategorías primero, para
  que al entrar se sepa "de un vistazo por qué se puede filtrar"; (2) bajar "¿Con quién vas?" (queda en
  el home pero menos protagonista — el usuario se inclina por ponerlo **antes de "Lo mejor valorado"**,
  pero seguía pensándolo); (3) aprovechar el ancho en **desktop** (hoy el hero de 1 columna angosta deja
  medio viewport en blanco); (4) layout de la banda de categorías que escale a 5+ bloques. Flujo: yo
  preparo el prompt/paquete por pantalla, el usuario genera la ref, recién ahí se implementa.
  **2026-06-15: arreglado el defecto inmediato** (5 categorías rompían la grilla de 4 + ícono faltante)
  para que no se vea roto mientras tanto; el rediseño completo es aparte.
- **(d) Listas curadas de la home** — read-model "listar curadas" + seed (hoy diferido).
- **(v) Abierto/Cerrado en la tarjeta (post-MVP, ANOTADO 2026-06-14)** — mostrar en la `PlaceCard` un
  indicador "Abierto ahora / Cerrado" al explorar (info muy útil para decidir). **Depende de horario
  estructurado:** hoy `Place.schedule` es **texto libre**, no se puede calcular abierto/cerrado. Requiere
  primero modelar horario estructurado (días + tramos), que es **post-MVP por decisión** (ver SCHEMA).
  Entonces: esto entra recién cuando exista el horario estructurado.
- **(a) Barrer CSS muerto ✅ HECHO (2026-06-15)** — borrados `.hero-search*` y `.filter-rail*` (desktop
  + responsive), confirmados sin consumidores tsx (los filtros usan `.filters__*`). `.search-shell`/
  `.place-row` ya no existían (poda previa). Queda `.listing-card*` (suena al modelo viejo, sin uso
  tsx) sin tocar por no estar en la lista original; candidato para la próxima pasada.
- **(b) Neighborhoods huérfano ✅ HECHO (2026-06-15)** — `@domain/shared/Neighborhoods` era un stopgap
  declarado para el explorar viejo (ya reescrito en Etapa 4) y nadie lo importaba; eliminado.

---

## 🚀 Plan de lanzamiento priorizado (auditoría 2026-06-14)

Foto de "qué falta para lanzar live". Lo ✅ ya está. Lo demás, ordenado por prioridad.

### P0 — sin esto no hay lanzamiento
- [ ] **Contenido: cargar panoramas.** Los más populares de Santiago + ~10 por subcategoría en las
  comunas núcleo (Providencia, Santiago, Ñuñoa, Las Condes). No 20 en todas — ~100-150 fichas es un MVP
  sólido; el resto se expande post-launch. **Vía: el agente `investigador-lugares` + `ingest-fichas`**.
  **🔄 EN CURSO (2026-06-15):** 12 lugares cargados (2 publicados: Parquemet + Cerro San Cristóbal;
  10 borradores por revisar). El flujo agente→ingesta quedó validado e2e. Para ver qué falta por
  subcategoría: **`/admin/cobertura`** (vista nueva). **Scraper de rating/place_id ✅ CONSTRUIDO
  (2026-06-17):** se integró **Apify** (Google Maps Scraper) detrás del port `PlaceRatingProvider` —
  adapter `ApifyRatingProvider`, use case `EnrichPlaceRatingUseCase` (setea rating/reseñas/place_id +
  recalcula score bayesiano, sin tocar el estado), y script **`scripts/enrich-ratings.ts`** (`--dry`,
  `--force`, flag `⚠️ REVISAR` cuando el nombre del match no coincide). La query incluye la **dirección**
  de la ficha para fijar la sucursal correcta en marcas multi-local (Emporio La Rosa → su sucursal, no
  otra). Sin tarjeta (free US$5/mes de Apify cubre el MVP). **Aplicado (2026-06-17):** 6 lugares reales
  enriquecidos con rating/place_id/fotos + score recalculado; 4 fichas de prueba borradas → 12 lugares
  reales en BD. **Auto-attach de fotos ✅ (2026-06-17):** flag `--with-photos` rehospeda hasta 5 fotos de
  Google Maps al Blob (use case `AttachPlacePhotosUseCase` + `Place.withImages`), **solo en fichas sin
  imágenes** (no pisa las curadas), crédito "Google Maps". Verificado e2e (Emporio La Rosa: 5 fotos al
  Blob). **Lote 1 cargado (2026-06-17): 15 cafés de Providencia** (skill desktop "modo carga" → place_id →
  agente `investigador-lugares` → ingesta → enrich exacto + fotos). Todos PENDING_REVIEW con rating/score/
  ~5 fotos. **→ ~27 lugares reales en BD.** Ojo: **el Galgo Café** quedó cargado pero está **cerrado
  temporalmente** (robo 8-jun-2026) → NO publicar hasta confirmar reapertura. Barrios nuevos (Pedro de
  Valdivia, Manuel Montt, Barrio Suecia) **agregados al seed + asignados** a las 9 fichas que los usaban.
  **Práctica:** cuando un lote deje barrios omitidos, agregarlos al seed y reasignar (ver memoria).
  **✅ Publicación (2026-06-17):** revisados y **publicados 18 lugares** (los cafés del lote 1 + museos +
  cerros/parques); **el Galgo Café retenido en PENDING_REVIEW** (cerrado por robo, verificar reapertura
  antes de publicar). **Cambio de flujo de ingesta (2026-06-17):** `ingest-fichas.ts` ahora **publica por
  defecto** (antes dejaba todo en borrador); solo quedan en revisión las fichas con `_meta.requiere_revision:
  true` (cerrado/dudoso) o si se corre con `--review`. Además resuelve **marca → brandId** (la crea como
  borrador si no existe). La skill `ficha-lugar` + el agente `investigador-lugares` quedaron adaptados al
  schema nuevo (campo `marca`, flag `requiere_revision`, etiqueta "Sin reserva").
  **Lote 2 cargado (2026-06-18): +51 lugares → 78 total.** Bares (12 incl. Bar Flama x2), restaurantes (10),
  librerías (10), disquerías (9), tiendas/vintage (10) — vía 5 corridas paralelas del agente
  `investigador-lugares` → ingesta. Corrigió el desbalance: **Gastronomía 18→40** (abrió Bar + llenó
  Restaurante), **Locales y tiendas 0→29** (categoría que estaba 100% vacía). 48 publicados, **3 en
  `PENDING_REVIEW`** (Colectivo Informal, Rarities Pedro Nolasco, Galpón Bío Bío — dudas legítimas).
  **6 marcas nuevas creadas con descripción automática** (Le Bistrot, Catalonia, Liguria, Nolita, Punto
  Musical, Rossie La Loca) gracias a la mejora de marca-objeto; Bar Flama se reusó sin pisar. **Fotos:**
  enrich `--with-photos` (tope bajado a **3/ficha**) adjuntó 3 fotos de Google Maps a las 47 sin imágenes.
  Barrio **Franklin** agregado al seed (5 fichas del Persa). Falta: seguir cargando (Naturaleza/Arte/
  Entretenimiento siguen flacos) + revisar las 3 en PENDING_REVIEW.
  **Lote 3 cargado (2026-06-19): +39 lugares → 117 total.** Atacó las 3 categorías flacas vía 3 corridas
  paralelas del agente: **Naturaleza +14** (red de cerros reconocidos fuera de las comunas núcleo:
  Quebrada de Macul, Aguas de Ramón, Manquehue, Pochoco, Provincia + parques Araucano/O'Higgins/Quinta
  Normal/Mahuida/Inés de Suárez/de los Reyes + Río Clarillo + Cascada de las Ánimas + Jardín Chagual),
  **Arte +14** (MNHN, M. Histórico, Artequin, La Chascona, MAVI, CC La Moneda, Matucana 100, Estación
  Mapocho, Cineteca, Cine Normandie, Biblioteca Nacional, Cementerio General, Galería Patricia Ready,
  Museo de la Moda), **Entretenimiento +10** (Thelonious, Club de Jazz, Teatro Caupolicán, Blondie, Club
  Chocolate, La Batuta, Club La Feria, Happyland Mall Sport) + **Mall Sport** (contenedor). Naturaleza
  4→18, Arte 4→17, Entretenimiento 1→11. **109 publicados, 8 en PENDING_REVIEW** (los 4 del lote 2 +
  **Yukland** [no existe, matcheó un parque en California → BORRAR], **The Jazz Corner** [cerrado
  definitivo sept-2025 → borrar/archivar], **Museo de la Moda** [abre por temporadas, confirmar],
  **Jardín Botánico Chagual** [sin horario público; matcheó "Vivero Leliantú" 9 reseñas]).
  **Contenedores:** Mall Sport → Happyland (hijo); Parque Metropolitano de Santiago → Cerro San Cristóbal
  + Jardín Botánico Chagual (hijos). **Brand Happyland** auto-creada (cadena, +94 locales). Barrios nuevos
  al seed: Quinta Normal, Plaza Ñuñoa, El Arrayán, San Alfonso. **Bug de rating arreglado:** GAM (4.6/25.109)
  y Cerro Santa Lucía (4.6/3.647) no tenían rating porque la skill les capturó un `place_id` malo y el
  enrich por defecto las saltaba (solo agarra fichas con `googlePlaceId: null`) → se limpia el id y se
  re-enriquece por texto. **Sin rating (revisar a mano):** Parque O'Higgins (Maps lo mapea como polígono
  sin rating agregado) y Happyland (colisión de `place_id` con Mall Sport en el enrich).
  **Borrados (2026-06-20):** Yukland (no existe) y The Jazz Corner (cerrado) → 115 lugares.
  **Triage de los 6 PENDING_REVIEW (2026-06-20):** se dejó **Galpón Bío Bío** en revisión (4.6/2.492,
  listo para publicar); **archivados** el Galgo Café (cerrado temporal) y Museo de la Moda (abre por
  temporadas) — republicables; **eliminados** Colectivo Informal (sin dirección, 3 reseñas), Rarities
  (5 reseñas) y Jardín Chagual (place_id mal atado). → **112 lugares, 109 publicados, 2 archivados,
  1 en revisión.**
  **Lote 4 cargado (2026-06-21): +48 lugares → 160 total.** Atacó las 2 categorías flacas vía 5 corridas
  paralelas del agente con place_ids ya provistos por el usuario: **Juegos y diversión 1→27** (karaokes,
  escape rooms FUGA, bowling, arcades/gamer bars Insert Coin/Diana/Happyland Mall Centro, billares, VR
  Vimerzion) y **Vida nocturna 7→26** (discotecas Sala Portugal/Fausto/Mandala/etc, clubes de jazz
  Backroom/Grez/El Bajo, salas de conciertos Movistar Arena/Ramblas/Sala Master/RBX). **154 publicados,
  3 nuevos en PENDING_REVIEW**: Caleido (cerrada — patente rechazada + incendio), Salón de Pool y Pool Hall
  Room 9 (baja presencia web pero el enrich confirmó que son reales). Duplicados descartados antes de
  cargar: **Blondie** y **La Batuta** (ya estaban del lote 3). **Marcas nuevas con descripción**: FUGA
  Escape Room, Insert Coin Bar (Happyland se reusó). **Enrich con coords + fotos:** las 48 quedaron con
  lat/lng y 2-3 fotos de Google Maps (6 tuvieron timeout transitorio de Neon al guardar las fotos →
  reintentadas OK). **Fix de catálogo:** **Barrio Universitario** agregado al seed (Santiago) + asignado a
  Japimax; **Bar El Bajo** reapuntado como hijo del **GAM** (su `parte_de` decía "Centro Gabriela Mistral"
  y el real es "Centro Cultural Gabriela Mistral (GAM)"). Bowling - Club Providencia queda sin contenedor
  (Club Providencia no es ficha).
- **Reorganización de taxonomía (2026-06-20) ✅.** Sesión de catálogo a partir de cargar Mall Sport (un mall
  no calzaba en ninguna subcategoría). Cambios: **(1)** Entretenimiento mezclaba vida nocturna con juegos →
  **partido en 2 categorías activas:** **Vida nocturna** (Discoteca/Club, Club de jazz/blues, Sala de conciertos)
  y **Juegos y diversión** (Karaoke, Escape room, Bowling, Arcade + nuevas Paintball, Karting, Minigolf,
  Trampolines, VR, Billar). Ahora **6 categorías activas**. **(2)** Subcategorías nuevas: Gastronomía
  (+Cervecería, +Mercado/Patio gastronómico), Naturaleza (+Zoológico/Bioparque, +Termas), Locales
  (+Centro comercial, +Galería comercial/Persa, +**Atracción**). **(3)** **Atracción** (en Locales y tiendas)
  para decks/hitos urbanos tipo Sky Costanera (que NO es Naturaleza ni Arte). **(4)** Se borró la sub duplicada
  "Mirador/Observatorio". Migración por script (rename in-place de Entretenimiento→Juegos, mover subs+lugares,
  0 duplicados de slug); seed.ts actualizado; íconos del home para las 2 cats nuevas; typecheck + 84 tests OK.
  **Regla de "Atracción":** catch-all para atracciones turísticas construidas (observatorios, teleférico…);
  si no cuaja, se borra. **DRIFT SINCRONIZADO (2026-06-20) ✅:** `PRD.md`, `SCHEMA.md` y la skill
  `ficha-lugar` actualizados a la taxonomía real (6 activas + 3 event-only; Entretenimiento → Vida
  nocturna + Juegos y diversión; sub Atracción). PRD además corregido a 6 capas de tags (decía 4).
- [ ] **Push a prod.** (a) **Workflow de BD DECIDIDO (2026-06-23): migraciones Prisma.** Baseline `0_init`
  ya generado + marcado aplicado en local; prod hará `migrate deploy` limpio (BD vacía). (b) Schema + seed de
  catálogos en Neon prod (vía `migrate deploy` + `db:seed`). (c) `RESEND_API_KEY` real (si no, no sale la
  bienvenida ni el reset). (d) Confirmar `BLOB_READ_WRITE_TOKEN` + setear `UPSTASH_*` en env de prod. (e) Redeploy.
- [x] **Registro seguro (parcial 2026-06-23).** Rate-limit ✅ (ahora durable, Upstash). (i.2) **fuerza de
  contraseña + medidor ✅ HECHO**. **Recuperar contraseña ✅ HECHO** (token hasheado single-use, inerte hasta
  Resend). **Google login cableado pero apagado ✅** (flag `googleAuthEnabled`). Falta solo: (i.3) verificación
  de email al registrarse (token + gateo) — opcional post-launch; requiere `RESEND_API_KEY` real.
- [ ] **Anti-scraping (parcial 2026-06-23).** ✅ **Rate-limit durable (Upstash)** en `/api/suggest` +
  actions registro/reset/reporte; payloads capados. **Falta: regla de Rate Limit en Vercel Firewall** para
  `/lugar/*` y `/explorar` (se configura en el dashboard al deployar). Contexto original abajo. El contenido (fichas con
  rating/fotos/datos curados) es el activo del producto → blindarlo contra raspado masivo con **todas las
  medidas viables**. Candidatas, de barata a más cara: (1) **rate-limiting por IP** en las rutas públicas
  de catálogo (`/explorar`, `/lugar/[slug]`, autocomplete de búsqueda) — extender `lib/rateLimit.ts`
  (mover el store a Upstash/Redis para que aguante multi-instancia en Vercel); (2) **bloqueo de
  data-center / bots** vía Vercel Firewall / `middleware.ts` (hoy no existe middleware) + lista de
  User-Agents y ASN conocidos; (3) **Vercel Bot Management / Cloudflare** delante del dominio; (4) no
  exponer un endpoint JSON masivo (paginar y limitar `take`, sin "dame todo"); (5) **honeypot + detección
  de patrones** (muchas fichas distintas en poco tiempo desde una IP → throttle/CAPTCHA); (6) `robots.txt`
  ya bloquea admin/api, pero el catálogo público es indexable por SEO a propósito → el anti-scraping va por
  rate-limit/WAF, no por robots; (7) ofuscar/no incluir el `googlePlaceId` ni lat/lng exactos en el HTML
  si no se usan client-side (hoy `googlePlaceId` se serializa para "Cómo llegar" → evaluar moverlo a una
  action). Investigar el set completo y elegir el combo costo/beneficio antes de publicar.

### P1 — muy importante para un lanzamiento decente
- [x] **Listas guardadas visibles ✅ HECHO (2026-06-21).** Clickear una lista en Guardados abre su
  **vista de detalle** (lugares como PlaceCards) con renombrar/eliminar la lista y quitar lugares.
  Read-model con ownership en la query (anti-IDOR) + use case + 3 actions sobre los use cases existentes.
- [ ] **Analytics.** GA4 + Meta Pixel + eventos custom (del scope MVP, no construido). Conviene tenerlo
  desde el día 1 para medir el lanzamiento. — M.
- [x] **Dashboard de usuario limpiado ✅ HECHO (2026-06-21).** Nav = **Guardados · Historial · Perfil**
  (3 tabs reales); Historial terminado; ocultos del nav los stubs no-MVP (Mis listas, Eventos, Reseñas,
  Config) — componentes/rutas preservados para reactivar.

### P2 — pulido / captura de valor
- [x] **Botón compartir ✅ HECHO (2026-06-21).** Reemplazado `navigator.share` por un **popup** con la
  grilla de redes (reusa el shell `.save-modal`): **WhatsApp, X, Telegram, Facebook** abren con
  nombre+link pre-cargado; **Email** vía `mailto`; **Copiar link**; **Instagram y TikTok** copian el link
  + aviso "pégalo en tu historia/bio" (no existe API web para pre-cargar un link externo en esas dos —
  limitación real, decidido con el usuario). Verificado a ojo.
- [ ] **Sugerencias / feedback.** No existe mecanismo (solo `reportPlaceAction` para reportar datos
  malos). Sumar un form simple "sugerir lugar / mejora" → email o tabla. — S/M.
- [ ] **3-5 listas curadas como landing SEO** (ítem d). — M.

### Fuente de rating automática — ✅ INTEGRADA (2026-06-17)
- [x] **Apify** (Google Maps Scraper) detrás del port `PlaceRatingProvider`. Elegido vs. Outscraper
  (pedía tarjeta), Google Places (tarjeta + cobro por SKU + fotos extra) y SerpApi: Apify da token
  **sin tarjeta**, free US$5/mes (US$1,50/1.000 lugares = MVP gratis), y trae rating + reseñas +
  place_id + fotos en una llamada. Verificado e2e. **Falta:** correr el lote real + (opcional) auto-attach
  de fotos. Ojo ToS: cachear ratings de Google permanentemente es zona gris (aplica a cualquier fuente).

### Ya hecho ✅
- [x] Scraper de rating/place_id vía **Apify** (port + use case + script `enrich-ratings.ts`) — 2026-06-17.
- [x] Flujo de imágenes (Vercel Blob + compresión + "Traer" desde URL) — 2026-06-14.
- [x] Carga asistida por agente (skill `ficha-lugar` + `investigador-lugares` + `ingest-fichas`) — 2026-06-14.
- [x] Páginas legales privacidad/términos — 2026-06-15 (falta revisión por abogado).
- [x] SEO de ficha: JSON-LD + metadata + sitemap + robots — 2026-06-15 (falta revisar ISR, e.2).
- [x] Suite de tests de dominio (64 Vitest) + skill `/tests` — 2026-06-15.
- [x] Docs sincronizados (SCHEMA/ARCHITECTURE/schema.prisma) — 2026-06-15.
- [x] Rate-limiting en reportes + registro — 2026-06-15.

---

**Regla:** no avanzar a la siguiente fase/etapa sin OK explícito del usuario. Tras cada avance real,
dejar este `PLAN.md` actualizado (y la bitácora en `PLAN_FASE9.md` si es una decisión).
