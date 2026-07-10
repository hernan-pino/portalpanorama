'use client'
import { Suspense, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Selector de orden de /explorar (sesión 27). El default (score) no ensucia la URL:
// elegirlo borra el param `orden`. Cambiar el orden resetea la página.
const OPTIONS = [
  { value: '', label: 'Recomendados' },
  { value: 'alfabetico', label: 'A–Z' },
  { value: 'precio-menor', label: 'Precio: menor a mayor' },
  { value: 'precio-mayor', label: 'Precio: mayor a menor' },
]

function SortSelectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const current = searchParams.get('orden') ?? ''

  function onChange(value: string) {
    const p = new URLSearchParams(searchParams.toString())
    p.delete('pagina')
    if (value) p.set('orden', value)
    else p.delete('orden')
    const qs = p.toString()
    startTransition(() => router.push(qs ? `/explorar?${qs}` : '/explorar'))
  }

  return (
    <label className="sort-select" data-pending={isPending || undefined}>
      <span className="sort-select__label">Ordenar</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Ordenar resultados"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

export function SortSelect() {
  return (
    <Suspense fallback={<span className="sort-select" />}>
      <SortSelectInner />
    </Suspense>
  )
}
