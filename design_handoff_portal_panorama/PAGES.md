# Portal Panorama · Mapa de páginas y flujos

> Documento de referencia para Claude Code (o cualquier desarrollador) al trabajar sobre el portal. Describe cada ruta, su propósito, los parámetros aceptados, los componentes/secciones que renderiza, y cómo se conecta con el resto.

## Stack y convenciones

- **Routing:** hash router casero en `assets/router.js` (`window.PP_ROUTER`). Las rutas viven después del `#` (ej. `#/buscar?cat=cafes`).
- **Render:** `assets/app.js` despacha cada path al renderer correspondiente en `assets/pages.js` (núcleo) o `assets/pages-ext.js` (checkout + dashboards).
- **Datos mock:** `assets/data.js` (`window.PP_DATA`) — places, categories, neighborhoods, events, owners.
- **Estado persistido (localStorage):**
  - `pp.favs.v1` — IDs de lugares marcados con corazón
  - `pp.grupos.v1` — listas/colecciones del usuario
  - `pp.theme` — `light` | `dark`
- **Tipografías:** Fraunces (display, italic con eje SOFT), Inter Tight (UI), Geist Mono (eyebrows / metadatos).
- **Tokens:** `assets/tokens.css`. Paleta papel cálido + acento atardecer (`--accent-60`).

---

## 1. Núcleo público

### `/` — Home
**Renderer:** `PP_PAGES.home()` · `pages.js`
**Propósito:** portada editorial. Punto de entrada principal.
**Secciones:**
1. Hero con buscador (qué / dónde / cuándo) + chips temáticos
2. Categorías para empezar (8 tarjetas)
3. Lo más recomendado (3 lugares premium destacados)
4. Esta semana en la ciudad (lista de eventos)
5. Panoramas nuevos (6 lugares)
6. Pull-quote editorial
7. CTA negocios → `/planes`

**Sale hacia:** `/buscar`, `/buscar?cat=…`, `/lugar?id=…`, `/planes`

---

### `/buscar` — Resultados / explorar
**Renderer:** `PP_PAGES.buscar(params)`
**Params:**
- `q` — texto libre
- `cat` — id de categoría (`restaurantes`, `bares`, `cafes`, `museos`, `eventos`, …)
- `where` — barrio
- `view` — `grid` | `list` (eventos default a `list`, resto a `grid`)

**Layout:** rail izquierdo (filtros) + columna principal (header + buscador + resultados).
**Secciones:** filtros (categoría, barrio, valoración, precio, horario), barra de resultados con conteo + toggle vista, drawer móvil.
**Sale hacia:** `/lugar?id=…`, `/buscar?view=…` (toggle).

---

### `/lugar?id=…` — Ficha de lugar
**Renderer:** `PP_PAGES.lugar(params)`
**Params obligatorios:** `id` (clave en `D.places`).
**Secciones:**
1. Breadcrumb
2. Galería tripleta (portada + interior + detalle)
3. Cabecera con categoría, barrio, badge Premium, rating, precio, horario
4. Acciones: Cómo llegar / Guardar / Compartir
5. Descripción + chips de tags
6. Mini-mapa con pin
7. Reseñas (3 mock)
8. Sidebar: información de contacto, botón guardar/compartir, indicador "Verificado por el local" o CTA "Reclamar ficha", bloque "Gestionado por" con link al perfil del owner
9. Si NO es premium: banner "Sin reclamar" → `/checkout?step=1`
10. "También te puede gustar" (3 lugares relacionados)

**Sale hacia:** `/perfil-negocio?id=…`, `/buscar?where=…`, `/checkout?step=1`, `/dashboard-negocio?tab=fichas` (si premium).

---

### `/perfil-negocio?id=…` — Perfil público del owner
**Renderer:** `PP_PAGES_EXT.perfilNegocio(params)`
**Propósito:** ver públicamente todos los locales y eventos que gestiona un dueño o casa editorial (`D.owners`).

---

### `/planes` — Pricing para negocios
**Renderer:** `PP_PAGES.planes()`
**Secciones:**
1. Hero "Aparece como corresponde"
2. Dos cards: Free ($0) vs Premium ($24.900 CLP/mes)
3. Tabla comparativa detallada (9 filas)
4. Bloque "¿Tienes varios locales?" (contacto enterprise)

**Sale hacia:** `/checkout?step=1`.

---

### `/sistema` — Design system docs
**Renderer:** `PP_PAGES.sistema()`
**Propósito:** referencia visual interna. Tipografía (Fraunces/Inter Tight/Geist Mono), paleta (neutros papel cálido + acento atardecer + semánticos), componentes (botones, chips, premium badge, input, cards), spacing/radii/shadows.

---

## 2. Onboarding de negocio (checkout, 4 pasos)

**Renderer único:** `PP_PAGES_EXT.checkout(params)`
**Params:**
- `step` — `1` | `2` | `3` | `4`
- `plan` — `free` | `prem`
- `cycle` — `mensual` | `anual` (Premium tiene −20% anual)

**Bifurcación clave:** si `plan=free`, el step 2 salta directo al step 4 (sin pago).

