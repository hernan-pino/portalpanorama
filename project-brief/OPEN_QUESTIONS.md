# Open Questions — Portal Panorama

Dudas sobre dominio, flujos, prioridades y diseño. Se mantiene vivo durante todo el proyecto.
Estado: ✅ Respondida | ⏳ Pendiente

---

## Dominio y Modelo de Negocio

**Q1. ¿Planes para usuarios consumidores en scope?**
El handoff muestra "Planes para ti" (Plus $3.990/mes, Pro $9.990/mes) además de planes para negocios.
✅ **Respondida:** Solo listings premium para negocios. Usuarios son siempre gratis (favoritos/listas). Un usuario puede publicar un listing y convertirse en dueño de negocio — el rol "business owner" no es exclusivo.

**Q2. ¿"Mi feed" del dashboard de usuario está en scope para MVP?**
El handoff muestra un tab "Mi feed" con timeline de updates de lugares guardados. El brief no lo menciona explícitamente.
✅ **Respondida (ver Q19):** Sí, va en el MVP. Los usuarios ven novedades de sus lugares guardados (FeedItem generado por evento ListingUpdated).

**Q3. ¿El catálogo de barrios es fijo o configurable?**
El handoff hardcodea 10 barrios: Lastarria, Bellavista, Providencia, Italia, Ñuñoa, Vitacura, Las Condes, Yungay, Brasil, Centro.
✅ **Respondida:** Catálogo inicial fijo en código (los 10 barrios del handoff como seed), pero gestionable desde el admin: el equipo puede agregar, activar o desactivar barrios. La entidad `Neighborhood` vive en BD; el seed inicial carga los 10 barrios del handoff. Los usuarios pueden sugerir nuevos barrios (flujo similar a tags: PENDING_APPROVAL → ACTIVE).

**Q4. ¿Un listing puede pertenecer a más de una categoría?**
✅ **Respondida:** Una categoría principal + tags de subcategorías (ej: categoría "Cafés" + tag "Heladería"). Ambos deben ser filtrables en búsqueda. Un café con tag "heladería" debe aparecer al buscar cualquiera de las dos keywords.

**Q5. ¿Los tags son libres o de un catálogo predefinido?**
✅ **Respondida:** Híbrido. El dueño elige del catálogo predefinido, pero puede proponer tags nuevos que quedan pendientes de aprobación por el equipo admin. Los tags aprobados pasan al catálogo general.

**Q6. ¿El flujo de "reclamar un listing" es verificación manual o automática?**
✅ **Respondida:** Revisión manual por el equipo (el usuario + posiblemente un amigo). El claim queda en estado PENDIENTE hasta que sea APROBADO o RECHAZADO. Necesita alguna forma de ver y gestionar claims pendientes (ver Q14 actualizada).

**Q7. ¿Los "eventos" son listings especiales o una entidad separada?**
✅ **Respondida:** Entidad separada. Un evento es algo puntual (aunque puede repetirse), mientras que un listing es el perfil permanente de un negocio. Un evento puede estar vinculado opcionalmente a un listing (ej: "Jazz en Thelonious" → Listing de Thelonious). Campos específicos de Event por definir más adelante.

**Q8. ¿Los negocios pueden tener múltiples fotos? ¿Hay límite free vs premium?**
✅ **Respondida (ver Q18):** Free: hasta 3 fotos. Premium: ilimitado. Regla implementada en `Listing.canAddImage()`.

---

## Técnico

**Q9. ¿IDs: CUID2 o UUID?**
✅ **Respondida por defecto:** CUID2 — más cortos, URL-friendly, sin guiones. Se aplica a todas las entidades.

**Q10. ¿Búsqueda facetada (Meilisearch) necesaria en MVP?**
La búsqueda con filtros facetados puede implementarse con Postgres full-text en MVP y enchufar Meilisearch después sin cambiar use cases (está detrás de un port).
✅ **Respondida:** Postgres FTS para MVP. El port `SearchService` ya existe — Meilisearch se puede enchufar en Fase 2+ sin tocar use cases. No vale la pena el overhead de infraestructura en MVP.

**Q11. ¿Social auth (Google, Apple) en scope para MVP?**
✅ **Respondida:** Solo email + contraseña para MVP. Google y Apple se agregan después.

