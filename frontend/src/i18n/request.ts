import { getRequestConfig } from 'next-intl/server'

const supportedLocales = ['en', 'ta', 'hi']

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = supportedLocales.includes(locale as string) ? (locale as string) : 'en'
  
  // ✅ DEBUG LOGGING
  console.log(`[INTL] Loading messages for locale: ${resolvedLocale}`)
  
  const messages = (await import(`./messages/${resolvedLocale}.json`)).default as any
  
  // ✅ DEBUG LOGGING - verify messages loaded
  const totalKeys = Object.keys(messages).length
  const emergencyKeys = messages.emergency ? Object.keys(messages.emergency).length : 0
  const commonKeys = messages.common ? Object.keys(messages.common).length : 0
  console.log(`[INTL] ✅ Loaded ${totalKeys} top-level keys for ${resolvedLocale} (emergency: ${emergencyKeys}, common: ${commonKeys})`)
  
  return {
    locale: resolvedLocale,
    messages,
  }
})

