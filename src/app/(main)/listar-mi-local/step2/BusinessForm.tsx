'use client'

import { useActionState } from 'react'
import { createBusinessAction, CreateBusinessState } from '../actions'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'

interface Category { id: string; name: string }

export function BusinessForm({ plan, categories }: { plan: string; categories: Category[] }) {
  const [state, action, pending] = useActionState<CreateBusinessState, FormData>(
    createBusinessAction,
    {},
  )

  return (
    <form action={action} className="business-form">
      <input type="hidden" name="plan" value={plan} />

      {state.error && (
        <div className="form-error-banner">{state.error}</div>
      )}

      <div className="form-row">
        <label className="form-label" htmlFor="name">
          Nombre del negocio <span aria-hidden>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="form-input"
          placeholder="Ej: Café Lastarria"
          required
          maxLength={100}
        />
        {state.fieldErrors?.name && (
          <p className="form-field-error">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="categoryId">
          Categoría <span aria-hidden>*</span>
        </label>
        <select id="categoryId" name="categoryId" className="form-input" required>
          <option value="">Selecciona una categoría</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {state.fieldErrors?.categoryId && (
          <p className="form-field-error">{state.fieldErrors.categoryId[0]}</p>
        )}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="neighborhood">
          Barrio <span aria-hidden>*</span>
        </label>
        <select id="neighborhood" name="neighborhood" className="form-input" required>
          <option value="">Selecciona un barrio</option>
          {NEIGHBORHOODS.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        {state.fieldErrors?.neighborhood && (
          <p className="form-field-error">{state.fieldErrors.neighborhood[0]}</p>
        )}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          className="form-input"
          rows={3}
          maxLength={500}
          placeholder="Cuéntanos sobre tu negocio..."
        />
      </div>

      <div className="form-grid-2">
        <div className="form-row">
          <label className="form-label" htmlFor="address">Dirección</label>
          <input id="address" name="address" type="text" className="form-input" maxLength={200} />
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="phone">Teléfono</label>
          <input id="phone" name="phone" type="tel" className="form-input" maxLength={20} placeholder="+56 9 1234 5678" />
        </div>
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="website">Sitio web</label>
        <input id="website" name="website" type="url" className="form-input" placeholder="https://..." />
        {state.fieldErrors?.website && (
          <p className="form-field-error">{state.fieldErrors.website[0]}</p>
        )}
      </div>

      <button type="submit" className="btn btn--primary btn--lg" style={{ width: '100%' }} disabled={pending}>
        {pending ? 'Creando tu ficha...' : 'Continuar →'}
      </button>
    </form>
  )
}
