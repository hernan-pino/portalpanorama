// Tipos de clic de INTENCIÓN DE CONTACTO en la ficha: lo que el dueño quiere medir
// (a diferencia del rating de Google, que ya se ve en la propia ficha). Anónimos:
// miden tráfico público, no historial personal (eso es VisitHistory).
export enum PlaceClickKind {
  DIRECTIONS = 'DIRECTIONS',
  WEBSITE = 'WEBSITE',
  INSTAGRAM = 'INSTAGRAM',
  PHONE = 'PHONE',
  MENU = 'MENU',
  SOCIAL = 'SOCIAL',
}
