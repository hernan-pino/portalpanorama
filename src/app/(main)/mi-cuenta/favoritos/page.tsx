import { redirect } from 'next/navigation'

export default function FavoritosPage() {
  redirect('/mi-cuenta?tab=guardados')
}
