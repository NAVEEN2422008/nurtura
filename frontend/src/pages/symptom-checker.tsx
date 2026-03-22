import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, CardHeader, Badge, useToast, ToastContainer, SeverityScale } from '@/components/design-system'


type Step = 1 | 2 | 3 | 4

interface SymptomState {
  symptoms: string[]
  duration: string
  severity: 'mild' | 'moderate' | 'severe' | ''
  notes: string
}

const SYMPTOM_OPTIONS = [
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'vomiting', label: 'Vomiting', emoji: '🤮' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'backache', label: 'Back pain', emoji: '🙁' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'swelling', label: 'Swelling', emoji: '🫨' },
  { id: 'bleeding', label: 'Vaginal bleeding', emoji: '⚠️' },
  { id: 'cramping', label: 'Cramping', emoji: '😣' },
  { id: 'bp_increase', label: 'High BP symptoms', emoji: '💫' },
  { id: 'blood_sugar', label: 'Excessive thirst', emoji: '💧' },
]

const DURATION_OPTIONS = [
  { id: 'hours', label: 'Less than a few hours' },
  { id: 'today', label: 'Started today' },
  { id: '2_3_days', label: '2-3 days' },
  { id: 'week', label: 'About a week' },
  { id: 'longer', label: 'More than a week' },
]

export default function SymptomChecker() {
  const router = useRouter()
  const { toasts, showToast, showError, dismissToast } = useToast()

  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<SymptomState>({
    symptoms: [],
    duration: '',
    severity: '',
    notes: '',
  })

  const progress = (step / 4) * 100

  const handleSymptomToggle = (symptomId: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId],
    }))
  }

  const handleNext = () => {
    if (step === 1 && formData.symptoms.length === 0) {
      showError('Please select at least one symptom')
      return
    }
    if (step === 2 && !formData.duration) {
      showError('Please select how long you\'ve had these symptoms')
      return
    }
    if (step === 3 && !formData.severity) {
      showError('Please rate the severity of your symptoms')
      return
    }
    if (step < 4) {
      setStep((step + 1) as Step)
    }
  }

  const handleSubmit = async () => {
    showToast('Analyzing your symptoms...')
    // Simulate analysis with a delay
    setTimeout(() => {
      // Store result data
      const result = {
        symptoms: formData.symptoms,
        duration: formData.duration,
        severity: formData.severity,
        notes: formData.notes,
        timestamp: new Date().toISOString(),
        riskLevel: formData.symptoms.includes('bleeding') ? 'red' : formData.symptoms.includes('bp_increase') ? 'yellow' : 'green',
      }
      localStorage.setItem('nurtura_symptom_result', JSON.stringify(result))
      router.push('/result')
    }, 1500)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  }

  return (
    <>
      <Head>
        <title>Symptom Checker - NURTURA</title>
      </Head>

      <div className="min-h-screen nurtura-bg pb-24 md:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-white/70">
          <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900">Symptom Checker</h1>
              <p className="text-xs md:text-sm text-slate-600 mt-1">Step {step} of 4</p>
            </div>
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={() => setStep((step - 1) as Step)}>
                ← Back
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="sticky top-16 z-20 bg-white/50 backdrop-blur border-b border-white/70">
          <div className="max-w-2xl mx-auto px-4 md:px-8 py-3">
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          className="max-w-2xl mx-auto px-4 md:px-8 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Step 1: Select Symptoms */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated">
                <CardHeader
                  title="What symptoms are you experiencing?"
                  subtitle="Select all that apply"
                />
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {SYMPTOM_OPTIONS.map(symptom => (
                      <motion.button
                        key={symptom.id}
                        onClick={() => handleSymptomToggle(symptom.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          formData.symptoms.includes(symptom.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-primary/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="block text-lg mb-1">{symptom.emoji}</span>
                        <span>{symptom.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 mb-6">
                    📝 Selected: {formData.symptoms.length > 0 ? formData.symptoms.length : 'None yet'}
                  </div>

                  <Button onClick={handleNext} fullWidth variant="primary" size="lg">
                    Continue →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated">
                <CardHeader
                  title="How long have you had these symptoms?"
                  subtitle="This helps us understand severity"
                />
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {DURATION_OPTIONS.map(duration => (
                      <motion.button
                        key={duration.id}
                        onClick={() => setFormData(prev => ({ ...prev, duration: duration.id }))}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left font-medium ${
                          formData.duration === duration.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-primary/30'
                        }`}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {duration.label}
                      </motion.button>
                    ))}
                  </div>

                  <Button onClick={handleNext} fullWidth variant="primary" size="lg">
                    Continue →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Severity */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated">
                <CardHeader
                  title="How severe are your symptoms?"
                  subtitle="Rate them from mild to severe"
                />
                <CardContent>
                  <div className="py-6 mb-6">
                    <SeverityScale
                      value={formData.severity}
                      onChange={(severity) => setFormData(prev => ({ ...prev, severity }))}
                    />
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-900 mb-6">
                    ⚠️ If your symptoms are severe or you feel unsafe, skip this step and go to Emergency Help.
                  </div>

                  <Button onClick={handleNext} fullWidth variant="primary" size="lg">
                    Continue →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated">
                <CardHeader
                  title="Review your symptoms"
                  subtitle="Make sure everything looks correct"
                />
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {/* Symptoms Summary */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">Symptoms selected:</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.symptoms.map(symptomId => {
                          const symptom = SYMPTOM_OPTIONS.find(s => s.id === symptomId)
                          return (
                            <Badge key={symptomId} variant="secondary">
                              {symptom?.emoji} {symptom?.label}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    {/* Duration Summary */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">Duration:</h4>
                      <p className="text-slate-600">
                        {DURATION_OPTIONS.find(d => d.id === formData.duration)?.label}
                      </p>
                    </div>

                    {/* Severity Summary */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-2">Severity:</h4>
                      <p className="text-slate-600 capitalize">
                        {formData.severity === 'mild'
                          ? '😊 Mild'
                          : formData.severity === 'moderate'
                            ? '😐 Moderate'
                            : '😟 Severe'}
                      </p>
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Additional notes (optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any other details you want to share?"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => setStep(3)} variant="secondary" size="lg">
                      Edit
                    </Button>
                    <Button onClick={handleSubmit} variant="primary" size="lg">
                      Analyze →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Safety Disclaimer */}
          <motion.div
            variants={itemVariants}
            className="mt-8 p-4 bg-slate-100 rounded-lg border border-slate-200 text-center"
          >
            <p className="text-xs text-slate-600">
              ⓘ This tool is for information only and not a substitute for professional medical advice. Always consult your healthcare provider.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}




