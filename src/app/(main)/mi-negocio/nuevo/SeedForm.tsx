'use client'
import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { createOwnedPlaceSeedAction } from './actions'
import { trackEvent } from '@lib/analytics'

const ROLES = ['Dueño/a', 'Representante legal', 'Encargado/a o administrador/a']

export interface CategoryOption {
  id: string
  name: string
  subcategories: { id: string; name: string }[]
}
export interface CommuneOption {
  id: string
  name: string
}

// Paso 2 del wizard (form-semilla): lo mínimo que el dueño sabe de memoria. La ficha
// final la arma el admin (fotos, descripción, tags, reputación) antes de publicarla —
// por eso acá no se piden. Ver BUSINESS_ACCOUNTS_SPEC §6.
export function SeedForm({
  categories,
  communes,
  onDone,
}: {
  categories: CategoryOption[]
  communes: CommuneOption[]
  onDone: () => void
}) {
  const [categoryId, setCategoryId] = useState('')
  const [suggestingCategory, setSuggestingCategory] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<{ message: string; duplicate?: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()

  const subcategories = useMemo(
    () => categories.find((c) => c.id === categoryId)?.subcategories ?? [],
    [categories, categoryId],
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await createOwnedPlaceSeedAction(formData)
      if ('error' in res) {
        setError({ message: res.error, duplicate: res.duplicate })
        return
      }
      trackEvent('crear_ficha_negocio', {})
      onDone()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', maxWidth: 560 }}
    >
      <div>
        <label className="form-label" htmlFor="seed-name">Nombre del negocio</label>
        <input
          id="seed-name"
          name="name"
          className="form-input"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Café Altura"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="seed-address">Dirección</label>
        <input
          id="seed-address"
          name="address"
          className="form-input"
          required
          maxLength={200}
          placeholder="Ej: Av. Italia 1234, local 2"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="seed-commune">Comuna</label>
        <select id="seed-commune" name="communeId" className="form-input" required defaultValue="">
          <option value="" disabled>Elige la comuna</option>
          {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="seed-category">Categoría</label>
        <select
          id="seed-category"
          name="categoryId"
          className="form-input"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="" disabled>Elige la categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="seed-subcategory">Rubro</label>
        <select
          id="seed-subcategory"
          name="subcategoryId"
          className="form-input"
          required
          defaultValue=""
          disabled={!categoryId}
          key={categoryId}
        >
          <option value="" disabled>{categoryId ? 'Elige el rubro' : 'Elige primero la categoría'}</option>
          {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <p className="form-hint">
          Elige el más parecido. ¿Ninguno calza?{' '}
          <button
            type="button"
            className="wizard-panel__switch"
            onClick={() => setSuggestingCategory(true)}
            hidden={suggestingCategory}
          >
            Propón el tuyo
          </button>
        </p>
      </div>

      {/* El catálogo lo controla el admin, así que la propuesta no crea el rubro: viaja
          con la solicitud y él decide si tiene sentido abrirlo. */}
      {suggestingCategory && (
        <div>
          <label className="form-label" htmlFor="seed-suggestion">¿Cuál es tu rubro?</label>
          <input
            id="seed-suggestion"
            name="categorySuggestion"
            className="form-input"
            maxLength={80}
            placeholder="Ej: cervecería artesanal"
          />
          <p className="form-hint">
            Lo revisamos: si tiene sentido, lo agregamos al catálogo y lo usamos en tu ficha.
            Mientras tanto queda el rubro que elegiste arriba.
          </p>
        </div>
      )}

      <div>
        <label className="form-label" htmlFor="seed-role">¿Cuál es tu rol en el negocio?</label>
        <select id="seed-role" name="role" className="form-input" defaultValue={ROLES[0]}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="seed-phone">Teléfono</label>
        <input id="seed-phone" name="phone" type="tel" className="form-input" maxLength={40} placeholder="+56 9 …" />
      </div>

      <div>
        <label className="form-label" htmlFor="seed-instagram">Instagram</label>
        <input id="seed-instagram" name="instagram" className="form-input" maxLength={120} placeholder="@tunegocio" />
        <p className="form-hint">Déjanos al menos uno de los dos: nos sirve para verificar que el negocio es tuyo.</p>
      </div>

      <div className="claim-verify">
        <p className="claim-verify__title">Qué pasa al enviar</p>
        <ol className="wizard-next wizard-next--compact">
          <li><strong>Armamos tu ficha</strong> con fotos, descripción, horario y cómo llegar.</li>
          <li><strong>Te pedimos un mensaje</strong> desde el Instagram o el correo oficial de tu local, para confirmar que es tuyo.</li>
          <li><strong>La publicamos</strong> y la editas desde tu panel. Revisamos a mano: puede tardar unos días.</li>
        </ol>
      </div>

      {error && (
        <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
          {error.message}{' '}
          {error.duplicate && (
            <Link href={`/explorar?q=${encodeURIComponent(name)}`}>Buscar mi local</Link>
          )}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Enviando…' : 'Enviar mi negocio'}
        </button>
        <Link href="/para-negocios" className="btn btn--ghost">Cancelar</Link>
      </div>

      <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
        Publicar tu negocio es gratis. Usaremos estos datos para armar tu ficha y verificar tu
        vínculo con el negocio (<Link href="/privacidad">privacidad</Link>).
      </p>
    </form>
  )
}
