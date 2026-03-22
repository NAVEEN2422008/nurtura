import type { NextApiResponse } from 'next'

export default function handler(_req: unknown, res: NextApiResponse) {
  const checks = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NURTURA_ENCRYPTION_KEY_B64: !!process.env.NURTURA_ENCRYPTION_KEY_B64,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  }

  return res.status(200).json({ success: true, data: checks })
}

