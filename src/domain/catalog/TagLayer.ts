// Sistema de tags de 6 capas (decisión 2026-06-14). Un Tag es universal si no tiene
// categoryId; condicional a una categoría si lo tiene (ej. "tipo de cocina" →
// Gastronomía). Los topes por capa y exclusiones se aplican en el dominio (ver Place),
// no en la BD. Topes solo en las capas subjetivas (AUDIENCE/OCCASION/VIBE); las
// objetivas (EXPERIENCE/SERVICE/SPECIFIC) van sin tope ("más info = mejor").
export enum TagLayer {
  AUDIENCE = 'AUDIENCE', // ¿con quién? — topea (ver tagLimits.ts)
  OCCASION = 'OCCASION', // ideal para / ocasión — topea (ver tagLimits.ts)
  VIBE = 'VIBE', // vibe / ambiente — topea (ver tagLimits.ts)
  EXPERIENCE = 'EXPERIENCE', // qué ofrece de destacable (rooftop, vista, vida nocturna…)
  SERVICE = 'SERVICE', // servicios y acceso (estacionamiento, wifi, accesible, pet friendly…)
  SPECIFIC = 'SPECIFIC', // atributos específicos condicionales por categoría
  CUISINE = 'CUISINE', // tipo de comida (cocina + plato), condicional a Gastronomía — sin tope
}
