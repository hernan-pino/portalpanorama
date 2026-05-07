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
    url: process.env.DATABASE_URL,
  },
})
