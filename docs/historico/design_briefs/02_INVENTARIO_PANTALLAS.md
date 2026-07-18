# Inventario de pantallas y flujos — Portal Panorama

Todo lo que existe hoy en producción. Cada pantalla tiene su captura en `capturas/movil/` y
`capturas/desktop/` con el mismo número.

**Prioridad de rediseño:** 🔴 crítica (la ve todo el mundo, todos los días) · 🟡 importante ·
⚪ secundaria (funciona, hereda el sistema).

---

## A. Público — sin sesión (🔴 la cara del producto)

| # | Pantalla | Ruta | Qué hace | Prioridad |
|---|---|---|---|---|
| 01 | **Home** | `/` | La puerta. Buscador + chips de contexto social ("con quién voy") + chips de categoría + carruseles de lugares ("lo mejor valorado", listas curadas) | 🔴 |
| 02 | **Explorar** | `/explorar` | **El pilar del producto.** Grilla de tarjetas + panel de filtros por facetas (categoría, comuna, precio, con quién, ambiente, servicios) + selector de orden | 🔴 |
| 03 | Explorar filtrado | `/explorar?categoria=…` | El mismo, con filtros activos y sus chips removibles | 🔴 |
| 04 | Explorar con búsqueda | `/explorar?q=…` | El mismo, con búsqueda de texto ("café para trabajar") | 🔴 |
| 05 | **Ficha de lugar** | `/lugar/[slug]` | **La pantalla que cierra la decisión.** Galería, nombre, categoría, rating de Google, CTA guardar/cómo llegar, descripción, tags por capa, datos prácticos (precio, horario, reserva, pago, servicios), contacto, similares, reportar | 🔴 |
| 06 | Lista curada | `/lista/[slug]` | Landing editorial de SEO ("Las mejores librerías de Santiago"): intro + grilla | 🟡 |
| 07 | Página de marca | `/marca/[slug]` | Cadena con varias sucursales: logo, descripción, sus locales | ⚪ |
| 08 | Guías | `/guias` | Índice de las listas curadas | 🟡 |
| 09 | Cómo ordenamos | `/como-ordenamos` | Transparencia del ranking (nadie paga por subir) | ⚪ |
| 10 | **Para negocios** | `/para-negocios` | Landing del lado negocio: dos caminos (reclamar ficha existente / publicar negocio nuevo), beneficios, precio (gratis), FAQ | 🟡 |
| 11-13 | Login · Registro · Recuperar | `/login` `/registro` `/recuperar` | Auth. Google primero, email/contraseña debajo | 🟡 |
| 14-15 | Términos · Privacidad | `/terminos` `/privacidad` | Legales | ⚪ |
| 16 | **Menú móvil** | (overlay) | El menú hamburguesa. Espeja el header de desktop en los 4 estados de sesión | 🔴 |

## B. Consumidor — con sesión

| # | Pantalla | Ruta | Qué hace | Prioridad |
|---|---|---|---|---|
| 20 | Home con sesión | `/` | Igual, pero el header cambia (avatar/menú de cuenta) | 🔴 |
| 21 | **Mi cuenta** | `/mi-cuenta` | Sus listas guardadas (con sus lugares), historial de visitas | 🟡 |
| 22 | Mi perfil | `/mi-cuenta/perfil` | Datos, comuna home, contraseña | ⚪ |
| 23 | **Modal de guardar** | (overlay) | **La acción de conversión principal.** Se abre desde 3 lugares (corazón de la tarjeta, botón de la ficha, barra fija móvil). Sin sesión invita a registrarse; con sesión muestra sus listas | 🔴 |
| 24 | Reclamar ficha | `/reclamar/[slug]` | "¿Este negocio es tuyo?" → formulario de reclamo | ⚪ |

## C. Dueño de negocio (cuenta de negocio, gratis)

| # | Pantalla | Ruta | Qué hace | Prioridad |
|---|---|---|---|---|
| 30 | **Panel del negocio** | `/mi-negocio` | Dashboard: KPIs (visitas, guardados, clics de contacto), tarjeta por ficha, "Estado de tu ficha" (barra de completitud + checklist) | 🟡 |
| 31 | Editor de su ficha | `/mi-negocio/[slug]/editar` | El dueño corrige info operacional: descripción, horario estructurado, teléfono, web, redes, fotos, precio | 🟡 |
| 32 | **Wizard de alta** | `/mi-negocio/nuevo` | 3 pasos sin recargas: (1) crea la cuenta / entra, (2) datos del negocio, (3) listo | 🟡 |

## D. Admin (solo el dueño del producto; se usa en desktop)

| # | Pantalla | Ruta | Prioridad |
|---|---|---|---|
| 40 | Inicio del admin | `/admin` | ⚪ |
| 41-43 | Lugares (lista · editar · nuevo) | `/admin/lugares` | ⚪ El formulario de ficha es **largo y denso** (decenas de campos + tags de 6 capas + imágenes) |
| 44-45 | Marcas | `/admin/marcas` | ⚪ |
| 46-47 | Listas curadas | `/admin/listas` | ⚪ |
| 48 | Bandeja de reclamos | `/admin/reclamos` | ⚪ Panel desplegable para decidir sin cambiar de pantalla |
| 49 | Reportes y sugerencias | `/admin/reportes` | ⚪ |
| 50 | Usuarios | `/admin/usuarios` | ⚪ |
| 51 | Analítica | `/admin/analytics` | ⚪ Barras y rankings hechos a mano con CSS |
| 52 | Cobertura | `/admin/cobertura` | ⚪ Qué comunas/categorías faltan por cargar |

---

## Los flujos que importan

**1. Descubrir → decidir → guardar (el flujo principal, en el celular)**
```
Home → chip "en pareja" o buscador
     → Explorar (grilla + filtros)      ← acá se pasa la mayor parte del tiempo
     → Ficha del lugar                  ← acá se decide
     → Guardar en una lista             ← acá se convierte (pide cuenta si no hay sesión)
```
Es **el 90% del valor**. Si el rediseño solo mejora estas tres pantallas, ya vale la pena.

**2. Volver a lo guardado**
```
Header → Mi cuenta → sus listas → Ficha
```

**3. El dueño del negocio**
```
/para-negocios → (su local ya está)  → Reclamar ficha  → el admin verifica → panel
              → (su local no está)   → Wizard 3 pasos  → el admin la completa → panel
```

**4. El admin (carga de contenido)**
```
/admin/lugares/nuevo → formulario largo → publicar
```

---

## Componentes que se repiten en todas partes

Estos son los que más rinde rediseñar, porque aparecen decenas de veces por pantalla:

1. **Tarjeta de lugar** (`PlaceCard`) — foto, nombre, categoría·comuna, rango de precio, rating,
   corazón de guardar. **Es el ladrillo del producto**: aparece en home, explorar, listas, marca,
   similares, mi cuenta.
2. **Chip / tag** — filtros activos, tags de la ficha, chips de contexto de la home. Hoy todos
   iguales; deberían distinguirse por capa.
3. **Botón** — primario (sunset sólido), secundario, fantasma.
4. **Panel de filtros** (`Filters`) — facetas con contadores.
5. **Barra de búsqueda** (`SearchBar`) — con sugerencias.
6. **Header** (`Header` + `MobileNav`) — cambia según los 4 estados de sesión.
7. **Modal** (`SaveModal`) — el único overlay del producto.
8. **Toast** — feedback de acción.
9. **Badge de estado** — publicado / en revisión / del dueño (admin).
10. **Tabla de admin** — densa, con acciones por fila.
