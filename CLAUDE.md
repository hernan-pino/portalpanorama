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
export default async function PlacePage({ params }) {
  const useCase = container.getPlaceBySlugUseCase()
  const result = await useCase.execute({ slug: params.slug })
  return <PlaceView place={result} />
}

// ❌ Prohibido — lógica en page.tsx
export default async function PlacePage({ params }) {
  const place = await prisma.place.findUnique({ where: { slug: params.slug } })
  if (place.isPremium) { /* ... */ }
}
```

### 2. Prisma nunca entra a domain/ ni application/

```typescript
// ❌ Prohibido en domain/ o application/
import { PrismaClient } from '@prisma/client'

// ✅ Correcto — application/ define la interfaz
interface PlaceRepository {
  findBySlug(slug: string): Promise<Place | null>
}
// infrastructure/ implementa con Prisma
```

### 3. Money como Value Object

Aplica cuando se modele un monto en pesos. En el MVP la monetización está parqueada y el
presupuesto de un `Place` es un **enum `PriceRange`** (bucket), no un monto — `Money` vuelve con
los pagos/self-service post-MVP.

```typescript
// ❌ Prohibido
price: number  // errores de punto flotante, sin unidad

// ✅ Correcto
price: Money   // { amount: number (integer CLP), currency: 'CLP' }
```

### 4. RUT como Value Object

Aplica al lado negocio (reclamar ficha, facturación) que es **post-MVP**. El `User` consumidor del
MVP **no lleva RUT**. Si vuelve, valida el dígito verificador en el VO.

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

### ⛔ REGLA DE IDIOMA — Español de Chile, NUNCA voseo argentino (no negociable)

Aplica a **TODO** el texto orientado al usuario: copy de UI, mensajes de error/validación,
emails, descripciones de fichas, y cualquier contenido que generen las skills/agentes
(`ficha-lugar`, `investigador-lugares`). También aplica a cómo Claude **escribe y conversa**
en este proyecto.

- **Usar tuteo chileno** (formas con "tú"), NO el voseo rioplatense.
- **Prohibido el imperativo voseante** (acento en la última sílaba): se escribe
  `Busca`, `Descubre`, `Guarda`, `Crea`, `Elige`, `Haz clic`, `Ingresa`, `Revisa`,
  `Prueba`, `Vuelve`, `Empieza`, `Filtra`, `Comparte`, `Regístrate`, `Inicia sesión`.
  **NUNCA** `Buscá`, `Descubrí`, `Guardá`, `Creá`, `Elegí`, `Hacé`, `Ingresá`, `Revisá`,
  `Probá`, `Volvé`, `Empezá`, `Filtrá`, `Compartí`, `Registrate`, `Iniciá`.
- **Prohibido el presente voseante:** se escribe `puedes`, `quieres`, `tienes`, `sabes`.
  **NUNCA** `podés`, `querés`, `tenés`, `sabés`.
- En la duda, neutral chileno > rioplatense. Si un texto suena a Buenos Aires, está mal.

---

## Workflow por Fases

```
Fase 0 — Documentos fundacionales          ✅ COMPLETADA
Fase 1 — Domain layer (entidades + VOs)    ✅ COMPLETADA
Fase 2 — Application layer (use cases)     ✅ COMPLETADA
Fase 3 — Infrastructure (Prisma, adapters) ✅ COMPLETADA
Fase 4 — Presentation (UI + routes)        ✅ COMPLETADA (4A-4E)
Fase 5 — Composition root (wire-up DI)     ✅ COMPLETADA
Fase 6 — Fidelidad visual al handoff       ✅ COMPLETADA
Fase 7 — Cerrar MVP (flujos end-to-end)    ✅ COMPLETADA
Fase 8 — Pre-launch consumer-only          ⏸️ DESCARTADA (import masivo) → reemplazada por Fase 9
Fase 9 — Rediseño del producto             🔄 EN CURSO
  Etapa 0 — Definir el producto            ✅ COMPLETADA
  Etapa 1 — Síntesis (PRD)                 ✅ COMPLETADA
  Etapa 2 — Diseñar schema nuevo           ✅ COMPLETADA (schema + plantilla CSV + arquitectura)
  Etapa 3 — Migrar la BD + seed            🔄 local ✅, prod pendiente (va con el redeploy)
  Etapa 4 — Refactor dominio + UI          ✅ COMPLETADA (4A-4E; la app compila sobre Place) — falta push a prod
  Etapa 5 — Cargar lugares a mano          🔄 EN CURSO (pipeline afilado; MUT completo en prod s40 → 511 lugares; siguen más contenedores)
```

**Fase 9 = rediseño profundo.** El modelo nuevo es **`Place` (lugar permanente, sin tipo) + `Event`
separado** (apagado en MVP), monetización/self-service parqueados. El código ya está **migrado a
`Place`** (Etapa 4 ✅, la app compila completa); el modelo viejo `Listing` quedó atrás. Falta cargar
contenido (Etapa 5) y el push a prod. **Plan vivo (fuente de verdad del avance): `PLAN.md`.** Norte
del producto (visión/entidades/permisos/scope): `PRD.md`. Modelo de datos: `SCHEMA.md`.
Capas/contextos: `ARCHITECTURE.md`. Bitácora congelada del rediseño: `PLAN_FASE9.md`.

No avanzar a la siguiente fase/etapa sin OK explícito del usuario.
