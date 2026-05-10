# Handoff: Portal Panorama

> Guía editorial de panoramas en Santiago de Chile — restaurantes, bares, cafés, museos, eventos y carretes.

---

## Overview

**Portal Panorama** es un descubridor de panoramas en Santiago con voz **editorial moderna minimal con calidez chilena**. La premisa: en vez de un agregador frío estilo Yelp/TripAdvisor, una guía curada — cada lugar tiene una reseña corta firmada, un rating numérico (no estrellas), y un sistema de **"premium signal"** discreto para negocios que pagan por destacar (badge negro + corner notch, nunca dorados ni gradientes).

El producto cubre dos lados:
- **Consumidor**: explora, busca por categoría/barrio/precio, lee reseñas, guarda favoritos, planifica salidas, paga su plan (free / plus / pro).
- **Negocio**: dashboard para administrar su ficha, ver analytics, responder reseñas, contratar plan premium.

---

## About the Design Files

Los archivos en `design_handoff_portal_panorama/` son **referencias de diseño creadas en HTML / CSS / JS vainilla** — un prototipo navegable que muestra look final y comportamiento intencional, **no código de producción para copiar tal cual**.

La tarea es **recrear estos diseños en el entorno del codebase destino** (Next.js, Remix, Astro, SvelteKit, Rails+Hotwire, etc.) usando sus convenciones — componentes, sistema de routing, librería de UI si existe, manejo de estado, etc.

Si no hay codebase aún, el stack recomendado por el carácter del producto:
- **Next.js 14 + App Router** (SSR para SEO, fichas indexables)
- **CSS Modules o Tailwind con tokens custom** (los tokens del prototipo son CSS vars puras — fácilmente portables)
- **Una librería de iconos lineal de 1.5px stroke** (Lucide, Phosphor regular)
- **Mapbox GL o Leaflet** para mapas de barrio (no presente en este handoff, en backlog)

No traduzcas el HTML literalmente. Toma las **decisiones visuales** (colores, tipografía, ritmo, jerarquía, copy) y aplícalas con los componentes del codebase.

---

## Fidelity

**Alta fidelidad (hifi).** Los mocks tienen colores finales, tipografías reales (Fraunces + Inter Tight + Geist Mono vía Google Fonts), spacing definido en escala de 4px, y todos los estados clave (hover, focus, premium, vacío). Implementar pixel-perfect — los tokens están explícitamente listados abajo.

Imágenes son **placeholders rayados** (`.placeholder-stripe`) con etiqueta de qué deberían contener. El equipo editorial debe proveer la fotografía real; las dimensiones y proporciones del placeholder son las correctas.

---

## Screens / Views

El prototipo es un single-page app con hash-routing (`#/`, `#/buscar`, `#/lugar`, `#/planes`, `#/login`, `#/sistema`, `#/dashboard`, etc.). En producción cada ruta debería ser una ruta server-rendered.

### 1. Home (`/`)

**Propósito**: aterrizaje editorial; presenta la marca, ofrece búsqueda inmediata, muestra panoramas curados.

**Layout** (top-to-bottom, dentro de `.container` max-width 1280px):

1. **Topbar fijo** (height 72px, `border-bottom 1px var(--surface-line)`):
   - Izquierda: wordmark "Portal Panorama" en Fraunces 24px, peso 400.
   - Centro: nav links (Explorar / Eventos / Barrios / Para negocios) — Inter Tight 14px, gap 32px.
   - Derecha: botón ghost "Ingresar" + botón primary "Crear cuenta".
   - Mobile (<640px): wordmark izquierda, **hamburger** derecha → drawer lateral animado.

