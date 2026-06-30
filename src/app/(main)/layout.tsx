import { Footer } from '@components/layout/Footer'
import { ScrollToTop } from '@components/layout/ScrollToTop'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
