import { defineConfig } from 'prisma/config'
import { loadEnvFile } from 'node:process'

try {
  loadEnvFile('.env.local')
} catch {
  // .env.local no existe en producción, ignorar
}

export default defineConfig({
  schema: 'src/infrastructure/db/prisma/schema.prisma',
  datasource: {
    // Las migraciones usan una conexión DIRECTA (sin pooler) si está disponible.
    // El pooler de Neon (PgBouncer) puede fallar con los locks de Prisma Migrate.
    // El runtime de la app sigue usando DATABASE_URL (pooled) vía src/lib/db.ts.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