**Q12. ¿Los precios del handoff ($3.990 / $9.990 CLP/mes) son definitivos?**
✅ **Respondida:** No definidos aún. Valores placeholder hasta producción.

**Q13. ¿Storage de imágenes?**
✅ **Respondida:** UploadThing para MVP. Migrable a Cloudflare R2 después sin tocar el dominio (detrás de port StorageService).

**Q14. ¿Cómo gestionan los claims pendientes tú y tu amigo?**
✅ **Respondida:** Ruta `/admin` en la misma app, protegida por rol ADMIN. Lista de claims pendientes con acciones de aprobar/rechazar. El rol ADMIN ya está en el enum `UserRole`.

---

## UX / Diseño

**Q15. ¿Qué muestra /planes?**
✅ **Respondida:** Sin toggle. La página muestra directamente la comparativa Free vs. Premium para negocios — qué incluye cada plan, con tabla comparativa. Sin sección "Para ti" separada.

**Q16. ¿Hay mapa en la ficha de lugar para MVP?**
✅ **Respondida:** No. Solo dirección en texto para MVP. Mapa OpenStreetMap queda para Fase 2.

**Q17. ¿Barrios: catálogo fijo o configurable?**
✅ **Respondida:** Catálogo fijo en código — las subdivisiones de la Región Metropolitana de Santiago más los barrios más emblemáticos. No configurable desde admin.

**Q18. ¿Límite de fotos por listing?**
✅ **Respondida:** Free: hasta 3 fotos. Premium: ilimitado. Esta regla vive en el dominio (Listing valida el límite según su plan).

**Q19. ¿"Mi feed" del dashboard de usuario va en MVP?**
✅ **Respondida:** Sí, va en el MVP. Los usuarios ven novedades de sus lugares guardados.

---

---

## Decisiones técnicas — Fase 1

**D1. Bootstrapping manual en lugar de create-next-app**
`create-next-app` rechaza directorios con mayúsculas en el nombre (restricción npm). Se optó por scaffoldear manualmente `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs` y `eslint.config.mjs`. Resultado equivalente con más control sobre las dependencias iniciales.

**D2. `Money.format()` removida del dominio**
El architecture-guardian detectó que `Intl.NumberFormat('es-CL', ...)` en el VO es un concern de presentación. Se extrajo a `src/lib/formatMoney.ts` que recibe `MoneyProps` (plain object). El dominio no sabe cómo luce el dinero en pantalla.

**D3. `TagStatus` como enum separado**
El tipo de `ListingTag.status` se definió inicialmente como string union inline `'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED'`. Se extrajo a `src/domain/listing/TagStatus.ts` para consistencia con el resto de enums y para evitar divergencia silenciosa si los valores cambian.

**D4. `ClaimStatus` vive en `ListingClaim.ts`, no en archivo propio**
A diferencia de `ListingPlan` y `ListingStatus`, `ClaimStatus` está declarado en el mismo archivo que la entidad que lo usa. Es el único enum del dominio sin archivo propio. Justificación: `ClaimStatus` solo tiene sentido junto a `ListingClaim`; extraerlo sería sobreingeniería sin beneficio real.

**D5. `DuplicateReviewError` existe en dominio pero se lanza desde infrastructure**
La clase del error vive en `src/domain/review/errors/`. Sin embargo, quien lo lanza será `PrismaReviewRepository` (Fase 3) al capturar el error de constraint único de Postgres. El dominio define el tipo; infrastructure lo materializa.

**D6. Sin test runner en Fase 1**
No se configuró Jest ni Vitest. El tipo de verificación en esta fase fue `tsc --noEmit` (cero errores de tipos, modo strict). Tests unitarios del dominio se agregarán en Fase 2 cuando los use cases pongan las entidades en movimiento.

**D7. `rating` en Review como `number`, no VO**
Decisión confirmada de ARCHITECTURE.md: la validación de rango (1-10) pertenece a Zod en presentation. El dominio acepta el `number` ya validado. No se creó un VO `Rating` por no tener lógica de negocio encima del número.

---

## Decisiones técnicas — Fase 2

