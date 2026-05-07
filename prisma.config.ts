import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'src/infrastructure/db/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
