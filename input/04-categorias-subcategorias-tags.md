# 04 · Arquitectura de categorías, subcategorías y tags
> Directorio de panoramas Chile — notas de trabajo  
> Estado: borrador / sugerencias para definir en producción

---

## Estructura general

Cada ficha tiene:
- **1 categoría principal** (obligatoria) → define el tipo de ficha y activa los tags específicos
- **1 subcategoría principal** (obligatoria) → el tipo exacto dentro de la categoría
- **1 categoría secundaria** (opcional) → para lugares que encajan en dos categorías
- **1 subcategoría secundaria** (opcional)

> La categoría secundaria se guarda en campos separados, no como tag. En búsquedas, la principal tiene peso 1.0 y la secundaria peso 0.5.

### Ejemplos principal + secundaria

| Lugar | Principal | Secundaria |
|---|---|---|
| Heladería con mesas | Gastronomía › Heladería | Gastronomía › Café |
| Bar con música en vivo | Gastronomía › Bar | Shows › Música en vivo |
| Feria con food trucks | Ferias › Feria gastronómica | Gastronomía |
| Museo con taller finde | Arte › Museo | Talleres › Taller creativo |
| Comedia con bar | Shows › Comedia / Stand-up | Gastronomía › Bar |

> **Regla:** la categoría la define el **uso real del lugar**, no lo que vende. Una heladería donde la gente se sienta y se queda es funcionalmente un café.

---

## Sistema de tags — 4 capas

### Capa 1: Categoría y subcategoría
Dropdown obligatorio. Activa las opciones de las capas siguientes.

### Capa 2: Contexto social
Universal para todas las categorías. Máximo 4 tags.  
Define con quién vas y en qué situación.

### Capa 3: Atributos específicos
Condicionales — solo aparecen los relevantes para la categoría elegida.  
Sin límite duro, pero se recomienda no pasar de 8 en la ficha pública para legibilidad.

### Capa 4: Vibe / Ambiente
Universal. Máximo 3 tags.  
Lo subjetivo estructurado — solo admin puede editarlo en fichas gratis, premium lo edita el negocio.

---

## Categorías completas

### 🍽 Gastronomía
*Tipo: lugar permanente*

**Subcategorías:**
Restaurante · Café / Cafetería · Bar · Botillería · Fuente de soda · Food truck · Heladería · Pastelería / Panadería · Jugería · Cevichería · Picada · Sushi / Asiática

**Atributos específicos:**
Terraza · Terraza cubierta · Con reserva · Sin reserva · Reserva recomendada finde · Happy hour · Menú del día · Menú infantil · Opciones veganas · Vegetariano · Sin gluten · Música en vivo · Pantalla deportes · Acepta tarjeta · Solo efectivo · Acepta Mercado Pago · Estacionamiento · Cerca metro · Para llevar · Delivery propio · Vista panorámica · Sillas para bebés · Cambiador pañales · Acceso silla de ruedas

**Vibe disponible:**
Tranquilo · Animado · Íntimo · Ruidoso · Fotogénico · Casual · De barrio · Trendy · Especial / Único

---

### 🎭 Shows y entretenimiento
*Tipo: evento temporal*

**Subcategorías:**
Concierto · Comedia / Stand-up · Teatro · Danza / Ballet · Ópera / Clásica · Festival · Fiesta / Club · Karaoke · Cine al aire libre · Escape room · Trivia / Pub quiz · Magia / Circo

**Atributos específicos:**
Sala sentada · De pie · Mixto · Formato íntimo · Con telonero · Con interacción · Bar adentro · Artista nacional · Artista internacional · Primera vez en Chile · Con subtítulos · +18 · Todas las edades · Requiere entrada · Entrada liberada · Recurrente semanal · Puertas abren antes · Guardarropía · Estacionamiento · Cerca metro

**Vibe disponible:**
Animado · Íntimo · Fiestero · Cultureta · Emotivo · Familiar · Especial / Único

---

### 🎨 Arte y cultura
*Tipo: lugar o evento*

**Subcategorías:**
Museo · Galería de arte · Exposición temporal · Centro cultural · Monumento / Patrimonio · Experiencia inmersiva · Cine / Cineteca · Biblioteca

**Atributos específicos:**
Entrada gratuita · Precio diferenciado · Requiere reserva · Visita guiada disponible · Audioguía · Fotografía permitida · Cafetería interna · Tienda interna · Acceso silla de ruedas · Apto niños · Talleres asociados · Exposición permanente · Exposición temporal

**Vibe disponible:**
Tranquilo · Cultureta · Fotogénico · Íntimo · Especial / Único

