import type { Metadata } from 'next'
import { Fraunces, Inter_Tight } from 'next/font/google'
import './globals.css'
import { Header } from '@components/layout/Header'
import { GoogleAnalytics } from '@components/analytics/GoogleAnalytics'
import { siteUrl } from '@lib/siteUrl'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
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
    <html lang="es" className={`${fraunces.variable} ${interTight.variable}`}>
      <body>
        <Header />
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  )
}
