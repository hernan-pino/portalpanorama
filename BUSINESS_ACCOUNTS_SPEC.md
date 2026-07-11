# Spec — Cuenta de negocio + Reclamo de ficha (self-service)

**Estado:** ✅ **SCOPE MVP DECIDIDO (sesión 28, 2026-07-10) — por construir en etapas, todo gratis (§6).**
Se adelanta el lado **gratis** del self-service (reclamo + registro + dashboard de negocio); los
**cobros** siguen esperando a la Fase C (audiencia). El diseño original está en §1–5; las decisiones
de scope del MVP en §6.
**Fecha de la nota:** 2026-06-26 · **Scope MVP decidido:** 2026-07-10 · **Relacionado:** [BRAND_SPEC.md](BRAND_SPEC.md) §11 · [STRATEGY.md](STRATEGY.md) · [PRD.md](PRD.md) · [SCHEMA.md](SCHEMA.md)

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
  - **Método de verificación decidido (s28-cont, 2026-07-10):** el reclamante debe **escribir desde el
    canal oficial del local** — DM desde el **Instagram oficial** a `@portalpanorama.cl`, o correo desde
    el **correo oficial** del negocio a `hola@portalpanorama.cl` — mencionando su nombre. Prueba control
    del canal oficial, con cero fricción de documentos. Por eso el formulario **NO pide "enlace de
    evidencia"** (era débil: cualquiera pega un IG público) → el form quedó en **rol + contacto**. La
    columna `evidenceUrl` queda **dormida** en la BD (puerta barata) por si vuelve la evidencia documental.
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

~~No construir hasta tener audiencia (Fase C).~~ **Actualización 2026-07-10 (s28):** el usuario
decidió adelantar el lado **gratis** (scope en §6); los **cobros** sí siguen esperando a la Fase C.

## 6. Scope MVP decidido (sesión 28, 2026-07-10) — gratis, por etapas, meta pre-agosto