---

### 🌳 Naturaleza y aire libre
*Tipo: lugar permanente*

**Subcategorías:**
Parque urbano · Cerro / Trekking · Playa / Lago / Río · Reserva natural · Mirador · Jardín botánico · Camping · Piscina / Balneario

**Atributos específicos:**
Entrada gratuita · Requiere reserva · Accesible en micro · Requiere auto · Dificultad baja · Dificultad media · Dificultad alta · Con baños · Con zona picnic · Con sombra · Acepta mascotas · Apto coche guagua · Acceso silla de ruedas · Señal de celular · Funciona con lluvia · Solo verano · Todo el año · Estacionamiento

**Vibe disponible:**
Tranquilo · Fotogénico · Relajado · Aventurero · Familiar · Especial / Único

---

### 📚 Talleres y actividades
*Tipo: evento o recurrente*

**Subcategorías:**
Taller creativo · Clase de cocina · Cata de vinos / cervezas · Yoga / Meditación · Deporte / Aventura · Tour guiado · Pintura con copa · Cerámica · Fotografía · Baile · Idiomas · Tecnología / Código

**Atributos específicos:**
Sin experiencia previa · Nivel intermedio · Nivel avanzado · Materiales incluidos · Te llevas algo hecho · Cupos limitados · Cancelación flexible · Ideal como regalo · Con certificado · Grupo pequeño (máx 10) · Grupo grande · Reserva exclusiva disponible · Instancia social incluida · Presencial · Online · Apto niños desde X años

**Vibe disponible:**
Relajado · Íntimo · Creativo · Especial / Único · Ideal regalo

---

### 🛒 Ferias y mercados
*Tipo: evento recurrente*

**Subcategorías:**
Feria artesanal · Feria gastronómica · Mercado de diseño · Feria de antigüedades · Farmers market · Pop-up · Feria de libro · Mercado navideño

**Atributos específicos:**
Al aire libre · Cubierta · Entrada gratuita · Con entrada · Acepta tarjeta · Solo efectivo · Con comida en el lugar · Música en vivo · Acepta mascotas · Apto coche guagua · Estacionamiento cercano · Recurrente semanal · Recurrente mensual · Evento único · Confirma cada semana

**Vibe disponible:**
Relajado · Fotogénico · Familiar · De barrio · Trendy · Animado

---

### 🛍 Locales y tiendas *(categoría nueva, no existe en competidores)*
*Tipo: lugar permanente*

**Subcategorías:**
Librería · Disquería / Vinilería · Tienda de diseño · Vintage / Segunda mano · Vinoteca / Botillería premium · Chocolatería · Florería · Tienda de plantas · Juguetería · Tienda de mascotas

**Atributos específicos:**
Solo para llevar · Con zona de estar · Acepta tarjeta · Solo efectivo · Productos nacionales · Productos importados · Artesanal / Local · Acepta mascotas · Ideal como regalo · Envío disponible

**Vibe disponible:**
Tranquilo · Fotogénico · De barrio · Trendy · Especial / Único · Casual

---

## Tags universales (aplican a todas las categorías)

### 🔵 Contexto social *(máx 4)*
En pareja · Con familia · Con niños pequeños · Pet friendly · Con amigos · Ideal ir solo/a · Apto adultos mayores · Acceso universal · Para cumpleaños · Evento corporativo · Ideal como regalo

### 💰 Rango de precio *(1 sola opción, campo separado)*
Gratis · $ (menos de $5.000) · $$ ($5.000–$15.000) · $$$ ($15.000–$30.000) · $$$$ (más de $30.000)

### 📍 Logística de acceso *(multiselección)*
Cerca del metro · Accesible en micro · Requiere auto · Estacionamiento propio · Estacionamiento cercano · Bicicletero

### 🟣 Vibe / Ambiente *(máx 3, solo admin en fichas gratis)*
Tranquilo · Animado · Íntimo / Romántico · Fotogénico · Fiestero · Relajado · Cultureta · Casual · Especial / Único · De barrio · Trendy · Familiar · Creativo · Aventurero

---

## Reglas de validación y exclusiones mutuas

| Regla | Descripción |
|---|---|
| Con reserva ↔ Sin reserva | No pueden coexistir en atributos específicos |
| Recurrente semanal ↔ Evento único | No pueden coexistir |
| +18 ↔ Todas las edades | No pueden coexistir |
| Al aire libre | Desencadena campo extra: ¿qué pasa si llueve? → Se suspende / Se traslada / Continúa |
| tags_vibe | Máximo 3. El campo rechaza el 4to |
| tags_context | Máximo 4 |
| tags_specific | Sin límite duro. UI recomienda no pasar de 8 |

