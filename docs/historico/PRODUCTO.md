# PRODUCTO — Portal Panorama

Documento de definición del producto. Antes de seguir tocando código, hay que
responder las preguntas de acá. No hay respuestas "buenas" o "malas" — hay
respuestas tuyas. Lo importante es tomarlas, no que sean perfectas.

**Cómo usar este documento:**
1. Lee todo de corrido una vez (sin responder).
2. Responde en orden, de arriba a abajo. No saltes bloques.
3. Si no sabes una respuesta, escribe "no sé" — no inventes.
4. Cuando termines, lo conversamos y refinamos.

---

## Parte 1 — Las dudas que tenías (resumen)

Esto es lo que me dijiste, ordenado para que lo veas claro:

1. Intentaste abarcar muchas cosas sin definir qué querías primero.
2. El orden en que fuiste creando las cosas estuvo mal.
3. No definiste bien las entidades del producto: ¿qué es un "panorama"? ¿qué es un "evento"? ¿son lo mismo? ¿son distintos?
4. Hay sub-divisiones de panoramas/negocios que nunca definiste.
5. Hay campos en la ficha que aplican a algunos lugares y a otros no — y no decidiste qué hacer con eso.
6. Sientes que la BD está mal armada desde lo conceptual.
7. Quisiste hacer panoramas Y eventos al mismo tiempo, sin decidir cuál era primero.
8. No definiste cuál era el producto final.
9. El MVP lo definiste mal (o no lo definiste).
10. No validaste el concepto antes de construir.
11. No tienes una estrategia de crecimiento.
12. No sabes a qué darle énfasis primero.
13. La base (modelo conceptual) no quedó sólida, y por eso te topas con obstáculos.
14. No sabes si lugares y eventos son **un producto** o **dos productos separados**.
15. No sabes si esto debería ser web o app móvil.
16. Tienes idea de meter IA pero no sabes si va en MVP o después.

Si alguna de estas no te representa, márcala. Si te falta una, agrégala.

---

## Parte 2 — Preguntas a responder

### Bloque 1 — Visión

**1.1** ¿Qué es Portal Panorama en 1 o 2 frases? (sin tecnicismos, como si se lo explicaras a tu abuela)

**1.2** ¿Para quién es? (ej: santiaguinos de 25-40, turistas, familias con niños…)

**1.3** ¿Qué problema resuelve que **Google Maps, Instagram o Welcu no resuelven**?

**1.4** Si alguien pregunta "¿por qué usar esto en vez de Google?", ¿qué le respondes?

---

### Bloque 2 — Entidades (lo más importante)

**2.1** ¿Lugares (panoramas) y eventos son **el mismo producto** o **dos productos separados**?

**2.2** Si son **el mismo producto**: ¿comparten la misma ficha o cada uno tiene su ficha distinta?

**2.3** Si son **productos separados**: ¿conviven en el mismo sitio (como secciones) o son cosas distintas (sitios o apps separadas)?

**2.4** ¿Cuáles son los **sub-tipos** de "lugar" que quieres tener? (ej: restorán, bar, café, museo, parque, mirador, tienda, centro cultural…). Lista los que se te ocurran.

**2.5** ¿Cada sub-tipo necesita **campos distintos**? Ejemplo:
- Restorán: tipo de cocina, rango precio $-$$$$, terraza sí/no, reserva sí/no
- Museo: precio entrada, edad mínima recomendada, días gratis
- Parque: si tiene juegos infantiles, si admite mascotas, si tiene baños

Marca cuáles sub-tipos te importan y qué campos extra crees que necesitan.

**2.6** ¿Qué campos tiene **TODA ficha** sí o sí? (nombre, dirección, foto, descripción, horario, etc.)

**2.7** Si en 6 meses quieres agregar un sub-tipo nuevo (ej: "hoteles boutique"), ¿el sistema debería permitirlo fácil o no es prioridad?

---

### Bloque 3 — Eventos

**3.1** ¿Eventos van en el **MVP** o son para **una fase posterior**?

**3.2** ¿Qué es un evento para ti?
- Fecha única (concierto este sábado)
- Recurrente (clase de yoga todos los martes)
- Multi-día (festival 3 días)
- ¿Todas las anteriores?

**3.3** ¿Un evento tiene lugar fijo o puede ser pop-up?

**3.4** ¿Vendes entradas o solo informas que existe?

**3.5** ¿Quién publica eventos? ¿Cualquier persona, o solo dueños de negocios verificados, o solo organizadores certificados?

---

### Bloque 4 — Usuario final (el que VISITA el sitio)

**4.1** ¿Quién es? Describe a 1 persona específica (no "santiaguino", sino "Camila, 32 años, vive en Ñuñoa, sale 2 veces por semana…")

