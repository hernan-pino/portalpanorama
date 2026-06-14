# ARCHITECTURE.md — Portal Panorama

Referencia arquitectónica del proyecto. Para reglas de estilo y antipatrones ver
[`CLAUDE.md`](CLAUDE.md); para el **modelo de datos** (entidades, campos, enums) ver
[`SCHEMA.md`](SCHEMA.md). Este documento cubre **capas, bounded contexts, puertas, eventos y
reglas de dominio**.

> **Estado (Fase 9):** migración a `Place` + `Event` **completa** (Etapa 4 ✅). `domain/`,
> `application/`, `app/` y `components/` ya operan sobre el modelo nuevo y la app compila. La
> estructura de abajo refleja el estado actual del código, no un objetivo pendiente.

---

## Regla de dependencias (no negociable)

```
domain ← application ← infrastructure
                      ← presentation (app/ + components/)
                      ← lib/container.ts
```

`domain/` no importa nada externo · `application/` no importa Prisma/Next/vendors ·
`infrastructure/` no importa desde `app/`.

---

## Estructura de Carpetas (objetivo Fase 9)

```
src/
├── domain/
│   ├── place/         # Place (entidad central), PlaceStatus, PriceRange,
│   │                  #   ReservationPolicy, RainPolicy, Score (cálculo bayesiano), errores, eventos
│   ├── catalog/       # Category, Subcategory, Tag (+ TagLayer), Commune,
│   │                  #   Neighborhood, MetroLine, MetroStation
│   ├── user/          # User, UserRole, errores
│   ├── collection/    # Collection, CollectionItem (listas de usuario + curadas)
│   ├── review/        # Review (dormido en MVP), ReviewTarget
│   ├── report/        # Report, ReportReason, ReportStatus
│   ├── event/         # Event (dormido en MVP), EventStatus
│   └── shared/        # Slug, Email (VOs), DomainError
│
├── application/
│   ├── place/         # CreatePlace, UpdatePlace, PublishPlace, GetPlaceBySlug,
│   │                  #   SearchPlaces (facetas), GetRelatedPlaces, RecalculateScores
│   ├── catalog/       # CRUD de catálogos (ADMIN) + GetFilterFacets (contadores)
│   ├── user/          # RegisterUser, GetUserProfile, GetVisitHistory
│   ├── collection/    # CreateCollection, AddToCollection, RemoveFromCollection, GetCuratedCollection
│   ├── report/        # SubmitReport, ResolveReport (ADMIN)
│   ├── review/        # CreateReview (dormido)
│   └── ports/         # interfaces (ver tabla de Ports)
│
├── infrastructure/
│   ├── db/prisma/     # schema.prisma + migrations + repos Prisma
│   ├── search/        # PostgresFTSSearchService (MVP) → MeilisearchService (Fase 2+)
│   ├── email/         # ResendEmailService
│   └── storage/       # UploadThingStorageService (o VercelBlobStorageService)
│
├── lib/container.ts   # Composition root — factory functions
│
├── app/               # Next.js App Router
│   ├── (public)/      # / (home) · /buscar · /lugar/[slug] · /listas/[slug] (curadas) · privacidad
│   ├── (auth)/        # /login · /registro
│   ├── (dashboard)/   # /mi-cuenta (listas, historial, "mis reseñas" vacío)
│   ├── (admin)/       # /admin (CRUD lugares, catálogos, listas curadas, reportes)
│   ├── api/           # auth/[...nextauth] · (webhooks Flow = post-MVP)
│   └── actions/       # Server Actions (place, collection, report, review)
│
├── components/        # ui/ · place/ · search/ · layout/ · shared/
└── styles/globals.css # Design tokens del handoff
```

> **Fuera del MVP (vuelven post-MVP):** lado negocio (`/negocio/*`), checkout/Flow, claims, feed,
> analytics. Ver `PLAN_FASE9.md` → D-Etapa2.1.

---

## Bounded Contexts

### 1. Catalog & Discovery (núcleo del MVP)
La ficha (`Place`) y todo lo que la clasifica y la hace filtrable/buscable.

**Entidades:** `Place`, `PlaceImage`, `Category`, `Subcategory`, `Tag`, `Commune`, `Neighborhood`,
`MetroLine`, `MetroStation`.
**Value Objects / lógica:** `Slug`, `PriceRange`, `ReservationPolicy`, `RainPolicy`, **cálculo de
`score`** (promedio bayesiano, ver `SCHEMA.md`), límites de tags por capa (AUDIENCE máx 4, OCCASION máx 3, VIBE máx 3).
**Eventos:** `PlacePublished`, `PlaceUpdated`.
**Use Cases:** CreatePlace, UpdatePlace, PublishPlace, GetPlaceBySlug, SearchPlaces (facetas con
contadores + orden por `score`), GetRelatedPlaces (tags+categoría+comuna, sin IA), RecalculateScores,
catálogos CRUD (ADMIN), GetFilterFacets.

### 2. User & Collections
Cuentas de consumidor, listas guardadas (múltiples, con nombre) y curadas, historial.

**Entidades:** `User`, `Collection`, `CollectionItem`, `VisitHistory`.
**Value Objects:** `UserRole`, `Email`.
**Eventos:** `UserRegistered`.
**Use Cases:** RegisterUser, GetUserProfile, GetVisitHistory, CreateCollection, AddToCollection,
RemoveFromCollection, GetCuratedCollection (landing SEO).
**Regla:** `Collection` con `ownerId=null` ⇒ curada (admin); si no, lista privada del usuario.

