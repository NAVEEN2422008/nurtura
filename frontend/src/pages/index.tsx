import React from 'react'
import Head from 'next/head'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  const tApp = useTranslations('app')
  const tLanding = useTranslations('landing')
  const tAuth = useTranslations('auth')

  const safetySteps = [
    {
      step: '01',
      title: tLanding('structuredInput'),
      body: tLanding('featuresDetails.0') || 'Pick symptoms, severity, and duration to avoid ambiguity.',
    },
    {
      step: '02',
      title: tLanding('deterministicRiskRules'),
      body: tLanding('featuresDetails.1') || 'Clear green/yellow/red outcomes with next steps.',
    },
    {
      step: '03',
      title: tLanding('features.aiDoulaSupport'),
      body: tLanding('featuresDetails.2') || 'Empathy + explanation + action, always with disclaimer.',
    },
  ]

  const featureGridData = [
    {
      icon: '🧑‍⚕️',
      title: tLanding('features.careBetweenVisits'),
      body: tLanding('featuresDetails.3') || 'Capture symptoms quickly and keep a safe timeline for your provider.',
    },
    {
      icon: '🩺',
      title: tLanding('features.guidedSymptomChecks'),
      body: tLanding('featuresDetails.4') || 'No free text. Structured, consistent, and clinically responsible.',
    },
    {
      icon: '💬',
      title: tLanding('features.aiDoulaSupport'),
      body: tLanding('featuresDetails.5') || 'Empathy + explanation + action, always with a medical disclaimer.',
    },
    {
      icon: '📡',
      title: tLanding('features.worksOffline'),
      body: tLanding('featuresDetails.6') || 'Low-connectivity fallback uses local safety rules.',
    },
    {
      icon: '🌍',
      title: tLanding('features.multilingual'),
      body: tLanding('featuresDetails.7') || 'English, Hindi, and Tamil with safe templates.',
    },
    {
      icon: '🚨',
      title: tLanding('features.emergencyReady'),
      body: tLanding('featuresDetails.8') || 'High-risk flows surface emergency actions instantly.',
    },
  ]

  return (
    <>
      <Head>
        <title>{tApp('pages.landing')}</title>
        <meta name="description" content="AI Companion for Safer Pregnancy & Postpartum Care" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen nurtura-bg">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-white/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-display text-primary tracking-tight">{tApp('title')}</h1>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-ghost">{tAuth('signIn')}</Link>
              <Link href="/signup" className="btn-primary">{tAuth('signUp')}</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.28em] text-primary/70 font-semibold">
                {tLanding('decisionSupportTagline') || 'Decision Support, Not Diagnosis'}
              </p>
              <h2 className="mt-4 text-4xl lg:text-5xl font-display text-slate-900 leading-tight">
                {tLanding('heroTitle')}
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-xl">
                {tLanding('heroSubtitle')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/signup" className="btn-primary">
                  {tLanding('startFree')}
                </Link>
                <Link href="/dashboard" className="btn-secondary">
                  {tLanding('exploreDemo')}
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip">{tLanding('features.multilingual')}</span>
                <span className="chip">{tLanding('features.voiceEnabled') || 'Voice-enabled'}</span>
                <span className="chip">{tLanding('features.lowConnectivity') || 'Low-connectivity safe'}</span>
                <span className="chip">{tLanding('features.emergencyReady')}</span>
              </div>
              <p className="text-xs text-slate-500 mt-5 max-w-xl">
                {tLanding('medicalDisclaimer') || 'Medical disclaimer: NURTURA provides informational support and is not a substitute for professional medical advice, diagnosis, or treatment.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-surface p-8"
            >
              <h3 className="text-2xl font-display text-slate-900 mb-6">{tLanding('howNurturaKeepsYouSafe')}</h3>
              <ol className="space-y-4">
                {safetySteps.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <div className="text-sm font-bold text-primary/80">{item.step}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 surface-muted p-4">
                <p className="text-xs text-slate-600">
                  {tLanding('decisionSupportNotDiagnosis')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {featureGridData.map((f, index) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="card-surface p-6"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">{f.title}</h3>
                <p className="text-slate-600">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

