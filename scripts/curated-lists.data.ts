import type { CuratedRule } from '@domain/curatedList/CuratedRule'

// ─────────────────────────────────────────────────────────────────────────────
// FUENTE DE VERDAD de las listas curadas (guías).
//
// Esto es lo que se edita para CREAR una guía nueva. El seed
// (`scripts/seed-curated-lists.ts`) la crea en la BD destino: resuelve los
// lugares por SLUG (los IDs difieren entre local y prod) y la inserta por el
// slug de la lista. Corre en cada deploy → la guía nueva aparece sola en prod.
//
// MODO "admin manda tras crear" (first-write-wins): el código CREA la lista la
// primera vez. Una vez creada, el dueño es el admin → editarla en /admin/listas
// queda y no se revierte. OJO: cambiar acá una guía YA creada NO se propaga
// (la lista ya existe → el seed la salta). Para editar una existente, hazlo en
// el admin (o bórrala ahí y el próximo deploy la recrea desde este archivo).
// Las listas creadas SOLO en el admin (no acá) tampoco las toca el seed.
//
// `rule` define qué lugares entran solos (subset de los filtros del explorar).
// Hoy NO admite OCCASION/EXPERIENCE → las listas de ocasión esperan a la Fase 2.
// `pins` = destacados, en orden; cada uno con su recomendación editorial (blurb).
// ─────────────────────────────────────────────────────────────────────────────

export interface SeedCuratedList {
  slug: string
  name: string
  kind: 'GUIDE' | 'OCCASION'
  description?: string
  intro?: string
  coverImageUrl?: string
  rule: CuratedRule
  sort?: string
  isPublished: boolean
  /** Destacados, en el orden en que aparecen (el índice define el sortOrder). */
  pins: { placeSlug: string; blurb?: string }[]
}