2. **Hero** (max-width 1100px **centrado dentro del container**, padding-block 96px):
   - **Grid 2 columnas** (1fr / 480px, gap 64px). Mobile: 1 columna.
   - Columna izq:
     - Eyebrow `GUÍA EDITORIAL · SANTIAGO 2025` (Geist Mono 12px uppercase, letter-spacing 0.14em, color `var(--fg-muted)`).
     - Título display: `Lo bueno de la ciudad, curado como revista` — Fraunces clamp(44px, 6vw, 88px), peso 400, italic en "curado" con color `var(--accent-60)`.
     - Párrafo subtítulo: 17px Inter Tight, color `var(--fg-muted)`, max-width 42ch.
   - Columna der:
     - **Buscador horizontal** (`.hero-search`): pill con 3 campos divididos por línea vertical interna — "Qué buscas" / "Dónde" (select de barrios) / "Cuándo" (select de fecha) — y botón circular icon "→" al final. Border 1px `var(--surface-line)`, fondo `var(--bg-raised)`, padding 6px, radio pill (999px). Cada campo 44px alto, padding 0 16px.
     - Debajo: chip-row con atajos rápidos ("Romántico", "Con niños", "Brunch", "Después del trabajo", "Carrete") — chips pill 32px alto, border 1px, hover → border negro.
   - Mobile: el buscador colapsa a stack vertical de 3 campos + botón full-width.

3. **Strip de stats** (3 columnas, separados por `border-left`): "1.240 lugares curados", "47 barrios", "Actualizado semanalmente". Tipografía display 32px, label mono 11px uppercase debajo.

4. **Sección Categorías** (`.cat-grid`):
   - Título sección `.sec-head`: eyebrow + h2 display 40px + cta "Ver todo →".
   - Grid 4 columnas desktop / 2 mobile, gap 16px.
   - 8 categorías: Restaurantes, Bares, Cafés, Museos, Parques, Música en vivo, Cine, Eventos.
   - Cada card: ratio 4:5, fondo `placeholder-stripe`, label mono en esquina inferior izq, título Fraunces 24px en overlay inferior, contador pequeño (`128 lugares`).

5. **Sección Destacados premium** (`.featured-grid`):
   - Asymmetric grid: primer card grande (col-span 2, row-span 2) + 4 cards regulares.
   - Cada card tiene `.is-premium` con corner notch negro 28×28px y `.premium-badge` (border negro, dot accent, mono uppercase).
   - Card: imagen → meta (categoría · barrio · precio $$$) → título Fraunces → blurb 2 líneas → footer con rating numérico (ej. `8.7`) + "23 reseñas".

6. **Sección Eventos esta semana**: scroll horizontal con scroll-snap en mobile, grid 3 col desktop. Cards verticales con fecha grande (Fraunces 56px día + mono mes uppercase).

7. **Pull quote editorial**: full-width, fondo `var(--bg-sunken)`, una cita en Fraunces italic 48px centrada, max-width 800px, atribución mono debajo.

8. **CTA negocios**: banner full-width fondo negro `var(--ink-100)`, texto crema, título "¿Tu lugar es bueno? Que se sepa." + CTA "Ver planes para negocios".

9. **Footer**: 4 columnas (Producto / Negocios / Empresa / Legal) + barra inferior con wordmark, redes, "Hecho en Santiago".

---

### 2. Buscar / Explorar (`/buscar`)

**Propósito**: búsqueda + browse con filtros, vistas alternables grid/lista.

**Layout**:
- Container 1280px, padding-block 32px.
- **Search shell**: grid `280px 1fr`, gap 48px.
  - Columna izq (rail filtros): sticky top 88px, vertical:
    - Título mono `FILTROS` con botón "Limpiar".
    - Grupos colapsables: Categoría (8 checkboxes), Barrio (multi-select 47 opciones), Precio ($, $$, $$$, $$$$ — toggles), Rating mínimo (slider 0–10), Tags (chips: con-niños, romántico, terraza, vegano, etc.), Abierto ahora (toggle).
  - Columna der (resultados):
    - **Header de resultados** (alineado al borde izq de esta columna, NO al container — este es el detalle que pediste):
      - Eyebrow contextual: `EXPLORAR` o `EVENTOS · ESTA SEMANA` o `RESULTADOS PARA "<query>"`.
      - H1 Fraunces 64px: `Todo Santiago` / `Eventos esta semana` / la query.
      - Línea de meta: `1.240 lugares · ordenado por relevancia` con dropdown de orden a la derecha.
      - **Barra de búsqueda full-width** dentro de esta columna (mismo componente del hero, sin chips).
      - Toggle Grid / Lista (segmentado pill, 2 botones, default depende del contexto: Explorar→Grid, Eventos→Lista).
    - **Vista Grid**: `results-grid` 3 columnas (`repeat(auto-fill, minmax(280px, 1fr))`), gap 24px. Cards verticales idénticas a las de destacados, sin notch premium salvo cuando aplique.
    - **Vista Lista**: filas `place-row` con grid `200px 1fr auto`, gap 24px:
      - Foto izq: 200×140px radio 8px.
      - Centro: meta line (categoría · barrio · precio) + título Fraunces 28px + blurb 2 líneas + chips de tags (máx 3).
      - Derecha: rating big (Fraunces 36px) + nº reseñas + CTA "Ver →".
      - Mobile: grid 120px / 1fr, oculta CTA y blurb, título a 20px.

