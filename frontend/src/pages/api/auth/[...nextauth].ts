import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
// import GoogleProvider from 'next-auth/providers/google'

// import { getSupabaseAdmin } from '@/lib/supabase/admin'
// import bcrypt from 'bcryptjs'

type AppUser = {
  id: string
  email: string
  name: string | null
  role: 'mother' | 'partner' | 'provider' | 'admin'
  language: string
}

async function getUserByBackend(email: string, password: string): Promise<AppUser | null> {
  try {
    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await resp.json()
    if (resp.ok && data.success) {
      return {
        id: data.data.userId,
        email: data.data.email,
        name: data.data.name,
        role: data.data.role,
        language: data.data.language,
      }
    }
    return null
  } catch {
    return null
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password
        if (!email || !password) return null

        return await getUserByBackend(email, password)
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return !!user
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string
        token.role = ((user as any).role as 'mother' | 'partner' | 'provider' | 'admin') || 'mother'
        token.language = (user as any).language || 'en'
        token.name = (user as any).name
        token.email = (user as any).email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as 'mother' | 'partner' | 'provider' | 'admin'
        session.user.language = token.language as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-prod',
}

export default NextAuth(authOptions)