**D8. PasswordHasher como port (no hash en presentation)**
El use case `RegisterUserUseCase` recibe la contraseña en texto plano y usa un `PasswordHasher` port para hashearla. La implementación bcrypt vive en `infrastructure/`. Alternativa descartada: que la server action hashee antes de llamar al use case — eso acopla la lógica de hashing a la capa de presentación e impide testear el use case unitariamente.

**D9. AnalyticsService como port propio (contadores en BD, no GA)**
Se eligió un `AnalyticsService` port simple con contadores en Postgres sobre Google Analytics. Razón: la API de GA es compleja de consultar programáticamente desde el dashboard. La implementación `PostgresAnalyticsService` (Fase 3) usará una tabla `listing_analytics` con columnas `view_count` y `click_count`. Migrable a Plausible/GA después sin tocar use cases.

**D10. Flujo de suscripción: sin registro hasta webhook**
`CreateSubscriptionUseCase` solo llama a Flow y devuelve la `paymentUrl` — no escribe en BD. El registro de `Subscription` ocurre en `HandlePaymentWebhookUseCase` al recibir `subscription.activated`. Esto evita el need de un estado PENDING y garantiza que en BD solo existen suscripciones confirmadas. Trade-off: si el webhook falla, el usuario pagó pero el sistema no lo refleja (Flow tiene reintentos automáticos; el `UNIQUE constraint` en `flowSubId` garantiza idempotencia).

**D11. UpgradeListingToPremiumUseCase es admin-only**
El security-reviewer detectó que un dueño podría llamar directamente a este use case y obtener PREMIUM sin pagar. Se rediseñó como override manual para admins (`adminId` requerido, se verifica `user.isAdmin()`). El flujo normal de upgrade va por el webhook de pago. Uso previsto: períodos promocionales, compensaciones, testing en producción.

**D12. Idempotencia en HandlePaymentWebhookUseCase**
Flow puede re-entregar el mismo webhook por timeouts de red. `handleActivated` verifica primero si ya existe una `Subscription` con ese `flowSubId` antes de crear una nueva. Si existe, retorna sin efecto. Esto previene duplicación de suscripciones y doble-upgrade del listing.

**D13. timestampHeader explícito en PaymentGateway port**
El port `PaymentGateway.parseWebhookEvent(payload, signature, timestampHeader)` exige que la implementación reciba el timestamp del header de Flow por separado. Esto hace explícito el contrato: cualquier implementación que ignore `timestampHeader` genera advertencia de parámetro no utilizado y es visible en code review. La implementación `FlowPaymentGateway` (Fase 3) debe validar que el timestamp no sea anterior a 5 minutos para prevenir replay attacks.

**D14. TOCTOU en registro, reviews y suscripciones — diferido a Fase 3**
El security-reviewer identificó condiciones de carrera en:
- `RegisterUserUseCase`: dos requests simultáneos con el mismo email pueden crear dos cuentas.
- `CreateReviewUseCase`: doble-submit puede crear dos reviews del mismo usuario.
- `CreateSubscriptionUseCase`: doble-click puede disparar dos pagos en Flow.

Estos se resuelven en Fase 3 con `UNIQUE constraint` en Postgres y captura del error de violación en los repositorios Prisma:
- `users.email` → `UNIQUE`
- `reviews.(listingId, userId)` → `UNIQUE` (ya está en ARCHITECTURE.md schema)
- `subscriptions.listingId` → `UNIQUE` (solo puede haber una suscripción activa por listing)

El check en el use case permanece como early-return para UX, pero no como única barrera.

---

---

## Decisiones técnicas — Fase 3

**D15. Prisma 7: datasource URL en `prisma.config.ts`, no en schema.prisma**
Prisma 7 eliminó la propiedad `url` del bloque `datasource` en el schema. La URL de conexión se configura ahora en `prisma.config.ts` (raíz del proyecto) usando `defineConfig({ datasource: { url } })`. El cliente Prisma se inicializa con `@prisma/adapter-pg` en `src/lib/db.ts`. Esto desacopla el schema del entorno y alinea con la arquitectura de Prisma 7.

**D16. Mapper `toListingDomain` exportado como función libre**
El mapper `toListingDomain` se exporta como función libre desde `PrismaListingRepository.ts` en lugar de vivir en un módulo separado. `PrismaUserRepository` lo importa para reusar el mismo mapeado al cargar listings favoritos. Decisión pragmática: sin duplicación, sin sobre-abstracción. Si hubiera un tercer consumidor, se crearía un archivo `mappers/listing.mapper.ts`.

