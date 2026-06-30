# GO_TO_MARKET — Plan de ejecución a 3 meses (Fase A)

**El "cómo" y el "cuándo" del go-to-market.** Objetivo único, tablero de metas, ritmo semanal,
calendario mes a mes y el **checklist vivo de carga** (lo que se tacha semana a semana). Es el plan
operativo de la **Fase A** de [STRATEGY.md](STRATEGY.md).

- **El porqué / la secuencia A-B-C:** [STRATEGY.md](STRATEGY.md) · **Estado y backlog del día a día:** [PLAN.md](PLAN.md)
- **Qué es el producto / norte permanente:** [PRD.md](PRD.md)

**Creado:** 2026-06-28 (sesión 15). **Perfil de trabajo del usuario:** empezó un trabajo nuevo →
**~10 h/semana** en bloques de **~50 min/día**, **keyboard-first** (cargar lugares + escribir guías),
**difusión liviana** (anuncios puntuales en foros + redes creadas, listas para cuando hagan falta).

---

## 🎯 Objetivo (un solo norte a 3 meses)

> **Llegar al piso de validación con tráfico y datos reales para decidir, con evidencia y no
> adivinando, cuál es el próximo gran build (hipótesis: Eventos).**

En la cadena de la estrategia: **cerrar la Fase A → desbloquear la decisión de la Fase B.** No es
"ganar plata todavía" — es construir la **audiencia mínima** sobre la que después se para el ingreso.
Cada tarea de la semana sirve a este norte o no entra al plan.

---

## 📊 Tablero de metas (revisar 1 vez al mes en GA4)

| Métrica | Por qué | Meta a 3 meses |
|---|---|---|
| **Activación** (cuentas + guardados) — *primaria* | Valor real, no vanidad | ~**30 cuentas** · ~**150 guardados** |
| **Tráfico** (visitas) | Piso de contexto del PRD | ~**1.500-2.000 visitas/mes** al mes 3 |
| **Intención** (clics "Cómo llegar") | La señal más fuerte de querer ir | marcar **evento clave** en GA4 y verlo subir |
| **Retención** (vuelven) | Sin esto no hay audiencia | tendencia positiva |
| **Contenido** (palanca 100% controlable) | Lo único que depende solo de ti | **+8-10 guías** · **+~1.100 lugares** (→ ~1.300 total) |

**Regla de oro:** la activación manda sobre las visitas. 300 visitas que generan 15 cuentas valen más
que 3.000 que rebotan.

---

## 🔁 Ritmo semanal (la plantilla de ~50 min/día)

Cuatro "modos". Un bloque = **una** cosa (no mezclar):

- **🏗️ Cargar** (la mayoría de los bloques): componer la lista de entrada barriendo comunas → agente
  `investigador-lugares` → `ingest-fichas` → `enrich-ratings --force --with-photos` → revisar/publicar
  en `/admin/lugares`. El agente investiga en background; tus 50 min se van en **componer la lista** +
  **revisar/publicar**.
- **📝 Guía** (~1 bloque/sem): cuando un tema queda denso, escribir los destacados en
  `scripts/curated-lists.data.ts` → push → queda viva sola.
- **📣 Difundir** (cuando sale una guía): 1 post en r/santiago + 1-2 grupos de Facebook. Evento
  puntual, no diario.
- **📈 Medir** (1 vez al mes): leer GA4 contra el tablero y ajustar el mes siguiente.

**El verdadero techo es tu tiempo de revisión en el admin, no Apify** — cada lugar necesita una mirada
antes de publicar. A ~400/mes (~100/sem) eso es lo que conviene cuidar.

---

## 🗓️ Calendario mes a mes

### Mes 1 — JULIO: arrancar la máquina (~300 lugares)
Eje: **carga por categoría × todo Santiago** (no solo comunas densas). Cada barrido produce una guía
SEO **y** expande comunas; las comunas que se densifican se "gradúan" a guía propia en Mes 2-3.
- **Quick win sin carga:** publicar lista **"Para una primera cita"** (ya hay ~80 lugares con
  `ocasion=cita` → solo elegir y escribir destacados). Primer asset compartible en días.
