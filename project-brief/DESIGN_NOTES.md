# Design Notes — Portal Panorama Handoff

Resumen de lo extraído del handoff de diseño para referencia durante la implementación.
Fuente: `design_handoff_portal_panorama/` (README + index.html + assets/)

---

## Flujos de Usuario Detectados

### Flujo 1: Exploración y búsqueda
```
Home → (hero search / chips rápidos / nav "Explorar") → /buscar
/buscar → (click card) → /lugar?id=...
/lugar → (carrusel "También te puede gustar") → /lugar?id=... (otro)
/lugar → (botón "Reservar") → externo / pendiente
```

### Flujo 2: Registro y autenticación
```
Home → "Iniciar sesión" o "Listar mi local" → /login o /registro
/registro → form (nombre, email, contraseña) + Google + Apple
/login → form (email, contraseña) + social
Post-auth → redirect a dashboard o a la acción pendiente
```

### Flujo 3: Usuario consumidor (post-login)
```
/dashboard → Mi feed (updates de lugares guardados) — EN MVP
/dashboard → Guardados (grid de lugares con ♥)
/dashboard → Listas (colecciones propias)
/dashboard → Reseñas (mis reviews con edit)
/dashboard → Configuración
```

### Flujo 4: Publicar un listing (usuario → dueño de negocio)
```
Home → "Listar mi local" → /planes (selección plan) → /registro (si no auth)
→ form crear listing → publicado
```
*(El handoff no muestra el formulario de creación de listing explícitamente — ver OPEN_QUESTIONS Q4/Q5)*

### Flujo 5: Dashboard de negocio
```
/negocio/dashboard → Resumen (KPIs: vistas, clicks, guardados, rating)
/negocio/dashboard → Mi ficha (editar info del listing)
/negocio/dashboard → Reseñas (responder reviews de usuarios)
/negocio/dashboard → Analytics (gráficos — detalle no mostrado en handoff)
/negocio/dashboard → Plan & facturación (upgrade, historial)
```

### Flujo 6: Upgrade a premium
```
/planes → selección plan → /checkout
/checkout → stepper: Datos → Pago → Confirmación
```

### Flujo 7: Reclamar listing (no mostrado en handoff)
Ver OPEN_QUESTIONS Q6.

---

## Pantallas y Componentes

### Home (`/`)
- **TopBar** fijo 72px: wordmark, nav (Explorar / Eventos / Para tu negocio / Sistema), acciones (search icon, login button, listar CTA)
- **Hero** 2-columnas: copy editorial izquierda + **SearchForm** derecha
- **StatsStrip**: 3 métricas (lugares verificados, eventos semana, barrios)
- **Sección Categorías**: `SectionHeader` + grid 4-col de `CategoryCard` (8 categorías)
- **Sección Destacados Premium**: 3 `PlaceCard` (premium)
- **Sección Eventos**: 4 `EventCard` horizontales
- **Sección Nuevos y bien evaluados**: 6 `PlaceCard` en grid 3-col
- **PullQuote** editorial full-width
- **BizCTA** dark section: copy + card mockup de negocio
- **Footer** 4-col: brand, explorar, negocios, empresa

### Buscar/Explorar (`/buscar`)
- **SearchShell**: sidebar 280px + contenido 1fr
- Sidebar: filtros colapsables (categoría, barrio, precio, rating, tags, abierto ahora)
- Contenido: header contextual + H1 display + sort dropdown + toggle Grid/Lista
- **ResultsGrid** (3-col) o **ListaResultados** (rows con foto 200×140)

### Ficha de Lugar (`/lugar?id=...`)
- **GaleriaHero**: 2/3 foto grande + 1/3 thumbnails (4 fotos)
- Header: eyebrow + título Fraunces 80px + PremiumBadge opcional + acciones (guardar/compartir/reservar)
- Body 2-col (1fr / 360px):
  - Izquierda: review editorial + galería secundaria + reviews de usuarios (6) + carrusel "También te puede gustar"
  - Derecha sticky: card info práctica (dirección, horarios, teléfono, web, social) + link "Reportar problema"

### Planes (`/planes`)
- Toggle "Para ti / Para tu negocio" (segmented pill)
- 3 columnas: Free ($0) / Plus ($3.990/mes, badge "MÁS POPULAR") / Pro ($9.990/mes)
- FAQ accordion (6 preguntas)

### Auth (`/login`, `/registro`)
- Split layout: 50% arte/quote izquierda + 50% form derecha
- Form: wordmark + H1 Fraunces 40px + inputs 44px + submit + divider "o" + social buttons
- Mobile: arte panel oculto, form 100% ancho

