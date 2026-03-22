import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Button, Input, Card, CardContent, CardHeader, useToast, ToastContainer } from '@/components/design-system'

export default function Signup() {
  const router = useRouter()
  const { toasts, showToast, showError, dismissToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Simulate signup with localStorage
      const user = {
        name: formData.name,
        email: formData.email,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem('nurtura_user', JSON.stringify(user))
      showToast(`Welcome, ${formData.name}! Setting up your pregnancy profile...`)

      setTimeout(() => {
        router.push('/setup-pregnancy')
      }, 1500)
    } catch (err) {
      showError('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - NURTURA</title>
      </Head>

      <div className="min-h-screen nurtura-bg flex items-center justify-center py-12 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card variant="elevated">
            <CardHeader title="Welcome to NURTURA" subtitle="Create your account to get started" />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    error={errors.name}
                  />
                  {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    error={errors.email}
                  />
                  {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    error={errors.password}
                  />
                  {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    error={errors.confirmPassword}
                  />
                  {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  variant="primary"
                  fullWidth
                  size="lg"
                  className="mt-6"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              {/* Sign In Link */}
              <p className="text-center text-slate-600 mt-6 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>

              {/* Privacy Note */}
              <p className="text-xs text-slate-500 text-center mt-6 leading-relaxed">
                By signing up, you agree to our Privacy Policy and Terms of Service. Your data is protected.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
