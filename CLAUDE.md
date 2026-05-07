# CLAUDE.md — Portal Panorama

Reglas arquitectónicas permanentes. Este archivo se autocarga en cada sesión.

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript (strict mode)
- **ORM:** Prisma + PostgreSQL
- **CSS:** Tailwind CSS (design tokens del handoff en globals.css)
- **Auth:** Auth.js v5 — MVP: solo email + contraseña. Google y Apple se agregan post-MVP.
- **Validación HTTP:** Zod
- **IDs:** CUID2 en todas las entidades
- **Email:** Resend
- **Pagos:** Flow (detrás de port `PaymentGateway`)
- **Búsqueda MVP:** Postgres FTS → Meilisearch (Fase 2+, detrás de port `SearchService`)

---

## Estructura de Carpetas

```
src/
  domain/           # Entidades, Value Objects, errores de dominio, eventos
  application/      # Use cases, ports (interfaces TypeScript)
  infrastructure/   # Implementaciones concretas: Prisma, Flow, Resend, Meilisearch
  lib/
    container.ts    # Composition root: factory functions
  app/              # Next.js App Router: pages, layouts, route handlers, server actions
  components/       # Componentes React (presentation pura)
  styles/           # globals.css con design tokens
```

### Regla de dependencias (no negociable)

```
domain ← application ← infrastructure
                      ← presentation (app/ + components/)
                      ← lib/container.ts
```

`domain/` no importa nada externo.
`application/` no importa Prisma, Next.js, ni ningún framework.
`infrastructure/` no importa desde `app/`.

---

## Reglas que se aplican SIEMPRE

### 1. Lógica de negocio solo en use cases
`page.tsx`, `layout.tsx`, `route.ts`, y `actions.ts` son transporte puro.
Solo instancian el use case desde `container.ts` y mapean la respuesta a JSX, redirect, o Response.

```typescript
// ✅ Correcto
export default async function ListingPage({ params }) {
  const useCase = container.getListingUseCase()
  const result = await useCase.execute({ id: params.id })
  return <ListingView listing={result} />
}

// ❌ Prohibido — lógica en page.tsx
export default async function ListingPage({ params }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (listing.plan === 'PREMIUM') { /* ... */ }
}
```

### 2. Prisma nunca entra a domain/ ni application/

```typescript
// ❌ Prohibido en domain/ o application/
import { PrismaClient } from '@prisma/client'

// ✅ Correcto — application/ define la interfaz
interface ListingRepository {
  findById(id: string): Promise<Listing | null>
}
// infrastructure/ implementa con Prisma
```

### 3. Money como Value Object

```typescript
// ❌ Prohibido
price: number  // errores de punto flotante, sin unidad

// ✅ Correcto
price: Money   // { amount: number (integer CLP), currency: 'CLP' }
```

### 4. RUT como Value Object

```typescript
// ✅ Correcto — validación del dígito verificador en el VO
const rut = RUT.create('12.345.678-9')  // lanza DomainError si inválido
```

### 5. Pagos detrás de un port

```typescript
// ❌ Prohibido en application/
import { FlowClient } from 'flow-sdk'

// ✅ Correcto
interface PaymentGateway {
  createSubscription(params: SubscriptionParams): Promise<PaymentResult>
}
// El use case recibe PaymentGateway por inyección de dependencias
```

### 6. Validación de input en presentation, no en use cases

```typescript
// ✅ Correcto — Zod en server action
const schema = z.object({ name: z.string().min(2) })
const parsed = schema.safeParse(formData)
if (!parsed.success) return { error: parsed.error }

// Recién entonces llama al use case con datos validados
const useCase = container.getCreateListingUseCase()
await useCase.execute(parsed.data)
```

---

## Reglas que se aplican con criterio

### Result<T, E>
Usar solo en use cases con flujos de error complejos (múltiples paths de fallo).
No forzar en operaciones simples donde `throw` o `null` son más claros.

### Mappers
Crear mapper (`domain → Prisma model`) solo cuando la entidad de dominio
difiere genuinamente del schema de BD. Si el objeto Prisma ES el DTO,
usarlo directamente en el use case evita código sin valor.

### DI Container
`src/lib/container.ts` usa factory functions simples, sin framework de DI.

```typescript
// src/lib/container.ts
export const container = {
  getCreateListingUseCase() {
    const repo = new PrismaListingRepository(prisma)
    return new CreateListingUseCase(repo)
  }
}
```

---

## Antipatrones Prohibidos

| Antipatrón | Por qué está prohibido |
|-----------|------------------------|
| `import { PrismaClient }` en domain/ o application/ | Acopla el dominio a la BD; imposibilita cambiar ORM |
| Retornar objeto Prisma desde use case con lógica de negocio encima | El caller puede mutar el "aggregate" sin pasar por invariantes |
| Lógica de negocio en page.tsx / actions.ts / route.ts | No testeable, duplicable, viola SRP |
| Llamar Flow/Resend directamente desde un use case | Imposibilita mockear en tests, acopla al vendor |
| Archivos `utils.ts` o `helpers.ts` genéricos | Cementerio de código sin dueño; organizar por contexto |
| `any` o `unknown` en retorno de use case | Rompe la seguridad de tipos que justifica TypeScript |
| `number` para representar dinero | Errores de punto flotante; usar Value Object `Money` |
| Leer `process.env` fuera de `infrastructure/` o `lib/` | Configuración de entorno no pertenece al dominio |

---

## Bounded Contexts

Ver `ARCHITECTURE.md` para la lista completa de bounded contexts, ports y eventos de dominio.

---

## Design System

Los design tokens del handoff viven en `src/styles/globals.css`.
Los componentes React en `src/components/` respetan:
- Tipografía: Fraunces (display) + Inter Tight (UI) + Geist Mono (mono)
- Colores: warm cream paper + accent sunset (oklch)
- Espaciado: escala 4px (`--s-1` a `--s-32`)
- Componentes de referencia en `design_handoff_portal_panorama/`

NO copiar HTML del handoff como código de producción.
Reconstruir cada componente con React + Tailwind respetando los tokens.

---

## Mercado Chile

- Moneda: **CLP** (pesos chilenos, entero, sin decimales)
- RUT: validación con dígito verificador (módulo 11)
- Pagos recurrentes: **Flow** (webhooks en `/api/webhooks/flow`)
- Idioma UI: Español de Chile

---

## Workflow por Fases

```
Fase 0 — Documentos fundacionales          ✅ COMPLETADA
Fase 1 — Domain layer (entidades + VOs)    ✅ COMPLETADA
Fase 2 — Application layer (use cases)     ✅ COMPLETADA
Fase 3 — Infrastructure (Prisma, adapters) ✅ COMPLETADA
Fase 4 — Presentation (UI + routes)        🔄 EN CURSO
  4A — Fundación + Auth                    ✅ COMPLETADA (commit 105e9ed)
  4B — Páginas públicas                    ✅ COMPLETADA (commit 18092c0)
  4C — Dashboard de negocio                ✅ COMPLETADA (commit e250ca0)
  4D — Dashboard de usuario                ✅ COMPLETADA (commit 4732535)
  4E — Admin + Webhooks Flow               ✅ COMPLETADA
Fase 5 — Composition root (wire-up DI)     🔄 EN CURSO (parcial en container.ts)
```

No avanzar a la siguiente fase sin OK explícito del usuario.