- Barridos flagship → cada uno cierra con su **guía exhaustiva** + **anuncio en foros**.
- **Crear/reservar redes** (una sola vez).
- Fin de mes: **lectura base de GA4** (línea de partida).

### Mes 2 — escalar contenido (~400 lugares)
- 2-3 categorías flagship más (heladerías, brunch/desayunos, panaderías, bares temáticos…).
- Publicar **"Panoramas gratis en Santiago"** (ocasión, cruza categorías, muy compartible).
- Publicar la **1ª guía de comuna "graduada"** (una comuna que se densificó en julio).
- **Skill `redactar-difusion` — condicional** (ver abajo): solo si en julio el canal manual mostró
  señal y redactar el copy resultó ser la fricción.

### Mes 3 — consolidar + DECIDIR (~400 lugares)
- 1-2 guías más (comuna o categoría).
- **Mejorar las fichas más visitadas** (según GA4) — el SEO compone.
- **Vista mapa en /explorar** — *si* GA4 muestra que la navegación por ubicación importa (ver abajo).
- **🔑 Lectura seria de GA4** (ya con ~2 meses de datos) → **decisión Fase B: ¿Eventos sí/no?**
  Este es el entregable que cierra los 3 meses.

---

## 📋 Checklist de carga — VIVO (julio)

**Flujo por lote (se repite):**
1. Elegir categoría + componer lista de lugares (nombres/place_ids) **barriendo comunas**.
2. Agente `investigador-lugares` → JSON en `tmp/fichas/`.
3. `ingest-fichas` → crea como **PENDING_REVIEW** (borrador, nunca publica).
4. `enrich-ratings --force --with-photos` → coords + rating de Google + fotos.
5. Revisar y publicar en `/admin/lugares`.

**Tamaño de lote:** ~15-20 por sesión. **Bar de calidad:** solo lo que vale la pena (rating ~4.0+ con
suficientes reseñas). Lo nuevo/dudoso queda en PENDING_REVIEW, no se publica por rellenar.

**Metas por categoría (julio):**

| Categoría | Meta | Asset que produce |
|---|---|---|
| Hamburgueserías city-wide | ~50 | Guía "Hamburgueserías de Santiago" |
| Pizzerías city-wide | ~50 | Guía "Pizzerías de Santiago" |
| Plazas y parques city-wide | ~40 | Alimenta "Panoramas gratis" (Mes 2) |
| Cafeterías (expandir a más comunas) | ~40 | Refuerza la guía de cafeterías existente |
| Relleno de 2-3 comunas nuevas (sus categorías top: restaurantes, bares, cafés) | ~120 | Densifica comunas → candidatas a "graduarse" |

→ **~300 lugares en julio.**

**Semana a semana:**

**Semana 1**
- [x] Publicar lista **"Para una primera cita"** ✅ (2026-06-29) — 10 destacados + 5 menciones honoríficas (incl. MUT). Regla `occasion=cita` viva. **✅ En prod completa (2026-06-30): 5 menciones, MUT incluido** (se sincronizó el MUT + su pin de mención). De paso: tier de menciones, paginador, página `/guias`, scroll-to-top.
- [x] Lote 1 — Hamburgueserías ✅ (**30** PUBLISHED, born-tagged `cuisine=hamburguesas`, enriquecidas) cubriendo núcleo + Maipú, La Florida, Puente Alto, etc. **✅ Sincronizado a prod (2026-06-30)** con `scripts/prod-sync.ts` (los 30 + MUT + 28 tags CUISINE; prod = local, 250 lugares).
- [x] Crear/reservar redes ✅ (2026-06-30) — **Instagram creado**. Se tienen **dos cuentas**: **`@portalpanorama.cl`** (la que se usará, calza con el dominio) + **`@portal_panorama`** (reservada como respaldo, por si pasa algo). **Falta:** cablear el handle real en el footer de la app (hoy dice *"coming soon"*; el campo `instagram` ya existe) — hacerlo una sola vez con `@portalpanorama.cl`. Otras redes (TikTok/Facebook) más adelante.

**Semana 2**
- [ ] Lote 2 — Hamburgueserías, más comunas (Est. Central, San Miguel, Puente Alto, Macul, Recoleta) → ~25 → **total ~50**
- [ ] Publicar guía **"Hamburgueserías de Santiago"** + anunciar en foros
- [ ] Lote 3 — Pizzerías city-wide → ~25

