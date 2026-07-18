# Brief de diseño — Ficha de lugar (`/lugar/[slug]`)

> Paquete para generar la referencia visual con Claude design. Es la pantalla #1 de la
> reescritura 4E. Pégale este brief a Claude design; con la ref de vuelta, yo la implemento
> en React + Tailwind respetando los tokens (no se copia HTML del handoff).

---

## 1. Contexto del producto

**Portal Panorama** — plataforma para descubrir, decidir y guardar qué hacer en tu ciudad.
Usuario primario: **"el organizador"** (mediados de 20, arma los panoramas del grupo, plata
justa, quiere acertar sin investigar saltando entre apps). La **ficha es el producto**: a la
vez la respuesta que se lee para decidir y la materia prima del filtro.

**Mobile-first** (en Chile ~70-75% del tráfico es celular; el organizador busca con el teléfono
en la calle). Desktop importa para que la ficha SEO se vea bien.

Esta pantalla es la página de detalle de un **lugar permanente** (no evento; los eventos están
apagados en el MVP). Es pública (la ve cualquiera); algunas acciones piden login.

---

## 2. Sistema de diseño (obligatorio, ya existe en `globals.css`)

- **Tipografía:** Fraunces (display/títulos) · Inter Tight (UI/cuerpo) · Geist Mono (datos/mono).
- **Color:** papel crema cálido (warm cream) + acento sunset (oklch). Nada de blanco puro frío.
- **Espaciado:** escala de 4px (`--s-1` … `--s-32`). Radios `--r-sm/md/lg`.
- **Tono:** editorial, cálido, con aire. No corporativo, no app genérica de delivery.

---

## 3. Datos reales disponibles (NO inventar campos)

La ficha recibe exactamente esto (`PlaceDetailView`). Diseña solo con estos campos; los
opcionales pueden venir vacíos y deben **ocultarse con gracia** cuando faltan:

**Identidad y contenido**
- `name` (título) · `description` (párrafo libre, opcional) · `menuUrl` (link al menú, opcional)

**Categorización** (chips/breadcrumb)
- `category` {name} + `subcategory` {name} — siempre presentes
- `secondaryCategory` {name} — opcional (una sola)

**Ubicación**
- `address` (texto: calle+número+comuna, opcional)
- `commune` {name} (siempre) · `neighborhood` {name} (opcional)
- `metroStation` {name, lines:[{code, color}]} — opcional; cada línea trae su **color oficial**
  para pintar el badge (ej. L1 roja, L5 verde)
- `lat`/`lng` existen pero **no hay mapa en MVP** (se captura el dato; el mapa es v2).
  El botón "Cómo llegar" funciona solo con `address`.

**Práctico / operacional**
- `priceRange` (bucket: Gratis · <$5.000 · $5.000–15.000 · $15.000–30.000 · >$30.000)
- `reservation` (texto: ¿reserva o solo llegar?, opcional)
- `paymentMethods` (lista de strings: efectivo, débito, crédito…)
- `schedule` (horario en **texto libre**, opcional — NO viene estructurado por día en MVP)
- `accessDetail` · `reference` · `rainPolicy` (textos opcionales: accesibilidad, cómo ubicarlo,
  qué pasa si llueve)

**Contacto** (todos opcionales)
- `phone` · `website` · `instagram`

**Reputación**
- `googleRating` (ej. 4.6) · `googleReviewCount` (ej. 1.240) — mostrar como "estrellas de Google"
- `score` (reputación calculada interna; **NO se muestra**, solo ordena)

**Galería**
- `images`: lista de {url, alt, credit, isPrimary}. Hay una principal (`isPrimary`) + resto.
  Cada imagen puede traer **crédito/origen** que hay que mostrar (legal).

**Tags — 4 capas** (`tags`: [{name, layer}]). El `layer` agrupa los chips:
- `SOCIAL` (¿con quién voy?: en pareja, con niños, pet friendly… máx 4)
- `ACCESS` (accesibilidad: silla de ruedas, baño, cambiador…)
- `VIBE` (ambiente: tranquilo, animado, fotogénico… máx 3)
- `ATTRIBUTE` (atributos específicos, ej. tipo de cocina en Gastronomía)

**Relacionados** (`related`: hasta 6 `PlaceCardView`)
- Bloque "También te puede gustar" al final. Cada card: `coverUrl`, `name`, `categoryName`,
  `communeName`, `priceRange`, `googleRating`, `googleReviewCount`.

---

## 4. Acciones (CTAs)

- **Guardar** → agrega el lugar a una **colección/lista del usuario** (ej. "Citas", "Con los
  cabros"). Si no hay sesión → invita a registrarse. (No es un corazón de favorito único: es
  "guardar en lista".)
- **Cómo llegar** → abre Google/Apple Maps navegando a `address`.
- **Compartir** → link a la ficha (botón nativo de compartir en móvil).
- **Reportar dato incorrecto / lugar cerrado** → discreto, al pie. Señal de frescura.

**NO incluir** (podado del MVP): reseñas escritas en la plataforma, formulario de reseña,
dueño/negocio, estadísticas, eventos del lugar, mapa embebido.

---

## 5. Secciones a diseñar (propuesta de orden, mobile-first)

1. **Hero**: galería (principal grande + miniaturas/scroll), nombre, chips de categoría,
   rating de Google, comuna/barrio. CTAs primarios (Guardar · Cómo llegar · Compartir) visibles.
2. **Descripción** + chips de tags por capa (social / vibe / atributos).
3. **Datos prácticos** (tarjeta escaneable): priceRange, horario, reserva, métodos de pago,
   metro (con badges de línea de color), accesibilidad.
4. **Contacto**: teléfono / web / Instagram / menú.
5. **Relacionados**: grilla/carrusel de hasta 6 cards.
6. **Reportar** (discreto, al pie).

---

## 6. Qué entregar de vuelta

Una **referencia visual** (mobile + un vistazo desktop) de esta pantalla con los campos de
arriba, en el sistema de diseño descrito. Con esa ref yo reconstruyo el componente en
React + Tailwind y lo cableo a `getGetPlaceBySlugUseCase()`.
