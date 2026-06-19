import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandForm } from '../BrandForm'

export const metadata: Metadata = { title: 'Nueva marca — Admin' }

export default function NuevaMarcaPage() {
  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/marcas" className="admin-page__back">← Marcas</Link>
          <h1 className="admin-page__title">Nueva marca</h1>
          <p className="admin-page__sub">Después asigná sus locales desde la ficha de cada lugar.</p>
        </div>
      </header>
      <BrandForm />
    </div>
  )
}
