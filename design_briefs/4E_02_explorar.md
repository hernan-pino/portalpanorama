# Brief de diseño — Explorar / Búsqueda (`/explorar`) + la Tarjeta de lugar

> Paquete para generar la referencia visual con Claude design. Es la pantalla #2 de la
> reescritura 4E (después de la ficha). Pégale este brief a Claude design; con la ref de
> vuelta, yo la implemento en React + Tailwind respetando los tokens (no se copia HTML).
>
> **Incluye dos artefactos en una sola ref:** (A) la página de explorar/resultados y
> (B) la **tarjeta de lugar** (mini-ficha), que es el componente más repetido del producto
> — aparece en explorar, en home y en "También te puede gustar" de la ficha. Diseñar la
> tarjeta bien acá sirve para todo.

---

## 1. Contexto del producto

**Portal Panorama** — plataforma para descubrir, decidir y guardar qué hacer en tu ciudad.
Usuario primario: **"el organizador"** (mediados de 20, arma los panoramas del grupo, plata
justa, quiere acertar sin investigar saltando entre apps).

**El pilar del producto es la FILTRABILIDAD por contexto social.** Explorar es donde ese pilar
se hace tangible: la primera pregunta real de la gente NO es la categoría ni el precio, es
**"¿con quién voy?"** (solo, en pareja, con amigos, en familia, con niños, con mascota). Ese
filtro es el más poderoso y el que nadie más tiene — debe sentirse protagonista, no escondido
entre 8 filtros iguales.

**Mobile-first** (en Chile ~70-75% del tráfico es celular; el organizador busca con el teléfono
en la calle). Desktop importa para SEO y para comparar.

Esta pantalla es **solo lugares permanentes** (los eventos están apagados en el MVP, y con ellos
el filtro "¿Cuándo?" — no lo incluyas).

---

## 2. Sistema de diseño (obligatorio, ya existe en `globals.css`)

El mismo de la ficha (ya implementada). **Reusar, no reinventar:**

- **Tipografía:** Fraunces (display/títulos) · Inter Tight (UI/cuerpo) · Geist Mono (datos/labels).
- **Color:** papel crema cálido (warm cream) + acento sunset (oklch). Nada de blanco puro frío.
- **Estrellas de rating:** color **oro/ámbar apagado** (token `--star`), NO el sunset (el rating
  no compite con los CTA). Relleno parcial (4.6 → 92% de ancho).
- **Espaciado:** escala de 4px. **Radios sobrios:** tarjetas/foto = 12px, botones/inputs = 8px,
  chips/badges = pill. (Más sobrio que muy redondeado.)
- **Chips:** ya existe el patrón (pill, borde hairline). El chip de categoría activa va en variante
  acento (relleno crema-sunset).
- **Tono:** editorial, cálido, con aire. No corporativo, no app genérica de delivery.

---

## 3. La TARJETA de lugar (mini-ficha) — datos reales (NO inventar)

La tarjeta recibe estos campos. Diseña con estos y nada más; los opcionales pueden faltar y deben
**ocultarse con gracia**:

| Campo | Tipo | Notas |
|---|---|---|
| `coverUrl` | string? | foto de portada (ratio 4:3). Si falta → placeholder rayado. |
| `name` | string | título, en Fraunces. |
| `categoryName` | string | ej. "Café", "Mirador". |
| `communeName` | string | ej. "Providencia". |
| `neighborhoodName` | string? | ej. "Barrio Italia" (opcional). |
| `priceRange` | string? | bucket — **mostrar COMPACTO**: Gratis→"Gratis", <$5.000→`$`, $5.000–15.000→`$$`, $15.000–30.000→`$$$`, >$30.000→`$$$$`. |
| `googleRating` | number? | ej. 4.7 → estrella dorada + número. |
| `googleReviewCount` | number? | ej. 540 → "(540)". |
| `metroLine` | {code, color}? | **línea de metro más cercana** (color oficial). Opcional: muchos lugares (parques, miradores) no tienen → la tarjeta simplemente no la muestra. *(Requiere ampliar el read-model; ya está decidido sumarlo.)* |

**Lo que la tarjeta NO tiene (no lo dibujes):** tags, badge "Premium", descripción, distancia.

**Composición acordada (úsala como base, la ref afina el detalle visual):** la clave es **usar
toda la tarjeta, no amontonar todo bajo la foto.**
- **Foto 4:3** con el **rating de Google superpuesto en una esquina** (chip con scrim/legible):
  ★ 4.7 (540). Solo aparece si hay `googleRating`.
