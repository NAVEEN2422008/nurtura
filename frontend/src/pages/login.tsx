import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('Invalid email or password')
        return
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login – NURTURA</title>
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-soft-lavender py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-rounded shadow-elevated p-8">
            <h1 className="text-3xl font-bold text-center text-primary mb-8">NURTURA</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold"
              >
                Continue with Google
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Google sign-in appears once you set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
              </p>
            </div>

            <p className="text-center text-gray-600 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>

            <p className="text-center text-gray-500 text-xs mt-8 pt-6 border-t">
              Demo accounts (password: DemoPassword123!):
              <br />
              sarah.normal@demo.nurtura.app
              <br />
              priya.gdm@demo.nurtura.app
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
