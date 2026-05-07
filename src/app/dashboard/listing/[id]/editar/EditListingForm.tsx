'use client'
import { useActionState } from 'react'
import { updateListingAction } from './actions'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'

interface Category { id: string; name: string; slug: string }

interface ListingData {
  id: string
  name: string
  description?: string
  categoryId: string
  neighborhood: string
  address?: string
  phone?: string
  website?: string
  priceRange?: number
  status: string
  slug: string
}

export function EditListingForm({
  listing,
  categories,
}: {
  listing: ListingData
  categories: Category[]
}) {
  const [state, formAction, pending] = useActionState(updateListingAction, null)

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
      <input type="hidden" name="listingId" value={listing.id} />

      {state?.error && <ErrorAlert message={state.error} />}
      {state?.success && (
        <p style={{ color: 'var(--success)', fontSize: 'var(--t-body-sm)', padding: 'var(--s-3) var(--s-4)', background: 'color-mix(in oklab, var(--success) 8%, transparent)', borderRadius: 'var(--r-md)' }}>
          Cambios guardados correctamente.
        </p>
      )}

      <Field id="name" label="Nombre del lugar *" error={state?.fieldErrors?.name?.[0]}>
        <input id="name" name="name" type="text" required defaultValue={listing.name} className="input" />
      </Field>

      <Field id="description" label="Descripción" error={state?.fieldErrors?.description?.[0]}>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={listing.description}
          style={{ width: '100%', padding: 'var(--s-3) var(--s-4)', background: 'var(--bg-raised)', border: '1px solid var(--surface-line)', borderRadius: 'var(--r-md)', fontSize: 'var(--t-body)', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
        <Field id="categoryId" label="Categoría" error={state?.fieldErrors?.categoryId?.[0]}>
          <select id="categoryId" name="categoryId" defaultValue={listing.categoryId} className="input">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field id="neighborhood" label="Barrio" error={state?.fieldErrors?.neighborhood?.[0]}>
          <select id="neighborhood" name="neighborhood" defaultValue={listing.neighborhood} className="input">
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="address" label="Dirección" error={state?.fieldErrors?.address?.[0]}>
        <input id="address" name="address" type="text" defaultValue={listing.address} className="input" />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
        <Field id="phone" label="Teléfono" error={state?.fieldErrors?.phone?.[0]}>
          <input id="phone" name="phone" type="tel" defaultValue={listing.phone} className="input" />
        </Field>

        <Field id="priceRange" label="Rango de precio" error={state?.fieldErrors?.priceRange?.[0]}>
          <select id="priceRange" name="priceRange" defaultValue={listing.priceRange} className="input">
            <option value="">Sin especificar</option>
            <option value="1">$ Económico</option>
            <option value="2">$$ Moderado</option>
            <option value="3">$$$ Caro</option>
            <option value="4">$$$$ Muy caro</option>
          </select>
        </Field>
      </div>

      <Field id="website" label="Sitio web" error={state?.fieldErrors?.website?.[0]}>
        <input id="website" name="website" type="url" defaultValue={listing.website} placeholder="https://…" className="input" />
      </Field>

      <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-2)' }}>
        <button type="submit" disabled={pending} className="btn btn--primary" style={{ flex: 1, justifyContent: 'center' }}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <label htmlFor={id} style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>{label}</label>
      {children}
      {error && <p role="alert" style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)' }}>{error}</p>}
    </div>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <p role="alert" style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', padding: 'var(--s-3) var(--s-4)', background: 'color-mix(in oklab, var(--error) 8%, transparent)', borderRadius: 'var(--r-md)' }}>
      {message}
    </p>
  )
}