**D17. Imágenes y tags de Listing: reemplazo total en transacción**
El método `save(listing)` elimina y recrea todas las imágenes y tags del listing en cada persistencia, dentro de una transacción. Alternativa descartada: diff incremental (complejo, propenso a errores). Dado que el dominio maneja la colección como parte del agregado (no como entidades con ciclo de vida independiente), el reemplazo total es correcto y simple. No hay riesgo de pérdida de datos porque el estado canónico vive en el objeto de dominio en memoria.

**D18. `flowSubId` y `currentPeriodEnd` como opcionales en el schema**
Según D10, las suscripciones solo se persisten después de recibir el webhook `subscription.activated`. Pero el dominio define `flowSubId?: string` y `currentPeriodEnd?: Date` como opcionales para reflejar el estado del agregado antes de la activación. Se hacen opcionales en el schema para evitar sentinels (`''`, `new Date(0)`). En BD, nunca deberían ser `NULL` (el use case del webhook siempre los provee al hacer `activate()`), pero el constraint es en el dominio, no en la BD.

**D19. Idempotencia de webhooks `payment.failed` y `subscription.cancelled` — diferida a Fase 3b o Fase 5**
El security-reviewer detectó que solo `subscription.activated` tiene guard de idempotencia (via `findByFlowSubId`). Los eventos `payment.failed` y `subscription.cancelled` pueden procesarse múltiples veces si Flow re-entrega el webhook dentro de la ventana de 5 minutos. Solución correcta: tabla `WebhookLog` con UNIQUE en `flowEventId` + verificación antes de procesar. Se difiere porque requiere: (a) un nuevo modelo en el schema, (b) un nuevo port `WebhookLogRepository`, (c) adaptar `HandlePaymentWebhookUseCase`. Se documenta como deuda técnica para implementar antes de producción.

**D20. Comparación de firma HMAC con `timingSafeEqual`**
El security-reviewer detectó que la comparación `===` en la firma del webhook es vulnerable a timing attacks. Se reemplazó por `timingSafeEqual(Buffer, Buffer)` de Node.js `crypto`. También se validó que los timestamps futuros son rechazados usando `Math.abs()` en lugar de una resta directa.

**D21. Escaping HTML en emails de Resend**
Todos los valores interpolados en los templates HTML de `ResendEmailService` se escapan con una función `escapeHtml()` local (sin dependencia externa). Previene XSS en clientes de email con soporte HTML (Gmail web, Outlook web). El escape cubre: `&`, `<`, `>`, `"`, `'`.

**D22. MIME allowlist y tamaño máximo en UploadThing**
`UploadThingStorageService.upload()` valida que el MIME type sea `image/jpeg | png | webp | gif` y que el archivo no supere 5 MB antes de llamar al SDK. El nombre del archivo se sanitiza (`/[^a-zA-Z0-9._-]/g → '_'`). La key extraída para `delete()` se valida contra `/^[\w-]+$/` para prevenir manipulación de rutas.

---

## Decisiones técnicas — Fase 4 (4A + 4B + 4C)

**D23. Serialización de entidades de dominio en Edit Listing**
Las entidades de dominio (clase `Listing` con métodos) no son serializables a través del boundary server→client. La página de editar extrae un plain object `listingData` del aggregate antes de pasarlo al form client component. Esto es intencional: el form solo necesita los datos para pre-popular inputs, no los invariantes del dominio.

**D24. SearchBar envuelto en `<Suspense>` por `useSearchParams`**
`SearchBar` usa `useSearchParams()` (hook de React), lo que fuerza a que el componente sea un Client Component. En Next.js 15, cualquier componente que use `useSearchParams` sin `<Suspense>` hace que toda la página haga SSR con bailout. Se separó en `SearchBarInner` + wrapper con `<Suspense fallback>` para confinarlo.

**D25. `signOut` de Auth.js v5 desde Server Component**
Los Server Components no soportan event handlers. La solución correcta para logout es un `<form action={serverAction}>` donde `serverAction` llama a `signOut({ redirectTo: '/' })`. Se evitó el patrón incorrecto de POST directo a `/api/auth/signout`.

