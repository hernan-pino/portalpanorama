import { ParkingOption } from '@domain/place/ParkingOption'

// Cómo se lee cada opción de estacionamiento en pantalla. Vive en presentation
// (el dominio guarda códigos, no copy) y es la ÚNICA fuente: la usan la ficha
// pública, el form del admin, su preview y el panel del dueño. Duplicarla haría
// que un lugar se lea distinto según desde dónde lo mires.
//
// Las etiquetas NO repiten la palabra "estacionamiento": en los cuatro lugares donde
// se muestran ya vienen bajo ese rótulo, y repetirla daba filas como
// "Estacionamiento cercano · Estacionamiento propio gratis · Estacionamiento pagado".
export const PARKING_LABELS: Record<ParkingOption, string> = {
  [ParkingOption.OWN_FREE]: 'Propio, gratis',
  [ParkingOption.OWN_PAID]: 'Propio, pagado',
  [ParkingOption.STREET_FREE]: 'Gratis en la calle',
  [ParkingOption.STREET_PAID]: 'Pagado en la calle',
  // Sin apellido: Google dio el costo pero no dónde. Bajo el rótulo "Estacionamiento"
  // se entiende, y afirmar "propio" sería inventar.
  [ParkingOption.FREE]: 'Gratis',
  [ParkingOption.PAID]: 'Pagado',
  [ParkingOption.VALET]: 'Valet parking',
  [ParkingOption.EASY]: 'Suele haber espacio',
  [ParkingOption.HARD]: 'Cuesta encontrar espacio',
}

// Mismo texto, en el orden del enum, para los formularios.
export const PARKING_EDIT_OPTIONS: { value: ParkingOption; label: string }[] =
  (Object.keys(PARKING_LABELS) as ParkingOption[]).map((value) => ({
    value,
    label: PARKING_LABELS[value],
  }))

// La ficha recibe string[] (el read-model no tipa el enum): resuelve sin romper
// si algún día llega un código que esta tabla no conoce.
export function parkingLabel(code: string): string {
  return PARKING_LABELS[code as ParkingOption] ?? code
}