**Dos puertas de entrada:**
- **Reclamar ficha existente:** CTA **destacado** en cada ficha (banner/botón "¿Este negocio es
  tuyo? Reclama tu ficha") → formulario de reclamo (rol, contacto, evidencia opcional) → el admin
  revisa y aprueba a mano (§3). Al aprobar: setea `ownerId` + crea el `BusinessProfile`.
- **Registro de negocio + crear ficha nueva:** para negocios que no están en el catálogo. La ficha
  creada por el negocio nace **PENDING_REVIEW siempre**.

**Landing pública "para negocios"** (ruta tipo `/para-negocios`): explica qué es la cuenta de
negocio, qué incluye, el precio (**hoy: gratis**) y —con transparencia— lo que viene a futuro
(publicidad interna declarada, plan premium). Linkeada desde el footer y desde los CTA de
reclamo/registro.

**Moderación: todo pasa por el admin.** Ficha nueva y ediciones del dueño quedan pendientes hasta
aprobación. Acompañada de dos piezas (pedidas por el usuario en la s28):
- **Comunicación por correo** (Resend ya cableado): reclamo recibido / aprobado / rechazado con
  motivo · ficha aprobada · "necesitamos que corrijas X" — la revisión nunca es un hoyo negro.
- **Guía en el formulario:** sección de recomendaciones + preguntas frecuentes al crear la ficha,
  y ayudas por campo con mejores prácticas (qué hace buena una descripción, fotos, horario).

**Dashboard de negocio** — pestaña **separada** del dashboard consumidor (mismo `User`; la pestaña
aparece si tiene `BusinessProfile`). Adentro: editar su ficha (moderado) · gestionar fotos ·
**estadísticas básicas** (visitas, guardados, clics en "cómo llegar" — los datos ya existen) ·
ver/responder los reportes y sugerencias sobre su lugar. Futuro (no ahora): responder comentarios.

**Cobros: cero.** Todo esto es el plan **Free**; la monetización se enciende en Fase C con tráfico.
Lo único nuevo: **opt-in de correos al registrarse/reclamar** (checkbox de novedades) para poder
anunciar funcionalidades nuevas. Pop-ups de novedades: idea anotada, fuera de scope.

**Eventos: NO entra.** Definición liviana cerrada en la s28 (bitácora PLAN_FASE9.md): un evento es
un **panorama con fecha** (el schema `Event` ya existe dormido); no es ticketing (solo link externo),
no hay pagos, no es agregador scrapeado, no reemplaza la ficha. El `BusinessProfile` queda como el
ancla donde eventos colgará *gated*, pero su build va **separado y después, con audiencia**.

**Etapas de implementación (las próximas sesiones de código):**
1. **Schema:** `BusinessProfile` + `BusinessClaim` + enum + migración aditiva (§4). ✅ HECHO (s28).
2. **Reclamo end-to-end:** CTA en ficha → form → bandeja en el admin → aprobar setea `ownerId` y
   crea el `BusinessProfile` → correos. Incluye la **landing "para negocios"**. ✅ HECHO (s28).
3. **Registro de negocio + crear ficha** (con la guía de mejores prácticas) → PENDING_REVIEW.
4. **Dashboard de negocio:** editar ficha + fotos + estadísticas + reportes. 🔄 Parcial (s28): dashboard
   básico + edición directa + guard IDOR + ayuda por campo hechos; falta rediseño, fotos, propuestas.

## 7. Decisiones de la s28-cont (2026-07-10) — edición, ficha nueva y fotos

**Reparto de campos de una ficha (quién edita qué):**
- 🟢 **Editar directo (dueño verificado, se publica al tiro):** descripción, horario, teléfono,
  sitio web, Instagram + redes extra, carta/menú, rango de precio, política de reserva, métodos de
  pago, cómo llegar/acceso, referencia, **y fotos**. Son datos operacionales que el dueño conoce mejor.
- 🟡 **Proponer → el admin aprueba (afecta curatoría/filtros):** categoría y subcategoría (principal
  y secundaria), tags. El dueño propone el cambio y queda en una **cola de moderación** hasta el OK.
- 🔒 **Solo admin (identidad/ubicación/datos automáticos):** nombre (cambio de nombre = por correo,
  afecta URL/SEO), dirección/comuna/barrio/mapa/metro, place_id/rating/reseñas/score, estado/marca/
  contenedor/destacado.
- **Encuadre "ficha optimizada":** el editor y el reclamo avisan que la ficha ya está optimizada por
  el equipo y se recomienda **solo corregir info errónea/desactualizada y sumar fotos** (no reescribir).
- **Ayuda por campo:** componente `FieldHelp` (un "?" clickeable con recomendaciones) en cada campo.

**Modelo mental (resuelve la confusión "¿son cosas separadas?"): NO — hay UNA sola ficha (`Place`).**
Lo que cambia es su **origen** y su **estado**. Tres orígenes, un mismo destino (ficha publicada y
**optimizada**):
1. **Admin la carga** con la skill `ficha-lugar` (carga del catálogo hoy).
2. **Dueño reclama** una que ya existe (ya optimizada → solo corrige + fotos).
3. **Dueño crea una nueva** (su local no está en el catálogo).

**Flujo de ficha nueva (origen 3), decidido:** el dueño llena un **formulario-semilla CORTO** (lo que
él sabe) → la ficha entra en **PENDING_REVIEW (borrador, no visible)** → **el admin corre la skill**
sobre la semilla para investigar/optimizar (fotos, rating, tags, descripción) → revisa y **publica** →
ya publicada, el dueño la gestiona (editar directo + proponer). La semilla es un *lead*, no la ficha
final: el dueño aporta poco, la skill + el admin hacen el trabajo pesado → se mantiene la calidad sin
cargarle la mano al dueño. **Casi no hay maquinaria nueva:** `PENDING_REVIEW` + admin + skill ya existen;
"crear ficha" = un form corto que crea un `Place` en PENDING_REVIEW con `ownerId`.
- **Campos mínimos de la semilla (propuesta):** nombre · dirección · comuna · categoría tentativa ·
  un teléfono o Instagram para verificar. Nada más.

**Fotos — recomendaciones al dueño (pedido del usuario):** Google Maps a veces trae fotos genéricas o
malas, y la foto es lo primero que mira la gente. Al subir, guiar con **qué fotos convierten**:
fachada/entrada (para reconocer el lugar al llegar), interior/ambiente, producto/comida o lo que se
ofrece. Objetivo: que el usuario se haga una idea real de cómo es el lugar. (Va en la etapa de fotos.)
