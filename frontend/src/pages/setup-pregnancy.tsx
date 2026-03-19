import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { apiClient } from '@/services/api'
import { useAppStore } from '@/hooks/useStore'
import { useSession } from 'next-auth/react'

export default function SetupPregnancy() {
const router = useRouter()
  const { setPregnancy } = useAppStore()
  const { status } = useSession()
  const [formData, setFormData] = useState({
    lmp: '', // Last Menstrual Period (YYYY-MM-DD)
    riskFactors: [] as string[],
    chronicConditions: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status !== 'authenticated') {
    return null
  }

  const riskFactorOptions = [
    { id: 'age_under_20', label: 'Age under 20' },
    { id: 'age_over_35', label: 'Age over 35' },
    { id: 'previous_miscarriage', label: 'Previous miscarriage' },
    { id: 'previous_preeclampsia', label: 'Previous preeclampsia' },
    { id: 'multiple_pregnancy', label: 'Multiple pregnancy (twins/triplets)' },
    { id: 'obesity', label: 'BMI > 30 (Obesity)' },
  ]

  const chronicOptions = [
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hypertension', label: 'Hypertension' },
    { id: 'asthma', label: 'Asthma' },
    { id: 'anemia', label: 'Anemia' },
    { id: 'thyroid_disease', label: 'Thyroid disease' },
    { id: 'heart_disease', label: 'Heart disease' },
  ]

  const handleLmpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, lmp: e.target.value }))
  }

  const handleFactorToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      riskFactors: prev.riskFactors.includes(id)
        ? prev.riskFactors.filter((f) => f !== id)
        : [...prev.riskFactors, id],
    }))
  }

  const handleChronicToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(id)
        ? prev.chronicConditions.filter((c) => c !== id)
        : [...prev.chronicConditions, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.lmp) {
        throw new Error('Last Menstrual Period date is required')
      }

      // Calculate EDD: LMP + 280 days (standard obstetric calculation)
      const lmpDate = new Date(formData.lmp)
      const eddDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000)

      const response = await apiClient.createPregnancy({
        lmp: formData.lmp,
        edd: eddDate.toISOString().split('T')[0],
        riskFactors: formData.riskFactors,
        chronicConditions: formData.chronicConditions,
      })

      if (response.success) {
        setPregnancy(response.data)
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to create pregnancy'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Set Up Your Pregnancy – NURTURA</title>
      </Head>

      <main className="min-h-screen bg-soft-peach py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-rounded shadow-elevated p-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome to NURTURA</h1>
            <p className="text-gray-600 mb-8">
              Let&apos;s set up your pregnancy profile so we can provide personalized care guidance.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Last Menstrual Period */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Pregnancy Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Menstrual Period (LMP)
                  </label>
                  <input
                    type="date"
                    value={formData.lmp}
                    onChange={handleLmpChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used to calculate your pregnancy week and due date
                  </p>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Risk Factors (Optional)</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select any that apply to help us personalize your care
                </p>
                <div className="space-y-3">
                  {riskFactorOptions.map((option) => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.riskFactors.includes(option.id)}
                        onChange={() => handleFactorToggle(option.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Medical History (Optional)</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select any chronic conditions you have
                </p>
                <div className="space-y-3">
                  {chronicOptions.map((option) => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.chronicConditions.includes(option.id)}
                        onChange={() => handleChronicToggle(option.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="ml-3 text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all font-semibold"
              >
                {loading ? 'Setting up your pregnancy...' : 'Continue to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
