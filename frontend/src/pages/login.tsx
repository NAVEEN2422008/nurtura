import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button, Input, Card, CardContent, CardHeader, useToast, ToastContainer } from '@/components/design-system'

export default function Login() {
  const router = useRouter()
  const tAuth = useTranslations('auth')
  const { toasts, showToast, dismissToast, showError } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!email) newErrors.email = tAuth('emailRequired')
    if (!password || password.length < 8) newErrors.password = tAuth('passwordRequired')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // Mock login for demo - in production, call backend
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Store session
      localStorage.setItem('nurtura_user', JSON.stringify({ email, pregnancyId: 'demo_' + Date.now() }))
      showToast('Welcome back! 👋', { variant: 'success' })
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error) {
      showError(tAuth('invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>{tAuth('login')} - NURTURA</title>
        <meta name="description" content={tAuth('loginSubtitle')} />
      </Head>

      <div className="min-h-screen nurtura-bg flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card variant="elevated">
            <CardHeader title={tAuth('loginTitle')} subtitle={tAuth('loginSubtitle')} />
            
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-6">
                {/* Email */}
                <Input
                  type="email"
                  label={tAuth('email')}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: undefined })
                  }}
                  error={errors.email}
                  required
                />

                {/* Password */}
                <Input
                  type="password"
                  label={tAuth('password')}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors({ ...errors, password: undefined })
                  }}
                  error={errors.password}
                  required
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  width="full"
                  size="lg"
                  isLoading={loading}
                  disabled={loading}
                >
                  {loading ? tAuth('signingIn') : tAuth('signInButton')}
                </Button>
              </form>

              {/* Divider */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-sm text-slate-500">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  {tAuth('noAccount')}{' '}
                  <Link href="/signup" className="font-semibold text-primary hover:underline">
                    {tAuth('signUp')}
                  </Link>
                </p>
              </div>

              {/* Safety Message */}
              <div className="mt-6 p-4 bg-soft-mint/50 rounded-lg border border-primary/20">
                <p className="text-xs text-primary leading-relaxed">
                  💚 Your data is private & secure. We never share your personal information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