### 3. Engagement (dormido — puertas abiertas)
Reseñas propias, reportes de frescura, suscripción por keyword. Solo `Report` está activo en MVP.

**Entidades:** `Review` (apagado), `Report`, `TopicSubscription` (puerta).
**Use Cases:** SubmitReport, ResolveReport (ADMIN) · CreateReview (v2).
**Regla:** `Review` es polimórfico (`targetType`+`targetId`); una reseña por (target, usuario).

### 4. Events (dormido)
`Event` separado de `Place` (FK `placeId` nullable). En el schema desde ya, **apagado** en MVP;
se enciende con la estrategia de eventos (ver `PLAN_FASE9.md`).

---

## Ports (interfaces de Application Layer)

| Port | Responsabilidad |
|------|----------------|
| `PlaceRepository` | CRUD de lugares; queries de búsqueda/facetas |
| `CatalogRepository` | CRUD de categorías, subcategorías, tags, comunas, barrios, metro |
| `UserRepository` | CRUD de usuarios + historial de visitas |
| `CollectionRepository` | CRUD de colecciones (usuario + curadas) e ítems |
| `ReportRepository` | Crear/resolver reportes |
| `ReviewRepository` | CRUD de reseñas (dormido en MVP) |
| `SearchService` | Buscar lugares con filtros + facetas; indexar al publicar |
| `StorageService` | Upload/delete de imágenes (storage propio, nunca hotlink/base64) |
| `EmailService` | Emails transaccionales (bienvenida, verificación, etc.) |

> **No hay `PaymentGateway` en el MVP** — Flow vuelve con el self-service de negocios (post-MVP).

---

## Eventos de Dominio

| Evento | Quién lo emite | Quién lo consume |
|--------|---------------|-----------------|
| `PlacePublished` | PublishPlaceUseCase | SearchService (indexar) |
| `PlaceUpdated` | UpdatePlaceUseCase | SearchService (reindexar) · recalcular `score` si cambió rating |
| `UserRegistered` | RegisterUserUseCase | EmailService (bienvenida) |
| `ReportSubmitted` | SubmitReportUseCase | (cola ADMIN — revisión reactiva de frescura) |

---

## Reglas de Negocio del Dominio

| Regla | Dónde se implementa |
|-------|-------------------|
| `score` = promedio bayesiano (m=50), recalculado al cargar/editar | `domain/place` (cálculo) + columna `Place.score` |
| Categoría + subcategoría principal obligatorias; secundaria opcional | Invariante de `Place` (4 FKs, ver `SCHEMA.md` 2.2) |
| Tags: AUDIENCE máx 4 · OCCASION máx 3 · VIBE máx 3 (objetivas sin tope) · exclusiones mutuas | `Place.create()` valida límites por `TagLayer` |
| Reserva = campo estructurado, NO tag ("Sin reserva" = `WALK_IN`) | `Place.reservation` (`ReservationPolicy`) |
| `rainPolicy` solo aplica a categorías al aire libre | Validación en CreatePlace/UpdatePlace |
| Una reseña por (target, usuario) | `@@unique([targetType, targetId, userId])` + error de dominio |
| `Collection` sin owner ⇒ curada (pública, admin) | Invariante de `Collection` |
| Imágenes: storage propio, una `isPrimary` | `StorageService` + invariante de galería |
| Catálogos (comuna/barrio/metro/categoría/tag) por slug | FK resuelta en el import; el slug debe existir antes |
| Precios: enum `PriceRange` (5 buckets, incluye Gratis) | No se modela `Money` en MVP (monetización parqueada) |

---

## SEO — Estrategia de renderizado

| Ruta | Estrategia | Justificación |
|------|-----------|---------------|
| `/` | SSR + revalidate 3600s | Home "por acción"; cambia con baja frecuencia |
| `/buscar` | SSR | Resultados dependen de query params (facetas) |
| `/lugar/[slug]` | **ISR** (revalidate 300s) | Las fichas deben rankear (Google + GEO/AEO); se regeneran al editar |
| `/listas/[slug]` | **ISR** | Listas curadas = landing pages de SEO |
| `/mi-cuenta` | SSR | Datos del usuario, siempre fresh |

`/lugar/[slug]` y `/listas/[slug]` usan `revalidatePath()` al publicar/editar (invalidación bajo
demanda). Cada ficha emite **JSON-LD `LocalBusiness`** (schema.org), metadata propia y entra al
`sitemap.xml`. La "ficha bien hecha" paga triple: humano + Google + LLMs (D.5).

---

## Autenticación

Auth.js v5. **MVP: solo email/password.** Google y Apple OAuth se agregan post-MVP (entran por la
tabla `Account` sin tocar el schema).

- Email/password (credentials provider, hash bcrypt en `User.passwordHash`).
- Sesión en BD (`@auth/prisma-adapter`); `session.user` incluye `id`, `email`, `role`, disponible
  en RSC vía `auth()`.
- **Verificación de email:** diferida (puerta abierta; el campo `emailVerified` existe sin gatear).
- Protección de rutas: se hace en el **layout** del grupo (`auth()` en el Server Component que
  redirige a `/login`; `/admin/*` además exige `role === ADMIN`) **y se re-chequea en cada Server
  Action** (`isAdmin()` / sesión). No hay `middleware.ts`: el layout + la action son la defensa.
