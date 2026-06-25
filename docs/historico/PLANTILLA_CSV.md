# PLANTILLA_CSV.md — Carga masiva de lugares

Plantilla de columnas para cargar `Place` por CSV/JSON curado (Etapa 5). **Derivada directo del
schema** ([SCHEMA.md](SCHEMA.md)) — define lo que NUESTRO producto necesita, independiente de la
fuente. El mapeo "de dónde sale cada campo" (Apify vs manual vs scraper) se zanja al cargar; la
columna **Origen** de abajo es solo una sugerencia.

Archivo de plantilla listo para usar: [`input/plantilla_lugares.csv`](input/plantilla_lugares.csv)
(header + 1 fila de ejemplo).

**Última actualización:** 2026-06-07.

---

## Reglas de formato

- **Codificación:** UTF-8. Separador: coma. Texto con comas → entre comillas dobles `"…"`.
- **FKs por slug, no por ID:** las columnas de categoría, comuna, barrio, metro y tags se cargan
  con el **slug** del catálogo (no el CUID2). El script de import los resuelve a ID. Si un slug no
  existe en el catálogo seedeado → la fila falla (no se inventa el catálogo).
- **Listas dentro de una celda:** separadas por `;` (punto y coma). Ej. tags, métodos de pago,
  galería.
- **Vacío = NULL:** una celda vacía deja el campo nulo (válido para todo lo opcional).
- **`score` NO va en el CSV:** se calcula al cargar/editar (promedio bayesiano) a partir de
  `google_rating` + `google_review_count`.

**Obligatoriedad:** 🔴 obligatorio · 🟡 recomendado · ⚪ opcional.

---

## Columnas

### Identidad

| Columna | Oblig. | Formato | Origen | Nota |
|---|:---:|---|---|---|
| `name` | 🔴 | texto | Apify | Nombre del lugar. |
| `slug` | ⚪ | kebab-case | Auto | Si se deja vacío se autogenera desde `name`. Dar uno solo para fijarlo (SEO). |
| `description` | 🟡 | texto largo | Manual | Qué ofrece. Materia prima del SEO/GEO — vale la pena escribirla bien. |
| `menu_url` | ⚪ | URL | Manual | Link a menú/carta. |

### Categorización (4 FKs)

| Columna | Oblig. | Formato | Origen | Nota |
|---|:---:|---|---|---|
| `category` | 🔴 | slug categoría | Manual | Una de las 7 (MVP activas: `gastronomia`, `naturaleza`, `arte-cultura`, `locales-tiendas`). |
| `subcategory` | 🔴 | slug subcategoría | Manual | Debe pertenecer a `category`. |
| `secondary_category` | ⚪ | slug categoría | Manual | Categoría secundaria (peso 0.5 en búsqueda). |
| `secondary_subcategory` | ⚪ | slug subcategoría | Manual | Debe pertenecer a `secondary_category`. |

### Ubicación

| Columna | Oblig. | Formato | Origen | Nota |
|---|:---:|---|---|---|
| `address` | 🟡 | texto | Apify | Calle + número + comuna. Habilita el CTA "Cómo llegar". |
| `commune` | 🔴 | slug comuna | Apify/Manual | Comuna de la RM (ej. `providencia`, `nunoa`). |
| `neighborhood` | ⚪ | slug barrio | Manual | Barrio reconocido (ej. `barrio-italia`). Filtrable aparte de la comuna. |
| `lat` | 🟡 | decimal | Apify | Latitud. Gratis del scrape; habilita mapa/"cerca de mí" (v2). |
| `lng` | 🟡 | decimal | Apify | Longitud. |
| `metro_station` | ⚪ | slug estación | Manual | Estación más cercana (ej. `los-leones`). Filtrable por estación/línea. |
| `access_detail` | ⚪ | texto | Manual | "Entrada por Espacio B, 2° piso". |
| `reference` | ⚪ | texto | Manual | "Frente al Jumbo". |
| `rain_policy` | ⚪ | enum | Manual | Solo aire libre: `SUSPENDED` / `RELOCATED` / `CONTINUES`. |

