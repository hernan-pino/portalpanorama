// MVP: solo el correo de bienvenida al registrarse. Los correos de claims/
// suscripción/pagos vuelven con el self-service de negocios (post-MVP).
export interface EmailService {
  sendWelcome(to: string, name: string): Promise<void>
}