### Dashboard Usuario (`/dashboard`)
- Shell: sidebar 240px (avatar + nav + logout) + contenido
- Tabs: Mi feed / Guardados / Listas / Reseñas / Configuración

### Dashboard Negocio (`/negocio/dashboard`)
- Shell similar al usuario
- Header de negocio: foto + nombre + plan actual + CTA upgrade
- Tabs: Resumen (KPIs + sparklines 80×24px) / Mi ficha / Reseñas / Analytics / Plan & facturación
- KPIs: vistas/semana, clicks web, guardados, rating promedio — números en Fraunces 56px

### Checkout (`/checkout`)
- 2-col (1fr / 380px): form con stepper numerado izquierda + card resumen sticky derecha
- Stepper: Datos → Pago → Confirmación

---

## Design Tokens

### Colores (CSS variables)

```css
/* Neutrales — warm cream paper */
--paper-00: #FBF8F2    /* superficies elevadas */
--paper-05: #F6F2EA    /* fondo principal */
--paper-10: #EFEAE0    /* fondo hundido */
--paper-20: #E4DDCF    /* divisor suave */
--paper-30: #C9C0AE    /* borde sutil */
--paper-40: #9A9282    /* texto deshabilitado */
--paper-50: #6B6557    /* texto secundario */

/* Tinta */
--ink-90: #2A2622      /* body text */
--ink-95: #1C1916      /* strong text */
--ink-100: #14110F     /* primary text */

/* Acento — sunset (OKLch) */
--accent-soft: oklch(0.92 0.04 45)
--accent-50:   oklch(0.78 0.10 45)
--accent-60:   oklch(0.62 0.16 45)   /* ← ACENTO PRINCIPAL */
--accent-70:   oklch(0.52 0.17 38)   /* hover */
--accent-80:   oklch(0.42 0.14 32)   /* deep */

/* Semánticos */
--success: oklch(0.58 0.12 155)
--warning: oklch(0.72 0.14 75)
--error:   oklch(0.55 0.20 25)
--info:    oklch(0.55 0.10 230)

/* Aliases preferidos en componentes */
--bg:                var(--paper-05)
--bg-raised:         var(--paper-00)
--bg-sunken:         var(--paper-10)
--surface-line:      var(--paper-30)
--surface-line-soft: var(--paper-20)
--fg:                var(--ink-100)
--fg-muted:          var(--paper-50)
--fg-subtle:         var(--paper-40)
--accent:            var(--accent-60)
--accent-hover:      var(--accent-70)
--on-accent:         var(--paper-00)
```

### Tipografía

```css
/* Familias */
font-family: "Inter Tight", sans-serif;        /* UI — body */
font-family: "Fraunces", serif;                /* display/headings */
font-family: "Geist Mono", monospace;          /* mono/labels */

/* Escala display (Fraunces, clamp responsive) */
--t-display-xl: clamp(56px, 9vw, 132px)
--t-display-lg: clamp(44px, 6vw, 88px)
--t-display-md: clamp(36px, 4.5vw, 64px)
--t-display-sm: clamp(28px, 3vw, 44px)

/* Escala UI */
--t-h1: 32px   --t-h2: 24px   --t-h3: 19px   --t-h4: 16px
--t-body: 15px   --t-body-sm: 13px
--t-mono: 12px   --t-mono-sm: 11px   --t-tiny: 10px

/* Line heights */
--lh-tight: 1.02   --lh-snug: 1.18   --lh-normal: 1.45   --lh-loose: 1.6

/* Letter spacing */
--tr-tight: -0.025em   --tr-normal: -0.005em
--tr-wide: 0.06em      --tr-wider: 0.14em
```

### Espaciado (escala 4px)

```css
--s-1: 4px    --s-2: 8px    --s-3: 12px   --s-4: 16px
--s-5: 20px   --s-6: 24px   --s-8: 32px   --s-10: 40px
--s-12: 48px  --s-16: 64px  --s-20: 80px  --s-24: 96px  --s-32: 128px

/* Layout */
--content-max: 1280px
--content-pad: clamp(20px, 4vw, 56px)
--grid-gutter: clamp(16px, 2vw, 24px)
```

### Border Radius

```css
--r-xs: 2px   --r-sm: 4px   --r-md: 8px
--r-lg: 12px  --r-xl: 20px  --r-pill: 999px
```

### Sombras

