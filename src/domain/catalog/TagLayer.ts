// Sistema de tags de 4 capas (decisión 2.3). Un Tag es universal si no tiene
// categoryId; condicional a una categoría si lo tiene (ej. "tipo de cocina" →
// Gastronomía). Los límites por capa y exclusiones se aplican en el dominio
// (ver Place), no en la BD.
export enum TagLayer {
  SOCIAL = 'SOCIAL', // ¿con quién voy? — máx 4 por ficha
  SPECIFIC = 'SPECIFIC', // atributos específicos condicionales por categoría
  ACCESS = 'ACCESS', // logística de acceso (estacionamiento, bicicletero, micro…)
  VIBE = 'VIBE', // ambiente — máx 3 por ficha
}
