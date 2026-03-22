import React, { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { NextIntlClientProvider } from 'next-intl'
import { Fraunces, Manrope } from 'next/font/google'
import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { useAppStore } from '@/hooks/useStore'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export default function NurturaApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const locale = router.locale || router.defaultLocale || 'en'
  const { setLanguage } = useAppStore()

  useEffect(() => {
    if (locale) setLanguage(locale)
  }, [locale, setLanguage])

  // ServiceWorker causes Fast Refresh conflicts - disable in dev

  return (
    <SessionProvider session={(pageProps as any).session}>
      <NextIntlClientProvider locale={locale} messages={(pageProps as any).messages || {}}>
        <div className={`${manrope.variable} ${fraunces.variable} min-h-screen bg-white`}>
          <Component {...pageProps} />
        </div>
      </NextIntlClientProvider>
    </SessionProvider>
  )
}

