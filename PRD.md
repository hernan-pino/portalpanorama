# PRD — Portal Panorama

**El norte permanente del producto.** Qué es, para quién, qué entidades tiene y qué entra al MVP.
Esto NO cambia sesión a sesión; se actualiza solo cuando cambia una decisión de producto.

- **Plan vivo (estado + backlog + próximos pasos):** [PLAN.md](PLAN.md)
- **Seguimiento de pasos:** [ROADMAP.md](ROADMAP.md)
- **Modelo de datos:** [SCHEMA.md](SCHEMA.md) · **Capas/contextos:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Bitácora del rediseño (razonamiento, sub-sesiones A-D, decisiones de schema):** [PLAN_FASE9.md](PLAN_FASE9.md)
- **Cuestionario original de definición:** [PRODUCTO.md](PRODUCTO.md)

> Síntesis de los 4 entregables aprobados en la Fase 9 (Etapa 1). El detalle del razonamiento que
> llevó a cada decisión vive en `PLAN_FASE9.md` (sub-sesiones A-D y bitácora).

---

## 1. Visión (aprobada 2026-06-05)

> **Portal Panorama es una plataforma para descubrir, decidir y guardar qué hacer en tu ciudad**
> —lugares, panoramas y experiencias, todo centralizado en un solo lugar. Está pensada para **"el
> organizador"**: el que arma los planes del grupo y quiere acertar sin tener que investigar saltando
> entre Google, Instagram y mil pestañas. Su diferenciador es la **filtrabilidad por contexto social**
> (con quién voy, presupuesto, comuna, al aire libre, apto niños/mascotas) construida sobre **fichas
> completas y estructuradas** —porque la ficha bien hecha es a la vez la respuesta que se lee para
> decidir y la materia prima del filtro. El MVP arranca con **~100 lugares permanentes** de las zonas
> más conectadas de Santiago, con registro para **guardar en listas**, y está diseñado desde el día 1
> para crecer hacia **eventos, recomendaciones por IA y posicionamiento de negocios**, sin amarrarse a
> ninguno de ellos todavía.

**Usuario primario — "el organizador":** joven (mediados de los 20), vive solo pero tiene pareja y
grupo de amigos, el iniciador de las juntas, con plata justa para salir un par de veces al mes,
aburrido de lo viral, que quiere acertar y quedar bien sin investigar él mismo. Dolor central:
**buscar cansa**. Motivación: mejor precio/calidad + quedar bien socialmente.

**Diferenciador (pilar):** **filtrabilidad por contexto social**, que nadie tiene bien. Apoyada en
la **centralización** (todo en un directorio) y en la **ficha estructurada** (la ficha ES lo que
habilita el filtro: no se filtra por "apto niños" si ese dato no vive estructurado en la ficha).

---

## 2. Modelo de entidades (aprobado 2026-06-05)

Modelo conceptual. Los tipos exactos viven en [SCHEMA.md](SCHEMA.md). Decisiones de modelado clave:
tags como **tabla relacional** (no JSON); `Review`/`Report` se crean ahora aunque apagados; `Dish`
queda como puerta abierta sin tabla.

- **🏠 `Place` (Lugar)** — entidad central, **siempre permanente, sin campo "tipo"**. Identidad
  (slug/name/description) · categoría principal + subcat **obligatorias** + cat/subcat secundaria
  **opcional** · ubicación (dirección, comuna FK, barrio FK opcional, lat/lng, estación de metro FK
  opcional, accessDetail, reference) · `priceRange` (enum 5 buckets, incl. Gratis) · contacto
  (phone/website/instagram) · horario (texto libre en MVP) · métodos de pago · reserva (enum) ·
  reputación Google (googleRating/googleReviewCount) · `score` (bayesiano calculado) · galería con
  crédito · tags (4 capas) · puertas baratas (`isPremium`, `ownerId?`, `status`).
- **🎫 `Event`** — en el schema desde ya, **apagado en MVP**. Tabla separada, FK `placeId` nullable
  (eventos sin local fijo), categoría propia, dimensión temporal, `isRecurring`. Se enciende post-MVP.
  **Decisión (2026-06-14):** al encenderse, un Place podrá tener eventos asociados que aparecen **en su
  propia ficha** (su cartelera) — mismo patrón de presentación que los lugares hijo. Resuelve los venues
  cuyo valor son los shows (sala de conciertos, club de jazz): la ficha hoy queda fina y se llena con su
  agenda al activar Eventos.
