# SCHEMA.md — Modelo de datos (Fase 9)

Documentación legible del `schema.prisma` nuevo. Fuente de verdad del código:
[`src/infrastructure/db/prisma/schema.prisma`](src/infrastructure/db/prisma/schema.prisma).
Las decisiones de diseño detrás de cada elección están en
[`PLAN_FASE9.md`](PLAN_FASE9.md) → "Etapa 2 — decisiones de diseño".

**Última actualización:** 2026-06-15 · **Estado:** migrado a la BD local (`prisma db push`) y en uso
por toda la app (dominio + UI). Pendiente solo el push a la BD de producción.

---

## Principios

- **`Place` es la entidad central** y siempre es permanente — **no tiene campo "tipo"**. Toda la
  dimensión temporal (puntual / recurrente) vive en **`Event`**, tabla separada con FK opcional.
- **IDs:** CUID2 generados en la app (`id String @id`, sin default). Los modelos de Auth.js
  conservan `@default(cuid())` porque los crea el adapter.
- **Puertas baratas:** entidades futuras se crean dormidas (`Event`, `Review`, `Report`,
  `TopicSubscription`) con flags baratos (`isPremium`, `ownerId?`). Los subsistemas pesados de
  monetización (Flow, claims, feed, analytics) **NO** están — vuelven con el self-service post-MVP.
- **El usuario siempre ve toda la info de la ficha.** El plan del negocio (futuro) solo cambia qué
  autogestiona, nunca qué ve el consumidor.

---

## Enums

| Enum | Valores | Nota |
|---|---|---|
| `UserRole` | `USER` · `ADMIN` | En el MVP todo lo carga el admin. |
| `PriceRange` | `FREE` · `UNDER_5000` · `FROM_5000_TO_15000` · `FROM_15000_TO_30000` · `OVER_30000` | 5 buckets (incluye Gratis). Mapea al filtro "¿Cuánto gasto?". |
| `ReservationPolicy` | `REQUIRED` · `WALK_IN` · `RECOMMENDED` | **Única fuente de verdad de la reserva** (no hay tag). "Sin reserva" = `WALK_IN`. |
| `RainPolicy` | `SUSPENDED` · `RELOCATED` · `CONTINUES` | Solo categorías al aire libre. |
| `PlaceStatus` | `PENDING_REVIEW` · `PUBLISHED` · `ARCHIVED` | |
| `TagLayer` | `AUDIENCE` · `OCCASION` · `VIBE` · `EXPERIENCE` · `SERVICE` · `SPECIFIC` | **6 capas** (rediseño 2026-06-14). Topes solo en las subjetivas: AUDIENCE máx 4 · OCCASION máx 3 · VIBE máx 3. Las objetivas (EXPERIENCE/SERVICE/SPECIFIC) sin tope. |
| `ReviewTarget` | `PLACE` · `DISH` · `EVENT` | Objetivo reseñado extensible (hoy solo PLACE). |
| `ReportReason` | `WRONG_INFO` · `CLOSED` · `DUPLICATE` · `OTHER` | |
| `ReportStatus` | `OPEN` · `RESOLVED` · `DISMISSED` | |
| `EventStatus` | `DRAFT` · `PUBLISHED` · `ARCHIVED` | Event arranca apagado en MVP. |

---

## Auth.js (sin cambios)

`Account`, `Session`, `VerificationToken` — estándar del `@auth/prisma-adapter`. **No se tocan.**
El MVP usa email + contraseña (`User.passwordHash`); Google/Apple post-MVP entran por `Account`
(OAuth) sin tocar el schema.

---

## Modelos de dominio

### `User` — cuenta básica

