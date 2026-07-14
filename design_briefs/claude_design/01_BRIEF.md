# Brief de diseño — Portal Panorama

Documento para **Claude Design**. Explica qué es el producto, para quién es, qué está mal hoy y
qué se espera del rediseño.

---

## 1. Qué es Portal Panorama

Un **directorio de panoramas de Santiago de Chile**: dónde comer, dónde salir, qué hacer. Hoy tiene
**~385 lugares reales cargados a mano y curados** (restaurantes, cafés, bares, museos, parques,
tiendas, miradores, karaokes, escape rooms).

No es una app de reservas ni una red social. Es la herramienta para **descubrir, decidir y guardar**.

Está **en producción** (Next.js 15 + React, mobile-first) y funcionando; esto no es un producto por
nacer, es un producto que necesita verse como lo que ya es.

---

## 2. El usuario ideal: "el organizador"

Todo el diseño tiene que hablarle a **una sola persona**:

> Joven de mediados de los 20. Vive solo, tiene pareja y un grupo de amigos. **Es el que arma los
> planes del grupo** — el que propone dónde ir. Sale un par de veces al mes, con plata justa. Está
> aburrido de lo viral y de lo que sale en todos lados. Quiere **acertar y quedar bien** sin tener
> que investigar él mismo.

- **Dolor central: buscar cansa.** Hoy tiene que saltar entre Google Maps, Instagram y mil pestañas
  para armar un panorama, y aun así no sabe si el lugar es lo que busca.