**Semana 3**
- [ ] Lote 4 — Pizzerías, más comunas → ~25 → **total ~50**
- [ ] Publicar guía **"Pizzerías de Santiago"** + anunciar
- [ ] Lote 5 — Plazas y parques city-wide → ~40

**Semana 4**
- [ ] Lote 6 — Cafeterías a más comunas → ~40
- [ ] Lote 7 — Relleno de 2-3 comunas nuevas (categorías top) → ~120 (repartido)
- [ ] **Lectura base de GA4**

---

## 🔑 Apify — dos cuentas (headroom)

El enrich con fotos es lo caro y, a ~400 lugares/mes, **una sola cuenta free ($5/mes) se queda corta**.
Con **2 cuentas se dobla el free tier** → habilita el volumen. (El enrich solo-coords salió ~$0.0067/lugar;
con fotos cuesta bastante más — se vigila el medidor.)

**Manejo seguro:** no pegar la key en el chat. Va en `.env.local` (la primera como `APIFY_TOKEN`, la
segunda anotada aparte); cuando una llega al tope, se cambia el valor y se sigue. Si se vuelve
recurrente, cablear un fallback automático entre las dos.

---

## 🗺️ Vista mapa en /explorar — diferida a Mes 2-3

**Por qué después y no ahora:**
- El mapa **brilla con densidad**; hoy fuera del núcleo se ve vacío. La carga de julio (categoría × todo
  Santiago) es justo la que reparte pines → recién ahí paga.
- Es un **build real** (Mapbox/clustering, lista sincronizada con el mapa) que compite con la carga, y
  **la carga es la restricción que trae tráfico**. El mapa no trae visitas; el contenido sí.
- Es feature de **retención** (candidato Fase B) → mejor decidirlo **con datos de GA4**.

**Listo a favor:** las **coordenadas ya están backfilleadas**, la data está lista cuando se construya.

**Scope cuando se haga (referencia: tuslibros.cl):** lo mejor de los dos mundos →
- **Toggle Grilla↔Mapa client-side** (instantáneo, sin tocar el server, sin cambiar la URL: es la misma
  data filtrada renderizada distinto).
- **Filtros siguen en la URL** (server-side) por SEO + compartibilidad (cada combinación = link real
  indexable). *Esta es la razón de por qué hoy en /explorar la URL cambia al filtrar y en tuslibros no:
  allá el toggle es estado de cliente con `#tienda`; acá los filtros viven en la URL a propósito.*

---

## 📣 Skill `redactar-difusion` — Mes 2-3 (condicional)

Hermana de `ficha-lugar` / `investigador-lugares`: dado una guía o lote, **redacta los drafts** de
difusión (anuncio para foros, caption de IG, post de Reddit) para revisar y publicar a mano
(**human-in-the-loop** → sin riesgo de baneo ni muro de APIs; el humano aprieta "publicar").

**Condición de gatillo:** solo se construye si en el Mes 1 el canal manual mostró señal y **redactar el
copy** resultó ser la fricción real. Si los 2-3 posteos de julio fueron triviales, no se construye
(sería tubería para agua que ya corre sola). **No** se construye un bot que postea solo — automatiza un
número que hoy es ~cero y envenena los canales.

---

## ⚠️ Gotchas conocidos
1. **Tag/categoría nueva no viaja con el push** — hay que sembrarla en prod a mano (script aditivo +
   `PROD_DB_URL` temporal). Las listas de ocasión sobre filtros **ya vivos** (cita, gratis) no tienen
   este problema.
2. **Guía ya creada en prod no se re-edita sola** (first-write-wins) — se edita en `/admin/listas`, no
   en el archivo de datos.

---

## Changelog
- **2026-06-28** (sesión 15) — Documento creado. Aterriza la Fase A de STRATEGY.md en plan ejecutable a
  3 meses tras el cambio de disponibilidad del usuario (~10 h/sem). Decisiones: eje de carga por
  categoría × todo Santiago; volumen ~300 (jul) → ~400/mes con 2 cuentas de Apify; mapa y skill de
  difusión diferidos/condicionales a Mes 2-3.
