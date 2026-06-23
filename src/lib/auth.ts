import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'
import { prisma } from './db'

// Login con Google — CABLEADO PERO APAGADO hasta tener credenciales (regla MVP de
// CLAUDE.md: solo email+contraseña; Google es post-MVP). Se enciende solo cuando
// existen AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET en el entorno; mientras tanto el
// provider no se registra y el botón no se muestra.
export const googleAuthEnabled = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Contraseña', type: 'password' },
    },
    authorize: async (credentials) => {
      const email = credentials?.email as string | undefined
      const password = credentials?.password as string | undefined

      if (!email || !password) return null

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !user.passwordHash) return null

      const valid = await compare(password, user.passwordHash)
      if (!valid) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    },
  }),
]

if (googleAuthEnabled) {
  providers.push(Google({ allowDangerousEmailAccountLinking: true }))
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers,

  session: { strategy: 'jwt' },

  callbacks: {
    // Para OAuth (Google) garantizamos que exista una fila User en NUESTRA BD,
    // identificada por email (el resto de la app lee de ahí). Sin adapter de Prisma:
    // el upsert lo hacemos a mano. Usuarios OAuth no tienen passwordHash.
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true
      const email = user.email
      if (!email) return false
      const existing = await prisma.user.findUnique({ where: { email } })
      if (!existing) {
        await prisma.user.create({
          data: {
            id: createId(),
            email,
            name: user.name?.trim() || email.split('@')[0]!,
            role: 'USER',
          },
        })
      }
      return true
    },

    async jwt({ token, user, account, trigger }) {
      if (user) {
        if (account?.provider === 'google') {
          // user.id es el sub de Google, no nuestro id: resolvemos por email.
          const dbUser = user.email
            ? await prisma.user.findUnique({ where: { email: user.email }, select: { id: true, role: true } })
            : null
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
          }
        } else {
          token.id = user.id
          token.role = (user as { role: string }).role
        }
      } else if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role: string }).role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
})
