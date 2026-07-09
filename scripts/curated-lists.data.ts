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
  /** Destacados (artículo completo), en orden. Van primero. */
  pins: { placeSlug: string; blurb?: string }[]
  /** Menciones honoríficas (banda compacta + nota de una línea), en orden. Van después. */
  mentions?: { placeSlug: string; note?: string }[]
}

export const CURATED_LISTS: SeedCuratedList[] = [
  {
    slug: 'los-mejores-museos-de-santiago',
    name: 'Los mejores museos de Santiago',
    kind: 'GUIDE',
    description:
      'Los museos imperdibles de Santiago: arte, historia y memoria, con rating real de Google.',
    intro:
      'Estos son los mejores museos de Santiago. La capital tiene una de las ofertas más ricas de Chile, y esta es nuestra selección de los imperdibles —desde el arte precolombino hasta la memoria reciente del país— ordenados por reputación. Entrada liberada en varios de ellos.',
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
      'Estas son las mejores cafeterías de especialidad de Santiago. El café de especialidad explotó en la capital y hoy hay un rincón para cada gusto: tostadurías propias, cafés de barrio para trabajar tranquilo y hasta experiencias temáticas. Nuestra selección, ordenada por reputación.',
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
      'Estas son las mejores librerías independientes de Santiago. Más allá de las grandes cadenas, la ciudad guarda un circuito de librerías con alma: de barrio, de libros usados, de editoriales que no llegan a las vitrinas grandes. Nuestra selección, ordenada por reputación.',
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
  {
    slug: 'para-una-primera-cita',
    name: 'Para una primera cita',
    kind: 'OCCASION',
    description:
      'Los mejores panoramas para una primera cita en Santiago: de lo gratis y barato a la apuesta más cara, pensados para conversar y conocer a la otra persona.',
    intro:
      'Una primera cita no se trata del lugar más caro, sino del que deja conversar. Acá van nuestros panoramas para una primera cita en Santiago, ordenados de lo más accesible —museos gratis, un helado, un café sin presión— hasta la apuesta para lucirse, con rating real de Google. Elige según el plan que quieras: bajo riesgo, paseo al aire libre, cena íntima o tragos.',
    rule: { occasionTagSlugs: ['cita'] },
    sort: 'score_desc',
    isPublished: true,
    pins: [
      {
        placeSlug: 'museo-nacional-de-bellas-artes',
        blurb:
          'La mejor primera cita **no cuesta un peso**. Recorres la pintura y escultura chilena del museo más antiguo del país, metido en un palacio neoclásico de 1910 con cúpula de vidrio que **ya es tema de conversación apenas entras**. Las muestras temporales cambian seguido, así que revisa su Instagram antes de ir.\n\nEl truco para una cita: el museo está **en pleno Parque Forestal**, así que después de la vuelta —una hora tranquila— sales a caminar entre los árboles y sigues la conversación rumbo a Lastarria o Bellavista. Abre de **martes a domingo, 10 a 18:30**; los lunes cierra, y queda a una cuadra del **metro Bellas Artes (Línea 5)**.',
      },
      {
        placeSlug: 'cerro-santa-lucia',
        blurb:
          'Caminar juntos **rompe el hielo mejor que estar sentados mirándose**, y el Santa Lucía es perfecto para eso: 69 metros de jardines, fuentes y escaleras de piedra en pleno centro, **gratis**. Subes sin apuro, te detienes en la Terraza Neptuno y rematas en la cima con **vista limpia del centro, el San Cristóbal y la Cordillera**.\n\nDa para 40 minutos o dos horas, según cuánto se distraigan conversando. Queda a pasos del **metro Santa Lucía (Línea 1)** y pegado a Lastarria, así que es fácil de encadenar con un café o un helado después. **Ojo:** son escaleras empinadas y puede cerrar antes si llueve.',
      },
      {
        placeSlug: 'emporio-la-rosa',
        blurb:
          'Un helado es la cita **de bajo riesgo por excelencia**: barata, corta si no fluye, larga si sí. Y esta heladería de Lastarria —más de 20 años, elegida entre las 25 mejores del mundo— es la parada obligada. Sabores de fruta chilena que rotan con la temporada y porciones generosas, por **menos de $5.000**.\n\nLa gracia es no quedarse sentado: pides tu bola en **Merced 291** y **sales a caminar el Parque Forestal** con el helado en la mano. Abre todos los días desde las 9:30 (sí, sirve hasta para un helado de mañana), a pasos del **metro Baquedano (Líneas 1 y 5)**.',
      },
      {
        placeSlug: 'persa-victor-manuel',
        blurb:
          'La cita **distinta y barata** que deja temas de conversación para rato. El persa más cuidado del **Barrio Franklin**: 8 galpones con antigüedades, vinilos, cómics, ropa vintage y plantas alrededor de una plaza con música en vivo, todo bajo **murales de Mono González**. Cada puesto es una excusa para descubrir qué le gusta al otro.\n\nPasean sin rumbo, comen algo (hay buena oferta gastronómica) y se quedan toda la tarde. **Solo abre sábados, domingos y festivos, de 9 a 18 h** —tiene baños, guardias y mejor orden que el resto del persa—, a pasos del **metro Franklin (Líneas 2 y 6)**.',
      },
      {
        placeSlug: 'cafe-calderon',
        blurb:
          'El clásico **café de día sin presión**: si la cosa fluye, se alarga; si no, se corta sin drama. Cafetería de especialidad con tres ambientes —interior, terraza y barra de cócteles—, así que **el mismo lugar se transforma según la hora**: parte como café tranquilo y, si la conversación engancha, te quedas a la coctelería de la tarde.\n\nPet friendly y con carta propia (los pancake bites y el brunch para dos son seguros). Queda en Diego de Velásquez 2103, cerca del **metro Pedro de Valdivia (Línea 1)**. **De martes a viernes abre hasta las 22**; conviene reservar el fin de semana porque se llena.',
      },
      {
        placeSlug: 'la-chascona-casa-museo-pablo-neruda',
        blurb:
          'Pocas citas tienen una **historia de amor incorporada**: Neruda construyó esta casa en 1953 como refugio para sus encuentros secretos con Matilde Urrutia, a quien apodó «La Chascona». La arquitectura caprichosa, las máscaras africanas y el comedor original dan conversación sola, y la audioguía marca el ritmo sin que tengas que llenar silencios.\n\nToma de media hora a una hora, y como está **en pleno Bellavista**, el plan se completa solo: visita + café + cena por el mismo barrio. **Martes a domingo, 10 a 18 h** (verano hasta 19); reserva en temporada alta. Metro **Baquedano (Líneas 1 y 5)**.',
      },
      {
        placeSlug: 'ritrovo',
        blurb:
          'Para la cita que ya pide **una cena como corresponde** sin gastar una fortuna. Pizzas y pastas artesanales en un espacio chico e íntimo a pasos de **Plaza Ñuñoa**: masa fresca, ñoquis de papa, ravioles de champiñón y ricota. Con **4.9 en Google**, es de esos lugares que quien va, repite.\n\nEl formato pequeño juega a favor: **íntimo, conversado, sin el bullicio de una trattoria grande**. Cena en pareja, una copa de vino, y si la cosa va bien, Plaza Ñuñoa tiene dónde seguir. Cerca del **metro Ñuñoa (Línea 3)**.',
      },
      {
        placeSlug: 'thelonious-lugar-de-jazz',
        blurb:
          'Cuando quieres **un plan que dé de qué hablar**, el jazz en vivo gana. El club de referencia de Santiago desde 2003, en Bellavista: 120 personas, ninguna mesa lejos del escenario, **dos sets en vivo cada noche** con músicos distintos. La música llena los silencios y te da algo que comentar entre tema y tema.\n\nAmbiente íntimo y bohemio, con coctelería decente y hasta una biblioteca de libros usados en un rincón. El cover ronda los **$6.000** según el artista. **Martes a sábado desde las 20:30**; reserva mesa si vas el fin de semana. Metro **Baquedano (Líneas 1 y 5)**.',
      },
      {
        placeSlug: 'chipe-libre',
        blurb:
          'Cuando la cita ya pide **tragos y terraza**, esta es la apuesta segura en **Lastarria**: la "república independiente del pisco", en una casona de los años 40 con una **barra de 18 metros** donde ves a los bartenders trabajar. Una de las cartas de pisco más completas de la ciudad y cócteles de autor que no son decorativos.\n\nLa terraza interior es un oasis para conversar horas. Pides un ceviche para compartir —el plato insignia— y dejas que la cosa fluya. **De jueves a sábado el ambiente sube**; cierra los domingos. A pasos del **metro Bellas Artes (Línea 5)**.',
      },
      {
        placeSlug: 'bocanariz',
        blurb:
          'La cita para **subir la apuesta** y tener algo que contar: el primer wine bar de Chile (2012), en Lastarria, con una carta de casi **400 etiquetas chilenas** elegida entre las mejores del mundo por Wine Spectator diez años seguidos. El sótano con cava visitable hace que hasta la espera entre copas sea parte del plan.\n\nNo hace falta saber de vino: el equipo te guía y **las copas de entrada son accesibles** (la cuenta sube solo si eliges premium). Hay cocina de autor para acompañar. **Reserva con anticipación los fines de semana.** Metro **Bellas Artes (Línea 5)**.',
      },
    ],
    mentions: [
      {
        placeSlug: 'centro-cultural-gabriela-mistral-gam',
        note: 'Gratis y enorme: café, librería, terrazas y muestras — **un barrio entero de plan** en un edificio, pegado a Lastarria.',
      },
      {
        placeSlug: 'parque-metropolitano-de-santiago',
        note: 'El paseo XL: funicular, teleférico, zoo, jardines y miradores. Para una **cita de día completo** al aire libre.',
      },
      {
        placeSlug: 'sky-costanera',
        note: 'La cita "wow": el **mirador más alto de la ciudad** al atardecer, para impresionar en grande.',
      },
      {
        placeSlug: 'centro-cultural-matucana-100',
        note: 'Polo cultural en Estación Central: **varias salas, cine y teatro** bajo un mismo techo.',
      },
      {
        placeSlug: 'mut-mercado-urbano-tobalaba',
        note: 'Un **edificio entero de restaurantes, bares y terrazas** en Providencia: si no se ponen de acuerdo en qué comer, eligen sobre la marcha.',
      },
    ],
  },
  {
    slug: 'las-mejores-hamburgueserias-de-santiago',
    name: 'Las mejores hamburgueserías de Santiago',
    kind: 'GUIDE',
    description:
      'Las hamburgueserías mejor evaluadas de Santiago: smash, gourmet y de barrio, comuna por comuna, con rating real de Google.',
    intro:
      'La hamburguesa dejó de ser comida rápida y se volvió oficio: masa de carne molida en el momento, panes de verdad y locales chicos que la gente cruza la ciudad para probar. Esta es nuestra selección de las mejores hamburgueserías de Santiago —de las smash crocantes a las gourmet de pan brioche, repartidas por toda la ciudad—, ordenadas por reputación. Se mantiene al día sola: cada hamburguesería nueva que cargamos entra acá.',
    rule: { cuisineTagSlugs: ['hamburguesas'] },
    sort: 'score_desc',
    isPublished: true,
    pins: [
      {
        placeSlug: 'gaspyburgers',
        blurb:
          'La **mejor evaluada** de esta lista, y eso que está lejos de los circuitos de moda: un local chico en **Pudahuel** que se ganó un **4.9 en Google** a punta de hamburguesas hechas con cariño y clientela fiel de barrio.\n\nEs de esos lugares que no salen en las guías pero que la gente del sector defiende como tesoro. No hay metro cerca, así que **se llega mejor en auto** —pero quienes van, vuelven.',
      },
      {
        placeSlug: 'casa-aldea',
        blurb:
          'La historia más bonita de la lista: el **chef que renunció a Boragó** —el restaurante más premiado de Chile— para abrir una **hamburguesería de barrio en Pudahuel**. El resultado es técnica de alta cocina puesta al servicio de algo simple y honesto.\n\nCon **4.8 en Google**, Casa Aldea demuestra que una gran hamburguesa no depende de la comuna ni del precio. Queda en **Sargento Aldea 970**; ándate con tiempo, porque es chica y se llena.',
      },
      {
        placeSlug: 'beasty-butchers',
        blurb:
          'Una de las más **consolidadas** de Santiago: **más de 1.600 reseñas con 4.7**, en pleno **Vitacura**. Acá la hamburguesa se toma en serio —carne de buena hebra, punto cuidado— y se acompaña de una **carta de coctelería** que la convierte en plan de noche, no solo de almuerzo.\n\nQueda en **Av. Vitacura 3456**. Es de las que sirven para llevar a alguien que "no creía" en las hamburguesas y dejarlo convertido.',
      },
      {
        placeSlug: 'mendoza-burgers',
        blurb:
          'Si lo tuyo es la **smash** —esa hamburguesa aplastada en la plancha, de bordes crocantes y queso derretido— esta es de las mejores de la ciudad: **4.9 en Google** en plena **Providencia**, cerca del **metro Los Leones (Líneas 1 y 6)**.\n\nLocal compacto, foco en lo que importa: la carne y el pan. Ideal para un almuerzo rápido pero de verdad bueno en el centro de Providencia.',
      },
      {
        placeSlug: 'strauch-burgers',
        blurb:
          'La prueba de que **Renca tiene cocina de primer nivel**: un local de barrio con un **4.9 en Google** que compite de igual a igual con las del barrio alto. Hamburguesas gourmet, generosas, hechas con dedicación.\n\nQueda en **Av. Condell 1547**. No es zona de metro, pero es justo el tipo de lugar que vale el viaje —y que demuestra que el mapa de la buena hamburguesa en Santiago es mucho más ancho de lo que parece.',
      },
      {
        placeSlug: 'la-maestranza-sandwich-burger-bar',
        blurb:
          'La **más reseñada** de toda la lista: **más de 3.000 opiniones en Google** con un sólido 4.5. Un **burger bar** consagrado en **Vitacura** (Av. Vitacura 5468), de esos que llevan años funcionando parejo y que ya son punto de referencia.\n\nCarta amplia entre hamburguesas y sándwiches, ambiente de bar y cocina que no falla. Cuando quieres ir a la segura con un grupo, esta es la apuesta.',
      },
    ],
    mentions: [
      {
        placeSlug: 'streat-burger-salvador',
        note: 'La **cadena** que partió de cero y hoy suma más de 20 locales en Chile: smash consistente, esta sucursal en **Av. Salvador, Ñuñoa**.',
      },
      {
        placeSlug: 'ryge-burger',
        note: 'Smash de **4.9** en **Providencia** (Miguel Claro 25), a pasos del **metro Manuel Montt** —chica, precisa y muy querida.',
      },
      {
        placeSlug: 'the-crust',
        note: 'Casi **1.900 reseñas con 4.6** en **Vitacura**: una de las smash con más hinchada del sector oriente.',
      },
      {
        placeSlug: 'bross-saez',
        note: 'Otra joya de **Renca** con **4.9**: gourmet de barrio, hecha a pulso y sin pretensiones.',
      },
    ],
  },
  {
    slug: 'las-mejores-pizzerias-de-santiago',
    name: 'Las mejores pizzerías de Santiago',
    kind: 'GUIDE',
    description:
      'Las pizzerías mejor evaluadas de Santiago: napolitana, romana, a la piedra y de barrio, comuna por comuna, con rating real de Google.',
    intro:
      'La pizza en Santiago dejó de ser delivery genérico para volverse oficio: masa fermentada por días, hornos que pasan los 400°C y maestros pizzeros que discuten en serio sobre napolitana, romana o masa madre. Esta es nuestra selección de las mejores pizzerías de Santiago —de la napolitana de borde inflado a la romana crocante al corte, repartidas de Vitacura a San Miguel—, ordenadas por reputación. Se mantiene al día sola: cada pizzería nueva que cargamos entra acá.',
    rule: { cuisineTagSlugs: ['pizza'] },
    sort: 'score_desc',
    isPublished: true,
    pins: [
      {
        placeSlug: 'fina-pizza',
        blurb:
          'La **mejor evaluada** de la guía: un **4.9 en Google** en **Ñuñoa** para una pizza que sus propios dueños definen como **contemporánea de autor**, más que napolitana de manual. Masa cuidada, ingredientes bien elegidos y un local chico donde se nota que cada pizza importa.\n\nQueda en **Los Aliaga 809** y abre sobre todo de tarde-noche. De esas que valen el desvío aunque no te queden de paso.',
      },
      {
        placeSlug: 'pratola',
        blurb:
          '**Cinco estrellas redondas en Google** —caso rarísimo— para esta romana **al taglio** (al corte, de bandeja) en pleno **Barrio Lastarria**. Masa alta y aireada, crocante abajo, que se vende por porción y al peso como en las panaderías de Roma.\n\nEstá en **Monjitas 385**, a pasos del **metro Bellas Artes (Línea 5)**: ideal para picar algo de verdad bueno antes o después de un panorama en el centro.',
      },
      {
        placeSlug: 'segreta-pizzeria',
        blurb:
          'La napolitana consolidada del sector oriente: **más de 2.000 reseñas con 4.8** en **Alonso de Córdova, Vitacura**. Horno a leña, masa de fermentación larga y el borde (cornicione) inflado como manda la escuela de Nápoles.\n\nQueda en **Alonso de Córdova 3080**. Es de las que sirven para quedar bien: ambiente cuidado y una pizza que aguanta cualquier comparación.',
      },
      {
        placeSlug: 'la-argentina-pizzeria',
        blurb:
          'La **más reseñada** de la guía por lejos: **más de 8.000 opiniones** y una tradición que arranca en **1949**. Su especialidad es la pizza **a la piedra** —masa fina y crocante, bien cargada de queso—, un clásico transversal que cruza generaciones.\n\nEsta sede está en **Av. Italia 989, Barrio Italia (Providencia)**, cerca del **metro Santa Isabel (Línea 5)**. Cuando quieres ir a la segura con un nombre que nunca falla, es esta.',
      },
      {
        placeSlug: 'pizzeria-tiramisu',
        blurb:
          'Una **institución** de Las Condes: **más de 13.000 reseñas** avalan años de cocina italiana pareja en **Isidora Goyenechea 3141**, a pasos del **metro El Golf (Línea 1)**. Pizza de horno, pastas y ambiente de trattoria en pleno barrio financiero.\n\nEs la apuesta clásica para un almuerzo largo o una cena sin sorpresas: sabes exactamente lo que vas a recibir, y es bueno.',
      },
      {
        placeSlug: 'picara-pajara-pizzeria',
        blurb:
          'La prueba de que **el sur también tiene napolitana de primera**: **4.7 con más de 1.100 reseñas** en **San Miguel**, cerca del **metro Ciudad del Niño (Línea 2)**. Masa de fermentación larga y un local que se ganó a sus fieles por mérito propio.\n\nQueda en **Octava Avenida 1201**. De las que demuestran que el mapa de la buena pizza en Santiago es mucho más ancho que el barrio alto.',
      },
    ],
    mentions: [
      {
        placeSlug: 'locura-pizzeria-ex-chelenko',
        note: 'Pizza de **masa madre** con **4.9** en **Peñalolén** (ex Chelenko, Av. Tobalaba 13949): fermentación lenta y sabor de verdad en el oriente-sur.',
      },
      {
        placeSlug: 'rocckos-pizza',
        note: '**4.8** en **Maipú** (Parque Central): una de las mejores del sector poniente, hecha a pulso y muy querida por el barrio.',
      },
      {
        placeSlug: 'la-dominga-pizzeria',
        note: 'Buena pizza al norte de la capital: **4.7** en **Quilicura** (Santa Luisa 537), de esas de barrio que la gente defiende.',
      },
      {
        placeSlug: 'espacio-pizza',
        note: '**4.8 con 400 reseñas** en **La Cisterna** (Av. Fernández Albano 811): calidad de pizzería seria en una comuna donde no abunda.',
      },
    ],
  },
  {
    slug: 'las-mejores-sushilerias-de-santiago',
    name: 'Las mejores sushilerías de Santiago',
    kind: 'GUIDE',
    description:
      'Las mejores sushilerías de Santiago: nikkei de autor, barras de barrio y clásicos del delivery, comuna por comuna, con rating real de Google.',
    intro:
      'El sushi es, probablemente, la comida que más se pide a domicilio en Santiago —y detrás de tanto delivery genérico hay sushilerías que valen de verdad: nikkei de autor, barras de barrio con años de oficio e instituciones con miles de reseñas. Esta es nuestra selección de las mejores sushilerías de Santiago, de Vitacura a Puente Alto, ordenadas por reputación. Se mantiene al día sola: cada sushilería nueva que cargamos entra acá.',
    rule: { cuisineTagSlugs: ['sushi'] },
    sort: 'score_desc',
    isPublished: true,
    pins: [
      {
        placeSlug: 'koari-sushi',
        blurb:
          'La **mejor evaluada** de la guía: **4.9 en Google con más de 880 reseñas** para esta cocina **nikkei de autor** en pleno **Tenderini**, a pasos del Teatro Municipal. Rolls flambeados, entradas con toque tropical y coctelería —está pensada más para una comida de evento que para un pedido de trámite.\n\nQueda en **Tenderini 171**, prácticamente sobre el **metro Universidad de Chile (Líneas 1 y 3)**. De las que valen sentarse a la mesa en vez de pedir a domicilio.',
      },
      {
        placeSlug: 'katai-sushi-y-sandwich',
        blurb:
          'La prueba de que **el sur profundo también hace sushi de primera**: **4.9 en Google** en **Puente Alto**, con la particularidad de juntar dos antojos en una carta —**sushi y sándwiches**— para no tener que elegir. Rolls por el lado clásico (panko, camarón apanado, queso crema) y opciones más contundentes tipo colación.\n\nEstá en **Av. Concha y Toro 2760**. Funciona sobre todo para pedir a domicilio o retirar, y quienes lo prueban repiten.',
      },
      {
        placeSlug: 'sushi-hoy',
        blurb:
          'El **delivery de barrio** mejor evaluado de la guía: **4.8 con más de 550 reseñas** en una calle tranquila de **Ñuñoa**. Rolls fusión, abundantes y bien cargados —piña caramelizada, queso crema, tempura—, más en la línea del sushi para compartir en casa que del tradicional.\n\nQueda cerca del **metro Monseñor Eyzaguirre (Línea 3)** y tiene también sucursal en La Florida. Del tipo que pides un viernes en la noche a la segura.',
      },
      {
        placeSlug: 'sushi-la-reina',
        blurb:
          'El clásico del **oriente para pedir a la casa**: **4.8 con más de 500 reseñas** en **La Reina**. Carta amplia de rolls —california, hot roll, veggie, oriental sin arroz, nikkei— pensada para compartir en familia o con amigos, a precio accesible.\n\nEstá en **Lynch Sur 17**. Una propuesta sencilla y pareja, de esas que el barrio tiene fichadas.',
      },
      {
        placeSlug: 'restaurante-okita',
        blurb:
          'La **más reseñada** de la guía por lejos: **más de 2.500 opiniones con 4.6** en **San Miguel**. Uno de los referentes de fusión **peruano-japonesa** del sector sur, con el sushi acevichado y los ceviches casi obligados, en un local amplio de dos pisos.\n\nQueda en **Av. La Marina 1190**, cerca del **metro Lo Vial (Línea 2)**; los **martes hacen tenedor libre**. Cuando quieres ir a la segura con un grupo, esta es la apuesta.',
      },
      {
        placeSlug: 'tanaka-vitacura',
        blurb:
          'El **nikkei consolidado del barrio alto**: **4.6 con más de 1.200 reseñas** en pleno **Alonso de Córdova, Vitacura**. Sede original de Tanaka, mezcla técnica japonesa con condimentos peruanos —sushi de autor, ceviches, tiraditos, pulpo al olivo— apostando por la frescura.\n\nAmbiente acogedor y cuidado, de los que sirven para quedar bien. De las pocas de esta guía pensadas para sentarse con calma en el oriente.',
      },
    ],
    mentions: [
      {
        placeSlug: 'sushinikkei17',
        note: 'Nikkei con casa propia de dos pisos en **Los Piñones**, a pasos de **Bellavista (Providencia)** y del **metro Pedro de Valdivia**: **4.6 con 370+ reseñas**, tiraditos y ceviches de chefs peruanos.',
      },
      {
        placeSlug: 'kaizen-sushi',
        note: '**Sushi de autor con 4.7** en **Maipú** (Av. 4 Poniente 383): rolls que se salen de la fórmula genérica de barrio, con buena relación calidad-precio en el poniente.',
      },
      {
        placeSlug: 'haruko-sushi-ramen',
        note: 'Un japonés **de verdad** en Patio Macul (**Macul**, metro Camino Agrícola): **4.7** con ramen tonkotsu de caldo denso, karaage y guiños nikkei —más que una sushilería.',
      },
      {
        placeSlug: 'sushi-hoy-la-florida',
        note: 'La sucursal de **Sushi Hoy** en **La Florida** (Walker Martínez 315, metro Vicuña Mackenna): **4.9 con 86 reseñas**, con ceviche, gohan y temaki además de los rolls.',
      },
    ],
  },
  {
    slug: 'el-mejor-ramen-de-santiago',
    name: 'El mejor ramen de Santiago',
    kind: 'GUIDE',
    description:
      'Dónde comer el mejor ramen de Santiago: ramenerías de barra, cadenas con fideos hechos en casa y hasta lanzhou chino, con rating real de Google.',
    intro:
      'El ramen pasó de rareza a fenómeno en Santiago: hoy hay barras japonesas con filas en la vereda, cadenas que hacen sus propios fideos y hasta locales de lanzhou —el primo chino del ramen, con fideos estirados a mano—. Esta es nuestra selección de dónde tomarse el mejor ramen de Santiago, de Providencia a Peñalolén, ordenada por reputación. Se mantiene al día sola: cada ramenería nueva que cargamos entra acá.',
    rule: { cuisineTagSlugs: ['ramen'] },
    sort: 'score_desc',
    isPublished: true,
    pins: [
      {
        placeSlug: 'ramen-kintaro',
        blurb:
          '**La institución del ramen chileno**, y la más reseñada de esta guía por paliza: **4.5 con más de 7.400 opiniones en Google**. La barra de **Monjitas 460** —a pasos del **metro Bellas Artes (Línea 5)**— lleva años haciendo fila en la vereda, con un formato japonés de verdad: espacio chico, rotación rápida y el caldo como protagonista.\n\nSi es tu primera vez en el mundo del ramen, **este es el punto de partida**. Anda temprano o fuera de hora punta, porque la fila es parte del rito.',
      },
      {
        placeSlug: 'ramen-one-vivo-imperio',
        blurb:
          'El **mejor evaluado** de la guía: **4.9 con más de 930 reseñas** para esta sucursal en el patio de comidas del **Mall Vivo Imperio (Huérfanos 830)**, sobre el **metro Plaza de Armas (Líneas 3 y 5)**. Ramen One partió en 2019 y creció haciendo **sus propios fideos con máquina japonesa** —se nota en el bowl.\n\nQue no te engañe el formato patio de comidas: la gente viene por el ramen, no por el mall. De las apuestas más seguras del centro.',
      },
      {
        placeSlug: 'ramen-ryoma-barrio-italia',
        blurb:
          'La **joya de Barrio Italia**: **4.9 con casi 700 reseñas** en **Condell 1298**, cerca del **metro Santa Isabel (Línea 5)**. Es la segunda casa de Ramen Ryoma —la original está en General Holley— y se ganó al barrio con caldos trabajados y un local más tranquilo que sus pares del sector oriente.\n\nBuen plan para combinar con una tarde de vitrineo por Barrio Italia; llega con hambre, que los bowls son contundentes.',
      },
      {
        placeSlug: 'isekai-ramen',
        blurb:
          'El nombre lo dice: *isekai* es el género de anime de **"aparecer en otro mundo"**, y eso busca esta ramenería de **Girardi 1236, Providencia** —**4.8 con más de 1.300 reseñas**—. Ambiente joven, guiños otaku y ramen en serio, una combinación que lo volvió favorito de la comunidad fan del Japón pop.\n\nQueda cerca del **metro Santa Isabel (Línea 5)**, en la misma cuadra del circuito gastronómico de Girardi. De los que se llenan el fin de semana.',
      },
      {
        placeSlug: 'momotaro-foods',
        blurb:
          'El ramen de **Patronato**: **4.7 con más de 700 reseñas** en **Loreto 158, Recoleta**. Es la casa matriz del grupo Momotaro —el mismo de Momotaro Los Leones— y mantiene el espíritu de local de barrio: sin pretensiones, bowls generosos y precios más amables que el promedio del rubro.\n\nA pasos del barrio comercial de Patronato y de La Vega, funciona perfecto como final de un paseo por el sector. ',
      },
      {
        placeSlug: 'kame-house-sushi-ramen',
        blurb:
          'La prueba de que **el suroriente también tiene ramen del bueno**: **4.7 con más de 150 reseñas** en **Av. Consistorial 2351, Peñalolén**. La carta es mitad sushi, mitad ramen, pero las reseñas son claras: **el caldo es el fuerte de la casa** —y el nombre, un guiño a Dragon Ball que la clientela agradece.\n\nSi vives por Peñalolén o La Reina, te ahorra el viaje a Providencia. De los pocos del sector, y cumple con creces.',
      },
    ],
    mentions: [
      {
        placeSlug: 'ramen-one-independencia',
        note: 'La sucursal norte de **Ramen One** en el Mall Barrio Independencia: **4.8 con más de 1.200 reseñas**, el mejor bowl al norte del Mapocho.',
      },
      {
        placeSlug: 'genki-ya-ramen-los-dominicos',
        note: '**4.7 con 270+ reseñas** en el sector **Los Dominicos (Las Condes)**: la sede oriente de la cadena Genki Ya, para el antojo de ramen sin bajar de Apoquindo.',
      },
      {
        placeSlug: 'mirai-food-lab',
        note: 'Ramen de autor dentro de **Factoría Franklin** (metro Franklin): **4.7 con 420+ reseñas**, ideal para cerrar un sábado de Persa Bío Bío.',
      },
      {
        placeSlug: 'ootoya-ramen-noodles-house',
        note: 'El clásico de **Bellavista** (Constitución 125, metro Baquedano): **4.6 con casi 1.500 reseñas**, carta amplia de ramen y noodles para grupos.',
      },
    ],
  },
]
