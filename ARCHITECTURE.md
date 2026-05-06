# ARCHITECTURE.md — Portal Panorama

Referencia arquitectónica del proyecto. Ver `CLAUDE.md` para reglas de estilo y antipatrones.

---

## Estructura de Carpetas

```
src/
├── domain/
│   ├── listing/
│   │   ├── Listing.ts              # Entidad principal
│   │   ├── ListingPlan.ts          # Enum: FREE | PREMIUM
│   │   ├── ListingStatus.ts        # Enum: DRAFT | PUBLISHED | CLAIMED | SUSPENDED
│   │   ├── ListingClaim.ts         # Entidad: solicitud de reclamar un listing
│   │   ├── errors/
│   │   │   ├── ListingNotFoundError.ts
│   │   │   ├── ListingAlreadyClaimedError.ts
│   │   │   └── UnauthorizedListingAccessError.ts
│   │   └── events/
│   │       ├── ListingPublishedEvent.ts
│   │       ├── ListingUpdatedEvent.ts
│   │       ├── ListingClaimedEvent.ts
│   │       └── ListingUpgradedToPremiumEvent.ts
│   ├── user/
│   │   ├── User.ts                 # Entidad usuario
│   │   ├── UserRole.ts             # Enum: CONSUMER | BUSINESS_OWNER | ADMIN
│   │   └── errors/
│   │       ├── UserNotFoundError.ts
│   │       └── EmailAlreadyInUseError.ts
│   ├── review/
│   │   ├── Review.ts               # Entidad reseña
│   │   └── errors/
│   │       └── DuplicateReviewError.ts
│   ├── subscription/
│   │   ├── Subscription.ts         # Entidad suscripción de listing premium
│   │   ├── SubscriptionStatus.ts   # Enum: ACTIVE | PAST_DUE | CANCELLED
│   │   └── errors/
│   │       └── SubscriptionNotActiveError.ts
│   ├── feed/
│   │   ├── FeedItem.ts             # Entidad: ítem del activity feed del usuario
│   │   └── FeedItemType.ts         # Enum: NEW_PHOTO | HOURS_UPDATED | NEW_REVIEW | etc.
│   └── shared/
│       ├── Money.ts                # VO: { amount: number (CLP integer), currency: 'CLP' }
│       ├── RUT.ts                  # VO: validación dígito verificador módulo 11
│       ├── Email.ts                # VO: validación formato email
│       ├── Slug.ts                 # VO: generación URL-slug desde nombre
│       ├── Neighborhoods.ts        # Constante: catálogo fijo de barrios RM Santiago
│       └── DomainError.ts          # Base class para errores de dominio
│
├── application/
│   ├── listing/
│   │   ├── CreateListingUseCase.ts
│   │   ├── UpdateListingUseCase.ts
│   │   ├── PublishListingUseCase.ts
│   │   ├── ClaimListingUseCase.ts
│   │   ├── ResolveListingClaimUseCase.ts   # ADMIN: aprobar/rechazar claim
│   │   ├── UpgradeListingToPremiumUseCase.ts
│   │   ├── GetListingBySlugUseCase.ts
│   │   └── SearchListingsUseCase.ts
│   ├── user/
│   │   ├── RegisterUserUseCase.ts
│   │   ├── GetUserDashboardUseCase.ts
│   │   ├── GetUserFeedUseCase.ts
│   │   ├── SaveFavoriteUseCase.ts
│   │   └── RemoveFavoriteUseCase.ts
│   ├── review/
│   │   ├── CreateReviewUseCase.ts
│   │   └── RespondToReviewUseCase.ts
│   ├── subscription/
│   │   ├── CreateSubscriptionUseCase.ts
│   │   ├── CancelSubscriptionUseCase.ts
│   │   └── HandlePaymentWebhookUseCase.ts
│   └── ports/
│       ├── ListingRepository.ts    # interface ListingRepository { findById, findBySlug, save, ... }
│       ├── UserRepository.ts       # interface UserRepository { findById, findByEmail, save, ... }
│       ├── ReviewRepository.ts     # interface ReviewRepository { findByListing, save, ... }
│       ├── FeedRepository.ts       # interface FeedRepository { createItem, findByUserId, ... }
│       ├── SubscriptionRepository.ts
│       ├── PaymentGateway.ts       # interface PaymentGateway { createSubscription, cancelSubscription, ... }
│       ├── SearchService.ts        # interface SearchService { search, indexListing, ... }
│       ├── EmailService.ts         # interface EmailService { sendWelcome, sendClaimVerification, ... }
│       └── StorageService.ts       # interface StorageService { upload, delete, getUrl, ... }
│
├── infrastructure/
│   ├── db/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── PrismaListingRepository.ts
│   │   ├── PrismaUserRepository.ts
│   │   ├── PrismaReviewRepository.ts
│   │   └── PrismaSubscriptionRepository.ts
│   ├── payment/
│   │   └── FlowPaymentGateway.ts   # implementa PaymentGateway con Flow SDK
│   ├── search/
│   │   ├── PostgresFTSSearchService.ts  # MVP: Postgres full-text
│   │   └── MeilisearchService.ts        # Fase 2+
│   ├── email/
│   │   └── ResendEmailService.ts    # implementa EmailService con Resend SDK
│   └── storage/
│       └── UploadThingStorageService.ts  # o CloudflareR2StorageService.ts
│
├── lib/
│   └── container.ts                # Composition root — factory functions
│
├── app/                            # Next.js App Router
│   ├── (public)/
│   │   ├── page.tsx                # Home
│   │   ├── buscar/page.tsx         # Explorar/Buscar
│   │   ├── lugar/[slug]/page.tsx   # Ficha de lugar (ISR)
│   │   └── planes/page.tsx         # Planes
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── registro/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx      # Dashboard usuario
│   │   └── negocio/
│   │       └── dashboard/page.tsx  # Dashboard negocio
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx            # Resumen: claims pendientes, listings reportados
│   │       ├── claims/page.tsx     # Lista de ListingClaims con filtro por estado
│   │       └── claims/[id]/page.tsx # Detalle de un claim: ver listing, ver claimant, aprobar/rechazar
│   ├── (checkout)/
│   │   └── checkout/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Auth.js handler
│   │   └── webhooks/
│   │       └── flow/route.ts             # Webhook de pagos Flow
│   └── actions/                    # Server Actions
│       ├── listing.actions.ts
│       ├── review.actions.ts
│       └── subscription.actions.ts
│
├── components/
│   ├── ui/                         # Primitivos: Button, Input, Chip, Badge, etc.
│   ├── listing/                    # PlaceCard, PlaceRow, PlaceGallery, PremiumBadge
│   ├── search/                     # SearchForm, FilterSidebar, ResultsGrid
│   ├── layout/                     # TopBar, Footer, DashboardShell
│   └── shared/                     # SectionHeader, StatsStrip, PullQuote, RatingRow
│
└── styles/
    └── globals.css                 # Design tokens del handoff (CSS variables)
```