**D26. Deuda técnica — violaciones de arquitectura documentadas**
El architecture-guardian detectó violaciones en la sub-fase 4C que se resuelven antes de pasar a producción:
- **HIGH**: `src/app/lugar/[slug]/page.tsx` accede a `reviewRepository` directamente — mover a un use case dedicado (`GetListingWithReviewsUseCase` o extender `GetListingBySlugUseCase`).
- **HIGH**: `src/app/dashboard/suscripcion/page.tsx` accede a `subscriptionRepository` directamente — mover a un `GetSubscriptionStatusUseCase` o extender `GetBusinessDashboardUseCase`.
- **MEDIUM**: `src/app/dashboard/suscripcion/actions.ts` lee `process.env.FLOW_PLAN_ID` — mover a `src/lib/config.ts` o a `infrastructure/`.

**D27. Deuda técnica — vulnerabilidades de seguridad documentadas**
El security-reviewer detectó vulnerabilidades que se resuelven antes de producción:
- **auth.ts**: falta `redirect` callback para prevenir open redirect via `callbackUrl` — validar contra lista de dominios permitidos.
- **FlowPaymentGateway.ts**: `padEnd` en HMAC y falta validación de formato hex — reemplazar con regex `/^[a-f0-9]{64}$/i`.
- **HandlePaymentWebhookUseCase.ts**: `payment.failed` y `subscription.cancelled` sin guards de idempotencia — implementar tabla `WebhookLog` (ver D19).
- **actions.ts (login, registro, suscripcion)**: sin rate limiting — agregar Upstash Ratelimit o similar.
- **PostgresFTSSearchService.ts**: sin cap en `limit` — agregar `Math.min(params.limit ?? 20, 100)`.

---

---

## Decisiones técnicas — Fase 4D

**D28. `User.withProfile()` — método inmutable de actualización de perfil**
Se agregó `withProfile(name: string, rut?: RUT): User` a la entidad `User`, siguiendo el patrón ya existente de `withRole()`. El use case `UpdateUserProfileUseCase` usa este método para producir un nuevo aggregate con nombre y RUT actualizados antes de persistir. Alternativa descartada: que el use case reconstruya el User con `User.create()` directamente — posible, pero más verboso y acopla el use case a la estructura interna del User.

**D29. `GetUserFeedUseCase` — dos use cases en la feed page**
La feed page llama a `getGetUserFeedUseCase()` y `getGetUserDashboardUseCase()` en paralelo, luego construye un `Map<listingId, Listing>` en la página para enricher los ítems con nombre y slug del listing. Esta lógica de join vive en la presentation layer (violación MEDIUM detectada por architecture-guardian). Se documenta como deuda técnica. Solución correcta: crear un `GetUserFeedWithListingsUseCase` que devuelva un `FeedItemView[]` ya enriquecido con `listingName` y `listingSlug`. Se difiere porque el MVP funciona correctamente — los feed items siempre corresponden a listings favoriteados por el usuario.

**D30. `InvalidRUTError` — RUT no se incluye en el mensaje público**
La clase `InvalidRUTError` originalmente incluía el valor del RUT en el mensaje (`RUT inválido: "12.345.678-9"`). El security-reviewer identificó que el RUT es un dato personal que no debe serializarse en respuestas HTTP ni en logs de monitoreo. Se eliminó el valor del mensaje; el constructor recibe `_raw` pero no lo expone. El mensaje público es genérico: "El RUT ingresado no es válido. Formato esperado: 12.345.678-9".

**D31. Validación de RUT en presentation antes del VO**
Se agregó un prefiltro Zod en `perfil/actions.ts` para el campo RUT: regex `/^[\d.\-kK]+$/`, `min(8)`, `max(12)`, y transformación de string vacío a `undefined`. Esto rechaza caracteres inválidos en presentation antes de que lleguen al VO del dominio, siguiendo la regla de CLAUDE.md de validar en presentation.

