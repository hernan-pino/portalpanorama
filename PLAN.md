# PLAN — Portal Panorama (plan vivo)

**La fuente de verdad del trabajo desde hoy.** Estado actual, lo que falta para lanzar, y el backlog
priorizado. Se actualiza cada vez que avanzamos. Liviano a propósito — para retomar rápido.

- **Qué es el producto / por qué (norte permanente):** [PRD.md](PRD.md) · **Estrategia post-MVP:** [STRATEGY.md](STRATEGY.md)
- **Modelo de datos:** [SCHEMA.md](SCHEMA.md) · **Capas:** [ARCHITECTURE.md](ARCHITECTURE.md) · **Marca:** [BRAND_SPEC.md](BRAND_SPEC.md) · **Cuenta de negocio + reclamo (✅ scope MVP decidido s28, por construir):** [BUSINESS_ACCOUNTS_SPEC.md](BUSINESS_ACCOUNTS_SPEC.md)
- **Bitácora del rediseño (historia + razonamiento de las decisiones):** [PLAN_FASE9.md](PLAN_FASE9.md) · **Histórico (docs superados):** [docs/historico/](docs/historico/)

---

## ▶️ RETOMAR AQUÍ — s35 (2026-07-14): rediseño ETAPAS 1 y 2 HECHAS en local

**✅ ETAPA 2 — La tarjeta de lugar, rediseñada (esta sesión, con OK del usuario a la etapa 1).**
`PlaceCard` reescrito al spec del sistema: **foto enmarcada** (inset, la foto chillona ya no gana),
**rating de Google bajado de la foto a la fila de datos**, **metro como punto de 7px** (murió el
`metro-badge` círculo lleno). Primitivos sembrados en `globals.css`: `.eyebrow`, `.rating*`, `.metro__dot`,
`.price*`. Ambas variantes (grid/list) funcionan; **fix** al paso: en `list` el corazón tapaba el kicker →
`padding-right` que le reserva el espacio.

