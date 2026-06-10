// ¿reserva o solo llegar? Única fuente de verdad de la reserva: NO existe tag
// "con/sin reserva". El filtro "Sin reserva" se deriva de WALK_IN.
export enum ReservationPolicy {
  REQUIRED = 'REQUIRED',
  WALK_IN = 'WALK_IN',
  RECOMMENDED = 'RECOMMENDED',
}
