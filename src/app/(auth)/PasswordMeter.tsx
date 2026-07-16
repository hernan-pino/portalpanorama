'use client'
import { evaluatePassword } from '@domain/user/PasswordPolicy'

const METER_COLORS = [
  'var(--error)',
  'var(--error)',
  'var(--warn)',
  'var(--ok)',
  'var(--ok)',
]

export function PasswordMeter({ password }: { password: string }) {
  if (!password) return null
  const { score, label, issues } = evaluatePassword(password)
  const color = METER_COLORS[score]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }} aria-live="polite">
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              height: '4px',
              flex: 1,
              borderRadius: '2px',
              background: i < score ? color : 'color-mix(in oklab, var(--ink-100) 12%, transparent)',
              transition: 'background 150ms',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 'var(--t-body-sm)', color, fontWeight: 500 }}>
        {label}
        {issues.length > 0 && (
          <span style={{ color: 'var(--ink-60, #6b6b6b)', fontWeight: 400 }}>
            {' '}
            · Falta: {issues.join(', ').toLowerCase()}
          </span>
        )}
      </p>
    </div>
  )
}
