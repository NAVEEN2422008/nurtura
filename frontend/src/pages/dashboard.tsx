import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, CardHeader, Badge, useToast, ToastContainer, Skeleton } from '@/components/design-system'

export default function Dashboard() {
  const router = useRouter()
  const tDashboard = useTranslations('dashboard')
  const { toasts, dismissToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [pregnancyData, setPregnancyData] = useState<any>(null)
  const [userName, setUserName] = useState('Mom')

  // Simulate loading pregnancy data
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('nurtura_user')
      if (stored) {
        const user = JSON.parse(stored)
        setUserName(user.email?.split('@')[0] || 'Mom')
      }
      setPregnancyData({
        week: 24,
        trimester: 2,
        daysUntilDue: 133,
        riskLevel: 'green',
        riskScore: 15,
      })
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const week = pregnancyData?.week || 0
  const progress = Math.max(0, Math.min(100, (week / 40) * 100))

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

  if (loading) {
    return (
      <>
        <Head>
          <title>Dashboard - NURTURA</title>
        </Head>
        <div className="min-h-screen nurtura-bg p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton count={3} height="h-32" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{tDashboard('title')} - NURTURA</title>
      </Head>

      <div className="min-h-screen nurtura-bg pb-24 md:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-white/70">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">NURTURA</h1>
              <p className="text-sm text-slate-600 mt-1">Your Calm Care Companion</p>
            </div>
            <Button variant="ghost" onClick={() => {
              localStorage.removeItem('nurtura_user')
              router.push('/')
            }}>
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          className="max-w-6xl mx-auto px-4 md:px-8 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Greeting Card */}
          <motion.div variants={itemVariants}>
            <Card variant="default" className="mb-6 bg-gradient-to-br from-soft-mint to-soft-lavender">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900">
                      {tDashboard('greeting', { name: userName })} 
                    </h2>
                    <p className="text-slate-600 mt-1">{tDashboard('greetingSubtitle')}</p>
                  </div>
                  <div className="text-5xl md:text-7xl">👶</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pregnancy Progress Ring + Status */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Progress Ring */}
            <motion.div variants={itemVariants}>
              <Card variant="elevated">
                <CardHeader title={tDashboard('pregnancyProgress')} />
                <CardContent>
                  <div className="flex flex-col items-center gap-6 py-4">
                    {/* Ring */}
                    <div className="relative w-40 h-40">
                      <div
                        className="absolute inset-0 rounded-full flex items-center justify-center text-center"
                        style={{
                          background: `conic-gradient(#2f6f6d ${progress}%, rgba(226, 232, 240, 0.3) 0%)`,
                        }}
                      >
                        <div className="bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center">
                          <div className="text-3xl font-display font-bold text-primary">{week}</div>
                          <div className="text-xs text-slate-600">weeks</div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        {tDashboard('trimester', { trimester: pregnancyData?.trimester })}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {pregnancyData?.daysUntilDue} {tDashboard('daysUntilDue').split('{days}')[1]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Status Card */}
            <motion.div variants={itemVariants}>
              <Card variant="default" className={`border-2 ${
                pregnancyData?.riskLevel === 'green'
                  ? 'border-success/30 bg-success/5'
                  : pregnancyData?.riskLevel === 'yellow'
                    ? 'border-warning/30 bg-warning/5'
                    : 'border-danger/30 bg-danger/5'
              }`}>
                <CardHeader
                  title={tDashboard('statusCard')}
                  action={
                    <Badge
                      variant={
                        pregnancyData?.riskLevel === 'green'
                          ? 'success'
                          : pregnancyData?.riskLevel === 'yellow'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {pregnancyData?.riskLevel === 'green'
                        ? '✓ Low Risk'
                        : pregnancyData?.riskLevel === 'yellow'
                          ? '⚠ Monitor'
                          : '🚨 Alert'}
                    </Badge>
                  }
                />
                <CardContent>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pregnancyData?.riskLevel === 'green'
                      ? 'Your recent health tracking shows positive indicators. Continue with your regular prenatal care and listen to your body.'
                      : pregnancyData?.riskLevel === 'yellow'
                        ? 'We noticed some symptoms worth monitoring. If they persist, consult your provider soon.'
                        : 'We detected high-risk indicators. Please contact your healthcare provider immediately.'}
                  </p>

                  {pregnancyData?.riskScore && (
                    <div className="mt-4 p-3 bg-white/50 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">Risk Score</span>
                        <span className="text-slate-900 font-bold text-lg">{pregnancyData.riskScore}%</span>
                      </div>
                      <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            pregnancyData?.riskLevel === 'green'
                              ? 'bg-success'
                              : pregnancyData?.riskLevel === 'yellow'
                                ? 'bg-warning'
                                : 'bg-danger'
                          }`}
                          style={{ width: `${pregnancyData.riskScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-display font-bold text-slate-900 mb-4">{tDashboard('quickActions')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Link href="/symptom-checker">
                <Card variant="default" clickable className="h-full">
                  <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                    <span className="text-4xl">🩺</span>
                    <h4 className="font-semibold text-center text-slate-900">{tDashboard('checkSymptoms')}</h4>
                    <p className="text-xs text-slate-500 text-center">Log and track symptoms</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/ai-chat">
                <Card variant="default" clickable className="h-full">
                  <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                    <span className="text-4xl">💬</span>
                    <h4 className="font-semibold text-center text-slate-900">{tDashboard('talkToAssistant')}</h4>
                    <p className="text-xs text-slate-500 text-center">Ask your care companion</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/emergency">
                <Card variant="default" clickable className="h-full border-2 border-danger/20 bg-danger/5">
                  <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                    <span className="text-4xl">🚨</span>
                    <h4 className="font-semibold text-center text-danger">{tDashboard('emergencyHelp')}</h4>
                    <p className="text-xs text-slate-500 text-center">Get immediate help</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </motion.div>

          {/* Daily Tip */}
          <motion.div variants={itemVariants}>
            <Card variant="default" className="bg-gradient-to-r from-accent/10 to-primary/10">
              <CardHeader
                title={tDashboard('dailyTip')}
                action={<span className="text-2xl">💡</span>}
              />
              <CardContent>
                <p className="text-slate-700 leading-relaxed">
                  Stay hydrated throughout the day. Drink water consistently to support your circulation and help prevent common pregnancy discomforts. Aim for 8-10 glasses daily!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Safety Disclaimer */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-center">
              <p className="text-xs text-slate-600">
                ⓘ This dashboard is for informational support only and is not a substitute for professional medical advice.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

