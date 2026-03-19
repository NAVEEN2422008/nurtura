import React from 'react'
import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={(pageProps as any).session}>
      <div className="min-h-screen bg-white">
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  )
}