- **🗂️ `Category` + `Subcategory`** — 9 categorías (6 activas + 3 event-only apagadas). **Regla de
  clasificación (2026-06-14):** la categoría principal = **por qué vas (la experiencia), no lo que el
  lugar incidentalmente tiene** — un club de jazz sirve comida pero vas por la música → es **Vida
  nocturna**, no Gastronomía; un bar/pub se queda en Gastronomía + tag `vida nocturna`. La frontera la
  resuelven la categoría secundaria y los tags, no la duplicación. **Reorganización (2026-06-20):** el
  antiguo *Entretenimiento* se partió en **Vida nocturna** (discoteca, club de jazz, sala de conciertos)
  y **Juegos y diversión** (karaoke, escape room, bowling, arcade, paintball, karting, minigolf,
  trampolines, VR, billar); +sub *Atracción* en Locales (decks/hitos urbanos tipo Sky Costanera). Al
  lanzar se muestran las **6 con lugares** (**Gastronomía, Naturaleza y aire libre, Arte y cultura,
  Locales y tiendas, Vida nocturna, Juegos y diversión**); las event-only (Shows y espectáculos, Ferias,
  Talleres) quedan registradas pero apagadas.
- **🏷️ `Tag`** — tabla relacional, **6 capas** (`TagLayer`): **AUDIENCE** (¿con quién?, máx 4) ·
  **OCCASION** (ideal para / ocasión, máx 3) · **VIBE** (ambiente, máx 3) · **EXPERIENCE** (qué ofrece
  de destacable: rooftop, vista, vida nocturna…, sin tope) · **SERVICE** (servicios y acceso:
  estacionamiento, wifi, accesible, pet friendly…, sin tope) · **SPECIFIC** (atributos condicionales por
  categoría, ej. tipo de cocina, sin tope). Topes y exclusiones mutuas = en dominio. Reserva NO es tag
  (campo `reservation`).
- **🚇 `MetroStation` + `MetroLine`** — catálogo. Estación ↔ líneas (many-to-many: Baquedano = L1+L5).
  La línea lleva su color. Place con FK opcional a estación. Filtrable por estación y por línea.
- **📍 `Commune` + `Neighborhood`** — barrio vinculado a comuna(s) (M2M), pero Place filtrable
  independiente por barrio o por comuna.
- **👤 `User`** — cuenta básica: nombre, email, password (**sin avatar**) · `homeCommune` opcional ·
  `role` (USER/ADMIN). **Sin RUT** (el RUT es del lado negocio, post-MVP).
- **📚 `Collection`** — **una sola entidad** para listas de usuario Y listas curadas públicas:
  `ownerId?` (null = curada) · `isCurated` · `slug?` (SEO) · descripción. `CollectionItem` = Collection ↔ Place.
