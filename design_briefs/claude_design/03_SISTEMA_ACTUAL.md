# Sistema actual — qué hay hoy y cómo se implementa

Para que el diseño nuevo sea **implementable** y no una maqueta bonita imposible de aterrizar.

---

## 1. Cómo está construido

- **Next.js 15 (App Router) + React + TypeScript.** Server components por defecto.
- **CSS plano con variables** en un único archivo: `src/app/globals.css` — **3.049 líneas, 630 clases,
  187 bloques BEM**. Tailwind está importado pero casi no se usa: la UI se escribió con clases BEM
  (`.place-card__title`, `.ficha__hero`, `.biz-cta`…).
- **Solo 21 componentes React.** El resto de la UI vive dentro de las páginas. **No existe una
  librería de componentes**: los botones y las tarjetas se rehicieron varias veces con nombres
  distintos por pantalla. Esto es exactamente lo que se quiere arreglar.
- **No se quiere agregar una librería de UI pesada** (nada de MUI/Chakra). El destino natural del
  rediseño es: **tokens CSS nuevos + un set chico de componentes React bien hechos**.

> **Lo ideal que devuelva Claude Design:** los tokens (como variables CSS) + los componentes núcleo
> especificados con sus variantes y estados. Con eso, la implementación en el repo es un trabajo de
> reemplazo ordenado, no una reescritura.

---

## 2. Los tokens que existen hoy

### Color

```css
/* Neutrales — "papel crema cálido" */
--paper-00: #FBF8F2;   /* superficie elevada (tarjetas)  */
--paper-05: #F6F2EA;
--paper-10: #EFEAE0;   /* fondo hundido */
--paper-20: #E4DDCF;   /* línea suave */
--paper-30: #C9C0AE;   /* línea */
--paper-40: #9A9282;   /* texto sutil */
--paper-50: #6B6557;   /* texto atenuado */

--ink-90:  #2A2622;
--ink-95:  #1C1916;
--ink-100: #14110F;    /* texto principal */

/* Acento — "atardecer" (el único acento del producto) */
--accent-soft: oklch(0.92 0.04 45);
--accent-50:   oklch(0.78 0.10 45);
--accent-60:   oklch(0.62 0.16 45);   /* ← el acento en uso */
--accent-70:   oklch(0.52 0.17 38);   /* hover */
--accent-80:   oklch(0.42 0.14 32);

/* Rating (estrellas de Google) — deliberadamente NO es el acento, para no competir con los CTA */
--star: oklch(0.748 0.128 74);

/* Semánticos */
--success: oklch(0.58 0.12 155);
--warning: oklch(0.72 0.14 75);
--error:   oklch(0.55 0.20 25);
--info:    oklch(0.55 0.10 230);

/* Alias en uso */
--bg: #f4f4f4;              /* fondo de la página */
--bg-raised: var(--paper-00);
--bg-sunken: var(--paper-10);
--fg: var(--ink-100);
--fg-muted: var(--paper-50);
--fg-subtle: var(--paper-40);
--accent: var(--accent-60);
```

**El problema en una frase:** `--bg`, `--bg-raised` y `--bg-sunken` están tan cerca entre sí que las
capas no se distinguen, y **un solo acento** hace de CTA, link, chip activo y badge a la vez.

### Tipografía

```css
--font-display: Fraunces;      /* serif variable — títulos */
--font-sans:    Inter Tight;   /* toda la interfaz */
--font-mono:    Geist Mono;    /* etiquetas, metadatos */

/* Escala display */
--t-display-xl: clamp(56px, 9vw, 132px);
--t-display-lg: clamp(44px, 6vw, 88px);
--t-display-md: clamp(36px, 4.5vw, 64px);
--t-display-sm: clamp(28px, 3vw, 44px);

/* Escala UI */
--t-h1: 32px;  --t-h2: 24px;  --t-h3: 19px;  --t-h4: 16px;
--t-body: 15px;  --t-body-sm: 13px;
--t-mono: 12px;  --t-mono-sm: 11px;  --t-tiny: 10px;
```

Las tres fuentes son **cambiables** si el rediseño lo pide (se cargan con `next/font`). Fraunces
está hoy subutilizada.

### Espaciado, radios, sombras, motion

```css
/* Espaciado: escala de 4px */
--s-1: 4px … --s-32: 128px

/* Radios */
--r-xs: 2px  --r-sm: 4px  --r-md: 8px  --r-lg: 12px  --r-xl: 20px  --r-pill: 999px

/* Sombras */
--shadow-1: 0 1px 0 rgba(20,17,15,.04);
--shadow-2: 0 1px 2px rgba(20,17,15,.05), 0 0 0 1px rgba(20,17,15,.04);
--shadow-3: 0 8px 24px -8px rgba(20,17,15,.18), 0 0 0 1px rgba(20,17,15,.06);
--shadow-pop: 0 24px 48px -16px rgba(20,17,15,.25);

/* Motion */
--ease-out: cubic-bezier(.2,.7,.2,1);
--d-fast: 140ms;  --d-normal: 220ms;  --d-slow: 360ms;

/* Layout */
--content-max: 1440px;
--content-pad: clamp(20px, 4vw, 56px);
```

**Breakpoints en uso:** el CSS tiene 21 media queries, principalmente en **960px** (donde el header
desktop se cambia por el menú móvil) y **640px**.

---

## 3. ⚠️ Restricciones técnicas que el diseño DEBE respetar

Aprendidas a los golpes; romperlas ya costó tres sesiones de bugs.

### a) Todo overlay se monta en el `<body>`
El header tiene `backdrop-filter`, y las tarjetas tienen `transform`/`filter`. Cualquier ancestro con
esas propiedades **se vuelve el containing block de sus hijos `position: fixed`** → un modal o menú
que cuelgue de ellos **queda atrapado y recortado** dentro de la tarjeta o del header.

**Regla:** modales, menús y popovers van con `createPortal` al `<body>`. Si el diseño propone
overlays, popovers anclados o tooltips, tienen que sobrevivir a esto.

### b) Nada de popovers colgando de una barra fija inferior
Un popover anclado a un botón de la barra fija de móvil se dibuja **fuera de la pantalla**. Por eso
hoy los tres puntos de entrada de "guardar" abren **un mismo modal centrado**. Si el diseño quiere
volver a un popover anclado, tiene que resolver este caso.

### c) `padding-block`, no `padding`, en clases que se combinan con `.container`
`.container` aporta el `padding-inline` lateral. Una clase que además use el shorthand
`padding: X 0` **lo pisa** y el contenido queda pegado a los bordes en celular.

### d) Las fotos son las que hay
Fotos reales de los lugares, de calidad dispareja (algunas con marca de agua de Google, otras
oscuras o mal encuadradas). **El sistema tiene que verse bien con fotos imperfectas** — nada de
diseños que dependan de fotografía impecable de catálogo.

### e) Modo claro solamente
El modo oscuro no está construido y no es prioridad. No hace falta diseñarlo (pero si los tokens lo
dejan posible, mejor).

---

## 4. Densidad real de las pantallas (para dimensionar bien)

- **Explorar** muestra **decenas de tarjetas** de lugar en scroll + un panel de filtros con ~6
  grupos de facetas. En móvil, todo eso tiene que caber sin ahogar.
- Una **ficha** típica trae: galería de 3-10 fotos, ~15 tags repartidos en 6 capas, 8 bloques de
  datos prácticos, contacto, y un carrusel de similares. Ver la captura `05-ficha-lugar`.
- El **formulario de admin** de un lugar tiene decenas de campos. Es denso a propósito.
