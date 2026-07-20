// Dónde estacionar. Conjunto de etiquetas: un lugar puede tener varias (propio + calle).
//
// Se distingue el estacionamiento PROPIO del de la CALLE porque para el usuario son
// cosas distintas: uno es una garantía, el otro es suerte. Y se distingue "gratis/pagado
// sin especificar dónde" porque Google muy seguido dice solo eso, y afirmar "propio"
// cuando no lo sabemos sería inventar.
//
// A diferencia de los otros enums del Place, este dato lo puebla Google (la sección
// "Estacionamiento" de la pestaña "Acerca de", vía el enrich de Apify) y el dueño lo
// corrige desde su panel. Es informativo y colaborativo: se muestra con "según Google",
// nunca como promesa.
export enum ParkingOption {
  // Propio del establecimiento (en el lugar o garage)
  OWN_FREE = 'OWN_FREE',
  OWN_PAID = 'OWN_PAID',
  // En la calle
  STREET_FREE = 'STREET_FREE',
  STREET_PAID = 'STREET_PAID',
  // Google dice el costo pero no el dónde. Se suprime si ya hay uno específico
  // del mismo costo, para no mostrar el dato dos veces.
  FREE = 'FREE',
  PAID = 'PAID',
  VALET = 'VALET',
  // Facilidad para encontrar espacio. No es una opción de dónde dejar el auto,
  // es el matiz que le da valor al resto ("hay, pero cuesta").
  EASY = 'EASY',
  HARD = 'HARD',
}

export const PARKING_OPTIONS: ParkingOption[] = Object.values(ParkingOption)

export function isParkingOption(value: string): value is ParkingOption {
  return (PARKING_OPTIONS as string[]).includes(value)
}
