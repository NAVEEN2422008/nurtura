import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

interface AppShellProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  hideNav?: boolean
}

export const AppShell: React.FC<AppShellProps> = ({ title, subtitle, actions, children, hideNav }) => {
  const router = useRouter()
  const tApp = useTranslations('app')
  const tCommon = useTranslations('common')

  const navItems = [
    { href: '/dashboard', label: tApp('nav.home'), icon: '🏠' },
    { href: '/symptom-checker', label: tApp('nav.symptomCheck'), icon: '🩺' },
    { href: '/ai-chat', label: tApp('nav.aiAssistant'), icon: '💬' },
    { href: '/emergency', label: tApp('nav.emergency'), icon: '🚨' },
  ]


  if (hideNav) {
    return <div className="min-h-screen nurtura-bg">{children}</div>
  }

  return (
    <div className="min-h-screen nurtura-bg">
      <div className="md:flex">
        <aside className="hidden md:flex md:flex-col md:w-60 lg:w-64 bg-white/70 backdrop-blur border-r border-white/70 p-6 gap-6 sticky top-0 h-screen">
          <div className="text-2xl font-display text-primary tracking-tight">Nurtura</div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = router.pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active ? 'bg-primary text-white shadow-lg' : 'bg-white/70 text-slate-700 hover:bg-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto surface-muted p-4 text-xs text-slate-600">
            {tCommon('decisionSupportDisclaimer')}
          </div>

        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-white/70">
            <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-display text-slate-900">{title}</h1>
                {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">{children}</main>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-white/70">
        <div className="grid grid-cols-4 gap-1 px-3 py-2">
          {navItems.map((item) => {
            const active = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl py-2 text-[11px] font-semibold transition ${
                  active ? 'bg-primary text-white shadow-md' : 'text-slate-600'
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
