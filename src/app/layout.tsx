import type { Metadata } from 'next'
import { Fraunces, Instrument_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@components/layout/Header'
import { GoogleAnalytics } from '@components/analytics/GoogleAnalytics'
import { MicrosoftClarity } from '@components/analytics/MicrosoftClarity'
import { siteUrl } from '@lib/siteUrl'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
})

// Instrument Sans reemplaza a Inter Tight como fuente de toda la UI (rediseño s34).
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

// Geist Mono ahora se carga de verdad (antes era solo un fallback string): el sistema
// la reserva para datos duros — horario, precio CLP, teléfono, contadores.
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  // Base para que canonical/OG relativos resuelvan a URL absoluta.
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s — Portal Panorama',
    default: 'Portal Panorama',
  },
  description: 'Descubre los mejores negocios y lugares de Santiago.',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Portal Panorama',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${instrumentSans.variable} ${geistMono.variable}`}>
      <body>
        <Header />
        {children}
        <GoogleAnalytics />
        <MicrosoftClarity />
      </body>
    </html>
  )
}
