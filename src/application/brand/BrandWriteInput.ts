// Forma de escritura de una marca (admin). Compartida por create y update; el form
// de presentation valida con Zod antes de llegar acá. La logoUrl ya viene
// rehospedada (la subida ocurre en presentation/infra, como en Place).
export interface BrandWriteInput {
  name: string
  logoUrl?: string
  description?: string
  website?: string
  instagram?: string
  socialLinks: { network: string; url: string }[]
}