---

## Bounded Contexts

### 1. Listing Context
Gestión del ciclo de vida de un negocio publicado en el directorio.

**Entidades:** `Listing`, `ListingClaim`
**Value Objects:** `ListingPlan`, `ListingStatus`, `Slug`, `Money`
**Eventos:** `ListingPublished`, `ListingClaimed`, `ListingUpgradedToPremium`
**Use Cases:** CreateListing, UpdateListing, PublishListing, ClaimListing, ResolveListingClaim (ADMIN), UpgradeListingToPremium, GetListingBySlug, SearchListings

### 2. User Context
Gestión de cuentas de usuario (consumidor o dueño de negocio) y activity feed.

**Entidades:** `User`, `FeedItem`
**Value Objects:** `UserRole`, `Email`, `RUT`
**Eventos:** `UserRegistered`
**Use Cases:** RegisterUser, GetUserDashboard, GetUserFeed, SaveFavorite, RemoveFavorite

### 3. Review Context
Reseñas de usuarios sobre listings.

**Entidades:** `Review`
**Nota sobre Rating:** `rating` es un `Int` (1–10) validado con Zod en presentation. No se modela como Value Object — la validación de rango no justifica una clase separada; el campo DB es `Int` y no hay lógica de negocio encima del número.
**Reglas de negocio:** Un usuario solo puede tener una reseña por listing. Un dueño puede responder una vez.
**Use Cases:** CreateReview, RespondToReview

### 4. Subscription Context
Suscripciones recurrentes para listings premium (pago vía Flow).

**Entidades:** `Subscription`
**Value Objects:** `SubscriptionStatus`, `Money`
**Eventos:** `SubscriptionActivated`, `SubscriptionCancelled`, `PaymentFailed`
**Use Cases:** CreateSubscription, CancelSubscription, HandlePaymentWebhook

---

## Ports (Interfaces de Application Layer)

