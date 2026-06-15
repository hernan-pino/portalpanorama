// Íconos de la ficha (trazo simple). Server-renderables; el color y tamaño los
// controla el CSS de cada contexto vía currentColor. Reconstruidos del handoff
// design_briefs/4E_01_ficha_ref/handoff/source/shared.jsx.

type IconProps = { className?: string }

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg className={className ?? 'ico'} viewBox="0 0 20 20" {...stroke} aria-hidden="true">
      {children}
    </svg>
  )
}

export function PinIcon(p: IconProps) {
  return <Svg className={p.className}><path d="M10 17.5s5.5-4.6 5.5-9A5.5 5.5 0 0 0 4.5 8.5c0 4.4 5.5 9 5.5 9z" /><circle cx="10" cy="8.4" r="2" /></Svg>
}
export function NavIcon(p: IconProps) {
  return <Svg className={p.className}><path d="M10 2.5l7 14.5-7-3.2-7 3.2z" /></Svg>
}
export function WalletIcon(p: IconProps) {
  return <Svg className={p.className}><rect x="2.5" y="5" width="15" height="11" rx="2.2" /><path d="M2.5 8.5h15M13.5 12h1.5" /></Svg>
}
export function ClockIcon(p: IconProps) {
  return <Svg className={p.className}><circle cx="10" cy="10" r="7.5" /><path d="M10 5.8V10l3 1.8" /></Svg>
}
export function TicketIcon(p: IconProps) {
  return <Svg className={p.className}><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h11A1.5 1.5 0 0 1 17 6.5v2a1.5 1.5 0 0 0 0 3v2A1.5 1.5 0 0 1 15.5 15h-11A1.5 1.5 0 0 1 3 13.5v-2a1.5 1.5 0 0 0 0-3z" /><path d="M10 6.5v7" strokeDasharray="1.5 2" /></Svg>
}
export function CardIcon(p: IconProps) {
  return <Svg className={p.className}><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="M2.5 8h15" /></Svg>
}
export function MetroIcon(p: IconProps) {
  return <Svg className={p.className}><rect x="5" y="2.8" width="10" height="11" rx="3" /><path d="M5 9h10M8 16.5l-1.5 1.5M12 16.5l1.5 1.5" /></Svg>
}
export function AccessIcon(p: IconProps) {
  return <Svg className={p.className}><circle cx="11" cy="3.6" r="1.5" /><path d="M8.2 6.3l3 1 2.3 1.1-1.8.6M11.2 7.3V11h-3a3.5 3.5 0 1 0 3.4 4.3" /><path d="M11.2 11l2.4 4.4h2" /></Svg>
}
export function UmbrellaIcon(p: IconProps) {
  return <Svg className={p.className}><path d="M2.6 10a7.4 7.4 0 0 1 14.8 0z" /><path d="M10 10v5.6a1.7 1.7 0 0 1-3.4 0" /><path d="M10 4.2V2.6" /></Svg>
}
export function PhoneIcon(p: IconProps) {
  return <Svg className={p.className}><path d="M6.5 3.5l1.6 3.2-1.4 1.6a9 9 0 0 0 4 4l1.6-1.4 3.2 1.6v3.3c0 .7-.6 1.3-1.3 1.2A13.5 13.5 0 0 1 3.6 5C3.5 4.3 4.1 3.7 4.8 3.7z" /></Svg>
}
export function GlobeIcon(p: IconProps) {
  return <Svg className={p.className}><circle cx="10" cy="10" r="7.5" /><path d="M2.5 10h15M10 2.5c2.2 2.2 2.2 12.8 0 15M10 2.5c-2.2 2.2-2.2 12.8 0 15" /></Svg>
}
export function InstagramIcon(p: IconProps) {
  return <Svg className={p.className}><rect x="3" y="3" width="14" height="14" rx="4.2" /><circle cx="10" cy="10" r="3.2" /><circle cx="14.1" cy="5.9" r="0.6" fill="currentColor" /></Svg>
}
export function MenuIcon(p: IconProps) {
  return <Svg className={p.className}><path d="M5 3.5h8.5L16 6v10.5H5z" /><path d="M7.5 8h5M7.5 11h5M7.5 14h3" /></Svg>
}
export function ShareIcon(p: IconProps) {
  return <Svg className={p.className}><circle cx="15" cy="5" r="2.4" /><circle cx="5" cy="10" r="2.4" /><circle cx="15" cy="15" r="2.4" /><path d="M7.1 8.9l5.8-2.8M7.1 11.1l5.8 2.8" /></Svg>
}
export function BookmarkIcon(p: IconProps) {
  return <Svg className={p.className}><path d="M5 3.5h10v13l-5-3.4-5 3.4z" /><path d="M10 6.6v4M8 8.6h4" /></Svg>
}
export function FlagIcon(p: IconProps) {
  return <Svg className={p.className}><path d="M5 17V4M5 4.5h8l-1.4 2.8L13 10H5" /></Svg>
}

// Estrella: rellena (rating) o de contorno (base). MISMO path en ambos casos para
// que el relleno parcial calce perfecto (si difieren, el medio-relleno se ve
// corrido). No usa la clase .ico para no heredar fill:none.
const STAR_PATH = 'M10 1.6l2.47 5.18 5.7.72-4.2 3.9 1.1 5.64L10 14.3l-5.07 2.74 1.1-5.64-4.2-3.9 5.7-.72z'
export function StarIcon({ outline }: { outline?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={outline ? 'none' : 'currentColor'}
      stroke={outline ? 'currentColor' : 'none'}
      strokeWidth={outline ? 1.4 : undefined}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  )
}

// Rating de Google: 5 estrellas con relleno parcial en UN solo SVG. Dos capas con
// el MISMO set de paths (gris de base + dorada encima) y la dorada recortada por un
// clipPath de ancho = % del puntaje (4.6 → 92 de 100). El clip vive en el espacio
// del SVG (no se desplaza con los transforms de cada estrella) → el relleno nunca
// queda corrido. El id se deriva del % (mismo % = clip idéntico, sin colisiones reales).
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  const clipId = `starclip-${Math.round(pct)}`
  const stars = [0, 1, 2, 3, 4].map((i) => (
    <path key={i} d={STAR_PATH} transform={`translate(${i * 20}, 0)`} />
  ))
  return (
    <svg
      className="rating-stars"
      viewBox="0 0 100 20"
      width={size * 5}
      height={size}
      role="img"
      aria-label={`${value.toFixed(1)} de 5 en Google`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={pct} height="20" />
        </clipPath>
      </defs>
      <g style={{ fill: 'var(--surface-line)' }}>{stars}</g>
      <g style={{ fill: 'var(--star)' }} clipPath={`url(#${clipId})`}>{stars}</g>
    </svg>
  )
}
