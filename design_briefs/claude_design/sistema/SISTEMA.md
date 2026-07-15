# Portal Panorama — Sistema de diseño (entregado por Claude Design)

Referencia congelada del sistema que devolvió Claude Design (proyecto "Portal Panorama audit",
`ed1f20fb-5a11-4e47-9b45-9519e27ed842`). Los **tokens ya viven en `src/app/globals.css`**; este doc
guarda las decisiones y el `components.css` (`./components.css`) como contrato para las etapas 2 y 3.

## Las siete decisiones que ordenan todo

1. **La acción es negra.** `--action` (tinta) es el único botón primario — gana el negro (48 usos
   en el código vs 3 del naranjo). El naranjo **nunca** vuelve a ser botón.
2. **El naranjo atardecer = marca + "esto está elegido".** Chip activo, filtro aplicado, tab activa,
   corazón guardado. Si algo es naranjo, o es el logo o es algo que el usuario eligió.
3. **Los links son tinta subrayada** (subrayado naranjo tenue). Dejan de competir con los CTA.
4. **Las capas se separan con luz, no con bordes:** fondo `#F2ECE1` / tarjeta `#FFFDF8` / elevado
   `#FFFFFF` + sombra. ΔL ≈ 5 pts; los bordes de 1px pasan a ser refuerzo.
5. **Relieve = tocable, plano = se lee.** Pill con sombra → control interactivo. Rectángulo plano
   teñido (radio 6) → tag informativo. Texto suelto → dato estático.
6. **Las 6 capas de tags son familias de matiz** con L/C idéntico (no arcoíris): con quién =
   terracota · ocasión = ciruela · ambiente = salvia · qué ofrece = ocre · servicios = piedra azul ·
   específicos = neutro. Cada tag lleva el punto (●) de su capa.
7. **Fraunces baja del pedestal y el mono se disciplina.** Fraunces titula secciones, nombra lugares
   y presta cifras (KPI). Geist Mono queda SOLO para datos duros (horario, precio, teléfono,
   contadores) con piso 12px. El label por defecto es el eyebrow sans 12px/650/caps.

## Fundamentos

- **Fotos:** reales y de calidad dispareja → siempre **enmarcadas dentro de la tarjeta** (inset con
  padding y radio 10), con la info de decisión fuera de la foto. Sobre la foto solo el corazón.
- **Metro:** el color oficial de línea vive en un **punto de 7px** junto al código en mono (`● L1`),
  nunca en un círculo lleno saturado.
- **Iconos:** Lucide (stroke 1.75, 16–20px). Sin emoji. El logo es tipográfico (punto naranjo +
  `Portal` sans 700 + `Panorama` Fraunces itálica).
- **Overlays:** SIEMPRE por portal al `<body>` (restricción del repo). `padding-block` en clases que
  se combinan con `.container`.

## Estado de implementación (etapas)

- **Etapa 1 — Fundación (✅ s34):** tokens nuevos + Instrument Sans/Fraunces/Geist Mono con `next/font`
  + capa de alias (nombres viejos → tokens nuevos) en `globals.css`. Toda la app repinta. Botón unificado
  a tinta (`.btn--primary`/`.btn--accent`/`.searchbar__btn`). **El markup NO se tocó.**
- **Etapa 2 — Tarjeta con contexto social (⬜):** `PlaceCard` muestra tags por capa (`en pareja`,
  `tranquilo`) + score. Toca datos: sumar tags al read model `PlaceCardView` y a las ~6 consultas que lo
  arman. Metro pasa a punto de 7px (matar `metro-badge` círculo lleno). Foto enmarcada (inset).
- **Etapa 3 — Barrido pantalla por pantalla (⬜):** ficha con las 6 capas agrupadas y el eyebrow sans;
  explorar; home (matar el mono-10px label); auth; paneles; admin. Alinear markup ↔ `components.css`.

## Nombres de clase: OJO

`components.css` usa los nombres del HTML de demo del sistema (`place-card__img`, `place-card__heart`,
`place-card__kicker`, `place-card__tags`, `place-card__meta` como fila de rating/precio/metro). Los
`.tsx` actuales emiten otros (`place-card__media`, `place-card__link`, `place-card__foot`, `metro-badge`,
`place-card__rating`). Al migrar cada componente hay que **alinear el markup con estas reglas**, no
copiar el CSS a ciegas.
