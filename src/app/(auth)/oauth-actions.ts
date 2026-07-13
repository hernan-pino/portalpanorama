'use server'
import { signIn } from '@lib/auth'
import { safeCallbackUrl } from '@lib/safeCallbackUrl'

// OAuth se va del sitio y vuelve: el destino viaja en el form (input oculto) para que
// quien inicie sesión desde un flujo (ej: publicar tu negocio) aterrice de vuelta ahí
// y no en /explorar. `safeCallbackUrl` corta el open-redirect.
export async function signInWithGoogle(formData?: FormData) {
  const requested = formData?.get('redirectTo')
  const redirectTo = safeCallbackUrl(typeof requested === 'string' ? requested : null, '/explorar')
  await signIn('google', { redirectTo })
}
