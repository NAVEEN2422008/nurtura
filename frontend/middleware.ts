import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // List of supported locales
  locales: ['en', 'ta', 'hi'],
  // Default locale if not detected
  defaultLocale: 'en'
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
