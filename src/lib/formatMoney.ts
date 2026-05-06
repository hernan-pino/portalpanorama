import type { MoneyProps } from '@domain/shared/Money'

export function formatMoney(money: MoneyProps): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(money.amount)
}