export const CURATED_LISTS: SeedCuratedList[] = [
  {
    slug: 'los-mejores-museos-de-santiago',
    name: 'Los mejores museos de Santiago',
    kind: 'GUIDE',
    description:
      'Los museos imperdibles de Santiago: arte, historia y memoria, con rating real de Google.',
    intro:
      'Santiago tiene una de las ofertas de museos más ricas de Chile. Esta es nuestra selección de los imperdibles —desde el arte precolombino hasta la memoria reciente del país— ordenados por reputación. Entrada liberada en varios de ellos.',
    rule: { subcategorySlug: 'museo' },
    sort: 'score_desc',
    isPublished: true,
    pins: [
      {
        placeSlug: 'museo-de-la-memoria-y-los-derechos-humanos',
        blurb:
          'Si quieres entender el **Chile de hoy**, este es el punto de partida. Inaugurado en **2010**, documenta las violaciones a los derechos humanos durante la **dictadura (1973–1990)** con testimonios, fotografías y objetos que hacen el recorrido tan físico como emotivo: **sales movido**.\n\nLa entrada es **gratis** y no necesitas inscribirte. Queda en **Matucana 501**, prácticamente sobre el **metro Quinta Normal (Línea 5)**, así que llegar es facilísimo. Abre de **martes a domingo, 10 a 18 h** —último ingreso 17:30— y los **lunes cierra**.\n\nUn consejo: **dale al menos dos horas** y anda con tiempo, porque no es un museo para pasar rápido.',
      },
      {
        placeSlug: 'museo-chileno-de-arte-precolombino',
        blurb:
          '**Uno de los mejores museos de América Latina**, y lo tienes a pasos de la **Plaza de Armas**. Está montado en el **Palacio de la Real Aduana (1807)**, un edificio que ya impone por sí solo, y guarda **más de 5.000 piezas precolombinas**: desde las **momias chinchorro** —las más antiguas del mundo— hasta textiles andinos de tres mil años.\n\nLa entrada sale **$3.000** para chilenos y es **gratis el primer domingo de cada mes**. Abre de **martes a domingo, 10 a 18 h**; los **lunes y feriados irrenunciables** cierra. Para llegar, bájate en **metro Plaza de Armas (Líneas 3 y 5)**.\n\nCalcula entre **hora y media y dos horas** para recorrerlo con calma.',
      },
      {
        placeSlug: 'museo-nacional-de-bellas-artes',
        blurb:
          'El **museo de arte más grande y antiguo de Chile**, en pleno **Parque Forestal**. Su edificio **neoclásico de 1910**, con esa cúpula de vidrio inspirada en el **Petit Palais** de París, ya justifica la visita aunque sea solo para mirarlo por fuera.\n\nAdentro recorres **pintura y escultura chilena**, más **muestras temporales que cambian seguido**: vale la pena revisar su Instagram antes de ir. Y ojo, comparte edificio con el **Museo de Arte Contemporáneo (MAC)**, así que son **dos museos en una sola parada**.\n\nLa entrada es **gratuita**. Abre de **martes a domingo, 10 a 18:30** (último ingreso 18:20) y cierra los **lunes**. Llega en **metro Bellas Artes (Línea 5)**, a una cuadra.',
      },
    ],
  },
  {
    slug: 'las-mejores-cafeterias-de-santiago',
    name: 'Las mejores cafeterías de especialidad de Santiago',
    kind: 'GUIDE',
    description:
      'Las cafeterías de especialidad mejor evaluadas de Santiago: dónde tomarse el mejor café, con rating real de Google.',
    intro:
      'El café de especialidad explotó en Santiago y hoy hay un rincón para cada gusto: tostadurías propias, cafés de barrio para trabajar tranquilo y hasta experiencias temáticas. Esta es nuestra selección de los mejores, ordenados por reputación.',
    rule: { subcategorySlug: 'cafe-cafeteria' },
    sort: 'score_desc',
    isPublished: true,
    pins: [
      {
        placeSlug: 'teluz-coffee',
        blurb:
          'El **mejor evaluado** de esta lista, y con razón: un café de especialidad **chico e íntimo** en Antonio Varas, con un concepto claro —origen cuidado y método V60— que enamora a quienes saben de café.\n\nEs el típico lugar para **trabajar tranquilo** o tomarse un cortado en paz, con terraza para los días buenos. Queda prácticamente sobre el **metro Manuel Montt (Línea 1)**. Abre de **lunes a viernes de 7:30 a 18:30** y el sábado hasta las 14:00; **domingo cierra**.\n\nOjo: cierra temprano, así que es plan de mañana o media tarde, no de after.',
      },
      {
        placeSlug: 'casa-salvo-cafe',
        blurb:
          'Pocas cafeterías pueden decir que **cultivan, tuestan y sirven su propio café** sin intermediarios. Casa Salvo, en pleno **Barrio Italia**, sí —y se nota en la taza. Pero además tiene brunch contundente y sándwiches con personalidad (prueba el Pollo-Mex).\n\nLo mejor es su **horario amplio**: abre a las **8 de la mañana y cierra a las 22 h** entre semana, así que sirve para desayuno, almuerzo y after office con café. Es **pet friendly** y queda a pasos del **metro Baquedano (Líneas 1 y 5)**.\n\nUn local chico y cálido, con clientela fija de barrio y mucho trabajo remoto.',
      },
      {
        placeSlug: 'entre-sabores-cafe',
        blurb:
          'La cafetería que **puso de moda el café en taza de galleta comestible** —lo que suena a truco de Instagram resulta ser una combinación real que dejó huella en **Vitacura**. Más de **3.000 reseñas en Google** con 4.9 hablan de un lugar que funciona parejo.\n\nLa propuesta de brunch es completa: pancakes, huevos, tostadas, croissants y tortas, con el café en galleta como sello. Queda en **Av. Manquehue Norte 1788**, en el corazón de Vitacura.\n\nIdeal para un desayuno largo de fin de semana o para llevar a alguien de visita que quiera la foto.',
      },
      {
        placeSlug: 'pace-coffee-roasters-chile',
        blurb:
          'Si lo tuyo es **llevarte un buen café a la casa**, esta tostaduría de **Barrio Italia** es la parada. Organizan sus granos en líneas temáticas —Enjoy, Focus, Boost, Level Up— pensadas para distintos momentos del día, y el equipo te guía en la elección.\n\nEs un local para **conocer la propuesta de primera mano** y probar antes de comprar. Está en Girardi 1236, cerca del **metro Baquedano (Líneas 1 y 5)**. Horario acotado: **de miércoles a domingo, 10:30 a 19:00** —lunes y martes cierra—, así que conviene planificarlo.\n\nMás tostaduría que café de quedarse, pero vale la visita por la calidad del grano.',
      },
      {
        placeSlug: 'yeongi-coffee',
        blurb:
          'La cafetería más **distinta** de la lista: un café **temático de K-pop** en Av. Providencia, con bebidas que llevan nombres de grupos, baños con escenografía idol, lightsticks en la barra y máquina de photocards aleatorias.\n\nNo es un café de paso —**la experiencia es el motivo**—, pensado para la comunidad K-pop chilena que viene a sacarse fotos y compartir. Queda a pasos del **metro Pedro de Valdivia (Línea 1)** y abre **todos los días de 11:30 a 19:30**.\n\nAunque no seas fan, el café de especialidad es de verdad; y si lo eres, es parada obligada.',
      },
    ],
  },
  {
    slug: 'las-mejores-librerias-de-santiago',
    name: 'Las mejores librerías independientes de Santiago',
    kind: 'GUIDE',
    description:
      'Las librerías independientes mejor evaluadas de Santiago: de barrio, de viejo y de autor, con rating real de Google.',
    intro:
      'Más allá de las grandes cadenas, Santiago guarda un circuito de librerías independientes con alma: de barrio, de libros usados, de editoriales que no llegan a las vitrinas grandes. Esta es nuestra selección, ordenada por reputación.',
    rule: { subcategorySlug: 'libreria' },
    sort: 'score_desc',
    isPublished: true,
    pins: [
      {
        placeSlug: 'libreria-lolita',
        blurb:
          'La **librería de barrio** mejor evaluada de Santiago, abierta en 2014 por el escritor Francisco Mouat. Más de **37.000 volúmenes** entre narrativa, poesía, infantil, cine y los títulos de su propia editorial, **Lolita Editores**.\n\nEl trato es lo que la hace única: acá te invitan a **hojear, conversar y recomendar**. El barrio la quiere tanto que durante la pandemia los vecinos crearon un «Bono Lolita» para salvarla. Queda en República de Cuba 1724, cerca del **metro Manuel Montt (Línea 1)**, y **abre todos los días** de 10 a 14 y de 15 a 20 h.\n\nHacen talleres de lectura y encuentros con autores —vale la pena seguir su agenda.',
      },
      {
        placeSlug: 'la-tienda-nacional',
        blurb:
          'Más que una librería, **la tienda de la cultura chilena independiente**. Desde 2011 en **Barrio Lastarria**, junta bajo un mismo techo libros de autores nacionales, vinilos y CDs de música chilena, cine documental y diseño con identidad local.\n\nEs el lugar para **regalar (o regalarse) algo con sello chileno de verdad**, lejos del souvenir genérico —Lonely Planet la destacó como una de las tiendas emblemáticas de Santiago. Está en Merced 369, a pasos del **metro Bellas Artes (Línea 5)**, y abre de **lunes a viernes de 11 a 19 h** y sábado hasta las 20.\n\nTiene una segunda sede en el Museo de la Memoria, por si andas por ese lado.',
      },
      {
        placeSlug: 'takk',
        blurb:
          'Para el lector que ya leyó todo lo que llega a las cadenas: cerca del **90% de sus más de 20.000 títulos son ejemplares únicos**, traídos de editoriales pequeñas e independientes que no llegarían solas a Chile.\n\nEstá en la mítica **Galería Drugstore** de Providencia, cerca del **metro Pedro de Valdivia (Línea 1)**, y el segundo piso está dedicado a infantil y juvenil. El equipo, de libreros de oficio, **te recomienda y conversa** —nada de algoritmos. Abre de **lunes a sábado de 10 a 19 h**; domingo cierra.\n\nSi buscas algo que nadie más tiene, parte por acá.',
      },
      {
        placeSlug: 'el-cid-campeador',
        blurb:
          'El paraíso del **libro usado y de anticuario**: más de **30 años** en Barrio Lastarria y unos 35.000 volúmenes apilados en estantes, cajas y mesas. Su dueño selecciona cada título a mano por mérito literario —nada de bestsellers.\n\nEl encanto está en la búsqueda: **primeras ediciones, ejemplares firmados por Neruda o Mistral**, tomos que no encontrarás en ningún otro lado. También restauran libros dañados. Queda en Merced 345, a pasos del **metro Bellas Artes (Línea 5)**, abierto de **lunes a viernes de 12:30 a 19** y sábado hasta las 17.\n\nUn dato clave: **no aceptan tarjeta, lleva efectivo.**',
      },
    ],
  },
]
