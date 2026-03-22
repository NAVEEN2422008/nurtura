import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, CardHeader, useToast, ToastContainer } from '@/components/design-system'

const EMERGENCY_SYMPTOMS = [
  { id: 'bleeding-heavy', label: 'Heavy vaginal bleeding (soaking more than one pad per hour)', emoji: '🩸' },
  { id: 'chest-pain', label: 'Severe chest pain or difficulty breathing', emoji: '💔' },
  { id: 'severe-headache', label: 'Sudden severe headache with vision changes', emoji: '🤕' },
  { id: 'high-fever', label: 'High fever (>39°C/102.2°F)', emoji: '🌡️' },
  { id: 'abdominal-pain', label: 'Severe abdominal pain', emoji: '😣' },
  { id: 'water-break', label: 'Gushing fluid from vagina (may indicate water breaking)', emoji: '💧' },
  { id: 'no-movement', label: 'Baby not moving for 2+ hours', emoji: '🤰' },
  { id: 'loss-of-consciousness', label: 'Loss of consciousness or severe dizziness', emoji: '😵' },
  { id: 'severe-vomiting', label: 'Persistent severe vomiting (unable to keep fluids)', emoji: '🤮' },
  { id: 'suicidal-thoughts', label: 'Thoughts of self-harm (mental health crisis)', emoji: '⚠️' },
]

const SAFETY_TIPS = [
  'Tell someone trusted where you are going',
  'Bring this phone or a way to communicate',
  'Bring your pregnancy records if available',
  'Note any symptoms or changes noticed',
  'Ask for an interpreter if needed',
  'Trust your instincts - if something feels wrong, seek care',
]

export default function Emergency() {
  const { toasts, dismissToast } = useToast()

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    )
  }

  const handleCallEmergency = () => {
    // Store emergency record
    const emergencyRecord = {
      timestamp: new Date().toISOString(),
      symptoms: selectedSymptoms,
      action: 'Called Emergency',
    }
    localStorage.setItem('nurtura_emergency_log', JSON.stringify(emergencyRecord))
  }

  const handleShareLocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Location access granted - in real app, could send to emergency services
        },
        () => {
          // Location access denied
        }
      )
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  }

  return (
    <>
      <Head>
        <title>Emergency Help - NURTURA</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-danger/5 via-white to-danger/5 pb-24 md:pb-8">
        {/* Header - Critical Alert */}
        <motion.div
          className="sticky top-0 z-20 bg-danger text-white py-6 px-4 md:px-8 shadow-lg"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-4xl mb-2">🚨</div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Emergency Help</h1>
            <p className="text-white/90 mt-2">If you are in immediate danger or experiencing a medical emergency, call emergency services now.</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="max-w-3xl mx-auto px-4 md:px-8 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Emergency Contact - Prominent */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card variant="elevated" className="border-2 border-danger shadow-2xl">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-slate-600 mb-2 font-semibold">CALL EMERGENCY SERVICES</p>
                <div className="text-5xl md:text-6xl font-black text-danger mb-4">911</div>
                <Button
                  onClick={handleCallEmergency}
                  variant="danger"
                  fullWidth
                  size="lg"
                  className="text-lg py-4 mb-3 font-bold"
                >
                  Tap to Call 911
                </Button>
                <p className="text-xs text-slate-600 mt-3">
                  Tell the dispatcher: "I am pregnant and need medical help"
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Share Location */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card variant="default" className="border-2 border-danger/30">
              <CardContent className="py-6 text-center">
                <div className="text-3xl mb-3">📍</div>
                <h3 className="font-semibold text-slate-900 mb-2">Share Your Location</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Help emergency responders find you faster
                </p>
                <Button
                  onClick={handleShareLocation}
                  variant="secondary"
                  fullWidth
                  size="lg"
                >
                  Enable Location Sharing
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* What You're Experiencing - Symptoms */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card variant="default">
              <CardHeader
                title="What emergency symptoms are you experiencing?"
                subtitle="Select all that apply (for reference only)"
              />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {EMERGENCY_SYMPTOMS.map(symptom => (
                    <motion.button
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedSymptoms.includes(symptom.id)
                          ? 'border-danger bg-danger/10 text-danger'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-danger/30'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{symptom.emoji}</span>
                        <span className="text-sm font-medium">{symptom.label}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {selectedSymptoms.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-900">
                    ⚠️ You've selected {selectedSymptoms.length} critical symptom(s). Please seek emergency care immediately.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Safety Tips */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card variant="default">
              <CardHeader
                title="Before You Go"
                subtitle="Quick safety checklist"
              />
              <CardContent>
                <div className="space-y-3">
                  {SAFETY_TIPS.map((tip, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-4 items-start p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-900"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <span className="text-lg flex-shrink-0 min-w-[24px]">✓</span>
                      <p>{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Other Resources */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card variant="default">
              <CardHeader title="Other Resources" />
              <CardContent>
                <div className="space-y-3">
                  {/* Mental Health Crisis */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">🧠 Mental Health Crisis</h4>
                    <p className="text-sm text-slate-600 mb-3">If you're having thoughts of self-harm:</p>
                    <p className="font-semibold text-slate-900">Call 988 (Suicide & Crisis Lifeline)</p>
                    <p className="text-xs text-slate-600 mt-1">Available 24/7, free and confidential</p>
                  </div>

                  {/* Domestic Violence */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">❤️ Domestic Violence Support</h4>
                    <p className="text-sm text-slate-600 mb-3">If you're experiencing abuse:</p>
                    <p className="font-semibold text-slate-900">National DV Hotline: 1-800-799-7233</p>
                    <p className="text-xs text-slate-600 mt-1">Text START to 88788 (24/7 support)</p>
                  </div>

                  {/* OB Care */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">👨‍⚕️ OB/GYN On-Call</h4>
                    <p className="text-sm text-slate-600 mb-3">Call your obstetician or midwife's office.</p>
                    <p className="text-xs text-slate-600">Most have emergency nurse line available 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Message */}
          <motion.div variants={itemVariants} className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20 text-center">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-2">You Are Not Alone</h3>
            <p className="text-slate-700">
              Thousands of pregnant people experience complications. Emergency services are trained to help you. Your safety comes first.
            </p>
          </motion.div>

          {/* Return to Dashboard */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="secondary" fullWidth size="lg">
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="ghost" fullWidth size="lg">
                Home
              </Button>
            </Link>
          </motion.div>

          {/* Important Disclaimer */}
          <motion.div variants={itemVariants} className="mt-8 p-4 bg-slate-100 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 text-center font-semibold">
              🚨 IF THIS IS A TRUE EMERGENCY, CALL 911 OR LOCAL EMERGENCY SERVICES IMMEDIATELY DO NOT WAIT FOR THIS APP
            </p>
          </motion.div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}