| Step | Contenido | Siguiente |
|---|---|---|
| 1 | Toggle mensual/anual + cards Free vs Premium | `?step=2&plan=…` |
| 2 | Form datos del negocio (nombre, dirección, RUT, categoría, etc.) + sidebar resumen | `?step=3` (prem) o `?step=4` (free) |
| 3 | Datos de pago (tarjeta/Webpay/transferencia) — solo Premium. Trial 14 días | `?step=4` |
| 4 | Confirmación con CTA al panel | `/dashboard-negocio` |

---

## 3. Panel del usuario

**Ruta:** `/dashboard-usuario?tab=…`
**Renderer:** `PP_PAGES_EXT.dashUsuario(params)`
**Layout:** topbar + header con avatar y stats + sidebar con 7 tabs + contenido.

| Tab | Propósito |
|---|---|
| `guardados` (default) | Grid de favoritos (`PP_FAVS`) |
| `listas` | Carpetas privadas (`pp.grupos.v1`). CRUD: crear, renombrar, borrar, agregar/quitar lugares |
| `historial` | Lugares vistos recientemente |
| `resenas` | Reseñas escritas por el usuario |
| `eventos` | Eventos guardados |
| `perfil` | Datos personales |
| `config` | Ajustes |

**Cruza con:** `/dashboard-negocio` (botón "Mi negocio" en header).

---

## 4. Panel del negocio

**Ruta:** `/dashboard-negocio?tab=…`
**Renderer:** `PP_PAGES_EXT.dashNegocio(params)`
**Layout:** topbar + header con avatar + badge Premium + sidebar con 9 tabs + contenido.

| Tab | Propósito |
|---|---|
| `resumen` (default) | KPIs (vistas, cómo llegar, llamadas, posición) + gráfico 7d + estado de la ficha |
| `fichas` | Locales que gestiono. Editar / ver / agregar nuevo (→ `/checkout?step=2&plan=free`) |
| `stats` | Estadísticas 6 meses, fuente de tráfico, acciones desde la ficha |
| `resenas` | Reseñas recibidas. Responder |
| `eventos` | Publicar / gestionar eventos |
| `plan` | Plan activo, facturación |
| `guardados` | Hereda del modo usuario |
| `listas` | Hereda del modo usuario |
| `perfil` | Identidad del negocio |

**Cruza con:** `/dashboard-usuario` (botón "Mi cuenta"), `/lugar?id=…` ("Ver ficha").

---

## 5. Auth

### `/login`
**Renderer:** `PP_PAGES.login()`
Form simple con email/password + Google. El submit es mock — siempre redirige a `/`.

---

## Mapa de aristas (todas las navegaciones implementadas)

| Origen | Destino | Disparador |
|---|---|---|
| `/` | `/buscar?cat=…` | Tarjetas de categoría + chips del hero |
| `/` | `/lugar?id=…` | Tarjetas destacadas y "Panoramas nuevos" |
| `/` | `/planes` | Banner CTA "¿Tienes un local?" |
| `/buscar` | `/lugar?id=…` | Cada resultado |
| `/buscar` | `/buscar?view=…` | Toggle Grid / Lista |
| `/lugar` | `/perfil-negocio?id=…` | Sidebar "Gestionado por" |
| `/lugar` (no premium) | `/checkout?step=1` | Banner "Reclamar ficha" |
| `/lugar` | `/buscar?where=…` | "También te puede gustar" |
| `/planes` | `/checkout?step=1` | CTA "Empezar prueba" |
| `/checkout?step=2` | `?step=3` o `?step=4` | Bifurca según plan |
| `/checkout?step=4` | `/dashboard-negocio` | "Ir a mi panel" |
| `/dashboard-usuario` | `/dashboard-negocio` | "Mi negocio" |
| `/dashboard-negocio` | `/dashboard-usuario` | "Mi cuenta" |
| `/dashboard-negocio` | `/lugar?id=…` | "Ver ficha" |
| `/dashboard-negocio?tab=fichas` | `/checkout?step=2` | "Agregar local" |
| Topbar (cualquier página) | `/login` | "Iniciar sesión" |
| `/login` | `/` | Submit del formulario |

---

## Cómo trabajar con esto en Claude Code

1. **Punto de entrada:** `index.html` carga todos los `assets/*.js` en orden. Mira `assets/app.js` para ver el dispatcher de rutas.
2. **Para tocar UNA página:** ve directo al renderer correspondiente en `pages.js` o `pages-ext.js`. Cada función devuelve un string HTML que se inyecta en `#app`.
3. **Para agregar una página nueva:**
   - Escribe el renderer en `pages.js` o `pages-ext.js`
   - Agrega un `else if (path === "/nueva-ruta")` en `app.js`
   - Linkea desde otras páginas con `<a href="#/nueva-ruta">` o `PP_ROUTER.go("/nueva-ruta", {…})`
4. **Para cambiar tokens visuales:** `assets/tokens.css` (colores, spacing, radii, shadows, fonts).
5. **Para agregar un componente reutilizable:** `assets/render.js` (`window.PP_R`) tiene helpers como `topbar()`, `footer()`, `placeCard()`, `eventCard()`, `sectionHead()`.
