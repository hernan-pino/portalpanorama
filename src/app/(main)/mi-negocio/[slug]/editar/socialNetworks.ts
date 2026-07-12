// Redes que el dueño puede sumar (Instagram va aparte: es su campo propio, pilar
// de crecimiento con trato especial en la ficha). Misma lista que el admin, fuente
// única para el <select> del editor y la validación en la action.
export const OWNER_SOCIAL_NETWORKS = [
  'WhatsApp',
  'Facebook',
  'TikTok',
  'YouTube',
  'X',
  'Threads',
  'Spotify',
  'LinkedIn',
  'Otra',
] as const

export type OwnerSocialNetwork = (typeof OWNER_SOCIAL_NETWORKS)[number]
