import { StepIndicator } from './StepIndicator'

export default function ListarMiLocalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="checkout-shell">
      <div className="container">
        <p className="checkout-eyebrow">Checkout</p>
        <StepIndicator />
        {children}
      </div>
    </div>
  )
}