---

### 3. Ficha de lugar (`/lugar?id=...`)

**Propósito**: página detalle de un panorama.

**Layout**:
- **Galería hero**: grid 2 columnas 2/3 + 1/3, primera foto grande, 4 thumbs apiladas a la derecha, height 480px. Mobile: stack.
- **Header**: eyebrow categoría · barrio · precio. Título Fraunces 80px. Premium badge si aplica. Action row: botones Guardar, Compartir, Reservar (primary).
- **Body**: grid 2 columnas 1fr / 360px, gap 64px:
  - Izq (contenido): reseña editorial larga (Fraunces 19px Inter Tight para body, drop cap opcional en primera letra), galería secundaria, sección "Lo que dice la gente" con 6 reseñas usuario, sección "También te puede gustar" (carrusel horizontal 4 cards, scroll-snap).
  - Der (sidebar sticky top 88px):
    - Card datos prácticos: dirección + map embed mini, horario (lista días), teléfono, web, redes — todo con divisores horizontales hairline.
    - Card "Reservar" si aplica.
    - Card "Reportar problema" link discreto.
  - Mobile: sidebar va abajo del contenido.

---

### 4. Planes (`/planes`)

**Propósito**: pricing público para usuarios + dual toggle para negocios.

**Layout**:
- Header centrado: eyebrow `PLANES` + display 80px "Encuentra mejor, cuenta mejor".
- Toggle segmentado **Para ti / Para tu negocio** (chip pill grande, 2 opciones).
- Grid 3 columnas (mobile: stack):
  - **Free**: título `Free`, precio `$0`, lista features con checks (líneas hairline entre items), CTA ghost "Empezar gratis".
  - **Plus**: precio `$3.990 / mes`, mismas features + extras. CTA primary negro. Border accent 2px alrededor de la card + tag mono "MÁS POPULAR" en top.
  - **Pro**: precio `$9.990 / mes` (lado negocios) o premium para usuarios. CTA accent.
- FAQ debajo, 6 preguntas en accordion.

---

### 5. Auth (`/login`, `/registro`)

**Layout**: split full-viewport.
- Izq 50%: panel de arte — fondo `var(--bg-sunken)`, una pull quote de un crítico editorial en Fraunces italic 40px centrada, atribución debajo.
- Der 50%: form centrado max-width 400px:
  - Wordmark arriba.
  - H1 "Ingresa" / "Crea tu cuenta" Fraunces 40px.
  - Campos input 44px alto.
  - Botón primary full-width.
  - Divider "o" + botones sociales ghost (Google / Apple).
  - Link cambiar entre login/registro.
- Mobile: panel arte oculto, form 100% width con padding 24px.

---

### 6. Dashboard usuario (`/dashboard`)

**Layout**: shell con sidebar 240px + contenido 1fr.
- Sidebar: avatar + nombre arriba, lista nav vertical (Mi feed, Guardados, Listas, Reseñas, Configuración), divider, logout abajo.
- Contenido: tabs según sección.
  - **Mi feed**: timeline de actualizaciones de lugares guardados.
  - **Guardados**: grid de cards.
  - **Listas**: cards de listas custom ("Próximas citas", "Llevar a mamá", etc.) con nombre + cover compuesto de 4 thumbs.
  - **Reseñas**: lista de reseñas escritas con CTA editar.
- Mobile: sidebar oculto, tabs horizontales scrollables sticky en top.

---

### 7. Dashboard negocio (`/negocio/dashboard`)

Mismo shell, distinto contenido:
- Header con foto del local + nombre + plan actual + CTA "Mejorar plan".
- Tabs: Resumen (KPIs: vistas semana, clicks a web, guardados, rating promedio — con sparklines), Mi ficha (editar perfil), Reseñas (responder), Analytics (gráficos), Plan & facturación.
- KPI cards: número grande Fraunces 56px + label mono + delta (verde/rojo) + sparkline 80×24px.

