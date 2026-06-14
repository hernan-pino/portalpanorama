# PLAN — Portal Panorama (plan vivo)

**La fuente de verdad del trabajo desde hoy.** Estado actual, lo que falta para lanzar, y el backlog
priorizado. Se actualiza cada vez que avanzamos. Liviano a propósito — para retomar rápido.

- **Qué es el producto / por qué (norte permanente):** [PRD.md](PRD.md)
- **Seguimiento de pasos:** [ROADMAP.md](ROADMAP.md)
- **Modelo de datos:** [SCHEMA.md](SCHEMA.md) · **Capas:** [ARCHITECTURE.md](ARCHITECTURE.md) · **Carga:** [PLANTILLA_CSV.md](PLANTILLA_CSV.md)
- **Bitácora del rediseño (historia + razonamiento de las decisiones):** [PLAN_FASE9.md](PLAN_FASE9.md)

**Última actualización:** 2026-06-13

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

---

## ▶️ Próximos pasos (en orden)

1. **Cargar ~5 lugares reales a mano** por el form de admin, para validar el flujo end-to-end con
   contenido de verdad. (NO 100 a mano — el grueso va por CSV.)
2. **Push a prod (Neon):** migración + seed de catálogos en la BD de producción + redeploy con la
   presentation nueva. Setear `RESEND_API_KEY` real (si no, la bienvenida no se envía).
3. **Construir la feature de contenedores** (ver abajo) — desbloquea cargar Parquemet/MUT bien.
4. **Importador CSV** (ítem h) — habilita el ritmo de ~20/semana hasta ~100.

---

## 🧩 Feature decidida por construir — Lugares contenedores + spots (2026-06-13)

Caso real al cargar fichas: Parquemet contiene Cerro San Cristóbal / Zoológico; el MUT contiene
locales. Se modela en **dos niveles**, sin reintroducir "tipo" de Place (el padre es un Place normal
que además agrupa). Detalle y razonamiento completo en [PLAN_FASE9.md](PLAN_FASE9.md) (bullet "DECISIÓN
CERRADA — Lugares contenedores").

1. **Hijos CON ficha** (Zoo, Cerro: tienen rating/horario y filtran solos) → `Place.parentId String?`
   self-relation, **cardinalidad 1**, `onDelete: SetNull`, invariante anti-ciclo. UI: **1 nivel** (padre
   directo + hijos directos). En la ficha del padre van como `PlaceCard` **variante lista** (sección
   propia, distinta de "También te puede gustar"). En la ficha del hijo: badge "Parte de [X] ↗".
2. **Spots SIN ficha** (miradores, kioscos) → tabla `PlacePoint { id, placeId, name, description?,
   kind?, sortOrder }` (tabla, no JSON). **Cuelgan de cualquier Place, incluido un hijo.** Lista de
   texto, sin filtro/reseña/link, agrupada con los hijos bajo "Qué hay en [X]".

**Plan de implementación:** schema (`parentId` + `PlacePoint`) → dominio (anti-ciclo) → form admin
(selector de padre + editor de puntos) → ficha padre (2 secciones) → ficha hijo (badge).

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

**Sistema de tags — sesión dedicada (o) + (j):** revisar TODO el sistema. (o.1) "Ideal ir solo/a" →
"Solo/a" · (o.2) expandir Acceso y logística · (o.3) redefinir VIBE (no gustan los actuales) · (o.4)
repensar atributos SPECIFIC condicionales por categoría · (j/o.5) revisar los **límites** por capa
(hoy SOCIAL≤4, VIBE≤3). **Ojo:** renombrar cambia el slug → migrar tags + `PlaceTag`, no solo renombrar.

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
- [ ] Push a prod: migración + seed catálogos en Neon prod + `RESEND_API_KEY` real + redeploy.
- [ ] Decidir + implementar flujo de imágenes (p).
- [ ] Páginas legales privacidad/cookies (g).
- [ ] Instrumentación GA4 + Meta Pixel + eventos custom (del scope MVP, aún no construida).
- [ ] SEO de ficha: JSON-LD + metadata + sitemap (e).
- [ ] 3-5 listas curadas como landing SEO (d).

---

**Regla:** no avanzar a la siguiente fase/etapa sin OK explícito del usuario. Tras cada avance real,
dejar este `PLAN.md` actualizado (y la bitácora en `PLAN_FASE9.md` si es una decisión).
