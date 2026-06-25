# STRATEGY — Portal Panorama (estrategia post-MVP)

**La estrategia de crecimiento e ingresos desde que el producto está vivo.** Responde el "punto C"
del plan: cómo se secuencian **go-to-market**, **monetización** y **próxima feature** ahora que hay
producto real en producción. Es el norte de las decisiones de las próximas sesiones; el día a día
sigue en [PLAN.md](PLAN.md).

- **Estado / backlog / próximos pasos:** [PLAN.md](PLAN.md)
- **Qué es el producto / norte permanente:** [PRD.md](PRD.md)
- **Modelo de monetización detallado (razonamiento original):** [PLAN_FASE9.md](PLAN_FASE9.md) §Bloque 6

**Contexto:** el MVP está **LIVE desde 2026-06-23** en `portalpanorama.cl` con 214 lugares. Sin
audiencia todavía y sin datos de uso. El PRD fija la validación: **por comportamiento, ~1 mes
corriendo, piso ~1000 visitas / ~10 cuentas** antes de sacar conclusiones.

---

## 1. La cadena del ingreso (por qué este orden y no otro)

El objetivo del usuario son **ingresos extra**. El camino más corto a ingresos **no es construir
monetización ya** — es construir **audiencia ya**, porque lo que se vende es el acceso a esa
audiencia. La cadena:

```
Ingresos extra
  ↑ se vende VISIBILIDAD (nunca la info — principio rector, ver §3)
  ↑ hay una AUDIENCIA con la que vale la pena pagar por destacar
  ↑ hay TRÁFICO + RETENCIÓN (gente que llega y vuelve)
  ↑ (a) go-to-market trae gente  +  (b) algo que la gente QUIERA y la haga volver
```

La monetización es **el techo de la casa**: no se pone antes que las paredes (tráfico + retención).
Por eso go-to-market y "algo que la gente quiera" van **primero** — no porque importen más que la
plata, sino porque la plata se para encima de ellos.

---

## 2. Dos tipos de feature (esto ordena qué construir primero)

Las features no son una sola lista. Son dos, con propósitos opuestos:

| Tipo | Para qué | Ejemplos | Cuándo |
|---|---|---|---|
| **Demanda** (retención) | Que el organizador **vuelva** → construye audiencia | Eventos, reseñas propias, filtros OCCASION/EXPERIENCE, IA recomendadora, mapa/cerca de mí | **Primero** |
| **Oferta** (monetización) | Que un negocio **pague** → captura el valor | Reclamar ficha (self-service), posicionamiento pagado, planes de eventos | **Después**, sobre la audiencia |

**Regla:** primero las de **demanda**, porque sin audiencia las de oferta no tienen a quién cobrarle.
Un negocio no paga por destacar en un sitio que nadie visita.

**La pieza maestra es Eventos:** es el único feature que es **demanda Y oferta a la vez** — del lado
demanda da una razón **recurrente** para volver ("qué hago este finde"); del lado oferta es el vector
de monetización más rico (escalera de planes de eventos). Paga doble. Pero es el build más grande y
solo rinde con tráfico → es el gran salto de la Fase B, no lo primero.

---

## 3. Lo que YA está decidido (modelo de monetización, parqueado)

Definido en [PLAN_FASE9.md](PLAN_FASE9.md) §Bloque 6 (2026-06-06). **No se construye hasta tener
tráfico**, pero el modelo está cerrado y el schema dejó las puertas abiertas (`isPremium`, `ownerId`,
`Brand`, `Event`).

**Principio rector (innegociable):** nunca se gatea la info útil. **La ficha completa es gratis para
todos, siempre.** Se monetiza la **visibilidad**, no la **información**, y toda visibilidad pagada es
**declarada y transparente** (zona "Publicidad" separada y etiquetada).

**Las 6 fuentes de ingreso:**
1. **Posicionamiento pagado declarado** — zona dedicada arriba, hasta 3 slots, **tarifa plana mensual
   por contexto** ("sushi en Providencia"), acotado a categoría/comuna. Lo vende el admin a mano al
   arranque (sobre fichas con o sin dueño).
2. **Planes de negocio self-service** (post-MVP) — Free: reclama ficha + gestiona info/fotos + 1
   evento + responde reportes/reseñas. Premium **agrega herramientas/visibilidad, NO info**:
   estadísticas, card destacada, banner de ofertas, botón reserva, más eventos.
3. **Planes de eventos** (post-MVP) — escalera: evento destacado ($4.990–6.990) · plan productora
   ($29.990–39.990/mes) · plan venue ($49.990–69.990/mes). `max_free_events` = 1 por local.
4. **Servicio de fotos profesionales.**
5. **Upsell de servicios** (marketing/consultoría) + hub de material gratuito. Parqueado.
6. **Newsletter** con posición patrocinada por keyword (gratis al inicio = adquisición; se monetiza
   vendiendo posición, nunca cobrando por estar listado).

**Norte de la oferta:** que el negocio **reclame su ficha** para traspasarle la mantención. La base
(`Brand` + `ownerId` nullable) ya está construida.

---

## 4. La secuencia (el corazón de la estrategia)