---

### 8. Checkout (`/checkout`)

**Layout**: container max 1100px, grid 2 col `1fr 380px`, gap 64px.
- Izq (form): pasos numerados (Datos → Pago → Confirmación), inputs 44px, fieldsets agrupados con eyebrow.
- Der (sidebar resumen): card sticky top 88px con plan elegido, breakdown precio, total grande, CTA primary "Pagar".
- Mobile: resumen va arriba, form abajo.

---

### 9. Sistema (`/sistema`)

Página interna que documenta los componentes — no es parte del producto, sirve de referencia visual del design system. Incluye paleta, type scale, botones, chips, cards, formularios, badges.

---

## Interactions & Behavior

### Routing
- Hash routing en el prototipo (`window.location.hash`). En producción: rutas reales del framework.
- Cambio de ruta → fade-up 360ms del contenido (`.page-enter`).

### Tema
- Solo light theme. Hubo un intento de dark mode pero está desactivado — **no implementar dark mode** salvo que el cliente lo pida explícitamente.

### Hover states
- Botones: cambio de fondo 140ms ease-out.
- Botón link `.btn--link`: subraya con `transform: scaleX(0.7)` desde la izquierda, 220ms.
- Cards: `transform: translateY(-2px)` y `box-shadow` se eleva de `--shadow-2` a `--shadow-3`, 220ms.
- Chips: `border-color` pasa a negro.
- Imágenes en cards: `scale(1.03)` 360ms ease-out.

### Focus
- `:focus-visible` outline 2px `var(--accent-60)` offset 2px, radio 2px. **Crítico para accesibilidad** — implementar igual.

### Toggle Grid/Lista (página Buscar)
- Default contextual: `Explorar` → Grid, `Eventos` → Lista, `Resultados de búsqueda` → Grid.
- El toggle persiste la elección por sesión (localStorage opcional) pero se resetea al cambiar de contexto.

### Responsive breakpoints
- Mobile: `<640px`
- Tablet: `640–960px`
- Desktop: `>960px`
- Comportamientos clave en mobile:
  - Topbar: hamburger → drawer.
  - Hero: 1 columna, búsqueda colapsa vertical.
  - Categorías: 2×4 grid.
  - Resultados grid: 1 columna, o carrusel horizontal con `scroll-snap-type: x mandatory` en secciones tipo "También te puede gustar".
  - Dashboards: sidebar oculto, tabs horizontales scrollables sticky.
  - Ficha lugar: galería stack, sidebar abajo.
  - Auth: panel arte oculto.

### Animaciones globales
- Page enter: 360ms `cubic-bezier(0.2, 0.7, 0.2, 1)` con `translateY(8px) → 0` y `opacity 0 → 1`.
- Easings: `--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1)` (default), `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`.
- Duraciones: `--d-fast: 140ms`, `--d-normal: 220ms`, `--d-slow: 360ms`.

### Validación de formularios
- Inputs: borde rojo `var(--error)` en error, helper text mono 11px abajo.
- Submit: deshabilitado hasta que campos requeridos estén llenos. Estado loading: spinner discreto + texto "Enviando…".

### Estados vacíos
- Buscar sin resultados: ilustración placeholder + "No encontramos lugares para esa búsqueda" Fraunces 28px + sugerencias.
- Guardados vacíos: copy + CTA "Empieza explorando".

---

## State Management

Estado mínimo necesario:

- **Sesión usuario**: `{user: {id, name, avatar, plan}, isAuthenticated}`. Persistir en cookies (server) o localStorage (client si SPA).
- **Filtros de búsqueda**: query params en URL — `?q=&cat=&barrio=&precio=&rating=&open=`. **Crítico**: la URL debe ser la fuente de verdad para que los filtros sean compartibles y el back button funcione.
- **Vista Grid/Lista**: query param `?view=grid|list`, default contextual.
- **Guardados**: lista de IDs en backend; cache local optimista para toggle inmediato.
- **Tema**: hardcoded a `light`. No exponer toggle.
- **Tweaks panel**: solo en prototipo, **no portar** a producción.

### Data fetching
- Fichas de lugar: SSR para SEO.
- Búsqueda: client-side fetch al cambiar filtros, con debounce 300ms en el input de query libre.
- Dashboard: SSR + revalidate.
- Imágenes: usar `next/image` o equivalente con lazy + blur placeholder.

