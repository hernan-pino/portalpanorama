# 06 · Ubicación, comunas y Metro de Santiago
> Directorio de panoramas Chile — notas de trabajo  
> Estado: borrador / sugerencias para definir en producción

---

## Alcance v1

- **Comuna + Metro de Santiago** — solo Santiago
- Metro Valparaíso y otras ciudades: queda para cuando se expanda a regiones
- Barrios: no en v1, se evalúa para v2

---

## Líneas operativas Metro de Santiago

7 líneas actualmente operativas. Las líneas 7, 8 y 9 están proyectadas para 2027–2030 — no se incluyen en v1.

| Línea | Color | Hex | Recorrido |
|---|---|---|---|
| **L1** | Roja | `#E1251B` | San Pablo → Los Dominicos |
| **L2** | Amarilla | `#F5A800` | Vespucio Norte → Hospital El Pino |
| **L3** | Morada | `#8B5BA6` | Quilicura → Fernando Castillo Velasco |
| **L4** | Azul oscuro | `#004F9F` | Tobalaba → Plaza de Puente Alto |
| **L4A** | Celeste | `#009CDE` | Vicuña Mackenna → La Cisterna |
| **L5** | Verde | `#00A651` | Vicente Valdés → Plaza de Maipú |
| **L6** | Naranja | `#E67E22` | Cerrillos → Los Leones |

> **Nota:** una estación puede pertenecer a 2 o más líneas (combinación). Ejemplo: Baquedano es L1 + L5. Un local cercano a Baquedano muestra ambas líneas.

---

## Componentes visuales

### En tarjeta de listado (compacto)
Muestra la línea más cercana con su color oficial en forma de curva SVG + nombre de estación + tiempo a pie. Si hay 2 líneas (estación de combinación), muestra ambas curvas.

```
📍 5 min a pie  ⌒(roja)  Baquedano  L1
📍 3 min a pie  ⌒(roja) ⌒(verde)  Baquedano  L1  L5
```

La curva es un path SVG simple:
```svg
<path d="M2 12 Q14 2 26 12" stroke="#E1251B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
```

### En ficha completa — sección "Cómo llegar"
Más grande, con más contexto. Muestra hasta 2 estaciones cercanas con:
- Nombre de la estación + línea(s)
- Tiempo a pie estimado
- Salida recomendada si se sabe (ej: "Salida norte por Av. Italia")

### En el buscador — filtro por línea
Chips con el color de cada línea. El usuario filtra "muéstrame lugares cerca de cualquier estación de la L3".

---

## Regla de display

- Si la estación más cercana está a **más de 1.5 km**: no mostrar el componente de metro. Solo mostrar la comuna.
- Si está a **menos de 1.5 km**: mostrar hasta 2 estaciones cercanas ordenadas por distancia.
- Si la distancia no está calculada aún (ficha sin coordenadas): mostrar solo comuna.

---

## Estructura de base de datos

```sql
-- Catálogo de líneas (fijo, no editable por usuarios)
CREATE TABLE metro_lines (
  id         text PRIMARY KEY,  -- "L1", "L2", "L3", "L4", "L4A", "L5", "L6"
  color_hex  text NOT NULL,     -- "#E1251B"
  color_name text NOT NULL      -- "Roja"
);

-- Catálogo de estaciones (fijo, ~143 estaciones)
CREATE TABLE metro_stations (
  id       text PRIMARY KEY,  -- slug: "baquedano", "irrarrazaval"
  name     text NOT NULL,     -- "Irarrázaval"
  lines    text[] NOT NULL,   -- ["L3"] o ["L1","L5"] si es combinación
  commune  text,              -- "Ñuñoa"
  lat      float NOT NULL,
  lng      float NOT NULL
);

-- Campos que se agregan a la tabla places
ALTER TABLE places ADD COLUMN lat               float;
ALTER TABLE places ADD COLUMN lng               float;
ALTER TABLE places ADD COLUMN commune           text;
ALTER TABLE places ADD COLUMN nearest_stations  jsonb;
-- Ejemplo de valor en nearest_stations:
-- [
--   {"station_id": "irrarrazaval", "name": "Irarrázaval", "lines": ["L3"], "walk_minutes": 6},
--   {"station_id": "nunoa",        "name": "Ñuñoa",       "lines": ["L1"], "walk_minutes": 9}
-- ]
```