### Presupuesto / operacional

| Columna | Oblig. | Formato | Origen | Nota |
|---|:---:|---|---|---|
| `price_range` | 🟡 | enum | Manual | `FREE` / `UNDER_5000` / `FROM_5000_TO_15000` / `FROM_15000_TO_30000` / `OVER_30000`. |
| `reservation` | ⚪ | enum | Manual | `REQUIRED` / `WALK_IN` / `RECOMMENDED`. "Sin reserva" = `WALK_IN`. |
| `payment_methods` | ⚪ | lista `;` | Manual | Ej. `efectivo;debito;credito`. Informativo (no filtro MVP). |
| `schedule` | 🟡 | texto largo | Apify | Horario en texto libre. (Estructurar por día = puerta abierta.) |

### Contacto

| Columna | Oblig. | Formato | Origen | Nota |
|---|:---:|---|---|---|
| `phone` | ⚪ | texto | Apify | |
| `website` | ⚪ | URL | Apify | |
| `instagram` | ⚪ | URL o @handle | Apify/Manual | |

### Reputación Google

| Columna | Oblig. | Formato | Origen | Nota |
|---|:---:|---|---|---|
| `google_place_id` | 🟡 | texto | Apify | Único. Útil para dedupe y refresco futuro. |
| `google_rating` | 🟡 | decimal 0–5 | Apify | Alimenta el `score`. |
| `google_review_count` | 🟡 | entero | Apify | Alimenta el `score`. |

### Galería

| Columna | Oblig. | Formato | Origen | Nota |
|---|:---:|---|---|---|
| `image_primary_url` | 🟡 | URL | Apify | Foto principal (URL **origen**; el import la descarga y re-aloja en storage propio). |
| `image_urls` | ⚪ | lista `;` de URLs | Apify | Resto de la galería. |
| `image_credit` | ⚪ | texto | Manual | Crédito/origen común (ej. `Instagram del local`, `Google`). |

### Tags (4 capas — slugs separados por `;`)

| Columna | Oblig. | Formato | Origen | Nota |
|---|:---:|---|---|---|
| `tags_social` | ⚪ | lista `;` | Manual | Contexto social, **máx 4** (ej. `en-pareja;con-amigos`). |
| `tags_specific` | ⚪ | lista `;` | Manual | Atributos condicionales a la categoría (ej. `cocina-peruana`). |
| `tags_access` | ⚪ | lista `;` | Manual | Logística de acceso (ej. `estacionamiento;accesible-silla-ruedas`). |
| `tags_vibe` | ⚪ | lista `;` | Manual | Ambiente, **máx 3** (ej. `tranquilo;fotogenico`). |

> **No van en el CSV** (se setean fuera): `status` (default `PENDING_REVIEW`; el admin publica),
> `is_premium` (default false), `owner_id` (MVP = todo del admin), `score` (calculado).

---

## Orden de columnas del CSV

```
name, slug, description, menu_url,
category, subcategory, secondary_category, secondary_subcategory,
address, commune, neighborhood, lat, lng, metro_station, access_detail, reference, rain_policy,
price_range, reservation, payment_methods, schedule,
phone, website, instagram,
google_place_id, google_rating, google_review_count,
image_primary_url, image_urls, image_credit,
tags_social, tags_specific, tags_access, tags_vibe
```

---

## Pendientes que esta plantilla deja a la vista (para el seed / Etapa 3)

Para que las columnas-slug resuelvan, el catálogo debe existir **antes** de cargar lugares:
- **Comunas** (`commune`): faltan 28 de 52 (H4). Para el arranque bastan las de las zonas densas.
- **Barrios** (`neighborhood`): no hay lista (H3); definir los de Providencia + Ñuñoa o dejar vacío.
- **Estaciones de metro** (`metro_station`): falta el catálogo de ~143 (H2).
- **Categorías/subcategorías y tags** (`category`/`tags_*`): seedear las 7 categorías + subcats +
  tags por capa del doc 04, con sus slugs definitivos.