| Campo | Tipo | Nota |
|---|---|---|
| `id` | `String @id` | CUID2 |
| `email` | `String @unique` | |
| `name` | `String` | |
| `role` | `UserRole` | default `USER` |
| `passwordHash` | `String?` | null para usuarios OAuth futuros |
| `emailVerified` | `DateTime?` | Auth.js. Exigir o no verificación = decisión de flujo (Etapa 4) |
| `image` | `String?` | Auth.js (sin avatar en MVP, pero el campo existe) |
| `homeCommuneId` | `String?` | Comuna home opcional, transparente/desactivable (C.3-bis) |

**Relaciones:** `homeCommune` · `collections` · `visitHistory` · `reviews` · `reports` ·
`topicSubscriptions` · `ownedPlaces` (puerta self-service) · `accounts` · `sessions`.
**Sin `rut`** (era del lado negocio/Flow, eliminado).

### `Place` — la ficha (entidad central)

| Grupo | Campos |
|---|---|
| Identidad | `id` · `slug @unique` · `name` · `description?` · `menuUrl?` |
| Categorización | `categoryId` + `subcategoryId` **(obligatorias)** · `secondaryCategoryId?` + `secondarySubcategoryId?` **(opcionales)** — 4 FKs |
| Ubicación | `address?` · `communeId` · `neighborhoodId?` · `lat?` · `lng?` · `metroStationId?` · `accessDetail?` · `reference?` · `rainPolicy?` |
| Presupuesto / operacional | `priceRange?` · `reservation?` · `paymentMethods String[]` · `schedule?` (texto libre) |
| Contacto / redes | `phone?` · `website?` · `instagram?` (red principal) · `socialLinks?` (JSON `[{network,url}]` — WhatsApp/Facebook/TikTok…, informativo, no filtrable) |
| Contenedor | `parentId?` (self-relation 1 nivel; Parquemet → Cerro/Zoo). Hijos-con-ficha vía relación; spots sin ficha vía `PlacePoint` |
| Reputación Google | `googlePlaceId? @unique` · `googleRating?` · `googleReviewCount?` |
| Reputación calculada | `score Float` (promedio bayesiano, ver abajo) |
| Propiedad / estado | `isPremium` (default false) · `ownerId?` · `status PlaceStatus` |

**Índices:** `status` · `categoryId+status` · `communeId+status` · `neighborhoodId+status` ·
`metroStationId` · `priceRange+status` · **`score` desc** (orden por defecto) · `ownerId`.

**`score` (orden por defecto de toda búsqueda):** promedio bayesiano
`score = (v/(v+m))·R + (m/(v+m))·C` donde `R`=`googleRating`, `v`=`googleReviewCount`,
`C`=promedio global, `m`=50 (umbral de confianza). **Recalculado al cargar/editar**, no en runtime.
Borde: lugar sin reseñas de Google → `score = C`. Evita que un 5,0 con 3 reseñas le gane a un
4,7 con 2.000.

### `PlaceImage` — galería

`url` (storage propio, **nunca** base64/hotlink) · `alt?` · `credit?` (crédito/origen) ·
`isPrimary` · `sortOrder`. FK `placeId` (cascade).

### `Event` — apagado en el MVP

En el schema desde ya, `status` arranca en `DRAFT`. FK `placeId?` **nullable** (evento sin local
fijo). Categoría **propia** (puede diferir de la del local).

| Grupo | Campos |
|---|---|
| Identidad | `id` · `slug` · `name` · `description?` |
| Vínculo | `placeId?` · `categoryId` · `subcategoryId?` |
| Temporal | `startsAt` · `doorsAt?` · `durationMin?` · `isRecurring` · `recurrenceRule?` · `expiresAt?` |
| Tickets / canales | `ticketUrl?` · `officialChannel?` · `website?` · `instagram?` |
| Apto | `familyFriendly?` · `kidsFriendly?` · `romantic?` |
| Ubicación propia | `address?` · `communeId?` · `neighborhoodId?` · `lat?` · `lng?` · `metroStationId?` |

### Catálogos

