# Spec — Cuenta de negocio + Reclamo de ficha (self-service)

**Estado:** 🅿️ **PARQUEADO — solo anotado, NADA construido.** Es la base del **self-service** del lado
oferta, que la estrategia ubica en **Fase C** (después de tener audiencia). Se documenta acá para no
perder el diseño ni obligarse a construirlo antes de tiempo.
**Fecha de la nota:** 2026-06-26 · **Relacionado:** [BRAND_SPEC.md](BRAND_SPEC.md) §11 · [STRATEGY.md](STRATEGY.md) · [PRD.md](PRD.md) · [SCHEMA.md](SCHEMA.md)

---

## 1. Qué es / motivación

Hoy las fichas y marcas las carga **el admin**. El paso siguiente (post-audiencia) es que **el dueño de
un negocio reclame su ficha**, tenga una **cuenta de negocio** (distinta de la cuenta consumidor que solo
guarda lugares) y desde ahí gestione su presencia. Es el cimiento de la monetización de oferta, pero el
**schema** se puede dejar listo como puerta barata sin encender ningún flujo ni cobro.

## 2. El modelo ya existe a medias (BRAND_SPEC §11)

El proyecto ya separó los tres conceptos que suelen colapsar en uno:

| Concepto | Qué es | Eje en schema | Estado |
|---|---|---|---|
| **Cuenta (User)** | quién se loguea y administra | `ownerId` | existe (rol USER/ADMIN) |
| **Marca (Brand)** | identidad pública que agrupa locales | `brandId` | construida ✅ |
| **Lugar (Place)** | el local físico | la ficha | construido ✅ |

Cadena: *una cuenta gestiona 1+ marcas → una marca agrupa 1+ lugares*. **Puertas baratas ya reservadas:**
`Brand.ownerId` y `Place.ownerId` (nullable, hoy en null, sin uso) — se dejaron justo para esto. La
propiedad de los lugares se queda en `ownerId → User`; el BusinessProfile es "el sombrero de negocio" de
ese User (no posee lugares directamente).

## 3. Decisiones tomadas (2026-06-26)

- **Qué se reclama: Place o Brand (ambos).** Un dueño de una sola sucursal reclama el **Place**; una
  cadena reclama la **Brand**. El reclamo apunta a uno u otro (exactamente uno). Al aprobarse, setea el
  `ownerId` correspondiente (puertas ya reservadas).
- **Cuenta de negocio = `User` + `BusinessProfile` (1:1 opcional).** La cuenta sigue siendo un User (mismo
  login); el BusinessProfile es un perfil opcional que la convierte en "cuenta de negocio". **User primero,
  BusinessProfile después**: un User normal no lo tiene; lo obtiene cuando se vuelve negocio (reclamo
  aprobado, o registro como negocio). Así un mismo User puede ser consumidor *y* negocio sin duplicar cuenta.
- **Datos mínimos, todos opcionales.** RUT y razón social como **campos opcionales** (sin fricción al
  registrarse). El **RUT no es documento tributario**: el SII recién entra cuando se emitan boletas/facturas
  (pagos = Fase C). Hoy el RUT sirve como identificador + señal de verificación. Los campos de facturación
  reales se agregan cuando se encienda el cobro. RUT se valida con el **Value Object de dígito verificador**
  (módulo 11) cuando se setee — ver CLAUDE.md "RUT como Value Object".
- **Verificación de propiedad: admin a mano (MVP).** El reclamo lleva evidencia (rol que dice tener,
  teléfono/email de contacto, documento opcional) y el **admin revisa y aprueba**. Métodos automáticos
  (SMS al fono de la ficha, email al dominio del negocio) son más caros → el schema deja lugar para
  guardarlos, pero **no se construyen ahora**.
- **El BusinessProfile es el hub del lado negocio.** Nace casi vacío, pero es el ancla donde colgarán
  —cuando se enciendan, todo *gated*— **crear eventos, analíticas, gestión/respuesta de comentarios,
  pagos y promociones**. El schema de hoy solo crearía el ancla + reservaría las puertas.

## 4. Schema propuesto (cuando se decida construirlo)

```
enum ClaimStatus { PENDING · APPROVED · REJECTED }

BusinessProfile            (1:1 con User — "el sombrero de negocio")
  userId        → User (unique)
  legalName?    (razón social, opcional)
  rut?          (opcional; VO con dígito verificador cuando se use)
  contactEmail? / contactPhone?
  verifiedAt?   (null = no verificado aún)
  createdAt / updatedAt
  · futuro (NO en esta tabla todavía): analíticas, comentarios, pagos, promociones, eventos

BusinessClaim              (un reclamo a revisar)
  claimantId    → User (quien reclama)
  placeId?  → Place   |   brandId? → Brand     (exactamente uno; lo cuida el dominio)
  claimantRole? (dueño / representante / encargado)
  message?      (evidencia en texto)  ·  evidenceUrl?  (documento opcional)
  contactPhone? / contactEmail?       (para que el admin verifique)
  status        ClaimStatus (default PENDING)
  reviewedById? → User (admin)  ·  reviewNotes?  ·  createdAt / reviewedAt?
```

Relaciones: `User.businessProfile` (1:1), `User.claims` (como claimant) + `User.reviewedClaims` (como
admin); `Place.claims` / `Brand.claims`.

## 5. Alcance cuando se retome

- **Schema-only (puerta barata):** crear los modelos + enum + relaciones + migración. Activo: crear un
  reclamo y que el admin lo revise. Reservado: nada más.
- **Flujo completo (Fase C):** lógica de aprobar el reclamo (setear `ownerId` + crear el BusinessProfile),
  verificación, panel de negocio, y recién después analíticas/comentarios/pagos/promociones/eventos.

**No construir hasta tener audiencia (Fase C).** Prioridad actual: go-to-market (STRATEGY §5).
