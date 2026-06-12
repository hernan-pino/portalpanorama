import type { NextConfig } from 'next'
import { ALLOWED_IMAGE_HOSTS } from './src/lib/imageHosts'

const nextConfig: NextConfig = {
  images: {
    // Derivado de la lista única en src/lib/imageHosts.ts (el form de admin
    // valida contra la misma lista al guardar imágenes).
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
    })),
  },
}

export default nextConfig