| Port | Responsabilidad |
|------|----------------|
| `ListingRepository` | CRUD de listings en BD |
| `UserRepository` | CRUD de usuarios en BD |
| `ReviewRepository` | CRUD de reviews en BD |
| `SubscriptionRepository` | CRUD de suscripciones en BD |
| `PaymentGateway` | Crear/cancelar suscripciones en Flow; procesar webhooks |
| `SearchService` | Buscar listings con filtros; indexar/des-indexar al publicar |
| `EmailService` | Enviar emails transaccionales (bienvenida, verificación de claim, etc.) |
| `StorageService` | Upload/delete de imágenes de listings |

---

## Eventos de Dominio

| Evento | Quién lo emite | Quién lo consume |
|--------|---------------|-----------------|
| `ListingPublished` | PublishListingUseCase | SearchService (indexar), EmailService (notificar dueño) |
| `ListingUpdated` | UpdateListingUseCase | FeedRepository (crear FeedItems para usuarios con ese favorito) |
| `ListingClaimed` | ClaimListingUseCase | EmailService (notificar dueño anterior y reclamante) |
| `ListingUpgradedToPremium` | UpgradeListingToPremiumUseCase | SearchService (boostear en resultados) |
| `UserRegistered` | RegisterUserUseCase | EmailService (email de bienvenida) |
| `SubscriptionActivated` | HandlePaymentWebhookUseCase | ListingRepository (marcar como premium) |
| `SubscriptionCancelled` | CancelSubscriptionUseCase | ListingRepository (degradar a free), EmailService |
| `PaymentFailed` | HandlePaymentWebhookUseCase | EmailService (notificar dueño), marcar subscription PAST_DUE |

---

## Schema de BD (Prisma — borrador inicial)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      UserRole @default(CONSUMER)
  rut       String?  // RUT validado, opcional
  createdAt DateTime @default(now())
  listings     Listing[]
  reviews      Review[]
  favorites    Favorite[]
  subscriptions Subscription[]
}

model Listing {
  id           String        @id @default(cuid())
  slug         String        @unique
  name         String
  description  String?
  plan         ListingPlan   @default(FREE)
  status       ListingStatus @default(DRAFT)
  categoryId   String        // categoría principal (obligatoria)
  neighborhood String
  address      String?
  phone        String?
  website      String?
  priceRange   Int?          // 1-4 ($, $$, $$$, $$$$)
  ownerId      String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  owner        User          @relation(fields: [ownerId], references: [id])
  category     Category      @relation(fields: [categoryId], references: [id])
  tags         ListingTag[]  // subcategorías/tags filtrables (many-to-many)
  reviews      Review[]
  images       ListingImage[]
  subscription Subscription?
  favorites    Favorite[]
  claims       ListingClaim[]
}

model Tag {
  id       String       @id @default(cuid())
  slug     String       @unique  // "heladeria", "terraza", "vegano"
  name     String
  status   TagStatus    @default(PENDING_APPROVAL)
  listings ListingTag[]
}
// Un Listing solo puede asociarse a Tags con status ACTIVE.
// Tags PENDING_APPROVAL son propuestas del dueño que el equipo admin aprueba/rechaza.

model ListingTag {
  listingId String
  tagId     String
  listing   Listing @relation(fields: [listingId], references: [id])
  tag       Tag     @relation(fields: [tagId], references: [id])
  @@id([listingId, tagId])
}

model ListingClaim {
  id          String      @id @default(cuid())
  listingId   String
  claimantId  String      // usuario que reclama ser el dueño
  status      ClaimStatus @default(PENDING)
  message     String?     // mensaje del reclamante al equipo
  reviewNote  String?     // nota interna del equipo al resolver
  createdAt   DateTime    @default(now())
  resolvedAt  DateTime?
  listing     Listing     @relation(fields: [listingId], references: [id])
  claimant    User        @relation(fields: [claimantId], references: [id])
}

model Event {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String?
  date        DateTime
  endDate     DateTime?
  venue       String?          // nombre del lugar (texto libre si no hay listing)
  listingId   String?          // FK opcional al listing del lugar
  neighborhood String?
  categoryTag String?          // "Al aire libre", "Cultura", "Música", etc.
  createdAt   DateTime @default(now())
  listing     Listing? @relation(fields: [listingId], references: [id])
}

model Category {
  id       String    @id @default(cuid())
  slug     String    @unique
  name     String
  listings Listing[]
}

