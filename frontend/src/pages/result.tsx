import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, CardHeader, Badge, ToastContainer, useToast, Skeleton } from '@/components/design-system'

interface ResultData {
  symptoms: string[]
  duration: string
  severity: 'mild' | 'moderate' | 'severe'
  notes: string
  timestamp: string
  riskLevel: 'green' | 'yellow' | 'red'
}

const RISK_CONFIGS = {
  green: {
    emoji: '✅',
    title: 'Low Risk',
    color: 'success',
    message: 'Your symptoms suggest low risk. Click below to read what to do next.',
    actions: ['Continue regular prenatal check-ups', 'Stay hydrated and get rest', 'Monitor symptoms and track any changes', 'Reach out if symptoms worsen'],
  },
  yellow: {
    emoji: '⚠️',
    title: 'Monitor Closely',
    color: 'warning',
    message: 'We recommend monitoring these symptoms closely. Contact your provider if they persist.',
    actions: ['Schedule a call with your provider today', 'Keep a symptom journal', 'Rest and stay hydrated', 'Seek immediate care if symptoms worsen'],
  },
  red: {
    emoji: '🚨',
    title: 'Urgent - Contact Provider',
    color: 'danger',
    message: 'Your symptoms may need urgent attention. Please contact your provider immediately.',
    actions: ['Call your doctor or midwife now', 'Go to the nearest emergency room', 'If unavailable, call local emergency services (911)', 'Save this result to show your provider'],
  },
}

const SYMPTOM_LABELS: Record<string, string> = {
  nausea: 'Nausea',
  vomiting: 'Vomiting',
  fatigue: 'Fatigue',
  backache: 'Back pain',
  headache: 'Headache',
  swelling: 'Swelling',
  bleeding: 'Vaginal bleeding',
  cramping: 'Cramping',
  bp_increase: 'High BP symptoms',
  blood_sugar: 'Excessive thirst',
}

export default function Result() {
  const { toasts, dismissToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ResultData | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('nurtura_symptom_result')
      if (stored) {
        setResult(JSON.parse(stored))
      }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <>
        <Head>
          <title>Your Results - NURTURA</title>
        </Head>
        <div className="min-h-screen nurtura-bg p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton count={3} height="h-32" />
          </div>
        </div>
      </>
    )
  }

  if (!result) {
    return (
      <>
        <Head>
          <title>Your Results - NURTURA</title>
        </Head>
        <div className="min-h-screen nurtura-bg flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-md">
            <CardContent className="text-center py-8">
              <p className="text-slate-600 mb-6">No assessment results found. Please start with the symptom checker.</p>
              <Link href="/symptom-checker">
                <Button variant="primary" fullWidth>
                  Start Symptom Checker
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const config = RISK_CONFIGS[result.riskLevel]
  const severityEmoji = result.severity === 'mild' ? '😊' : result.severity === 'moderate' ? '😐' : '😟'

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <>
      <Head>
        <title>Your Results - NURTURA</title>
      </Head>

      <div className="min-h-screen nurtura-bg pb-24 md:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-white/70">
          <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900">Risk Assessment Results</h1>
              <p className="text-xs md:text-sm text-slate-600 mt-1">Analyzed {new Date(result.timestamp).toLocaleDateString()}</p>
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
          {/* Risk Level Card */}
          <motion.div variants={itemVariants}>
            <Card
              variant="elevated"
              className={`border-2 ${
                result.riskLevel === 'green'
                  ? 'border-success/30 bg-success/5'
                  : result.riskLevel === 'yellow'
                    ? 'border-warning/30 bg-warning/5'
                    : 'border-danger/30 bg-danger/5'
              }`}
            >
              <CardContent className="py-12 text-center">
                <div className="text-7xl mb-4">{config.emoji}</div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                  {config.title}
                </h2>
                <p className="text-slate-600 text-lg mb-4">{config.message}</p>
                <Badge
                  variant={config.color as any}
                  className="text-base py-2 px-4 inline-block"
                >
                  Assessment Time: {new Date(result.timestamp).toLocaleTimeString()}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Symptoms Summary */}
          <motion.div variants={itemVariants} className="mt-6">
            <Card variant="default">
              <CardHeader title="Your Reported Symptoms" />
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {result.symptoms.map(symptomId => (
                    <Badge key={symptomId} variant="secondary">
                      {SYMPTOM_LABELS[symptomId] || symptomId}
                    </Badge>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Severity Level</p>
                    <p className="text-lg mt-1">{severityEmoji} {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">Duration</p>
                    <p className="text-lg mt-1">
                      {result.duration === 'hours' ? 'Less than a few hours'
                        : result.duration === 'today' ? 'Started today'
                        : result.duration === '2_3_days' ? '2-3 days'
                        : result.duration === 'week' ? 'About a week'
                        : 'More than a week'}
                    </p>
                  </div>
                </div>

                {result.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-900 font-semibold mb-1">Your Notes:</p>
                    <p className="text-sm text-blue-900">{result.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommended Actions */}
          <motion.div variants={itemVariants} className="mt-6">
            <Card variant="default">
              <CardHeader title="What You Should Do" />
              <CardContent>
                <div className="space-y-3">
                  {config.actions.map((action, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <span className="text-lg font-bold text-primary flex-shrink-0 min-w-[28px]">
                        {index + 1}
                      </span>
                      <p className="text-slate-700">{action}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Resources  */}
          {result.riskLevel !== 'red' && (
            <motion.div variants={itemVariants} className="mt-6">
              <Card variant="default">
                <CardHeader title="More Support" />
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/ai-chat">
                      <Card variant="default" clickable>
                        <CardContent className="flex items-center justify-between py-4">
                          <div>
                            <h4 className="font-semibold text-slate-900">Talk to Your Care Companion</h4>
                            <p className="text-xs text-slate-600 mt-1">Ask questions about your symptoms</p>
                          </div>
                          <span className="text-2xl">💬</span>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/dashboard">
                      <Card variant="default" clickable>
                        <CardContent className="flex items-center justify-between py-4">
                          <div>
                            <h4 className="font-semibold text-slate-900">Return to Dashboard</h4>
                            <p className="text-xs text-slate-600 mt-1">View your pregnancy progress</p>
                          </div>
                          <span className="text-2xl">📊</span>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Emergency Action (for red only) */}
          {result.riskLevel === 'red' && (
            <motion.div variants={itemVariants} className="mt-6">
              <Link href="/emergency">
                <Button variant="primary" fullWidth size="lg" className="py-4 text-lg">
                  🚨 Get Emergency Help
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Medical Disclaimer */}
          <motion.div variants={itemVariants} className="mt-8 p-4 bg-slate-100 rounded-lg border border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              ⓘ This tool provides decision support only and is not a medical diagnosis. Always consult your healthcare provider. If you feel unsafe, seek emergency care immediately.
            </p>
          </motion.div>

          {/* New Assessment Button */}
          <motion.div variants={itemVariants} className="mt-6 flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="secondary" fullWidth>
                Dashboard
              </Button>
            </Link>
            <Link href="/symptom-checker" className="flex-1">
              <Button variant="primary" fullWidth>
                New Assessment
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
