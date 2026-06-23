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
  // sharp es un módulo nativo (libvips): no debe empaquetarse con el bundle del
  // server, sino cargarse desde node_modules en runtime. Sin esto, Next intenta
  // bundlearlo y falla al cargar el binario nativo en Vercel (linux-x64).
  serverExternalPackages: ['sharp'],
  experimental: {
    // Las server actions cortan el body en 1MB por defecto; la subida de imágenes
    // (foto cruda de teléfono) necesita más holgura que eso (ver uploadPlaceImageAction).
    serverActions: { bodySizeLimit: '16mb' },
  },
}

export default nextConfig
