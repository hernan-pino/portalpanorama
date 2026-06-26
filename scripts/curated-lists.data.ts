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
]
