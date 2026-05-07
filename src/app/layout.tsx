import type { Metadata } from 'next'
import { Fraunces, Inter_Tight } from 'next/font/google'
import './globals.css'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'

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
  title: {
    template: '%s — Portal Panorama',
    default: 'Portal Panorama',
  },
  description: 'Descubre los mejores negocios y lugares de Santiago.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${interTight.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
