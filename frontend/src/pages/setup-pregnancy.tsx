import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, Input, useToast, ToastContainer } from '@/components/design-system'

interface PregnancyData {
  pregnancyStatus: 'planning' | 'early' | 'active'
  eddOrLmp: string
  eddLmpType: 'edd' | 'lmp'
  weekCount: number
  medicalHistory: string[]
  allergies: string
  medications: string
  contacts: {
    primaryContact: string
    emergencyContact: string
    emergencyPhone: string
  }
}

const medicalHistoryOptions = [
  'Gestational diabetes',
  'High blood pressure',
  'Thyroid disorders',
  'PCOS',
  'Previous miscarriage',
  'Previous preterm birth',
  'Anemia',
  'Asthma',
  'Depression/Anxiety',
  'No significant history',
]

export default function SetupPregnancy() {
  const router = useRouter()
  const { toasts, showToast, dismissToast } = useToast()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PregnancyData>({
    pregnancyStatus: 'active',
    eddOrLmp: '',
    eddLmpType: 'edd',
    weekCount: 0,
    medicalHistory: [],
    allergies: '',
    medications: '',
    contacts: {
      primaryContact: '',
      emergencyContact: '',
      emergencyPhone: '',
    },
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const calculateWeeks = (dateStr: string, isLmp: boolean) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const weeks = isLmp ? Math.floor(diffDays / 7) : 40 - Math.floor(diffDays / 7)
    return Math.max(0, weeks)
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!data.eddOrLmp) newErrors.date = 'Please enter a date'
      if (data.medicalHistory.length === 0) newErrors.medical = 'Please select at least one option'
    } else if (currentStep === 2) {
      if (!data.allergies && !data.medications) {
        newErrors.health = 'Please fill at least one field'
      }
    } else if (currentStep === 3) {
      if (!data.contacts.primaryContact) newErrors.primary = 'Primary contact name is required'
      if (!data.contacts.emergencyContact) newErrors.emergency = 'Emergency contact name is required'
      if (!data.contacts.emergencyPhone) newErrors.phone = 'Emergency phone is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value
    setData(prev => ({
      ...prev,
      eddOrLmp: dateStr,
      weekCount: calculateWeeks(dateStr, prev.eddLmpType === 'lmp'),
    }))
    setErrors(prev => ({ ...prev, date: '' }))
  }

  const handleMedicalHistoryToggle = (option: string) => {
    setData(prev => {
      const updated = prev.medicalHistory.includes(option)
        ? prev.medicalHistory.filter(h => h !== option)
        : [...prev.medicalHistory, option]
      return { ...prev, medicalHistory: updated }
    })
    setErrors(prev => ({ ...prev, medical: '' }))
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('nurtura_pregnancy_data', JSON.stringify(data))
      showToast('Pregnancy data saved successfully!', { variant: 'success' })
      setTimeout(() => router.push('/dashboard'), 800)
    } catch (error) {
      showToast('Error saving pregnancy data', { variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const stepIndicators = [1, 2, 3]

  return (
    <>
      <Head>
        <title>Setup Pregnancy - NURTURA</title>
        <meta name="description" content="Complete your pregnancy profile" />
      </Head>

      <div className="min-h-screen nurtura-bg pb-24 md:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-white/70">
          <div className="max-w-2xl mx-auto px-4 md:px-8 py-4">
            <h1 className="text-2xl font-display font-bold text-slate-900">Pregnancy Setup</h1>
            <p className="text-sm text-slate-600 mt-1">Let's get to know your pregnancy better</p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
          <div className="flex justify-between mb-8">
            {stepIndicators.map((s) => (
              <motion.div
                key={s}
                className={`flex flex-col items-center flex-1 ${s === step ? '' : 'opacity-50'}`}
                animate={{ opacity: s === step ? 1 : 0.5 }}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                    s <= step
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s}
                </div>
                <span className="text-xs text-slate-600 text-center">
                  {s === 1 ? 'Pregnancy Details' : s === 2 ? 'Medical Info' : 'Contacts'}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Form Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="elevated">
              <CardContent className="pt-6">
                {/* Step 1: Pregnancy Details */}
                {step === 1 && (
                  <motion.div
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        When is your due date or last period?
                      </label>
                      <div className="flex gap-3 mb-3">
                        <button
                          onClick={() =>
                            setData(prev => ({
                              ...prev,
                              eddLmpType: 'edd',
                            }))
                          }
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                            data.eddLmpType === 'edd'
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Due Date (EDD)
                        </button>
                        <button
                          onClick={() =>
                            setData(prev => ({
                              ...prev,
                              eddLmpType: 'lmp',
                            }))
                          }
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                            data.eddLmpType === 'lmp'
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Last Period (LMP)
                        </button>
                      </div>
                      <Input
                        type="date"
                        value={data.eddOrLmp}
                        onChange={handleDateChange}
                        error={errors.date}
                      />
                      {errors.date && (
                        <p className="text-sm text-danger mt-2">{errors.date}</p>
                      )}
                      {data.eddOrLmp && (
                        <p className="text-sm text-slate-600 mt-3">
                          📅 You are approximately <span className="font-semibold">{data.weekCount} weeks</span> into
                          your pregnancy
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Medical History (Select all that apply)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {medicalHistoryOptions.map((option) => (
                          <motion.button
                            key={option}
                            onClick={() => handleMedicalHistoryToggle(option)}
                            className={`p-3 rounded-lg text-sm font-semibold transition-all text-left ${
                              data.medicalHistory.includes(option)
                                ? 'bg-primary text-white shadow-lg'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                      {errors.medical && (
                        <p className="text-sm text-danger mt-2">{errors.medical}</p>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: Medical Info */}
                {step === 2 && (
                  <motion.div
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Allergies</label>
                      <textarea
                        placeholder="Enter any known allergies (medications, foods, etc.)"
                        value={data.allergies}
                        onChange={(e) => {
                          setData(prev => ({ ...prev, allergies: e.target.value }))
                          setErrors(prev => ({ ...prev, health: '' }))
                        }}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                        rows={3}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Current Medications</label>
                      <textarea
                        placeholder="List any medications you're currently taking"
                        value={data.medications}
                        onChange={(e) => {
                          setData(prev => ({ ...prev, medications: e.target.value }))
                          setErrors(prev => ({ ...prev, health: '' }))
                        }}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                        rows={3}
                      />
                    </motion.div>

                    {errors.health && (
                      <div className="p-4 bg-danger/10 rounded-lg border border-danger/20">
                        <p className="text-sm text-danger font-semibold">{errors.health}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Emergency Contacts */}
                {step === 3 && (
                  <motion.div
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Primary Contact Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Partner name, mother, etc."
                        value={data.contacts.primaryContact}
                        onChange={(e) => {
                          setData(prev => ({
                            ...prev,
                            contacts: { ...prev.contacts, primaryContact: e.target.value },
                          }))
                          setErrors(prev => ({ ...prev, primary: '' }))
                        }}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                      />
                      {errors.primary && (
                        <p className="text-sm text-danger mt-2">{errors.primary}</p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Emergency Contact Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Sister, friend, etc."
                        value={data.contacts.emergencyContact}
                        onChange={(e) => {
                          setData(prev => ({
                            ...prev,
                            contacts: { ...prev.contacts, emergencyContact: e.target.value },
                          }))
                          setErrors(prev => ({ ...prev, emergency: '' }))
                        }}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                      />
                      {errors.emergency && (
                        <p className="text-sm text-danger mt-2">{errors.emergency}</p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Emergency Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Include country code (e.g., +91...)"
                        value={data.contacts.emergencyPhone}
                        onChange={(e) => {
                          setData(prev => ({
                            ...prev,
                            contacts: { ...prev.contacts, emergencyPhone: e.target.value },
                          }))
                          setErrors(prev => ({ ...prev, phone: '' }))
                        }}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                      />
                      {errors.phone && (
                        <p className="text-sm text-danger mt-2">{errors.phone}</p>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <Button
                variant="ghost"
                size="lg"
                fullWidth={false}
                onClick={() => (step > 1 ? setStep(step - 1) : router.push('/'))}
              >
                {step === 1 ? 'Skip' : 'Back'}
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleNext}
                isLoading={loading}
                disabled={loading}
              >
                {step === 3 ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </motion.div>
        </div>

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </>
  )
}