### Fase A — AHORA: traer gente + afilar el core barato
- **Go-to-market** (§5): conseguir los primeros usuarios. Es la restricción que manda hoy.
- **Afilar el diferenciador, barato:** activar filtros **OCCASION ("Ideal para") y EXPERIENCE** como
  facetas (hoy viven en la ficha pero no filtran). Refuerza justo lo que se promociona en el
  go-to-market ("filtrabilidad por contexto social") y es de bajo costo (los datos ya existen).
- **Medir todo con GA4.** *Por qué ahora: es lo único accionable sin datos previos.*

### Fase B — ~1 MES (con datos de GA4): elegir el feature de demanda
- Leer GA4: ¿qué retiene? ¿qué buscan y no encuentran? ¿qué categorías traccionan?
- **Hipótesis fuerte: Eventos** (razón recurrente para volver + pieza maestra de monetización).
  Confirmar con datos antes de invertir el build grande.
- Candidatos de respaldo: reseñas propias (engagement + SEO), mapa/cerca de mí, IA recomendadora
  (el norte, build más pesado, va más adelante).
- *Por qué esperar: el PRD pide priorizar con datos; elegir hoy sería adivinar.*

### Fase C — DESPUÉS (con audiencia): encender la monetización de oferta
- Primero **reclamar ficha** (gratis): llena el lado oferta y da la mantención al negocio.
- Luego **posicionamiento pagado** (lo vende el admin a mano) y, si Eventos está vivo, **planes de
  eventos**.
- *Por qué al final: recién acá hay tráfico que vender.*

**Titular:** ingresos ← audiencia ← go-to-market + retención. Construir audiencia es construir el
ingreso.

---

## 5. Go-to-market (Fase A — plan aterrizado 2026-06-24)

**Canal #1 elegido:** **contenido (guías/listas) + comunidades.** Decisión del usuario. El SEO ya está
cableado (JSON-LD, sitemap, robots con visibilidad en IA) pero es lento (meses); con validación a ~1
mes hace falta un canal rápido. El contenido sirve de puente: rápido (compartible) y lento (SEO) a la
vez.

### Principio: el contenido ES el go-to-market
La carga de lugares (ritmo del usuario: **~50-100/semana**, completar categorías como hamburgueserías,
pizzerías, museos, plazas, locales + expandir comunas + ir mejorando las fichas existentes) **no es
trabajo aparte** del go-to-market: cada categoría/comuna que se completa = una **guía publicable** + una
**página que Google indexa**. Mejor ficha = mejor SEO = mejor lista.

### Las listas: dos tipos válidos (NO "los mejores X")
Una lista de "top rated" ordenada por score **no es curación**, es ordenar una tabla — se siente vacía
y cherry-pickeada. Se descarta. En su lugar:
1. **Guías exhaustivas por categoría/comuna** — "Guía de museos de Santiago", "Todas las
   hamburgueserías que valen la pena en Ñuñoa", "Pizzerías de Santiago". Valor = autoridad +
   completitud + SEO (cubren la búsqueda entera) + honestas (no es "las 3 que elegí"). **= el plan de
   carga del usuario.**
2. **Listas por ocasión/intención** — "Para una primera cita", "Llueve, ¿qué hago?", "Panoramas
   gratis", "Con niños". Curación con punto de vista = el diferenciador (contexto social) hecho
   contenido.

**Regla que ordena la carga:** la lista/guía **define qué cargar, no al revés.** Se elige el tema
primero y se carga **hacia** él → el mismo esfuerzo produce densidad + asset compartible + landing SEO.

### Meta de la Fase A
- **Plazo:** ~1 mes **desde que empieza la difusión** (primero hay que tener con qué difundir).
- **Métrica primaria: activación** (cuentas creadas + lugares guardados) — señal de valor real, no
  vanidad de visitas.
- **Piso de contexto:** ~1000 visitas / ~10 cuentas (PRD), para que la activación signifique algo.
- **Secundaria:** retención (vuelven) + clics en "Cómo llegar" (intención de visita → marcar como
  evento clave en GA4).

### Orden de ejecución
1. **Elegir 3-5 temas** de guía/lista alcanzables con foco de carga (ej: "Museos de Santiago" =
   finito y completable; "Hamburgueserías" = cargable en lote).
2. **Cargar hacia esos temas** (ritmo ~50-100/sem) + mejorar las fichas incluidas.
3. **Construir el read-model de listas curadas** (backlog ítem (d): "listar curadas" + seed/slug SEO)
   para poder publicar la guía/lista como landing. ⚠️ es un build pendiente — prerequisito para publicar.
4. **Sembrar en comunidades** (grupos de Facebook, Reddit r/santiago) + Instagram cuando exista la cuenta.
5. **Medir en GA4** contra la meta.

**Pendiente de definir con el usuario:** los 3-5 primeros temas de guía/lista.

---

## Changelog

- **2026-06-24** — Documento creado. Sintetiza el "punto C" (reevaluación post-MVP) conversado en la
  sesión 9: cadena del ingreso, demanda vs. oferta, secuencia A/B/C, y recordatorio del modelo de
  monetización ya definido. Go-to-market queda como sección a aterrizar.
