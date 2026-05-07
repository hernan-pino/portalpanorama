# UI Fidelity — Fase 6

## Qué es esta fase

Después de completar la arquitectura completa (Fases 0–5), se detectó que las páginas funcionan correctamente pero **no se parecen visualmente al handoff** (`design_handoff_portal_panorama/`).

La causa raíz: el handoff tiene un `components.css` con ~1043 líneas de clases de layout que no se transfirieron a `globals.css` durante las fases anteriores. Las páginas usan inline styles ad-hoc en lugar de las clases del design system.

**Objetivo:** Llevar cada página al pixel-perfect (o lo más cercano posible) del handoff, reutilizando las clases CSS del handoff y reconstruyendo los layouts de cada página.

---

## Estado del entorno

- **Dev server:** `npm run dev` → `http://localhost:3000`
- **Base de datos:** Neon (PostgreSQL cloud). La `DATABASE_URL` está en `.env.local`.
- **Prisma:** schema en `src/infrastructure/db/prisma/schema.prisma`, config en `prisma.config.ts`.
- **Auth:** Auth.js v5, `AUTH_SECRET` generado en `.env.local`.
- **Emails, pagos, storage:** variables en `.env.local` pero vacías — solo fallan si se disparan esos flujos.

Para levantar el entorno:
```bash
npm run dev
```

Para aplicar cambios al schema de BD:
```bash
npx prisma db push
```

---

## Brecha original detectada

### globals.css
Faltaban todas las clases de layout del handoff:
`.hero`, `.cat-card`, `.featured-grid`, `.sec-head`, `.place-card`, `.place-row`,
`.search-shell`, `.filter-rail`, `.results-bar`, `.toggle-group`, `.results-grid`,
`.plans-grid`, `.plan`, `.plan--premium`, `.auth-shell`, `.biz-cta`, `.review`,
`.rating`, `.placeholder-stripe`, `.footer` (versión dark), responsive overrides.

### Por página:
| Página | Problema principal |
|---|---|
| Home | Hero 1 col en vez de 2, sin stats, sin featured-grid, sin eventos, sin pull-quote, biz-cta simple |
| Footer | Fondo claro — debe ser negro `var(--ink-100)` con brand display grande italic |
| Explorar | Sin rail de filtros, sin toggle grid/lista, sin results-bar |
| ListingCard | Aspect ratio 16:9, título Inter Tight — debe ser 4:3 y Fraunces |
| Lugar | Hero simple, h1 pequeño, reviews sin avatar |
| Planes | No verificado aún |
| Login/Registro | No verificado aún — debe ser split 50/50 con panel arte negro |

---

## Plan de implementación (10 pasos)

| # | Tarea | Archivo(s) | Estado |
|---|---|---|---|
| 1 | Agregar components.css del handoff a globals.css | `src/app/globals.css` | ✅ COMPLETADO |
| 2 | Reconstruir Footer (fondo oscuro) | `src/components/layout/Footer.tsx` | ✅ COMPLETADO |
| 3 | Reconstruir Home page | `src/app/page.tsx` | ✅ COMPLETADO |
| 4 | SearchBar — agregar campo Cuándo | `src/components/search/SearchBar.tsx` | ✅ COMPLETADO |
| 5 | Reconstruir ListingCard | `src/components/listing/ListingCard.tsx` | ✅ COMPLETADO |
| 6 | Reconstruir Explorar | `src/app/explorar/page.tsx` | ✅ COMPLETADO |
| 7 | Reconstruir Lugar page | `src/app/lugar/[slug]/page.tsx` | ✅ COMPLETADO |
| 8 | Reconstruir Planes page | `src/app/planes/page.tsx` | ✅ COMPLETADO |
| 9 | Reconstruir Auth pages | `src/app/(auth)/login/page.tsx`, `src/app/(auth)/registro/page.tsx` | ✅ COMPLETADO |
| 10 | Seed data (categorías + listings) | `src/infrastructure/db/prisma/seed.ts` | ✅ COMPLETADO |

---

## Qué hace el Paso 1 (ya completado)

Se agregó al final de `src/app/globals.css` todo el contenido de `design_handoff_portal_panorama/assets/components.css`, saltando los selectores que ya existían (`.topbar`, `.brand`, `.hero-search`). También se agregaron `.placeholder-stripe` y las media queries responsive (960px / 600px).

