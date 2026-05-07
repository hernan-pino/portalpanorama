'use client'
import { useActionState } from 'react'
import { createListingAction } from './actions'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'

interface Category {
  id: string
  name: string
  slug: string
}

export function CreateListingForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createListingAction, null)

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
      {state?.error && <ErrorAlert message={state.error} />}

      <Field id="name" label="Nombre del lugar *" error={state?.fieldErrors?.name?.[0]}>
        <input id="name" name="name" type="text" required placeholder="Ej: Café Río" className="input" />
      </Field>

      <Field id="description" label="Descripción" error={state?.fieldErrors?.description?.[0]}>
        <textarea
          id="description"
          name="description"
          placeholder="Contá brevemente de qué se trata el lugar…"
          rows={4}
          style={{
            width: '100%',
            padding: 'var(--s-3) var(--s-4)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--surface-line)',
            borderRadius: 'var(--r-md)',
            fontSize: 'var(--t-body)',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
        <Field id="categoryId" label="Categoría *" error={state?.fieldErrors?.categoryId?.[0]}>
          <select id="categoryId" name="categoryId" required className="input">
            <option value="">Seleccioná…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field id="neighborhood" label="Barrio *" error={state?.fieldErrors?.neighborhood?.[0]}>
          <select id="neighborhood" name="neighborhood" required className="input">
            <option value="">Seleccioná…</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="address" label="Dirección" error={state?.fieldErrors?.address?.[0]}>
        <input id="address" name="address" type="text" placeholder="Ej: Loreto 123, Providencia" className="input" />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
        <Field id="phone" label="Teléfono" error={state?.fieldErrors?.phone?.[0]}>
          <input id="phone" name="phone" type="tel" placeholder="+56 9 1234 5678" className="input" />
        </Field>

        <Field id="priceRange" label="Rango de precio" error={state?.fieldErrors?.priceRange?.[0]}>
          <select id="priceRange" name="priceRange" className="input">
            <option value="">Sin especificar</option>
            <option value="1">$ Económico</option>
            <option value="2">$$ Moderado</option>
            <option value="3">$$$ Caro</option>
            <option value="4">$$$$ Muy caro</option>
          </select>
        </Field>
      </div>

      <Field id="website" label="Sitio web" error={state?.fieldErrors?.website?.[0]}>
        <input id="website" name="website" type="url" placeholder="https://…" className="input" />
      </Field>

      <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-2)' }}>
        <button
          type="submit"
          disabled={pending}
          className="btn btn--primary"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {pending ? 'Creando…' : 'Crear listing'}
        </button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <label htmlFor={id} style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      style={{
        color: 'var(--error)',
        fontSize: 'var(--t-body-sm)',
        padding: 'var(--s-3) var(--s-4)',
        background: 'color-mix(in oklab, var(--error) 8%, transparent)',
        borderRadius: 'var(--r-md)',
      }}
    >
      {message}
    </p>
  )
}