---

## Cómo se calcula nearest_stations

El cálculo se hace **una sola vez al guardar o editar la ficha** — no en runtime en cada búsqueda.

```
1. Admin o negocio ingresa la dirección del local
2. Sistema geocodifica la dirección → obtiene lat/lng
3. Calcula distancia Haversine entre el local y cada estación del catálogo
4. Guarda las 2 estaciones más cercanas que estén a ≤ 1.5 km en nearest_stations
5. Estima minutos a pie: distancia_metros ÷ 80 (velocidad promedio caminando)
```

> **v1:** estimación simple con Haversine + velocidad constante  
> **v2:** Google Maps Walking API o similar para tiempo real y ruta exacta

Si Metro de Santiago inaugura estaciones nuevas (extensión de línea), se corre un script que recalcula las fichas afectadas. No es frecuente — no justifica cálculo en tiempo real.

---

## Cómo se filtra por línea en búsquedas

```sql
-- "Muéstrame lugares cerca de la L3 en Ñuñoa"
SELECT * FROM places
WHERE commune = 'Ñuñoa'
  AND nearest_stations @> '[{"lines": ["L3"]}]'
  AND (place_type = 'permanent' OR event_date >= CURRENT_DATE)
ORDER BY is_premium DESC;

-- "Muéstrame lugares a menos de 5 minutos de cualquier metro"
SELECT * FROM places
WHERE nearest_stations @> '[{"walk_minutes": 5}]'
-- Nota: para esto necesitas un índice GIN en nearest_stations
```

```sql
-- Índice necesario para filtrado eficiente
CREATE INDEX idx_nearest_stations ON places USING GIN (nearest_stations);
CREATE INDEX idx_commune ON places (commune);
```

---

## Campos de ubicación en el formulario de creación de ficha

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| Dirección | text | ✅ | Calle + número. El sistema geocodifica |
| Comuna | select | ✅ | Dropdown con las 52 comunas de la RM |
| Lat / Lng | float | Auto | Se calcula automáticamente desde la dirección |
| Nearest stations | jsonb | Auto | Se calcula automáticamente desde lat/lng |
| Detalle de acceso | text | ❌ | Opcional: "Entrada por Espacio B, 2° piso" |
| Referencia | text | ❌ | Opcional: "Frente al supermercado Jumbo" |

---

## Comunas de la Región Metropolitana (dropdown)

Las 52 comunas ordenadas alfabéticamente para el selector:

Alhué · Buin · Calera de Tango · Cerrillos · Cerro Navia · Colina · Conchalí · Curacaví · El Bosque · El Monte · Estación Central · Huechuraba · Independencia · Isla de Maipo · La Cisterna · La Florida · La Granja · La Pintana · La Reina · Lampa · Las Condes · Lo Barnechea · Lo Espejo · Lo Prado · Macul · Maipú · María Pinto · Melipilla · Padre Hurtado · Paine · Pedro Aguirre Cerda · Peñaflor · Peñalolén · Pirque · Providencia · Pudahuel · Puente Alto · Quilicura · Quinta Normal · Recoleta · Renca · San Bernardo · San Joaquín · San José de Maipo · San Miguel · San Pedro · San Ramón · Santiago · Talagante · Tiltil · Vitacura · Ñuñoa

> Para v1 con foco en 2-3 comunas del MVP, el dropdown puede filtrar primero las comunas relevantes y mostrar el resto como "otras".

---

## Pendientes de definir

- [ ] ¿Qué API de geocodificación usar? (Google Maps Geocoding es la más precisa, pero tiene costo. Nominatim/OpenStreetMap es gratis pero menos precisa para Chile)
- [ ] ¿Se muestra el mapa en la ficha o solo la info textual de metro + dirección? (mapa implica Google Maps API con costo por carga)
- [ ] ¿El tiempo a pie en v1 es estimación simple o se usa API desde el inicio?
- [ ] ¿Se muestran las salidas específicas del metro o solo el nombre de la estación?
- [ ] ¿Los filtros por línea son de selección única o múltiple? (ej: buscar cerca de L1 O L3)
- [ ] ¿Se agregan las líneas 7, 8 y 9 al catálogo ya con colores aunque no estén operativas, o solo cuando abran?
- [ ] ¿Barrios en v2? Si sí, ¿se definen manualmente o se usan polígonos geográficos?