**D32. Deuda técnica — `callbackUrl` fijo en layout de /mi-cuenta**
El layout de `/mi-cuenta` redirige a `/login?callbackUrl=/mi-cuenta/favoritos` independientemente de la sub-ruta visitada. Un usuario que accede a `/mi-cuenta/perfil` sin sesión es redirigido tras login a `/mi-cuenta/favoritos` en vez de `/mi-cuenta/perfil`. No es una vulnerabilidad de seguridad, pero sí una fricción de UX. Solución correcta: leer la URL actual con `headers()` y `x-invoke-path` o pasar el callbackUrl dinámicamente. Se difiere por ser UX menor.

**D33. Deuda técnica — `RemoveFavoriteUseCase` sin verificación de existencia previa**
El use case llama a `removeFavorite()` sin verificar primero `isFavorite()`. El riesgo de IDOR es nulo (el `userId` viene de la sesión), pero el `DELETE` silencioso puede enmascarar comportamiento inesperado. Solución: agregar `isFavorite` check y lanzar `FavoriteNotFoundError` si no existe. Se difiere como LOW severity.

---

## Decisiones técnicas — Fase 4E

**D34. HMAC de webhooks sobre raw body, no sobre JSON re-serializado**
`FlowPaymentGateway.parseWebhookEvent` recibe `rawBody: string` (en lugar de `payload: unknown`) y calcula el HMAC-SHA256 sobre ese string exacto antes de parsear JSON. Flow calcula su HMAC sobre el raw body; si se pasara el objeto parseado y se re-serializara con `JSON.stringify`, cualquier diferencia de formato entre el body original y la re-serialización causaría fallos de firma. El parsing JSON ocurre solo después de verificar la firma. El port `PaymentGateway` y `HandlePaymentWebhookUseCase` fueron actualizados en consecuencia.

**D35. `WebhookValidationError` como tipo de error distinguible**
Se creó `WebhookValidationError extends DomainError` en `application/errors.ts`. `FlowPaymentGateway` lo lanza para errores de timestamp expirado, firma inválida, o JSON malformado. El route handler `/api/webhooks/flow` usa `instanceof WebhookValidationError` para devolver 400 (no reintentar) vs 500 (reintentar). Las respuestas 400 usan un mensaje genérico "Webhook rechazado" sin revelar la causa específica (previene oracle de timing).

**D36. Idempotencia en `handlePaymentFailed` y `handleCancelled`**
Se agregaron guards de status antes de actuar: si la suscripción ya está en `PAST_DUE` o `CANCELLED`, el handler retorna sin efecto. Previene emails duplicados y escrituras innecesarias a BD cuando Flow re-entrega el mismo evento. Complementa la idempotencia existente en `handleActivated` (D12).

**D37. Server actions de admin con validación Zod**
`claims/actions.ts` y `tags/actions.ts` validan los parámetros de entrada con Zod antes de llamar al use case: `decision` debe ser `'APPROVE' | 'REJECT'`, IDs deben ser strings no-vacíos, `reviewNote` tiene máximo 1000 caracteres. Los errores de dominio se mapean a mensajes genéricos sin IDs internos.

**D38. Tipos locales en componentes client de admin**
`ClaimRow.tsx` y `TagRow.tsx` definen su propio `interface` local en lugar de importar desde `@application/ports/`. Siguiendo la regla de capas, los componentes `'use client'` no deben conocer la capa de application — reciben los datos ya mapeados como props desde el Server Component padre.

---

## Historial de actualizaciones

| Fecha | Cambio |
|-------|--------|
| 2026-05-05 | Creación inicial con preguntas detectadas en Fase 0 |
| 2026-05-05 | Ronda de preguntas pre-Fase 1: Q4-Q8, Q11-Q16, Q17-Q19 respondidas |
| 2026-05-06 | Fase 1 completada: decisiones técnicas D1-D7 documentadas |
| 2026-05-06 | Fase 2 completada: decisiones técnicas D8-D14 documentadas |
| 2026-05-06 | Fase 3 completada: decisiones técnicas D15-D22 documentadas |
| 2026-05-07 | Q3 y Q10 respondidas antes de Fase 4 |
| 2026-05-07 | Sub-fases 4A+4B+4C completadas: decisiones D23-D27 documentadas |
| 2026-05-07 | Sub-fase 4D completada: decisiones D28-D33 documentadas |
| 2026-05-07 | Sub-fase 4E completada: decisiones D34-D38 documentadas |