**4.2** ¿Qué viene a hacer al sitio?
- Buscar dónde ir hoy/este finde
- Planear con anticipación
- Descubrir lugares nuevos
- Otra cosa

**4.3** ¿Necesita registrarse para que la app le sea útil, o puede usarla 100% de invitado?

**4.4** ¿Qué lo hace **volver**? (esto es CLAVE — sin esto, mueres en 2 meses)

---

### Bloque 5 — Dueño de negocio (el que PAGA)

**5.1** ¿Quién publica una ficha de negocio?
- El dueño directo
- Una agencia o community manager
- Un empleado del local
- Tú a mano (al menos al inicio)

**5.2** ¿Cómo se entera ese dueño de que Portal Panorama existe?

**5.3** **Plan GRATIS** del dueño:
- ¿Qué ofrece? (ficha visible, X fotos, reviews, etc.)
- ¿Qué NO ofrece? (sin posicionamiento, sin video, sin estadísticas, etc.)

**5.4** **Plan PREMIUM** del dueño:
- ¿Qué agrega? (lista lo que se te ocurra: más fotos, video, posicionamiento, badge, estadísticas, eventos ilimitados, etc.)
- ¿Cuánto cuesta? (mensual o anual)
- ¿Vale la pena para el dueño? ¿Le retorna la inversión?

**5.5** ¿Cómo le vas a vender?
- Autoservicio (entra al sitio y se suscribe solo)
- Llamada / WhatsApp / demo
- Mix

---

### Bloque 6 — Modelo de negocio

**6.1** ¿De dónde viene la plata?
- Suscripciones de dueños
- Comisión por reservas/entradas
- Publicidad (banners, posicionamiento pagado)
- Mix

**6.2** ¿Cuánto necesitas vender al mes para que esto **te valga la pena**? (en pesos, sin vergüenza, real)

**6.3** ¿Esto es proyecto de fin de semana, side-project serio, o estás full dedicado?

**6.4** ¿Tienes runway (plata o ingresos por otro lado) para sostener esto **6-12 meses sin ingresos**?

---

### Bloque 7 — MVP (qué SÍ y qué NO)

**7.1** Si solo pudieras lanzar **UNA cosa**, ¿cuál sería? (ej: directorio de panoramas, agenda de eventos, marketplace de reservas)

**7.2** Lista los features que son **IMPRESCINDIBLES** para lanzar (corto):

**7.3** Lista los features que son **"buenos pero no ahora"** (van en Fase 2):

**7.4** Lista los features que pensaste pero que en realidad **no van en este producto**:

---

### Bloque 8 — Validación

**8.1** ¿Qué métrica te dice "esto está funcionando"?
- X visitas únicas al mes
- X usuarios registrados
- X dueños suscritos pagando
- X reviews dejadas
- Otra

**8.2** ¿Cuánto tiempo le das al MVP para validar? (3 meses, 6 meses, 1 año)

**8.3** Si en ese plazo **no valida**, ¿qué haces?
- Pivote
- Lo dejo morir
- Le doy 6 meses más
- No sé

---

### Bloque 9 — Plataforma

**9.1** ¿Web, app móvil, o ambas?

**9.2** Si web: ¿la prioridad es celular o computador? (responde con franqueza — ¿qué crees que va a usar más tu usuario?)

**9.3** Si quieres app móvil eventualmente, ¿en qué momento la agregas? (después de validar la web, en paralelo, antes…)

---

### Bloque 10 — Crecimiento

**10.1** ¿Cómo llega el **primer usuario** al sitio?
- SEO (Google te encuentra)
- Instagram
- TikTok
- Boca a boca
- Anuncios pagados
- Otra

**10.2** ¿Cuánto contenido necesitas para que el sitio "se vea con vida"?
- 10 lugares
- 100 lugares
- 1000+ lugares

**10.3** ¿De dónde sale ese contenido inicial?
- Lo subes tú a mano
- Scraping/import de Google Maps
- Los dueños lo suben
- Mix

---

### Bloque 11 — IA

**11.1** ¿La IA es feature **central** o feature **secundaria**?

**11.2** ¿Qué problema resuelve la IA aquí que **no se puede resolver sin IA**? (si la respuesta es "ninguno", entonces no es prioridad)

**11.3** ¿Va en el MVP o es Fase 2+?

---

## Parte 3 — Después de responder

Cuando termines de responder (aunque sea con muchos "no sé"), avísame.
Lo conversamos juntos, refinamos, y de ahí sale:

- Una **visión de 1 párrafo** del producto
- Un **modelo de entidades** definitivo (lugares, eventos, sub-tipos)
- Un **scope de MVP** chico y claro
- Un **plan en 3 fases máximo**

Y recién ahí decidimos qué del código actual se queda, qué se modifica, y qué se borra.
