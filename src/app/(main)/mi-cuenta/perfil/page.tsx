import { redirect } from 'next/navigation'

export default function PerfilPage() {
  redirect('/mi-cuenta?tab=perfil')
}
