# Brief de diseño — Home / Portada (`/`)

> Pantalla #3 (y última) de la reescritura 4E. Pégale este brief completo a Claude
> design; con la ref de vuelta, se implementa en React + Tailwind respetando los tokens.
>
> **Es la más corta de las tres**: reusa la **tarjeta de lugar** y los **chips** definidos
> en el brief de explorar ([4E_02_explorar.md](4E_02_explorar.md)). Genera idealmente la ref
> de explorar primero; la home se apoya en esos mismos componentes.

---

## 1. Contexto del producto

**Portal Panorama** — plataforma para descubrir, decidir y guardar qué hacer en tu ciudad.
Usuario primario: **"el organizador"** (mediados de 20, arma los panoramas del grupo, plata
justa). La home es la primera impresión: al llegar tiene que **entenderse al toque qué hay**,
sin leer mucho y **sin encuesta forzada**.

**Principio rector (decisión C.2 — "home por acción"):** nada de páginas que obligan a responder
antes de ver contenido. La home invita a actuar: buscar o tocar un chip que lleva directo a
explorar ya filtrado. La pregunta más poderosa va primero: **"¿A quién llevas hoy?"** (contexto
social), que es el diferenciador del producto.

**Mobile-first.** No hay eventos en el MVP (no incluir nada de "qué pasa hoy / agenda").

---

## 2. Sistema de diseño (obligatorio, ya existe en `globals.css`)

El mismo de la ficha (implementada) y explorar. **Reusar, no reinventar:**
- **Tipografía:** Fraunces (display/títulos, con itálicas de acento) · Inter Tight (UI) · Geist Mono (labels).
- **Color:** papel crema cálido + acento sunset (oklch). Estrellas de rating en oro/ámbar (`--star`).
- **Radios** sobrios (tarjetas 12 / botones-inputs 8 / chips pill), escala de 4px.
- **Tono:** editorial, cálido, con aire, tipografía display grande. No app genérica.

---

## 3. Datos reales disponibles (NO inventar)

- **Tarjeta de lugar** (`PlaceCardView`): la misma del brief de explorar — foto, nombre,
  categoría · comuna, precio compacto, rating de Google, línea de metro. Reúsala tal cual.
- **Categorías activas** (`GetCategories`): solo 4 tienen lugares en el MVP — **Gastronomía ·
  Naturaleza y aire libre · Arte y cultura · Locales y tiendas**. (Las otras 3 son event-only,
  apagadas: NO mostrarlas.)
- **Destacados** (`SearchPlaces`, orden por reputación/score): se puede traer "lo mejor rankeado"
  para una fila de recomendados.
- **Listas curadas** (`GetCuratedCollection`, opcional): 3-5 listas editoriales tipo "Mejores X de
  Y" (landing SEO). Cada una: nombre, descripción, portada. Puerta abierta barata; inclúyela si
  aporta, marca como opcional.
- **Chips sociales** (capa SOCIAL de tags): solo, en pareja, con amigos, en familia, con niños,
  con mascota, grupo grande.

**No hay:** eventos, agenda, "abierto ahora", recomendación por IA (todo post-MVP).

---

## 4. Secciones a diseñar (propuesta, mobile-first)

1. **Hero editorial:** título grande en Fraunces (algo como *"¿Qué hacer hoy en Santiago?"* con
   palabra en itálica de acento) + subtítulo corto. Debajo, la **barra de búsqueda** con
   placeholder *"Qué comer hoy…"* (es placeholder, no botón).
2. **Fila "¿A quién llevas hoy?"** (protagonista): chips sociales (solo · en pareja · con amigos ·
   en familia · con niños · con mascota). Cada chip lleva a explorar ya filtrado por ese contexto.
   Es lo que diferencia al producto — dale peso visual.
3. **Fila "Explorá por categoría":** las 4 categorías activas como chips/tarjetas con su ícono.
   Llevan a explorar filtrado por categoría.
4. **Recomendados / "Lo mejor valorado":** carrusel horizontal de tarjetas de lugar (las mejores
   por reputación). Reusa la tarjeta de explorar.
5. **Listas curadas (opcional):** 2-4 tarjetas editoriales tipo "Mejores cafés de Barrio Italia"
   (más anchas, con foto + título + bajada), como anzuelos de SEO.
6. **Footer** (ya existe, no rediseñar).

> El orden y el peso de cada bloque lo afina la ref; lo no negociable es: **search + social arriba**,
> **acción directa** (todo lleva a explorar filtrado), **sin encuesta**, **sin eventos**.

---

## 5. Qué entregar de vuelta

Una **referencia visual** (móvil + un vistazo desktop) de la home con: hero + búsqueda, fila social
"¿a quién llevas hoy?", fila de categorías, carrusel de recomendados y (opcional) listas curadas.
Con esa ref se reconstruye en React + Tailwind cableado a `getSearchPlacesUseCase()` +
`getGetCategoriesUseCase()` (+ `getGetCuratedCollectionUseCase()` si se incluyen listas curadas).