---

## Design Tokens

Todos los tokens viven en `assets/tokens.css` del bundle. Resumen para portar:

### Colores

```
/* Neutrales (papel crema cálido) */
--paper-00: #FBF8F2   /* superficies elevadas */
--paper-05: #F6F2EA   /* fondo principal */
--paper-10: #EFEAE0   /* sunken */
--paper-20: #E4DDCF   /* divider claro */
--paper-30: #C9C0AE   /* borde sutil */
--paper-40: #9A9282   /* texto deshabilitado */
--paper-50: #6B6557   /* texto secundario */

--ink-90:  #2A2622    /* texto cuerpo */
--ink-95:  #1C1916    /* texto fuerte */
--ink-100: #14110F    /* tinta — texto principal */

/* Acento (atardecer) — en oklch para gradación cromática consistente */
--accent-soft: oklch(0.92 0.04 45)
--accent-50:   oklch(0.78 0.10 45)
--accent-60:   oklch(0.62 0.16 45)   /* primario */
--accent-70:   oklch(0.52 0.17 38)   /* hover */
--accent-80:   oklch(0.42 0.14 32)   /* deep */

/* Semánticos */
--success: oklch(0.58 0.12 155)
--warning: oklch(0.72 0.14 75)
--error:   oklch(0.55 0.20 25)
--info:    oklch(0.55 0.10 230)
```

**Aliases semánticos** (preferir estos en componentes):
```
--bg, --bg-raised, --bg-sunken
--surface-line, --surface-line-soft
--fg, --fg-muted, --fg-subtle
--accent, --accent-hover, --on-accent
```

### Spacing (escala 4px)
```
--s-1: 4    --s-2: 8     --s-3: 12    --s-4: 16    --s-5: 20
--s-6: 24   --s-8: 32    --s-10: 40   --s-12: 48   --s-16: 64
--s-20: 80  --s-24: 96   --s-32: 128
```

### Tipografía

**Familias** (cargar de Google Fonts):
- Display: **Fraunces** (variable, opsz 144, SOFT 50/100). Italic en énfasis con SOFT 100 + color accent.
- UI / sans: **Inter Tight** (400, 500, 600).
- Mono: **Geist Mono** (400, 500).

**Escala display** (Fraunces, line-height 1.02, letter-spacing -0.025em):
```
--t-display-xl: clamp(56px, 9vw, 132px)
--t-display-lg: clamp(44px, 6vw, 88px)
--t-display-md: clamp(36px, 4.5vw, 64px)
--t-display-sm: clamp(28px, 3vw, 44px)
```

**Escala UI** (Inter Tight):
```
--t-h1: 32px      --t-h2: 24px    --t-h3: 19px    --t-h4: 16px
--t-body: 15px    --t-body-sm: 13px
--t-mono: 12px    --t-mono-sm: 11px    --t-tiny: 10px
```

**Line-heights**: tight 1.02 / snug 1.18 / normal 1.45 / loose 1.6.
**Letter-spacing**: tight -0.025em / normal -0.005em / wide 0.06em / wider 0.14em (mono uppercase).

### Border radius
```
--r-xs: 2    --r-sm: 4    --r-md: 8    --r-lg: 12    --r-xl: 20    --r-pill: 999px
```

### Shadows (mínimas — la separación es por línea, no por sombra)
```
--shadow-1: 0 1px 0 rgba(20,17,15,0.04)
--shadow-2: 0 1px 2px rgba(20,17,15,0.05), 0 0 0 1px rgba(20,17,15,0.04)
--shadow-3: 0 8px 24px -8px rgba(20,17,15,0.18), 0 0 0 1px rgba(20,17,15,0.06)
--shadow-pop: 0 24px 48px -16px rgba(20,17,15,0.25)
```

### Layout
```
--content-max: 1280px
--content-pad: clamp(20px, 4vw, 56px)
--grid-gutter: clamp(16px, 2vw, 24px)
```

### Premium signal (importante para identidad de marca)
- Badge: border 1px negro, dot accent 6px, texto mono uppercase 11px, padding 3px 8px.
- Card premium: corner notch triangular 28×28px en top-left, fill `var(--ink-100)`. Es la firma visual.
- **Nunca usar dorados, gradientes, ni efectos de "luxury". El premium se comunica con tipografía y un detalle gráfico, no con shine.**

