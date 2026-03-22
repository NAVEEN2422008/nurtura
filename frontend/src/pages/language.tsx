import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, CardHeader, useToast, ToastContainer } from '@/components/design-system'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', description: 'Full features in English' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', description: 'पूर्ण विशेषताएं हिंदी में' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', description: 'தமிழ் மொழியில் முழு அம்சங்கள்' },
]

export default function LanguageSelection() {
  const router = useRouter()
  const { toasts, showToast, dismissToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)

  const handleSelectLanguage = async (langCode: string) => {
    setLoading(true)
    setSelectedLang(langCode)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Save language preference to localStorage
      localStorage.setItem('nurtura_language', langCode)
      
      showToast(`Language changed to ${languages.find(l => l.code === langCode)?.name}`, { variant: 'success' })
      
      // Redirect to dashboard with language
      setTimeout(() => {
        router.push(`/dashboard`)
      }, 600)
    } catch (error) {
      showToast('Error saving language preference', { variant: 'danger' })
      setLoading(false)
      setSelectedLang(null)
    }
  }

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
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <>
      <Head>
        <title>Choose Language - NURTURA</title>
        <meta name="description" content="Select your preferred language" />
      </Head>

      <div className="min-h-screen nurtura-bg flex items-center justify-center p-4 pb-24 md:pb-8">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        {/* Main Card */}
        <motion.div
          className="relative w-full max-w-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card variant="elevated">
            <CardHeader className="text-center">
              <motion.h1
                className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                Welcome to NURTURA
              </motion.h1>
              <motion.p
                className="text-lg text-slate-600"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Choose your preferred language
              </motion.p>
            </CardHeader>

            <CardContent>
              <motion.div
                className="space-y-4 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    variants={itemVariants}
                    onClick={() => handleSelectLanguage(lang.code)}
                    disabled={loading && selectedLang !== lang.code}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                      selectedLang === lang.code
                        ? 'bg-primary text-white border-primary shadow-lg'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-primary hover:shadow-card'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {/* Flag and Text */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-4xl">{lang.flag}</span>
                        <div>
                          <h3 className="text-xl font-bold">{lang.name}</h3>
                        </div>
                      </div>
                      <p className={`text-sm ${
                        selectedLang === lang.code ? 'text-white/80' : 'text-slate-600'
                      }`}>
                        {lang.description}
                      </p>
                    </div>

                    {/* Checkmark */}
                    {selectedLang === lang.code ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold"
                      >
                        ✓
                      </motion.div>
                    ) : (
                      <div className="w-8 h-8 border-2 border-current rounded-full" />
                    )}
                  </motion.button>
                ))}
              </motion.div>

              {/* Info Message */}
              <motion.div
                className="p-4 bg-accent/10 rounded-lg border border-accent/30 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-accent">📱 Tip:</span> You can change your language anytime from settings.
                </p>
              </motion.div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/" className="w-full">
                  <Button variant="ghost" size="lg" fullWidth>
                    Back
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => selectedLang && handleSelectLanguage(selectedLang)}
                  isLoading={loading}
                  disabled={!selectedLang || loading}
                >
                  {loading ? 'Setting Language...' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <motion.p
            className="text-xs text-slate-500 text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            NURTURA uses evidence-based maternal health templates in your language.
          </motion.p>
        </motion.div>

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </>
  )
}


