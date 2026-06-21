# PLAN — Portal Panorama (plan vivo)

**La fuente de verdad del trabajo desde hoy.** Estado actual, lo que falta para lanzar, y el backlog
priorizado. Se actualiza cada vez que avanzamos. Liviano a propósito — para retomar rápido.

- **Qué es el producto / por qué (norte permanente):** [PRD.md](PRD.md)
- **Seguimiento de pasos:** [ROADMAP.md](ROADMAP.md)
- **Modelo de datos:** [SCHEMA.md](SCHEMA.md) · **Capas:** [ARCHITECTURE.md](ARCHITECTURE.md) · **Carga:** [PLANTILLA_CSV.md](PLANTILLA_CSV.md)
- **Bitácora del rediseño (historia + razonamiento de las decisiones):** [PLAN_FASE9.md](PLAN_FASE9.md)

**Última actualización:** 2026-06-20 (lote 3: +37 netos → 115 total; **reorganización de taxonomía**: Entretenimiento partido en Vida nocturna + Juegos y diversión, +subcategorías nuevas, Atracción en Locales; **drift de docs sincronizado**: PRD/SCHEMA/skill ficha-lugar)

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