- **🕓 `VisitHistory`** — lugares visitados (combustible IA): userId · placeId · timestamp.
- **Puertas abiertas (creadas/registradas, apagadas):** `Review` (polimórfico 1–5, sección "Mis
  reseñas" vacía) · `Report` (reportar dato incorrecto/cerrado, **sí activo en MVP**) ·
  `TopicSubscription` (suscripción por keyword, newsletter futuro) · `Dish` (sin tabla; vía `Review`
  extensible) · saved events · horario estructurado por día.

---

## 3. Matriz de permisos (aprobada 2026-06-06)

**Regla de oro:** el **usuario siempre ve toda la info** de la ficha. El plan del negocio solo cambia
qué **autogestiona** y sus herramientas de visibilidad — nunca qué ve el usuario.

### A) Lado consumidor (vive en el MVP)

| Acción | Visitante | Usuario | Admin |
|---|:---:|:---:|:---:|
| Explorar / filtrar / buscar | ✅ | ✅ | ✅ |
| Ver ficha completa + toda su info | ✅ | ✅ | ✅ |
| Ver listas curadas (landing SEO) | ✅ | ✅ | ✅ |
| Compartir ficha / "Cómo llegar" | ✅ | ✅ | ✅ |
| Reportar dato incorrecto / cerrado | ✅ | ✅ | ✅ |
| Guardar en lista | ❌ → invita a registro | ✅ | ✅ |
| Crear/renombrar/borrar listas propias | ❌ | ✅ | ✅ |
| Comuna home · "Mi historial" | ❌ | ✅ | ✅ |
| Escribir reseña propia *(v2)* | ❌ | 🔒 v2 | 🔒 v2 |
| Gestión total de contenido (CRUD lugares, categorías, tags, listas curadas, fotos, reportes) | ❌ | ❌ | ✅ |

### B) Lado negocio (post-MVP — el admin hace todo en el MVP)

Free reclama ficha + edita info + sube fotos + responde reseñas/reportes + 1 evento gratis. Premium
**agrega visibilidad/herramientas, NO info**: estadísticas, card destacada, banner de ofertas, botón
reserva, más eventos, posicionamiento pagado. Detalle en `PLAN_FASE9.md` (entregable 3 + monetización).

---

## 4. Scope del MVP (aprobado 2026-06-07)

Restricción transversal: **lean, barato, por capas, densidad > cantidad.**

**✅ SÍ entra:**
- **Contenido:** ~100 lugares permanentes (techo), carga paulatina (puñado a mano → soft-launch →
  masa mínima densa → ~20/semana). Concentrados en pocas zonas conectadas (Providencia + Ñuñoa
  primero). Solo 6 categorías con lugares (Gastronomía, Naturaleza, Arte y cultura, Locales y tiendas, Vida nocturna, Juegos y diversión).
- **Ficha:** completa y estructurada · estrellas + nº reseñas de Google · tags 6 capas · CTA "Cómo
  llegar" · compartir · "relacionados" (sin IA: tags + categoría + comuna).
- **Búsqueda/filtros (el pilar):** facetas con contadores + ocultar vacíos (estáticos). Filtros
  vivos: ¿Con quién voy? · ¿Cuánto gasto? · ¿Dónde? · Accesibilidad · Ambiente. Orden por defecto =
  reputación (score bayesiano). Home "por acción" (search + chips sociales + chips de categoría).
- **Usuario:** cuenta básica · listas múltiples con nombre · historial · comuna home opcional.
- **Crecimiento/infra:** SEO día 1 (SSR/SSG, slugs, metadata, JSON-LD `LocalBusiness`, sitemap) · 3-5
  listas curadas como landing SEO · instrumentación (GA4 + Meta Pixel + eventos custom) · página de
  privacidad + cookies · botón reportar · web mobile-first.

**🔜 NO ahora, pero pronto (v2 — puertas abiertas en schema):** eventos (+ filtro ¿Cuándo?) · reseñas
propias con peso + niveles · IA (recomendación por gusto/historial, panorama encadenado, lenguaje
natural) · self-service de negocios + posicionamiento pagado + newsletter por IA · mapa + "cerca de
mí" + metro automático · recálculo dinámico de facetas · compartir colección · horario estructurado · PWA.

**❌ Se descarta (por ahora):** niveles/gamificación de usuario · app nativa antes de validar
retención · ticketera propia · import masivo sin curar (el de 1449).

---

## Validación y crecimiento (decisiones D, 2026-06-04)

- **Validación por comportamiento**, no volumen: activación (% que crea cuenta o guarda) · retención ·
  engagement por ficha · save rate. Mínimo ~1 mes corriendo. Piso de tráfico ~1000 visitas / ~10 cuentas.
- **Plataforma:** web **mobile-first** → PWA como puente (con eventos) → app nativa post-validación.
- **Crecimiento:** SEO orgánico (pilar) + Instagram + foros. **GEO/AEO:** optimizar para que los LLMs
  citen la ficha = casi el mismo trabajo que el SEO. La ficha bien hecha paga triple: humano + Google + LLM.
- **IA = norte/visión pero fuera del MVP (Fase 2+).** IA-only real solo en "armar panorama encadenado"
  y "recomendar por gusto/historial"; lenguaje natural ≈ un buen filtro.
- **Monetización:** parqueada por decisión del usuario. El MVP no tiene ruta de ingresos (consciente).
