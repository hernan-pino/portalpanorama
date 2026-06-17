# Spec — Entidad `Brand` (Negocio / Marca con varias sucursales)

**Estado:** especificación, **no construida**. Decisión de scope pendiente (MVP vs post-launch).
**Fecha:** 2026-06-17 · **Relacionado:** [SCHEMA.md](SCHEMA.md) · [PRD.md](PRD.md) · [PLAN.md](PLAN.md)

---

## 1. Problema / motivación

Una marca comercial con varias sucursales (Emporio La Rosa: Lastarria, Merced, Providencia…) hoy son
**fichas `Place` inconexas**: no hay forma de agruparlas ni de navegar de una a "todas las de la marca".

Queremos:
- En la **ficha**, un bloque **"Por [Marca] ↗"** (con logo).
- Al clickearlo → página **`/marca/[slug]`** con **todas sus sucursales** (y a futuro sus publicaciones/eventos).
- Cada sucursal **sigue siendo su propia ficha** con su rating/place_id propio (eso ya funciona); la marca
  solo las **agrupa**.

---

## 2. Por qué es un eje NUEVO (no reusar lo existente)

El schema ya tiene dos formas de relacionar lugares, y **ninguna sirve** para esto:

| Campo | Qué agrupa | Por qué NO sirve para marca |
|---|---|---|
| `Place.parentId` (self-relation) | **contención física** (Parquemet → Cerro) | Las sucursales no están "adentro" una de otra |
| `Place.ownerId` (→ User) | **quién administra/reclama** (post-MVP) | Es identidad de gestión, no comercial; y está parqueado |

`brandId` es un **tercer eje ortogonal**: identidad comercial. Un Place podría tener los tres a la vez
(raro), pero lo normal es solo `brandId`.

> Nota: NO mostrar "creador" en la ficha. En el MVP todo lo carga el admin, así que el "creador" sería
> siempre "Portal Panorama" — no aporta. La marca/negocio **sí** aporta desde el día 1.

---

## 3. Modelo de datos

```prisma
model Brand {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  logoUrl     String?  // rehospedado con el pipeline de imágenes existente
  description String?  @db.Text
  website     String?
  instagram   String?
  socialLinks Json?    // mismo shape que Place: [{ network, url }]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  places Place[]

  @@index([slug])
}

// en model Place:
brandId String?
brand   Brand?  @relation(fields: [brandId], references: [id], onDelete: SetNull)
@@index([brandId])
```

- **`onDelete: SetNull`**: borrar una marca **no** borra sus locales (quedan independientes).
- La marca **no tiene ubicación propia** — la ubicación vive en cada `Place`.
- `brandId` es **nullable** → se puede agregar sin migración dolorosa y la mayoría de las fichas no lo usan.

---

## 4. Capas (respetando la arquitectura hexagonal)

