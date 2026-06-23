// MVP: correo de bienvenida + recuperar contraseña. Los correos de claims/
// suscripción/pagos vuelven con el self-service de negocios (post-MVP).
export interface EmailService {
  sendWelcome(to: string, name: string): Promise<void>
  sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void>
}
