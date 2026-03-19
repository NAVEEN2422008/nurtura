import React from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>NURTURA – AI Maternal Care</title>
        <meta name="description" content="AI Companion for Safer Pregnancy & Postpartum Care" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-soft-lavender via-white to-soft-mint">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">NURTURA</h1>
            <div className="space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-primary">Login</Link>
              <Link href="/signup" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90">Sign Up</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              AI Companion for Safer Pregnancy &amp; Postpartum Care
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A calm, supportive space to track symptoms, understand risk signals, and feel emotionally held between doctor visits.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-primary text-white font-semibold hover:shadow-elevated transition-all"
              >
                Start Free
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition-all"
              >
                Try Demo
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4 max-w-2xl mx-auto">
              Medical disclaimer: NURTURA provides informational support and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {[
              {
                icon: '🧑‍⚕️',
                title: 'Maternal healthcare challenges',
                body: 'Between visits, questions and symptoms can feel urgent. NURTURA helps you log, organize, and know when to escalate.',
              },
              {
                icon: '💬',
                title: 'AI maternal companion',
                body: 'Ask pregnancy and postpartum questions anytime, get calm explanations and emotional reassurance (with clear disclaimers).',
              },
              {
                icon: '🩺',
                title: 'Symptom monitoring system',
                body: 'Track headache, swelling, dizziness, nausea, bleeding, fatigue, anxiety—with severity, timestamp, and notes.',
              },
              {
                icon: '📈',
                title: 'Predictive risk detection',
                body: 'Rule-based triage highlights green/yellow/red risk signals and suggests next steps using guideline-inspired logic.',
              },
              {
                icon: '👩‍👩‍👧‍👧',
                title: 'Community support for mothers',
                body: 'Join trimester/postpartum groups, share experiences anonymously, and get AI moderation to reduce misinformation.',
              },
              {
                icon: '⌚',
                title: 'Wearable + postpartum support',
                body: 'Bring in sleep/stress/activity signals (Apple/Fitbit/Oura) and switch to postpartum mode for recovery support.',
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-rounded shadow-card p-6"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
