// Sistema de tags de 6 capas (decisión 2026-06-14). Un Tag es universal si no tiene
// categoryId; condicional a una categoría si lo tiene (ej. "tipo de cocina" →
// Gastronomía). Los topes por capa y exclusiones se aplican en el dominio (ver Place),
// no en la BD. Topes solo en las capas subjetivas (AUDIENCE/OCCASION/VIBE); las
// objetivas (EXPERIENCE/SERVICE/SPECIFIC) van sin tope ("más info = mejor").
export enum TagLayer {
  AUDIENCE = 'AUDIENCE', // ¿con quién? — máx 4 por ficha
  OCCASION = 'OCCASION', // ideal para / ocasión — máx 3 por ficha
  VIBE = 'VIBE', // vibe / ambiente — máx 3 por ficha
  EXPERIENCE = 'EXPERIENCE', // qué ofrece de destacable (rooftop, vista, vida nocturna…)
  SERVICE = 'SERVICE', // servicios y acceso (estacionamiento, wifi, accesible, pet friendly…)
  SPECIFIC = 'SPECIFIC', // atributos específicos condicionales por categoría
}
