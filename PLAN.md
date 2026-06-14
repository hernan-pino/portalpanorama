# PLAN — Portal Panorama (plan vivo)

**La fuente de verdad del trabajo desde hoy.** Estado actual, lo que falta para lanzar, y el backlog
priorizado. Se actualiza cada vez que avanzamos. Liviano a propósito — para retomar rápido.

- **Qué es el producto / por qué (norte permanente):** [PRD.md](PRD.md)
- **Seguimiento de pasos:** [ROADMAP.md](ROADMAP.md)
- **Modelo de datos:** [SCHEMA.md](SCHEMA.md) · **Capas:** [ARCHITECTURE.md](ARCHITECTURE.md) · **Carga:** [PLANTILLA_CSV.md](PLANTILLA_CSV.md)
- **Bitácora del rediseño (historia + razonamiento de las decisiones):** [PLAN_FASE9.md](PLAN_FASE9.md)

**Última actualización:** 2026-06-14

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

---

## ▶️ Próximos pasos (en orden)

1. **Cargar ~5 lugares reales a mano** por el form de admin, para validar el flujo end-to-end con
   contenido de verdad (incl. un caso contenedor real: Parquemet → Cerro/Zoo). (NO 100 a mano — el
   grueso va por CSV.)
2. **Push a prod (Neon):** migración + seed de catálogos en la BD de producción + redeploy con la
   presentation nueva. Setear `RESEND_API_KEY` real (si no, la bienvenida no se envía).
3. **Importador CSV** (ítem h) — habilita el ritmo de ~20/semana hasta ~100.

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
- **(p) Definir el flujo de imágenes** (¿link pegado vs. subida? ¿dónde se guardan?). Hoy el form pide
  URL pegada; existe `UploadThingStorageService` sin widget; la allowlist permite Unsplash + Vercel
  Blob, NO `utfs.io`. **Bloqueante de calidad** (fotos reales del local, no solo Unsplash). Incluye (a').
- **(g) Footer Legal → `/terminos` y `/privacidad` dan 404.** La página de privacidad/cookies es
  obligatoria (Ley 19.628 + instrumentación GA4/Pixel). Crear placeholders o quitar la columna.
- **(e) SEO de la ficha:** JSON-LD `LocalBusiness` + metadata rica (canonical, og). Pasada aparte.

**Seguridad del registro (i):** (i.1) formato email ✅ ya valida · (i.2) **fuerza de contraseña** (hoy
solo `min(8)`; sumar reglas + medidor) · (i.3) **verificación de email** (token de un uso + gateo) —
más adelante; requiere `RESEND_API_KEY` real + considerar rate-limit anti-bots.

**Mejoras del form de admin:**
- **(k) Autosave del borrador** — el estado vive en `useState`, una recarga lo borra. localStorage + restaurar, o `beforeunload`.
- **(n) Botón "Preview"** — render de la ficha con los valores del form antes de guardar.
- **(m) Mejor captura de lat/lng** — link de Google Maps / mini-mapa con pin / geocoding desde dirección. Decidir costo vs. fricción.
- **(a'') Validar en el use case** que la subcategoría pertenezca a su categoría (hoy solo el form lo previene).

**Sistema de tags — sesión dedicada (o) + (j): ✅ HECHA (2026-06-14).** Se rediseñó a 6 capas (ver
"Estado actual"). Quedan 3 colas:
- **(o.4) Podar SPECIFIC** — se quitaron los que se duplicaban con capas universales; falta la poda fina
  de "atributos que no hacen sentido", lista por categoría para vetar.
- **(o.6) Sumar "Ideal para" (OCCASION) y "Experiencia" como filtros** — hoy viven en la ficha pero el
  FilterRail solo filtra ¿con quién?/servicios/vibe. Pasada de UI aparte (toca FilterRail + parseSearchParams).
- **(o.7) Tags pendientes de pulir:** revisar exclusiones mutuas; `LGBT+ friendly` recién agregado.

**Schema / modelo:**
- **(l) Redes sociales múltiples** — hoy solo Instagram. Modelar `socialLinks` (JSON `{network,url}[]` o tabla). **Cambio de schema** — decidir forma.

**Pulido visual / deuda:**
- **(f) Flechas de carrusel** — la ficha "También te puede gustar" no tiene flechas en desktop (reusar `PlaceRail`). La home ya las tiene; verificar por qué el usuario no las veía.
- **(c) Ícono en el read-model de categorías** — hoy la home los hardcodea.
- **(d) Listas curadas de la home** — read-model "listar curadas" + seed (hoy diferido).
- **(a) Barrer CSS muerto** que sobrevivió a la poda (`.hero-search`, `.search-shell`, `.place-row`, `.filter-rail` responsive — confirmados sin consumidores).
- **(b) Revisar** si `@domain/shared/Neighborhoods` quedó huérfano.

---

## 🚀 Checklist de lanzamiento (consolidado)

- [ ] Cargar masa mínima densa de lugares (Providencia + Ñuñoa primero).
- [ ] **Decidir workflow de BD para prod:** el proyecto usa `prisma db push` sin historial de
  migraciones. Antes del push a prod hay que decidir si seguimos con `db push` o introducimos migraciones
  reales (no se puede `db push --force-reset` contra prod con datos).
- [ ] Push a prod: schema + seed catálogos en Neon prod + `RESEND_API_KEY` real + redeploy.
- [ ] Decidir + implementar flujo de imágenes (p).
- [ ] Páginas legales privacidad/cookies (g).
- [ ] Instrumentación GA4 + Meta Pixel + eventos custom (del scope MVP, aún no construida).
- [ ] SEO de ficha: JSON-LD + metadata + sitemap (e).
- [ ] 3-5 listas curadas como landing SEO (d).

---

**Regla:** no avanzar a la siguiente fase/etapa sin OK explícito del usuario. Tras cada avance real,
dejar este `PLAN.md` actualizado (y la bitácora en `PLAN_FASE9.md` si es una decisión).
