import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'mother' | 'partner' | 'provider' | 'admin'
      language: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    role?: 'mother' | 'partner' | 'provider' | 'admin'
    language?: string
  }
}

