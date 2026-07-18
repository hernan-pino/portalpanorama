// Íconos de la feature de distancia. El pin marca "distancia hasta acá" (línea recta);
// el peatón se usa SOLO cuando mostramos un tiempo caminando, para no prometer una
// ruta a pie en distancias que nadie camina.

export function PinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function WalkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="13" cy="4" r="1.6" />
      <path d="M12.5 22l-1-6.5-2.5-2.5 1.5-5 3.5 2 2.5 2" />
      <path d="M9 10.5L6.5 13 6 17" />
      <path d="M14.5 15.5l2 6.5" />
    </svg>
  )
}
