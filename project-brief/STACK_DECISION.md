# Stack Decision — Portal Panorama

## Decisión Final

**Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL + Tailwind CSS + Auth.js v5**

Fecha de decisión: 2026-05-05

---

## Opciones evaluadas

### Opción 1 — Next.js 15 App Router + TypeScript + Prisma + PostgreSQL ✅ ELEGIDA

**Por qué encaja:**
- RSC + ISR para fichas de negocio → SEO nativo sin configuración extra. `generateStaticParams` + revalidación bajo demanda cuando un listing se actualiza.
- Server Actions como transport layer: se tratan igual que un controller REST, cero boilerplate extra.
- Prisma tiene inferencia de tipos TypeScript excelente; el schema es la fuente de verdad de la BD.
- Meilisearch: el route handler de Next.js consume la API en el server, nunca expone keys al cliente.
- Despliegue: Vercel + Neon (serverless Postgres) o Docker + `next start` en VPS.
- Ecosistema más grande que cualquier alternativa → más ejemplos de CA + Next.js en la comunidad.

**Riesgos mitigados:**
- App Router tienta a poner lógica en `page.tsx` → se controla con convención de "page.tsx solo llama container" revisada en code review.
- Vercel puede ser caro a escala → alternativa lista: Docker image + VPS chileno/latinoamericano.

### Opción 2 — Remix v2 + TypeScript + Prisma (descartada)

Loader/action mapea limpiamente a CA pero ISR es limitado → fichas de negocio serían SSR puro con latencia mayor. Ecosistema más chico y menor documentación en español/LATAM.

### Opción 3 — NestJS (API) + Next.js (frontend) (descartada)

CA más pura pero con costo operacional alto para equipo chico: dos `package.json`, dos pipelines CI, fetch explícito frontend→API añade latencia en SSR. Reservada para cuando el proyecto escale a equipos separados.

---

## Decisiones complementarias

| Decisión | Elección | Razón |
|----------|----------|-------|
| Auth | Auth.js v5 | Open source, nativo App Router, sin vendor lock-in, soporta Google + Apple + credenciales |
| ORM | Prisma | Type-safety, migraciones, excelente DX |
| CSS | Tailwind CSS | Diseño token-compatible, purge automático, sin runtime JS |
| Validación HTTP | Zod | Integración con TypeScript, schema reutilizable entre server y client |
| ID format | CUID2 | URL-friendly, cortos, sin guiones, colisión prácticamente imposible |
| Money | Value Object `Money` (CLP, integer cents) | Evita errores de punto flotante con precios en pesos |
| Búsqueda MVP | Postgres full-text (pg_search) | Suficiente para MVP; Meilisearch se enchufa después sin cambiar use cases |
| Storage imágenes | UploadThing (MVP) → Cloudflare R2 (escala) | SDK nativo Next.js, sin config de buckets, detrás de port StorageService |
| Email | Resend | API simple, buen free tier, SDK TypeScript |

---

## Estructura de carpetas fijada

```
src/
  domain/           # Entidades, VOs, errores, eventos — cero imports externos
  application/      # Use cases, ports (interfaces TS)
  infrastructure/   # Prisma repos, Flow adapter, Resend, Meilisearch, Auth.js config
  lib/
    container.ts    # Composition root: factory functions, wire-up de dependencias
  app/              # Next.js App Router: page.tsx, layout.tsx, route.ts, actions.ts
  components/       # Componentes React (presentation pura)
  styles/           # globals.css con design tokens del handoff
```

**Regla de oro:** `page.tsx` y `actions.ts` solo instancian el use case desde `container.ts` y mapean la respuesta a JSX o redirect. Cero lógica de negocio en la capa de presentación.