- **Cuerpo:** meta en mono (categoría · comuna) · **nombre** en Fraunces.
- **Fila inferior:** **precio compacto** (`$$$`) + **badge de línea de metro** (`L5`, color oficial)
  cuando exista. Como el rating ya no vive acá, esta fila respira aunque lleve ambos; si falta el
  metro, queda solo el precio (sin huecos raros).

Mantener escaneable: el organizador compara muchas de un vistazo (precio/calidad + reputación).

**Punto abierto (decisión de producto, NO la resuelvas en la ref):** si más adelante queremos
**tags** (ej. "Pet friendly") o un **blurb** en la tarjeta, habría que ampliar más el read-model.
Diseña la tarjeta como está arriba.

---

## 4. Filtros y facetas (el corazón de explorar) — datos reales

**Filtros vivos del MVP** (`SearchParams`). Cada uno mapea a data estructurada que ya existe:

- **¿Con quién voy?** (`socialTagSlugs[]`) — solo, en pareja, con amigos, en familia, con niños,
  con adultos mayores, con mascotas, grupo grande. **← protagonista, arriba de todo.**
- **¿Cuánto gasto?** (`priceRanges[]`) — los 5 buckets de arriba (incluye Gratis).
- **¿Dónde?** — comuna (`communeSlug`) · barrio (`neighborhoodSlug`) · **cerca del metro**
  (`metroLineCode` / `metroStationSlug`). El badge de línea de metro usa su **color oficial** (L1
  roja, L5 verde, etc.).
- **Accesibilidad** (`accessTagSlugs[]`) — silla de ruedas, baño disponible, cambiador, lactancia.
- **Ambiente** (`vibeTagSlugs[]`) — tranquilo, animado, familiar, íntimo, fotogénico.
- **Sin reserva** (`walkInOnly`) — un toggle suelto.
- **Categoría** (`categorySlug` / `subcategorySlug`) y **búsqueda libre** (`query`).

**Facetas con contadores + ocultar vacíos** (`PlaceFacets` — decisión P3, rescata el patrón de la
v1): cada opción de filtro muestra **cuántos lugares tiene al lado** — *Gastronomía (24)* — y las
opciones con **0 se ocultan** (o se ven en gris desactivado). Esto mata el "0 resultados
decepcionante" y **disimula la baja densidad** del arranque. (En el MVP los contadores son
estáticos: no se recombinan al cruzar filtros — eso es refinamiento posterior.)

Dimensiones de faceta disponibles con contador: `categories · communes · neighborhoods ·
metroLines · priceRanges · social · access · vibe`.

---

## 5. Comportamientos clave (que la ref debe comunicar visualmente)

- **Orden por defecto = reputación** (nota Google × cantidad de reseñas). Mostrar discretamente
  "ordenado por relevancia" / un selector de orden simple.
- **Comuna home transparente y desactivable** (C.3-bis): si el usuario fijó su comuna, los
  resultados de esa comuna suben primero, y se muestra algo tipo
  *"Mostrando primero Providencia · cambiar"* — visible y reversible, nunca lo deja atrapado.
- **Contador de resultados** prominente ("**128** lugares").
- **Estado vacío** con gracia (cuando un cruce de filtros sí da 0): mensaje cálido + "ver todos".

---

## 6. Secciones a diseñar (propuesta, mobile-first)

1. **Barra de búsqueda** (input + ¿con quién? / dónde como campos rápidos). Es la entrada.
2. **Filtros:**
   - **Móvil:** chips de "¿con quién voy?" siempre visibles arriba + botón "Filtros" que abre una
     **hoja inferior** (bottom sheet) con el resto (gasto, dónde, accesibilidad, ambiente), cada
     opción con su contador.
   - **Desktop:** **rail lateral** (~280px) con los grupos de filtros y contadores; resultados a la
     derecha.
3. **Barra de resultados:** contador grande + nota de orden/comuna-home + toggle **grilla / lista**.
4. **Grilla de tarjetas** (la del punto 3). En desktop 3 columnas, móvil 1–2.
5. **Vista lista** (opcional, alternativa a la grilla): fila horizontal más compacta (foto chica +
   nombre + meta + rating). Recordar: sin blurb si no ampliamos el read-model.
6. **Paginación** simple (anterior / x de y / siguiente).
7. **Estado vacío.**

---

## 7. Qué entregar de vuelta