**↩️ Los tags de contexto en la tarjeta se PROBARON y se DESCARTARON (decisión del usuario, mismo día).**
Llegué a mostrar hasta 2 tags con punto de capa en la grilla (era "el diferenciador visible sin entrar a
la ficha") y el usuario, al verlo, **se arrepintió: recargaban la tarjeta**. Revertido de raíz: se quitó
`contextTags` del read model `PlaceCardView`, el join de tags del select compartido `placeCardView.ts`, el
override de `findRelated`, el markup del componente y las 6 familias de tag del CSS. **Los `--tag-*` tokens
quedan en `:root`** por si la ficha (etapa 3) los quiere. **Lección para etapa 3:** el usuario no quiere la
tarjeta más densa — cuidado al agregarle cosas.

- **✅ Verificado (tras la reversión):** typecheck + lint + **`next build` OK** · **158 tests verdes** ·
  navegador iPhone 13: la tarjeta queda limpia (foto enmarcada + corazón · kicker · nombre Fraunces · fila
  `★ 5.0 (4.480) · $$$ · ● L6`).

**▶️ PRÓXIMO PASO (s36):** **revisión visual del usuario** de la etapa 2 ya sin tags (con OK antes de
seguir). Luego **etapa 3 — barrido pantalla por pantalla**: la **ficha** (sus `.chip` grises → familias de
tag agrupadas, si el usuario las quiere ahí; ojo: acaba de rechazarlas en la tarjeta), home (matar el
`filtra por contexto` en mono-10px), auth, paneles y admin. **Nada pusheado aún** — el push del rediseño
(que arrastra el fix de imágenes parqueado) va cuando el usuario lo apruebe.

---

## Etapa 1 — Fundación (s35): tokens + fuentes + botón unificado

**El sistema de Claude Design ya está bajado y aplicado a la app.** Lo bajé con `DesignSync` del
proyecto **"Portal Panorama audit"** (`ed1f20fb-5a11-4e47-9b45-9519e27ed842`): 5 archivos de tokens +
`components.css` + readme con **7 decisiones**. Guardado en repo como referencia: **`design_briefs/claude_design/sistema/`**
(`SISTEMA.md` + `components.css`). **Todo en LOCAL, sin pushear.**

**Alcance del rediseño acordado (s35):** el usuario dejó la profundidad a mi criterio → **mini rebrand
con el sistema abierto**: Claude Design propuso paleta/tipografía/componentes libres, pero aterrizados
como **cambio de tokens + capa de compatibilidad**, no reescritura de las 3.049 líneas. Plan en 3 etapas
(ver `sistema/SISTEMA.md`): **1 Fundación** ✅ · **2 Tarjeta con contexto social** ⬜ · **3 Barrido
pantalla por pantalla** ⬜.

**✅ ETAPA 1 — Fundación (esta sesión):**
- **Tokens nuevos en `globals.css`** (superficies por luz no por bordes · acción=tinta · naranjo=marca/
  selección con trabajo exclusivo · 6 familias de tag · metro demovido a punto · radios/sombras cálidos)
  **+ una capa de ALIAS** (nombres viejos `--bg`/`--fg`/`--accent`/`--paper-*`/`--ink-*` → tokens nuevos):
  **las ~590 clases que aún no migro repintan solas**, sin tocar markup.
- **Fuentes con `next/font`:** Inter Tight → **Instrument Sans** (mantuve la variable `--font-inter-tight`
  como alias) · **Geist Mono** ahora se carga de verdad (antes era fallback string) · Fraunces sigue.
- **Botón unificado a tinta** (lo único que el reskin no arregla solo, decisión #1): `.btn--primary`,
  `.btn--accent` (alias) y `.searchbar__btn` dejan de ser naranjos. **El "Guardar" de la ficha y el
  "Buscar" de la home ya son negros.**
- **NO se tocó ningún `.tsx` de markup** (salvo `layout.tsx` por las fuentes). Lo que necesita estructura
  nueva —tags en la tarjeta, puntos de capa en la ficha, metro como punto— es **etapa 2/3** a propósito.
- **✅ Verificado:** typecheck + lint + **`next build` OK** (dev server abajo) · **navegador headless
  iPhone 13**: home/explorar/ficha repintadas, superficies se separan, botones en tinta, Fraunces titula,
  naranjo calmado. Sin tests nuevos (cambio solo visual). ⚠️ Pendiente natural de etapa 2/3 y visible en
  las capturas: los tags siguen grises idénticos (necesitan las 6 familias + markup) y el metro sigue
  como círculo lleno.

**▶️ PRÓXIMO PASO (s36):** **revisión visual del usuario** de la etapa 1 en las 3 pantallas núcleo (con su
OK antes de seguir). Después, **etapa 2 — la tarjeta con contexto social**: sumar tags por capa + score al
read model `PlaceCardView` y a las ~6 consultas que lo arman, foto enmarcada, y metro como punto de 7px.
**Ojo: nada de esto está pusheado** — el push a prod del rediseño va cuando el usuario lo apruebe, y
arrastra el fix de imágenes parqueado (ver "Pendientes operativos").

---

## Cierre s34 (2026-07-13): el paquete para Claude Design, subido y con auditoría de vuelta

**El punto 2 del orden acordado (sistema de diseño) quedó armado.** Vive en
**[design_briefs/claude_design/](design_briefs/claude_design/)**.

**🔎 El hallazgo que define el formato del paquete: Claude Design NO puede navegar a un link** (dice
textual su doc: *"Claude Design cannot browse live URLs"*). Solo ve lo que se le sube: **capturas,
codebase (repo o `/design-sync`) y documentos**. O sea, "que vea la página" = **hay que fotografiarla**.
Su prompt rinde más si trae **objetivo · layout · contenido · audiencia**, y **por partes** (auditoría →
sistema → pantalla por pantalla) en vez de todo de una.

**📦 Qué contiene el paquete:**
- **`00_PROMPT.md`** — los 3 prompts listos para pegar, en orden, + cómo darle feedback.
- **`01_BRIEF.md`** — el producto, **"el organizador"** (el usuario ideal), el tono chileno, el
  diagnóstico del problema (5 puntos) y qué se espera de vuelta.
- **`02_INVENTARIO_PANTALLAS.md`** — las **35 pantallas** priorizadas 🔴/🟡/⚪, los 4 flujos y los 10
  componentes que se repiten.
- **`03_SISTEMA_ACTUAL.md`** — todos los tokens de hoy + **las restricciones técnicas que el diseño debe
  respetar** (los 2 gotchas de CSS de la s32/s33, fotos imperfectas, solo modo claro).
- **`capturas/`** — **74 capturas** (37 pantallas × móvil 390px y desktop 1440px), de página completa,
  con la BD real (384 lugares), en los **4 estados de sesión**. Móvil primero (mobile-first).

**🧭 Alcance acordado con el usuario: mini rebrand con el sistema abierto** — Claude Design propone
libremente **paleta, uso de color y escala tipográfica** (lo que al usuario le molesta), pero **atado al
inventario de componentes y a los nombres de tokens existentes**, para que implementarlo sea un cambio de
tokens + arreglos puntuales y no reescribir las 3.049 líneas de `globals.css`.

**🔁 El camino de vuelta existe (importante):** la herramienta **`DesignSync`** de Claude Code puede
**leer y escribir el proyecto de Claude Design**. Cuando el usuario termine de diseñar, **no hay que
copiar nada a mano**: se bajan los tokens/componentes y se traducen al repo.

**🛠️ Reproducible:** `scripts/design-shots-setup.ts` (siembra cuentas de prueba) ·
`scripts/design-shots.ts` (las 74 capturas, `--solo=05,23` para algunas) ·
`scripts/design-shots-compress.ts` (PNG → JPEG: **90 MB → 19 MB**, si no es inviable subirlas).
Las capturas quedaron **fuera de git** (regenerables). **BD local devuelta a su estado** (2 cuentas de
prueba borradas, `ownerId` de Osaka de vuelta a null: 384 lugares · 4 usuarios · 0 owned · 0 profiles).

⚠️ **Gotcha nuevo (costó una tanda de 74 capturas):** en el form de login, el primer
`button[type=submit]` es el de **Google** (va arriba, es el método preferido). Un script que lo clickee
se va a `accounts.google.com` y **todas las capturas con sesión salen como pantalla de login**. Hay que
apuntar a "Ingresar con email".

**▶️ PRÓXIMO PASO (s35):** el usuario sube el paquete a **claude.ai/design** y corre el Prompt 1
(auditoría) → Prompt 2 (el sistema) → Prompt 3 (pantalla por pantalla, empezando por la ficha). Cuando
tenga el sistema, decir **"trae el diseño de Claude Design"** y se baja con `DesignSync` para
implementarlo (eso es la s36 = punto 3 del orden acordado).

---

## Cierre s33 (2026-07-13): el modal de guardar, unificado (EN PROD)

**✅ Commiteado y pusheado** (`7a7e56c`) → deploy de Vercel. Sin migraciones: el diff es solo código + CSS.

**La s32 SÍ está en prod.** Se verificó en vivo (el CSS de prod ya trae `.biz-hero{…padding-block…}`): el push
`db8329f` se hizo y el deploy quedó Ready. El plan decía "falta pushear" — estaba desactualizado, ya no.

**✅ Revisión visual del usuario de los 6 fixes de la s32:** puntos **1 a 4 OK**. Salieron **3 hallazgos nuevos**,
los tres ya arreglados en esta sesión:

1. **🟡 El menú del admin en celular se cortaba.** Los links (Lugares · Nuevo · Marcas · Tags · Usuarios ·
   **Reclamos**) no caben y `.admin-nav__links` no scrolleaba → **no se llegaba a Reclamos**. **Fix:** fila
   deslizable con el dedo (`overflow-x:auto` + `nowrap`), mismo patrón que el panel del dueño. *Nota del usuario:
   el admin en celular no es prioridad, siempre lo usa en el PC.*
2. **🔴 El modal de guardar quedaba atrapado dentro de la tarjeta.** El corazón renderizaba
   `.save-modal__scrim` (`position: fixed`) **dentro del DOM de la tarjeta**: al haber un ancestro con
   `transform`/`filter`/`contain`, ese ancestro se vuelve el containing block y el modal se recortaba dentro del
   carrusel ("lo mejor valorado"). **Es el mismo gotcha del `backdrop-filter` del header (s32).**
3. **🔴 La barra fija de abajo abría el menú fuera de pantalla.** El popover de la ficha era
   `position:absolute; top:calc(100% + 8px)` → colgado del botón pegado al borde inferior, se dibujaba **abajo,
   fuera de la vista**. Y **sin sesión el botón "Guardar" de la ficha mandaba derecho al login**, sin avisar por qué
   (el corazón sí mostraba popup — incoherente).

**🧩 Decisión del usuario: UN SOLO modal centrado para todo.** Los tres puntos de entrada (corazón de la tarjeta ·
botón de la ficha · barra fija de móvil) abren ahora el **mismo modal centrado con el fondo oscurecido**, en los dos
estados (anónimo → invitación a entrar/registrarse conservando el lugar; con sesión → sus listas). Implementado como
**`src/components/place/SaveModal.tsx`**, montado en `<body>` con **`createPortal`** (lo que mata el problema de
raíz), con cierre por Escape/click afuera/botón ×, y bloqueo del scroll de fondo. `SaveHeart` y `SaveButton` quedaron
como disparadores delgados. **Se borró el popover `.ficha__pop`** (CSS muerto).

**✅ Verificado:** typecheck + lint OK · **158 tests verdes** · **navegador headless en iPhone 13**, sin sesión y con
sesión (usuario registrado por la UI): los 3 puntos de entrada abren el modal **montado en `body`, cubriendo el
viewport y centrado**, la ficha anónima **ya no redirige**, guardar actualiza el botón ("Guardado en Favoritos") + el
toast + el check "✓ guardado" · cero errores de consola · **`next build` OK** (con el dev server abajo) ·
`architecture-guardian` sin violaciones de capas · **BD local devuelta a su estado** (los 4 usuarios de prueba
borrados por id exacto; quedan los 4 originales).

**⚠️ Gotcha reincidente (ya son 3 veces): el `position: fixed` atrapado.** Le pasó al menú móvil (s32, por el
`backdrop-filter` del header) y ahora al modal de guardar (s33, por la tarjeta). **Regla: todo overlay va montado en
`<body>` con `createPortal`, nunca colgando del componente que lo dispara.** Anotarlo en los constraints del rediseño.

**▶️ PRÓXIMO PASO (s34):** el **punto 2 del orden acordado — sistema de diseño + brief para Claude Design**:
auditoría del estado actual (jerarquía de color/contraste/densidad), inventario de TODAS las pantallas y flujos, y los
tokens/constraints que el diseño nuevo debe respetar (incluidos los 2 gotchas de CSS de arriba).

---

## Cierre s32 (2026-07-13): barrido de flujos HECHO, 6 hoyos arreglados

**Se hizo el punto 1 del orden acordado: el barrido de flujos en los 4 estados** (sin sesión · usuario común ·
dueño con ficha · admin), recorriendo cada ruta y cada CTA con sesiones HTTP reales + **navegador headless en
viewport de celular** (Playwright, iPhone 13). **Cero links muertos en el sitio público** y los guards de ruta
salieron todos correctos. Pero aparecieron **6 hoyos, 2 de ellos en el camino feliz de lo que ya está en prod**:

1. **🔴 `/admin/reclamos` daba 404 en el camino feliz.** La bandeja linkeaba siempre a `/lugar/{slug}`, pero
   **toda ficha que entra por "Publica tu negocio" nace `PENDING_REVIEW`** y no tiene página pública → el admin
   abría la solicitud, hacía clic en el negocio y se estrellaba. Mismo bug que ya se había arreglado en el panel
   del dueño (el "Ver ↗"), pero seguía vivo acá. **Fix:** el nombre lleva a `/admin/lugares/{id}` (donde el admin
   realmente trabaja la ficha) y "Ver ficha pública ↗" solo aparece si existe; si no, dice "Ficha en revisión".
   Se agregaron `targetId` + `targetIsPublic` a `ClaimAdminRow`.
2. **🔴 En móvil NO existía el lado negocio.** Bajo 960px `.topbar__auth` se oculta (ahí viven el CTA
   **"Publica tu negocio"** y el link **"Mi negocio"**) y el `MobileNav` no los reemplazaba → el CTA que es el eje
   de la s31 **era invisible en celular**, y el dueño no tenía acceso a su panel. El admin, de paso, no tenía
   "Mi cuenta". **Fix:** el menú móvil ahora espeja el header desktop en los 4 estados.
3. **🟡 El reclamo no validaba nada antes de mostrar el form.** `/reclamar/[slug]` y `/reclamar-marca/[slug]`
   renderizaban el formulario aunque la ficha ya tuviera dueño, aunque la abriera **el propio dueño**, o aunque ya
   hubieras mandado una solicitud: el error llegaba **recién al enviar**, con todo lleno. Y el CTA "¿Este negocio
   es tuyo?" **se le mostraba al dueño en su propia ficha**. **Fix:** `GetClaimEligibilityUseCase`
   (`FREE | OWNED_BY_YOU | OWNED_BY_OTHER | PENDING_YOURS | MISSING`, port nuevo `targetOwnership`) + componente
   `ClaimUnavailable` con salida propia por caso; el CTA de la ficha/marca ahora muestra "Esta ficha es tuya →
   Editar" al dueño, "Tu solicitud está en revisión" a quien la mandó, y **nada** si otro ya la reclamó.
4. **🟡 Guardar sin sesión perdía el lugar.** El modal del corazón y el botón "Guardar" de la ficha mandaban a
   `/login` y `/registro` **sin `callbackUrl`** → volvías a `/explorar?ingreso=1` y **el lugar nunca quedaba
   guardado** (la acción de conversión principal del consumidor). **Fix:** ambos preservan la URL de origen.
5. **🔴 (solo visible en celular) El menú móvil estaba roto de fondo.** `.topbar` tiene `backdrop-filter`, lo que
   convierte al header en el **containing block de todo `position: fixed`** que cuelgue de él → el backdrop
   (`inset:0; top:72px`) quedaba con **altura 0**: no atenuaba el fondo y, peor, **no se podía cerrar el menú
   tocando fuera**. **Fix:** el menú se monta en `<body>` con `createPortal`. ⚠️ **Gotcha para el rediseño (s33):
   cualquier `fixed` que cuelgue del header queda atrapado por el `backdrop-filter`.**
6. **🟡 (solo visible en celular) El panel del dueño abría con una pila de "PRONTO".** La sidebar envolvía en 4
   filas de ítems no accionables y empujaba los datos reales (visitas, clics, la ficha) fuera de la primera
   pantalla. **Fix:** nav en una fila deslizable + la nota de ayuda se manda al final (`order`).

**✅ Verificado:** typecheck + lint + **`next build` OK** (con el dev server abajo) · **158 tests verdes** (5
nuevos del use case) · `architecture-guardian` sin violaciones de capas · **barrido móvil: 18 páginas × 4 estados,
cero scroll horizontal, cero errores JS**, menú correcto en cada estado · desktop del panel sin regresión ·
**BD local devuelta a su estado original** (las cuentas de prueba sembradas para el barrido fueron borradas).

### 🧾 Revisión de reclamos: la bandeja ahora deja DECIDIR (opción "A", pedida por el usuario en la s32)

**El problema que levantó el usuario:** *"al revisar el reclamo de crear una ficha, ¿cómo apruebo o niego sin
ver la info que llenaron?"*. Tenía razón: lo que el dueño declara (dirección · comuna · categoría/rubro ·
teléfono · IG) **se guarda en el `Place` PENDING_REVIEW, no en el `BusinessClaim`** — la bandeja solo mostraba
quién pedía. **Fix:** el botón "Revisar" ahora despliega un **panel** con (a) *Lo que declaró del negocio*
(todos los campos de la semilla + si la ficha está publicada o falta completarla), (b) *Quién lo pide*
(persona, cuenta, rol, contacto, mensaje —incluido el **rubro propuesto** si pidió uno fuera del catálogo—),
(c) una nota que fija el criterio: **"lo que estás aprobando es la IDENTIDAD, no los datos"** (que haya escrito
desde el IG oficial o el correo del local; los datos se corrigen en el editor), y (d) las acciones + "Abrir en
el editor ↗". De paso, la tabla bajó de **8 a 5 columnas** (rol/mensaje/contacto se fueron al panel): con 8 no
cabía y se leía de lado. Port: `ClaimTargetDetail` + `targetDetail` en `ClaimAdminRow`.

**📌 El flujo real del admin, escrito (no estaba en ninguna parte):**
1. Llega el badge en `/admin/reclamos` (y en `/admin/lugares` con la etiqueta "Del dueño").
2. "Revisar" → **panel con todo**: se verifica la **identidad** (DM del IG oficial o correo del local, decisión s28).
3. Se **completa la ficha**: hoy el admin le pide a Claude la skill **`ficha-lugar`** (fotos, descripción, horario,
   tags, rating) y la carga en el editor → publica. ⚠️ **Este paso es MANUAL y vive fuera de la app.**
4. Se vuelve a la bandeja y se **aprueba** → recién ahí: `ownerId` + `BusinessProfile` verificado + correo al dueño.

**⬜ ANOTADO PARA LA PRÓXIMA SESIÓN — opción "B": enriquecer la ficha desde el admin.** El usuario preguntó por
qué la ficha no se arma sola "con nuestro proceso". Hoy **la skill `ficha-lugar` no vive dentro de la app** (corre
en Claude Code). La idea: un botón **"Investigar y completar"** en la ficha pendiente. **El obstáculo real a
resolver antes de construir:** el enriquecimiento con datos de Google (`enrich-ratings`) funciona **por
`place_id`**, y **la semilla no lo trae** (el dueño no sabe qué es) → habría que **resolver el `place_id` desde
nombre + dirección**, con riesgo de emparejar el local equivocado. **Decisión tomada (s32): se pospone** — hoy no
hay ningún negocio real entrando; automatizar un flujo que todavía no ocurre es apostar a ciegas.

**🎨 Fix de la s32 al paso (`/para-negocios` en celular):** el contenido chocaba con los dos bordes de la pantalla.
Causa: `.biz-hero`, `.biz-section` y `.biz-cta` **también son `.container`**, y su shorthand `padding: X 0`
**pisaba el `padding-inline` del container** → 0px lateral. Pasados a `padding-block`. ⚠️ **Regla para el rediseño:
en una clase que se combine con `.container`, usar `padding-block`, nunca el shorthand `padding`.**

**✅ CERRADO (s33):** los 6 fixes se pushearon (`db8329f`) y **están en prod, verificados en vivo**. La revisión
visual del usuario dio OK en los puntos 1-4 y levantó 3 hallazgos nuevos → ver el bloque "RETOMAR AQUÍ" de arriba.

**⬜ Lo que el barrido NO cubrió (sigue pendiente de la lista del usuario):** reseñas desglosadas por tema (no
existe el form de reseñas) · distancia desde mi ubicación · recomendador IA del panorama completo.

---

## Plan de acción acordado (cierre s31, 2026-07-12)

**✅ CUENTAS DE NEGOCIO: EN PRODUCCIÓN.** Push `7a8f9bb..00f9069` (31 commits) → deploy **Ready** → las 2 migraciones
(`add_business_accounts` + `add_place_clicks`) corrieron en prod y **verificado en vivo**: `BusinessProfile`/`BusinessClaim`/
`PlaceClick` responden en la BD de prod, **385 lugares publicados intactos**, `/para-negocios` (2 caminos) · `/mi-negocio/nuevo`
(wizard 3 pasos) · CTA "Publica tu negocio" + buscador en el header · CTA de reclamo en las fichas, todo 200 y con el contenido
nuevo. **`hola@portalpanorama.cl` ya recibe** (ver bloque del correo abajo). El lado negocio está completo de punta a punta.

### 📋 ORDEN ACORDADO CON EL USUARIO (s31) — no cambiarlo sin OK

1. ✅ **s32 — Barrido de flujos + navegación** (HECHO 2026-07-13 — ver el bloque de arriba: 6 hoyos encontrados y
   arreglados, 2 de ellos en el camino feliz de lo que ya estaba en prod. La intuición del usuario era correcta:
   "hay más"). **Falta el push a prod con su OK.**
2. ✅ **s34 — Sistema de diseño + brief para Claude Design** (HECHO 2026-07-13 — el paquete está en
   `design_briefs/claude_design/`: 4 documentos + 74 capturas. Ver el bloque "RETOMAR AQUÍ").
   El usuario quiere un **mini rebrand**: no le gusta la
   jerarquía de color (cansa la vista), quiere más uso de color y tipografías, y **detecta bien el problema de fondo:
   NO hay sistema de diseño establecido**, solo tokens acumulados en `globals.css` — cambiarlo después será caro. Él lo
   hará con **Claude Design**; **Claude prepara el paquete**: auditoría del estado actual (jerarquía/contraste/densidad),
   inventario de TODAS las pantallas y flujos, y los tokens/constraints que el diseño nuevo debe respetar. Sin esto,
   Claude Design devuelve pantallas bonitas pero inconsistentes con lo construido.
3. **s34 — Implementar el rediseño.**
4. **Carga de lugares (en paralelo, cuando el usuario tenga las listas con place_id).** Verticales candidatas:
   cevicherías · brunch · plazas/parques · el lote "complementos de cita" (chocolaterías/florerías/plantas). Meta 500.
5. **Publicar en grupos y foros (GTM).** **DESPUÉS del rediseño** — decisión razonada: llevar gente a una UI que al
   propio dueño le cansa la vista quema la única primera impresión.
6. **Eventos.** Recién cuando haya **tracción real y orgánica** (decisión del usuario).

### ⬜ Pendientes REALES de la lista del usuario (s31)
El usuario listó 10 cosas; **6 ya estaban hechas y en vivo** (s25/s27) y no las había visto — verificadas en prod:
feedback al guardar + "✓ guardado" · selector de orden en /explorar · badge de nuevo en el admin · `/como-ordenamos`
(el score explicado en simple) · chips clickeables en la ficha · búsqueda tokenizada ("café para trabajar" matchea).
**Lo que SÍ falta:**
- **Reseñas desglosadas por tema** (atención/sabor/accesibilidad…). ⚠️ Ojo: ni siquiera existe el form de reseñas.
- **Distancia desde mi ubicación** en la tarjeta (permiso de geolocalización).
- **Recomendador IA del panorama completo** ("dónde comer helado con mi pareja" → arma el panorama). Es el NORTE del
  producto, no un quick win: hoy la búsqueda hace *matching* de frases, no *recomendación*.
- **Estacionamientos:** ya triaged (s28) → **dato de ficha, NO fichas propias**.

---

## Cuentas de negocio — bitácora (s28-s31)

**⏩ s31 (esta sesión): ETAPA 3 CONSTRUIDA — la puerta de entrada del negocio nuevo.** Ya existe el camino
para el dueño cuyo local **no está** en el directorio: `/para-negocios` → **`/mi-negocio/nuevo`** (form-semilla:
nombre · dirección · comuna · categoría+rubro · rol · teléfono o IG) → **`Place` PENDING_REVIEW** que cae en
`/admin/lugares` con badge **"Del dueño"** → el admin la optimiza con la skill `ficha-lugar` y publica. Sin
sesión, la ruta manda a `/registro?callbackUrl=/mi-negocio/nuevo` (el registro ya respetaba el callbackUrl, así
que **cero maquinaria de auth nueva**). El panel suma CTA "Publicar otro negocio", empty state con las dos
puertas, y las fichas PENDING ya no ofrecen "Ver ↗" (daba 404) sino una nota de "la estamos completando".

**🔐 DECISIÓN DE DISEÑO (s31, revierte un supuesto de la s28): la semilla NO asigna la propiedad — pasa por el
reclamo.** El `security-reviewer` encontró un **squatting real**: si la semilla grababa `ownerId = quien la
manda` (sin verificar nada), un impostor podía enviar la ficha de un local ajeno y el **dueño real quedaba sin
salida** (no podía crear —duplicado— ni reclamar —`TargetAlreadyOwnedError` porque "ya tenía dueño"). Fix
elegido por el usuario: **la ficha nace SIN dueño + un `BusinessClaim` PENDING** del remitente; la propiedad
(`ownerId` + `BusinessProfile` verificado) se asigna **solo al aprobar el reclamo** en `/admin/reclamos`. Reusa
toda la moderación ya construida (bandeja, guard anti-TOCTOU, los 3 correos) y deja que **dos reclamos compitan**
si alguien intenta squattear. Como el perfil nace al aprobar, se **borraron** el port `BusinessProfileRepository`
y su impl Prisma que se habían escrito antes. Los otros 2 hallazgos también cerrados: rate limit ahora es por
**IP (3/h) + por cuenta (5/24h)**, y `communeId` se valida contra el catálogo (`InvalidCommuneError`) en vez de
morir como error crudo de FK.

**🔁 Re-revisión del `security-reviewer`: los 3 hallazgos CERRADOS**, nada nuevo abierto. Dejó una nota menor
(carrera preexistente: dos altas simultáneas del mismo nombre pasaban ambas el chequeo de duplicado y chocaban
en el unique del slug con un P2002 crudo) → **cerrada igual**: `PrismaPlaceRepository.save` ahora traduce el
P2002 del slug a `PlaceAlreadyExistsError`, así que el caller reacciona igual que con el duplicado detectado a
tiempo (mandar a reclamar) en vez de reventar con un error de BD.

**✅ Verificado:** typecheck + lint + `next build` OK · **148 tests verdes** (3 nuevos del use case) ·
`architecture-guardian` sin violaciones de capas · **e2e contra la BD local**: semilla → Place PENDING sin dueño
+ claim PENDING ✓ · otro usuario todavía puede reclamarla (anti-squatting) ✓ · no aparece en el panel del
remitente hasta aprobar ✓ · badge del admin ✓ · al aprobar: `ownerId` + perfil **verificado** + aparece en
`/mi-negocio` ✓ · duplicado cortado ✓. Rutas contra el dev server: `/para-negocios` 200 · `/mi-negocio/nuevo`
sin sesión no renderiza el form y manda a `/registro?callbackUrl=/mi-negocio/nuevo` ✓.

**🎨 Feedback del usuario al revisar la Etapa 3 (s31) → los 4 puntos, HECHOS:**
1. **"Falta decir que nosotros la creamos pero él después corrige lo incorrecto"** → el copy lo dice ahora en la
   landing (beneficio *"Corrige lo que esté mal"* + FAQ nuevo *"¿Y si la ficha tiene datos incorrectos?"*), en el
   form-semilla y en la bienvenida del panel.
2. **`/para-negocios` "todo muy junto"** → el hero se partió: ahora hay una sección **"Empieza por acá" con los
   DOS caminos en tarjetas separadas** (*Tu local YA está → Reclama tu ficha* · *Tu local NO aparece → Publica tu
   negocio*), cada uno con su propio CTA. El hero quedó solo con el lead + la nota.
3. **"Sin sesión el botón Publicar tu negocio no sirve"** → **era el dev server**, no la ruta: yo había corrido
   `next build` con `next dev` levantado y el build le pisó los chunks de `.next/` (el sitio salía sin CSS ni JS →
   links muertos). ⚠️ **GOTCHA: nunca correr `next build` con el dev server arriba.** La ruta siempre estuvo bien
   (redirige a `/registro?callbackUrl=/mi-negocio/nuevo`), verificado.
4. **Onboarding explícito** → **Paso 1 de 2** (`/registro` detecta que viene del flujo de negocio: título *"Crea tu
   cuenta de negocio"* + indicador de paso; el registro común no se ensucia) → **Paso 2 de 2** (form-semilla) → al
   enviar **redirige al panel** (`/mi-negocio?enviada=1`) con **bienvenida**: qué acaba de pasar, qué es el panel y
   3 buenas prácticas (fotos que convierten · horario/teléfono al día · corrige lo que quedó mal). Además el panel
   ahora muestra **"En revisión"** con las solicitudes PENDING del usuario (`findPendingByClaimant` en el port +
   `pendingClaims` en el dashboard): como la ficha no es suya hasta que el admin aprueba, antes desaparecía de su
   vista y parecía que no había pasado nada. **150 tests verdes** (1 nuevo) · typecheck + lint + build OK · e2e:
   la semilla no cuenta como ficha gestionada y sí aparece en "En revisión" ✓.

**🧙 2ª ronda de feedback (s31, con refs de Claude Design tipo checkout): WIZARD EN UNA SOLA PÁGINA.** El usuario
pidió que el registro/login **no sea otra página** sino un paso del propio flujo, con stepper, y un CTA en el header
que lo dispare. Hecho: **`/mi-negocio/nuevo` es ahora un wizard de 3 pasos sin recargas** — (1) **Tu cuenta**:
login/registro **integrado** (Google arriba + email/contraseña, con toggle "ya tengo cuenta"); actions gemelas de
`/registro` y `/login` que **NO redirigen** (`signIn(..., { redirect: false })` → devuelven resultado y el wizard
avanza; `router.refresh()` para que el header vea la sesión nueva) · (2) **Datos del negocio** (el form-semilla) ·
(3) **Listo** (confirmación con "Ir a mi panel" + próximo paso + soporte). Quien ya tiene sesión **entra directo al
paso 2**. Google es la única salida del sitio (lo exige OAuth), pero **vuelve al wizard**: `signInWithGoogle` ahora
acepta `redirectTo` (antes iba SIEMPRE a `/explorar` e **ignoraba el callbackUrl** — de paso quedó arreglado también
en `/login` y `/registro`). **Header:** CTA **"Publica tu negocio"** (a invitados —el wizard les crea la cuenta— y a
usuarios sin negocio; los que ya tienen ficha siguen viendo "Mi negocio") + **buscador plegado** (ícono que despliega
el `SearchBar` real con sugerencias), ambos pedidos del usuario. **Verificado:** typecheck + lint + build OK · 149
tests · e2e de rutas: el wizard **ya no redirige a `/registro`**, muestra los 3 pasos, Google lleva
`redirectTo=/mi-negocio/nuevo`, y el header trae CTA + buscador.

**▶️ PRÓXIMO PASO (s32):** revisión visual del usuario (`/para-negocios` · `/mi-negocio/nuevo` · panel · badge
del admin) y, con el OK, **PUSHEAR TODO junto** (etapas 1+2+3+4; las 2 migraciones —`add_business_accounts` y
`add_place_clicks`— viajan en el build) y probar en prod. Ojo antes de pushear: sigue pendiente la **recepción
de `hola@portalpanorama.cl`** (Resend solo envía) — sin eso, la verificación por correo del reclamo/semilla no
tiene dónde llegar y queda solo el DM de Instagram.

---

## Cierre s30 (2026-07-11)

**Dónde vamos:** construyendo el MVP de **cuentas de negocio** (lado gratis). Todo el trabajo está
**en LOCAL, sin pushear** — decisión del usuario: no subir hasta que el flujo sirva de punta a punta
(reclamar → cuenta → panel donde gestionar). En prod NO cambió nada.

**⏩ s30 (esta sesión):** (1) se **commiteó la s29** que estaba en el working tree (`595d2dd` XSS del JSON-LD +
`0901acd` dashboard rediseñado + pulido UX). (2) **Fotos del dueño** construidas (`69f25d2`) y luego
**rediseñadas** (`5ecf1df`) tras el feedback del usuario ("se veía sloppy": controles sueltos flotando) →
ahora cada foto es una tarjeta contenida con barra de controles agrupada + tile dropzone en la grilla.
(3) **Los 4 frentes que pidió el usuario al revisar el panel** (ver "Feedback s30" abajo) quedaron HECHOS:
redes multi-red (`bffff08`) · horario estructurado (`09d7475`) · **tracking de clics de contacto** que
reemplaza el rating en el panel (`0a3134b`, **migración nueva**). Sigue **todo sin pushear**.

**🗣️ Feedback del usuario (s30, revisando el panel en vivo) → los 4 se resolvieron:**
1. **"El rating es redundante"** (ya se ve en la ficha) → pidió clics a cómo llegar/web/redes. **Hallazgo:** NO
   trackeábamos nada de eso en la BD (`trackEvent` solo iba a GA4/Clarity; `VisitHistory` es historial de usuarios
   logueados, ≠ tráfico). **Decisión del usuario: construir el tracking YA** → modelo `PlaceClick` + migración
   `20260712193257_add_place_clicks` (aditiva) + instrumentación de la ficha + desglose en el panel.
2. **Fotos "sloppy"** → rediseñadas contenidas (sin dependencia nueva; el usuario descartó drag-and-drop por ahora).
3. **Horario sin estandarizar** (texto libre, cada quien escribe distinto) → **editor estructurado** (7 días ×
   abierto/cerrado + turnos partidos) que serializa al formato canónico de siempre. Sin schema nuevo; los horarios
   legacy no se pisan hasta que el dueño edite.
4. **Instagram feo + faltaban redes** (YouTube/TikTok…) → editor **multi-red** (`socialLinks`, como el admin).
   ⚠️ Esto REVIERTE la decisión s28 de dejar las redes extra fuera del alcance del dueño.

**✅ Revisión visual del usuario: OK** a los 4 frentes (fotos rediseñadas, redes, horario estructurado, panel con clics).
**Migración `add_place_clicks` aplicada SOLO en local** — viaja a prod con el push.

**▶️ PRÓXIMO PASO (s31): ETAPA 3 — la puerta de entrada del negocio nuevo.**
Al cierre de la s30 el usuario preguntó qué quedó listo, y se **re-confirmó en el código** la brecha:
- Hoy funciona **SOLO el camino del RECLAMO** (la ficha ya tiene que existir en el directorio).
- **NO existe registro de negocio:** en `(auth)/` solo hay `login` · `registro` (de usuario común) · `recuperar`.
- **NO existe form para que un dueño cree su ficha.** Rutas de negocio existentes: `/para-negocios` · `/reclamar/[slug]`
  · `/reclamar-marca/[slug]` · `/mi-negocio` · `/mi-negocio/[slug]/editar` · `/admin/reclamos`.
- **El `BusinessProfile` nace en UN solo lugar:** la transacción de aprobar un reclamo
  (`PrismaBusinessClaimRepository`). No hay otra puerta → hoy "cuenta de negocio" = usuario común + reclamo aprobado.

**Lo que hay que construir (scope ya decidido en s28, `BUSINESS_ACCOUNTS_SPEC.md`):** (1) **registro de negocio**
desde `/para-negocios` que crea `User` **+ `BusinessProfile` activado** sin pasar por reclamo · (2) **form-semilla
corto** (nombre·dirección·comuna·categoría tentativa·teléfono o IG) → **`Place` PENDING_REVIEW con `ownerId`** ·
(3) cae en `/admin/lugares` → el admin corre la skill **`ficha-lugar`** para optimizarla → publica → le aparece sola
en `/mi-negocio` con el editor ya construido. **Casi cero maquinaria nueva** (reusa panel + editor + flujo admin+skill).
Sin esto, pushear el reclamo a prod deja media promesa (no hay puerta para "soy nuevo, quiero entrar").

**🧹 Dato de prueba de la s30 ya revertido:** se había asignado Eggy Cafetería como ficha del usuario
`hernan.pino7@gmail.com` para probar el panel; al cierre se revirtió (`ownerId → null`, 0 clics). BD local limpia:
**0 places con dueño · 0 businessProfiles**. Para volver a probar el panel hay que re-asignar un `ownerId` a mano.

**✅ Hecho y commiteado en local (NO en prod):**
- **Etapa 1 — schema:** `BusinessProfile` + `BusinessClaim` + enum + migración `add_business_accounts` (aplicada en local, NO en prod).
- **Etapa 2 — reclamo end-to-end:** CTA "¿Este negocio es tuyo?" en ficha → `/reclamar/[slug]` · reclamo de MARCA en `/marca/[slug]` → `/reclamar-marca/[slug]` · bandeja `/admin/reclamos` (aprobar/rechazar con nota) · correos Resend · **landing `/para-negocios`** (rediseñada, con FAQ toggle) · "Para negocios" en el menú · verificación por **DM del IG oficial o correo del local** (no "enlace de evidencia").
- **Etapa 4 — panel:** `/mi-negocio` (**dashboard rediseñado s29:** sidebar · fila de KPIs agregados · tarjeta por ficha con desglose real + **"Estado de tu ficha"** = barra de completitud + checklist de 8 ítems computado en el use case · ítems "Pronto" honestos) · `/mi-negocio/[slug]/editar` (**edición directa** de campos operacionales + `accessDetail`/`reference` + ayuda por campo + banner "ficha optimizada") · guard anti-IDOR (`assertManagesPlace`, probado e2e) · acceso "Mi negocio" en header · correo de aprobación linkea al panel.
- **Fix aparte:** login/registro respetan `callbackUrl` (no se pierde el flujo de reclamo tras crear cuenta) + `safeCallbackUrl` anti open-redirect.
- **s29 — auditoría + pulido de UX (✅ commiteado en s30: `595d2dd` seguridad + `0901acd` feature):** (a) **`security-reviewer` completado** (se había cortado en s28): encontró **1 XSS almacenado real** — `description`/`phone` del dueño iban al JSON-LD con `JSON.stringify` sin escapar `<` → **arreglado** con `src/lib/jsonLd.ts::safeJsonLd` (escapa `<`→`<`, neutraliza `</script>`/`<!--`) aplicado en las 3 páginas con JSON-LD (lugar/lista/marca); resto de la superficie salió bien cerrado (nota menor fuera de alcance: `login` sin rate limit). (b) **`/admin/reclamos` accionable** — la 8ª columna (Revisar/Aprobar/Rechazar) la recortaba `overflow:hidden` en desktop → `.admin-table` ahora `overflow-x:auto`. (c) **Cruce entre dashboards** — link recíproco "Mi cuenta personal ↗" en `/mi-negocio` y "Mi negocio ↗" en el sidebar de `/mi-cuenta` (solo si gestiona ≥1 ficha). (d) **Editor alineado** — el banner "ficha optimizada" quedó al mismo ancho (560) que el form. (e) **Login/registro: Google primero y preferido** — botón Google arriba en estilo primario, divisor "o", email/contraseña debajo en `btn--ghost` (solo cuando Google está habilitado). (f) **Ayuda `?` (FieldHelp)** → **burbuja flotante** (hover + click/foco) que no empuja el layout.
- **Fotos del dueño (s30, commit `69f25d2`):** en `/mi-negocio/[slug]/editar`, sección **OwnerPhotos** — subir archivo (se comprime+rehospeda), traer desde URL, elegir portada, reordenar (←/→), editar alt, quitar; **recomendaciones de qué subir** (fachada · interior · producto estrella), tope 12 fotos. **Capas:** port `OwnerImageInput` + `images` en la vista + `updateOwnerImages`; use case `UpdateOwnedPlaceImagesUseCase` reusa el guard `assertManagesPlace`; las actions de upload/import verifican ownership vía `GetOwnedPlaceForEdit` antes de tocar el storage; infra = delete+createMany en transacción acotado a las imágenes. **Seguridad:** `saveOwnedPlaceImagesAction` solo acepta URLs de host permitido (`isAllowedImageUrl`) — defensa en profundidad contra payload manipulado (next/image 500).
- **Estado build:** 135 tests verdes (4 nuevos del guard de fotos) · typecheck + lint OK · capas verificadas por inspección · ruta del editor compila y sigue protegida sin sesión · XSS cerrado.

**📋 Decisiones de producto cerradas (todas en [BUSINESS_ACCOUNTS_SPEC.md](BUSINESS_ACCOUNTS_SPEC.md) §6-§7):**
- **Reparto de campos:** 🟢 editar directo (info operacional + fotos) · 🟡 proponer→admin aprueba (categoría/subcategoría/tags) · 🔒 solo admin (nombre, ubicación, datos de Google).
- **Modelo mental:** UNA sola ficha (`Place`), 3 orígenes (admin+skill / reclamo / creación por dueño), mismo destino optimizado.
- **Ficha nueva (etapa 3):** el dueño llena una **semilla corta** (nombre·dirección·comuna·categoría tentativa·teléfono o IG) → `PENDING_REVIEW` → **el admin corre la skill `ficha-lugar`** para optimizar → publica → el dueño gestiona. Casi no hay maquinaria nueva.
- **Fotos:** con **recomendaciones de qué subir** (fachada/entrada · interior · producto/comida).
- **Encuadre "ficha optimizada":** el editor/reclamo avisan que la ficha ya está curada y se recomienda solo corregir info errónea + fotos.

**⬜ PLAN DE ACCIÓN — próxima sesión (en orden):**
1. ✅ **Rediseñar el dashboard `/mi-negocio`** (HECHO s29 — el usuario quedó conforme; sidebar · KPIs agregados · "Estado de tu ficha" con checklist de completitud real · sin gráfico de tendencia porque no hay serie de tiempo, se usó desglose real por ficha).
2. ✅ **Gestión de fotos del dueño** (HECHO s30, `69f25d2` + rediseño `5ecf1df`).
2b. ✅ **Redes multi-red + horario estructurado + tracking de clics** (HECHO s30 — los 4 puntos del feedback; ver arriba).
3. **Propuestas de categoría/tags** — cola de moderación: el dueño propone, el admin aprueba (patrón similar a los reclamos; entidad/estado nuevos + bandeja admin + correos).
4. **Etapa 3 — registro "para negocios" + crear ficha (semilla)** — ⚠️ **HOY NO EXISTE ningún flujo para publicar un negocio NUEVO** que no esté en el directorio (confirmado en código s29: solo hay RECLAMO de fichas/marcas existentes + panel; no hay ruta de registro-negocio ni form de crear ficha). Falta: signup que crea `User` + `BusinessProfile` activado; **form-semilla corto** (nombre·dirección·comuna·categoría tentativa·teléfono o IG) → `Place` PENDING_REVIEW con `ownerId` → **el admin corre la skill `ficha-lugar`** para optimizar → publica → cae en `/mi-negocio`. Casi cero maquinaria nueva (reusa el flujo admin+skill).
5. **Cuando el flujo sirva de punta a punta + OK visual del usuario → PUSHEAR TODO junto** (etapas 1+2+3+4; la migración viaja en el build) y probar en prod.

**📬 CORREO RESUELTO (s31, con el usuario en vivo).** `hola@portalpanorama.cl` **ya recibe**: Cloudflare Email
Routing activado (los MX de `route1/2/3.mx.cloudflare.net` verificados vivos desde 3 resolvers + SPF y DKIM de CF);
regla `hola@` → Gmail del usuario. **El envío no se tocó**: Resend manda desde el subdominio `contacto.portalpanorama.cl`,
que tiene su propio SPF/DKIM (verificados intactos tras el cambio). Probado end-to-end: correo enviado a `hola@` →
llegó al Gmail. ⚠️ **Hallazgo al paso, arreglado (`3568fc9`): las respuestas se estaban perdiendo en PROD** — los
correos salían desde `hola@contacto.portalpanorama.cl`, que NO tiene MX, así que darle "Responder" (¡el correo de
rechazo de reclamo lo pide literalmente!) mandaba el mensaje al vacío. Ahora todos los envíos pasan por un helper con
**`Reply-To` (`EMAIL_REPLY_TO`, default `hola@portalpanorama.cl`)**. Viaja a prod con el push.
- ⬜ **Catch-all sigue en "Drop"** (lo que llegue a `contacto@`/`info@`/con typo se descarta en silencio) → cambiarlo
  a reenviar al Gmail son 30s en Routing rules.

**🔧 Pendientes operativos (del usuario / infra):**
- 🖼️ **PARQUEADO hasta cerrar el rediseño — se agotó el free tier de Image Optimization de Vercel**
  (5.000 transformaciones/mes) → **las imágenes NO se ven en prod**. Causa: Next pide **hasta 8 anchos
  por foto**, así que 384 lugares × varias fotos queman miles de transformaciones. (No fue el barrido de
  capturas de la s34: corrió en `localhost`, donde optimiza la máquina local, no Vercel.)
  **Plan de 2 tiempos acordado con el usuario:** (1) **parche inmediato** = `images: { unoptimized: true }`
  en `next.config.ts` — las fotos ya se guardan procesadas (WebP q80, máx 2000px), así que se ven, aunque
  pesadas; (2) **la cura, al terminar el diseño** = **pre-generar 3 anchos (400/800/1600) con `sharp` al
  subir** + loader propio → **cero transformaciones de Vercel para siempre**, gratis, y más rápido que hoy
  (requiere script que reprocese las fotos ya cargadas). ⚠️ Antes de aplicar el parche, **mirar el
  bandwidth de Vercel Blob** en el dashboard: apagar la optimización le carga el tráfico a esa cuota.
- **Deliverability:** los correos caen en "Promociones" de Gmail → bajar el tono "marketing" de los transaccionales
  (el DMARC del dominio ya existe: `p=none`).
- **Nota del security-reviewer (s29, fuera de alcance):** `login` no tiene rate limiting (registro/recuperar sí) → cerrarlo con el mismo patrón `rateLimitDurable('login:${ip}', …)` cuando se toque auth.
- Arrastrados: portada guía de juegos · 5 PENDING antiguos de ramen · rotar contraseña Neon prod + borrar `PROD_DB_URL` · regenerar recovery codes de Vercel · rotar API key de Resend · ingest lote "complementos de cita" (chocolaterías/florerías/plantas) cuando llegue la lista.

---

**Última actualización:** 2026-07-10 (sesión 28 — **Deploy de la s27 arreglado y verificado en vivo + scope MVP de cuentas de negocio DECIDIDO (sesión de producto)**):
**(A) Deploy s27:** el build de Vercel estaba **fallando por lint** (`react/no-unescaped-entities`: 4 comillas rectas `"` en el JSX de
`/como-ordenamos`; en local no se vio porque la s27 corrió typecheck + dev server, **no `next build`** — gotcha nuevo: correr `next build`
o al menos el lint antes de pushear páginas nuevas). Fix `7b0de6d` (comillas tipográficas) + push → deploy **Ready**. **Verificado en
vivo:** `/como-ordenamos` 200 · selector de orden + link "¿Cómo ordenamos?" presentes en /explorar · chips de ficha navegan a /explorar
filtrado. Con el recálculo de scores ya hecho en la s27, **la sesión 27 quedó completa en prod**. Al paso: el usuario recuperó el acceso
a Vercel (2FA resuelto con recovery code); ⚠️ quedaron expuestos en el chat **2 recovery codes de Vercel** (regenerarlos) y la **API key
de Resend** (rotarla). **(B) Sesión 28 de producto (la acordada):** scope MVP de cuentas de negocio **decidido y escrito en
[BUSINESS_ACCOUNTS_SPEC.md](BUSINESS_ACCOUNTS_SPEC.md) §6** — dos puertas (reclamo con CTA destacado en la ficha "¿Este negocio es
tuyo?" + registro de negocio con creación de ficha siempre PENDING_REVIEW) · moderación total del admin + **correos transaccionales**
(Resend) + guía/FAQ y ayudas por campo en el form · **landing pública "para negocios"** (qué es · qué incluye · gratis hoy · qué viene:
publicidad interna declarada/premium) · **dashboard de negocio** (pestaña aparte del de consumidor: editar ficha moderada · fotos ·
estadísticas básicas · reportes) · **todo gratis** (cobros recién en Fase C) + opt-in de correos de novedades. **Eventos: definición
liviana cerrada, CERO build** (panorama con fecha; sin ticketing/pagos/agregador; va separado y después, con audiencia). Etapas de build
acordadas: (1) schema `BusinessProfile`+`BusinessClaim` · (2) reclamo e2e + landing · (3) registro + crear ficha · (4) dashboard.
**(C) Build etapa 1 HECHO (misma sesión, con OK del usuario):** migración **`20260710212727_add_business_accounts`** — enum
`ClaimStatus` + tablas `BusinessProfile` (1:1 User, con `newsletterOptIn` para el opt-in de novedades de la s28) y `BusinessClaim`
(place XOR brand, exclusión en dominio; Cascade en claimant/place/brand, SetNull en reviewedBy) + relaciones en User/Place/Brand.
**Revisada por db-migration-reviewer (veredicto: 100% aditiva, segura) y aplicada en LOCAL** ✅; typecheck limpio + **109 tests
verdes**. ⚠️ **Prod aún sin la migración** — viaja con el próximo `git push` (el build corre `migrate deploy`). **(D) Encargo de
carga entregado al usuario:** lote **"complementos de cita"** (chocolaterías · florerías · tiendas de plantas; 0 cargadas, subcats
ya existen en `locales-tiendas`) — alimenta el norte del **planificador IA del panorama completo**; estacionamientos re-triaged al
backlog como dato de ficha, NO como fichas (ver backlog). **(E) Build etapa 2 HECHO (misma sesión): reclamo END-TO-END + landing "para negocios".**
**Dominio:** `BusinessClaim` (invariantes: place XOR brand · decisión única desde PENDING; entidad inmutable) + 5 errores.
**Application:** port `BusinessClaimRepository` (con `persistApproval` transaccional documentado) + 4 use cases (Create con
anti-duplicado y guard de ficha-con-dueño / Approve / Reject / ListForAdmin) + `GetAdminInboxCounts` ahora trae `pendingClaims`;
`EmailService` extendido con 3 correos del ciclo (recibido/aprobado/rechazado con motivo — decisión s28: la revisión nunca es un
hoyo negro). **Infra:** `PrismaBusinessClaimRepository` (aprobación = transacción: claim + ownerId del Place/Brand + BusinessProfile
creado/verificado) + plantillas Resend en chileno. **UI:** CTA destacado en la ficha ("¿Este negocio es tuyo?", `.ficha__claim` con
borde de acento) → **`/reclamar/[slug]`** (requiere sesión, form con rol/mensaje/contacto/evidencia, rate limit 3/h por IP, el
id/nombre del lugar se resuelven server-side) → bandeja **`/admin/reclamos`** (tabla con evidencia y contacto, aprobar/rechazar con
nota que viaja en el correo, badge propio en la nav del admin) + **landing `/para-negocios`** (qué es · qué incluye hoy gratis ·
qué viene · cuánto cuesta: nada, y la visibilidad pagada futura declarada; FAQ) linkeada en footer, sitemap y CTA de ficha.
**Guardianes:** `architecture-guardian` → capas limpias (0 violaciones); `security-reviewer` → **2 hallazgos, ambos arreglados en la
misma sesión:** (1) **XSS almacenado** — `z.url()` acepta `javascript:`/`data:`, y ese `evidenceUrl` iba a un `href` del panel admin
(React no sanea href) → `refine(/^https?:/)` en la action + guard al render; (2) **TOCTOU al aprobar** — dos reclamos PENDING del
mismo lugar, el 2º pisaba el `ownerId` del 1º sin aviso → `persistApproval` ahora setea el owner con `updateMany({where:{ownerId:null}})`
y aborta la transacción (`TargetAlreadyOwnedError`, mapeado en la action) si ya no está libre. **Verificado:** typecheck limpio ·
**122 tests verdes** (13 nuevos: entidad + use case) · lint completo OK (¡mismas comillas de la (A) pilladas en local!) · **ciclo e2e
contra la BD local** (crear → duplicado bloqueado → aprobar → ownerId+profile ✓ → re-decisión bloqueada → ficha con dueño bloqueada →
limpieza) · rutas verificadas contra el dev server (CTA en ficha, landing 200, /reclamar y /admin/reclamos redirigen sin sesión). **(F) Ajustes tras la revisión visual del usuario (misma sesión):** (1) **Landing `/para-negocios` rediseñada** — dejó de ser
"solo texto" (el usuario la vio "reee mal"): ahora hero con CTA, **grid de tarjetas de beneficios** con etiquetas Ya disponible/Pronto,
**panel de precio** con "Gratis" grande en acento, **pasos numerados** y **FAQ con toggle** (`<details>` nativo, accesible, sin JS);
CSS nuevo `.biz-*` con los tokens del handoff. El usuario mandó refs de Claude Design (planes Free/Premium + panel de negocio) como
inspiración → **descartadas para ahora** ("olvida lo que te dije", le gustó el rework); quedan como norte para la **etapa 4 (panel de
negocio)** y el tema de **planes de pago** (Fase C). (2) **Método de verificación redefinido** (el usuario no veía sentido al "enlace
de evidencia"): ahora el reclamante **escribe desde el canal oficial del local** (DM del IG oficial a `@portalpanorama.cl` o correo del
correo oficial a `hola@portalpanorama.cl`) → el form quedó en **rol + contacto** (se quitó el campo de URL; de paso mata el vector XSS
de raíz), el correo de "recibido" y la landing explican el paso, y la columna `evidenceUrl` queda **dormida** en la BD. Re-verificado:
typecheck + **122 tests** + lint OK. **(3) Flujo de MARCA agregado:** el reclamo se generalizó a lugar O marca — CTA "¿Esta marca
es tuya?" en `/marca/[slug]` → **`/reclamar-marca/[slug]`** (reusa el `ClaimForm`, ahora con prop `kind: place|brand`; la action
resuelve el objetivo server-side y llama al use case con `placeId` **o** `brandId`, que el schema/dominio ya soportaban). Al aprobar una
marca se setea `Brand.ownerId`; sus sucursales cuelgan de ella. `BrandPageView` ahora expone `id`. **(4) "Para negocios" en el menú**
(header desktop + móvil), además del footer. **(5) Color del bloque de verificación** suavizado (carta neutra, no el durazno).
**⚠️ Creación de cuenta de negocio (registro + crear ficha) = etapa 3, NO construida aún** — hoy solo existe el RECLAMO de fichas/marcas
existentes. **(6) FAQ local-vs-marca** agregado a la landing (qué hacer si reclamaste un local que era parte de una cadena).
**🛑 DECISIÓN DEL USUARIO (s28): NO pushear hasta que el flujo sirva de punta a punta** — el reclamo sin panel sería prometer algo que
no existe. Por eso se construyó también la **etapa 4** en la misma sesión (ver abajo). Todo el trabajo de negocios queda **en local, sin
pushear**, hasta que el usuario lo revise visualmente y dé el OK.

**(G) PANEL DE NEGOCIO (etapa 4) CONSTRUIDO (s28-cont).** Decisión del usuario: **edición DIRECTA** (el dueño verificado edita sin
esperar aprobación; el nombre/categoría/ubicación siguen siendo del admin). Lo hecho: **`/mi-negocio`** (dashboard: las fichas que
gestiona —propias por `ownerId` **o** de sus marcas por `brand.ownerId`— con **estadísticas** de visitas + guardados + rating, estado y
portada) · **`/mi-negocio/[slug]/editar`** (form de campos operacionales: descripción, horario, teléfono, web, Instagram, carta, precio,
reserva; se publican al tiro, invalida caché con `revalidateTag`) · acceso **"Mi negocio"** en el header (solo si gestiona ≥1 ficha, via
`CountManagedPlacesUseCase`) · el correo de aprobación ahora linkea al panel. **Capas:** dominio `UnauthorizedBusinessAccessError` +
guard `assertManagesPlace` (application) aplicado en los use cases de lectura y escritura; 3 use cases + 4 métodos de repo
(`countManagedByUser`/`findManagedByUser`/`findOwnerEditableBySlug`/`updateOwnerEditableFields`, este último acotado a campos seguros).
**Seguridad:** `architecture-guardian` limpio; el **e2e local probó el IDOR bloqueado en lectura Y edición** + que el update no toca lo
estructural; **XSS cerrado** (website/menuUrl con `refine` http(s) en la action + `withProtocol` en el render de la carta —antes
`menuUrl` iba a href crudo). ⚠️ El `security-reviewer` se cortó por límite de sesión antes de terminar — **relanzarlo al reabrir** para
cerrar la auditoría formal. Bug evitado al paso: el update NO borra las redes extra (socialLinks salió del alcance del dueño). **127
tests verdes** (5 nuevos del guard), typecheck + lint OK. Commits de negocios: `bde307e..` (etapas 1+2) + los de la etapa 4 (este bloque).
**▶️ Próximo paso (s29):** (1) revisión visual del usuario del panel + reclamo; (2) **relanzar security-reviewer**; (3) con el OK,
**pushear TODO junto** (etapas 1+2+4; la migración viaja en el build) y probar en prod. Etapa 3 (registro + crear ficha) después. En
paralelo: ingest del lote "complementos de cita" cuando llegue la lista. Pendientes que siguen: portada guía de juegos · 5 PENDING antiguos de ramen · rotar contraseña Neon
prod + borrar `PROD_DB_URL` · regenerar recovery codes de Vercel · rotar API key de Resend.

**Sesión previa:** 2026-07-10 (sesión 27 — **Quick wins de UI: los 6 frentes acordados, implementados y verificados en local**):
los 6 ítems del plan de la s26 quedaron en un solo commit (`137bac2`, 37 archivos; typecheck limpio + **109 tests verdes** + rutas verificadas
e2e contra el dev server). **(f) Score con prior por CATEGORÍA:** `Score.prior(categoria, global)` con guard (`MIN_CATEGORY_SAMPLE = 15`
lugares con rating; si la muestra no alcanza, cae al global); los 4 use cases que baten score (Create/Update/Enrich/Recalculate) usan el prior
de la categoría del lugar (nuevo `categoryRatingStats()` en `PlaceRepository`, groupBy). **Nuevo `scripts/recalculate-scores.ts`**
(`--dry`/`--prod`, imprime tabla de priores + top movers, invalida caché de prod solo) — **aplicado en local: 403 scores re-batidos,
idempotente** (2º dry = 0 cambios). Dato real: las 6 categorías pasan el guard; Vida nocturna (prom. 4.350) baja y Locales y tiendas (4.617)
sube — el sesgo que se quería corregir; ojo: **Juegos quedó en 4.556, BAJO el global 4.594** (la intuición de la s26 decía ~4.7 — el prior por
categoría igual es lo correcto, solo que en la otra dirección). ⚠️ Fix de infra al paso: `updateScores` batía los 403 updates en UNA
transacción interactiva → expiraba el timeout de 5s contra Neon; ahora es **un solo UPDATE con `unnest`**. **(e) Página `/como-ordenamos`:**
transparencia del ranking en simple ("te comparamos con tus pares", nadie paga por subir), estilo páginas legales; linkeada en footer (Legal),
sitemap y /explorar. **(b) Selector de orden en /explorar:** `SortSelect` (client, patrón Filters): Recomendados / A–Z / precio menor↔mayor;
param `orden` (`alfabetico|precio-menor|precio-mayor`), el default (score) no ensucia la URL; precio con nulls al final y score de desempate;
al lado, link "¿Cómo ordenamos?". De rebote se expuso **`cocina` como param URL** → `cuisineTagSlugs` (el backend lo soportaba desde s19;
verificado `?cocina=ramen` → 32). **(d) Chips clickeables en la ficha:** categoría/subcategoría/secundaria y tags
AUDIENCE/OCCASION/VIBE/EXPERIENCE/CUISINE/SERVICE navegan a /explorar filtrado (mapa capa→param); SPECIFIC queda informativo (no es faceta).
**(a) Feedback al guardar:** toast de confirmación ("Se agregó a X" / "Se creó X y se agregó"; nuevo `components/ui/Toast.tsx`) en SaveHeart
y SaveButton, y **las listas que ya contienen el lugar salen con "✓ guardado" y sin acción** — el save-context ahora trae `savedItems`
(pares lista-lugar; `findSavedItems` reemplazó a `findSavedPlaceIds` en el port). **(c) Badge en el admin:** contador de reportes +
sugerencias OPEN en la pestaña Reportes (countOpen en ambos repos + `GetAdminInboxCountsUseCase`, corre en el layout del admin).
**✅ PUSH + RECÁLCULO EN PROD (misma sesión, con OK del usuario):** push `79c9c76..9b4fad8` → Vercel redeploy;
`recalculate-scores --prod` (`--dry` primero, consistente con local) → **390 scores re-batidos en prod + caché invalidado solo**. ⚠️ **Al
cerrar la sesión el build de Vercel AÚN NO terminaba** (`/como-ordenamos` daba 404; la home seguía sirviendo el deploy anterior — es el
build, NO el caché de 1 h, que ya se invalidó). **▶️ Primer paso de la s28: verificar el deploy en vivo** (`/como-ordenamos` 200 ·
`/explorar?orden=alfabetico` · chips de una ficha; si el build falló, revisar el log en Vercel). Pendientes que siguen: portada guía
de juegos · 5 PENDING antiguos de ramen · rotar contraseña Neon prod + borrar `PROD_DB_URL` al cerrar la campaña.

**Sesión previa:** 2026-07-10 (sesión 26 — **Lote 6 de actividades (33 cargadas, 24 en prod) + guía "Panoramas de juegos y adrenalina" LIVE**):
el usuario aportó **34 lugares con place_id** en 10 rubros de *Juegos y diversión* (karting, paintball, trampolines, minigolf, escape rooms,
bowling, VR, karaoke, arcades, billar), con 3 rubros bajo cuota avisados (bowling/escape/karaoke: la oferta ≥4.3★ del Gran Santiago ya está
casi toda cargada). **(1) Dedup:** 1 duplicado (Eleven Club ya existía) → 33 nuevos; Pirque/Lampa/Colina ya estaban en el catálogo de comunas.
**(2) Research:** 6 tandas paralelas del `investigador-lugares`; **el límite de sesión cortó las 2 primeras al inicio (0 fichas) → se
REANUDARON con SendMessage** tras el reset y las 6 completaron **33/33**. ⚠️ Gotcha nuevo del flujo: las tandas reanudadas **reescribieron
fichas ya ingestadas** (las vieron "desaparecer" al archivarse) → hubo que separar 5 nuevas de 9 reescritas antes del 2º ingest para no
duplicar (el ingest no es idempotente; **siempre compara contra lo ya ingestado al reanudar tandas**). **(3) Ingest** vía staging: **24
PUBLISHED + 9 PENDING_REVIEW** (razones honestas: sin horario, cierres dudosos, B2B) + **7 marcas nuevas** (Cerogrado · Goolfy · Jumper Park
· Jumpin · Lucid Dreams VR · Rally Kart · Trampoline Park). Hallazgos del research: **Breakout es B2B móvil** (no local walk-in), **Dream
Match con señales de cierre definitivo 2022** (vs actividad 2024, sin resolver), **El Devorador es restaurante temático** (sin arcade
confirmado, quedó en Gastronomía), **Boulevard Bellavista con duda de identidad** (varias marcas en la misma dirección). **(4) Enrich**
`--force --with-photos`: **33/33 match exacto por place_id, 0 sin match, 32 coords nuevas**; despejó dudas (Master Pool con dirección real
+ 3 fotos; JuegaPaintball 4.9/190 + 3 fotos). **(5) Guía "Panoramas de juegos y adrenalina en Santiago"**
(`panoramas-de-juegos-y-adrenalina-en-santiago`): **regla por categoría completa** (`categorySlug: juegos-y-diversion`, primera guía así),
sort `score_desc` → resuelve **50** publicados y crece sola. **6 destacados = 6 rubros × 6 comunas** (FUGA 5.0/4.480 · Lucid Dreams VR
Vespucio 5.0/890 · Trampoline Park Alameda 4.9 · Speed Park Karting 4.6/2.226 · Force Delta Paintball 4.7 · Entretenimientos Diana
4.7/5.086) **+ 4 menciones** (GoKarts · Desafío Escape Room · Jumper Park · Goolfy Huechuraba). **✅ PROD-SYNC + PUSH (misma sesión):**
`prod-sync` (`--dry` primero) creó **24/24** en prod + catálogo/marcas y **el caché se invalidó solo** (primera corrida real de
`revalidate-remote` post-sync ✓); commit `d7cfe32` + push → el build creó la guía. **Verificado en vivo (HTTP 200):**
`portalpanorama.cl/lista/panoramas-de-juegos-y-adrenalina-en-santiago` → título, **"50 lugares"**, 6 destacados. **LOCAL: 403 total / 384
PUBLISHED · PROD: 389 total / 384 PUBLISHED / 50 juegos (prod = local en publicados).** Meta 500: faltan ~97 (local total).
**PENDING del lote 6 resueltos (misma sesión, decisión del usuario):** **K-Box publicado** (→ prod vía prod-sync, guía en 51) y los
**otros 8 ARCHIVADOS** (quedan en el admin por si los retoma; no viajan a prod). Quedan los 5 PENDING antiguos (Tensei/Oroshi/Speed
Ramen/Ramen Wow/Ramen Home). **Pendientes del usuario:** portada para la guía nueva · rotar contraseña Neon prod + borrar `PROD_DB_URL`
al cerrar la campaña.

**▶️ PLAN ACORDADO PARA LAS PRÓXIMAS SESIONES (decidido 2026-07-10 al cierre de la s26):**
1. ✅ **Sesión 27 — Quick wins de UI** (HECHA, misma fecha; en prod y verificada en vivo desde la s28): (a) feedback al guardar en lista ("se agregó a X" /
   "se creó y agregó") + mostrar en qué listas ya está guardado; (b) selector de **orden** en /explorar (score → alfabético/precio);
   (c) **badge de "nuevo"** en pestañas del admin (reportes/sugerencias sin leer); (d) **chips de categoría/tags clickeables en la
   ficha** → /explorar filtrado; (e) **página pública "cómo ordenamos"** explicando el score bayesiano en simple (la pidió el usuario;
   linkeable desde las fichas/guías — transparencia + SEO); (f) **score con prior por CATEGORÍA** (duda del usuario al cierre de s26,
   validada): el C global (~4.5) castiga a las categorías de nota alta (juegos ~4.7) y regala a las duras — cambiar a promedio de la
   categoría **con guard** (si la categoría tiene <~15 lugares con rating, caer al global). Toca `Score.ts` + batch de recálculo +
   tests; la página (e) se escribe acorde ("te comparamos con tus pares").
2. ✅ **Sesión 28 — Producto: cuentas de negocio** (HECHA 2026-07-10 — scope decidido y escrito en `BUSINESS_ACCOUNTS_SPEC.md` §6;
   eventos definido liviano, cero build — ver "Última actualización" y la bitácora de PLAN_FASE9.md).
3. **Después:** implementar el MVP de cuentas de negocio por etapas (1 schema · 2 reclamo e2e + landing · 3 registro + crear ficha ·
   4 dashboard) + seguir la carga hacia los 500 en paralelo (verticales candidatas: cevicherías, brunch, plazas/parques).

**Sesión previa:** 2026-07-09 (sesión 25 — **SEO on-page (fichas + guías) + buscador por palabras + 2ª pasada de perf móvil**):
**(A) SEO de fichas** (pedido del usuario: el nombre del local casi no aparecía fuera del `<title>`): la meta description ahora parte con
"{Nombre} en {barrio}, Santiago: …"; los h2 pasan a "Datos prácticos de {nombre}" y "Similares a {nombre}"; la skill `ficha-lugar` exige
nombrar el lugar una vez en la descripción (contenido nuevo nace bien; las 360 existentes se cubren por plantilla, sin reescribirlas).
**(B) SEO de guías:** el h2 de la grilla repite el título ("{Título}: más lugares"), la meta description antepone el título si el texto no
lo trae, y los **intros de las 8 guías se reescribieron** para que la primera frase incluya el título — aplicado en el archivo de datos
**y en la BD (local + prod)** con el script one-off **`scripts/update-list-intros.ts`** (solo toca intro/description; el seed es
first-write-wins y no actualiza listas existentes). **(C) Buscador tokenizado:** `tokenizeQuery` en fuzzy.ts (stopwords castellano +
genéricas del dominio) y `fuzzyMatchIds` exige que **cada palabra** matchee nombre/rubro/tags/**comuna/barrio** (nuevos en el haystack)/
descripción → "ramen providencia" 12, "lugares para ir con niños" 37, "café para trabajar" 25 (antes ~0). 104 tests verdes (5 nuevos).
Commit `fdf5190` + push. **(D) Perf móvil, 2ª pasada** (el usuario midió PageSpeed 63; Lighthouse local contra prod dio ficha **56**
[LCP 7.1s], lista 67, home 81): tres causas medidas → tres fixes (commit `c6cdb03` + push): **(1)** la imagen LCP no llevaba priority hint
→ `fetchPriority="high"` en hero de ficha + portada de guía (ahora va en el `img` y el preload); **(2)** gtag (162KiB) + Clarity bloqueaban
~550-710ms de TBT → ambos a `lazyOnload` y `trackEvent` ahora **encola en dataLayer** (no se pierden eventos previos a la carga);
**(3)** el caché de 5 min estaba casi siempre frío con 360+ fichas (TTFB 1.8s) → **revalidate a 1 h** + endpoint **`POST /api/revalidate`**
(secreto `REVALIDATE_SECRET`; en `.env.local` ✅, **falta cargarla en Vercel — usuario**) + helper `scripts/revalidate-remote.ts` que
**prod-sync y update-list-intros llaman solos** al terminar → el contenido cargado se ve al tiro. **Medido post-deploy (Lighthouse local):**
ficha 56→**66** (LCP 7.1→5.0s), lista 67→**80** (LCP 4.8→3.0s), TTFB de ficha **1.8s→0.32s**; home varía 75-81 entre corridas (ruido de
medición local). **Frente restante:** TBT ~500ms (bundle JS: 65KiB sin uso + hidratación) — próxima pasada si el usuario lo pide.
**(E) Lote 6 — actividades:** catálogo listo (categoría *Juegos y diversión* completa; paintball/karting/minigolf/trampolines en 0);
se entregó al usuario el **prompt de investigación** (~40 lugares en 10 rubros con exclusiones de los 27 existentes); esperando su lista
con place_ids. **Portadas de sushi/pizza/ramen: subidas por el usuario ✅.** **Pendientes:** `REVALIDATE_SECRET` en Vercel (usuario) ·
5 PENDING_REVIEW en `/admin/lugares` · horario KUNG-FU RAMEN y Genki ya Los Dominicos · rotar contraseña Neon prod + borrar `PROD_DB_URL`
al cerrar la campaña. **Próximo paso (sesión 26):** ingest del Lote 6 cuando llegue la lista (flujo de siempre + guía de actividades)
**y/o sesión de producto** para el scope mínimo de cuentas de negocio + eventos (meta del usuario: antes de agosto; revisar Clarity antes
de rediseñar home/ficha).

**Sesión previa:** 2026-07-08 (sesión 24 — **Perf de navegación en TODO el sitio: lecturas cacheadas + skeletons por ruta**):
el usuario pausó la carga de contenido para atacar la lentitud al navegar (PageSpeed móvil: fichas/guías 68-76, LCP 5.9-7s; delay "congelado" al
hacer clic). Diagnóstico: **todas las rutas menos la home eran SSR dinámico puro** — cada clic esperaba a Neon sin feedback visual (el único
`loading.tsx` raíz no se activa entre rutas hermanas) y `generateMetadata` + page **corrían la misma query 2 veces por request** (fichas y guías).
Fix en dos frentes: **(A) 4 `loading.tsx` con skeleton** que replican el layout real (lugar, lista, explorar, guias; clases `.skel` en globals.css)
→ el clic pinta al instante y el contenido llega por streaming. **(B) `src/lib/cachedReads.ts`**: los read-models públicos (ficha+relacionados,
guía por slug, índice de guías, categorías, facetas, recomendados de la home) van al **Data Cache de Next** con `revalidate: 300` + tags
(`places`, `curated-lists`), envueltos en `cache()` de React (dedupe metadata+page). **Las actions del admin** (lugares/listas/marcas) hacen
`revalidateTag` → las ediciones del admin se reflejan **al tiro**; los cambios por scripts externos (ingest/enrich/prod-sync escriben directo a
la BD) demoran **≤5 min** en verse (trade-off explicado y aceptado por el usuario). El save-context (corazones) **nunca se cachea** (por sesión)
y en `lista/[slug]` ahora va **en paralelo** con la query de la guía. **Medido en build local:** lista 2.6s→**0.05s**, ficha 2.1s→**0.04s**,
home 2.9s→**0.04s** (caché tibio); explorar ~0.4s (la búsqueda sigue en vivo por diseño). Typecheck limpio + 99 tests verdes + contenido
verificado (guía ramen "32 lugares", h1 de ficha OK). Fix volador: **"Explorá por categoría" → "Explora"** en la home (voseo, regla de idioma).
Commit `200258d` + push a prod. **Pendientes que siguen de s23:** 5 PENDING_REVIEW en `/admin/lugares` · horario para KUNG-FU RAMEN y Genki ya
Los Dominicos · portadas para las guías de sushi/pizza/ramen · rotar contraseña de Neon prod + borrar `PROD_DB_URL` al cerrar la campaña.
**Próximo paso (sesión 25):** verificar PageSpeed en prod con el caché tibio y retomar la carga — siguiente vertical de comida (¿coreana?
¿cevicherías? ¿brunch?), mismo flujo: local → `prod-sync` → push.

**Sesión previa:** 2026-07-07 (sesión 23 — **Perf móvil de la home (LCP 7.4s→2.9s) + Lote 5 ramen (29 cargadas, 26 en prod) + guía "El mejor ramen de Santiago" LIVE**):
**(A) Performance móvil** (PageSpeed móvil daba 73, lo pidió el usuario): el LCP de 7.4s era el **h1 del hero** — la home es SSR dinámico y el HTML no
salía hasta resolver `auth()` + las 4 queries a Neon. Fix: **hero estático en el primer flush + resto por `<Suspense>`** (fallback con altura reservada
para que el footer no salte: CLS 0.53→0) + **portadas de guías por `next/image`** (`GuideCard.tsx` compartida home+/guias; antes iban con `<img>` crudo
de ~1500px = 621 KiB de más). Lighthouse local: **59→92, LCP 7.0s→2.9s**. Commit `e461767`, pusheado y **verificado en prod**. Nota de contenido: las
guías de **sushi, pizza y ramen no tienen imagen de portada** (placeholder en la home). **(B) Lote 5 — ramen (city-wide):** lista del usuario de **29
ramenerías con `place_id`** en 10 comunas, anotadas ⚠ (pocas reseñas) y ◇ (lanzhou chino / foco mixto — se incluyen igual: la sopa de fideos es el plato
principal). Dedup: **0 duplicados**. Research: 5 tandas paralelas del `investigador-lugares`; **el límite de sesión las cortó al inicio (0 fichas) → se
REANUDARON con `SendMessage` conservando su contexto** y terminaron 29/29 (0 perdidas; el patrón "reanudar en vez de relanzar" queda validado). Ingest
por tanda vía staging: **18 PUBLISHED + 11 PENDING_REVIEW** + **6 marcas nuevas** (Ramen One ×3 · Ramen Ryoma ×2 · Momotaro ×3 —Izakaya Momotaro es el
mismo local de Los Leones en turno sábado noche— · Kintaro ×2 —mismo dueño Nobu Noda, confirmado en prensa— · Kansui ×2 · Genki Ya ×3). Enrich
`--force --with-photos`: **29/29 match exacto por place_id** (1 reintento por 502 transitorio de Apify; la #1 agotada → rotó sola a la #2), 25 coords
nuevas. El dato real **despejó las dudas de la ingesta**: se rellenaron 5 direcciones vacías/en conflicto (Genkiya Ramen Bar era **Santa Magdalena 180**,
no Andrés Bello 2233). **Decisión del usuario sobre los 11 PENDING:** publicar 8 (los 7 con la duda resuelta + Izakaya Momotaro); **los 3 sin horario
quedan en revisión** (Ramen Wow · Ramen Home · Speed Ramen — criterio nuevo: sin horario no se publica). Ojo: KUNG-FU RAMEN y Genki ya Los Dominicos
quedaron publicados **sin horario** (aprobados en el primer grupo) — agregárselo en el admin. Barrio **Los Dominicos** (Las Condes) al seed + reasignado.
**(C) Guía "El mejor ramen de Santiago"** (`el-mejor-ramen-de-santiago`, molde de las anteriores): regla `cuisineTagSlugs: ['ramen']`, sort `score_desc`
— resuelve **32** (26 del lote + 6 de lotes previos que ya tenían el tag: BADA, Everyday, Duri, A Sushi, Haruko, Ichiban). **6 destacados** (Ramen
Kintaro 4.5/7.427 la institución · Ramen One Vivo Imperio 4.9/933 · Ryoma Barrio Italia 4.9/695 · Isekai 4.8/1.321 · Momotaro foods 4.7/705 Patronato ·
Kame House 4.7/151 Peñalolén) **+ 4 menciones** (Ramen One Independencia · Genki ya Los Dominicos · Mirai Food Lab/Factoría Franklin · Ootoya
Bellavista). **✅ PROD-SYNC + PUSH (misma sesión):** `prod-sync.ts` (`--dry` primero) creó **26/26** en prod (saltó los 3 PENDING de ramen y
Tensei/Oroshi de s22) + catálogo (barrio + marcas); commit `0b65316` + push → el build creó la guía. **Verificado en vivo (HTTP 200):**
`portalpanorama.cl/lista/el-mejor-ramen-de-santiago` → título, **"32 lugares"**, destacados renderizan. **Local: 370 total / 360 PUBLISHED · Prod: 365
total / 360 PUBLISHED / 32 ramen (prod = local en publicados; los 5 de diferencia son los PENDING que no viajan).** Typecheck limpio + 99 tests verdes.
**Pendiente del usuario:** los **5 PENDING_REVIEW** acumulados en `/admin/lugares` (Ramen Wow/Home/Speed sin horario + Tensei/Oroshi de s22) — las guías
son regla viva, entran solos al publicarlos (+ `prod-sync` después); horario para KUNG-FU y Genki ya Los Dominicos; portadas para las guías de
sushi/pizza/ramen. Recordatorio de siempre: **rotar contraseña de Neon prod + borrar `PROD_DB_URL`** al cerrar la campaña de carga.
**Próximo paso (sesión 24):** siguiente vertical de comida (¿coreana? ¿cevicherías/picadas? ¿café ya tiene guía — brunch?) u otra categoría city-wide,
mismo flujo: cargar en local → `prod-sync` → push.

**Sesión previa:** 2026-07-05 (sesión 22 — **Lote 4 de sushi (31 cargadas, 29 en prod) + guía "Las mejores sushilerías de Santiago" LIVE**):
el usuario eligió **sushi** como 3ª vertical de comida (tras burgers y pizza), aportó una lista de **31 sushilerías con `place_id`** repartidas por
**14 comunas** (≥4.3★, excluyendo delivery industrial y los 6 japoneses premium ya cargados —Osaka/Naoki/Fukasawa/Tengu/Katō/Bar Jardín Secreto,
que tienen `cocina-japonesa` pero no el tag `sushi` de plato), y **se tuvo que ir → Claude siguió el flujo en autónomo y, con el OK del usuario a distancia, completó también el prod-sync + push.**
**(1) Dedup** por `place_id`: **0 duplicados, 31 nuevos**. **(2) Research:** 6 tandas paralelas del agente `investigador-lugares` (A-F =
6+5+5+5+5+5); **2 (C, F) se cayeron al inicio por error de conexión de la API** (transitorio, no límite) → re-lanzadas; **escritura incremental →
0 fichas perdidas**, 31/31 escritas con el tag `cuisine=Sushi` **obligatorio** en todas (la instrucción clave del lote). **(3) Ingest** en 2 tandas
vía carpeta *staging* (el ingest **no es idempotente** → se archiva lo ingestado para no re-procesar): **28 PUBLISHED + 3 PENDING_REVIEW** (K Sushi
Ñuñoa, Tensei, Oroshi) + **7 marcas de cadena** creadas (Inari, Sushi Hoy, Tanaka, K Sushi, Everyday, Haruki, Koari). Fichas archivadas en
`tmp/fichas-lote4-sushi/`. **(4) Enrich** `--force --with-photos` por los 31 ids: **31/31 match exacto por place_id, 0 sin match**, rating real de
Google + **29 coords nuevas** + fotos rehospedadas; **Apify #1 agotada (402) → rotó sola a la #2**. **(5) PENDING_REVIEW dejados para el usuario**
(estaba fuera; el place_id confirmó la identidad de las 3): **reco — K Sushi (4.5/499) publicar** (duda Kyo/K Sushi despejada, ficha sólida); **Tensei
(4.7/26) borderline**; **Oroshi (5.0/77) NO así** (ficha con dirección vacía). La guía es regla viva → las incluye solas al publicarlas. **(6) Guía
"Las mejores sushilerías de Santiago"** (`las-mejores-sushilerias-de-santiago`, molde burgers/pizzas): regla `cuisineTagSlugs: ['sushi']`, sort
`score_desc`, **6 destacados** (Koari 4.9/883 Centro · Katai 4.9/313 Puente Alto · Sushi Hoy Ñuñoa 4.8/550 · Sushi La Reina 4.8/517 · Okita 4.6/2595
San Miguel · Tanaka 4.6/1245 Vitacura — mezcla joyas top-score + instituciones más reseñadas) **+ 4 menciones** (Sushinikkei17 Providencia · Kaizen
Maipú · Haruko Macul · Sushi Hoy La Florida) → **10 comunas cubiertas**. Escrita en `scripts/curated-lists.data.ts` + **reseed local OK** (creada,
resuelve las 28 publicadas; crece a 31 al publicar los PENDING). **Typecheck limpio. BD local: 310 → 341 places.** **✅ PROD-SYNC + PUSH COMPLETO
(misma sesión):** con el OK del usuario a distancia se **publicó K Sushi** (4.5/499, duda Kyo/K Sushi despejada) → 29 publicadas; `prod-sync.ts`
(`--dry` primero) creó los **29 lugares** en prod (saltó Tensei/Oroshi PENDING) + sincronizó catálogo/marcas/barrios (Fase 3 = 0, los 6 japoneses
premium no se tocaron); `git push` (`ed93384..86b51a6`, 2 commits: `900fc34` guía + `86b51a6` docs) → el build corrió `seed-curated-lists` y
**creó la guía en prod. Verificado en vivo (HTTP 200):** `portalpanorama.cl/lista/las-mejores-sushilerias-de-santiago` → título correcto,
**"29 lugares"**, 6 destacados + mención renderizan. **Prod = 339 total / 334 PUBLISHED / 29 `cuisine=sushi`.** Conexión a prod vía `PROD_DB_URL`
temporal en `.env.local` (adapter explícito, nunca el `prisma` local). **Pendiente del usuario (menor):** revisar los **2 PENDING_REVIEW** que quedaron
—**Tensei** (4.7/26, borderline) y **Oroshi** (5.0/77, ficha con dirección vacía)— en `/admin/lugares`; la guía es regla viva → entran solos al
publicarlos + un `prod-sync` posterior. Recordatorio de siempre: **rotar contraseña de Neon prod + borrar `PROD_DB_URL`** al cerrar la campaña de carga.
**Próximo paso (sesión 23):** siguiente vertical de comida (¿**ramen** como seguimiento asiático?) u otra categoría city-wide, o densificar comunas,
mismo flujo: cargar en local → `prod-sync` → push.

**Sesión previa:** 2026-07-03 (sesión 21 — **Lote 3 de pizzerías COMPLETO (32 en local) + guía "Las mejores pizzerías de Santiago"**):
se cerraron las **13 pizzerías que faltaban** del Lote 3 (tras el reset del límite de sesión). **(1) Investigación:** 3 tandas paralelas
del agente `investigador-lugares` (grupos A/B/C = 5+4+4) → 13/13 fichas escritas (escritura incremental, ninguna se perdió). **(2) Ingesta:**
`ingest-fichas` → 12 PUBLISHED + 1 PENDING_REVIEW (St. Giovanni's, duda de sucursal en Las Condes); 4 marcas nuevas (Da Dino, Domani, La
Argentina, St. Giovanni's). **(3) Enrich** (`--force --with-photos`, por los 13 ids internos, sin tocar los otros): **13/13 con rating real
de Google + coords + fotos**, match exacto por `place_id`, 0 sin match; **Apify #1 agotada (402) → rotó sola a la #2**. El `place_id` de St.
Giovanni's resolvió a **Rafael Sanzio 209** → confirmó la sucursal y **despejó el PENDING_REVIEW**. **(4) Publicados los 3 PENDING_REVIEW**
con su dato real (vía `PublishPlaceUseCase`): La Toscana (4.5/569), La Bonn'a (4.4/641), St. Giovanni's (4.7/669). **(5) Alcance de la guía —
decisión del usuario:** **Golfo di Napoli** y **Piccola Italia** son *cocina italiana que vende pizza* (trattorias) → **NO** son pizzerías,
quedan fuera (siguen `cocina-italiana`); **Bar Flama ×2** *sí es pizzería* → se le agregó el tag `cuisine=pizza` (aditivo, idempotente).
**Total: 32 lugares con `cuisine=pizza`.** **(6) Guía "Las mejores pizzerías de Santiago"** (`las-mejores-pizzerias-de-santiago`, molde de
las burgers): regla `cuisineTagSlugs: ['pizza']`, sort `score_desc`, **6 destacados** (Fina Pizza · Pratola · Segreta · La Argentina · Tiramisú
· Pícara Pájara — mezcla de joyas top-score + instituciones más reseñadas, repartidas por la ciudad) **+ 4 menciones** (Locura · Roccko's · La
Dominga · Espacio Pizza — periferia: Peñalolén/Maipú/Quilicura/La Cisterna). Escrita en `scripts/curated-lists.data.ts` + **reseed local OK**
(la guía se creó, resuelve 32). **Typecheck limpio. BD local: 310 places.** Fichas archivadas en `tmp/fichas-lote3-pizza/` (30/30).
**✅ SYNC A PROD + PUSH COMPLETO (misma sesión):** `prod-sync.ts` (`--dry` primero, luego real) creó los **30 lugares** nuevos en prod +
agregó `pizza` aditivo a Bar Flama ×2 + sincronizó el catálogo (incluidos los 3 barrios nuevos). Los **3 lugares que ya estaban en prod con
barrio `null`** (HOPE→Pudahuel Sur, Los Negros→Gabriela, Mendoza Burgers→Los Leones) se **reasignaron con un script puntual por `googlePlaceId`**
(prod-sync no toca fichas existentes salvo tags aditivos). **Prod = local: 305 PUBLISHED / 310 total, 32 `cuisine=pizza`.** Luego `git push`
(`73f0796..1be75e0`) → el build corrió `seed-curated-lists` y **creó la guía en prod**. **Verificado en vivo (HTTP 200):**
`portalpanorama.cl/lista/las-mejores-pizzerias-de-santiago` → título correcto, "32 lugares", los 6 destacados + menciones + intro renderizan.
Conexión a prod vía `PROD_DB_URL` temporal en `.env.local` (adapter explícito, nunca el `prisma` local). **Pendiente del usuario:** decidió
**NO rotar la contraseña de Neon prod todavía** (la deja hasta cerrar toda la carga de contenido; `PROD_DB_URL` quedó en `.env.local` para los
próximos lotes) → **rotar + borrar `PROD_DB_URL` al final de la campaña de carga.** **Próximo paso (sesión 22):** siguiente vertical de cocina
(¿otra categoría city-wide?) o densificar comunas, mismo flujo: cargar en local → `prod-sync` → push.

**Sesión previa:** 2026-07-03 (sesión 20 — **Barrios omitidos arreglados + Lote 3 de pizzerías (17/30 city-wide, en local)**):
**(1) Barrios omitidos del Lote 2 arreglados:** los 3 que la ingesta dejó sin barrio (`neighborhoodId=null`) → agregados al seed
([seed.ts](src/infrastructure/db/prisma/seed.ts) `NEIGHBORHOODS`) + creados en BD local + 3 lugares reasignados por `googlePlaceId`
(exacto): **Los Leones** (Providencia → Mendoza Burgers), **Pudahuel Sur** (Pudahuel → Hope), **Gabriela** (Puente Alto → Los Negros
Sanguechería). **⚠️ Falta replicar en prod:** esos 3 lugares en prod tienen barrio `null` y los 3 barrios no existen allá → va con el
`prod-sync` del Lote 3 o script puntual (`PROD_DB_URL` temporal). **(2) Lote 3 — pizzerías (city-wide):** el usuario aportó una lista
de **30 pizzerías con `place_id`** repartidas por comuna (≥4.3★, excluyendo cadenas industriales y las ya cargadas —Golfo di Napoli,
Bar Flama ×2, Piccola Italia—). Dedup verificado (0 duplicados por `place_id`). **17/30 cargadas + enriquecidas en local:** 5 tandas
paralelas del agente `investigador-lugares` (Sonnet); **4 de 5 toparon el límite de sesión, pero gracias a la escritura incremental por
negocio** (recién cableada en el agente) **se salvaron 17 fichas en disco** (vs 0 la primera vez, que se acumulaban para el final). Flujo:
`ingest-fichas` (15 PUBLISHED + 2 PENDING_REVIEW: La Toscana, La Bonn'a) → `enrich --force --with-photos` (17/17 con rating real de Google
+ coords + fotos, match exacto por `place_id`, 0 mismatches; **Apify rotó sola a la cuenta #2** al agotarse la #1). 5 marcas nuevas
creadas. Los 2 PENDING_REVIEW eran los del conflicto de rating → **resuelto con el dato real** (La Toscana 4.5/569; La Bonn'a 4.4/641),
listos para publicar. **Total BD: 280 → 297 places.** Fichas archivadas en `tmp/fichas-lote3-pizza/`. **(3) Faltan 13** (bloqueadas por
el límite de sesión, **resetea 00:40 Santiago**): tanda 1 completa (Verace, Da Dino, Pratola, Alleria, Domani, La Argentina) + 5 de la 2
(Oro y Carbón, Pizzerino, La Rústica, Fina, St. Giovanni's) + Roma y La Pizzarra de la 3. **(4) Regla de flujo confirmada + grabada:**
escritura incremental de fichas (por negocio, en el agente) + **ingesta por tanda** (memoria `feedback_carga_incremental`), para no perder
research si se corta (sensibilidad del usuario a los tokens). **Próximo paso (sesión 20 cont.):** re-lanzar los 13 tras el reset → `ingest`
→ `enrich` → con las 30 completas, publicar los PENDING_REVIEW + armar la guía **"Las mejores pizzerías de Santiago"** (molde de las burgers)
+ `prod-sync` (incluye replicar los 3 barrios nuevos en prod). Pendiente menor de s19: **rotar la contraseña de Neon prod**.

**Sesión previa:** 2026-06-30 (sesión 19 — **Lote 2 de hamburgueserías (30) + guía "Las mejores hamburgueserías de Santiago" + paginado/contadores en admin**):
**(1) Admin:** **paginado client-side** (25/pág, helper compartido `_lib/pagination.tsx` = hook `usePagination` + `AdminPager`, reutiliza la
clase `.pager`) en las 4 tablas: lugares, marcas, listas, usuarios (marcas y listas pasaron a client components `BrandsAdminList`/
`CuratedListsAdminList`). Además **contadores de Visitas** (`VisitHistory` de usuarios registrados) y **Guardados** (`CollectionItem`) en la
tabla de `/admin/lugares`, vía un `_count` en la query del admin (port `PlaceAdminRow` → adapter → page → tabla). Commit `1692f80`.
**(2) Lote 2 — 30 hamburgueserías** (Vitacura, Macul, La Cisterna, Pudahuel, Huechuraba, Renca, Providencia, Ñuñoa, Puente Alto,
Independencia, San Joaquín, San Bernardo, San Miguel): 5 tandas paralelas del agente `investigador-lugares` con place_id provistos →
`ingest-fichas` (28 PUBLISHED + 2 PENDING_REVIEW luego publicadas) → `enrich --with-photos` (rating + coords + 3 fotos c/u, exacto por
place_id). **Prod pasó de 30 → 60 hamburgueserías** (`cuisine=hamburguesas`), sincronizadas con `scripts/prod-sync.ts` (30/30 creadas,
verificado en vivo). Total BD: **280 lugares**. **(3) 2ª cuenta de Apify** cableada: `APIFY_TOKEN_2` en `.env.local` (la 1ª estaba agotada;
la rotación saltó sola a la 2ª y completó el enrich). **(4) Guía "Las mejores hamburgueserías de Santiago"** (`/lista/las-mejores-hamburgueserias-de-santiago`,
6 destacados + 4 menciones + 50 en grilla): para armarla se **cableó la capa CUISINE como regla de listas y faceta de búsqueda**
(`cuisineTagSlugs` en `CuratedRule` + `SearchParams`, aplicado en `PostgresFTSSearchService.buildWhere`, mapeado en el use case y el repo;
admin de listas lo preserva al editar) — mismo patrón que OCCASION/EXPERIENCE. **El filtro visible "Tipo de comida" en /explorar sigue
diferido**; esto solo habilita el camino regla→búsqueda. Commit `b7de292`. **Typecheck limpio + 99 tests verdes.** **✅ PUSHEADO A PROD**
(`8bb73b4..b7de292`): el build corrió `seed-curated-lists` → creó la guía en prod (las 60 burgers y el tag ya estaban allá); verificado en
vivo (HTTP 200, título + 6 destacados + "60 lugares"). **Pendientes menores (próxima sesión):** barrios reales al seed (Los Leones/Gabriela/
Pudahuel Sur, omitidos en la ingesta) + reasignar; **rotar la contraseña de Neon prod** (quedó visible en el chat al leer `.env.local`).
**Próximo paso (sesión 20):** seguir el Lote 3 (más hamburgueserías otras comunas para densificar, o **pizzerías** como 2ª vertical de cocina)
→ carga en local → sync a prod. Recordatorio: `PROD_DB_URL` temporal en `.env.local`, borrar tras el sync (ya borrada).

**Sesión previa:** 2026-06-30 (sesión 18 — **Footer Instagram + Microsoft Clarity + Dashboard de analítica en el admin**):
**(1) Footer:** Instagram pasó de botón "coming soon" a **link real `@portalpanorama.cl`** (la cuenta definitiva); TikTok/Facebook
siguen sin cuenta (mantienen el aviso, con copy nuevo que invita a Instagram). Commit `32a2cba`, **pusheado a prod**. **(2) Microsoft
Clarity** (heatmaps + grabaciones de sesión) integrado: componente `MicrosoftClarity.tsx` gated por `NEXT_PUBLIC_CLARITY_ID`
(apagado si no está la env var), montado en el layout junto a GA4; `/privacidad` actualizada para declarar GA4 + Clarity (medición
agregada, sin uso publicitario; Clarity excluye campos sensibles). **Project ID = `xf9k6ta2t0`**, env var cargada en Vercel. Commit
`ad0bd2b`, **pusheado a prod** → ya grabando. **Ojo:** Clarity NO tiene API para traer heatmaps/grabaciones al admin → para verlas se
entra a `clarity.microsoft.com` (su UI es simple). **(3) Dashboard `/admin/analytics`** sobre la **Google Analytics Data API**
(arquitectura hexagonal: port `AnalyticsReportService` en application + use case `GetAdminAnalyticsUseCase` + adapter
`GoogleAnalyticsDataService` en infrastructure, el SDK de Google nunca sale de su capa). **Todo filtrado a Chile** (el tráfico extranjero
que se veía en GA4 —Germany/Poland/Isle of Man— es **ruido de bots/VPN**, valor cero; se filtra en el dashboard, no se tocan las
búsquedas del sitio). Métricas: KPIs (usuarios activos/nuevos, sesiones, páginas vistas, sesión promedio, engagement); **conversiones del
producto** (registros, logins, "cómo llegar", guardados, compartidos, búsquedas, reportes); canales de adquisición; páginas/lugares más
vistos; **dispositivo** (móvil/escritorio); **ciudades dentro de Chile**; usuarios activos por día; selector de rango 7/28/90 días.
Degrada con gracia si faltan credenciales. **Verificado contra GA4 real** (filtrado a Chile: **9 usuarios en Santiago**; eventos sí se
guardan — "cómo llegar" 2, guardados 3, búsquedas 3, compartidos 1; registros/logins 0 porque nadie se registró en el rango, no es bug).
Typecheck limpio + 99 tests verdes. **Credenciales:** cuenta de servicio `ga4-reader@portal-panorama-500320.iam.gserviceaccount.com`
(rol Lector en la propiedad GA4 `543054176`); en **local** vía `GA4_KEY_FILE=./ga4-sa.json` (el JSON **gitignored**, nunca al repo); en
**Vercel** vía `GA4_PROPERTY_ID=543054176` + `GA4_SA_CREDENTIALS` (JSON en base64, Sensitive). El secreto **nunca pasó por el chat**
(se copió a base64 directo al portapapeles con `Set-Clipboard`). Commit `29f3fc0`, **pusheado a prod** (env vars ya cargadas → debería
salir con datos en el redeploy). **Decisión registrada:** **multilenguaje parqueado** — la audiencia son chilenos en Santiago, el
tráfico extranjero es bots, y lo caro es traducir 250 fichas + guías; se reevalúa en Fase B+ solo con datos que muestren turistas
reales. **Próximo paso (sesión 19):** verificar el dashboard en vivo tras el redeploy + arrancar el **Lote 2** de contenido
(hamburgueserías otras comunas / pizzerías; carga en local → sync a prod con `scripts/prod-sync.ts`). Pendiente menor: contadores de
visitas/guardados en la lista de `/admin/lugares` (idea original del ítem #3, quedó fuera de esta sesión).

**Sesión previa:** 2026-06-30 (sesión 17 — **Capa CUISINE + fallback de Apify + PUSH A PROD de las sesiones 16-17**):
**(1) Capa de tags CUISINE** (tipo de comida): nueva capa de dominio condicional a **Gastronomía**, sin tope. Las "Cocina X" se
movieron de SPECIFIC a CUISINE (**mismo slug → no se pierden asignaciones**); +12 platos (Pizza, Hamburguesas, Completos, Sushi,
Ramen, Ceviche, Parrilla, Pastas, Brunch…) y +9 cocinas (thai, coreana…). Migración **aditiva** `add_cuisine_tag_layer`
(`ALTER TYPE TagLayer ADD VALUE 'CUISINE'`). Seed + form admin (TAG_LAYER_ORDER/LABELS) + preview + ficha pública + skill
`ficha-lugar` + ingest actualizados → **cada ficha nueva nace born-tagged por tipo de comida**. El **filtro visible "Tipo de comida"
en /explorar queda para después** (con densidad). **(2) Fallback de Apify**: `ApifyRatingProvider` soporta `APIFY_TOKEN` +
`APIFY_TOKEN_2` y rota solo a la 2ª cuenta cuando la 1ª agota cuota (402) o rechaza el token (401/403) → dobla el free tier sin
intervención. Commit `06f6b6e` (feature). **(3) ✅ PUSH A PROD (2026-06-30):** `git push` (`afac110..06f6b6e`, 3 commits: `b9d4360`
guía de cita + `43643a8` docs s16 + `06f6b6e` CUISINE) → Vercel redeployó. El build aplicó las 2 migraciones aditivas
(`add_curated_pin_kind`, `add_cuisine_tag_layer`) y `seed-curated-lists` creó la guía **"Para una primera cita"** en prod.
**⚠️ Gotchas del deploy (pendientes a mano):** (a) el **MUT no existe en prod** → la guía sale con **4** menciones en vez de 5; hay
que crear el MUT en prod (ingest + enrich con `PROD_DB_URL` temporal) y agregar el pin. (b) el **seed de catálogos NO corre en el
build** → la capa **CUISINE y sus platos/cocinas NO se crearon en prod**; no rompe nada (nada está cuisine-tagged aún ni el filtro es
visible), pero **antes de cargar hamburgueserías con `cuisine=` a prod hay que sembrar los tags CUISINE en prod a mano** (script
aditivo + `PROD_DB_URL`, como se hizo con OCCASION/EXPERIENCE en la s14). **Próximo paso:** seguir la **Semana 1** (Lote 1
hamburgueserías + crear redes) o cerrar los 2 gotchas de prod (MUT + tags CUISINE).

**✅ SYNC DE CONTENIDO A PROD HECHO (2026-06-30, misma sesión 17).** Se cerraron los 2 gotchas + se sincronizó el Lote 1 (que ya
estaba **completo en local**: 30 hamburgueserías PUBLISHED, born-tagged `cuisine=hamburguesas`, enriquecidas). Diagnóstico previo:
local 250 / prod 219 → faltaban **31** (30 burgers + MUT); tags CUISINE en prod = **0**; 78 cuisine-tagged en local (48 ya en prod,
30 no). Se construyó **tooling reutilizable** (queda en `scripts/`, para los próximos lotes): **`prod-sync-diag.ts`** (read-only,
compara local vs prod por slug) y **`prod-sync.ts`** (`--dry` primero) que (1) upserta catálogo por **clave natural/slug** —incluidos
los 28 tags CUISINE, reclasificando las "Cocina X" SPECIFIC→CUISINE sin perder asignaciones—, (2) crea los lugares faltantes con
imágenes/tags/rating/coords resueltos contra prod, (3) agrega tags CUISINE **aditivamente** a los que ya estaban. **Garantías:**
resuelve FKs contra prod por slug (nunca reusa IDs locales), **no toca usuarios** (no resetea el admin), **nunca quita** tags
(no pisa OCCASION/EXPERIENCE de la s14), idempotente. **Resultado:** **31/31 creados**, prod ahora **= local (250 places, 28 tags
CUISINE, MUT presente)**; el pin de **mención del MUT** se agregó aparte (la guía se creó en el build sin el MUT → 14 pins; ahora
**15 = 10 destacados + 5 menciones**, idéntica a local). **Verificado en vivo (HTTP 200 + contenido real):** `/lugar/mut-…` (4.7★),
burgers (`/lugar/streat-burger-la-florida`, `/lugar/uncle-fletch-nunoa`), `/lista/para-una-primera-cita` (con MUT) y
`/explorar?cuisine=hamburguesas`. **Conexión a prod vía `PROD_DB_URL` temporal en `.env.local` (cliente Prisma explícito por adapter,
nunca el `prisma` local) → borrar la línea tras el sync.** Patrón nuevo registrado: **el contenido se carga en local y se sincroniza
a prod con `prod-sync.ts`** (los datos NO viajan con `git push`; solo código + migraciones).

**Cierre de la sesión 17 + Instagram (2026-06-30):** se **crearon las redes** (Semana 1 ✅). Hay **dos cuentas de Instagram**:
**`@portalpanorama.cl`** (la que se usará — calza con el dominio) y **`@portal_panorama`** (reservada de respaldo). **Próximo paso
(sesión 18):** **(1) cablear el handle real `@portalpanorama.cl` en el footer** (hoy los íconos dicen *"coming soon"*; el campo
`instagram` ya existe en el modelo y en el footer → cambio chico, **una sola vez** con el handle definitivo, va a prod con `git push`).
**(2) Lote 2 — más hamburgueserías** (otras comunas) → al llegar a ~50 publicar la **guía "Hamburgueserías de Santiago"** + anunciar
en foros; o saltar a **pizzerías**. Recordar: el contenido se carga en **local** y se sincroniza a prod con `scripts/prod-sync.ts`
(+ `PROD_DB_URL` temporal en `.env.local`, borrar tras usar).

**Sesión previa:** 2026-06-29 (sesión 16 — **Guía "Para una primera cita" + tier de menciones honoríficas + navegación**):
se construyó la **primera lista de ocasión** del go-to-market (el quick win de la Semana 1 de julio). **(1) Regla por ocasión:**
`CuratedRule` ahora soporta `occasionTagSlugs`/`experienceTagSlugs` → las listas de ocasión se expresan como **regla viva** (la de
cita usa `occasion=cita`; cualquier lugar nuevo etiquetado entra solo). Desbloquea la **Fase 2** de listas de ocasión. **(2) Tier
"Menciones honoríficas":** nivel intermedio nuevo en las guías (`CuratedPinKind` FEATURED/MENTION) — banda compacta con nota de una
línea, entre los destacados (artículo) y la grilla. Migración **aditiva** `add_curated_pin_kind` (enum + columna con default).
Admin actualizado (chips ocasión/experiencia + toggle destacado/mención). **(3) Guía "Para una primera cita"** (publicada, **81
lugares**): 10 destacados ordenados de gratis/barato → apuesta cara + 5 menciones (GAM · Parque Metropolitano · Sky Costanera ·
Matucana 100 · **MUT**). **(4) MUT creado**: ficha nueva vía skill `ficha-lugar` + **enriquecida con Apify** (match exacto, rating
4.7/7.049, coords, 3 fotos de Google rehospedadas). **(5) Navegación/UI:** paginador **client-side** del resto de la guía (12/pág,
sin recargar); **página pública `/guias`** (índice) + link en header/móvil + sitemap; **botón scroll-to-top** global (oculto en
`/lugar`); pager más visible (hover oscuro); **sombra sutil** en tarjetas de lugar y guía. **Typecheck limpio + 99 tests verdes +
páginas en HTTP 200 (verificado e2e en local).** Commit `b9d4360` (feature). **✅ Pusheado a prod el 2026-06-30 (sesión 17).** **⚠️ Gotcha:** el
**MUT solo existe en local** → en el deploy la guía se crea con 10 destacados + **4** menciones y el MUT se **salta** hasta crearlo
en prod (ingest + enrich con `PROD_DB_URL`, como el resto del contenido); la guía, `/guias` y la migración sí viajaron con el push.

**Sesión previa:** 2026-06-28 (sesión 15 — **Plan de ejecución a 3 meses aterrizado (Fase A / go-to-market)**):
se aterrizó el go-to-market en un plan trimestral con objetivo único, tablero de metas, ritmo semanal y
calendario mes a mes → vive en **[GO_TO_MARKET.md](GO_TO_MARKET.md)** (el cómo/cuándo; STRATEGY.md queda con el
porqué). **Contexto nuevo:** el usuario empezó un trabajo → **~10 h/semana** en bloques de ~50 min/día,
keyboard-first (cargar + escribir guías), difusión liviana (anuncios puntuales en foros + redes creadas).
**Objetivo a 3 meses:** cerrar Fase A y desbloquear la decisión de Fase B (¿Eventos?) con datos de GA4.
**Eje de carga decidido:** por **categoría × todo Santiago** (no solo comunas densas) → cada barrido produce
guía SEO + expande comunas; las comunas se "gradúan" a guía propia en Mes 2-3. **Volumen:** ~300 lugares en
julio, ~400/mes en meses 2-3 (con **2 cuentas de Apify** para doblar el free tier; el techo real pasa a ser el
tiempo de revisión en el admin). **Mes 1 (julio):** hamburgueserías → pizzerías → plazas/parques city-wide +
quick win lista **"Para una primera cita"** (ya hay ~80 con `ocasion=cita`) + crear redes. **Diferido a Mes 2-3:**
vista mapa en /explorar (espera densidad + señal de GA4; coords ya backfilleadas) y skill **`redactar-difusion`**
(drafts human-in-the-loop, solo si el canal manual valida). **Sin código nuevo esta sesión** — solo se escribieron
los docs (GO_TO_MARKET.md nuevo + pointers en STRATEGY.md). **Próximo paso:** ejecutar la **Semana 1 de julio**
(checklist vivo en [GO_TO_MARKET.md](GO_TO_MARKET.md)): publicar la lista "Para una primera cita" o arrancar el
Lote 1 de hamburgueserías.

**Sesión previa:** 2026-06-28 (sesión 14 — **Filtros OCCASION/EXPERIENCE activados en /explorar**):
se activó el segundo bullet de la **Fase A** de [STRATEGY.md](STRATEGY.md) (afilar el core barato): las capas de
tags **OCCASION ("Ideal para")** y **EXPERIENCE ("Experiencia")** ahora son **facetas de filtro reales** en el
rail de `/explorar` (antes vivían solo en la ficha). Mismo mecanismo que el resto (AND de `some` por slug);
claves de URL `ocasion=`/`experiencia=` (CSV). **Vocabulario curado con research** (blogs/guías de panoramas):
3 tags nuevos **aditivos** (sin migración) — OCCASION **"Para días de lluvia"**; EXPERIENCE **"Naturaleza /
áreas verdes"** y **"Bajo techo"**. Cumpleaños y Celebración se dejaron **separados** (decisión del usuario:
hay lugares para cumpleaños infantiles vs. celebraciones en general). Sincronizado en **seed** (reseed local OK:
10 occasion · 12 experience) **+ skill `ficha-lugar`** (para que el contenido nuevo nazca con estos tags).
**7 archivos** (port SearchService · PostgresFTSSearchService · parseSearchParams · explorar/page.tsx con chips
activos reversibles · Filters.tsx con 2 secciones nuevas · seed · SKILL.md). Typecheck limpio + 99 tests verdes.
**Verificado e2e en local:** `?ocasion=cita`→80, `?experiencia=terraza`→26; los 3 tags nuevos dan 0 y la faceta
los **oculta hasta etiquetar contenido** (por diseño). **✅ PUSHEADO A PROD (2026-06-28):** `git push`
(`138197c..9e2ee68`, 3 commits: `e6032ac` spec + `ae61a21` feat + `9e2ee68` docs) → Vercel redeployó (aditivo,
sin migración destructiva). **⚠️ Corrección:** el build de Vercel corre `prisma migrate deploy &&
seed-curated-lists && next build` — **NO corre el seed de catálogos** (`src/infrastructure/db/prisma/seed.ts`),
así que el push **no** creó los 3 tags nuevos en prod ni los etiquetó. **Etiquetado de prod hecho a mano
(2026-06-28)** con un script aditivo e idempotente: crea los 3 tags + asigna PlaceTags por subcategoría primaria
sobre los PUBLISHED. Mapeo: **Naturaleza/áreas verdes** = toda la categoría *Naturaleza y aire libre* (22) ·
**Bajo techo** = subcats indoor de Arte/cultura + Juegos + Vida nocturna + Locales/tiendas, **gastronomía
excluida** del bulk por zona gris de terrazas (103) · **Para días de lluvia** = cultura + juegos + mall (51).
Corrido **local primero** (verificado), luego **prod** vía `PROD_DB_URL` temporal en `.env.local` (borrada tras
correr). Verificado en vivo: los 3 chips aparecen y filtran en `portalpanorama.cl/explorar`. **Gotcha
registrado:** agregar un tag/categoría al seed NO viaja solo con el push; hay que sembrarlo en prod a mano (o
cablear el seed de catálogos al build, pendiente decidir). **Próximo paso:** afinar a mano la gastronomía indoor
para "Bajo techo" y seguir poblando con contenido nuevo (la skill `ficha-lugar` ya nace con estos tags).
**Scope aparte anotado:**
habilitar OCCASION/EXPERIENCE también como **regla de listas curadas** (para armar "Para una primera cita"
automática) — toca el dominio `CuratedRule`, no se hizo. La **Fase 2** (listas de ocasión) ahora está desbloqueada
del lado del filtro.

**Sesión previa:** 2026-06-26 (sesión 13 — **Guías en código + push de Listas Curadas a prod**):
se construyó el sistema de **guías definidas en código** (la idea del usuario: "yo te pido la guía, tú la
armas, se sube sola; no a mano"). **Fuente de verdad:** `scripts/curated-lists.data.ts` (las guías, con sus
lugares por **slug** y los textos de los destacados). **Seed:** `scripts/seed-curated-lists.ts` resuelve
slugs→IDs y crea la guía en la BD destino; cableado al `build` de `package.json` **después** de `prisma
migrate deploy` → cada `git push` deja las guías nuevas en prod solas. **Modo decidido: "admin manda tras
crear" (first-write-wins)** — el código CREA la lista la 1ª vez; una vez creada, el dueño es el admin y sus
ediciones a mano en `/admin/listas` quedan (el seed NO la vuelve a tocar). Consecuencia: editar en el archivo
una guía YA creada no se propaga (se edita en el admin, o se borra ahí y el deploy la recrea). Conservador:
nunca toca listas que no estén en el archivo. **Decisión: sin límite de destacados** (criterio editorial,
rango sano 3-7; los no-destacados salen igual como tarjetas, automático). **Chequeo de migración OK** (prod:
`Collection.ownerId` nulos = **0** → `ALTER ... SET NOT NULL` seguro). **Commit `3c0f964` + PUSH a prod
(`24e5c57..3c0f964`).** **Verificado en vivo ✅:** `portalpanorama.cl/lista/los-mejores-museos-de-santiago`
carga la guía (h1 + 3 destacados con texto + grilla); el build corrió la migración `add_curated_list` y el
seed creó la guía en prod. Typecheck limpio. **Próximo paso:** ir pidiendo guías nuevas (las agrego al
archivo de datos → push → aparecen). **Fase 2** (filtros OCCASION/EXPERIENCE → listas de ocasión) sigue detrás.

**Sesión previa:** 2026-06-26 (sesión 12 — **Listas Curadas: formato editorial + 1ª guía**): se rediseñó
la landing `/lista/[slug]` al formato **guía-revista**: los destacados son **artículos** (imagen al lado +
recomendación hablada en párrafos con **negrita** escaneable + data importante [rating · línea de metro ·
horario] + link "Ver ficha completa"); el resto de la regla queda como grilla de tarjetas debajo. Backend:
read-model **`FeaturedPlaceView`** (`findCardsByIds` ahora trae el horario, solo para destacados); parser de
`**negrita**` seguro; el campo de destacado en el admin pasó a **textarea** multilínea. Se creó la **1ª guía
real (local): "Los mejores museos de Santiago"** (regla = subcategoría museo, 8 lugares, 3 destacados con texto
de verdad) para validar el flujo end-to-end. Typecheck limpio + 99 tests verdes. Commits `8864b93` (rediseño)
sobre `38e92ac` (feature completa). **Falta para prod (sin cambios):** chequeo de la migración
(`SELECT count(*) FROM "Collection" WHERE "ownerId" IS NULL` debe dar 0) → `git push` → recrear/cargar guías en
prod. La guía de museos vive **solo en la BD local**; en prod se crea desde `/admin/listas`.

**Sesión previa:** 2026-06-25 (sesión 11 — **Listas Curadas: presentation completa**): se cerró la
**Fase 1 del ítem (d)** de punta a punta sobre el backend de la sesión 10 — admin `/admin/listas` (tabla +
form con editor de regla por facetas/slugs + destacados) · landing pública `/lista/[slug]` (JSON-LD `ItemList`
+ OG + corazón de guardado) · sección "Guías" en la home · `sitemap.ts`. **Typecheck limpio + 99 tests verdes
+ `next build` OK.** Detalle en el ítem (d) del backlog. **Falta:** commitear (backend s10 + presentation s11),
pasar la migración por `db-migration-reviewer` antes del push a prod, y cargar las primeras guías reales.
**Próximo paso concreto:** commit del bloque completo de Listas Curadas + (con OK) revisar la migración. La
**Fase 2** (filtros OCCASION/EXPERIENCE → listas de ocasión) y el **go-to-market** (STRATEGY §5) siguen detrás.

**Sesión previa:** 2026-06-24 (sesión 9 — **analítica + anti-scraping con visibilidad en IA**):
**(1) GA4** — mapeados los 7 eventos custom (`lib/analytics.ts`): `sign_up`, `login`, `guardar_lugar`,
`click_como_llegar`, `compartir_lugar`, `reportar_lugar`, `buscar`. GA4 solo lista los que ya se
gatillaron (los faltantes aparecen solos). Recomendado marcar `click_como_llegar` como **Evento clave**
(la intención más fuerte de visitar). **(2) Rate-limit de volumen en Vercel Firewall** (lo configuró el
usuario, plan Hobby vía **Custom Rules**, sin redeploy): Path empieza con `/lugar` **OR** `=/explorar` →
**Fixed Window 50 req/60s por IP → Deny 403**. **(3) Bots de IA segmentados (commit `133df9f`)** — en vez
de bloquear toda la IA, se separó en dos grupos en `middleware.ts` + `robots.ts`: **asistentes** (OAI-SearchBot,
ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended…) **leen el TEXTO** → aparecemos cuando alguien le
pregunta a una IA por panoramas, pero `robots.txt` les niega **`/_next/image`** (las fotos optimizadas que se
pagaron vía Apify/Blob); **cosechadores** (GPTBot de entrenamiento, CCBot, Bytespider, Amazonbot, Diffbot…)
**403 en el edge**. Googlebot/Bingbot intactos → **el SEO de búsqueda no se toca**. **Decisión clave:** el
rating NO se esconde (es el `aggregateRating` que da las estrellitas en Google = SEO, y es número público de
Google). Typecheck limpio. **✅ PUSHEADO A PROD (2026-06-24):** `git push` (`8b73ed1..49c7aca`) → Vercel
redeployó y activó el middleware/robots nuevos (el rate-limit de Firewall ya estaba activo). **PENDING_REVIEW
(Tengu, Distrito Pop, NOSU/NoSo) resueltos por el usuario.** **Punto A (cerrar lanzamiento del MVP) = COMPLETO**
salvo GA4, que el usuario revisa el 2026-06-25 (los informes de GA4 salen solos con 24-48h de retraso; el
cableado de los 7 eventos está verificado en código). **Punto C (reevaluación post-MVP) → secuencia
DECIDIDA y escrita en [STRATEGY.md](STRATEGY.md):** ingresos ← audiencia ← go-to-market; Fase A (ahora) =
go-to-market + filtros OCCASION/EXPERIENCE + GA4; Fase B (~1 mes, con datos) = feature de demanda
(hipótesis Eventos); Fase C = monetización de oferta. **Limpieza de docs:** ROADMAP/PRODUCTO/PLANTILLA_CSV
+ insumos `input/` archivados en `docs/historico/`; raíz queda con 8 docs vivos. **Próximo paso concreto:
aterrizar el go-to-market** (STRATEGY §5).

**Sesión previa:** 2026-06-24 (sesión 8 — **push a prod de la sesión 7 + migraciones
automáticas**): **(1) Push a prod** de los 5 commits de la sesión 7 (`bc6df6b`→`179853c`) → Vercel
redeployó con i18n, panel de usuarios, anti-scraper, buzón y footer. **(2) Migración `add_suggestion`
aplicada a Neon prod** (a mano, esta única vez): el `vercel env pull` traía `DATABASE_URL=""` (está
marcada **Sensitive** en Vercel, no se puede leer de vuelta), así que se sacó la **connection string
directa** del branch `prod` de Neon (`ep-billowing-dream-act3f6q5`, sin `-pooler`) → `prisma migrate
deploy` creó la tabla `Suggestion`. **(3) Migraciones automáticas cableadas (nunca más a mano):**
`package.json` build = `prisma migrate deploy && next build`; `prisma.config.ts` usa
`process.env.DIRECT_URL ?? process.env.DATABASE_URL` (las migraciones por conexión **directa**, el
runtime sigue con la **pooled** vía `src/lib/db.ts`, porque el pooler de Neon puede fallar con los locks
de Prisma Migrate); se agregó **`DIRECT_URL`** en Vercel (Production, Sensitive) = conexión directa de
prod. Commit `f79c647`. **De ahora en más: editar en local (BD local aparte, branch `ep-cool-glitter`)
→ `git push` → se sincroniza código + estructura de la BD solo.** **Falta del usuario:** dar **ADMIN a
hernan.pino7@gmail.com en prod** (tras iniciar sesión una vez en el live: `/admin/usuarios` → "Hacer
admin"); **rotar la contraseña de Neon prod** (quedó expuesta en el chat de esta sesión) y actualizar
`DATABASE_URL` + `DIRECT_URL` en Vercel. Próximo gran hito sigue siendo el **C. reevaluación post-MVP**.

**Sesión previa:** 2026-06-24 (sesión 7 — **i18n + herramientas de admin + participación**):
**(1) Español de Chile** — barrido de voseo rioplatense → tuteo en TODO el copy (28 archivos de UI +
emails) y 2 descripciones de fichas (Bocanáriz, Liguria); **regla permanente** en `CLAUDE.md` + skill
`ficha-lugar` + agente `investigador-lugares` para que el contenido nuevo nazca en chileno. **(2) Panel
`/admin/usuarios`** — lista (email, método de login [sin contraseña ⇒ Google], fecha de alta, nº de
guardados), filtros por rol, **hacer/quitar admin** + **borrar usuario** (guards de dominio: no
auto-degradarse ni auto-borrarse; las cascadas limpian datos personales y no tocan lugares/marcas). Se
promovió **hernan.pino7@gmail.com a ADMIN en local** (en prod queda pendiente). **(3) Anti-scraper** —
filtro de User-Agents en el **edge** (`middleware.ts`) para `/lugar/*`+`/explorar` (bloquea curl/
python-requests/scrapy/etc., con allowlist de Googlebot/redes; no gasta cuota de Upstash). **(4) Buzón
`/admin/reportes`** — rescata los reportes "dato incorrecto / lugar cerrado" que **caían invisibles en la
BD** (el puerto solo tenía `create()`) + **sugerencias del público**; resolver/descartar/reabrir/eliminar.
Modelo **`Suggestion`** nuevo + migración `add_suggestion` (local). **(5) Footer rediseñado** — 3 columnas
(logo+redes · links · **tarjeta crema "Ayúdanos a mejorar"** → popup con mini-form de sugerencia,
anónimo-friendly + rate-limit por IP), wordmark chico, redes con aviso "coming soon" (aún sin cuentas).
**(6) Favicon** de marca (`src/app/icon.svg`). Commits: `bc6df6b` (i18n), `c933071` (usuarios+favicon),
`c4d8507` (anti-scraper), `2993b4d` (buzón+sugerencias+footer+borrado). **100 tests verdes**, typecheck
limpio, flujos verificados e2e contra la BD. **Falta para prod (push pendiente):** `prisma migrate deploy`
en Neon prod (crea la tabla `Suggestion`; sin esto las sugerencias fallan) + dar ADMIN a hernan.pino7 en
prod + (de antes) marcar eventos clave en GA4 + Rate Limit en Vercel Firewall. Próximo gran hito sigue
siendo el **C. reevaluación post-MVP**.

**Sesión previa:** 2026-06-24 (sesión 6 — **cierre de lanzamiento + analítica**):
**(1) Dominio `portalpanorama.cl` conectado** — apex = Production, `www` → 308 al apex; DNS en Cloudflare
(CNAME `@` → `…vercel-dns-017.com`, DNS only; los 4 registros de Resend intactos); ambos en Valid Configuration.
`NEXT_PUBLIC_BASE_URL=https://portalpanorama.cl` en Vercel (confirmado vía sitemap en vivo). **(2) GA4 vivo** —
`G-GP1SGZSJ5Q` cableado vía `components/analytics/GoogleAnalytics.tsx` (gtag.js + `next/script`, sin
`@next/third-parties` para no tocar el lockfile), apagado salvo `NEXT_PUBLIC_GA_ID`. **Eventos custom**
(`lib/analytics.ts` → `trackEvent`, no-op si GA bloqueado): `guardar_lugar`, `click_como_llegar` (nuevo
`DirectionsLink`), `compartir_lugar`, `buscar` (search_term), `reportar_lugar`, `sign_up` (modal bienvenida),
`login` (`LoginEventTracker` vía `?ingreso=1`). **(3) Cambiar contraseña logueado** — `ChangePasswordUseCase`
(verifica actual, valida fuerza, distingue OAuth sin pass), `findPasswordHash`/`exists` en UserRepo+Prisma,
sección Seguridad en el tab Perfil con medidor. **(4) Emails con la marca** — plantilla `emailLayout.ts`
(tabla+inline, wordmark, CTA) en bienvenida+reset. Commits: `a512da7`, `3d72658`. 92 tests verdes.
**Falta del usuario (no código):** marcar eventos clave en GA4; **Rate Limit en Vercel Firewall** (`/lugar/*`,
`/explorar`); **resolver los PENDING_REVIEW** (Tengu, Distrito Pop, NOSU/NoSo). Próximo gran hito: el **C.
reevaluación post-MVP** (monetización / próxima feature / go-to-market).

**Sesión previa:** 2026-06-23 (sesión 5 — **prep de deploy, bloque de código sin cuentas externas**):
**(1) Fuerza de contraseña** — política pura `domain/user/PasswordPolicy.ts` (mín. 8 + letra + número para
registrar; score 0-4 premia largo/mayús/símbolos), compartida por el Zod del registro y un **medidor visual**
en vivo (`(auth)/PasswordMeter.tsx`). +6 tests → **92 verdes**. **(2) Recuperar contraseña** — flujo hexagonal
completo: model `PasswordResetToken` (guarda el **hash** del token, single-use `usedAt`, expira 1h), ports
`PasswordResetTokenRepository` + `TokenGenerator`, use cases `RequestPasswordResetUseCase` (respuesta genérica
anti-enumeración) + `ResetPasswordUseCase`, infra `PrismaPasswordResetTokenRepository` + `CryptoTokenGenerator`
(sha256) + `EmailService.sendPasswordReset` + `UserRepository.updatePassword`, páginas `/recuperar` y
`/recuperar/nueva` + link en login + aviso `?reset=1`. **Inerte hasta que llegue la key de Resend** (si el email
falla no rompe ni filtra). **(3) Google cableado pero APAGADO** — provider en `lib/auth.ts` gated por
`googleAuthEnabled` (se enciende solo si existen `AUTH_GOOGLE_ID`+`AUTH_GOOGLE_SECRET`); upsert de User por email
para OAuth; botón "Continuar con Google" condicional (respeta la regla MVP). **(4) Anti-scraping** — limiter
**durable con Upstash** (`lib/rateLimit.ts` → `rateLimitDurable`, REST pipeline INCR+PEXPIRE NX, falla abierto,
cae a memoria sin envs), aplicado a `/api/suggest` (60/min/IP) + migradas las actions registro/reset/reporte.
Payloads ya capados (suggest=6, explorar=24). **Verificado contra la instancia Upstash real.** Rate-limit de
páginas (`/lugar`,`/explorar`) se deja a **Vercel Firewall** (edge, sin quemar cuota free). **(5) Migraciones
Prisma adoptadas** — baseline `0_init` (schema completo, 675 líneas) generado y `migrate resolve --applied`;
local en sync. Prod hará `migrate deploy` limpio. **(6) Borrado** el bloque "DEV — credenciales" del login
(estaba marcado "borrar antes de deploy"). Typecheck limpio. **Upstash configurado** (`.env.local`). **En curso
fuera del código:** dominio **portalpanorama.cl** → nameservers movidos a **Cloudflare** (agustin/brynne) para
poder cargar los registros DNS de **Resend**; esperando propagación. **Pendiente de cuentas del usuario:** Resend
(key + dominio verificado), Google OAuth (client id/secret), Neon prod + env vars en Vercel. **Sin commit todavía.**

**🚀 DEPLOY A PRODUCCIÓN — LIVE (2026-06-23).** La app está **viva** en `portal-panorama.vercel.app`
con los 214 lugares publicados. Camino recorrido en esta sesión: **Resend** dominio `contacto.portalpanorama.cl`
verificado (DNS en Cloudflare, nameservers movidos desde NIC) + envío real OK; **Upstash** configurado;
**Google OAuth** creado y funcionando en prod; **Neon prod = branch `prod`** clonado del branch `production`
(trae los 214 lugares + catálogos + admin + historial de migración, sin migrate/seed manual); **env vars**
cargadas en Vercel (Production); commits pusheados a `main` (estaba 79 commits atrás → subió todo el rediseño
Fase 9 de una). **Tres fixes de prod resueltos en vivo:** (1) `trustHost: true` en NextAuth (sin él, `UntrustedHost`
→ 500 en toda la app porque el Header del layout llama `auth()`); (2) **sharp** no cargaba en linux-x64
(`libvips-cpp.so` missing) → `serverExternalPackages: ['sharp']` + binarios linux agregados al `package-lock.json`
(el lock se había generado en Windows); (3) `AUTH_SECRET` mal cargada en Vercel (corregida por el usuario).
**Pendiente del lanzamiento:** conectar dominio `portalpanorama.cl` (hoy en `*.vercel.app`); **regla de Rate
Limit en Vercel Firewall** para `/lugar`+`/explorar`; **GA4** (analytics, lo quería para el lanzamiento);
estilizar los **emails** con la marca; resolver los **2-3 PENDING_REVIEW**; **mejoras de diseño** (ver backlog).

**Sesión previa:** 2026-06-22 (sesión 4 — parte 2: **Lote oriente cargado — +61 lugares**
[58 en la 1ª pasada + 3 que reintenté tras recortar tags; Pub Golden Music ya existía del Lote 4 →
saltado sin duplicar]. Ataca la concentración Santiago+Providencia [77%] metiendo **Las Condes,
Vitacura, Lo Barnechea, Ñuñoa** + la subcat más flaca **Restaurante** [+30: 6 cocinas × 5] + cafés,
bares, **Cervecería y Mercado/Patio** [estaban en 0], termas, Buin Zoo, Mapulemu, galerías y teatros.
**Catálogo:** se agregó la subcat **Teatro** a *Arte y cultura* [decisión del usuario; sincronizada en
seed + skill `ficha-lugar`] y **5 barrios** al seed [El Golf, Las Tranqueras, Alonso de Córdova, La
Dehesa, Pedro de Valdivia Norte]. **3 en PENDING_REVIEW**: Tengu [muy nuevo, 32 reseñas], Distrito Pop
[pocas reseñas], NOSU/NoSo [conflicto nombre/comuna: el W Santiago es Las Condes no Vitacura, y el resto
se llama NoSo → revisar]. Flujo: 5 corridas del agente `investigador-lugares` con place_ids provistos →
`ingest-fichas` → `enrich --no-coords --with-photos` [coords + fotos de Google, exacto por place_id;
corriendo]. **TOTAL BD: ~211 publicados.** 3 duplicados del Lote 3/4 descartados antes de cargar [RBX,
Patricia Ready, Caupolicán]. Cambios de código sin commit todavía.)

**Sesión previa:** 2026-06-22 (sesión 4 — parte 1: **backfill de coordenadas completo** — los **158
lugares no-archivados ahora tienen lat/lng** [antes faltaban 66: 65 publicados + 1 en revisión]. Vía
flag nuevo `--no-coords` en `enrich-ratings.ts` [apunta solo a los no-archivados sin coords; implica
`--force`, nunca pisa coords curadas — verifica `!place.hasCoordinates()`]. 66/66 con coords, 0 sin
match. El único flag `⚠️ REVISAR` fue el hijo **Happyland Mall Sport**, que matcheó otra sucursal de
la cadena [Happyland Alto Las Condes, Kennedy 9001] — resultó **espurio** [Mall Sport no tiene Happyland;
era un Funtopia que ya no opera] → **borrado** [`DeletePlaceUseCase`]. Mall Sport [padre] quedó intacto
y con coords propias correctas. **→ 153 publicados, 157 no-archivados con coords.** Costo Apify ~$0.44
[66 × ~$0.0067]; saldo del mes: **$3.46/$5 usados → ~$1.54 libres**.
**Insight (cadenas vs. contención):** padre e hijo NO comparten place_id ni coords — cada negocio es su
propia ficha de Google con su pin. El riesgo de mismatch no es la contención sino las **cadenas**
[mismo nombre, muchas sucursales]; el enrich ya pasa la dirección para desambiguar y marca `⚠️ REVISAR`
cuando el nombre no calza. Cambio del script sin commit todavía.)

**Sesión previa:** 2026-06-21 (sesión 3: **Lote 4 cargado — +48 lugares → 160 total** [154
publicados] atacando las 2 categorías flacas: **Juegos y diversión 1→27** y **Vida nocturna 7→26**
publicados [karaokes, escape rooms, arcades, billares, VR, discotecas, clubes de jazz, salas de
conciertos]. Vía 5 corridas del agente `investigador-lugares` → ingesta → enrich `--force --with-photos`.
Las 48 con **coordenadas + fotos** de Google Maps. Marcas nuevas: FUGA Escape Room, Insert Coin Bar.
3 en PENDING_REVIEW [Caleido cerrada, Salón de Pool, Pool Hall Room 9]. Duplicados descartados: Blondie,
La Batuta. **Enrich ahora captura lat/lng** [nueva mejora cableada port→adapter→entidad→use case, no pisa
coords curadas; +2 tests → 86 verdes]. Barrio Universitario agregado al seed [Japimax]. Bar El Bajo →
hijo del GAM. Commiteado en `e3eeea5`.)

**Sesión previa:** 2026-06-21 (sesión 2: **lado usuario cerrado** — vista de detalle de listas
guardadas con gestión; dashboard a 3 tabs reales; **popup de compartir** con redes; **perf de ficha**
[recordVisit con `after()` + queries en paralelo]. Commits: `03ce143`, `455a9e3`, `33d5a05`)

---

## ▶️ PRÓXIMA SESIÓN (anotado 2026-06-23, post-deploy)

**La app ya está LIVE** en `portal-panorama.vercel.app`. Lo que queda, en orden sugerido:

**A. Cerrar el lanzamiento del MVP (terminar el deploy "completo"):**
1. **Conectar el dominio `portalpanorama.cl`** 🔄 **EN CURSO (2026-06-23, sesión 6)** — dominio agregado en
   Vercel (apex = Production, `www` → 308 al apex), DNS cargado en **Cloudflare** (CNAME `@` →
   `25c484b02719a924.vercel-dns-017.com`, DNS only; los 4 registros de Resend intactos). Ambos dominios en
   **Valid Configuration ✓**; SSL de `www` generándose. **Falta del usuario:** setear `NEXT_PUBLIC_BASE_URL`
   = `https://portalpanorama.cl` en Vercel (Production) + redeploy. La redirect URI de prod de Google ya
   está registrada (`portalpanorama.cl/api/auth/callback/google`).
2. **GA4 (analytics)** — ✅ **código cableado (2026-06-23, sesión 6):** `components/analytics/GoogleAnalytics.tsx`
   (gtag.js vía `next/script`, **sin** `@next/third-parties` para no tocar el lockfile en Windows), apagado
   salvo que exista `NEXT_PUBLIC_GA_ID` (leído en `lib/analytics.ts`). **Falta del usuario:** crear la propiedad
   GA4 + Data Stream web → poner `NEXT_PUBLIC_GA_ID` en Vercel. Pixels (Meta/Google Ads) recién cuando se paute.
3. **Regla de Rate Limit en Vercel Firewall** para `/lugar/*` y `/explorar` (anti-scraping a nivel edge;
   el rate-limit de app ya está con Upstash en /api/suggest + actions).
4. **Emails con la marca ✅ HECHO (2026-06-23, sesión 6)** — plantilla branded compartida
   `infrastructure/email/emailLayout.ts` (tabla + inline styles, wordmark "Portal *Panorama*", colores del
   handoff en hex, CTA con botón, preheader, footer); `ResendEmailService` (bienvenida + reset) la usa.
5. **Resolver los 2-3 PENDING_REVIEW** (Tengu, Distrito Pop, NOSU/NoSo) — publicar/archivar/eliminar.
6. **Cambiar contraseña estando logueado ✅ HECHO (2026-06-23, sesión 6)** — `ChangePasswordUseCase`
   (verifica la actual con `PasswordHasher.verify`, valida fuerza con `evaluatePassword`, distingue cuenta
   OAuth sin contraseña → `NoPasswordSetError`); `findPasswordHash`/`exists` en `UserRepository` + Prisma;
   `changePasswordAction`; sección **Seguridad** en el tab Perfil con `ChangePasswordForm` + `PasswordMeter`.
   92 tests verdes, typecheck limpio.

**B. Cambios de diseño (el usuario irá listando):**
- ✅ HECHO: barra de acción de la ficha (móvil) aparece al scrollear, no de entrada.
- 🔄 login/registro desktop sin scroll: el intento de scroll interno del form metía un scrollbar feo →
  se descartó eso y en su lugar se **achicó el footprint del form** (padding vertical, margen de las tabs,
  tamaño del título, márgenes del logo/subtítulo) para que entre en `100dvh - 72px` sin scroll. Verificar
  en distintos altos de ventana; si en pantallas muy bajas aún desborda, la página scrollea (fallback OK).
- Pendiente: el usuario tiene más ajustes de diseño para listar (sesión de diseño con su flujo de refs).

**C. 🧭 HITO ESTRATÉGICO — reevaluación post-MVP → ✅ SECUENCIA DECIDIDA (2026-06-24).**
La estrategia quedó escrita en **[STRATEGY.md](STRATEGY.md)** (fuente de verdad del punto C). Resumen de
lo decidido:
- **No se reabre la monetización ni se elige la próxima feature todavía** — ambas dependen de tener
  audiencia/datos. El modelo de monetización ya definido (PLAN_FASE9 §Bloque 6) sigue en pie, parqueado.
- **La cadena del ingreso manda el orden:** ingresos ← vender visibilidad ← audiencia ← tráfico+retención.
  Por eso primero **go-to-market**, no construir monetización.
- **Secuencia A/B/C:** **Fase A (ahora)** = go-to-market + afilar el core barato (activar filtros
  OCCASION/EXPERIENCE) + medir con GA4. **Fase B (~1 mes, con datos)** = elegir el feature de demanda
  (hipótesis: Eventos). **Fase C** = encender monetización de oferta sobre la audiencia ya construida.
- **Próximo paso concreto:** aterrizar el **go-to-market** (STRATEGY §5) en acciones — objetivo medible,
  canal a atacar primero, calendario, qué se mide en GA4.
- **Idea parqueada (2026-06-26):** sistema de **reclamo de ficha + cuenta de negocio** (User +
  BusinessProfile 1:1, reclamo de Place o Brand, verificación por admin). Diseño completo anotado en
  [BUSINESS_ACCOUNTS_SPEC.md](BUSINESS_ACCOUNTS_SPEC.md). **NO construir hasta Fase C** (es la base del
  self-service de oferta; depende de tener audiencia). Solo quedó documentado, sin código.

---

## ▶️ Plan de acción — próxima sesión (recomendado)

**Hecho en la sesión 2 (2026-06-21):** ✅ cerrado el lado usuario (detalle de listas guardadas + gestión,
dashboard a 3 tabs reales) · ✅ popup de compartir con redes · ✅ perf de la ficha (recordVisit no bloquea
el render + queries en paralelo). Todo commiteado en `main` (`03ce143`, `455a9e3`, `33d5a05`).
**Pendiente transversal de todo lo anterior:** verificación e2e humana fina + **va a prod con el push**.

Orden sugerido para retomar.

1. **✅ HECHO (sesión 3) — Cargar las categorías flacas.** Juegos y diversión 1→27 y Vida nocturna 7→26
   publicados (Lote 4, +48). Siguiente densidad si se quiere: más comunas núcleo / subcategorías aún
   delgadas. Flujo validado: skill desktop "modo carga" → place_id → agente `investigador-lugares` →
   `ingest-fichas` → `enrich-ratings --force --with-photos`.
2. **✅ HECHO (sesión 4) — Backfill de coordenadas de los lugares VIEJOS.** Se agregó el flag
   `--no-coords` a `enrich-ratings.ts` (apunta solo a los no-archivados sin lat/lng; implica `--force`,
   nunca pisa coords curadas). **66/66 enriquecidos con coords, 0 sin match** → todos los no-archivados ya
   tienen lat/lng. Costo ~$0.44. El único flag REVISAR (hijo **Happyland Mall Sport**) resultó espurio y
   se borró (ver header). **→ 153 publicados.** Habilita pin/mapa y "abierto/cerca".
3. **Preparar el deploy (P0).** (a) **Anti-scraping** ANTES de publicar (ver P0 abajo: rate-limit por IP en
   rutas de catálogo + WAF/bot management + no exponer endpoint JSON masivo). (b) **Registro seguro**
   (fuerza de contraseña + verificación de email). (c) **Checklist de prod**: decidir workflow de BD
   (`db push` vs migraciones) + schema/seed en Neon prod + `RESEND_API_KEY` real + confirmar
   `BLOB_READ_WRITE_TOKEN` + redeploy con la presentation nueva.
4. **Consistencia de CSS (deuda, no bloqueante).** Design system propio: variables (`--s-x`, `--ink-100`…)
   + clases semánticas BEM en `globals.css` (~800 className). **Tailwind v4 importado pero sin usar las
   utilities** (peso muerto salvo el reset) + **~154 `style={{}}` inline** (sobre todo `mi-cuenta/*`, login,
   ProfileForm). Estandarizar en variables+clases, migrar inline recurrentes a clases, y **decidir Tailwind**.

**Optimización ya cubierta (no re-abrir sin necesidad):** ISR de la ficha quedó **descartado a propósito** —
el Header del root layout llama `auth()` (toda la app es dinámica), pero la sesión es **JWT** (sin hit a BD),
así que el costo es bajo; cachear exigiría refactor global del chrome (riesgo alto / payoff bajo). Detalle
en el backlog, ítem (e.2).

---

## 📍 Estado actual

**Fase 9 (rediseño) — Etapa 5 (cargar lugares) 🔄 en curso.**

- La app **compila completa** sobre el modelo `Place`. Etapa 4 (refactor dominio→UI) ✅: ficha,
  explorar y home reescritas con sus refs aprobadas + búsqueda con autocompletado tolerante a typos.
- **Admin CRUD de Place** construido y **verificado e2e** ✅ (lista, form crear/editar ~30 campos,
  publicar/archivar, guard ADMIN + Zod). Es la herramienta para cargar contenido.
- **Flujo de guardado** cerrado ✅ (lista "Favoritos" por defecto + corazón marcado donde ya guardaste).
- **Primera ficha real subida** por el form (2026-06-13).
- **BD local** en el schema nuevo con catálogos completos. **Prod sigue sobre el código viejo** —
  el redeploy va junto con el push de prod.
- **Sesión taxonomía (2026-06-14) ✅:** se rediseñó el catálogo. **Regla de clasificación** ("la
  categoría = por qué vas, no lo incidental"). **8 categorías** (nueva **Entretenimiento** activa para
  venues nocturnos/actividad; la event-only pasó a *Shows y espectáculos*). **6 capas de tags** (antes
  4): `AUDIENCE` (¿con quién?, máx 4) · `OCCASION` (Ideal para, máx 3) · `VIBE` (máx 3) · `EXPERIENCE`
  (incl. `vida nocturna`) · `SERVICE` · `SPECIFIC`. Topes solo en las subjetivas. Decisión registrada:
  cuando se enciendan Eventos, un Place podrá tener su cartelera en su propia ficha (como las fichas
  hijo). Código migrado (12 archivos, compila) + BD local reseedeada. Detalle en [PRD.md](PRD.md).
- **Tests de dominio (2026-06-15) ✅:** primera suite real — **59 tests Vitest** (puros, sin BD,
  <1s) sobre las invariantes críticas: `Score.bayesian` (orden por defecto de la búsqueda), topes de
  tags por capa, anti-ciclo de contenedores, transiciones de estado de `Place`, ownership de
  colecciones (anti-IDOR), VOs `Slug`/`Email` y matching fuzzy. Colocados como `*.test.ts` junto al
  código. Corre con `npm test` o la skill **`/tests`**. Typecheck y `next build` siguen limpios.

---

## 🔎 Auditoría de código (2026-06-15)

Revisión objetiva completa (arquitectura, BD, flujo, seguridad). **Veredicto: el código está bien** —
capas hexagonales respetadas de punta a punta, typecheck limpio, build OK, auth y ownership sólidos
(sin IDOR). Lo que falta no son bugs sino **infra de lanzamiento** + **drift de docs**. Hallazgos
volcados al backlog y al checklist de abajo. Los principales:

- **SEO de ficha inexistente** (era diferenciador del producto): sin JSON-LD, sin `sitemap.ts`/
  `robots.ts`, sin canonical/OG, y **todo renderiza dinámico** (no hay ISR pese a lo que dice
  ARCHITECTURE.md → "SEO"). Ítem (e), ahora bloqueante.
- **Drift de documentación** (corregir; confunde a quien retome con la skill `retomar`):
  `SCHEMA.md` aún describe 4 capas de tags y 7 categorías (real: **6 capas, 8 categorías**);
  el comentario header de `schema.prisma:15` dice "4 capas"; `ARCHITECTURE.md` afirma que el código
  "todavía está sobre `Listing`" (falso, ya migrado) y que las rutas se protegen por `middleware`
  (no existe `middleware.ts`; se hace por layout + re-chequeo en cada action). `lib/config.ts` es
  **código muerto** (nadie lo importa; expone `flowPlanId` de Flow, parqueado) → borrar.
- **Sin rate-limiting** en `reportPlaceAction` (anónimo puede spamear) ni en registro (bots).
- **Faltan `error.tsx` / `loading.tsx` / `not-found.tsx` custom** (solo el default de Next).

---

## ✅ Resueltos recientes (2026-06-20)

- **Link "Ver reseñas ↗" en la ficha (2026-06-25).** Debajo del rating de Google, un link a las
  reseñas del negocio en su ficha de Google (`search.google.com/local/reviews?placeid=…`); solo
  aparece si hay `googlePlaceId`. Costo cero, sin riesgo de ToS (no rehospeda texto). **Mostrar
  snippets de reseñas en la ficha quedó DIFERIDO a Fase C** (su valor es vender la ficha al negocio;
  hoy suma costo Apify + staleness + zona gris legal por el texto/autor). Cuando se enciendan reseñas
  **internas**, ver la idea de notas por dimensión en [STRATEGY.md](STRATEGY.md) §4 (Fase B).
- **Bar Flama: las dos sucursales reales son Providencia + Lastarria.** La ficha estaba como "Bar Flama
  (Merced)" pero su contenido describe el bar de Lastarria (pin del usuario: -33.4374816, -70.6420574,
  a ~250 m de Merced 346). Se **renombró** "Bar Flama (Merced)" → **Bar Flama (Lastarria)** (slug
  `bar-flama-lastarria`) y se afinaron las coords al pin, en vez de borrarla (habría dejado solo
  Providencia). Quedan 2 bajo la marca `bar-flama`: Providencia + Lastarria. **Re-enriquecido (2026-06-21) ✅:**
  Apify confirmó el match (Bar Flama · Merced 346, sin flag de revisar), rating **4.5/673**, score 4.51,
  place_id correcto; se borró la foto vieja y se rehospedaron **3 fotos de Google Maps** al Blob.
- **"Cómo llegar" ahora apunta a la ficha de Google del negocio.** Antes el link usaba solo la dirección
  en texto (`destination=<dir>`), que Google a veces geocodifica a un punto. Ahora prefiere el **place_id**
  (`destination_place_id`) cuando existe → abre las indicaciones a la ficha exacta del lugar; cae a
  dirección y luego a coords. Se expuso `googlePlaceId` en el read-model `PlaceDetailView` (ficha pública
  + preview admin). Typecheck OK, verificado en runtime.

- **Filtro "¿Dónde?" con "Ver más" (2026-06-21) ✅.** Comuna y Barrio listan muchas opciones; ahora
  muestran solo las **3 con más resultados** y un link **"Ver más (N)"** que revela el resto (toggle a
  "Ver menos"). `CollapsibleChipSet` ordena por count desc y, si la opción activa queda oculta, arranca
  expandido. Metro queda igual (pocas líneas). En `Filters.tsx` + estilo `.filter-more`.

## ▶️ Próximos pasos (en orden)

> **✅ Brand (MVP mínimo) CONSTRUIDO + e2e OK (2026-06-18) — solo falta prod.** Entidad `Brand` de punta a
> punta: schema (model Brand + `brandId` en Place **y** Event, db push local OK), dominio
> (`Brand` aggregate), aplicación (port `BrandRepository` + use cases create/update/getPage/forEdit/
> listForAdmin + `BrandPageView`), infra (`PrismaBrandRepository` + `brandId` en PrismaPlaceRepository),
> presentation (admin CRUD `/admin/marcas`, selector "Marca" en el form de Place, bloque "Por [Marca] ↗"
> en la ficha, página pública `/marca/[slug]` con grilla de locales + JSON-LD Organization). Typecheck +
> 84 tests verdes; rutas compilan sin error. **e2e OK (2026-06-18)** (marcas reales creadas + vistas en
> `/marca/[slug]`; fix del preview de logo). Solo falta el push a prod. Decisiones en [BRAND_SPEC.md](BRAND_SPEC.md) §10.

0. **✅ HECHO (2026-06-14) — flujo de imágenes (ítem p).** Tres caminos (subir archivo · pegar URL
   permitida · "Traer" desde URL externa con guardas anti-SSRF), todos rehospedan en **Vercel Blob** y
   comprimen a `.webp`. Token de Blob arreglado en `.env.local` (store `portal-panorama-images`).
   Verificado e2e. Detalle en el backlog (p) y PLAN_FASE9.
1. **Cargar ~5 lugares reales a mano** por el form de admin, para validar el flujo end-to-end con
   contenido de verdad (incl. un caso contenedor real: Parquemet → Cerro/Zoo). (NO 100 a mano — el
   grueso va por CSV.) — **desbloqueado**: ya se puede cargar con fotos.
2. **Push a prod (Neon):** migración + seed de catálogos en la BD de producción + redeploy con la
   presentation nueva. Setear `RESEND_API_KEY` real (si no, la bienvenida no se envía).
3. **Importador CSV** (ítem h) — ⤳ **cubierto por otra vía (2026-06-14):** se construyó la
   **ingesta por agente** (ver abajo), que habilita el ritmo sin armar el CSV. El CSV queda como
   alternativa si se prefiere edición en planilla.

---

## 🤖 Carga asistida por agente — ✅ CONSTRUIDA (2026-06-14)

Flujo para cargar lugares en lote con investigación automática + revisión humana:

1. **Skill `ficha-lugar`** (`.claude/skills/`) — investiga un lugar chileno (Google Maps, sitio,
   redes, blogs) y arma la ficha respetando el catálogo actual (5 cats activas, 6 capas de tags,
   enums). Por defecto entrega Markdown; JSON solo si se pide. Incluye la **regla de cuál ficha de
   Google usar** (padre-hijo): Parquemet usa el rating del parque, el Cerro el suyo, el funicular = spot.
2. **Agente `investigador-lugares`** (`.claude/agents/`) — corre la skill para una lista de nombres y
   escribe un JSON por lugar en `tmp/fichas/`. No toca la BD.
3. **Script `scripts/ingest-fichas.ts`** — lee los JSON, resuelve nombres→IDs del catálogo (reusa
   `GetPlaceFormOptionsUseCase`), **rehospeda las imágenes** con el pipeline de "Traer", crea cada
   lugar como **PENDING_REVIEW** (borrador, nunca publica) y **reporta lo que no calza**. Tiene `--dry`
   (valida sin crear ni rehospedar). Maneja contenedores (ordena padres primero).
4. **Control humano:** se revisa y publica a mano en `/admin/lugares` (con el Preview). El gate vive
   en el admin, no en el JSON.

**Verificado e2e (2026-06-14):** dry-run resolvió todo el catálogo de una ficha; corrida real creó el
borrador con imagen rehospedada; limpieza OK. `tmp/` quedó en `.gitignore`.

---

## 🧩 Feature lugares contenedores + spots — ✅ CONSTRUIDA (2026-06-14)

Caso real al cargar fichas: Parquemet contiene Cerro San Cristóbal / Zoológico; el MUT contiene
locales. Se modeló en **dos niveles**, sin reintroducir "tipo" de Place (el padre es un Place normal
que además agrupa). Razonamiento en [PLAN_FASE9.md](PLAN_FASE9.md) (bullet "DECISIÓN CERRADA — Lugares
contenedores"). **Compila y reseed local OK; falta probarla cargando un caso real (Parquemet) por el
form, y va a prod con el push.**

1. **Hijos CON ficha** (Zoo, Cerro: tienen rating/horario y filtran solos) → `Place.parentId String?`
   self-relation, **cardinalidad 1**, `onDelete: SetNull`. Anti-ciclo: self-parent en el dominio +
   chequeo transitivo de ancestros en `UpdatePlaceUseCase` (`findAncestorIds`). UI: **1 nivel**. En la
   ficha del padre van como `PlaceCard` **variante lista** bajo "Qué hay en [X]" (distinta de "También
   te puede gustar"). En la ficha del hijo: badge "Parte de [X] ↗" (solo si el padre está publicado).
2. **Spots SIN ficha** (miradores, kioscos) → tabla `PlacePoint { id, placeId, name, description?,
   kind?, sortOrder }`. **Cuelgan de cualquier Place, incluido un hijo.** Lista de texto, sin
   filtro/reseña/link, agrupada con los hijos bajo "Qué hay en [X]".

**Qué quedó pendiente / cómo afinarlo:** el selector de padre del form lista todos los lugares y solo
excluye el propio (en edición); los ciclos transitivos los rechaza el servidor con mensaje, no la UI.
Los hijos del padre se muestran solo si están PUBLISHED.

---

## 📋 Backlog (pendientes, no bloquean el lanzamiento salvo lo marcado)

**Ideas del usuario usando la app (anotadas 2026-07-10, sesión 26 — triage de Claude):**
- **Quick wins de UI (una sesión corta de código):**
  - *Guardar en lista:* feedback claro al guardar ("se agregó a X" / "se creó X y se agregó") y
    mostrar en qué listas YA está guardado un lugar (hoy no se ve).
  - *Filtro de orden en /explorar:* hoy solo score; agregar alfabético y precio (selector chico).
  - *Badge de "nuevo" en el admin:* pestañas Reportes/Sugerencias con contador de no-leídos.
  - *Chips de categoría/tags clickeables en la ficha* → llevan a /explorar con ese filtro (decisión
    de diseño pendiente: el usuario duda si quiere que naveguen fuera de la ficha).
- **Features medianas (necesitan diseño/datos):**
  - *Distancia "a X metros de ti" en las tarjetas* (permiso de geolocación; coords ya existen).
  - *Búsqueda contextual/semántica* ("dónde comer helado con mi pareja" → recomienda): el buscador
    tokenizado (s25) cubre parte; la versión completa es embeddings/LLM — evaluar en Fase B.
  - *Reseñas desglosadas por tema* (atención, sabor, accesibilidad): grande — implica reviews propias
    (hoy solo rating de Google) o minería de reseñas de Google. Va con la decisión de producto Fase B.
  - *Estacionamientos cercanos (re-triaged s28):* **NO se cargan como fichas del catálogo** — un
    estacionamiento no es un "lugar que vale la pena", diluiría score/explorar/guías. El valor es
    "dónde estaciono cerca de X" (pagado o gratis) como **dato de la ficha** y, a futuro, insumo del
    **planificador IA del panorama completo** (norte del usuario: la IA arma la cita entera — flores
    → chocolates → restaurante → estacionamiento). **UX acordada con el usuario (s28):** en la ficha,
    el dato "Estacionamiento" es clickeable y abre un **pop-up liviano** con los estacionamientos
    cercanos — poca info: nombre, dirección y si es pagado o gratis — al estilo de los lugares-hijo
    pero SIN ficha propia (no entran al catálogo ni al score). Implementación candidata: Places API
    nearby en el enrich o capa de datos aparte. Fase B+.
  - *Complementos de cita como verticales de carga (idea s28, alimenta el mismo norte IA):*
    chocolaterías · florerías · tiendas de plantas — las subcategorías ya existen en el catálogo
    (`locales-tiendas/chocolateria`, `floreria`, `tienda-de-plantas`) y hay **0 cargadas**; encargo
    de búsqueda entregado al usuario en la s28. Pastelerías (`gastronomia/pasteleria-panaderia`,
    también en 0) como vertical hermana siguiente.


**Calidad / bloqueante de lanzamiento:**
- **(p) Flujo de imágenes ✅ HECHO (2026-06-14)** — tres caminos para poner una foto, todos terminan
  rehospedados en **Vercel Blob** y comprimidos a `.webp` (`sharp`, ≤2000px, q80): (1) **subir archivo**
  desde el form; (2) **pegar URL** de un host permitido; (3) **"Traer" desde una URL externa** (blog/web):
  el server la descarga con **guardas anti-SSRF** (bloquea IPs privadas/metadata, redirect revalidado,
  límite 15MB, timeout, valida content-type), comprime y rehospeda. Verificado e2e contra el Blob real.
  Hexagonal: ports `ImageProcessor`/`StorageService`/`ImageFetcher`, use cases `UploadPlaceImageUseCase`
  + `ImportImageFromUrlUseCase`, actions con guard ADMIN. **UploadThing** queda como alternativa no
  cableada. **Caveat anotado:** rehospedar fotos de terceros (blogs, Google Maps) es responsabilidad
  de copyright/ToS del usuario. Decisión + comparativa de costos en PLAN_FASE9.md.
- **(g) Páginas legales ✅ HECHO (2026-06-15)** — `/terminos` y `/privacidad` creadas con contenido
  real (Ley 19.628: datos, cookies, derechos ARCO, contacto). **Pendiente: revisión por abogado**
  antes de lanzar (hoy es un borrador sólido, no texto legal validado).
- **(e) SEO de la ficha:** ✅ **HECHO (2026-06-15)** — JSON-LD `LocalBusiness` (con address/geo/
  aggregateRating/sameAs), metadata rica (canonical + OpenGraph + Twitter), `metadataBase` global,
  `sitemap.ts` (rutas estáticas + un `<url>` por lugar publicado, vía use case nuevo) y `robots.ts`
  (bloquea admin/cuenta/api/auth). Verificado en runtime.
  - **(e.2) Perf de la ficha — parcial (2026-06-21).** ✅ **`recordVisit` ya no bloquea el render**
    (corre con `after()` de `next/server`, tras enviar la respuesta) + las dos queries del usuario
    (ficha + contexto de guardado) van **en paralelo** (`Promise.all`). ⏸️ **ISR descartado por ahora:**
    toda la app es dinámica porque el **Header del root layout llama `auth()`** (no solo la ficha); pero
    la sesión es **JWT** (`strategy: 'jwt'`), así que `auth()` no pega a la BD y el costo "dinámico" es
    bajo. Cachear por SEO/escala exigiría convertir el Header a auth-en-cliente (refactor global del
    chrome, riesgo alto / payoff bajo con JWT) → proyecto aparte si se necesita.
- **(q) Docs desincronizados ✅ HECHO (2026-06-15)** — `SCHEMA.md` (6 capas / 8 cats + socialLinks +
  contenedores + ya migrado), header y comentarios de `schema.prisma`, `ARCHITECTURE.md` (código
  migrado + protección por layout/action). `lib/config.ts` borrado.
- **(r) Páginas de error/estado ✅ HECHO (2026-06-15)** — `error.tsx`, `loading.tsx`, `not-found.tsx`
  custom con el estilo del sitio (`.status-screen`).
- **(s) Rate-limiting ✅ HECHO (2026-06-15)** — `lib/rateLimit.ts` (ventana fija en memoria,
  best-effort) en reportes (5/10min por IP) y registro (5/h por IP). Para algo robusto, mover el store
  a Redis/Upstash detrás de la misma firma.

**Seguridad del registro (i):** (i.1) formato email ✅ ya valida · (i.2) **fuerza de contraseña** (hoy
solo `min(8)`; sumar reglas + medidor) · (i.3) **verificación de email** (token de un uso + gateo) —
más adelante; requiere `RESEND_API_KEY` real + considerar rate-limit anti-bots.

**Mejoras del form de admin:**
- **(x) Lista admin: eliminar + filtros + archivados separados ✅ HECHO (2026-06-20)** — la tabla de
  `/admin/lugares` ahora tiene **borrado duro** (`DeletePlaceUseCase` + `delete()` en port/repo; las
  relaciones caen por Cascade/SetNull, sin huérfanos; botón "Eliminar" con confirmación irreversible,
  aparte de Archivar que preserva historial) + **filtros** (pestañas por estado con conteo, búsqueda por
  nombre, dropdown de categoría; client-side sobre `PlacesAdminList`) + **archivados separados** (el
  default "Activos" excluye ARCHIVED; los archivados viven en su propia pestaña). Typecheck + 84 tests OK.
  **Modal de confirmación (2026-06-21):** "Eliminar" ahora abre un modal (no `window.confirm`) con un
  **checkbox de confirmación** ("Sí, entiendo que es permanente…") y el botón Eliminar **deshabilitado
  hasta tildarlo**. (Fix de paso: la variable CSS inexistente `--bg-base`/`--fg-base` dejaba la pestaña
  "Activos" sin texto y un input de perfil sin fondo → `--bg-raised`/`--ink-100`.)
- **(k) Autosave del borrador** — ⏸️ descartado por el usuario (problema raro; no vale la pena).
- **(n) Botón "Preview" ✅ HECHO (2026-06-15)** — `PlacePreview` cliente que abre un overlay con la
  ficha real (reusa las clases `.ficha`), resuelve ids→nombres desde las `options` del form y usa
  `<img>` plano (la URL en preview puede ser de un host fuera de la allowlist). No toca BD ni guarda.
- **(m) Mejor captura de lat/lng** — link de Google Maps / mini-mapa con pin / geocoding desde dirección. Decidir costo vs. fricción.
- **(a'') Validar en el use case ✅ HECHO (2026-06-15)** — `assertCategoryConsistency` (compartido por
  create/update) verifica contra el catálogo asignable que la subcategoría (principal y secundaria)
  pertenezca a su categoría; lanza `PlaceCategoryMismatchError` (DomainError, surface en la action).
  Se inyectó `CategoryRepository` en ambos use cases. +5 tests.

**Sistema de tags — sesión dedicada (o) + (j): ✅ HECHA (2026-06-14).** Se rediseñó a 6 capas (ver
"Estado actual"). Quedan 3 colas:
- **(o.4) Podar SPECIFIC** — se quitaron los que se duplicaban con capas universales; falta la poda fina
  de "atributos que no hacen sentido", lista por categoría para vetar.
- **(o.6) Sumar "Ideal para" (OCCASION) y "Experiencia" como filtros** — hoy viven en la ficha pero el
  FilterRail solo filtra ¿con quién?/servicios/vibe. Pasada de UI aparte (toca FilterRail + parseSearchParams).
- **(o.7) Tags pendientes de pulir:** revisar exclusiones mutuas; `LGBT+ friendly` recién agregado.

**Schema / modelo:**
- **(w) Entidad `Brand` / Negocio (marca con varias sucursales) — ✅ CONSTRUIDA (2026-06-17), falta e2e humano + prod.**
  Agrupa las sucursales de una marca bajo una identidad comercial + bloque "Por [Marca] ↗" en la ficha +
  página `/marca/[slug]` con todas sus sucursales publicadas. Eje nuevo (`brandId`), ortogonal a `parentId`
  (contención) y `ownerId` (gestión). **Insight Brand×Eventos (caso "Honesto Mike"):** Brand es la
  **entidad paraguas**; debajo cuelgan **Places** (real hoy) y **Events** (futuro), independientes —
  `brandId` es FK explícito en **ambos** (`Event.brandId` reservado mientras Eventos sigue apagado; una
  marca puede tener solo eventos sin local). Hexagonal de punta a punta (domain `Brand` · port
  `BrandRepository` · use cases · `PrismaBrandRepository` · admin CRUD + selector en form Place + ficha +
  `/marca/[slug]` con JSON-LD Organization). Typecheck + 84 tests OK. Decisiones en [BRAND_SPEC.md](BRAND_SPEC.md) §10.
  **Brand vs. Cuenta (§11, 2026-06-17):** cuenta gestiona marca agrupa lugares (cadena, no lo mismo); en
  MVP la marca la crea el **admin** (no hay cuentas de negocio), el flujo "el dueño se registra y agrega
  lugares" es self-service post-MVP montado encima de Brand. Puerta barata reservada: **`Brand.ownerId`
  nullable** (relación `BrandOwner`→User parqueada, el dominio/repos aún no la usan; db push aplicado local).
  **e2e humano ✅ (2026-06-18):** el usuario creó marcas reales por el admin (incl. Bar Flama) y se ven en
  `/marca/[slug]`. **Fix (2026-06-18):** el preview del logo en el form de marca usaba `next/image` y
  tumbaba la página (error boundary) al pegar una URL de host no permitido → ahora usa `<img>` plano como
  el form de Place. **Mejora (2026-06-18):** la skill `ficha-lugar` + ingesta ahora crean la marca **con
  descripción/logo/links auto** (campo `marca` como objeto), no vacía; si la marca ya existe no se pisa.
  **Falta:** solo el push a prod (db push de la BD de producción incluirá el model Brand + las 2 columnas
  `brandId` + `Brand.ownerId`).
- **(l) Redes sociales múltiples ✅ HECHO (2026-06-15)** — `socialLinks Json?` `[{network,url}]` en
  Place (WhatsApp/Facebook/TikTok…); Instagram queda como campo principal aparte. Cableado de punta a
  punta (dominio → form admin → ficha → JSON-LD `sameAs`), BD local migrada. Auditoría: el resto del
  schema MVP está **completo** vs. PRD; horario estructurado sigue siendo post-MVP por decisión.

**Pulido visual / deuda:**
- **(u) Ficha en 2 columnas en desktop (pedido del usuario 2026-06-14, ANOTADO, no hecho)** — al usuario le
  gustaba más el diseño original de la ficha en desktop: **izquierda** la info (descripción + tags + redes),
  **derecha** un contenedor con los Datos prácticos (sticky). Hoy la ficha es de 1 columna apilada. Es solo
  layout en `≥` desktop (móvil sigue apilado); revisar `.ficha__sheet`/`.ficha__section` + grid. No urgente.
- **(f) Flechas de carrusel ✅ HECHO (2026-06-15)** — `PlaceRail` se generalizó (props `scrollClassName`
  + `className`, sin tocar la home) y la ficha "También te puede gustar" ahora lo reusa con flechas en
  desktop. Por qué no se veían en la home: solo aparecen ≥861px y se autoocultan cuando no hay más
  scroll (`:disabled{visibility:hidden}`) — con pocas tarjetas que caben, no se muestran (correcto).
- **(c) Ícono en el read-model de categorías** — hoy la home los hardcodea. (2026-06-15: se sumó el
  ícono de **Entretenimiento**, que faltaba y caía al fallback de Gastronomía; sigue hardcodeado, el
  fix de fondo es moverlos al read-model.)
- **(t) Rediseño del home (pre-lanzamiento, vía Claude Design) ⏳ DIFERIDO por decisión del usuario** —
  lo verá cerca del MVP. Objetivos a capturar en el brief: (1) categorías/subcategorías primero, para
  que al entrar se sepa "de un vistazo por qué se puede filtrar"; (2) bajar "¿Con quién vas?" (queda en
  el home pero menos protagonista — el usuario se inclina por ponerlo **antes de "Lo mejor valorado"**,
  pero seguía pensándolo); (3) aprovechar el ancho en **desktop** (hoy el hero de 1 columna angosta deja
  medio viewport en blanco); (4) layout de la banda de categorías que escale a 5+ bloques. Flujo: yo
  preparo el prompt/paquete por pantalla, el usuario genera la ref, recién ahí se implementa.
  **2026-06-15: arreglado el defecto inmediato** (5 categorías rompían la grilla de 4 + ícono faltante)
  para que no se vea roto mientras tanto; el rediseño completo es aparte.
- **(d) Listas curadas / landings de guía — MODELO CERRADO (2026-06-25), build pendiente.** Es el
  prerequisito de ingeniería del go-to-market (STRATEGY §5 paso 3). Decisión: una lista curada =
  **modelo dedicado `CuratedList`** (NO recargar `Collection`, que queda solo para listas manuales de
  usuario) = **una "lista inteligente"**: regla guardada (los filtros del explorar) + chrome editorial
  (`name`, `slug`, `description` [meta SEO], `intro` `@db.Text`, `coverImageUrl`, `kind` GUIDE|OCCASION,
  `isPublished`+`publishedAt`, `sort` default score desc) + **`pinnedPlaceIds`** (destacados fijados a
  mano que van primero; sin nota por pin). Se **resuelve al leerla** con `SearchPlacesUseCase(regla)` →
  se mantiene completa sola a medida que se carga. Reemplaza el `GetCuratedCollectionUseCase`/
  `findCuratedBySlug` actual (sin consumidor). **Coupling con tarea 2:** las listas de OCASIÓN ("primera
  cita") son reglas sobre tags OCCASION → necesitan el filtro OCCASION/EXPERIENCE cableado; las guías
  exhaustivas (Museos, Hamburgueserías) funcionan ya con categoría/comuna. **Build en 2 fases:**
  Fase 1 = `CuratedList` de punta a punta (schema→dominio→app→admin `/admin/listas`→landing `/lista/[slug]`
  con JSON-LD `ItemList`+OG→home→sitemap) → habilita las **guías** ya; Fase 2 = filtros OCCASION/EXPERIENCE
  en search/explorar + sumarlos al vocabulario de la regla → habilita las **listas de ocasión** (= la
  "tarea 2" que el usuario pidió después).
  **🔄 BUILD EN CURSO (2026-06-25) — checkpoint que compila (99 tests verdes, typecheck limpio):**
  Hecho: (1) **schema** — `CuratedList` + `CuratedListPin` + enum `CuratedListKind`; se limpiaron de
  `Collection` los campos curated muertos (`isCurated`/`slug`) y `ownerId` pasó a obligatorio (las listas
  manuales del usuario y las curadas ya son entidades separadas). (2) **migración** `add_curated_list`
  **aplicada en local** + cliente Prisma regenerado (⚠️ revisar con `db-migration-reviewer` **antes del
  push a prod** — incluye 2 drops de columna; en prod corre sola por `migrate deploy`). (3) **dominio**
  `CuratedList` (entidad + VO `CuratedRule` con `isRuleEmpty` + errores); se borró el `GetCuratedCollectionUseCase`
  viejo. **🔄 BACKEND COMPLETO (2026-06-25, sesión 10) — typecheck limpio + 99 tests verdes:** se construyó
  toda la capa app + infra + wire-up: (4) **port** `CuratedListRepository` (+ read-models `CuratedListAdminRow`,
  `CuratedListCardView`, `CuratedListPageView`) + `findCardsByIds` agregado a `PlaceRepository` (resuelve los
  destacados, solo PUBLISHED). (5) **use cases** (`src/application/curatedList/`): `CuratedListWriteInput`,
  `Create`, `Update` (conservan slug/createdAt; `publishedAt` se fija al publicar y se conserva), `GetForEdit`,
  `ListForAdmin`, `Delete`, `ListPublished` (home) y el central `GetCuratedListBySlug` (resuelve la regla vía
  `SearchService` con `ruleToSearchParams`, antepone los destacados, excluye sus ids del resto, borrador →
  `CuratedListNotFoundError`). (6) **infra** `PrismaCuratedListRepository` (`save` = upsert + reemplazo de pins
  en `$transaction`; `parseRule`/`ruleToJson` defensivos para el campo Json). (7) **container** cableado (repo
  + 7 getters). **✅ PRESENTATION COMPLETA (2026-06-25, sesión 11) — typecheck limpio + 99 tests verdes + `next
  build` OK (todas las rutas compilan):** (8) **admin `/admin/listas`** — tabla (nombre · tipo · nº destacados ·
  estado borrador/publicada) con acciones por fila (editar · ver ↗ · eliminar con modal de confirmación), `nuevo`
  y `[id]`; el **form** (`CuratedListForm`) tiene editorial (nombre · tipo GUIDE/OCCASION · descripción meta SEO ·
  intro · **portada** con subir/traer reusando el pipeline de Blob), **editor de regla** (decisión: se alimenta de
  `getFacets()` → habla en SLUGS, mismo vocabulario que el explorar, evita el problema de que las form-options no
  llevan slug; single-selects para categoría/sub/comuna/barrio/línea-metro + chips multi para precio/¿con quién?/
  ambiente/acceso + check "sin reserva"; avisa si la regla queda vacía) y **destacados** (picker de lugares +
  bajada + reordenar ↑↓ + quitar). (9) **landing `/lista/[slug]`** — cover + eyebrow + H1 + intro + destacados
  ricos (PlaceCard + blurb) + grilla del resto, **corazón de guardado** cableado (como la home), JSON-LD
  `ItemList` + OG/canonical, borrador → `notFound()`. (10) **home** — sección "Guías para explorar" (read-model
  `listPublished`, reemplazó el placeholder) + **`sitemap.ts`** suma las landings (nuevo use case
  `ListCuratedListSitemapEntriesUseCase` + getter). CSS nuevo en `globals.css` (`.curated-page*`, `.curated-pin*`,
  `.home-guides*`, `.guide-card*`). **Nav de admin** ahora lleva "Listas". **PENDIENTE:** (a) **sin commit
  todavía** — falta commitear todo el bloque (backend sesión 10 + presentation sesión 11); (b) antes del push a
  prod, pasar la migración `add_curated_list` por **`db-migration-reviewer`** (incluye 2 drops de columna; en
  prod corre sola por `migrate deploy`); (c) cargar las primeras guías reales por el admin. **Fase 2** (filtros
  OCCASION/EXPERIENCE → habilita listas de ocasión) sigue aparte.
- **(v) Abierto/Cerrado en la tarjeta (post-MVP, ANOTADO 2026-06-14)** — mostrar en la `PlaceCard` un
  indicador "Abierto ahora / Cerrado" al explorar (info muy útil para decidir). **Depende de horario
  estructurado:** hoy `Place.schedule` es **texto libre**, no se puede calcular abierto/cerrado. Requiere
  primero modelar horario estructurado (días + tramos), que es **post-MVP por decisión** (ver SCHEMA).
  Entonces: esto entra recién cuando exista el horario estructurado.
- **(a) Barrer CSS muerto ✅ HECHO (2026-06-15)** — borrados `.hero-search*` y `.filter-rail*` (desktop
  + responsive), confirmados sin consumidores tsx (los filtros usan `.filters__*`). `.search-shell`/
  `.place-row` ya no existían (poda previa). Queda `.listing-card*` (suena al modelo viejo, sin uso
  tsx) sin tocar por no estar en la lista original; candidato para la próxima pasada.
- **(b) Neighborhoods huérfano ✅ HECHO (2026-06-15)** — `@domain/shared/Neighborhoods` era un stopgap
  declarado para el explorar viejo (ya reescrito en Etapa 4) y nadie lo importaba; eliminado.

---

## 🚀 Plan de lanzamiento priorizado (auditoría 2026-06-14)

Foto de "qué falta para lanzar live". Lo ✅ ya está. Lo demás, ordenado por prioridad.

### P0 — sin esto no hay lanzamiento
- [ ] **Contenido: cargar panoramas.** Los más populares de Santiago + ~10 por subcategoría en las
  comunas núcleo (Providencia, Santiago, Ñuñoa, Las Condes). No 20 en todas — ~100-150 fichas es un MVP
  sólido; el resto se expande post-launch. **Vía: el agente `investigador-lugares` + `ingest-fichas`**.
  **🔄 EN CURSO (2026-06-15):** 12 lugares cargados (2 publicados: Parquemet + Cerro San Cristóbal;
  10 borradores por revisar). El flujo agente→ingesta quedó validado e2e. Para ver qué falta por
  subcategoría: **`/admin/cobertura`** (vista nueva). **Scraper de rating/place_id ✅ CONSTRUIDO
  (2026-06-17):** se integró **Apify** (Google Maps Scraper) detrás del port `PlaceRatingProvider` —
  adapter `ApifyRatingProvider`, use case `EnrichPlaceRatingUseCase` (setea rating/reseñas/place_id +
  recalcula score bayesiano, sin tocar el estado), y script **`scripts/enrich-ratings.ts`** (`--dry`,
  `--force`, flag `⚠️ REVISAR` cuando el nombre del match no coincide). La query incluye la **dirección**
  de la ficha para fijar la sucursal correcta en marcas multi-local (Emporio La Rosa → su sucursal, no
  otra). Sin tarjeta (free US$5/mes de Apify cubre el MVP). **Aplicado (2026-06-17):** 6 lugares reales
  enriquecidos con rating/place_id/fotos + score recalculado; 4 fichas de prueba borradas → 12 lugares
  reales en BD. **Auto-attach de fotos ✅ (2026-06-17):** flag `--with-photos` rehospeda hasta 5 fotos de
  Google Maps al Blob (use case `AttachPlacePhotosUseCase` + `Place.withImages`), **solo en fichas sin
  imágenes** (no pisa las curadas), crédito "Google Maps". Verificado e2e (Emporio La Rosa: 5 fotos al
  Blob). **Lote 1 cargado (2026-06-17): 15 cafés de Providencia** (skill desktop "modo carga" → place_id →
  agente `investigador-lugares` → ingesta → enrich exacto + fotos). Todos PENDING_REVIEW con rating/score/
  ~5 fotos. **→ ~27 lugares reales en BD.** Ojo: **el Galgo Café** quedó cargado pero está **cerrado
  temporalmente** (robo 8-jun-2026) → NO publicar hasta confirmar reapertura. Barrios nuevos (Pedro de
  Valdivia, Manuel Montt, Barrio Suecia) **agregados al seed + asignados** a las 9 fichas que los usaban.
  **Práctica:** cuando un lote deje barrios omitidos, agregarlos al seed y reasignar (ver memoria).
  **✅ Publicación (2026-06-17):** revisados y **publicados 18 lugares** (los cafés del lote 1 + museos +
  cerros/parques); **el Galgo Café retenido en PENDING_REVIEW** (cerrado por robo, verificar reapertura
  antes de publicar). **Cambio de flujo de ingesta (2026-06-17):** `ingest-fichas.ts` ahora **publica por
  defecto** (antes dejaba todo en borrador); solo quedan en revisión las fichas con `_meta.requiere_revision:
  true` (cerrado/dudoso) o si se corre con `--review`. Además resuelve **marca → brandId** (la crea como
  borrador si no existe). La skill `ficha-lugar` + el agente `investigador-lugares` quedaron adaptados al
  schema nuevo (campo `marca`, flag `requiere_revision`, etiqueta "Sin reserva").
  **Lote 2 cargado (2026-06-18): +51 lugares → 78 total.** Bares (12 incl. Bar Flama x2), restaurantes (10),
  librerías (10), disquerías (9), tiendas/vintage (10) — vía 5 corridas paralelas del agente
  `investigador-lugares` → ingesta. Corrigió el desbalance: **Gastronomía 18→40** (abrió Bar + llenó
  Restaurante), **Locales y tiendas 0→29** (categoría que estaba 100% vacía). 48 publicados, **3 en
  `PENDING_REVIEW`** (Colectivo Informal, Rarities Pedro Nolasco, Galpón Bío Bío — dudas legítimas).
  **6 marcas nuevas creadas con descripción automática** (Le Bistrot, Catalonia, Liguria, Nolita, Punto
  Musical, Rossie La Loca) gracias a la mejora de marca-objeto; Bar Flama se reusó sin pisar. **Fotos:**
  enrich `--with-photos` (tope bajado a **3/ficha**) adjuntó 3 fotos de Google Maps a las 47 sin imágenes.
  Barrio **Franklin** agregado al seed (5 fichas del Persa). Falta: seguir cargando (Naturaleza/Arte/
  Entretenimiento siguen flacos) + revisar las 3 en PENDING_REVIEW.
  **Lote 3 cargado (2026-06-19): +39 lugares → 117 total.** Atacó las 3 categorías flacas vía 3 corridas
  paralelas del agente: **Naturaleza +14** (red de cerros reconocidos fuera de las comunas núcleo:
  Quebrada de Macul, Aguas de Ramón, Manquehue, Pochoco, Provincia + parques Araucano/O'Higgins/Quinta
  Normal/Mahuida/Inés de Suárez/de los Reyes + Río Clarillo + Cascada de las Ánimas + Jardín Chagual),
  **Arte +14** (MNHN, M. Histórico, Artequin, La Chascona, MAVI, CC La Moneda, Matucana 100, Estación
  Mapocho, Cineteca, Cine Normandie, Biblioteca Nacional, Cementerio General, Galería Patricia Ready,
  Museo de la Moda), **Entretenimiento +10** (Thelonious, Club de Jazz, Teatro Caupolicán, Blondie, Club
  Chocolate, La Batuta, Club La Feria, Happyland Mall Sport) + **Mall Sport** (contenedor). Naturaleza
  4→18, Arte 4→17, Entretenimiento 1→11. **109 publicados, 8 en PENDING_REVIEW** (los 4 del lote 2 +
  **Yukland** [no existe, matcheó un parque en California → BORRAR], **The Jazz Corner** [cerrado
  definitivo sept-2025 → borrar/archivar], **Museo de la Moda** [abre por temporadas, confirmar],
  **Jardín Botánico Chagual** [sin horario público; matcheó "Vivero Leliantú" 9 reseñas]).
  **Contenedores:** Mall Sport → Happyland (hijo); Parque Metropolitano de Santiago → Cerro San Cristóbal
  + Jardín Botánico Chagual (hijos). **Brand Happyland** auto-creada (cadena, +94 locales). Barrios nuevos
  al seed: Quinta Normal, Plaza Ñuñoa, El Arrayán, San Alfonso. **Bug de rating arreglado:** GAM (4.6/25.109)
  y Cerro Santa Lucía (4.6/3.647) no tenían rating porque la skill les capturó un `place_id` malo y el
  enrich por defecto las saltaba (solo agarra fichas con `googlePlaceId: null`) → se limpia el id y se
  re-enriquece por texto. **Sin rating (revisar a mano):** Parque O'Higgins (Maps lo mapea como polígono
  sin rating agregado) y Happyland (colisión de `place_id` con Mall Sport en el enrich).
  **Borrados (2026-06-20):** Yukland (no existe) y The Jazz Corner (cerrado) → 115 lugares.
  **Triage de los 6 PENDING_REVIEW (2026-06-20):** se dejó **Galpón Bío Bío** en revisión (4.6/2.492,
  listo para publicar); **archivados** el Galgo Café (cerrado temporal) y Museo de la Moda (abre por
  temporadas) — republicables; **eliminados** Colectivo Informal (sin dirección, 3 reseñas), Rarities
  (5 reseñas) y Jardín Chagual (place_id mal atado). → **112 lugares, 109 publicados, 2 archivados,
  1 en revisión.**
  **Lote 4 cargado (2026-06-21): +48 lugares → 160 total.** Atacó las 2 categorías flacas vía 5 corridas
  paralelas del agente con place_ids ya provistos por el usuario: **Juegos y diversión 1→27** (karaokes,
  escape rooms FUGA, bowling, arcades/gamer bars Insert Coin/Diana/Happyland Mall Centro, billares, VR
  Vimerzion) y **Vida nocturna 7→26** (discotecas Sala Portugal/Fausto/Mandala/etc, clubes de jazz
  Backroom/Grez/El Bajo, salas de conciertos Movistar Arena/Ramblas/Sala Master/RBX). **154 publicados,
  3 nuevos en PENDING_REVIEW**: Caleido (cerrada — patente rechazada + incendio), Salón de Pool y Pool Hall
  Room 9 (baja presencia web pero el enrich confirmó que son reales). Duplicados descartados antes de
  cargar: **Blondie** y **La Batuta** (ya estaban del lote 3). **Marcas nuevas con descripción**: FUGA
  Escape Room, Insert Coin Bar (Happyland se reusó). **Enrich con coords + fotos:** las 48 quedaron con
  lat/lng y 2-3 fotos de Google Maps (6 tuvieron timeout transitorio de Neon al guardar las fotos →
  reintentadas OK). **Fix de catálogo:** **Barrio Universitario** agregado al seed (Santiago) + asignado a
  Japimax; **Bar El Bajo** reapuntado como hijo del **GAM** (su `parte_de` decía "Centro Gabriela Mistral"
  y el real es "Centro Cultural Gabriela Mistral (GAM)"). Bowling - Club Providencia queda sin contenedor
  (Club Providencia no es ficha).
- **Reorganización de taxonomía (2026-06-20) ✅.** Sesión de catálogo a partir de cargar Mall Sport (un mall
  no calzaba en ninguna subcategoría). Cambios: **(1)** Entretenimiento mezclaba vida nocturna con juegos →
  **partido en 2 categorías activas:** **Vida nocturna** (Discoteca/Club, Club de jazz/blues, Sala de conciertos)
  y **Juegos y diversión** (Karaoke, Escape room, Bowling, Arcade + nuevas Paintball, Karting, Minigolf,
  Trampolines, VR, Billar). Ahora **6 categorías activas**. **(2)** Subcategorías nuevas: Gastronomía
  (+Cervecería, +Mercado/Patio gastronómico), Naturaleza (+Zoológico/Bioparque, +Termas), Locales
  (+Centro comercial, +Galería comercial/Persa, +**Atracción**). **(3)** **Atracción** (en Locales y tiendas)
  para decks/hitos urbanos tipo Sky Costanera (que NO es Naturaleza ni Arte). **(4)** Se borró la sub duplicada
  "Mirador/Observatorio". Migración por script (rename in-place de Entretenimiento→Juegos, mover subs+lugares,
  0 duplicados de slug); seed.ts actualizado; íconos del home para las 2 cats nuevas; typecheck + 84 tests OK.
  **Regla de "Atracción":** catch-all para atracciones turísticas construidas (observatorios, teleférico…);
  si no cuaja, se borra. **DRIFT SINCRONIZADO (2026-06-20) ✅:** `PRD.md`, `SCHEMA.md` y la skill
  `ficha-lugar` actualizados a la taxonomía real (6 activas + 3 event-only; Entretenimiento → Vida
  nocturna + Juegos y diversión; sub Atracción). PRD además corregido a 6 capas de tags (decía 4).
- [ ] **Push a prod.** (a) **Workflow de BD DECIDIDO (2026-06-23): migraciones Prisma.** Baseline `0_init`
  ya generado + marcado aplicado en local; prod hará `migrate deploy` limpio (BD vacía). (b) Schema + seed de
  catálogos en Neon prod (vía `migrate deploy` + `db:seed`). (c) `RESEND_API_KEY` real (si no, no sale la
  bienvenida ni el reset). (d) Confirmar `BLOB_READ_WRITE_TOKEN` + setear `UPSTASH_*` en env de prod. (e) Redeploy.
- [x] **Registro seguro (parcial 2026-06-23).** Rate-limit ✅ (ahora durable, Upstash). (i.2) **fuerza de
  contraseña + medidor ✅ HECHO**. **Recuperar contraseña ✅ HECHO** (token hasheado single-use, inerte hasta
  Resend). **Google login cableado pero apagado ✅** (flag `googleAuthEnabled`). Falta solo: (i.3) verificación
  de email al registrarse (token + gateo) — opcional post-launch; requiere `RESEND_API_KEY` real.
- [ ] **Anti-scraping (parcial 2026-06-23).** ✅ **Rate-limit durable (Upstash)** en `/api/suggest` +
  actions registro/reset/reporte; payloads capados. **Falta: regla de Rate Limit en Vercel Firewall** para
  `/lugar/*` y `/explorar` (se configura en el dashboard al deployar). Contexto original abajo. El contenido (fichas con
  rating/fotos/datos curados) es el activo del producto → blindarlo contra raspado masivo con **todas las
  medidas viables**. Candidatas, de barata a más cara: (1) **rate-limiting por IP** en las rutas públicas
  de catálogo (`/explorar`, `/lugar/[slug]`, autocomplete de búsqueda) — extender `lib/rateLimit.ts`
  (mover el store a Upstash/Redis para que aguante multi-instancia en Vercel); (2) **bloqueo de
  data-center / bots** vía Vercel Firewall / `middleware.ts` (hoy no existe middleware) + lista de
  User-Agents y ASN conocidos; (3) **Vercel Bot Management / Cloudflare** delante del dominio; (4) no
  exponer un endpoint JSON masivo (paginar y limitar `take`, sin "dame todo"); (5) **honeypot + detección
  de patrones** (muchas fichas distintas en poco tiempo desde una IP → throttle/CAPTCHA); (6) `robots.txt`
  ya bloquea admin/api, pero el catálogo público es indexable por SEO a propósito → el anti-scraping va por
  rate-limit/WAF, no por robots; (7) ofuscar/no incluir el `googlePlaceId` ni lat/lng exactos en el HTML
  si no se usan client-side (hoy `googlePlaceId` se serializa para "Cómo llegar" → evaluar moverlo a una
  action). Investigar el set completo y elegir el combo costo/beneficio antes de publicar.

### P1 — muy importante para un lanzamiento decente
- [x] **Listas guardadas visibles ✅ HECHO (2026-06-21).** Clickear una lista en Guardados abre su
  **vista de detalle** (lugares como PlaceCards) con renombrar/eliminar la lista y quitar lugares.
  Read-model con ownership en la query (anti-IDOR) + use case + 3 actions sobre los use cases existentes.
- [ ] **Analytics.** GA4 + Meta Pixel + eventos custom (del scope MVP, no construido). Conviene tenerlo
  desde el día 1 para medir el lanzamiento. — M.
- [x] **Dashboard de usuario limpiado ✅ HECHO (2026-06-21).** Nav = **Guardados · Historial · Perfil**
  (3 tabs reales); Historial terminado; ocultos del nav los stubs no-MVP (Mis listas, Eventos, Reseñas,
  Config) — componentes/rutas preservados para reactivar.

### P2 — pulido / captura de valor
- [x] **Botón compartir ✅ HECHO (2026-06-21).** Reemplazado `navigator.share` por un **popup** con la
  grilla de redes (reusa el shell `.save-modal`): **WhatsApp, X, Telegram, Facebook** abren con
  nombre+link pre-cargado; **Email** vía `mailto`; **Copiar link**; **Instagram y TikTok** copian el link
  + aviso "pégalo en tu historia/bio" (no existe API web para pre-cargar un link externo en esas dos —
  limitación real, decidido con el usuario). Verificado a ojo.
- [ ] **Sugerencias / feedback.** No existe mecanismo (solo `reportPlaceAction` para reportar datos
  malos). Sumar un form simple "sugerir lugar / mejora" → email o tabla. — S/M.
- [ ] **3-5 listas curadas como landing SEO** (ítem d). — M.

### Fuente de rating automática — ✅ INTEGRADA (2026-06-17)
- [x] **Apify** (Google Maps Scraper) detrás del port `PlaceRatingProvider`. Elegido vs. Outscraper
  (pedía tarjeta), Google Places (tarjeta + cobro por SKU + fotos extra) y SerpApi: Apify da token
  **sin tarjeta**, free US$5/mes (US$1,50/1.000 lugares = MVP gratis), y trae rating + reseñas +
  place_id + fotos en una llamada. Verificado e2e. **Falta:** correr el lote real + (opcional) auto-attach
  de fotos. Ojo ToS: cachear ratings de Google permanentemente es zona gris (aplica a cualquier fuente).

### Ya hecho ✅
- [x] Scraper de rating/place_id vía **Apify** (port + use case + script `enrich-ratings.ts`) — 2026-06-17.
- [x] Flujo de imágenes (Vercel Blob + compresión + "Traer" desde URL) — 2026-06-14.
- [x] Carga asistida por agente (skill `ficha-lugar` + `investigador-lugares` + `ingest-fichas`) — 2026-06-14.
- [x] Páginas legales privacidad/términos — 2026-06-15 (falta revisión por abogado).
- [x] SEO de ficha: JSON-LD + metadata + sitemap + robots — 2026-06-15 (falta revisar ISR, e.2).
- [x] Suite de tests de dominio (64 Vitest) + skill `/tests` — 2026-06-15.
- [x] Docs sincronizados (SCHEMA/ARCHITECTURE/schema.prisma) — 2026-06-15.
- [x] Rate-limiting en reportes + registro — 2026-06-15.

---

**Regla:** no avanzar a la siguiente fase/etapa sin OK explícito del usuario. Tras cada avance real,
dejar este `PLAN.md` actualizado (y la bitácora en `PLAN_FASE9.md` si es una decisión).
