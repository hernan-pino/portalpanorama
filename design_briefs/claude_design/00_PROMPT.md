# Prompts para Claude Design

Claude Design **no puede entrar a un link** — solo ve lo que le subas. Por eso el paquete son
capturas + documentos. Un buen prompt para él tiene 4 partes: **objetivo · layout · contenido ·
audiencia**, y funciona mejor **por partes que todo de una vez**.

---

## Paso 0 — Qué subir (en este orden)

1. **`01_BRIEF.md`**, **`02_INVENTARIO_PANTALLAS.md`**, **`03_SISTEMA_ACTUAL.md`**.
2. Las capturas de **`capturas/movil/`** (son las que mandan: el producto es mobile-first).
3. Las de **`capturas/desktop/`** si el chat aguanta; si no, sube solo las de las pantallas
   críticas: `01-home`, `02-explorar`, `05-ficha-lugar`, `10-para-negocios`, `30-panel-negocio`,
   `41-admin-lugares`.

---

## Prompt 1 — Auditoría (antes de diseñar nada)

> Te estoy pasando el producto completo: un directorio de panoramas de Santiago de Chile llamado
> **Portal Panorama**, en producción, mobile-first. En los tres documentos está el brief, el
> inventario de las 35 pantallas y el sistema de tokens que existe hoy. Las capturas son de las
> pantallas reales, en celular (390px) y en desktop (1440px).
>
> **Antes de proponer nada, quiero tu auditoría.** Mírate sobre todo `01-home`, `02-explorar` y
> `05-ficha-lugar`, que son el 90% del uso.
>
> Dime, concretamente:
> 1. **Jerarquía visual:** ¿qué mira el ojo primero en cada pantalla, y qué debería mirar? El dueño
>    dice que "la jerarquía de color cansa la vista" — quiero que verifiques si tiene razón y por qué.
> 2. **Color:** hoy hay un solo acento (naranjo atardecer) haciendo de CTA, link, chip activo y badge.
>    ¿Dónde se pierde el llamado a la acción?
> 3. **Densidad y respiro:** ¿dónde falta y dónde sobra?
> 4. **La tarjeta de lugar** (se repite decenas de veces): ¿qué información se lee primero y cuál se
>    pierde?
> 5. **Los tags:** hay 6 capas distintas (con quién voy · ocasión · ambiente · qué ofrece · servicios ·
>    específicos) y hoy se ven todos iguales. Esa estructura ES el diferenciador del producto.
>
> No propongas soluciones todavía. Solo el diagnóstico.

## Prompt 2 — El sistema (el entregable importante)

> Ahora sí: **diséñame el sistema de diseño**, no pantallas sueltas.
>
> **Objetivo:** que el producto se sienta editorial, cálido y chileno, y que el usuario pueda decidir
> rápido desde el celular. Más color y más tipografía que hoy, **pero con cada color y cada peso
> haciendo un trabajo asignado** — el problema actual es que todo pesa lo mismo.
>
> **Audiencia:** "el organizador" — el que arma los planes del grupo, mediados de los 20, plata justa,
> decide en el celular mientras el grupo de WhatsApp espera. Buscar lo cansa.
>
> **Entrégame:**
> 1. **Paleta** con capas de superficie que de verdad se distingan (fondo / tarjeta / elevado), un
>    color de acción separado del resto, y los semánticos. Contraste AA como piso.
> 2. **Escala tipográfica** que use la serif de display más allá del título gigante, con jerarquía
>    real dentro de una tarjeta y de una ficha.
> 3. **Un sistema de color para las 6 capas de tags**, que se lean como familias distintas sin
>    convertirse en un arcoíris.
> 4. **Los componentes núcleo**, con variantes y estados (hover, foco, activo, cargando, vacío,
>    error): botón, **tarjeta de lugar**, chip/tag, filtro, campo de formulario, barra de búsqueda,
>    header, modal, toast, badge de estado, tabla densa.
>
> **Restricciones:** mobile-first (diseña el 390px primero) · modo claro solamente · las fotos son las
> que ya existen, de calidad dispareja · se implementa como **variables CSS + componentes React**, sin
> librerías de UI pesadas · los flujos y la navegación actuales no se tocan.
>
> Muéstrame los tokens como variables CSS.

## Prompt 3 — Las pantallas (una por una, no todas juntas)

Con el sistema ya aprobado, pídele **de a una**, en este orden:

> Aplica el sistema a la **ficha de lugar** (captura `05-ficha-lugar`). Es la pantalla que cierra la
> decisión: galería, nombre, categoría, rating de Google, guardar / cómo llegar, descripción, los tags
> por capa, datos prácticos (precio, horario, reserva, medios de pago, servicios), contacto y
> similares. Móvil primero.

Después: **Explorar** (`02` + `03`: grilla + filtros + chips activos) → **Home** (`01`) → **Modal de
guardar** (`23`) → **Panel del negocio** (`30`) → **Para negocios** (`10`).

---

## Cómo darle feedback (según la propia doc de Claude Design)

Funciona mucho mejor lo específico y medible que lo general:

- ✅ "Aprieta el espaciado entre la tarjeta y el título a 8px."
- ✅ "El chip de 'con quién voy' tiene que leerse distinto al de 'servicios'."
- ❌ "No me gusta cómo se ve."

---

## Y cuando esté listo: el camino de vuelta al código

No hay que copiar nada a mano. Desde Claude Code puedo **leer directamente tu proyecto de Claude
Design** (herramienta `DesignSync`) y traducir los tokens y componentes al repo. Al terminar, dime
"trae el diseño de Claude Design" y lo bajo.