- **Motivación:** buena relación precio/calidad + **quedar bien socialmente** con su elección.
- **Contexto de uso: el celular, con poco tiempo, muchas veces decidiendo en el momento** ("¿dónde
  vamos?" en el grupo de WhatsApp). Por eso **mobile-first no es un detalle: es el caso principal**.

**Consecuencia de diseño:** cada pantalla tiene que dejar decidir rápido. Si el usuario tiene que
leer mucho para saber si un lugar le sirve, el diseño falló.

---

## 3. El diferenciador (lo que el diseño debe hacer brillar)

**Filtrabilidad por contexto social.** Nadie más lo hace bien. El usuario no busca "restaurante":
busca **"algo para ir con la polola, barato, en Ñuñoa, tranquilo, que acepte perros"**.

Eso se sostiene en la **ficha estructurada**: cada lugar tiene categoría, subcategoría, comuna,
barrio, estación de metro, rango de precio, horario, y **tags en 6 capas**:

| Capa | Qué responde | Ejemplos |
|---|---|---|
| **AUDIENCE** | ¿Con quién voy? | en pareja · con amigos · con niños · solo |
| **OCCASION** | ¿Para qué ocasión? | primera cita · after office · cumpleaños · panorama de domingo |
| **VIBE** | ¿Qué ambiente? | tranquilo · ruidoso · romántico · para conversar |
| **EXPERIENCE** | ¿Qué ofrece de destacable? | terraza · vista · rooftop · música en vivo |
| **SERVICE** | Servicios y acceso | pet friendly · wifi · estacionamiento · accesible |
| **SPECIFIC** | Atributos por categoría | tipo de cocina (ramen, peruana…) |

**Esos tags y filtros son el corazón del producto.** Hoy visualmente son chips grises indiferenciados
que se pierden. **Deberían ser una de las cosas más vivas y legibles de la interfaz**, y debería
notarse a simple vista que un tag de "con quién voy" no es lo mismo que uno de "qué ofrece".

Cada lugar además tiene **estrellas y número de reseñas de Google** y un **score propio** (ranking
bayesiano; nadie paga por subir).

---

## 4. Tono y personalidad

- **Español de Chile, tuteo** ("Descubre", "Guarda", "Elige"). Cercano, directo, sin solemnidad.
  **Nunca voseo argentino** ("Descubrí", "Guardá").
- **Editorial y curado**, no algorítmico ni frío. La promesa es "esto lo revisó alguien", no "esto
  te lo tiró un algoritmo".
- **Cálido y chileno**, sin caer en el cliché folclórico (nada de artesanía, cobre ni cordillera
  literal).
- Confiable y honesto: se explica cómo se ordena, se puede reportar un dato malo.

---

## 5. El problema de diseño a resolver (esto es lo que se pide)

El dueño del producto (que además lo programa) lo dice así:

> **"La jerarquía de color me cansa la vista. Quiero más uso de color y de tipografías. Y el problema
> de fondo es que NO hay un sistema de diseño: son tokens acumulados en un archivo CSS."**

Diagnóstico honesto de lo que hay hoy (ver `03_SISTEMA_ACTUAL.md` para el detalle):

1. **Todo pesa lo mismo.** El fondo es papel crema, las tarjetas son papel crema, los chips son papel
   crema. Con tan poco contraste entre capas, **nada guía la mirada**: la vista tiene que trabajar
   para encontrar dónde está la información importante.
2. **Un solo acento (naranjo atardecer) para todo.** Se usa igual para un CTA, un link, un chip
   activo y un badge. Cuando todo es acento, nada es acento.
3. **Los 6 tipos de tag se ven idénticos.** Se pierde la estructura que ES el producto.
4. **La tipografía está subutilizada.** Hay una serif de display preciosa (Fraunces) que casi solo
   aparece en los títulos grandes; la interfaz es toda sans a un tamaño parecido.
5. **No hay sistema, hay acumulación.** 630 clases CSS en un solo archivo de 3.049 líneas, escritas
   pantalla por pantalla. No existe una librería de componentes: los botones, tarjetas y formularios
   se reinventaron varias veces con nombres distintos.

### Lo que se espera de vuelta

Un **sistema de diseño de verdad**, no pantallas sueltas bonitas:

1. **Paleta con jerarquía real** — capas de superficie que se distingan (fondo / tarjeta / elevado),
   un color de acción claramente separado de todo lo demás, y color con propósito (más color, pero
   **cada uno con un trabajo asignado**). Sin fatiga visual en sesiones largas de scroll.
2. **Escala tipográfica que trabaje** — que la serif de display aporte carácter editorial más allá
   del título; pesos y tamaños que creen jerarquía real dentro de una tarjeta y de una ficha.
3. **Sistema de color para las 6 capas de tags** — que se lean como familias distintas sin volverse
   un arcoíris.
4. **Los componentes núcleo, especificados:** botón (primario/secundario/fantasma, 3 tamaños) ·
   **tarjeta de lugar** (el componente más importante del producto, se repite decenas de veces por
   pantalla) · chip/tag · filtro · campo de formulario · barra de búsqueda · header · modal ·
   toast · badge de estado · tabla de admin.
5. **Estados**: hover, foco (accesible), activo, cargando, vacío, error.
6. **Modo claro** (el modo oscuro NO es prioridad hoy).

### Restricciones

- **Mobile-first de verdad.** Diseña primero el 390px y después el desktop. El caso de uso real es
  el celular decidiendo un panorama.
- **Accesibilidad:** contraste AA como piso.
- **El layout y los flujos actuales se respetan** — no hay que reinventar la navegación ni inventar
  pantallas nuevas. Lo que cambia es el **sistema visual** que las viste.
- **Tiene que ser implementable como tokens CSS + componentes** (ver `03_SISTEMA_ACTUAL.md`): el
  objetivo es que el cambio se aplique cambiando variables y componentes, no reescribiendo el sitio.
- No hay presupuesto para fotografía nueva: **las imágenes son las que ya están** (fotos reales de
  los lugares, de calidad dispareja). El sistema tiene que verse bien con fotos imperfectas.

---

## 6. Qué NO cambiar

- **La estructura de la información** (categorías, tags, filtros, ficha): es el producto.
- **El copy en español de Chile**, tuteo.
- **La promesa de honestidad**: nadie paga por aparecer más arriba.
- El **stack**: Next.js + React + CSS con variables (no hay librería de UI y no se quiere agregar una
  pesada).
