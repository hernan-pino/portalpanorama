import { Footer } from '@components/layout/Footer'
import { ScrollToTop } from '@components/layout/ScrollToTop'
import { UserLocationProvider } from '@components/geo/UserLocationProvider'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // Ubicación del usuario a nivel de todo el sitio: el botón "Cerca de mí" de
  // /explorar la concede y, como se recuerda por la sesión de pestaña, la distancia
  // aparece también en la home, guías, listas y ficha — sin volver a pedir permiso.
  return (
    <UserLocationProvider>
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
    </UserLocationProvider>
  )
}
