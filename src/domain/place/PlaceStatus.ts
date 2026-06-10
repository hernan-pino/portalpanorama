// Estado de la ficha. En el MVP todo lo carga el admin: nace PENDING_REVIEW y
// se PUBLISHED al revisar. ARCHIVED reemplaza al borrado (preserva historial).
export enum PlaceStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}