```css
--shadow-0: none
--shadow-1: 0 1px 0 rgba(20, 17, 15, 0.04)
--shadow-2: 0 1px 2px rgba(20, 17, 15, 0.05), 0 0 0 1px rgba(20, 17, 15, 0.04)
--shadow-3: 0 8px 24px -8px rgba(20, 17, 15, 0.18), 0 0 0 1px rgba(20, 17, 15, 0.06)
--shadow-pop: 0 24px 48px -16px rgba(20, 17, 15, 0.25)
```

### Animación

```css
--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--d-fast: 140ms     /* micro-interacciones (hovers) */
--d-normal: 220ms   /* transiciones estándar */
--d-slow: 360ms     /* page transitions */
```

---

## Componentes Reutilizables (para Fase 4)

| Componente | Descripción | Variantes |
|-----------|-------------|-----------|
| `PlaceCard` | Card de negocio con foto, meta, título, rating, estado | grid / list |
| `CategoryCard` | Card de categoría con icono, número, count | — |
| `EventCard` | Card horizontal con fecha prominente | — |
| `SearchForm` | 3 campos inline (qué/dónde/cuándo) con dividers | hero / compact |
| `PremiumBadge` | Badge black border + accent dot + mono text | — |
| `PremiumNotch` | Corner 28×28px top-left, clip-path | — |
| `SectionHeader` | Número badge + título con italic + CTA link | — |
| `Chip` | Pill tag clickable con hover border black | default / pressed |
| `ChipRow` | Contenedor horizontal de chips | — |
| `TopBar` | Nav fijo 72px con wordmark + links + acciones | — |
| `Footer` | 4 columnas: brand / explorar / negocios / empresa | — |
| `DashboardShell` | Sidebar 240px + contenido + tabs | usuario / negocio |
| `StatsStrip` | 3 métricas con separadores verticales | — |
| `PullQuote` | Blockquote Fraunces italic full-width | — |
| `RatingRow` | ★ + número + conteo + estado abierto/cerrado | — |
| `PlaceholderStripe` | Imagen placeholder con patrón diagonal | — |

---

## Íconos

Set inline SVG, stroke 1.5px, currentColor.

**UI:** search, pin, star/starF, heart/heartF, user, arrowR, arrowUR, arrowD, chev, close, menu, clock, phone, web, share, grid, map, filter, check, plus, sun, moon, sparkle

**Categorías:** catRest, catBar, catCafe, catMus, catPark, catEvt, catNoct, catOut

---

## Branding

- **Nombre:** Portal Panorama
- **Wordmark:** "Portal" + "Panorama" (italic, accent-60) en Fraunces 24px/500
- **Subtítulo:** "Santiago, CL" en Geist Mono pequeño
- **Mark:** punto circular 10px accent-60 antes del wordmark
- **Tono:** Editorial, minimal cálido. Sin gradientes, sin oro. Lo premium se señala con tipografía y el notch geométrico.

---

## Discrepancias Handoff vs Brief

1. **"Planes para ti"** — El handoff muestra planes para usuarios consumidores (Plus/Pro). El brief solo menciona listings premium para negocios. **Resolución:** Solo negocios pagan (ver OPEN_QUESTIONS Q1 ✅).

2. **"Mi feed"** — El dashboard de usuario muestra un tab de timeline de updates. El brief no lo menciona. **Estado:** Pendiente (ver OPEN_QUESTIONS Q2).

3. **Formulario de creación de listing** — El handoff no muestra el flujo completo de crear/editar un listing. Solo existe el "shell" de dashboard de negocio. **Acción:** Diseñar el formulario respetando los tokens del handoff.

4. **Mapa en ficha de lugar** — El handoff tiene un stub de Leaflet pero el README dice que no está completamente diseñado. **Recomendación:** Dirección en texto para MVP (ver OPEN_QUESTIONS Q16).

5. **Flujo de reclamar listing** — No aparece en el handoff. **Acción:** Diseñar flujo desde cero respetando los componentes existentes (ver OPEN_QUESTIONS Q6).

6. **Panel admin/backoffice** — No aparece en el handoff. **Resuelto:** Sí está en scope MVP. Ruta `/admin` protegida por rol ADMIN para gestión de claims pendientes (aprobar/rechazar). Ver OPEN_QUESTIONS Q14.

---

## Lo que NO se porta del handoff

- El HTML estático como código de producción. Es un mockup de referencia.
- El tweaks panel (herramienta de prototipo, no producto).
- La arquitectura hash-router del SPA de referencia.
- Los datos hardcodeados de `data.js` (se reemplazan con datos reales de BD).