---

## Sistema de sugerencia automática de categorías

El sistema detecta palabras clave en el nombre del local y sugiere categoría + pre-selecciona atributos probables.

- Tags pre-seleccionados aparecen destacados (verdes) — el negocio confirma, edita o elimina
- Todo es editable — las sugerencias son solo punto de partida
- Botón "¿Falta alguna etiqueta?" al final — el negocio sugiere, el admin revisa

### Flujo para categoría faltante
1. Botón "Mi local no encaja aquí" siempre visible al final de la lista
2. Pregunta abierta: "¿Cómo describirías tu local en una frase?"
3. Clasificación temporal con la categoría más cercana, marcada como "pendiente revisión"
4. Admin revisa y decide: crear nueva categoría, reclasificar o fusionar con existente
5. Si 3+ locales piden lo mismo → crear la categoría nueva
6. Notificar al negocio: "Creamos la categoría Heladería — tu ficha ya está bien clasificada"

---

## Estructura de base de datos (PostgreSQL)

```sql
-- Tabla principal de lugares/eventos
CREATE TABLE places (
  id                    uuid PRIMARY KEY,
  name                  text NOT NULL,
  place_type            text NOT NULL,        -- 'permanent' | 'event' | 'recurring'
  category_main         text NOT NULL,        -- 'gastronomia'
  subcategory_main      text NOT NULL,        -- 'heladeria'
  category_secondary    text,                 -- nullable
  subcategory_secondary text,                 -- nullable
  price_range           int,                  -- 0=gratis, 1=$, 2=$$, 3=$$$, 4=$$$$
  tags_context          text[],               -- ["en_pareja","pet_friendly"]
  tags_specific         text[],               -- ["terraza","sin_reserva","vegano"]
  tags_access           text[],               -- ["cerca_metro","bicicletero"]
  tags_vibe             text[],               -- máx 3 elementos
  commune               text,
  is_premium            boolean DEFAULT false,
  created_at            timestamptz DEFAULT now(),
  event_date            date,                 -- null si es lugar permanente
  event_end_date        date                  -- null si es lugar permanente
);

-- Índice para filtrado por tags (clave para el buscador)
CREATE INDEX idx_tags_context  ON places USING GIN (tags_context);
CREATE INDEX idx_tags_specific ON places USING GIN (tags_specific);
CREATE INDEX idx_tags_vibe     ON places USING GIN (tags_vibe);
```

### Ejemplo de query de búsqueda combinada
```sql
-- "Algo pet friendly con terraza en Ñuñoa, precio $$"
SELECT * FROM places
WHERE tags_context @> ARRAY['pet_friendly']
  AND tags_specific @> ARRAY['terraza']
  AND commune = 'Ñuñoa'
  AND price_range = 2
  AND (place_type = 'permanent' OR event_date >= CURRENT_DATE)
ORDER BY is_premium DESC, created_at DESC;
```

---

## Tags en el UI — cómo mostrarlos sin generar ruido

> **El problema:** si muestras todos los tags a la vez, hay demasiado ruido visual.  
> **La solución:** mostrar solo 3–5 tags en la tarjeta del listado. El resto, solo en la ficha completa.

### En la tarjeta del listado (máx 5 tags visibles)
Prioridad de display: Subcategoría → Precio → 1-2 contexto social más relevantes → 1 vibe

### En la ficha completa
Todos los tags organizados por sección con labels claros.

### Para recomendación con IA
Los tags son el input estructurado para el sistema de recomendación. El usuario describe en lenguaje natural ("algo tranquilo, pet friendly, menos de $10K, este sábado en Ñuñoa") y la IA traduce a queries sobre los arrays. Sin esta estructura, la recomendación inteligente no es posible.

---

## Pendientes de definir

- [ ] ¿Límite de tags_specific en el UI (se sugiere recomendar máx 8, no forzar)?
- [ ] ¿La categoría secundaria aparece visible en la ficha pública o solo afecta búsquedas internamente?
- [ ] ¿Puede un negocio sugerir nueva categoría desde el día 1 o solo después de X tiempo?
- [ ] ¿Cómo se manejan los eventos expirados? ¿Se archivan o se borran?
- [ ] ¿place_type 'recurring' tiene una lógica de "confirmar" semanal/mensual (especialmente para ferias)?
- [ ] ¿Los vibes los puede votar la comunidad o solo los define el admin/negocio?
- [ ] ¿Qué tan pronto se implementa la sugerencia automática de categorías? ¿Desde el MVP o es v2?
