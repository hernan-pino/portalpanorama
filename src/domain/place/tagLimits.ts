import { TagLayer } from '@domain/catalog/TagLayer'

// Capas subjetivas: las que topean. Las objetivas (EXPERIENCE/SERVICE/SPECIFIC/CUISINE)
// van sin tope — ahí "más info = mejor".
export type SubjectiveTagLayer = TagLayer.AUDIENCE | TagLayer.OCCASION | TagLayer.VIBE

// FUENTE DE VERDAD ÚNICA de los topes por capa. La entidad `Place` los valida y el
// form del admin los lee de acá.
//
// Antes cada uno tenía su copia a mano ("espejo del dominio", decía el form) y se
// desincronizaron: 38 lugares publicados quedaron con 4 tags OCCASION contra un tope
// de 3, y no se podían ni abrir en el editor porque `Place.create()` reventaba al
// hidratarlos desde la BD.
//
// OCCASION subió de 3 → 4 (s37): "Para días de lluvia" es lo que vuelve valioso a un
// museo, un escape room o un karaoke, y con 3 no cabía junto a las ocasiones básicas
// (cumpleaños / junta de amigos / cita). El tope de 3 era el que estaba mal, no los datos.
export const TAG_LIMITS: Record<SubjectiveTagLayer, number> = {
  [TagLayer.AUDIENCE]: 4,
  [TagLayer.OCCASION]: 4,
  [TagLayer.VIBE]: 3,
}

// Tope de una capa, o undefined si esa capa no topea. Acepta `string` para que la
// presentation lo use sin castear el layer que viene del read model.
export function tagLimitFor(layer: string): number | undefined {
  return (TAG_LIMITS as Record<string, number>)[layer]
}
