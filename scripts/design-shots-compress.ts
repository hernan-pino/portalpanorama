// Comprime las capturas del paquete de Claude Design (PNG → JPEG).
// Las capturas de página completa en 2x pesan ~90 MB en total; subirlas así es inviable.
//   npx tsx scripts/design-shots-compress.ts

import sharp from 'sharp'
import { readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const RAIZ = 'design_briefs/claude_design/capturas'
// Ancho final: suficiente para leer el texto, sin el peso del 2x.
const ANCHO = { movil: 780, desktop: 1440 } as const

async function main() {
  let antes = 0
  let despues = 0
  for (const carpeta of ['movil', 'desktop'] as const) {
    const dir = join(RAIZ, carpeta)
    for (const archivo of readdirSync(dir).filter((f) => f.endsWith('.png'))) {
      const origen = join(dir, archivo)
      const destino = origen.replace(/\.png$/, '.jpg')
      antes += statSync(origen).size

      const img = sharp(origen)
      const { width = 0, height = 0 } = await img.metadata()
      // JPEG no admite más de 65.500px de alto: las páginas larguísimas se escalan.
      const escala = Math.min(1, ANCHO[carpeta] / width, 65_000 / height)

      await img
        .resize({ width: Math.round(width * escala) })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(destino)

      despues += statSync(destino).size
      unlinkSync(origen)
    }
  }
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`
  console.log(`✅ ${mb(antes)} → ${mb(despues)}`)
}

main()
