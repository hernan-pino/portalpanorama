# PLAN — Portal Panorama (plan vivo)

**La fuente de verdad del trabajo desde hoy.** Roadmap, estado actual y backlog. Liviano a propósito —
para retomar rápido. Se actualiza cada vez que avanzamos.

- **Qué es el producto / norte permanente:** [PRD.md](PRD.md) · **Estrategia post-MVP:** [STRATEGY.md](STRATEGY.md) · **Go-to-market:** [GO_TO_MARKET.md](GO_TO_MARKET.md)
- **Modelo de datos:** [SCHEMA.md](SCHEMA.md) · **Capas:** [ARCHITECTURE.md](ARCHITECTURE.md) · **Marca:** [BRAND_SPEC.md](BRAND_SPEC.md) · **Cuentas de negocio:** [BUSINESS_ACCOUNTS_SPEC.md](BUSINESS_ACCOUNTS_SPEC.md)
- **Historia (cómo se construyó, sesión a sesión):** [docs/historico/PLAN_BITACORA.md](docs/historico/PLAN_BITACORA.md) · **Bitácora del rediseño:** [PLAN_FASE9.md](PLAN_FASE9.md)

---

## ▶️ ROADMAP — próximos pasos (acordado s38, 2026-07-17)

> **▶️ RETOMAR (fin s38, 2026-07-18):** 📍 distancia **EN PROD y probada en el teléfono** por el usuario,
> con dos rondas de ajustes sobre feedback real. Árbol limpio, todo pusheado (`a37d452`).
> **Próximo paso: 🅿️ estacionamientos** (punto 1 de la tanda).
> ⚠️ **Deuda abierta:** 14 lugares publicados en **prod** siguen sin `lat`/`lng` (arreglado en local, no
> en prod) → va con la próxima tanda de carga, con `enrich-ratings --no-coords`.

El orden que definió el usuario. No se salta un paso sin OK explícito.

**🔨 1. AHORA — features cortas con datos que YA tenemos**
- [x] **📍 Distancia desde tu ubicación ✅ EN PROD, probada en el teléfono (s38).** "a X min a pie / a X km
  de ti" en la tarjeta de **/explorar, guías y listas** + la ficha. **NO** en el carrusel del home: esas
  tarjetas son angostas y el dato empujaba la fila de datos a una segunda línea (se apaga con la prop
  `showDistance`, no hardcodeado en la tarjeta).

  **Arquitectura:** `lib/geo.ts` (haversine + formato CL, puro, 11 tests) · `UserLocationProvider` en el
  layout de `(main)` → contexto global · `NearMeButton` (opt-in manual) · `NearMePrompt` (ofrece activar a
  los 6 s) · `GeoAskDialog` (pop-up compartido, por `createPortal`) · `PlaceDistance` (isla cliente).
  `lat`/`lng` expuestos en `PlaceCardView`.

  **⚠️ La lección de la sesión — el permiso del navegador es la fuente de verdad, no `sessionStorage`.**
  La v1 guardaba la ubicación solo en `sessionStorage` y la trataba como verdad: en el teléfono se perdía
  al cambiar de página y había que apretar "Cerca de mí" de nuevo en cada una (y por eso tampoco salía en
  la ficha ni en el home — *un* bug con tres caras). Ahora, al montar, se consulta la **Permissions API**:
  si el usuario ya concedió, se vuelve a pedir la posición y el navegador **no abre ningún diálogo**. El
  opt-out manual (la X) se recuerda aparte, si no el auto-restore lo pisaría.

  **UX del permiso:** pop-up explicativo propio ANTES del nativo (el nativo no se puede estilar). El
  automático sale a los **6 s** en /explorar y **una sola vez en la vida** (`localStorage`); no al entrar,
  porque en iOS un rechazo es casi irreversible y quema el permiso para siempre. El botón queda como vía
  manual. Aviso de error por causa (permiso bloqueado / ubicación del SO apagada / timeout).

  **"X min a pie" bajo 1,5 km — calibrado contra la calle, no a ojo.** v1 usaba solo un factor de rodeo
  (×1,3) y **subestimaba feo**: 130 m en línea recta daban "2 min" donde caminarlo tomaba ~5. Buena parte
  del tiempo de caminar **no escala con la distancia** (salir, llegar a la esquina, cruzar, semáforo) y a
  150 m esa fricción pesa más que la caminata. Fórmula actual: **2 min fijos + ×1,4 de rodeo ÷ 5 km/h**,
  sesgada a sobre-estimar (llegar antes no molesta; llegar después sí). Sobre 1,5 km vuelve a km en línea
  recta. **No** consultamos API de rutas: cobra por consulta y serían ~24 por carga.

  **Íconos:** peatón SOLO con tiempos; pin con distancias. Nunca prometer "caminando" a 5 km.
  **Layout:** la distancia va al borde derecho de la tarjeta (único dato que depende del usuario, no del
  lugar) · barra de resultados = grid de 3 áreas, en móvil la vista sube junto al conteo y "Cerca de mí" +
  orden bajan a una fila propia · **"¿Cómo ordenamos?"** se movió al pie del panel de filtros.
  **✅ Verificado:** typecheck + lint + 190 tests + build + el usuario en su iPhone.