---

## Assets

### Tipografías
- **Fraunces** — Google Fonts, font variable. Cargar opsz 9–144, weight 100–900, ital 0/1.
- **Inter Tight** — Google Fonts, weights 400/500/600.
- **Geist Mono** — Google Fonts, weights 400/500.

### Imágenes
**No hay imágenes reales en el prototipo.** Todos los espacios de imagen son `<div class="placeholder-stripe" data-label="...">` con un `data-label` que indica qué debería ir ahí (ej: `data-label="Restaurante Bocanáriz"`).

El equipo editorial debe entregar fotografía real con estos requisitos:
- Cards categoría: ratio 4:5, 600×750px mín.
- Cards lugar verticales: ratio 3:4 o 4:5.
- Galería ficha hero: 1 grande 16:10 + 4 thumbs 1:1.
- Eventos: 4:3.
- Tono fotográfico: editorial, luz natural, sin filtros saturados, calidez. No stock.

### Iconos
Sistema custom inline SVG, stroke 1.5px, currentColor, classes `.ico` / `.ico-sm` / `.ico-lg`. Definidos en `assets/icons.js` (search, location, calendar, arrow-right, heart, share, star, etc.). En producción reemplazar por **Lucide** o **Phosphor regular** — estética similar.

### Logo
Wordmark "Portal Panorama" en Fraunces 24px peso 400. **No hay isotipo.** Mantener typografía como identidad.

---

## Files

Todo el código fuente del prototipo está en este bundle:

```
design_handoff_portal_panorama/
├── README.md                 ← este archivo
├── index.html                ← shell SPA con todas las rutas
└── assets/
    ├── tokens.css            ← TODO el design system en CSS vars
    ├── components.css        ← clases de componentes (.btn, .chip, .card, .hero-search, etc.)
    ├── responsive.css        ← media queries
    ├── tweaks.css            ← solo prototipo, ignorar
    ├── data.js               ← datos mock (lugares, categorías, barrios, eventos)
    ├── icons.js              ← sprite SVG inline
    ├── router.js             ← hash routing
    ├── render.js             ← helpers de render de cards/secciones
    ├── pages.js              ← markup de cada página (home, buscar, lugar)
    ├── pages-ext.js          ← páginas extendidas (planes, login, dashboard, checkout, sistema)
    ├── app.js                ← bootstrap
    ├── tweaks.js             ← panel de tweaks, ignorar para producción
    └── map.js                ← stub mapa, no implementado en este pase
```

**Archivos clave para el desarrollador**:
1. `assets/tokens.css` — copiar al codebase como base del design system.
2. `assets/components.css` — referencia para reproducir cada componente.
3. `assets/pages.js` y `pages-ext.js` — leer la estructura HTML de cada página y traducir a componentes.
4. `index.html` — abrir en navegador para ver el prototipo navegable completo.

---

## Notas finales para el desarrollador

- **Voz editorial**: copy en español de Chile, voz curatorial, evitar tono corporativo. "Lo bueno", "curado", "que se sepa", etc. Mantener el registro al traducir copy nuevo.
- **No hay dark mode.** Hay un selector `[data-theme="__unused__"]` en tokens.css que es residuo — ignorar.
- **No portar el panel Tweaks** (`tweaks.css`, `tweaks.js`) — es solo herramienta de diseño del prototipo.
- **Mobile first no aplica aquí**: el diseño nació desktop, mobile es adaptación. Las decisiones tipográficas y de spacing fueron tomadas para 1280px+ y luego escaladas hacia abajo. Mantener ese orden de prioridad — desktop debe verse perfecto.
- **Accesibilidad**: el `:focus-visible` con outline accent es no negociable. Contraste de `--paper-50` (#6B6557) sobre `--paper-05` (#F6F2EA) está al límite WCAG AA — usarlo solo para texto secundario ≥14px.
- **Mapa de barrio**: existe un stub en `map.js` pero no se implementó. En backlog: integrar Leaflet + tiles de OpenStreetMap con clusters por barrio. La vista mapa fue removida del toggle de búsqueda — vive ahora dentro de la ficha de lugar como mini-map y como página dedicada por barrio (`/barrio/<slug>` no implementado aún).
