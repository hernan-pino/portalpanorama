# PLAN FASE 9 — Rediseño del producto

Documento vivo. Se actualiza cada vez que avanzamos. Aquí vive el **orden de trabajo**
y el **estado de avance** de la Fase 9. Para el detalle de pasos de código, ver
[ROADMAP.md](ROADMAP.md). Para las preguntas de producto, ver [PRODUCTO.md](PRODUCTO.md).

**Última actualización:** 2026-06-12

---

## 📍 EN QUÉ VAMOS AHORA MISMO

- **Etapa:** 5 — Cargar lugares a mano 🔄 **EN CURSO** (admin CRUD construido 2026-06-12, ver bullet abajo).
  Etapa 4 ✅ cerrada salvo el push a prod. Sub-etapas de la 4: **4A domain ✅ · 4B application ✅**
  (commit `750340c`, 2026-06-09) · **4C infrastructure ✅** (commit `e13f7fd`, 2026-06-09) ·
  **4D composition root ✅** (2026-06-09) · **4E presentation ✅ COMPLETADA** (pasada 1 poda ✅; pasada 2
  reescritura: ficha ✅ 2026-06-10 · explorar ✅ 2026-06-10 · home ✅ 2026-06-11). Etapa 3 local ✅
  (prod pendiente, va con el redeploy).
  - **4E en curso (2026-06-09):** **Pasada 1 — poda ✅** (commit `4144e7d`): borradas 50 rutas/componentes
    post-MVP cuyos use cases ya no existen (negocio self-service, suscripciones/Flow, claims, tags-moderación,
    eventos, feed, favoritos-único). Errores 126 → 64. **Superficie consumer que queda** (15 archivos): ficha
    `lugar/[slug]` (15) · mi-cuenta (13) · componentes SearchBar/FilterRail/Header/MobileNav (6) · explorar (5)
    · home (3) · parseSearchParams (2).
  - **Enfoque acordado 4E pasada 2 (híbrido):** design-gate solo las **3 pantallas-cara** (ficha → explorar →
    home), donde la taxonomía nueva cambia el diseño; el resto (auth, mi-cuenta, admin CRUD, layout chrome,
    parseSearchParams) = plomería sin ref, sobre el design system de Fase 6 que sigue vivo. El usuario se
    inclinaba por "esperar refs por pantalla"; se acotó a las 3 hero para no gastar su tiempo (P1) en
    formularios sin decisión visual.
  - **Brief #1 listo:** [design_briefs/4E_01_ficha.md](design_briefs/4E_01_ficha.md) — paquete para que el
    usuario genere la ref de la ficha con Claude design (campos reales de `PlaceDetailView`, tokens, CTAs,
    qué se podó). High-fidelity, mobile-first (no wireframe: el design system ya está decidido en Fase 6).
  - **Plomería no-visual hecha (2026-06-09, commit `4d73b13`):** re-cabladas mi-cuenta + chrome al modelo
    `Place` sobre el design system de Fase 6, sin refs. mi-cuenta: dashboard `{user, collections, history}`;
    tab Guardados muestra colecciones; Reseñas = sección vacía v2; perfil sin RUT. Header/MobileNav: fuera
    rama BUSINESS_OWNER y links a rutas podadas. **Errores 64 → 29**: los 29 restantes son SOLO las 3
    pantallas-cara + sus componentes (ficha 15 · explorar 11 [page+SearchBar+FilterRail+parseSearchParams] ·
    home 3), en espera de refs. `parseSearchParams` se defirió a explorar (es su único consumidor).
  - **Gap admin (net-new, sin ref):** `admin/` compila pero está muerto en runtime (redirige a claims/tags
    borrados). Hay que reconstruirlo como **CRUD de Place** (listar + crear/editar + publicar/archivar) —
    habilita la **Etapa 5** (cargar ~100 lugares a mano). Necesita queries de catálogo (categorías ✅ via
    GetCategories; faltan tags/comunas/barrios/metro para los selectores del form).
  - **Colgantes a barrer en la pasada 2 (revisión 2026-06-09):** (a) [ListingCard.tsx](src/components/listing/ListingCard.tsx)
    sobrevivió a la poda — sigue con nombre/forma viejos (`ListingCardData`, `isPremium`) aunque ya renderiza
    clases `.place-card`; compila porque su interfaz es local, pero sus únicos consumidores son las 3 hero →
    renombrar/reescribir **dentro** de la pasada 2 para que no quede legacy colgando. (b) `admin/layout.tsx`
    redirige a `/dashboard` a los no-admin; al reconstruir el admin CRUD, confirmar que esa ruta de fallback
    existe. **Verificación de estado (2026-06-09):** confirmado que los 29 errores fuente están SOLO en el
    cluster de las 3 hero (ficha 15 = 11 page + 4 actions · explorar 11 · home 3); domain/application/infra/
    container en 0; schema en modelo `Place` sin modelos viejos; invariantes de capas OK. El "49" de `tsc`
    incluye 20 errores autogenerados en `.next/types/validator.ts` (derivados de las rutas, no deuda real).
  - **Ref de la ficha RECIBIDA Y APROBADA (2026-06-10):** el usuario generó la ref con Claude design. Zip
    extraído a [design_briefs/4E_01_ficha_ref/](design_briefs/4E_01_ficha_ref/) (fuera de `src/`): capturas
    móvil A (restaurante lleno) + móvil B (mirador escaso) + desktop A · código `source/*.jsx` + `ficha.css` ·
    `tokens.md`. **Revisada y validada:** móvil impecable, degradación con gracia OK (en B desaparece Contacto,
    aparece "Si llueve"), barra fija móvil con Guardar + Cómo llegar tal cual se pidió. Desktop-A tiene glitches
    de **captura** (no de diseño; se reconstruye desde el código). El `tokens.md` es honesto y marca todo lo
    fuera de sistema.
  - **Mapeo de tokens ref → `globals.css` (a aplicar al reconstruir, NO copiar HTML):** la ref inventó nombres
    propios. `--paper/--ink/--surface/--line` → `--paper-00..50 / --ink-100 / --bg-raised / --surface-line`;
    `--sunset` → `--accent-60`; **radios de la ref `8/14/22` son más grandes que los nuestros `4/8/12`** → usar
    los nuestros (ficha algo menos redondeada que el PNG); sombras inventadas → `--shadow-1..pop`; escala
    tipográfica de la ref → nuestros `--t-*`.
  - **Decisión cerrada — estrellas de Google (2026-06-10):** **agregar token `--star` dorado/ámbar apagado**
    (~`#D9A444`, afinado a oklch para que se sienta nativo). NO usar el acento sunset (competiría con los CTA y
    el rating se leería como botón). Criterio del usuario: importante pero sin ser el foco; el dorado cálido lo
    distingue como "rating" sin romper la paleta crema.
  - **Ficha IMPLEMENTADA (2026-06-10) ✅ — pasada 2 de 4E, pantalla #1:** reescrita
    [lugar/[slug]/page.tsx](src/app/(main)/lugar/[slug]/page.tsx) como server component contra
    `getGetPlaceBySlugUseCase()` (que ahora **lanza** `PlaceNotFoundError` → `notFound()`), mobile-first, un solo
    árbol responsive (no se duplicó el chrome del mockup). Agregado token `--star` (oro/ámbar oklch) a
    [globals.css](src/app/globals.css) + bloque `.ficha` reconstruido del handoff con **nuestros** radios (4/8/12/20),
    no los de la ref (8/14/22). Borradas las reglas muertas `.place-*`/`.review`. Nuevos componentes cliente:
    [SaveButton](src/app/(main)/lugar/[slug]/SaveButton.tsx) (guardar en lista: selector de colecciones + crear lista
    nueva, B.9), [ShareButton](src/app/(main)/lugar/[slug]/ShareButton.tsx) (Web Share API + copia al portapapeles),
    [ReportButton](src/app/(main)/lugar/[slug]/ReportButton.tsx) (reporte dato incorrecto/cerrado). Íconos en
    [icons.tsx](src/app/(main)/lugar/[slug]/icons.tsx). [actions.ts](src/app/(main)/lugar/[slug]/actions.ts) reescrito:
    `saveToCollectionAction` · `createListAndSaveAction` · `reportPlaceAction` (visitante anónimo o usuario). Borrados
    `FavoriteButton`/`ReviewForm` (reseñas podadas). Etiquetas de enums (PriceRange/ReservationPolicy/RainPolicy) en
    presentación. **Barra fija móvil** con Guardar + Cómo llegar tal cual la ref. `ListingCard` colgante NO entró
    (la ficha usa su propio `.ficha__relcard`) → queda pendiente para explorar/home. **tsc: ficha en 0 errores**,
    ESLint limpio. **Total fuente 29 → 14** (todos en el cluster explorar+home).
  - **Ficha VERIFICADA en runtime (2026-06-10) ✅:** seed de demo con **7 lugares** que cubren el abanico
    ([seed-demo.ts](src/infrastructure/db/prisma/seed-demo.ts), idempotente + `--clean`; BD local solo tenía catálogos,
    0 lugares). Los 7 rinden HTTP 200; degradación con gracia confirmada (Mirador pobre oculta Contacto + estrellas;
    Terraza llena muestra todo: datos, metro, rating, 3 grupos de tags, relacionados, "Si llueve"). **Fix de
    acoplamiento encontrado al verificar:** [ResendEmailService](src/infrastructure/email/ResendEmailService.ts) lanzaba
    `RESEND_API_KEY is not set` **al construirse** → como el container instancia todos los adapters al cargar, tumbaba
    CUALQUIER ruta (incluida la ficha) con la key vacía. Ahora valida la key **lazy** (al enviar, no al construir).
    `RESEND_API_KEY` está vacío en `.env.local` local (no afecta la ficha; afectaría el envío de bienvenida al registrarse).
  - **Posible optimización anotada:** `GetUserDashboard` se llama por cada vista de ficha logueada solo para traer las
    colecciones del SaveButton (arrastra también el historial) — si pesa, exponer un read-model "solo colecciones".
  - **Pulido de la ficha (2026-06-10, feedback del usuario):** (a) **bug de estrellas** corregido — la estrella rellena
    y la de contorno usaban paths distintos → relleno parcial corrido; unificadas a un solo path en
    [icons.tsx](src/app/(main)/lugar/[slug]/icons.tsx). (b) **galería navegable** — nuevo
    [Gallery.tsx](src/app/(main)/lugar/[slug]/Gallery.tsx): lightbox con anterior/siguiente + zoom al click + teclado
    (←/→/Esc) + contador/crédito; miniaturas ahora son botones que abren el visor (antes decorativas). Efecto
    secundario: las miniaturas salieron de la lámina redondeada y van bajo el hero (galería = hero+thumbs juntos).
    (c) **relacionados → carrusel** horizontal con scroll-snap (antes grilla). (d) **bug de dato** en seed-demo:
    Terraza tenía `secondaryCategory='gastronomia'` (duplicaba el chip) → quitado; agregada guarda defensiva en la UI
    (no renderiza la secundaria si coincide con la principal) y Librería ahora demuestra una secundaria real
    (Arte y cultura). tsc + ESLint limpios.
  - **Briefs de las 2 refs que faltan LISTOS (2026-06-10):** [4E_02_explorar.md](design_briefs/4E_02_explorar.md)
    (explorar + la tarjeta, con la composición acordada: rating en esquina de la foto + precio compacto + metro;
    implica ampliar `PlaceCardView`) y [4E_03_home.md](design_briefs/4E_03_home.md) (home "por acción": search + fila
    social + categorías + recomendados; reusa la tarjeta y chips de explorar). Cada archivo es autocontenido = el
    prompt se pega entero a Claude design. El usuario los genera de forma asíncrona.
  - **Pendiente no-visual de la ficha (anotado, no bloquea):** falta **JSON-LD `LocalBusiness`** + metadata más rica
    (canonical, og) para SEO/GEO (scope MVP D.4/D.5). Se agrega en una pasada de SEO, no urge para el visual.
  - **Ref de explorar RECIBIDA + decisiones cerradas (2026-06-10):** el usuario generó la ref (canvas con la
    tarjeta + 5 frames: explorar móvil, bottom-sheet de filtros, lista, vacío, desktop) y la revisó con Claude.
    **La tarjeta se aprobó tal cual**; **la composición de la página cambió.** Decisiones (detalle en
    [4E_02_explorar.md](design_briefs/4E_02_explorar.md) §8): (1) **categoría = filtro principal**, no lo social
    — modelo mental "primero cafetería, después si es para pareja"; al elegir categoría salen sus **subcategorías**;
    lo social baja a filtro que refina (sigue siendo el diferenciador, pero deja de ser el héroe visual: ocupaba
    mucho). (2) **Todo en acordeón colapsable** (cabecera con toggle + badge de nº activos); Categorías abierto por
    defecto, ¿Con quién vas? colapsado, Más filtros = grupos colapsables (móvil en bottom-sheet, desktop en rail).
    (3) **Categorías visibles también en desktop** (la ref las dejó solo en móvil). (4) **Fuera la nota "Mostrando
    primero Providencia"** → se elimina el orden por comuna-home del MVP (**ajusta C.3-bis**); orden por defecto =
    reputación a secas; lo geográfico ("a 5 min") entra después con ubicación actual + lat/lng. (5) **Corazón para
    guardar desde la tarjeta** (ya en la ref) → cablear al flujo de colecciones de la ficha; **visitante anónimo →
    pop-up** preguntando si quiere iniciar sesión/registrarse (no redirección seca). (6) **Indicador de
    filtros activos** — se conserva el tratamiento visual del pill "Mostrando primero…" (texto + acción
    reversible) pero repurposeado para mostrar **qué filtros están aplicados** (ej. "Café · en pareja ·
    Providencia · limpiar"); pendiente, a especificar al implementar (no estaba en la ref).
  - **Feasibility verificada (2026-06-10, sin migración):** `SearchParams` ya tiene category/subcategory/social/
    etc.; `PlaceFacets` ya trae categories·social·communes·metroLines·priceRanges·access·vibe. **Dos adiciones
    chicas que cruzan capas:** (a) ampliar `PlaceCardView` con `metroLine` (vía `Place.metroStation →
    MetroStation.lines[]`, many-to-many: Baquedano = L1+L5 → mostrar 1-2 badges) en
    [placeCardView.ts](src/infrastructure/db/placeCardView.ts); (b) sumar dimensión **`subcategories`** a
    `PlaceFacets` (port `SearchService` + `getFacets`) para contador + ocultar vacías. El resto (acordeón,
    pop-up login) es presentación pura.
  - **Explorar IMPLEMENTADO + VERIFICADO (2026-06-10) ✅ — pasada 2 de 4E, pantalla #2:** reescrita
    [explorar/page.tsx](src/app/(main)/explorar/page.tsx) como server component contra
    `getSearchPlacesUseCase()` + `getGetPlaceFacetsUseCase()` + `getGetCategoriesUseCase()` + auth (corazón). Aplicadas
    las **2 adiciones que cruzan capas**: (a) `PlaceCardView.metroLines[{code,color}]` en
    [PlaceRepository.ts](src/application/ports/PlaceRepository.ts) + select/mapper en
    [placeCardView.ts](src/infrastructure/db/placeCardView.ts); (b) faceta **`subcategories`** en
    [SearchService.ts](src/application/ports/SearchService.ts) + `subcategoryFacets()` en
    [PostgresFTSSearchService.ts](src/infrastructure/search/PostgresFTSSearchService.ts). Decisiones §8 cableadas:
    **categoría = filtro principal** (franja superior en ambas vistas + subcategorías al elegir rubro), **acordeón**
    colapsable ([Filters.tsx](src/components/search/Filters.tsx): rail desktop / bottom-sheet móvil, badge de nº activos),
    **pill de filtros activos** reversible ("Mostrando · Café · Providencia · limpiar"), **sin** nota de comuna-home
    (orden = reputación a secas), **corazón** en la tarjeta cableado al flujo de listas con **pop-up para anónimo**
    ([SaveHeart.tsx](src/components/place/SaveHeart.tsx)). Nueva **tarjeta** [PlaceCard.tsx](src/components/place/PlaceCard.tsx)
    (server + isla cliente del corazón; variantes grid/lista) reemplaza la `ListingCard` vieja (borrada con `FilterRail`).
    [parseSearchParams.ts](src/lib/parseSearchParams.ts) reescrito a la nueva `SearchParams` (sin los catálogos
    `@domain/shared/*`; saneo de forma, no de existencia). Acciones de guardar centralizadas en
    [collections.ts](src/app/actions/collections.ts) (la ficha re-exporta de ahí; dedup). [SearchBar](src/components/search/SearchBar.tsx)
    adelgazado a query libre. CSS de explorar/tarjeta/filtros reconstruido en [globals.css](src/app/globals.css) con los
    tokens reales (borradas reglas muertas `.search-shell`/`.filter-rail`/`.place-row`). **tsc: clúster explorar en 0
    errores · ESLint limpio.** Runtime con el seed de 7 lugares: `/explorar` HTTP 200 (7 lugares, 4 categorías, 6 secciones
    de filtro, rating en 6/7 — Mirador pobre lo oculta, badges de metro, precio compacto, corazón); `?categoria=gastronomia`
    → 3 lugares + pill activo + franja de subcategorías. **Total fuente 14 → 4** (los 4 son SOLO home).
  - **Ref de home RECIBIDA + APROBADA + decisión de jerarquía cerrada (2026-06-11):** el usuario generó la ref con
    Claude design (zip → [design_briefs/4E_03_home_ref/](design_briefs/4E_03_home_ref/), fuera de `src/`: capturas
    móvil/desktop + `home-screens.jsx` + `tokens.md`). `tokens.md` honesto, sin paleta/tipografía/radios inventados,
    reusa `PlaceCard` + chips de explorar. **Desviación del brief decidida por el usuario:** la ref **invirtió la
    jerarquía** — **categorías = bloque protagonista** (banda + tarjetas grandes), **¿Con quién vas? = fila compacta
    secundaria** (sigue arriba). El usuario confirmó que lo pidió así: *"prefiero filtrar por categoría/subcategoría
    primero y después lo social"* → **ajusta el brief de la home** y queda **consistente con explorar §8.1** (category-first).
    Listas curadas (§5) quedan **diferidas** (no hay read-model "listar curadas", solo `GetCuratedCollection` by slug, ni
    data sembrada; fast-follow SEO).
  - **Home IMPLEMENTADA + VERIFICADA (2026-06-11) ✅ — pasada 2 de 4E, pantalla #3 (última):** reescrita
    [page.tsx](src/app/(main)/page.tsx) como server component contra `getSearchPlacesUseCase()` (recomendados, orden por
    reputación, limit 12) + `getGetCategoriesUseCase()` (4 activas) + `getGetPlaceFacetsUseCase()` (chips sociales,
    **ocultar vacíos** P3) + auth/`GetUserDashboard` (corazón de la tarjeta). Layout fiel a la ref: **hero** (título
    editorial con `<em>hacer</em>` + `SearchBar`) → **¿Con quién vas?** (fila social secundaria, chips → `/explorar?con=`)
    → **Explorá por categoría** (protagonista: banda `--bg-sunken` + tarjetas grandes con ícono, → `/explorar?categoria=`)
    → **Lo mejor valorado** (carrusel horizontal reusando `PlaceCard`). Íconos de categoría propios (el catálogo aún no
    trae ícono — pendiente sumarlo a `GetCategories`). CSS: borrados los bloques muertos del modelo viejo en
    [globals.css](src/app/globals.css) (`.hero*` home / `.cat-grid`/`.cat-card*` / `.event-card*` / `.sec-head*` /
    `.featured-*` / `.biz-cta*` / `.chip-row` + sus refs responsive), reconstruido el bloque `.home-*` con tokens reales
    (preservado `.hero__eyebrow`/`.line` que usa explorar). Borrado [FeaturedSlider.tsx](src/components/home/) (sin
    consumidores). **Footer:** se mantiene el **oscuro** del layout (`.footer` = `--ink-100`), NO el claro de la ref
    (decisión del usuario). **tsc + ESLint en 0 · runtime HTTP 200** con el seed de 7 lugares: hero + 6 chips sociales
    (grupo grande oculto = 0 lugares) + 4 categorías + 7 tarjetas en el carrusel (rating en 6/7, metro 6, precio 7).
    **Total fuente 4 → 0: la app compila completa.**
  - **Búsqueda con sugerencias + matching tolerante (2026-06-11) ✅ — feature post-4E pedida por el usuario:** la barra
    pasó a **combobox** con autocompletado. Matching **tolerante en la capa de app** (no SQL): substring ("caf"→"café") +
    sin acentos ("cafe"="café") + typos por distancia de edición ("cafi"≈"café"), en [fuzzy.ts](src/infrastructure/search/fuzzy.ts).
    Capas: `SearchService.suggest` (port) → [SuggestPlacesUseCase](src/application/place/SuggestPlacesUseCase.ts) → impl en
    [PostgresFTSSearchService](src/infrastructure/search/PostgresFTSSearchService.ts) (el **mismo prefiltro fuzzy ahora alimenta
    `search()`** → el Enter en explorar tampoco da 0 por typos) → ruta [/api/suggest](src/app/api/suggest/route.ts) (Zod) →
    [SearchBar](src/components/search/SearchBar.tsx) combobox (dropdown con foto+nombre+rubro·comuna, teclado ↑↓/Enter/Esc,
    click→ficha, Enter sin elegir→explorar). **Verificado:** `?q=cafi`→Café Forastero+Terraza Rosario (esta última por su
    **rubro** café, no solo nombre); basura→"Sin resultados". **Decisión:** se pivoteó de `pg_trgm`/`unaccent` (se habilitaron
    en la BD pero quedaron inertes) a fuzzy en app → más simple para ≤100 lugares y **sin dependencia de extensión en el push a
    prod**; cuando crezca, lo reemplaza Meilisearch (Fase 2) sin tocar el port. tsc + ESLint limpios.
  - **De paso, fix del SearchBar (mismo commit que la home):** `.searchbar`/`.searchbar__ico`/`.searchbar__btn` **no tenían
    CSS** (el ícono se renderizaba gigante y tapaba la página, bloqueando la navegación) → estilado; afectaba a home y explorar.
  - **Admin CRUD de Place CONSTRUIDO + VERIFICADO en data layer (2026-06-12) ✅ — Etapa 5, herramienta de carga:** el
    `admin/` estaba muerto en runtime (redirigía a claims/tags borrados). Reconstruido como **CRUD de Place** sobre los 4
    use cases que ya existían (`Create/Update/Publish/Archive`, ya cableados). **Lo que faltaba y se agregó, cruzando capas:**
    (a) read-model **`PlaceAdminRow` + `PlaceRepository.listForAdmin()`** (todos los estados, no solo PUBLISHED; categoría/comuna
    denormalizadas); (b) **`GetPlaceForEditUseCase` + `PlaceEditView`** (aplana el agregado de dominio a un DTO con FK ids +
    tag ids + imágenes, sin filtrar el aggregate a presentation); (c) **opciones del form** = nuevo `GetPlaceFormOptionsUseCase`
    que compone `CategoryRepository.listForForm()` (categorías **con ids**, no slugs) + `TagRepository.listAll()` (TagOption con
    capa+categoryId) + **port nuevo `LocationRepository`** (comunas/barrios[+communeIds M2M]/estaciones[+líneas]) →
    `PrismaLocationRepository`. UI (plomería sin ref, sobre el design system de Fase 6): `admin/layout` (sidebar → Lugares /
    Nuevo) · `admin/page` redirige a `/admin/lugares` · **lista** con badges de estado + acciones publicar/archivar por fila
    ([PlaceRowActions](src/app/(main)/admin/lugares/PlaceRowActions.tsx)) · **form** compartido crear/editar
    ([PlaceForm](src/app/(main)/admin/lugares/PlaceForm.tsx): ~30 campos, subcats dependientes de la categoría, barrios
    acotados por comuna, tags agrupados por capa con tope SOCIAL≤4/VIBE≤3 en cliente, **imágenes por URL** —widget de
    UploadThing queda como follow-up—) · **actions** con guard ADMIN + Zod → `PlaceWriteInput`
    ([actions.ts](src/app/(main)/admin/lugares/actions.ts), categoría secundaria = par via refine, P2002→mensaje de slug
    duplicado). CSS `.admin-*` al final de globals.css. **Verificado:** `tsc` 0 · ESLint 0 · `next build` OK (4 rutas admin
    dinámicas) · read-models contra la BD local real (7 lugares en listForAdmin; formOptions = 4 cats con ids+subcats / 80 tags
    / 52 comunas / 9 barrios / 125 estaciones, Baquedano resuelve L1+L5; getForEdit aplana FK ids + 7 tags + 2 imgs).
  - **Admin CRUD VERIFICADO e2e (2026-06-12) ✅ + 2 fixes de la verificación:** flujo completo por la superficie real
    (login Auth.js como admin → lista → crear vía `createPlaceAction` con payload del form → editar → publicar → ficha
    pública 200 + aparece en explorar → archivar). Probes que aguantaron: action sin sesión → "No autorizado" · rating 46
    → error 1–5 · nombre duplicado → mensaje de slug. **Dos hallazgos del probe, ARREGLADOS en el momento:** (1) la ficha
    pública de un lugar NO publicado renderizaba por URL directa (deuda de 4E recién alcanzable: antes todo era PUBLISHED)
    → `getDetailBySlug` ahora filtra `status: PUBLISHED` (archivada → 404 verificado, publicada → 200); (2) una URL de
    imagen de un host fuera de la allowlist de next/image pasaba al guardar pero **tumbaba la ficha con 500** al renderizar
    → fuente única [imageHosts.ts](src/lib/imageHosts.ts) (next.config deriva `remotePatterns` de ahí + Zod del action
    valida el host + hint en el form). Verificado en runtime: picsum.photos rechazado con mensaje claro.
  - **▶️ PRÓXIMO PASO (retomar acá):** **Admin CRUD listo y verificado e2e.** Toca: (1) **cargar ~100 lugares a mano** por el
    form (Etapa 5 contenido, densidad > cantidad en Providencia/Ñuñoa); (2) **push a prod (Neon)**: migración de la Etapa 3 en
    la BD de producción + seed de catálogos + redeploy con la presentation nueva. **Pendientes menores anotados:** (a') **widget
    de subida de imágenes (UploadThing)** — hoy el form pide la URL pegada (el `StorageService`/UploadThing ya existen, falta el
    componente de upload) y la allowlist de hosts deberá sumar el host de UploadThing (`utfs.io`) cuando entre; (a'')
    validar en el use case que la subcategoría pertenezca a su categoría (hoy solo el form lo previene con selects
    dependientes); (a) barrer CSS
    muerto que sobrevivió a la poda de explorar (`.hero-search` 293-339 + `.search-shell`/`.place-row`/`.filter-rail`
    responsive — confirmados sin consumidores tsx); (b) revisar si `@domain/shared/Neighborhoods` quedó huérfano; (c)
    sumar **ícono** al read-model de categorías (hoy la home los hardcodea); (d) listas curadas de la home (read-model +
    seed); (e) SEO de la ficha (JSON-LD `LocalBusiness` + metadata) pendiente de una pasada aparte; (f) **flechas de
    carruseles (próxima sesión):** la ficha **"También te puede gustar"** (`.ficha__relcard`) NO tiene flechas en desktop
    → reusar el patrón de [PlaceRail](src/components/place/PlaceRail.tsx). La home **"Lo mejor valorado"** ya tiene PlaceRail
    con flechas (confirmado en el HTML: "Siguiente" habilitada en ≥861px); el usuario reportó no verlas → verificar
    visualmente (¿hard-refresh? ¿muy sutiles? quizá subir contraste/tamaño o moverlas); (g) **footer Legal apunta a
    `/terminos` y `/privacidad` que NO existen (404)** — la página legal de privacidad/cookies ya era ítem abierto del
    MVP (D.2, exigida por la instrumentación GA4/Pixel); decidir si se crean placeholders o se quita la columna hasta
    tenerlas; (h) **importador CSV** (Etapa 5): la plantilla existe ([PLANTILLA_CSV.md](PLANTILLA_CSV.md)); falta la
    página/script de admin que lea el CSV curado (Google Sheets → export) y cree lugares en lote vía CreatePlace.
  - **Bug de registro encontrado y ARREGLADO (2026-06-12, verificado e2e):** el registro creaba el usuario y DESPUÉS
    explotaba con 500 al enviar el correo de bienvenida (`RESEND_API_KEY` vacío en local) → la persona veía un error,
    al reintentar "email ya registrado", pero su cuenta sí servía. Fix en
    [RegisterUserUseCase](src/application/user/RegisterUserUseCase.ts): el correo de bienvenida es cortesía — si falla
    se loguea y el registro completa igual. **Verificado:** registro → 303 `/login?registered=1` → login → dashboard
    "Hola, Vecino · 0 listas · 0 visitados" con estado vacío y Editar perfil. **Checklist push a prod:** setear
    `RESEND_API_KEY` real para que la bienvenida sí se envíe.
  - **Decisión de chrome (2026-06-12, pedido del usuario):** **fuera "Explorar" del menú del header** (desktop y móvil)
    mientras no haya contenido real — se llega igual desde la home (buscador/chips/categorías); se re-promociona al
    lanzar. De paso: **"Eventos" del header era un link muerto (404,** la ruta se podó en 4E) → quitado; el nav del
    topbar queda vacío por ahora. **Footer arreglado:** 3 de 4 filtros de barrio usaban slugs viejos/equivocados
    (`Lastarria`→`barrio-lastarria`, `Italia`→`barrio-italia`, y Providencia es comuna → `?comuna=providencia`);
    verificado en runtime con el pill activo.
  - **Decisión de tarjeta (2026-06-10, feedback del usuario):** la mini-ficha usa **toda la tarjeta**, no solo la
    franja bajo la foto: **rating de Google superpuesto en esquina de la foto** + cuerpo (categoría·comuna, nombre)
    + fila inferior con **precio compacto (`$`…`$$$$`, Gratis como texto)** + **badge de línea de metro**. Implica
    **ampliar `PlaceCardView`** (sumar `metroLine {code,color}` opcional + su select en
    [placeCardView.ts](src/infrastructure/db/placeCardView.ts)) — hacerlo al implementar explorar. La `ListingCard`
    vieja se descarta (pedía tags/Premium/descripción que el modelo nuevo no da a la tarjeta). Brief actualizado:
    [4E_02_explorar.md](design_briefs/4E_02_explorar.md).
  - **4D hecha (2026-06-09):** [container.ts](src/lib/container.ts) reescrito al modelo `Place` — 20 factory
    functions cableando los adapters de 4C (PrismaPlaceRepository/User/Category/Tag/Collection/VisitHistory/
    Report + PostgresFTSSearchService + BcryptPasswordHasher + ResendEmailService). Adapters instanciados una
    sola vez (stateless sobre el cliente Prisma compartido). Borrado [formatMoney.ts](src/lib/formatMoney.ts)
    (código muerto, 0 consumidores; `Money` parqueado post-MVP). **`lib/` pasó de 34 → 2 errores**; los 2
    restantes están solo en [parseSearchParams.ts](src/lib/parseSearchParams.ts) (helper de presentación de
    explorar → se reescribe en 4E con la nueva `SearchParams`: tags sociales/accesibilidad/vibe/metro/comuna).
  - **Total de errores: 128 → 126.** Domain + application + infrastructure + `lib/container.ts` compilan en 0.
    Lo que falta = **4E presentation**: `app/` (118) + `components/` (6) + `parseSearchParams.ts` (2).
  - **4C hecha (2026-06-09):** capa de infraestructura reescrita al modelo `Place`, **compila en 0 errores**
    contra los 10 ports. Borrados 7 archivos del modelo viejo (Listing/Feed/Subscription/GoogleReview/
    Analytics/Review/Flow). Construido: `placeCardView` (select+mapper compartido de `PlaceCardView`),
    `PrismaPlaceRepository` (mapper agregado + `save` con upsert + sync de imágenes/tags en transacción +
    read-models `getDetailBySlug`/`findRelated` [relacionados sin IA: +3 categoría/+2 comuna/+1 por tag] +
    scoring bayesiano), `PostgresFTSSearchService` (`search` con filtros vivos + orden por score; `getFacets`
    con contadores por categoría/comuna/barrio/precio/línea de metro/tags + ocultar vacíos), repos
    Category/Tag/User/Collection/VisitHistory/Report, `ResendEmailService` adelgazado a `sendWelcome`.
    `BcryptPasswordHasher` y `UploadThingStorageService` revisados sin cambios.
  - **Decisiones de implementación de 4C:** filtros de tags = AND (cada filtro acota: silla de ruedas Y
    baño); dedup de historial por ventana de 6h; `globalAverageRating` (C del bayesiano) = promedio de
    `googleRating` de todo el catálogo con rating; facetas estáticas vía `groupBy`. **No ejercitada en
    runtime aún** (el container no la cablea y los tests se reescriben al cierre de Etapa 4): lo verificado
    es tipos + alineación con ports, no ejecución.
  - **4A + 4B hechas (2026-06-09):** reescritas las capas independientes de framework al modelo nuevo.
    Domain: `place/` (entidad `Place` con invariantes de tags SOCIAL≤4/VIBE≤3 + transiciones +
    `Score` bayesiano m=50), `catalog/TagLayer`, `collection/Collection`, `report/ReportReason`;
    `User` a USER/ADMIN+homeCommune (sin RUT); `Review` polimórfica 1–5. Application: **10 ports**
    (PlaceRepository = agregado + read-models; SearchService con facetas; Collection/Category/Tag/
    VisitHistory/Report/User; EmailService slim) + **21 use cases** (discovery, colecciones,
    historial, reporte, CRUD admin de Place, RecalculateScores). Borrados subsistemas post-MVP
    (Listing/Flow/claims/feed/analytics/subscription) y **los tests** (testeaban el modelo viejo →
    se reescriben al cierre de Etapa 4).
  - **La app sigue sin compilar** (presentation 4E aún apunta al modelo viejo): 126 errores restantes =
    `app/` (118) + `components/` (6) + `parseSearchParams.ts` (2). Estado intermedio esperado: domain,
    application, infrastructure y `lib/container.ts` ya compilan en 0 errores.
  - **Decisiones de diseño de 4B:** PlaceRepository devuelve `Place` (dominio) para load/save+scoring
    y read-models DTO (`PlaceDetailView`/`PlaceCardView`) para UI; SearchService sin métodos de
    indexado (Postgres FTS consulta la tabla). Exclusiones mutuas de tags (+18↔todas las edades) NO
    implementadas aún (faltan slugs del seed) — solo los límites de cantidad.
  - **Próximo paso real:** **4E presentation** — reescribir `app/` + `components/` al modelo `Place`
    (126 errores) + reescribir [parseSearchParams.ts](src/lib/parseSearchParams.ts) a la nueva `SearchParams`.
    Bloqueada por el gap de diseño (ver abajo). El push a **prod (Neon)** se hace junto con el redeploy de 4E.
  - **Gap de diseño 4E pendiente:** el usuario genera refs con Claude design; Claude prepara el
    paquete/prompt por pantalla al llegar a 4E (ver [[project_design_4e]] en memoria).
  - **Auth NO bloquea:** tablas de Auth.js + `passwordHash` ya estaban; `User` quedó con role
    admin/user, sin `rut`, con `homeCommune`. Verificación de email = decisión de flujo, Etapa 4.
- **Estado de los 4 entregables:** 1 (visión) ✅ · 2 (modelo de entidades) ✅ · 3 (matriz de
  permisos) ✅ · 4 (scope MVP) ✅ **APROBADO 2026-06-07.** Ver "Entregable 4 — Scope del MVP".
- **2026-06-07 — Revisión de la Etapa 1 + 3 pre-preguntas resueltas** antes de redactar el scope
  (ver "Pre-scope — decisiones del 2026-06-07"): dedicación/runway, ritmo de carga, y filtros vivos
  en el MVP. También se detectaron 2 reconciliaciones menores (origen de estrellas vía Apify, no a
  mano; remapear taxonomía vieja de filtros a las 7 categorías nuevas).
- **Bloque 6 (monetización) REABIERTO y definido el 2026-06-06** (modelo, no se construye en MVP):
  posicionamiento pagado, planes de ficha/eventos, newsletter por IA. Ver sección "Modelo de
  monetización".
- **Los 6 docs de `input/` ya se leyeron e integraron** (2026-06-06): contradicciones resueltas a
  favor de nuestras decisiones, refinamientos capturados. Ver "Refinamientos del modelo".
- **Modo de trabajo elegido:** conversado, por grupos / pregunta por pregunta.
- **Decisión transversal:** generar un **PRD** (visión + entidades + permisos + scope MVP) como
  norte permanente del proyecto.

### Próximo paso concreto
**Sub-productos de la Etapa 2 COMPLETOS (2026-06-07):** schema ([SCHEMA.md](SCHEMA.md)) ·
plantilla CSV ([PLANTILLA_CSV.md](PLANTILLA_CSV.md) + [input/plantilla_lugares.csv](input/plantilla_lugares.csv)) ·
[ARCHITECTURE.md](ARCHITECTURE.md) reescrito al modelo nuevo (150 líneas; apunta a SCHEMA.md para
datos). Lo que toca: que el usuario **revise/apruebe** schema + plantilla + arquitectura. Después →
**Etapa 3** (`prisma migrate reset` + migración + seed). **El seed debe poblar los catálogos ANTES
de cargar lugares** (FKs por slug): resolver los huecos **H2** (~143 estaciones metro), **H3**
(barrios por comuna) y **H4** (28 comunas faltantes de 52). El **mapeo Apify → plantilla** se hará
al ver el output de Apify (Etapa 5).

### Pre-scope — decisiones del 2026-06-07
_(Cerradas antes de redactar el entregable 4. Lo acotan directamente.)_

- **P1 — Dedicación / runway (Bloque 6.3/6.4):** **side-project serio** (horas fijas/semana, con
  trabajo aparte) y **sin runway**, pero **sin urgencia de monetizar** — proyecto de mediano-largo
  plazo. → Implicancia: MVP **lean, barato y por capas**. Cuidar **costos** (nada caro corriendo
  desde el día 1) y sobre todo **el tiempo del usuario** (recurso más escaso). El núcleo prueba el
  concepto; el resto entra de a poco.
- **P2 — Carga inicial y ritmo:**
  - El import **NO se botó**; lo que falló en el modelo viejo fue el schema/categorías sin definir,
    no la idea de importar. El commit `466c96b` botó el import de 1449, no la estrategia.
  - **Carga manual de ~10 fichas por el form de admin** primero → valida el modelo nuevo y el flujo
    de creación end-to-end.
  - **Carga grande por CSV/JSON curado.** Fuente (**Apify** vs **scraper propio**) = decisión de
    **costo**, se zanja en Etapa 5 (no afecta el scope). **Claude entrega la plantilla de columnas**
    (nombre/formato/obligatoriedad de cada campo) — sale **directo del schema** → sub-producto de la
    Etapa 2, disponible antes de cargar.
  - **Lanzamiento público con ~100 lugares** como techo, **paulatino**: soft-launch privado →
    **masa mínima** → público → **~20/semana** hasta 100+, con analytics corriendo.
  - **Criterio rector: densidad > cantidad.** Concentrar geográficamente (ej. 50 en Providencia +
    Ñuñoa) para que los filtros devuelvan resultados y el sitio se sienta con vida. Disperso = vacío.
- **P3 — Filtros vivos en el MVP + búsqueda por facetas:**
  - **Búsqueda por facetas con contadores** (rescata el patrón de la 1ª versión): cada filtro
    muestra cuántas fichas tiene al lado (*Gastronomía (24)*) y los filtros/categorías con **0
    fichas se ocultan** (o se desactivan en gris). Mata el "0 resultados decepcionante" y **disimula
    la baja densidad** del arranque.
  - **MVP = contadores estáticos + ocultar vacíos** (barato en Postgres). El **recálculo dinámico**
    (el contador de cada faceta se actualiza al combinar varios filtros) = refinamiento posterior.
  - **Filtros vivos en el MVP** (tienen data estructurada): *¿Con quién voy?* (contexto social) ·
    *¿Cuánto gasto?* (priceRange) · *¿Dónde?* (comuna/barrio/cerca del metro/al aire libre/
    estacionamiento) · *Accesibilidad* · *Ambiente*.
  - **Fuera del MVP:** *¿Cuándo?* (Hoy/finde/noches/feriados) → depende de **eventos (apagados)** y
    **horario estructurado (puerta abierta)**. Se oculta hasta que exista esa data; entra con eventos.
- **Reconciliaciones menores (anotadas, no bloquean):**
  - **Estrellas/reseñas de Google = del scrape de Apify ya curado en el CSV**, NO tecleadas a mano.
    Reconcilia B.7 ("a mano para evitar la API que daba 4xx") con la decisión de fotos: Apify ≠ la
    API key oficial que fallaba.
  - **Taxonomía de filtros del material de referencia** usa las 6 categorías **viejas**; al construir
    la UI de filtros (Etapa 4) **remapear a las 7 nuevas** (ya decidido en B.4).

---

## El principio que ordena todo

```
Producto (qué)  →  Entidades (datos)  →  Permisos (accesos)  →  Código
   Etapa 0            Etapa 1-2            Etapa 1-2          Etapa 2-5

Cada etapa solo se diseña cuando la anterior está clara. Nunca al revés.
```

Las preguntas van **primero**. Schema, permisos y código se derivan de ellas.

---

## Las 6 etapas

```
ETAPA 0 — Definir el producto   ✅ COMPLETADA (2026-06-04)
ETAPA 1 — Síntesis              ✅ COMPLETADA (2026-06-07)
ETAPA 2 — Diseñar schema nuevo  ✅ COMPLETADA + APROBADA (2026-06-08)  (= Paso 9.2)
ETAPA 3 — Migrar la BD + seed   🔄 local ✅, prod pendiente (va con 4E)  (= Paso 9.3)
ETAPA 4 — Refactor dominio + UI 🔄 4A ✅ · 4B ✅ · 4C ✅ · 4D ✅ · 4E ✅ — falta solo push a prod  (= Paso 9.4)
ETAPA 5 — Cargar lugares a mano 🔄 admin CRUD construido + verificado e2e ✅ — falta cargar el contenido  (= Paso 9.5)
```

---

## ETAPA 0 — Definir el producto (las preguntas)

Conversado, por grupos. De lo más fundamental a lo más estratégico.

| Sub-sesión | Bloques PRODUCTO.md | Qué definimos | Estado |
|---|---|---|---|
| **A. El norte** | 1, 7 | Qué es el producto + qué es el MVP mínimo | ✅ COMPLETADA |
| **B. Las entidades** | 2, 3 | Lugar vs Evento, sub-tipos, campos comunes vs específicos | ✅ COMPLETADA |
| **C. Usuarios y planes** | 4, 5 | Quién usa el sitio, qué da Free vs Premium (incluye permisos) | ✅ COMPLETADA (lado usuario; planes/premium parqueado) |
| **D. Lo estratégico** | 6, 8, 9, 10, 11 | Plata, validación, plataforma, crecimiento, IA | ✅ COMPLETADA (plata parqueada) |

**Nota sobre permisos:** el tema "qué puede/no puede hacer cada usuario" NO se trata
aparte. Cae dentro de la sub-sesión C (Bloques 4 y 5) y se formaliza como **matriz de
permisos** en la Etapa 1.

### Respuestas capturadas hasta ahora
_(se van llenando acá a medida que el usuario responde)_

**Sub-sesión A — El norte:**
- 1.1 ¿Qué es? — ✅ **"Portal Panorama es una plataforma para descubrir, decidir y guardar
  qué hacer en tu ciudad: lugares, panoramas y experiencias, todo centralizado."**
  - Se eligió "plataforma" (no "guía" = planes ya armados por otro; no "app" = solo
    celular). Plataforma deja abierta la futura app de "qué hacer ahora según
    ubicación + presupuesto" sin amarrarse a eso desde el inicio.
  - El abanico de contenido es ancho: restaurantes, parques/plazas, heladerías, hiking,
    talleres/clases (ej: pintura en pareja), eventos. No es solo "restaurantes y eventos".
- 1.2 ¿Para quién? — ✅ **"El organizador"** (nombre interno del usuario primario).
  - *"El que organiza los panoramas del grupo: joven (mediados de los 20), vive solo
    pero tiene pareja y grupo de amigos, es el iniciador/activo de las juntas, con plata
    justa para salir un par de veces al mes, ya aburrido de lo viral, que quiere acertar
    y quedar bien con su gente sin tener que investigar él mismo."*
  - Dolor central: quiere experimentar cosas nuevas pero **buscar cansa**.
  - Motivación: **mejor precio/calidad** (no botar la plata) + **quedar bien** socialmente.
  - Decisión de scope: **MVP enfocado 100% en el organizador**. La persona que recibe la
    invitación (pareja/amigo que no organiza) se diseña después.
- 1.3 ¿Qué da que Google/IG no? — ✅ **Diferenciador:** "Todo lo que hay que hacer en tu
  ciudad, centralizado en un solo lugar, con la info estructurada para **filtrar por tu
  necesidad** (familia, pareja, al aire libre, comuna, presupuesto) y comparar sin saltar
  entre apps."
  - **Pilar central = FILTRABILIDAD por contexto social** (el que, si falla, mata el
    producto; "nadie lo tiene"). La **centralización** es el cimiento que la hace posible
    — van juntas, filtrabilidad al frente.
  - Fallas concretas que ataca:
    - *Google Maps:* filtros pobres (no filtra por ocasión/necesidad), sin vista completa,
      difícil comparar, falta info.
    - *Instagram:* flujo engorroso (guardas y se pierde, no hay buscador, sin info
      práctica → terminas saltando a Google).
    - *Ambos:* eventos/ferias esporádicas imposibles de filtrar por comuna.
  - 5 fuentes de valor (de [PRODUCTO.md] y la conversación):
    1. Permanentes + eventos en un mismo directorio filtrable (nadie los mezcla bien).
    2. **Filtros de contexto social** (niños, pareja, gratis, pet friendly, comuna) — nadie lo tiene.
    3. Info operacional centralizada (horario, precio, reserva, cómo llegar) — hoy en 4 fuentes.
    4. Eventos chicos sin canal propio (ferias, talleres, pop-ups) — invisibles sin seguidores.
    5. Regiones ignoradas (Valpo, Conce, La Serena vacíos; 90% del contenido es Santiago).
- 1.4 La única cosa que hace bien — ✅ **La ficha completa, útil y estructurada.**
  - Insight clave: la ficha ES lo que habilita el filtro. No se puede filtrar por
    "tiene estacionamiento" o "apto niños" si ese dato no vive estructurado en la ficha.
    La ficha bien hecha es a la vez la **respuesta** (lo que el organizador lee para
    decidir) y la **materia prima del filtro**. Si la ficha es pobre, no hay producto.
  - Campos que el usuario nombró (input directo para entidades, Bloque 2/3):
    - **Lugar:** qué ofrece, métodos de pago, ubicación + **estación de metro cercana**,
      menú, horario, ¿reserva o solo llegar?, tags de servicio (baño, estacionamiento,
      zona fumadores, acceso silla de ruedas, pet friendly…).
    - **Evento:** ¿apto familia?, ¿apto niños?, ¿romántico/parejas?, canales oficiales /
      redes para saber más.
  - Caso de uso concreto pedido: filtrar/descubrir **por estación de metro**
    ("¿qué hay cerca de Los Leones?").
- 7.1 Si lanzaras UNA cosa — ✅ **MVP de lanzamiento:**
  - **~100 lugares**, los más mainstream / mejor valorados de Google Maps.
  - **Zona:** lo más transitado de la capital con varios puntos de conexión —
    Providencia, Ñuñoa, Santiago Centro, quizá Vitacura y Barrio Italia.
  - **Solo lugares, NO eventos** al inicio (los eventos son efímeros y no hay forma de
    conseguir la info por cuenta propia todavía).
  - **Guardar desde el día 1** → requiere **registro/login** para listas privadas.

**Sub-sesión B — Las entidades** _(cerrada 2026-06-03, a partir de los 6 docs de `input/`)_:

- **B.1 Evento = entidad propia.** Tabla `events` **separada** de los lugares, con FK
  **opcional** al local (`place_id` nullable → permite eventos sin local fijo: concierto
  en parque, feria itinerante). Un local puede tener muchos eventos; el evento tiene campos
  propios (puertas, duración, ticketera, expiración) y su categoría puede diferir de la del
  local (un bar que hace teatro). Se **descarta** el enfoque del doc 04 (evento como fila de
  `places` con `place_type='event'`). Razón: el doc 05 es el pensamiento más evolucionado.
- **B.2 El lugar es siempre permanente.** `place` no lleva campo "tipo". Toda la dimensión
  temporal (puntual / recurrente) vive en `events`. Lo **recurrente** (taller cada sábado,
  feria mensual) es un **sabor del evento** (flag `is_recurring`), no un tipo de lugar — y
  se trabaja más adelante junto con los eventos.
- **B.3 Lanzamiento = solo lugares.** El schema incluye `events` desde ya, pero al salir al
  aire se carga **solo contenido de lugares** (~100 en zonas conectadas de Santiago).
  Eventos = se encienden después. Schema preparado para no romper nada al activarlos.
- **B.4 Categorías = las 7 del doc 04** (se botan las 6 viejas): Gastronomía · Shows y
  entretenimiento · Arte y cultura · Naturaleza y aire libre · Talleres y actividades ·
  Ferias y mercados · **Locales y tiendas** (nueva). Al lanzar se muestran solo las que
  tienen lugares permanentes (**Gastronomía, Naturaleza, Arte y cultura, Locales y tiendas**);
  las event-only (Shows, Ferias, Talleres) quedan **registradas** en el catálogo y se
  encienden con los eventos.
- **B.5 Estructura de categoría de la ficha:** categoría principal **+ subcategoría = obligatorias**;
  categoría/subcategoría **secundaria = opcional** (una sola). Regla: la categoría la define el
  **uso real** del lugar, no lo que vende. Flujo "sugerir categoría faltante → pendiente de
  revisión" del doc 04 = **lado negocio (post-MVP)**; en el MVP el admin crea la categoría que
  falte directo. El schema prevé el estado "pendiente de revisión".
- **B.6 Sistema de tags = 4 capas del doc 04** (categoría → contexto social máx 4 → atributos
  específicos condicionales → vibe máx 3), con sus exclusiones mutuas. **Tag nuevo aportado por
  el usuario:** `tipo de cocina` (peruana, china, árabe, italiana, japonesa, chilena…) como
  **atributo condicional de Gastronomía**, multi-selección.
- **B.7 Reseñas/evaluación:** MVP muestra **estrellas + nº de reseñas de Google** (es dato
  necesario para comparar; idealmente ingresado **a mano** al cargar cada lugar para evitar la
  API/scraping de Google que daba problemas de key). **Sin reseñas escritas** en la plataforma
  todavía. **Visión futura** (schema lo debe prever): reseñas **propias con peso**, **usuarios
  con niveles** cuyas reseñas valen más, y mostrar las **mejores reseñas de Google** en la ficha.
- **B.8 Metro = opción B (manual).** Al cargar la ficha, campo **opcional** para la estación más
  cercana (o vacío si no aplica); **sin** distancia ni minutos a pie ni geocodificación en el MVP.
  Filtrable por estación/línea. La maquinaria automática (geocodificar + Haversine + nearest_stations)
  queda para v2.
- **B.9 Guardar = listas múltiples con nombre** (ej: "Citas", "Con los cabros"). **Compartir una
  ficha individual** (botón → link) = **sí en MVP** (barato). **Compartir una lista/colección** =
  según esfuerzo (el salto de valor sobre "listas múltiples" no es enorme → posible fast-follow).
- **B.10 Ficha lleva CTA "Cómo llegar / Indicaciones"** que abre el mapa (Google/Apple) en
  navegación hacia el lugar. Funciona solo con la dirección de texto → no requiere lat/lng.
- **B.11 Parqueado por decisión del usuario:** todo el modelo **gratis vs premium** (doc 03) y la
  **monetización** (doc 01) se definen más adelante. El schema preverá `is_premium` / propiedad de
  ficha, pero al lanzar **todo lo carga el admin y todo es gratis**; el self-service de negocios y
  los pagos son post-MVP.

**Sub-sesión C — Usuarios (lado consumidor)** _(cerrada 2026-06-04)_:

- **C.1 Niveles / reputación de usuario:** ❌ **fuera del MVP** y probablemente no se
  implemente nunca. A lo más en v2 un reconocimiento liviano tipo Google Maps (contador de
  aportes / votos), pero baja prioridad. **No es lo que el usuario busca.** El norte real es
  **IA: recomendaciones por IA**. Lo único que sí importa de este tema: que **existan reseñas
  propias** (no los niveles). Conecta con B.7.
- **C.2 Onboarding / home:**
  - **MVP:** home "por acción, sin encuesta forzada". El usuario **rechaza** las páginas que
    obligan a responder antes de ver contenido. Estructura: search bar + **fila social arriba**
    (*¿A quién llevas hoy?*: solo, en pareja, con amigos, en familia, con niños, con mascota) +
    **fila de categorías más buscadas** (Gastronomía, Al aire libre, Arte y cultura, Locales y
    tiendas). Los chips llevan directo a explorar ya filtrado. "Qué comer hoy…" como placeholder
    del buscador, no como botón. Objetivo: al llegar se entiende al toque qué hay, sin leer mucho.
  - **v2:** **mini-encuesta tipo pop-up (opcional / salteable) + IA** que recomienda según lo
    seleccionado. Conecta con el norte de recomendaciones por IA.
- **C.3 Perfil del usuario:**
  - **MVP:** cuenta básica (nombre, email, pass) **sin avatar** + **lugares guardados** (listas
    múltiples, B.9) + **comuna home** (opcional, ver C.3-bis) + **historial de lugares visitados**.
  - **Secciones del perfil:** "Mis listas / lugares guardados" (MVP) · "Mi historial" (MVP) ·
    **"Mis reseñas"** (la sección existe; contenido = v2) · **"Mis eventos guardados"** (separado
    de lugares; v2, pero el schema lo prevé).
  - **Preferencias guardadas** (contexto habitual): v2.
  - **Historial:** sirve de combustible para la IA más adelante. Cómo se modela en BD = se define
    en la Etapa 2.
- **C.3-bis Orden de resultados + comuna home:**
  - **Orden por defecto SIEMPRE = "reputación"** = puntaje calculado con **nota de Google ×
    cantidad de reseñas** (mejor primero). Es el motor de orden.
  - **Comuna home = preferencia opcional**, se puede dejar **vacía**. Si está vacía → la búsqueda
    usa solo el orden por reputación. Si el usuario la define (se le pide al registrarse:
    *"¿Quieres que al buscar aparezcan primero los de tu comuna?"*), su comuna sube primero **sin
    romper el orden por reputación dentro de ella**.
  - **Debe ser transparente y desactivable:** como la comuna es manual, en la búsqueda se muestra
    algo tipo *"Mostrando primero Providencia · cambiar"*, para que si el usuario está en otro
    lado (trabajo, casa de un amigo) lo vea y lo cambie. El dato nunca lo deja atrapado.
  - **Pendiente técnico (Etapa 2):** definir la **fórmula de reputación** que combina nota +
    cantidad (un 5.0 con 3 reseñas no debe ganarle a un 4.7 con 2.000).
- **C.4 lat/lng (ajusta B.8):** se **guarda la coordenada desde el MVP** (viene **gratis** en el
  scrape de Google Maps de los mejor valorados). El botón "cómo llegar" (B.10) se hace solo con la
  **dirección de texto**; el **mapa** y el **"cerca de mí"** (ordenar por distancia) necesitan
  **lat/lng**, por eso se captura ahora aunque la UI de mapa/distancia/metro-automático se
  construya en **v2**. Separamos **dato** (barato hoy) de **feature** (después). Campos al cargar
  un lugar: dirección de texto (calle+número+comuna) · lat/lng · estación de metro (manual,
  opcional). Nuevo deseo: **vista de mapa al filtrar** + **"cerca de mí" por geolocalización** = v2.
- **C.5 Self-service del dueño (v2, parqueado con B.11):** cuando los locales creen/reclamen su
  ficha, el camino lógico para obtener lat/lng será **pegar el link de su Google Maps** (principal
  — además sirve de prueba de propiedad y rellena dirección/estrellas/reseñas/horario de una), con
  **geocoding de la dirección** como respaldo. No bloquea nada del MVP: el schema solo necesita el
  campo `lat/lng`, que ya se guarda desde el MVP.

**Sub-sesión D — Lo estratégico** _(cerrada 2026-06-04 — Bloques 8, 9, 10, 11; el 6 queda parqueado)_:

- **D.1 Validación (Bloque 8):** la métrica que importa NO es el volumen bruto sino el
  **comportamiento**: **activación** (% de visitantes que crea cuenta o **guarda** un lugar),
  **retención** (¿vuelven?), **engagement por ficha** (tiempo en ficha, fichas/sesión) y
  **save rate** (% que guarda ≥1 lugar). El piso que propuso el usuario ("~1000 visitas +
  ~10 cuentas") se conserva como **mínimo de tráfico** para que las otras métricas tengan
  sentido, **no** como la prueba de validación. Plazo: **al menos 1 mes** corriendo.
- **D.2 Instrumentación desde el día 1 (va al MVP):** trackear todo desde el lanzamiento.
  **GA4** (visitas, tiempo de sesión, páginas/sesión, embudos) + **Meta Pixel** + **Google
  tag/Ads** (retargeting y medición de campañas) + **eventos custom** (guardar, crear cuenta,
  compartir) para medir activación/save rate. → tarea de infraestructura del MVP. Implica una
  **página legal de privacidad/cookies** (ver Ítems abiertos).
- **D.3 Plataforma (Bloque 9):** **web mobile-first en el MVP** (en Chile el tráfico web es
  ~70-75% celular y el organizador busca con el teléfono en la calle; desktop importa para que
  las fichas SEO se vean bien). **PWA como puente** (instalable + push) cuando se enciendan
  eventos, sin construir nativo. **App nativa solo post-validación de retención** (probablemente
  React Native). Honra la palabra "plataforma" sin amarrarse a la app desde el inicio.
- **D.4 Crecimiento (Bloque 10):** primer usuario llega por **SEO orgánico + Instagram + foros**
  (pseudo-campaña de lanzamiento). **SEO = pilar, no adorno**, y conecta con "la ficha es el
  producto" (A.1.4): cada lugar cargado es un anzuelo de tráfico gratis y permanente. Realista:
  ganar en búsquedas de **intención/descubrimiento** ("dónde comer en Providencia con niños"),
  no tanto en la búsqueda de marca ni sobre Google Maps. **Implicancia técnica (Etapa 2/4):**
  SSR/SSG, metadata por lugar, slugs limpios, **datos estructurados schema.org `LocalBusiness`
  (JSON-LD)**, sitemap, buen rendimiento. Contenido: ~100 lugares cargados a mano + datos del
  scrape de Google Maps de los mejor valorados (lat/lng, estrellas, reseñas, horario).
- **D.5 GEO/AEO — "SEO de los chatbots" (insight del usuario, 2026-06-04):** optimizar para que
  Claude/ChatGPT/Gemini **citen la ficha** cuando alguien pide panoramas. Clave: es **casi el
  mismo trabajo que el SEO** (contenido estructurado, factual, schema.org). La inversión en "la
  ficha bien hecha" paga **triple**: humano + Google + LLMs. Refuerza la decisión de fichas
  estructuradas desde ya.
- **D.6 IA (Bloque 11):**
  - **11.1 ¿Central o secundaria?** → **Central como visión/norte**, **ausente del MVP**. El
    producto se diseña sabiendo que la IA viene (data preparada: fichas estructuradas, historial,
    tags).
  - **11.2 ¿Qué resuelve que un filtro NO puede?** Solo dos cosas son IA-only de verdad:
    (a) **armar el panorama encadenado** (plan coherente café→parque→bar cruzando geo + horario +
    presupuesto + con quién; un filtro da lista, no plan) y (b) **recomendar por gusto/historial**
    (inferir el gusto, no aplicar reglas fijas). La **búsqueda en lenguaje natural ≈ un buen
    filtro** (bajo valor marginal; a lo más capa de entrada para enganchar nuevos, a testear).
  - **11.3 ¿MVP o Fase 2+?** → **Fase 2+**. Único guiño posible en MVP: **"relacionados" al final
    de la ficha** hechos **sin IA real** al inicio (similitud por tags + categoría + comuna, pura
    query SQL), upgradeable a embeddings después. Rampa ideal.
  - **Tensión estratégica capturada (catch del usuario):** si la IA entrega "la" respuesta, mata
    la superficie de **browse rankeado**, que es el inventario del futuro **posicionamiento
    pagado**. Resolución: la IA va **encima** del browse (capa de asistencia), no en vez de él; y
    el posicionamiento pagado puede vivir dentro de la IA (recomendación patrocinada y declarada).
    Como la monetización está parqueada (B.11), solo se **registra la tensión** para no diseñar una
    IA que se coma su propia fuente de ingresos.
- **D.7 Modelo de negocio (Bloque 6):** **sigue parqueado** por decisión del usuario. El MVP no
  tiene ruta de ingresos y eso es una decisión consciente, no un olvido.

### Ítems de la sub-sesión D — RESUELTOS (2026-06-04), entran al scope/schema de la Etapa 1-2

1. **Fotos de las fichas — RESUELTO.**
   - **Schema:** **galería** por lugar (foto **principal** + resto) + campo **crédito/origen**.
   - **Storage:** descargar la imagen y **re-alojarla en almacenamiento propio** — **UploadThing
     _o_ Vercel Blob** (equivalentes; se zanja en implementación, Etapa 4). **Prohibido** guardar
     base64 en la BD o hacer hotlink de la URL externa (las URLs de Google expiran y rompen). Se
     guarda **tu** URL. Ambos proveedores sirven para la **carga admin** (SDK de servidor) y para
     el **self-service del local** (componente de navegador) — mismo storage, sin reconstruir nada.
   - **Sourcing MVP:** scraper propio o **Apify** (devuelve en un tiro fotos + estrellas + nº
     reseñas + horario + lat/lng), **priorizando las fotos que el propio local ya publicó** (su
     web/IG). Legalmente es zona gris para scraped → mitigar con crédito + bajar si lo piden.
   - **Carga:** **Excel/CSV curado de ~100 filas** → script de import que por cada fila descarga la
     imagen y la re-aloja (Etapa 5; **depende del schema**, no se construye aún). Es **distinto**
     del import de 1449 descartado (ese falló por modelo confuso; 100 con modelo claro es válido).
   - **Rights-clean a futuro (insight de negocio):** el self-service del local sube sus propias
     fotos (derechos limpios) **+ ofrecer servicio de fotos "profesionales"** → derechos 100%
     propios, **calidad visual consistente** y **posible fuente de ingresos**.

2. **Frescura de la data — RESUELTO.** Mitigación en capas:
   - **En el origen (lo más fuerte):** lanzar con contenido **estable/constante** — gratis y/o
     "virales" conocidos: plazas, museos, bibliotecas, cerros, bares y cafés conocidos. Casi no
     cambian → poca pega de mantención.
   - **Disclaimer** en la ficha: los horarios pueden variar según fecha (ferias, feriados) →
     verificar en la **web/redes del lugar**.
   - **Botón "reportar dato incorrecto / lugar cerrado"** → frescura colaborativa gratis + señal
     de engagement.
   - **Revisión manual** del admin cada **~2-3 meses** (manejable con 100 lugares).

3. **Listas curadas / editorial — RESUELTO.**
   - **Schema:** modelar la **colección** de forma que sirva para **listas privadas de usuario
     (B.9) Y listas curadas públicas**, con flag `is_curated`/tipo + **slug** + descripción
     editorial. Puerta abierta a costo casi nulo (reúsa la infra de listas de usuario).
   - **MVP:** lanzar **3-5 listas curadas** como landing pages de **SEO** ("mejores X de Y"),
     reusando esa misma infra (el admin las arma, **sin** montar CMS/blog aparte). Alto retorno
     SEO + "vida", bajo costo.
   - **Blog** como motor de contenido aparte = **más adelante** (post-MVP).

4. **Página legal de privacidad/cookies — RESUELTO (tarea, no decisión).** Obligatoria al usar
   GA4 + Meta Pixel + guardar historial. Crear **política de privacidad + aviso de cookies** según
   requerimientos legales chilenos (Ley 19.628) y estándares. Tarea del scope MVP.

### 🅿️ Oro parqueado (insights que aparecieron y van a otros bloques)
- **Guardar/organizar favoritos** — hoy el usuario usa listas de Google Maps pero las
  encuentra restrictivas; quiere algo más visual y ordenado. → va a 1.3 (diferenciador)
  y a entidades (listas/colecciones del usuario).
- **App "qué hacer ahora"** — sugerir panoramas según ubicación + presupuesto en el
  momento. → MVP / más adelante (no base).
- **Datos para decidir (campos de un lugar):** distancia / qué tan lejos, ticket
  promedio o menú, reseñas, imágenes, y **cercanía a línea/estación de metro**.
  → va a entidades (Bloque 2/3).
- **Ocasiones de uso (el "para qué"):** me junto con un amigo o cita y no sé qué hacer;
  qué hay de nuevo; tengo tiempo libre justo ahora; hora de almuerzo, dónde bajoneo
  cerca. → alimenta 1.2 (para quién) y 1.4 (la cosa que hace bien).
- **Notificaciones / suscripción por tema o palabra clave** — el usuario se suscribe a
  un tema (ej: conciertos, stand-up) y le avisan cuando entra un evento nuevo que
  matchea. → post-MVP, pero el modelo de datos debe poder soportarlo.
- **Compartir ficha** — enviar un lugar/evento a la pareja o al grupo ("mira, me tinca
  este lugar, ¿qué les parece?"). → entidades (la ficha debe ser compartible) + post-MVP.
- **Lado de OFERTA (insight estratégico)** — además del organizador (consumidor), hay
  dueños de eventos/lugares chicos sin canal propio (ferias, talleres, pop-ups) que hoy
  no tienen dónde publicar. Define modelo de negocio: ¿quién paga?, ¿quién carga
  contenido? → se trata a fondo en sub-sesión C (usuarios y planes).
- **Panorama encadenado / descubrir por cercanía** — el evento es el ancla; alrededor
  mostrar qué comer/tomar antes o después ("¿qué hay cerca?"). → post-MVP, pero exige
  buena geolocalización en la data (refuerza lo del metro/lat-lng).
- **Filtrar por región** — hoy todo es Santiago; sumar Valpo, Conce, La Serena, etc.
  → más adelante.
- **Búsqueda en lenguaje natural** — "panorama para este finde, en familia, en X comuna,
  presupuesto Y → recomiéndame". → post-MVP; refuerza que la data debe estar bien
  estructurada desde ya.
- **Estrategia de eventos (post-MVP)** — primero juntar datos de visita con lugares →
  luego contactar organizadores → ofrecerles publicar; a los **primeros ~20, plan
  premium gratis** para recolectar data. Resuelve el lado de oferta. → sub-sesión C/D.
- **Listas curadas por la página** ("10 bares imperdibles") — DECISIÓN ABIERTA: ¿feature
  dentro de la app o blog para SEO? → resolver en scope MVP (Etapa 1).
- **IA como norte real del producto** (2026-06-04) — el usuario es claro: lo que de verdad
  busca es **recomendaciones por IA**, más que gamificación/niveles. → se trabaja a fondo en
  sub-sesión D; el modelo de datos (historial, contexto, reseñas) debe quedar preparado para
  alimentarla. La mini-encuesta + IA de C.2 es una primera expresión de esto.
- **Filtrar por plato + reseña por plato (Gastronomía)** (2026-06-04) — diferenciador fuerte:
  buscar un plato (ej: "completo") y que liste **todos los lugares que lo venden**, y dentro de
  la ficha poder **reseñar un plato puntual** (el local puede ser bueno pero el plato X malo).
  **Complejo en BD** (suena a tabla `dishes` + relación con `places` + reseñas a nivel de plato).
  Conecta con reseñas propias (B.7) y el tag "tipo de cocina" (B.6). → al diseñar el schema
  (Etapa 2) decidir si dejamos la **puerta abierta** en el modelo aunque no se implemente en MVP.

---

## 📎 Material de referencia para sub-sesión B (taxonomía de filtros)

_(Aportado por el usuario el 2026-06-02 — mockup de filtros por categoría + insights.
Transcrito porque las imágenes no quedan versionadas. Insumo directo para entidades.)_

**Categorías (tabs):** Todos · Restaurantes y bares · Eventos y shows ·
Lugares y parques · Talleres y actividades · Ferias y mercados.

**Filtros universales (aplican a TODO, sin importar el tipo):**

- **¿Con quién voy?** — Solo/a · En pareja · Con amigos · En familia ·
  Con niños pequeños · Con adultos mayores · Con mascotas · Grupo grande.
- **¿Cuánto gasto?** — Gratis · Menos de $5.000 · $5.000–$15.000 ·
  $15.000–$30.000 · Más de $30.000.
- **¿Cuándo?** — Hoy · Este finde · Esta semana · Solo noches · Solo tardes · Feriados.
- **¿Dónde?** — Comuna · Barrio · Cerca del metro · Al aire libre ·
  Con estacionamiento · Accesible en micro.
- **Accesibilidad** — Acceso en silla de ruedas · Baño disponible ·
  Cambiador de pañales · Zona de lactancia.
- **Ambiente general** — Tranquilo · Animado · Familiar · Íntimo · Fotogénico · Sin reserva.

**Insights clave a recordar al diseñar el modelo:**

1. **"¿Con quién voy?" es el filtro más poderoso y el más ignorado por las plataformas
   existentes.** Es la PRIMERA pregunta real que se hace la gente — no el precio ni la
   categoría. Diseñar el onboarding desde ahí ("¿A quién llevas hoy?") cambia toda la
   experiencia de búsqueda.
2. **La info que más falta es operacional, no de marketing:** horario real en feriados,
   si requiere reserva, qué pasa si llueve, cuánto demora la lista de espera en promedio.
   Ningún negocio la publica solo porque no sabe que la gente la busca.
3. **Las ferias son el caso extremo de frustración:** la gente llega y no estaba (o estaba
   a medias). Un botón de confirmación semanal ("confirmamos para este sábado") por sí
   solo ya justificaría instalar la plataforma. → relevante cuando entren eventos/ferias.

---

## ETAPA 1 — Síntesis (entregables)

Cuando la Etapa 0 esté completa, se producen 4 entregables que el usuario aprueba:

1. ✅ Visión del producto en 1 párrafo (aprobada 2026-06-05)
2. ✅ Modelo de entidades definitivo (lugar/evento, sub-tipos, campos) (aprobado 2026-06-05)
3. ✅ Matriz de permisos (rol × plan × acciones) (aprobada 2026-06-06)
4. ✅ Scope del MVP (aprobado 2026-06-07) — ver abajo

### Entregable 4 — Scope del MVP (APROBADO 2026-06-07)

Restricción transversal (de P1): **lean, barato, por capas, densidad > cantidad.** El núcleo
prueba el concepto; el resto entra de a poco.

**✅ SÍ entra al MVP:**
- **Contenido:** ~100 lugares permanentes (techo), carga paulatina (10 a mano → soft-launch → masa
  mínima densa → ~20/semana). Concentrados en pocas zonas conectadas (Providencia + Ñuñoa primero).
  Solo 4 categorías con lugares: Gastronomía · Naturaleza y aire libre · Arte y cultura · Locales y
  tiendas.
- **Ficha:** completa y estructurada (nombre, descripción, cat+subcat, dirección, comuna/barrio,
  lat/lng, metro manual, priceRange, contacto/redes, horario texto libre, métodos de pago, reserva
  sí/no, galería con crédito) · estrellas + nº reseñas de Google (scrape Apify) · tags 4 capas · CTA
  "Cómo llegar" · compartir ficha · bloque "relacionados" (sin IA: tags + categoría + comuna).
- **Búsqueda/filtros (el pilar):** facetas con contadores + ocultar vacíos (estáticos). Filtros
  vivos: ¿Con quién voy? · ¿Cuánto gasto? · ¿Dónde? · Accesibilidad · Ambiente. Orden por defecto =
  reputación. Home "por acción" (search + chips sociales + chips de categoría).
- **Usuario:** cuenta básica (sin avatar) · listas múltiples con nombre · historial de visitados ·
  comuna home opcional (transparente/desactivable). Secciones "Mis reseñas"/"Mis eventos guardados"
  existen vacías.
- **Crecimiento/infra:** SEO día 1 (SSR/SSG, slugs, metadata por lugar, JSON-LD `LocalBusiness`,
  sitemap) · 3-5 listas curadas como landing SEO · instrumentación (GA4 + Meta Pixel + Google tag +
  eventos custom) · página de privacidad + cookies · botón "reportar dato incorrecto/cerrado" ·
  web mobile-first.

**🔜 NO ahora, pero pronto (v2 — puertas abiertas en schema):** eventos (y con ellos filtro
¿Cuándo?, "próximos eventos aquí", eventos guardados) · reseñas propias con peso + niveles ·
IA (recomendación por gusto/historial, panorama encadenado, mini-encuesta onboarding, lenguaje
natural) · self-service de negocios (Free/Premium) + posicionamiento pagado + newsletter por IA /
suscripción por keyword · mapa + "cerca de mí" + metro automático · recálculo dinámico de facetas ·
compartir colección · horario estructurado ("abierto ahora") · PWA.

**❌ Se descarta (no va en este producto por ahora):** niveles/gamificación de usuario (a lo más
contador liviano en v2) · app nativa antes de validar retención · venta de entradas/ticketera propia
(se enlaza a la del organizador) · import masivo sin curar (el de 1449).

**Decisión `Dish`/platos (2026-06-07):** **puerta abierta barata, sin tabla ni app ni API en MVP.**
NO se crea tabla `Dish`. SÍ se diseña `Review` (v2/apagada) con el **objetivo reseñado extensible**
(hoy Place; mañana Dish/Event sin romper). Cuando lleguen los platos = módulo nuevo que se enchufa.
La idea de **app aparte + API** (que conecta con GEO/AEO, D.5) = **oro parqueado / visión futura**,
no pega del MVP; con buen modelo, exponer API después es trivial.

### Entregable 3 — Matriz de permisos (APROBADA 2026-06-06)

**Regla de oro:** el **usuario siempre ve toda la info** que existe en la ficha. El plan del negocio
solo cambia **qué autogestiona** y sus **herramientas de conversión/visibilidad** — nunca qué ve el usuario.

**A) Lado consumidor (vive en el MVP):**

| Acción | Visitante | Usuario | Admin |
|---|:---:|:---:|:---:|
| Explorar / filtrar / buscar | ✅ | ✅ | ✅ |
| Ver ficha completa + toda su info | ✅ | ✅ | ✅ |
| Ver listas curadas (landing SEO) | ✅ | ✅ | ✅ |
| Compartir ficha / "Cómo llegar" | ✅ | ✅ | ✅ |
| Reportar dato incorrecto / cerrado | ✅ | ✅ | ✅ |
| Guardar en lista | ❌ → invita a registro | ✅ | ✅ |
| Crear/renombrar/borrar listas propias | ❌ | ✅ | ✅ |
| Comuna home · "Mi historial" | ❌ | ✅ | ✅ |
| Escribir reseña propia *(v2)* | ❌ | 🔒 v2 | 🔒 v2 |
| Suscribirse a keyword/tema *(post-MVP)* | ❌ | 🔒 | 🔒 |
| Gestión total de contenido (CRUD lugares, categorías, tags, listas curadas, fotos, reportes, vender slots) | ❌ | ❌ | ✅ |

**B) Lado negocio (post-MVP — el admin hace todo en el MVP):**

| Acción | Negocio Free | Negocio Premium |
|---|:---:|:---:|
| Reclamar ficha + editar info básica | ✅ | ✅ |
| Subir/gestionar fotos · descripción | ✅ | ✅ |
| Responder reseñas · responder reportes | ✅ | ✅ |
| Subir 1 evento gratis | ✅ | ✅ |
| Editar categoría/subcategoría | ❌ (admin) | ✅ |
| Editar vibe / atributos personalizados | ❌ (admin) | ✅ |
| Estadísticas (vistas/guardados/clics) | ❌ | ✅ |
| Card destacada + badge | ❌ | ✅ |
| Mini-banner de ofertas · botón reserva/CTA | ❌ | ✅ |
| Subir/destacar más eventos | ❌ | ✅ |
| Acceso a posicionamiento pagado | ❌ (add-on / admin a mano) | ✅ |

### Entregable 1 — Visión del producto (APROBADA 2026-06-05)

> **Portal Panorama es una plataforma para descubrir, decidir y guardar qué hacer en tu
> ciudad** —lugares, panoramas y experiencias, todo centralizado en un solo lugar. Está
> pensada para **"el organizador"**: el que arma los planes del grupo y quiere acertar sin
> tener que investigar saltando entre Google, Instagram y mil pestañas. Su diferenciador es
> la **filtrabilidad por contexto social** (con quién voy, presupuesto, comuna, al aire
> libre, apto niños/mascotas) construida sobre **fichas completas y estructuradas** —porque
> la ficha bien hecha es a la vez la respuesta que se lee para decidir y la materia prima del
> filtro. El MVP arranca con **~100 lugares permanentes** de las zonas más conectadas de
> Santiago, con registro para **guardar en listas**, y está diseñado desde el día 1 para
> crecer hacia **eventos, recomendaciones por IA y posicionamiento de negocios**, sin
> amarrarse a ninguno de ellos todavía.

### Entregable 2 — Modelo de entidades (APROBADO 2026-06-05)

Modelo **conceptual** (entidades + campos). Los tipos exactos del `schema.prisma` se fijan
en la Etapa 2. Decisiones de modelado tomadas: tags como **tabla relacional** (no JSON),
`Review` y `Report` se crean ahora aunque vacíos/apagados, y `Dish` queda como puerta abierta.

**🏠 `Place` (Lugar)** — entidad central del MVP, siempre permanente, sin campo "tipo":
- Identidad: `id` (cuid2) · `slug` · `name`
- Categorización: categoría principal + subcategoría **(obligatorias)** · cat/subcat secundaria **(opcional, una sola)**
- Contenido: descripción / qué ofrece · menú o link
- Ubicación: dirección de texto · `commune` (FK) · `neighborhood` (FK opcional) · `lat`/`lng` · `metroStationId` (FK opcional)
- **Presupuesto: `priceRange`** (enum: Gratis · <$5.000 · $5.000–15.000 · $15.000–30.000 · >$30.000)
- **Contacto: `phone` · `website` · redes sociales** (Instagram, etc.) — todos opcionales
- Operacional: `horario` (texto libre en MVP; estructurar por día = puerta abierta para badge "Abierto ahora") · métodos de pago · ¿reserva o solo llegar?
- Reputación Google: `googlePlaceId` · `googleRating` · `googleReviewCount`
- Reputación calculada: `score` (nota × nº reseñas — fórmula en Etapa 2)
- Galería: foto principal + resto · crédito/origen (storage propio, nunca base64/hotlink)
- Tags: 4 capas (ver `Tag`)
- Propiedad/estado: `isPremium` (parqueado, default false) · `ownerId` (nullable, self-service post-MVP) · estado pendiente-revisión / publicado

**🎫 `Event`** — en el schema desde ya, **apagado** en MVP. FK `placeId` nullable · categoría
propia · fecha/puertas · duración · ticketera/link · expiración · `isRecurring` · apto familia/
niños · romántico · canales oficiales · tags propios.

**🗂️ `Category` + `Subcategory`** — catálogo de 7 categorías. Al lanzar solo se muestran las con
lugares (Gastronomía, Naturaleza, Arte y cultura, Locales y tiendas); event-only (Shows, Ferias,
Talleres) registradas pero apagadas.

**🏷️ `Tag`** — tabla relacional, sistema de 4 capas con exclusiones: contexto social (máx 4) ·
atributos condicionales por categoría (ej `tipo de cocina` multi en Gastronomía) · vibe (máx 3).

**🚇 `MetroStation` + `MetroLine`** — catálogo. Estación → línea; la línea lleva su **color**
(L1 roja, L2 amarilla, L3 café, L4 azul, L4A celeste, L5 verde, L6 morada — colores exactos por
afinar). Place tiene FK opcional a estación. Filtrable por estación y por línea.

**📍 `Commune` + `Neighborhood`** — `Neighborhood` vinculado a su `Commune`, pero el Place es
**filtrable independiente** por barrio o por comuna (dos barrios reconocidos en la misma comuna
se filtran por separado; la comuna sirve para periferia sin barrio reconocido).

**👤 `User`** — cuenta básica: nombre, email, password (**sin avatar**) · `homeCommune` (opcional) · `role` (admin / user).

**📚 `Collection`** — **una sola entidad** para listas de usuario Y listas curadas: `name` ·
`ownerId` (nullable si curada) · `isCurated` · `slug` (curadas, SEO) · descripción editorial.
`CollectionItem` = relación Collection ↔ Place.

**🕓 `VisitHistory`** — lugares visitados del usuario (combustible IA): `userId` · `placeId` · timestamp.

**Puertas abiertas (creadas/registradas, no implementadas en MVP):**
- `Review` (reseña propia con peso) — sección "Mis reseñas" vacía; contenido v2 → **se crea ahora**
- `Report` (reportar dato incorrecto / lugar cerrado) → **se crea ahora**
- `Subscription` (suscripción por tema/palabra clave para avisos de eventos) → puerta abierta
- `Dish`/platos (filtrar y reseñar por plato) → puerta abierta (decidir campo/tabla en Etapa 2)
- Saved events (eventos guardados, separados de lugares) → v2
- Horario estructurado por día (para badge "Abierto ahora") → puerta abierta

### Modelo de monetización (Bloque 6 — REABIERTO 2026-06-06)

Se reabre el Bloque 6 para definir el **modelo** (no se construye en MVP; solo deja las puertas
abiertas en el schema). **Principio rector (del usuario):** nunca se gatea la info útil — la ficha
completa es gratis para todos, siempre. Se monetiza la **visibilidad**, no la **información**, y
toda visibilidad pagada es **declarada y transparente** (resuelve la tensión IA-vs-browse de D.6).

**Fuentes de ingreso:**
1. **Posicionamiento pagado / publicidad declarada.**
   - Layout aprobado (mockup del usuario, 2026-06-06): **zona dedicada "Publicidad pagada"** arriba,
     separada y etiquetada, con **hasta 3 slots**; **debajo, bloque aparte "resultado filtro por
     score"** sin contaminar. La separación visual ES la transparencia. En mobile la fila de 3 se
     vuelve carrusel/stack (UI).
   - **Home:** carrusel ("lo nuevo", "lo mejor de la semana", "lo más valorado") donde **uno de los
     ítems puede ser premium/patrocinado** (mecánica fina por definir).
   - **Cobro: tarifa plana mensual** por contexto (ej "sushi en Providencia"). CPC/subasta = después si hay demanda.
   - **Relevancia:** el aviso va **acotado a su categoría/comuna** (útil, no spam).
   - **Venta:** el **admin vende a mano** al arranque, apuntando a una ficha **con o sin** dueño
     (`SponsoredPlacement` puede existir sin owner). El norte: que el negocio **reclame su ficha**
     para **traspasarle la mantención** (frescura) — con el tiempo, destacarse probablemente exija
     haber reclamado.
2. **Planes de ficha de negocio (self-service, post-MVP).** Free: reclama ficha + toda la info (ya
   completa) + sube/gestiona fotos + **1 evento gratis** + **responder reportes** + **responder
   reseñas** (Free a propósito: fomenta interacción → más vida en la ficha). Premium **agrega
   promoción/herramientas, NO info**: estadísticas (vistas/guardados/clics), card destacada con
   badge, mini-banner interno con ofertas, botón de reserva, subir/destacar más eventos, acceso al
   posicionamiento pagado.
   - **Resolución contradicción doc 03 (#2, 2026-06-06):** el **usuario siempre ve toda la info que
     existe** (galería, descripción, tags) — nunca se le gatea info. Lo que el plan controla es qué
     puede **autogestionar el negocio** + las herramientas de conversión/visibilidad, no qué ve el
     usuario. Esto **anula** el gateo de galería/descripción/responder-reseñas que proponía el doc 03.
3. **Planes de eventos (post-MVP) — modelo del doc 05.** Visibilidad = **plan del local × tier del
   evento** (escalera):
   - Local gratis + evento gratis → **solo** en la ficha del local.
   - Local premium + evento gratis → ficha + búsquedas de categoría (no home/destacados).
   - Cualquier local + **evento destacado** ($4.990–$6.990) → home, "Esta semana", búsquedas, ficha.
   - **Plan productora** ($29.990–39.990/mes) → todos sus eventos del mes destacados + **página de productora propia**.
   - **Plan venue/recinto** ($49.990–69.990/mes) → todo lo de productora + agenda integrada del
     recinto + notificación a seguidores. Para recintos/bares con shows recurrentes y organizadores
     de ferias (suben muchos eventos).
   - `max_free_events` = **1** por local. **Expiración automática:** el evento se archiva al día
     siguiente de su fecha (no se borra → historial del local). Destaque también vendible **por
     palabra clave**. Primeros ~20 organizadores: premium gratis (data). La ficha de lugar tiene
     sección **"Próximos eventos en este lugar"** (`Event.placeId`).
4. **Servicio de fotos profesionales** (ya capturado en "fotos RESUELTO").
5. **Upsell de servicios (más adelante):** marketing, automatizaciones, consultorías + un **hub con
   material gratuito** de presencia online (estilo "optimiza tu Google My Business"). Oro parqueado.
6. **Newsletter / notificaciones (post-MVP, ingreso a futuro).** Envío **personalizado por IA**
   según **palabras/temas a los que el usuario se suscribe** (ej: "eventos del finde", "solo
   conciertos de rock"). **Gratis al inicio** (canal de adquisición + hábito). Monetización futura:
   **vender posición patrocinada dentro del newsletter del keyword relevante** (ej: un venue de rock
   paga por aparecer en el envío de "conciertos de rock"). **NO** cobrar por estar listado (no
   sirve). Conecta con `Subscription` (user → keyword/tema) y el motor de matching/IA.

**Implicancia de schema (puertas abiertas, no se construye en MVP):** `SponsoredPlacement`/
`Promotion` (ficha + contexto + vigencia, con o sin owner), la dimensión `Plan` (más allá del
`isPremium` ya previsto) y `Subscription` (user → keyword/tema, alimenta newsletter + avisos).

### Refinamientos del modelo (de los 6 docs de `input/`, 2026-06-06)

Tras leer los 6 docs completos. **Regla:** donde un doc contradice una decisión nuestra, **gana la
decisión nuestra** (los docs son borradores previos). Decisiones tomadas:
- **Contradicción #1 (schema):** los docs 04/05/06 asumen tabla única `places` con `place_type`
  ('permanent'|'event'|'recurring'). **Anulado** → `events` es tabla separada con FK opcional (B.1).
  Los SQL de los docs valen como referencia de **campos**, no de estructura.
- **Contradicción #3 (colores metro):** el doc 06 tiene L3/L6 mal. Se usan los **reales**:
  L1 roja `#E1251B` · L2 amarilla `#F5A800` · **L3 café** · L4 azul `#004F9F` · L4A celeste
  `#009CDE` · L5 verde `#00A651` · **L6 morada**. (Hex de L3/L6 reales por confirmar al cargar.)
- **C — tags de "Logística de acceso":** 4º grupo universal propio (estacionamiento propio/cercano,
  bicicletero, accesible en micro, requiere auto). "Cerca del metro" NO es tag manual → sale de la
  relación con `MetroStation`.
- **D — campos extra de ubicación:** `accessDetail` ("Entrada por Espacio B, 2° piso") y `reference`
  ("frente al Jumbo") = texto opcional. `rainPolicy` (enum se suspende/se traslada/continúa) =
  opcional, solo en categorías al aire libre.
- **E — metro:** `MetroStation.lines` es **array** (combinaciones tipo Baquedano L1+L5 = doble
  color). L7/L8/L9 **fuera** del catálogo (faltan años). Filtro por línea = **múltiple** (L1 *o* L3).
  La maquinaria automática (geocode + Haversine + `nearestStations`) sigue siendo **v2** (B.8); en
  MVP la estación se asigna a mano y se guarda lat/lng.
- **Catálogos a cargar (de docs 04 y 06):** 52 comunas de la RM · 7 líneas + ~143 estaciones ·
  subcategorías y tags por capa por categoría (la taxonomía completa del doc 04).
- **Tags = 4 capas:** contexto social (máx 4) · atributos específicos condicionales por categoría
  (recomendado máx 8 en UI) · logística de acceso · vibe (máx 3, solo admin en fichas gratis).
  Exclusiones mutuas: recurrente semanal ↔ evento único, +18 ↔ todas las edades. (Reserva = campo
  estructurado `Place.reservation`, NO tag — redundancia quitada el 2026-06-07.)

---

## Etapa 2 — decisiones de diseño (CERRADAS 2026-06-07)

_Auditoría del `schema.prisma` y el dominio actuales (modelo viejo `Listing`) contra el modelo
nuevo + los 6 docs de `input/`. Conflictos y huecos resueltos antes de escribir el schema._

**Contexto del punto de partida:** todo el código actual está sobre **`Listing`** unificado
(con `BUSINESS_OWNER`, `ListingClaim`, `Subscription` Flow, `FeedItem`, `ListingAnalytics` como
núcleo). El modelo nuevo es **`Place` (sin tipo) + `Event` separado** con monetización parqueada.
`Event` **no existe** en el schema real (solo en el borrador de `ARCHITECTURE.md`) → se crea de cero.
Renombrar/reestructurar/apagar capas = la Etapa 4 será grande.

### Decisiones tomadas (todas con la opción recomendada)

- **D-Etapa2.1 — Entidades parqueadas = "limpio + puertas baratas".** Se mantienen columnas/flags
  futuros baratos (`isPremium`, `ownerId` nullable) y tablas dormidas claras (`Event`, `Review`,
  `Report`, suscripción-tema). Se **borran** los subsistemas pesados (`Subscription` Flow,
  `ListingClaim`, `FeedItem`, `ListingAnalytics`) y sus use cases; vuelven con el self-service.
  Cumple el plan (prevé `isPremium`/`ownerId`) sin arrastrar código muerto.
- **D-Etapa2.2 — Categoría secundaria = 4 FKs en `Place`.** `categoryId` + `subcategoryId`
  obligatorias; `secondaryCategoryId` + `secondarySubcategoryId` nullables. El peso 1.0/0.5 (doc 04)
  se aplica en la query de búsqueda, no en el modelo.
- **D-Etapa2.3 — Tags 4 capas = una tabla `Tag` + `layer`.** `Tag` con `layer`
  (SOCIAL/SPECIFIC/ACCESS/VIBE) + `categoryId` nullable (null = universal, seteado = condicional a
  esa categoría) + join `PlaceTag`. Límites (social máx 4, vibe máx 3) y exclusiones mutuas
  (recurrente semanal ↔ evento único, +18 ↔ todas las edades) = en **dominio**. **Reserva NO es tag**
  (se quitó la redundancia 2026-06-07): vive como campo estructurado `Place.reservation`
  (`ReservationPolicy`); el filtro "Sin reserva" se deriva de `reservation = WALK_IN`.
- **D-Etapa2.4 — `Review` extensible = polimórfico + escala 1–5.** `targetType` (PLACE/DISH/EVENT)
  + `targetId`, `unique(targetType,targetId,userId)`, escala **1–5** alineada con Google. Sumar
  Dish/Event no toca el schema (integridad referencial la cuida el dominio, no FK). `Review` se crea
  pero apagado (sección "Mis reseñas" vacía en MVP).
- **D-Etapa2.5 — `score` (reputación) = promedio bayesiano. ✅ APROBADO por el usuario 2026-06-07.**
  `score = (v/(v+m))·R + (m/(v+m))·C` — `R`=`googleRating`, `v`=`googleReviewCount`, `C`=promedio
  global (prior), `m`=umbral de confianza (**fijo en 50**; re-afinable con data si hace falta).
  Columna `score Float`, **recalculada al cargar/editar** (no en runtime). `C` y todos los `score`
  se re-baten en batch cuando entra carga nueva. Borde: lugar sin reseñas de Google → `score = C`.
  Es el orden por defecto de toda búsqueda. Verificado con el caso 5,0/3-reseñas (4,25) < 4,7/2.000
  (4,69), que es justo lo que se quería evitar.
- **D-Etapa2.6 — Colores del Metro (corrige el doc 06, que tenía L3/L6 cruzados).**
  L1 Roja `#E1251B` · L2 Amarilla `#F5A800` · **L3 Café `#8B4513`** · L4 Azul `#004F9F` ·
  L4A Celeste `#009CDE` · L5 Verde `#00A651` · **L6 Morada `#943C93`**. (Confirmado vía Wikipedia +
  arte oficial del roundel; tono fino re-confirmable al cargar.)

### Conflictos resueltos en esta auditoría
- **C1 colores metro** → D-Etapa2.6 (L3 café / L6 morada; doc 06 estaba mal).
- **C2 barrios** (doc 06 los descarta en v1, plan los incluye) → gana el plan: `Neighborhood` queda
  en el schema. Pero falta la **data** de barrios (ver hueco H3).
- **C3 categorías viejas en código** (`Categories.ts` tiene 11 planas) → se reescribe al catálogo
  de **7 categorías + subcategorías** del doc 04.
- **C4 colisión de nombre `Subscription`** (pago Flow vs suscripción-tema) → el de pago se **borra**
  (D-Etapa2.1); el nuevo de newsletter/keyword se llama distinto (ej. `TopicSubscription`).
- **C5 tags array vs relacional** → relacional (D-Etapa2.3); los `text[]` de los docs valen como
  *qué tags*, no como estructura.
- **C6 `priceRange`** → enum de **5** buckets (incluye Gratis), no `Int`.
- **C7 `businessHours Json`** → horario **texto libre** en MVP; estructurado por día = puerta abierta.

### Huecos detectados (no bloquean el schema; sí el seed/Etapa 3 y 5)
- **H2 — catálogo de ~143 estaciones de metro** (nombre, líneas, lat/lng): no existe, hay que
  generarlo para el seed.
- **H3 — lista de barrios por comuna**: no existe en ningún doc; definir los del arranque
  (Providencia + Ñuñoa) o seedear vacío y llenar a mano.
- **H4 — comunas en código = 24 de 52**: `Communes.ts` incompleto vs las 52 de la RM (doc 06).
- _(H1, H5, H6, H7, H8 → resueltos arriba como D-Etapa2.1–2.5.)_

### Cambios mecánicos (sin decisión, se aplican al escribir el schema)
Rename `Listing`→`Place` + quitar tipo + crear `Event`; `Commune`/`Neighborhood` de
constante-código → tablas; `UserFavorite` → `Collection`/`CollectionItem`; agregar `VisitHistory`
y `Report`; galería con `credit` + `isPrimary`; `attributes Json` → tags relacionales; quitar las
`GoogleReview` escritas (solo `googleRating`/`googleReviewCount`, B.7); rol `UserRole` →
admin/user (`BUSINESS_OWNER` se va con D-Etapa2.1).

---

## Etapa 2 — schema escrito (2026-06-07)

`src/infrastructure/db/prisma/schema.prisma` reescrito de cero aplicando las 6 decisiones.
**Validado** con `prisma format` + `prisma validate` (✅). Resumen de lo que quedó:

**Auth (sin cambios):** `Account`, `Session`, `VerificationToken` tal cual (Auth.js v5). MVP =
email + `passwordHash`; OAuth post-MVP entra por `Account` sin tocar schema.

**`User`:** `role UserRole` (enum reducido a **USER/ADMIN**), `passwordHash?`, `emailVerified?`,
`image?`, **`homeCommuneId?`** (FK opcional, C.3-bis). Se **quitó `rut`**. Relaciones: collections,
visitHistory, reviews, reports, topicSubscriptions, ownedPlaces, accounts, sessions.

**`Place`** (era `Listing`, sin campo tipo): identidad (slug/name/description/menuUrl) · **4 FKs de
categoría** (`categoryId`+`subcategoryId` obligatorias, `secondary*` nullables) · ubicación
(`address`, `communeId`, `neighborhoodId?`, `lat`/`lng`, `metroStationId?`, `accessDetail?`,
`reference?`, `rainPolicy?`) · `priceRange` (enum 5 buckets) · `reservation` (enum) ·
`paymentMethods String[]` · `schedule` (texto libre) · contacto (`phone`/`website`/`instagram`) ·
Google (`googlePlaceId?`/`googleRating?`/`googleReviewCount?`) · **`score Float`** (bayesiano,
recalculado) · puertas baratas (`isPremium`, `ownerId?`, `status PlaceStatus`). Índices por status,
categoría, comuna, barrio, metro, priceRange, **score desc**, owner.

**`PlaceImage`:** `url` (storage propio) + `alt?` + `credit?` + `isPrimary` + `sortOrder`.

**Catálogos:** `Category` (7, con `isActive`/`eventOnly`/`sortOrder`) + `Subcategory` ·
`Tag` (enum **`TagLayer` SOCIAL/SPECIFIC/ACCESS/VIBE** + `categoryId?` null=universal) + join
`PlaceTag` · `MetroLine` (code+color hex) ↔ `MetroStation` **many-to-many** (Baquedano L1+L5) ·
`Commune` + `Neighborhood` (filtrables independientes).

**`Event`** (apagado, status `DRAFT`): `placeId?` nullable · categoría propia · temporal
(`startsAt`/`doorsAt`/`durationMin`/`isRecurring`/`recurrenceRule`/`expiresAt`) · tickets/canales ·
apto familia/niños/romántico · ubicación propia opcional.

**`Collection`** (listas usuario + curadas): `ownerId?` null=curada · `isCurated` · `slug?` (SEO) ·
`description?` + `CollectionItem`. **`VisitHistory`** (combustible IA). **`Review`** polimórfico
(`ReviewTarget` PLACE/DISH/EVENT + `targetId`, **sin FK al objetivo**, escala 1–5, apagado).
**`Report`** (`placeId` + `userId?` nullable para visitante + `ReportReason`/`ReportStatus`).
**`TopicSubscription`** (user → keyword, puerta abierta newsletter/avisos).

**Borrado del modelo viejo** (D-Etapa2.1): `Listing`, `ListingPlan`, `ListingStatus`,
`ClaimStatus`, `SubscriptionStatus`, `TagStatus`, `FeedItemType`, `GoogleReview`, `ListingImage`,
`ListingTag`, `ListingClaim`, `Subscription` (Flow), `UserFavorite`, `FeedItem`,
`ListingAnalytics`, rol `BUSINESS_OWNER`/`CONSUMER`. Vuelven con el self-service post-MVP.

> ⚠️ Esto **rompe** `domain/`, `application/`, `app/`, `components/`, el seed y el container —
> todos referencian `Listing`/`prisma.listing`. Su adaptación es la **Etapa 4** (grande). El schema
> aún no se ha migrado a la BD (eso es Etapa 3); el cliente Prisma generado sigue siendo el viejo.

---

## ETAPA 2-5 — Construcción

Solo se tocan cuando la Etapa 1 está aprobada. Detalle en ROADMAP pasos 9.2-9.5.

- **Etapa 2 (9.2):** decidir Place+Event vs unificado, sub-tipos, escribir `schema.prisma`
- **Etapa 3 (9.3):** `prisma migrate reset` + nueva migración + seed coherente
- **Etapa 4 (9.4):** adaptar `domain/`, `application/`, `app/`, `components/`; borrar lo que no aplica
  - ⚠️ **Gap de diseño detectado (2026-06-07):** el handoff (`design_handoff_portal_panorama/`)
    describe el producto **viejo** (home tipo Yelp, planes plus/pro, dashboards de negocio). La UI
    **nueva** — home "por acción" (search + chips sociales + categorías), **facetas con contadores**,
    sin lado negocio — **no tiene referencia visual**. Antes de construir la UI hay que **definir esas
    pantallas** (rediseñar/extender el handoff o bocetar las nuevas). No bloquea Etapas 2-3.
- **Etapa 5 (9.5):** form admin o Prisma Studio, cargar 10-30 lugares, validar end-to-end

---

## Bitácora de decisiones
_(registro de las decisiones de producto que vamos tomando — la fuente de verdad)_

- **2026-06-09** — **Etapa 4 arranca: 4A (domain) + 4B (application) COMPLETAS** (commit `750340c`).
  Refactor de demolición + reconstrucción (no rename): se botaron los subsistemas post-MVP completos
  (Listing/Flow/claims/feed/analytics/subscription, ~3.000 líneas) y se reescribió el núcleo
  independiente de framework al modelo nuevo. **Domain:** `Place` (invariantes de tags SOCIAL≤4/
  VIBE≤3, transiciones de estado, `Score` bayesiano), `TagLayer`, `Collection`, `ReportReason`,
  `User` (USER/ADMIN + homeCommune, sin RUT), `Review` polimórfica 1–5. **Application:** 10 ports +
  21 use cases del scope MVP (discovery con facetas, colecciones, historial, reporte, CRUD admin de
  Place, RecalculateScores). Decisiones: PlaceRepository separa agregado de dominio vs read-models
  DTO; SearchService sin indexado (Postgres FTS sobre la tabla). Pendiente conocido: exclusiones
  mutuas de tags (solo se pusieron los límites de cantidad), reescritura de tests, push a prod.
  **La app no compila** (infra/UI aún en `Listing`) — estado intermedio esperado. **Próximo: 4C
  infrastructure** (PrismaPlaceRepository + FTS con facetas + repos restantes).
- **2026-06-01** — Se decide rediseñar el producto antes de cargar datos. Modo de trabajo
  para las preguntas: conversado por grupos. Se crea este plan + skill `retomar`.
- **2026-06-07** — **Limpieza de docs + sincronización de ROADMAP/CLAUDE + gap de UI anotado.** Se
  borraron archivos obsoletos del modelo viejo: `migration_preview.sql` (migración del schema viejo),
  `docs/historico/OPEN_QUESTIONS.md` (Q&A + decisiones D1–D46 que contradicen la Fase 9),
  `screenshots/` (capturas de features que se eliminan) y la carpeta vacía `project-brief/`. Se
  actualizó **ROADMAP.md** (Paso 9.2 → ✅) y **CLAUDE.md** (Workflow por Fases ahora refleja Fases
  6–9; ejemplos `Listing`→`Place`; notas de que Money/RUT son del lado negocio post-MVP). Se detectó
  y anotó un **gap de diseño**: la UI nueva (home por acción + facetas) no tiene referencia visual en
  el handoff (que es del producto viejo) → definir antes de la Etapa 4 (ver nota en "ETAPA 2-5").
  Docs que se conservan: `STACK_DECISION` (sigue vigente), `PROJECT_BRIEF`/`DESIGN_NOTES`/
  `UI_FIDELITY` (historia archivada), `input/` (borradores ya integrados), `design_handoff` (tokens).
- **2026-06-07** — **`ARCHITECTURE.md` reescrito al modelo nuevo (150 líneas).** Se eliminó el modelo
  viejo (Listing/Flow/claims/feed/subscription) y las ~160 líneas de schema Prisma inline (ahora en
  [SCHEMA.md](SCHEMA.md), una sola fuente de verdad). Quedó cubriendo capas/contextos/puertas/
  eventos/reglas: estructura de carpetas objetivo Fase 9, 4 bounded contexts nuevos (Catalog &
  Discovery · User & Collections · Engagement dormido · Events dormido), tabla de Ports (sin
  `PaymentGateway`), eventos de dominio, reglas (score bayesiano, límites de tags, reserva-no-tag,
  reseña polimórfica única, colección curada sin owner), SEO (ISR para ficha y listas curadas +
  JSON-LD) y auth (email/pass, verificación a decidir en Etapa 4). **Con esto los sub-productos de la
  Etapa 2 están completos** (schema + plantilla CSV + arquitectura). Próximo: aprobación del usuario →
  Etapa 3 (migración + seed, resolviendo H2/H3/H4 de catálogos).
- **2026-06-07** — **Plantilla CSV de carga entregada + redundancia de reserva quitada.** Se creó la
  **plantilla de columnas** ([PLANTILLA_CSV.md](PLANTILLA_CSV.md) + [input/plantilla_lugares.csv](input/plantilla_lugares.csv)),
  derivada directo del schema: 34 columnas con formato/obligatoriedad/origen sugerido (Apify/manual/
  auto), FKs por slug, listas con `;`, y nota de que `score`/`status`/`is_premium`/`owner_id` NO van
  en el CSV. Decisión de orden: la plantilla se hace **ahora** (es la "lista de compras" del producto,
  independiente de la fuente); el **mapeo Apify → plantilla** se hará al ver el output de Apify
  (Etapa 5). También se **quitó la redundancia** de la reserva: vive solo como campo estructurado
  `Place.reservation` (no hay tag "con/sin reserva"; "Sin reserva" = `WALK_IN`). Se creó además
  [SCHEMA.md](SCHEMA.md) (doc legible del modelo). Falta el último sub-producto de la Etapa 2:
  `ARCHITECTURE.md`.
- **2026-06-07** — **`schema.prisma` nuevo ESCRITO y validado** (detalle en "Etapa 2 — schema
  escrito"). Se reescribió de cero el schema aplicando las 6 decisiones de diseño: `Place` (sin
  tipo, 4 FKs de categoría, `score`, puertas baratas) + `Event` separado apagado + catálogos
  (`Category`/`Subcategory`, `Tag`+`PlaceTag` con `TagLayer`, `MetroLine`↔`MetroStation` m-n,
  `Commune`/`Neighborhood`) + `Collection`/`CollectionItem` + `VisitHistory` + `Review` polimórfico
  + `Report` + `TopicSubscription`. Auth.js intacto; `User` ajustado (role USER/ADMIN, sin `rut`,
  con `homeCommune`). Se borró todo el modelo viejo de `Listing` + subsistemas Flow/Claim/Feed/
  Analytics. `prisma format` + `validate` ✅. **Pendiente:** que el usuario apruebe el schema; luego
  sub-productos (plantilla CSV, `ARCHITECTURE.md`) y Etapa 3 (migración + seed). Nota: el schema
  rompe domain/app/components/seed (Etapa 4) y aún no se migró a la BD.
- **2026-06-07** — **Etapa 2 arranca: auditoría del modelo viejo + decisiones de diseño del schema
  CERRADAS** (detalle en "Etapa 2 — decisiones de diseño"). Se cruzó el `schema.prisma`/dominio
  actuales (todo sobre `Listing` unificado) contra el modelo nuevo y los 6 docs. Se detectaron 7
  conflictos (C1–C7) y 3 huecos de data (H2 estaciones metro, H3 barrios, H4 comunas 24/52). Se
  resolvieron 6 decisiones de diseño con la opción recomendada: **(2.1)** entidades parqueadas =
  "limpio + puertas baratas" (se borran Flow/Claim/Feed/Analytics, quedan isPremium/ownerId +
  tablas dormidas); **(2.2)** categoría secundaria = 4 FKs en Place; **(2.3)** tags 4 capas = una
  tabla `Tag` + `layer` + `categoryId` nullable, límites/exclusiones en dominio; **(2.4)** `Review`
  polimórfico (targetType+targetId) escala 1–5; **(2.5)** `score` = promedio bayesiano (m=50,
  recalculado al editar); **(2.6)** colores del Metro corregidos (L3 café `#8B4513` / L6 morada
  `#943C93`; el doc 06 los tenía cruzados). Próximo: **escribir el `schema.prisma` nuevo**.
- **2026-06-07** — **🎉 ETAPA 1 COMPLETADA. Entregable 4 (scope MVP) aprobado.** Se redactó el scope
  (ver "Entregable 4 — Scope del MVP"): SÍ entra (núcleo de ficha + filtros por facetas + cuenta/
  listas + SEO/instrumentación, ~100 lugares paulatinos densos) · NO ahora (eventos, reseñas
  propias, IA, self-service/monetización, mapa) · descartado (gamificación, app nativa temprana,
  ticketera, import sin curar). **Decisión `Dish`/platos:** puerta abierta barata vía `Review` con
  objetivo reseñado **extensible** (Place hoy, Dish/Event mañana), **sin tabla/app/API en MVP**; la
  app+API de platos = oro parqueado (conecta GEO/AEO). Con esto los 4 entregables de la Etapa 1 están
  aprobados y la **Etapa 1 queda cerrada**. Próximo: **Etapa 2 — diseñar el `schema.prisma` nuevo**
  (Paso 9.2), cuyos sub-productos son la fórmula de `score`, el modelado extensible de `Review`, y la
  plantilla de columnas del CSV de carga.
- **2026-06-07** — **Revisión de la Etapa 1 + 3 pre-preguntas resueltas antes de redactar el scope.**
  Se auditó toda la síntesis contra PRODUCTO.md: entregables 1-3 sólidos y coherentes. Se detectaron
  3 huecos que afectaban el scope y se resolvieron (detalle en "Pre-scope — decisiones del
  2026-06-07"): **(P1)** dedicación = **side-project serio sin runway pero sin urgencia de
  monetizar** → MVP **lean, barato y por capas**; **(P2)** el import NO se botó (falló el schema del
  modelo viejo, no la idea) → **~10 fichas a mano por el form** primero, luego **CSV/JSON curado**
  (Apify vs scraper = decisión de costo en Etapa 5; Claude entrega la plantilla de columnas derivada
  del schema), lanzamiento público **paulatino a ~100** (soft-launch → masa mínima → ~20/semana),
  con criterio rector **densidad > cantidad**; **(P3)** **búsqueda por facetas con contadores +
  ocultar vacíos** (estáticos en MVP, dinámico después), y se fija qué **filtros viven en el MVP**
  (contexto social, gasto, dónde, accesibilidad, ambiente) vs **fuera** (*¿Cuándo?*, depende de
  eventos + horario estructurado). Dos reconciliaciones menores anotadas: estrellas de Google vienen
  del **scrape de Apify** (no a mano), y remapear la taxonomía vieja de filtros a las 7 categorías
  nuevas. Próximo: **redactar el entregable 4 (scope MVP)** y cerrar la Etapa 1.
- **2026-06-06** — **Etapa 1 — Síntesis avanza fuerte.** Entregables 1 (visión) y 2 (modelo de
  entidades) **aprobados**. Se **reabrió el Bloque 6 (monetización)** para definir el modelo (no se
  construye en MVP). Decisiones: principio rector "**nunca se gatea la info útil**, se monetiza la
  visibilidad declarada"; **posicionamiento pagado** en zona "Publicidad pagada" separada (hasta 3
  slots) + ítem premium en carrusel del home, **tarifa plana mensual**, acotado al contexto, vendido
  a mano por el admin (con o sin owner), con el norte de que el negocio **reclame su ficha** para
  traspasarle la mantención; **planes de eventos del doc 05** (escalera local×evento, destacado
  $4.990–6.990, productora, **venue/recinto**, 1 evento gratis, expiración automática, moderación
  reactiva); **Free vs Premium** de ficha (responder reseñas = **Free**); **newsletter por IA +
  suscripción por keyword** como ingreso futuro; servicios/hub como oro parqueado. Se **leyeron los
  6 docs de `input/`**: contradicciones resueltas a favor de nuestras decisiones (#1 schema separado,
  #2 no gatear info, #3 colores reales de metro), y refinamientos C/D/E capturados (tags de acceso,
  campos accessDetail/reference/rainPolicy, metro con `lines` array + filtro múltiple). **Entregable 3
  (matriz de permisos) también aprobado** este mismo día. Próximo (otro día): **entregable 4 (scope
  MVP)**, lo único que falta para cerrar la Etapa 1.
- **2026-06-04** — **4 ítems abiertos de la sub-sesión D RESUELTOS** (detalle en sección "Ítems
  de la sub-sesión D — RESUELTOS"): (1) **fotos** = schema de galería + crédito, storage propio
  (UploadThing o Vercel Blob, **nunca** base64/hotlink), sourcing por Apify/scraper priorizando
  fotos publicadas por el local, carga vía Excel curado de ~100 + import que descarga y re-aloja,
  futuro rights-clean por self-service + **servicio de fotos pro como posible ingreso**; (2)
  **frescura** = lanzar con lugares estables/constantes + disclaimer "verificar en redes" + botón
  de reporte + revisión cada ~2-3 meses; (3) **listas curadas** = misma entidad-colección que las
  listas de usuario (flag is_curated + slug), 3-5 al lanzar como landing SEO, blog aparte después;
  (4) **privacidad** = crear política + aviso de cookies (Ley 19.628), tarea del scope. Terreno
  limpio para la Etapa 1.
- **2026-06-04** — **Sub-sesión D (Lo estratégico) completada → Etapa 0 CERRADA.** Decisiones
  (detalle en "Respuestas capturadas → Sub-sesión D"): validación por **comportamiento**
  (activación + retención + engagement por ficha + save rate), no por volumen bruto, mínimo 1 mes;
  **instrumentación total desde el día 1** (GA4 + Meta Pixel + Google tag + eventos custom) al MVP;
  **web mobile-first** en MVP, **PWA** como puente, app nativa post-validación; crecimiento por
  **SEO + IG + foros**, con **SEO elevado a pilar** (schema.org/JSON-LD, SSR, slugs, sitemap) y el
  insight **GEO/AEO** (que los LLMs citen la ficha = casi el mismo trabajo que SEO); **IA = norte/
  visión pero fuera del MVP (Fase 2+)**, IA-only real solo en "armar panorama encadenado" y
  "recomendar por gusto/historial" (lenguaje natural ≈ filtro), con "relacionados sin IA" por tags
  como único guiño posible en MVP; tensión capturada IA-vs-posicionamiento-pagado; **Bloque 6
  (plata) sigue parqueado**. Quedan **4 ítems abiertos para la Etapa 1** (fotos, frescura de data,
  listas curadas, página de privacidad). Próximo: **Etapa 1 — Síntesis (PRD).**
- **2026-06-04** — Sub-sesión C (Usuarios, lado consumidor) completada. Decisiones (detalle en
  "Respuestas capturadas → Sub-sesión C"): niveles/reputación fuera del MVP y posiblemente nunca
  (el norte real es IA/recomendaciones); home "por acción" sin encuesta forzada (search + chips
  social + categorías), mini-encuesta+IA a v2; perfil = cuenta básica sin avatar + lugares
  guardados + comuna home opcional + historial de visitados, con secciones "Mis reseñas" y "Mis
  eventos guardados" cuyo contenido es v2; orden por defecto = reputación (nota×nº reseñas de
  Google), comuna home opcional que sube la propia comuna primero de forma transparente y
  desactivable; **se ajusta B.8** → lat/lng se guarda desde el MVP (gratis del scrape), mapa y
  "cerca de mí" a v2; self-service del dueño (v2) vía link de Google Maps. Nuevos insights
  parqueados: IA como norte y filtro/reseña por plato. **Planes/premium siguen parqueados.**
  Próximo: sub-sesión D (lo estratégico, con IA al frente).
- **2026-06-03** — Sub-sesión B (Las entidades) completada, cruzando los 6 docs de trabajo
  que el usuario aportó en `input/`. Decisiones clave (detalle en "Respuestas capturadas →
  Sub-sesión B"): evento = tabla separada con FK opcional al local (descartado el enfoque del
  doc 04); el lugar siempre es permanente (lo recurrente vive en eventos); lanzamiento solo con
  lugares; 7 categorías nuevas del doc 04; categoría+subcategoría obligatorias, secundaria
  opcional; tags en 4 capas + nuevo tag "tipo de cocina"; reseñas = estrellas+nº de Google a
  mano en MVP, reseñas propias con peso y niveles de usuario como visión; metro manual (opción B);
  guardar = listas múltiples + compartir ficha individual; CTA "cómo llegar"; **gratis vs premium
  y monetización parqueados** para definir después. Próximo: sub-sesión C (lado usuario).
- **2026-06-02** — Sub-sesión A (El norte) completada. Decisiones: producto =
  "plataforma para descubrir, decidir y guardar qué hacer en tu ciudad"; usuario primario
  = "el organizador"; pilar central = filtrabilidad por contexto social sobre base
  centralizada; la única cosa que se hace bien = la ficha completa y estructurada; MVP =
  ~100 lugares (solo lugares, no eventos) en zonas conectadas de Santiago, con
  registro/login para guardar listas. Se acuerda producir un PRD al cerrar la Etapa 0.