- [ ] **🅿️ Estacionamientos como dato de ficha** — dato clickeable que abre un pop-up liviano (nombre ·
  dirección · pagado/gratis). NO fichas propias del catálogo (decisión s28). Insumo futuro del recomendador IA.
- [ ] **⭐ Tal vez reseñas por dimensión / o alguna deuda menor** — si queda espacio. Reseñas = notas por
  dimensión (ambiente · rapidez · accesibilidad · sabor), nota del lugar = promedio (idea registrada, STRATEGY §4).

**📦 2. Cargar hacia 500 lugares** — vas en **423** (418 publicados) → faltan ~77. Pipeline afilado (runbook abajo).

**🚀 3. Lanzar: publicar en grupos y foros** — GTM real (r/santiago, grupos de Facebook, IG @portalpanorama.cl). Detalle en [GO_TO_MARKET.md](GO_TO_MARKET.md).

**📝 4. Escribir el caso técnico para portafolio + LinkedIn** — qué construimos, los problemas y cómo se
resolvieron, aprendizajes, stack, habilidades. Materia prima: [docs/historico/PLAN_BITACORA.md](docs/historico/PLAN_BITACORA.md).

**🎫 5. Eventos** — construir e integrar la creación (schema ya tiene la puerta abierta: `Event` apagado).

**💰 6. Monetizar eventos** — escalera de planes (evento destacado · productora · venue). Modelo en STRATEGY §3.

**🤖 7. Recomendador IA del panorama completo** — "dónde comer helado con mi pareja" → arma la cita entera. El norte del producto (embeddings/LLM). Va después de eventos.

**🧫 8. Estrategia para poblar el MVP de eventos** — cargar nosotros → generar tráfico → que la gente cree los suyos (UGC).

---

## 📍 Estado actual (s37, 2026-07-16)

- 🚀 **LIVE en prod** (`portal-panorama.vercel.app`): **423 lugares · 418 publicados**, todos con foto y horario.
- ✅ **Rediseño completo en prod** (mini rebrand con Claude Design: tokens, tipografía, tarjeta, ficha, auth, paneles).
- ✅ **Cuentas de negocio en prod** (reclamar ficha · publicar negocio nuevo · panel del dueño · moderación admin).
- ✅ **Pipeline de carga afilado** (s37): el horario sale de Google, el ingestor no publica fichas incompletas, reuso de Blob (0 subidas duplicadas). Ver runbook abajo.

**Pendientes chicos de la s38:**
- **14 lugares publicados en PROD sin `lat`/`lng`** (florerías, viveros y chocolaterías de un lote donde el
  ingestor no guardó las coords) → no muestran distancia. **Ya corregido en local**, falta prod: se acordó
  hacerlo con la próxima tanda de carga (`enrich-ratings --no-coords`, ~16 consultas a Apify). Local quedó
  en **417 publicados, 0 sin coords**.
- **Fichas de prueba `dfsd` y `dsfad`** (13-jul) en `PENDING_REVIEW` — no salen en público, pero el
  backfill les puso fotos y coords de Isla de Maipo y Buin. Borrarlas desde `/admin/lugares`.
- "Entrelagos Bombonería 1850" quedó matcheada como "Chocolatería Entrelagos" (misma dirección, Agustinas
  1035): el match es correcto, solo cambió el nombre en Google.

**Pendientes chicos de la s37:**
- 3 descripciones con avisos caducos + info real mezclada (La Bottega Gandolini · La Rústica Pizzeria · Kame House) → reescribir copy.
- Posibles `place_id` corruptos más en la BD (señal: `✗ Google no devolvió ningún lugar` al enriquecer).
- `renamedTo` quedó como código muerto en `Place.ts` (deuda menor).
- Reprocesar las 1.174 imágenes legacy a responsive — parqueado, no urge (se ven bien; sobra espacio de Storage).

---

## 🧰 Runbook — cargar un lote

