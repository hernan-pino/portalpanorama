// Correos transaccionales: bienvenida, recuperar contraseña y el ciclo de reclamo
// de ficha (recibido / aprobado / rechazado — decisión s28: la revisión del admin
// nunca es un hoyo negro). Los correos de suscripción/pagos vuelven en Fase C.
export interface EmailService {
  sendWelcome(to: string, name: string): Promise<void>
  sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void>
  sendClaimReceived(to: string, name: string, targetName: string): Promise<void>
  sendClaimApproved(to: string, name: string, targetName: string): Promise<void>
  sendClaimRejected(to: string, name: string, targetName: string, reason?: string): Promise<void>
}
