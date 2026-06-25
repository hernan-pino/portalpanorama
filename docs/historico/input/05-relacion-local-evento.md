# 05 · Relación local ↔ evento
> Directorio de panoramas Chile — notas de trabajo  
> Estado: borrador / sugerencias para definir en producción

---

## Concepto central

Un local puede tener muchos eventos. Un evento pertenece a un local (o a ninguno si es externo).

No son dos cosas separadas — son dos entidades distintas con una foreign key. El museo existe como ficha permanente y dentro tiene sus eventos asociados. El usuario puede llegar desde dos caminos distintos.

---

## Los tres mundos

| Mundo | Descripción | Ejemplos | place_type |
|---|---|---|---|
| **Lugares y locales** | Existen siempre, sin fecha de expiración | Restaurante, bar, museo, parque, librería | `permanent` |
| **Eventos** | Ocurren en una fecha específica y expiran | Concierto, obra de teatro, taller puntual, feria pop-up | `event` |
| **Actividades recurrentes** | No es lugar permanente ni evento puntual | Taller de cerámica cada sábado, feria primer domingo del mes, stand-up cada jueves | `recurring` |

> **Recomendación para el MVP:** lanzar con locales permanentes + eventos puntuales. Dejar los recurrentes para v2 — son los más complejos de manejar (necesitan lógica de "¿va este sábado?", confirmación semanal, fechas dinámicas).

---

## Qué categoría aplica a cada mundo

| Categoría | Locales | Eventos | Recurrentes |
|---|---|---|---|
| 🍽 Gastronomía | ✅ principal | ⚠️ solo si es pop-up o cena especial | ✅ menú que cambia |
| 🎭 Shows y entretenimiento | ❌ | ✅ principal | ✅ principal |
| 🎨 Arte y cultura | ✅ museo/galería | ✅ exposición temporal | ✅ |
| 🌳 Naturaleza | ✅ principal | ❌ | ⚠️ actividad guiada recurrente |
| 📚 Talleres | ⚠️ si el local es una escuela | ✅ taller puntual | ✅ principal |
| 🛒 Ferias | ❌ | ✅ feria única | ✅ principal |
| 🛍 Locales y tiendas | ✅ principal | ❌ | ❌ |

> La categoría dice **qué es**. El `place_type` dice **cómo se comporta en el tiempo**.

---

## Estructura de base de datos

```sql
-- Tabla de locales (ya definida en doc 04, se agrega max_free_events)
ALTER TABLE places ADD COLUMN max_free_events int DEFAULT 1;

-- Tabla de eventos
CREATE TABLE events (
  id                  uuid PRIMARY KEY,
  place_id            uuid REFERENCES places(id), -- nullable: evento sin local fijo
  name                text NOT NULL,
  description         text,
  event_date          date NOT NULL,
  event_time          time,
  doors_open_time     time,          -- hora de apertura de puertas (nullable)
  duration_minutes    int,           -- duración estimada (nullable)
  category_main       text,          -- puede diferir del local (bar que hace teatro)
  subcategory_main    text,
  tags_specific       text[],
  price_range         int,           -- 0=gratis, 1=$, 2=$$, 3=$$$, 4=$$$$
  ticket_url          text,          -- link a Passline, Puntoticket, etc.
  is_featured         boolean DEFAULT false,  -- evento destacado (pagado)
  is_recurring        boolean DEFAULT false,
  recurrence_rule     text,          -- "every_thursday" | "first_sunday_month"
  expires_at          date,          -- expiración automática
  confirmed_this_week boolean,       -- para ferias/recurrentes que confirman semanalmente
  created_at          timestamptz DEFAULT now()
);
```

### Campo place_id nullable
Permite eventos que no tienen local fijo — un concierto en un parque, una feria itinerante. En ese caso el evento tiene su propia dirección. Sin esto habría que crear locales ficticios para cada parque o plaza.

### Categoría del evento ≠ categoría del local
Un bar que hace teatro los miércoles tiene categoría "Bar" como local, pero el evento tiene categoría "Teatro". Cada uno tiene sus propios tags. Esto es crítico para que el usuario que busca "teatro" encuentre el evento aunque el local sea un bar.

---

## Visibilidad según plan

| Combinación | Visibilidad del evento |
|---|---|
| Local gratis + evento gratis | Solo aparece en la ficha del local. No en buscador general ni en "Esta semana" |
| Local premium + evento gratis | Ficha del local + búsquedas de categoría. No en home ni destacados |
| Cualquier local + evento destacado ($4.990–$6.990) | Home, "Esta semana", búsquedas y ficha del local |
| Plan productora ($34.990/mes) | Todos los eventos del mes destacados automáticamente + página de productora propia |

---

## Flujos de navegación

### Camino A — Busco qué hacer
1. Buscador con filtros → resultados mixtos (locales + eventos)
2. Tarjeta del evento muestra el nombre del local como dato secundario
3. Abre ficha del evento → chip clickeable con el nombre del local
4. Navega al local → ve ficha completa + todos sus próximos eventos

### Camino B — Busco un lugar específico
1. Busca "GAM" o navega por categoría Arte y Cultura
2. Ve ficha del local + sección "Próximos eventos en este lugar"
3. Abre un evento específico con toda la info operacional

### Camino C — El negocio sube su evento
1. Entra a su panel → botón "+ Agregar evento"
2. Completa la ficha del evento (el lugar ya está pre-rellenado)
3. Elige visibilidad: gratis (solo en su ficha) o destacado (paga, aparece en buscador)

---

## Reglas

- **1 evento gratis** por local — visible en la ficha del local pero no en buscador general
- **Expiración automática:** los eventos se archivan al día siguiente de su fecha. No se borran — quedan en historial del local
- **Local premium:** puede publicar eventos gratis ilimitados en su ficha, pero sin posición garantizada en el buscador
- La categoría del evento puede diferir de la del local

---

## Cómo se ve en la ficha del local

La ficha del local tiene una sección "Próximos eventos en este lugar" con:
- Fecha (día + mes)
- Nombre del evento
- Hora + sala/espacio + precio referencial
- Link "Ver →" a la ficha completa del evento
- "Ver todos los eventos →" si hay más de 3

---

## Cómo se ve en la ficha del evento

La ficha del evento muestra:
- Breadcrumb: Eventos › Categoría › Comuna
- Chip clickeable con nombre del local → lleva a la ficha del local
- Dirección con detalle de acceso dentro del recinto (ej: "Entrada por Espacio B, 2° piso")
- Duración estimada + hora de apertura de puertas
- Todos los atributos específicos del evento (sala sentada, bar adentro, etc.)

---

## Pendientes de definir

- [ ] ¿Cuántos eventos gratis puede publicar un local premium? (se sugiere ilimitados en su ficha, pagados para aparecer en buscador)
- [ ] ¿Los eventos expirados se archivan automáticamente o requieren acción del admin?
- [ ] ¿Cómo se maneja la confirmación semanal de eventos recurrentes? (especialmente ferias)
- [ ] ¿El historial de eventos pasados es visible en la ficha del local?
- [ ] ¿Se puede compartir un evento directamente (link propio) o solo se accede desde el local?
- [ ] ¿Hay moderación de eventos antes de publicarse o se publican inmediatamente?