```bash
# 1. Investigar (agente investigador-lugares) → tmp/fichas/<lote>/*.json
# 2. Ingestar a LOCAL (dry primero). Lo incompleto queda en PENDING_REVIEW solo.
npx tsx --env-file=.env.local scripts/ingest-fichas.ts tmp/fichas/<lote> --dry
# 3. Desbloquear lo que quedó en revisión, desde Google (NO re-investigar):
npx tsx --env-file=.env.local scripts/enrich-ratings.ts --force --with-schedule --with-photos <ids...>
# 4. Exportar local → prod (0 subidas de Blob, 0 Apify) e ingestar contra la BD de prod
# 5. Invalidar caché o los lugares NO aparecen aunque estén en la BD:
curl -X POST https://portal-panorama.vercel.app/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET"
```

⚠️ **`DATABASE_URL` de prod está *Sensitive* en Vercel: `vercel env pull` la trae VACÍA.** Se saca de Neon
→ branch **`prod`** (no `production`) → endpoint `ep-billowing-dream-act3f6q5`.
⚠️ **Cada consulta a Apify tarda ~40 s:** más de ~14 lugares se pasa del timeout de 10 min → correr en background. Es idempotente, re-correrlo es seguro.

---

## 📋 Backlog vivo (no bloquea el día a día salvo lo marcado)

**Diferenciador / producto:**
- **🏠 Rework del home (layout + secciones + SEO).** El usuario siente que el home **está mal armado y le
  faltan secciones**; sumar contenido y **mejorar el SEO** de la página. Es un rediseño de la landing (no
  un ajuste chico) → definir qué secciones faltan, jerarquía y copy indexable. Encaja bien antes de GTM.
- **Filtros OCCASION + EXPERIENCE como facetas del explorar** (o.6) — hoy viven en la ficha pero no filtran.
  Refuerza el pilar (filtrabilidad por contexto social) y habilita las listas de ocasión. Barato (los datos ya existen).
- **Abierto/Cerrado en la tarjeta** (v) — ahora **desbloqueable**: el horario estructurado ya llega de Google (s37).

**Lanzamiento / GTM:**
- **🍪 Banner de consentimiento de cookies (bloqueante suave de GTM).** Hoy **GA4 + Microsoft Clarity**
  se cargan **sin pedir permiso** (env-gated: solo si `NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_CLARITY_ID` están
  seteadas en prod — **verificar en Vercel si están encendidas**). No hay banner. La cookie de sesión
  (Auth.js) es estrictamente necesaria y NO se gatea. Recomendación: banner liviano que gatee GA4 +
  Clarity (idealmente con Google Consent Mode), dejando sesión siempre. En Chile la Ley 19.628 no lo
  exige hoy, pero la **Ley 21.719** (vigencia ~dic-2026, estilo GDPR) lo vuelve lo esperable; Clarity
  graba sesiones → es lo más sensible. Va **antes de difundir fuerte**. Pareja natural de la revisión por abogado.
- **Verificar GA4 + Clarity** activos y midiendo antes de difundir (medir el lanzamiento). *Ojo: Meta
  Pixel del scope MVP NO está cableado — solo GA4 + Clarity.*
- **Seguir publicando guías/listas curadas** — el modelo `CuratedList` ya está en prod (`/guias`, `/lista/[slug]`).
- **Legales: revisión por abogado** de `/terminos` y `/privacidad` antes de difundir (hoy es borrador sólido).

**Seguridad / infra:**
- **Anti-scraping:** falta la **regla de Rate Limit en Vercel Firewall** para `/lugar/*` y `/explorar` (el rate-limit de la app ya está durable en Upstash).
- **Verificación de email al registrarse** (i.3) — opcional post-launch (token de un uso + gateo).

**Deuda menor:**
- Podar SPECIFIC + pulir exclusiones mutuas de tags (o.4, o.7).
- Mover los íconos de categoría al read-model (hoy la home los hardcodea) (c).
- (ver también "Pendientes chicos de la s37" arriba).

---

## 📚 Historia y referencia

- **Cómo se construyó, sesión a sesión** (decisiones, bugs, refactors, deploys) → [docs/historico/PLAN_BITACORA.md](docs/historico/PLAN_BITACORA.md). **Es la materia prima del caso de portafolio/LinkedIn.**
- **Razonamiento del rediseño (Fase 9, sub-sesiones A-D)** → [PLAN_FASE9.md](PLAN_FASE9.md).
- **Docs superados** (handoff original, roadmap viejo, insumos, briefs de diseño consumidos) → [docs/historico/](docs/historico/).

---

**Regla:** no avanzar al siguiente paso del roadmap sin OK explícito del usuario. Tras cada avance real,
dejar este `PLAN.md` actualizado; si es una decisión de producto, anotarla también en la bitácora.
