# PLAN — Portal Panorama (plan vivo)

**La fuente de verdad del trabajo desde hoy.** Estado actual, lo que falta para lanzar, y el backlog
priorizado. Se actualiza cada vez que avanzamos. Liviano a propósito — para retomar rápido.

- **Qué es el producto / por qué (norte permanente):** [PRD.md](PRD.md)
- **Seguimiento de pasos:** [ROADMAP.md](ROADMAP.md)
- **Modelo de datos:** [SCHEMA.md](SCHEMA.md) · **Capas:** [ARCHITECTURE.md](ARCHITECTURE.md) · **Carga:** [PLANTILLA_CSV.md](PLANTILLA_CSV.md)
- **Bitácora del rediseño (historia + razonamiento de las decisiones):** [PLAN_FASE9.md](PLAN_FASE9.md)

**Última actualización:** 2026-06-14 (auditoría pre-lanzamiento: plan priorizado P0/P1/P2)

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

## ▶️ Próximos pasos (en orden)

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
  (bloquea admin/cuenta/api/auth). Verificado en runtime. **Falta solo (e.2): revisar ISR** — hoy
  `/lugar/[slug]` renderiza dinámico porque `auth()` en la ficha fuerza dynamic; para cachear habría
  que separar la parte pública (cacheable) de la personalizada (botón Guardar / registrar visita).
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
- **(w) Entidad `Brand` / Negocio (marca con varias sucursales) — ESPECIFICADA, no construida (2026-06-17).**
  Agrupar las sucursales de una marca bajo una identidad comercial + bloque "Por [Marca]" en la ficha +
  página `/marca/[slug]` con todas sus sucursales. Eje nuevo (`brandId`), ortogonal a `parentId`
  (contención) y `ownerId` (gestión). Spec completo en [BRAND_SPEC.md](BRAND_SPEC.md). **Recomendación:
  post-launch** (`brandId` nullable → se agrega sin migración dolorosa); no bloquea lanzar.
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
  Blob). Falta: seguir cargando contenido.
- [ ] **Push a prod.** (a) Decidir workflow de BD: hoy `prisma db push` sin migraciones; antes de prod
  decidir si seguimos con `db push` o introducimos migraciones reales (no se puede `--force-reset`
  contra prod con datos). (b) Schema + seed de catálogos en Neon prod. (c) `RESEND_API_KEY` real
  (si no, no sale la bienvenida). (d) Confirmar `BLOB_READ_WRITE_TOKEN` en env de prod. (e) Redeploy.
- [ ] **Registro seguro.** Rate-limit ✅ ya. Falta: (i.2) **fuerza de contraseña** (hoy solo `min(8)`;
  sumar reglas + medidor) — S; (i.3) **verificación de email** (token de un uso + gateo) — M, requiere
  `RESEND_API_KEY` real.

### P1 — muy importante para un lanzamiento decente
- [ ] **Listas guardadas visibles.** Hoy en Guardados ves las tarjetas de tus listas con conteo, pero
  al hacer clic caen en `tab=listas` = placeholder **"Próximamente"**: no se puede abrir una lista ni
  ver sus lugares. El backend (use cases de colección) ya existe; falta la **vista de detalle** (lugares
  de una colección, con PlaceCards) + crear/renombrar/eliminar lista. — M.
- [ ] **Analytics.** GA4 + Meta Pixel + eventos custom (del scope MVP, no construido). Conviene tenerlo
  desde el día 1 para medir el lanzamiento. — M.
- [ ] **Limpiar el dashboard de usuario.** Hoy 5 de 7 tabs son stubs "Próximamente" (Config, Eventos,
  Historial, Listas, Reseñas); solo Guardados y Perfil son reales. Decidir por tab: **terminar**
  (Historial tiene backend; Listas = ítem de arriba) u **ocultar** lo no-MVP (Eventos = off; Reseñas
  si reviews no van en MVP). — M.

### P2 — pulido / captura de valor
- [ ] **Botón compartir.** Hoy usa `navigator.share` + fallback a copiar al portapapeles. El usuario
  reporta que "no está bien" → falta diagnosticar qué falla puntual (¿toast? ¿feedback en desktop?
  ¿posición?). — S.
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