- **domain/** `brand/Brand.ts`: aggregate liviano. Invariantes: `name` no vacío, `slug` válido (reusa el VO
  `Slug`). Sin lógica pesada.
- **application/**
  - Port `BrandRepository`: `findBySlugWithPlaces(slug)`, `listForAdmin()`, `save(brand)`, `findById(id)`,
    `listForOptions()` (para el selector del form de Place).
  - Read-model `BrandPageView`: marca + `PlaceCardView[]` de sucursales **publicadas**.
  - Use cases: `GetBrandPageUseCase`, `CreateBrandUseCase`, `UpdateBrandUseCase`, `ListBrandsForAdminUseCase`.
- **infrastructure/** `PrismaBrandRepository`.
- **presentation/**
  - `PlaceDetailView` suma `brand?: { slug, name, logoUrl? }`.
  - Página `app/marca/[slug]/page.tsx` (transporte puro → use case → vista).
  - Admin: `app/admin/marcas/` (lista + form) y selector "Marca" en el form de Place.

---

## 5. UI

1. **Ficha (PlaceView):** bloque **"Por [logo] [Marca] ↗"** linkeable a `/marca/[slug]`. Solo si el Place
   tiene marca. Ubicación sugerida: cerca del header/título o dentro de "Datos prácticos".
2. **Página `/marca/[slug]`:** header (logo + nombre + descripción + redes) + **grilla de `PlaceCard`** de
   todas las sucursales publicadas (reusa `PlaceRail`/`PlaceCard`). A futuro: tab de publicaciones/eventos.
3. **Admin:**
   - CRUD en `/admin/marcas` (lista + form: nombre, slug auto, logo, descripción, redes).
   - En el form de Place: selector **"Marca (opcional)"** con las marcas existentes + opción "crear nueva".

---

## 6. Carga / ingesta (fase 2 del feature, opcional)

- La skill `ficha-lugar` y el JSON de ingesta podrían traer `marca` (nombre).
- `ingest-fichas.ts` resolvería **nombre → brandId** (crea la marca si no existe, igual que ya hace con los
  padres contenedores).

---

## 7. SEO

`/marca/[slug]` es una **landing por marca** → buen SEO (como las listas curadas). JSON-LD `Organization` con
sus `location`s.

---

## 8. Scope: ¿MVP o post-launch?

- **Mínimo si entra a MVP:** entidad + `brandId` + selector en admin + bloque en ficha + página `/marca`
  básica. Esfuerzo **~M** (varios días), aislado, sin tocar lo existente salvo agregar `brandId`.
- **Post-launch / fase 2:** publicaciones/eventos de la marca, carga por agente, claim por el dueño (se cruza
  con `ownerId` / self-service).
- **Recomendación:** **post-launch**, salvo que el catálogo inicial ya tenga varias cadenas que lo
  justifiquen. Para 100-150 fichas con pocas cadenas, **no bloquea lanzar** y se agrega después sin dolor
  (`brandId` nullable).

---

## 9. Decisiones abiertas (para definir antes de construir)

1. ¿La marca se muestra **siempre que exista**, o solo si tiene **2+ sucursales**? (una marca de 1 local
   quizá no amerita el bloque).
2. ¿La página `/marca` muestra además un **mapa** con todas las sucursales?
3. ¿**Logo** obligatorio u opcional?
4. Ruta: **`/marca/[slug]`** (preciso para cadenas) vs **`/negocio/[slug]`** (más amplio).
5. ¿Una sucursal puede pertenecer a **más de una** marca? (Default: no — `brandId` es uno solo).

---

## 10. 🔜 PRÓXIMA SESIÓN — Brand × Eventos (a definir bien)

**Pedido del usuario (2026-06-17), para arrancar la próxima sesión.** Cuando se enciendan Eventos
(hoy apagados en el MVP), la marca y los eventos se cruzan y hay que modelarlo con cuidado.

**Escenario real a resolver:** una marca **X** tiene 3 locales por Santiago. X además **hace eventos**:
- a veces el evento es en **un solo local** (ej. cata en la sucursal de Providencia);
- a veces hay **eventos distintos en cada local** (cada sucursal su propia cartelera);
- (y el caso implícito) a veces es un **evento de marca** que aplica a varias/todas las sucursales.

**Cómo se conecta con lo ya modelado:**
- El `Event` actual ya tiene **`placeId String?`** (nullable: evento sin local fijo). Ver SCHEMA.
- Ya está decidido que, al encender Eventos, **un Place puede tener su cartelera en su propia ficha**
  (ver PLAN_FASE9, decisión de la sesión de taxonomía).

**Opción de modelado a evaluar (no decidida):** sumar **`Event.brandId String?`** junto al `placeId`, y
que la combinación exprese los tres casos:

| `brandId` | `placeId` | Significado |
|---|---|---|
| — | sí | Evento en un local puntual (sin marca, o marca implícita por el Place) |
| sí | sí | Evento **de la marca X en su sucursal Y** (eventos distintos por local) |
| sí | — | Evento **de marca** (varias/todas las sucursales, o sin local fijo) |
| — | — | Evento suelto sin local ni marca (feria, concierto en parque) |

Con eso: la **página `/marca`** muestra la cartelera de toda la marca; la **ficha del Place** muestra
los eventos de ese local (su `placeId`), y un evento brand-wide podría listarse en todas sus fichas.

**Preguntas a cerrar la próxima:**
1. ¿`Event` lleva `brandId` además de `placeId`, o el vínculo a marca se deriva del `Place`?
2. Un evento brand-wide "en varias sucursales", ¿es **un** Event con `brandId` (sin place), o **N** Events
   (uno por sucursal)? Trade-off: cartelera simple vs. detalle por local (cupos/horario distintos).
3. ¿La ficha del Place muestra también los eventos **brand-wide** de su marca, o solo los suyos propios?
4. ¿Esto entra cuando se enciendan Eventos (post-MVP), o se diseña el schema antes para no migrar después?