- **`Category`** (9: 6 activas + 3 event-only; reorg 2026-06-20) — `slug` · `name` · `sortOrder` ·
  `isActive` (se muestra en UI) · `eventOnly` (Shows/Ferias/Talleres: registradas pero apagadas hasta
  encender eventos). Activas al lanzar: Gastronomía, Naturaleza y aire libre, Arte y cultura, Locales y
  tiendas, **Vida nocturna**, **Juegos y diversión** (el antiguo *Entretenimiento* se partió en estas dos).
- **`Subcategory`** — `slug` · `name` · `categoryId`. Unique `(categoryId, slug)`.
- **`Tag`** — `slug @unique` · `name` · `layer TagLayer` · `categoryId?` (**null = universal**,
  seteado = condicional a esa categoría, ej. "tipo de cocina" → Gastronomía). Join **`PlaceTag`**.
  Límites por capa (AUDIENCE máx 4, OCCASION máx 3, VIBE máx 3) y exclusiones mutuas viven en
  **dominio** (`Place.create`), no en el schema.
- **`MetroLine`** — `code @unique` (L1…L6) · `name` · `color` (hex). **`MetroStation`** —
  `slug @unique` · `name` · `lat?` · `lng?`. Relación **many-to-many** (Baquedano = L1+L5).
- **`Commune`** — `slug @unique` · `name`. **`Neighborhood`** — `slug @unique` · `name` ·
  **M2M con `Commune`** (un barrio puede caer en >1 comuna: Bellavista = Recoleta + Providencia;
  Barrio Italia = Providencia + Ñuñoa). El `Place` guarda su comuna exacta aparte y se filtra
  **independiente** por barrio o por comuna.

**Colores del Metro:** L1 Roja `#E1251B` · L2 Amarilla `#F5A800` · L3 Café `#8B4513` ·
L4 Azul `#004F9F` · L4A Celeste `#009CDE` · L5 Verde `#00A651` · L6 Morada `#943C93`.

### Listas / historial / interacción

- **`Collection`** — una sola entidad para listas de usuario Y listas curadas: `name` ·
  `ownerId?` (**null = curada**, pública del admin) · `isCurated` · `slug?` (curadas, SEO) ·
  `description?`. Items via **`CollectionItem`** (`collectionId` + `placeId` + `sortOrder`).
- **`VisitHistory`** — `userId` · `placeId` · `visitedAt`. Combustible para la IA (post-MVP).
- **`Review`** (apagado en MVP) — **polimórfico**: `targetType ReviewTarget` + `targetId`
  (**sin FK al objetivo** — integridad en dominio, para sumar Dish/Event sin tocar schema) ·
  `userId` · `rating` (1–5) · `body?` · `response?`. Unique `(targetType, targetId, userId)`.
- **`Report`** — "reportar dato incorrecto / lugar cerrado": `placeId` · `userId?` (**nullable**:
  el visitante también reporta) · `reason ReportReason` · `message?` · `status ReportStatus`.
- **`TopicSubscription`** (puerta abierta) — `userId` · `keyword`. Alimenta el newsletter/avisos
  por palabra clave. Unique `(userId, keyword)`.

---

## Qué se borró del modelo viejo

`Listing` (→ `Place`), `GoogleReview` (escritas; solo quedan `googleRating`/`googleReviewCount`),
`ListingImage`/`ListingTag` (→ `PlaceImage`/`Tag`+`PlaceTag`), `UserFavorite` (→ `Collection`),
`ListingClaim`, `Subscription` (Flow), `FeedItem`, `ListingAnalytics`; enums `ListingPlan`,
`ListingStatus`, `ClaimStatus`, `SubscriptionStatus`, `TagStatus`, `FeedItemType`; roles
`CONSUMER`/`BUSINESS_OWNER`. Todo vuelve con el self-service de negocios post-MVP.

> ✅ La migración a `Place` (Etapa 4) está **hecha**: `domain/`, `application/`, `app/`, `components/`,
> el seed y el container ya operan sobre el modelo nuevo y la app compila. El cliente Prisma generado
> es el nuevo. Queda solo el push a la BD de producción.