Ahora todas las clases del design system existen en el CSS — los pasos restantes consisten en actualizar el JSX de cada página para usar esas clases en lugar de los inline styles actuales.

---

## Referencia visual

Para comparar en cualquier momento, abrir en el browser:
```
design_handoff_portal_panorama/index.html
```

Es el prototipo navegable con todas las pantallas y flujos. Rutas del prototipo:
- `#/` → Home
- `#/buscar` → Explorar
- `#/lugar` → Ficha de lugar
- `#/planes` → Planes
- `#/login` → Login
- `#/dashboard` → Dashboard usuario
- `#/dashboard-negocio` → Dashboard negocio

---

## Notas de implementación

- **No hay imágenes reales.** Usar `<div class="placeholder-stripe" data-label="...">` donde el handoff muestra imágenes. Las dimensiones y proporciones del placeholder son las correctas del diseño.
- **Datos estáticos en Home.** La sección "Eventos esta semana" y "Stats" (1.247 lugares, etc.) usan datos hardcodeados — no hay entidad Event en el dominio todavía.
- **Seed data necesario.** Sin datos en la BD, la sección "Lugares recientes" de la home queda vacía. El paso 10 crea el seed.
- **Responsive:** El handoff nació desktop-first. Los breakpoints son 960px (tablet) y 600px (mobile). El CSS responsive ya fue agregado en el paso 1.
- **Dark mode:** No implementar. El handoff lo menciona como "desactivado".

---

## Agentes sugeridos (pendientes de crear)

**`ui-handoff-diff`**
Compara una página específica contra el handoff. Lee el JSX actual + el HTML del prototipo para esa ruta y devuelve una lista puntual de diferencias: secciones faltantes, clases incorrectas, tokens mal aplicados. Se usa antes de editar una página para saber exactamente qué cambiar, y después para verificar que quedó correcto.

**`page-smoke-tester`**
Hace `curl` contra todas las rutas de la app (home, explorar, login, registro, planes, lugar/[slug], dashboard, admin) y verifica: status code esperado, ausencia de errores de React en la respuesta HTML, y que los elementos clave del design system aparezcan en el markup (`class="hero"`, `class="footer"`, etc.). Se corre después de cada paso para detectar regresiones.

**`integration-verifier`**
Revisa la coherencia frontend↔backend sin correr la app. Verifica que: cada `container.getXxxUseCase()` llamado en pages/actions existe en `container.ts`, cada server action valida con Zod antes de llamar al use case, los props que pasan de Server Component a Client Component están tipados, y no hay `any` en los tipos de retorno de use cases.

**`seed-state-checker`**
Consulta la BD vía Prisma y reporta el estado actual: cuántas categorías, listings, usuarios, suscripciones hay, si las relaciones son válidas. Útil para verificar que el seed funcionó y diagnosticar por qué la home muestra contenido vacío.

---

## Historial

| Fecha | Cambio |
|---|---|
| 2026-05-07 | Inicio de Fase 6 — diagnóstico de brecha visual |
| 2026-05-07 | Paso 1 completado — CSS foundation (globals.css) mergeado desde components.css del handoff |
| 2026-05-07 | Pasos 2–6 completados — Footer oscuro, Home reconstruida, SearchBar+Cuándo, ListingCard 4:3, Explorar con filter-rail y toggle grid/lista |
| 2026-05-07 | Paso 7 completado — Lugar page reconstruida con .place-hero gallery grid 2×2, .place-info 2 columnas, .place-headline h1 Fraunces grande, .place-info__row con iconos, .review grid con avatar inicial |
| 2026-05-07 | Paso 8 completado — Planes page reconstruida con .plans-grid 2 columnas, .plan/.plan--premium, precio 64px Fraunces, .plan-list con íconos |
| 2026-05-07 | Paso 9 completado — Auth pages (login + registro) reconstruidas con .auth-shell split 50/50, panel arte negro izq con quote Fraunces italic, form panel der |
| 2026-05-07 | Paso 10 completado — Seed en src/infrastructure/db/prisma/seed.ts: 6 categorías, 1 admin, 6 listings publicados con tags. Requiere npm install (tsx) + npm run db:seed |