model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-10
  body      String
  response  String?  // respuesta del dueño
  listingId String
  userId    String
  createdAt DateTime @default(now())
  listing   Listing  @relation(fields: [listingId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@unique([listingId, userId])  // una review por usuario por listing
}

model Subscription {
  id            String             @id @default(cuid())
  listingId     String             @unique
  userId        String
  status        SubscriptionStatus @default(ACTIVE)
  flowPlanId    String             // ID del plan en Flow
  flowSubId     String?            // ID de suscripción en Flow
  priceAmount   Int                // CLP integer
  currentPeriodEnd DateTime?
  createdAt     DateTime           @default(now())
  listing       Listing            @relation(fields: [listingId], references: [id])
  user          User               @relation(fields: [userId], references: [id])
}

model Favorite {
  userId    String
  listingId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  listing   Listing  @relation(fields: [listingId], references: [id])
  @@id([userId, listingId])
}

model FeedItem {
  id        String       @id @default(cuid())
  userId    String       // usuario que recibe el ítem
  listingId String       // listing que generó la actividad
  type      FeedItemType
  payload   Json?        // datos extra (ej: nueva URL de foto, nuevo horario)
  read      Boolean      @default(false)
  createdAt DateTime     @default(now())
  user      User         @relation(fields: [userId], references: [id])
  listing   Listing      @relation(fields: [listingId], references: [id])
}

model ListingImage {
  id        String  @id @default(cuid())
  url       String
  alt       String?
  order     Int     @default(0)
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id])
}

enum UserRole           { CONSUMER BUSINESS_OWNER ADMIN }
enum ListingPlan        { FREE PREMIUM }
enum ListingStatus      { DRAFT PUBLISHED CLAIMED SUSPENDED }
enum SubscriptionStatus { ACTIVE PAST_DUE CANCELLED }
enum ClaimStatus        { PENDING APPROVED REJECTED }
enum TagStatus          { ACTIVE PENDING_APPROVAL REJECTED }
enum FeedItemType       { NEW_PHOTO HOURS_UPDATED NEW_REVIEW INFO_UPDATED }
```

---

## Reglas de Negocio del Dominio

| Regla | Dónde se implementa |
|-------|-------------------|
| Listing FREE: máximo 3 fotos | `Listing.canAddImage()` → lanza error si plan===FREE && images.length>=3 |
| Listing PREMIUM: fotos ilimitadas | Mismo método, no limita |
| Un listing solo puede asociar tags con status ACTIVE | `Listing.addTag(tag)` → valida `tag.status === ACTIVE` |
| Un listing no puede tener más de 1 claim PENDING simultáneo | `ListingClaim` — use case valida antes de crear |
| Una review por usuario por listing | Restricción `@@unique([listingId, userId])` en BD + error de dominio |
| El dueño puede responder una sola vez por review | `Review.respond()` → lanza error si `response` ya existe |
| Barrios: catálogo fijo en código | Constante `NEIGHBORHOODS` en `domain/shared/Neighborhoods.ts` |
| Precios: integer CLP, sin decimales | Value Object `Money` — nunca `number` crudo |
| RUT: validado con módulo 11 | Value Object `RUT` — lanza `InvalidRUTError` si inválido |
| Activity feed: al actualizar listing guardado → FeedItem | Evento `ListingUpdated` → handler crea FeedItems para usuarios con ese favorito |

---

## SEO — Estrategia de renderizado

| Ruta | Estrategia | Justificación |
|------|-----------|---------------|
| `/` | SSR + revalidate 3600s | Contenido editorial que cambia con baja frecuencia |
| `/buscar` | SSR | Resultados dependen de query params del usuario |
| `/lugar/[slug]` | **ISR** (revalidate 300s) | Fichas de negocio deben rankear en Google; se regeneran al actualizar |
| `/planes` | Static (generateStaticParams) | Página estática, cambia raramente |
| `/dashboard` | SSR | Datos de usuario, siempre fresh |
| `/negocio/dashboard` | SSR | Analytics en tiempo real |

`/lugar/[slug]` usa `revalidatePath()` al publicar o actualizar un listing para invalidación bajo demanda.

---

## Autenticación

Auth.js v5. **MVP: solo email/password.** Google OAuth y Apple OAuth se agregan post-MVP.

- Email/password (credentials provider con hash bcrypt)
- ~~Google OAuth~~ — post-MVP
- ~~Apple OAuth~~ — post-MVP

Sesión guardada en BD (`@auth/prisma-adapter`).
El objeto `session.user` incluye `id`, `email`, `role` — disponible en RSC vía `auth()`.

Protección de rutas:
- `/dashboard/*` y `/negocio/*` → middleware de Auth.js que redirige a `/login`
- API routes de webhooks de Flow → validación de firma HMAC, sin sesión
