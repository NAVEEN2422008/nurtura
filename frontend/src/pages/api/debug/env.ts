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

  // #region agent log
  fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H1',location:'src/pages/api/debug/env.ts:handler',message:'Env check',data:{...checks},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log

  return res.status(200).json({ success: true, data: checks })
}

