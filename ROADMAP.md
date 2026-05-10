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
**Estado:** ⬜ PENDIENTE
**Archivos nuevos/modificados:**
```
src/app/mi-cuenta/
  layout.tsx          (sidebar 7 tabs + header con stats)
  page.tsx            (redirect a ?tab=guardados)
  tabs/
    Guardados.tsx     (favoritos grid — mover de /mi-cuenta/favoritos)
    Listas.tsx        (colecciones privadas CRUD — nuevo)
    Historial.tsx     (lugares vistos recientemente)
    Resenas.tsx       (mis reseñas, editar/borrar)
    Eventos.tsx       (eventos guardados)
    Perfil.tsx        (mover de /mi-cuenta/perfil)
    Config.tsx        (ajustes: cambio de contraseña, notificaciones)
```
**Redirects:** `/mi-cuenta/favoritos` → `/mi-cuenta?tab=guardados`, `/mi-cuenta/perfil` → `/mi-cuenta?tab=perfil`
**Nota:** Tab "Listas" puede requerir migración Prisma si `UserList` no existe en schema
**Referencia visual:** `screenshots/dasboardusuario.png`
**Commit de cierre:** —

---

### Paso 7.5 — Loops básicos en ficha de lugar
**Estado:** ⬜ PENDIENTE
**Archivos:**
- `src/app/lugar/[slug]/ReviewForm.tsx` + `actions.ts` — form submit de reseña
- `src/app/lugar/[slug]/FavoriteButton.tsx` — toggle guardar/quitar (add action)
- `src/infrastructure/search/PostgresFTSSearchService.ts` — verificar/arreglar filtros WHERE
- `src/app/lugar/[slug]/page.tsx` — agregar "También te puede gustar" + banner "Reclamar ficha"
**Commit de cierre:** —

---

### Paso 7.6 — Perfil público del negocio `/perfil-negocio/[slug]`
**Estado:** ⬜ PENDIENTE
**Archivos:**
- `src/app/perfil-negocio/[slug]/page.tsx`
- Posible nuevo use case: `GetOwnerProfileUseCase`
**Link desde:** sidebar de `/lugar/[slug]` → "Gestionado por [Nombre]"
**Commit de cierre:** —

---

### Paso 7.7 — Imágenes reales (seed con URLs Unsplash)
**Estado:** ⬜ PENDIENTE
**Archivos:**
- `src/infrastructure/db/prisma/seed.ts` — agregar ListingImage con URLs reales
- `next.config.ts` — agregar `images.unsplash.com` a remotePatterns
**Commit de cierre:** —

---

### Paso 7.8 — QA Responsive (960px y 600px)
**Estado:** ⬜ PENDIENTE
**Archivos:** `src/app/globals.css`, componentes según hallazgos
**Commit de cierre:** —

---

### Paso 7.9 — QA Visual vs handoff
**Estado:** ⬜ PENDIENTE
**Referencia:** `design_handoff_portal_panorama/index.html`
**Archivos:** `src/app/globals.css`, componentes según hallazgos
**Commit de cierre:** —

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