Una **referencia visual** (móvil + un vistazo desktop) de:
- la **página de explorar** con filtros + facetas con contadores + resultados, y
- la **tarjeta de lugar** en detalle (su composición, estados con/sin foto, con/sin rating).

Con esa ref reconstruyo todo en React + Tailwind y lo cableo a `getSearchPlacesUseCase()` +
`getGetPlaceFacetsUseCase()`.

> **Nota:** después de explorar viene **home** (pantalla #3), que reusa esta misma tarjeta + los
> chips de "¿con quién voy?" y de categoría. Su brief sale corto apoyándose en esta ref.

---

## 8. Decisiones post-ref (2026-06-10) — cómo se IMPLEMENTA (manda sobre lo de arriba)

> La ref llegó y se revisó con el usuario. La **tarjeta** se aprobó tal cual (foto 4:3 + rating
> superpuesto + corazón + precio compacto + badge de metro, con degradación con gracia). Pero la
> **composición de la página cambió** respecto al brief. Lo de abajo es lo que se construye; donde
> contradiga a las secciones 1–6, **gana esto**.

1. **Categoría = filtro PRINCIPAL (no lo social).** Se invierte la jerarquía del brief. El modelo
   mental del usuario es "primero veo *cafetería*, después si es para *pareja*". Arriba mandan las
   **categorías** (las 4 con lugares en el MVP) y al elegir una aparecen sus **subcategorías**. Lo
   **social** baja a ser un filtro que refina, no la puerta de entrada. (El social sigue siendo el
   diferenciador del producto —1.3— pero deja de ser el héroe visual: ocupaba demasiado espacio.)

2. **Todo en acordeón colapsable.** Para no saturar la vista, cada bloque de filtro tiene cabecera
   con toggle (chevron ▾/▸) + badge con nº de filtros activos, y se abre/cierra. **Categorías** =
   primer bloque, **abierto por defecto** (es el primario). **¿Con quién vas?** = bloque colapsado
   debajo. **Más filtros** (precio · dónde · ambiente · accesibilidad · sin reserva) = grupos
   colapsables (en móvil dentro del bottom-sheet; en desktop en el rail). Mismo patrón en ambas vistas.

3. **Categorías visibles también en desktop.** La ref las dejó solo en móvil; ahora la franja
   superior de categorías va en **ambas** vistas (en la ref desktop directamente faltaban).

4. **Fuera la nota "Mostrando primero Providencia".** Se elimina el orden por comuna-home del MVP
   (anula lo de la sección 5 y ajusta C.3-bis del plan). El orden por defecto es **reputación** a
   secas. Lo geográfico ("a 5 min / a 15 min" en la ficha) entra **después**, cuando se pida
   ubicación actual y se usen las lat/lng. La `ComunaNote` no se construye.

5. **Corazón para guardar desde la tarjeta** (ya viene en la ref). Se cablea al flujo de colecciones
   de la ficha (elegir lista / crear lista). Como las listas son del usuario, si un **visitante
   anónimo** toca el corazón → **pop-up** preguntando si quiere iniciar sesión / registrarse para
   guardar (no redirección seca).

6. **Indicador de "qué se está buscando" = filtros activos** (2026-06-10, idea del usuario). Aunque
   se quitó la nota de comuna-home (punto 4), **se conserva ese tratamiento visual** —el pill cálido
   con texto + acción reversible— pero repurposeado para mostrar los **filtros aplicados** (ej.
   "Café · en pareja · Providencia · limpiar"). Da feedback de qué está acotando los resultados y
   permite quitarlos. **Pendiente, a especificar al implementar** (no estaba en la ref).

**Implicancias técnicas confirmadas (schema OK, sin migración):**
- Ampliar `PlaceCardView` con `metroLine` (vía `Place.metroStation → MetroStation.lines[]`, que es
  many-to-many: una estación puede tener 1-2 líneas → mostrar las que haya, normalmente 1). Toca
  [placeCardView.ts](../src/infrastructure/db/placeCardView.ts).
- Sumar dimensión **`subcategories`** a `PlaceFacets` (port `SearchService` + `getFacets` en infra)
  para que las subcategorías salgan con contador y se oculten las vacías (patrón P3). Encaja con
  facetas estáticas: una subcategoría pertenece a una sola categoría, su contador global = el de su
  categoría. La UI agrupa por categoría usando el catálogo (`GetCategories`).
- El resto (acordeón, pop-up de login) es **presentación pura**, sin impacto en dominio/datos.
