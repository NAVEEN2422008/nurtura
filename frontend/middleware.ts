export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard', '/setup-pregnancy', '/community/:path*', '/partner/:path*', '/postpartum/:path*'],
}

