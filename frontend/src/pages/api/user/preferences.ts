import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const payloadSchema = z.object({
  language: z.enum(['en', 'ta', 'hi']),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return

  const supabase = getSupabaseAdmin()
  const userId = session.user.id

  if (req.method === 'POST') {
    const parsed = payloadSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid language' })

    if (!supabase) {
      return res.status(200).json({ success: true, data: { language: parsed.data.language } })
    }

    const { error } = await supabase
      .from('users')
      .update({ language: parsed.data.language })
      .eq('id', userId)

    if (error) return res.status(500).json({ success: false, error: error.message })

    return res.status(200).json({ success: true, data: { language: parsed.data.language } })
  }

  if (req.method === 'GET') {
    if (!supabase) return res.status(200).json({ success: true, data: { language: 'en' } })

    const { data, error } = await supabase
      .from('users')
      .select('language')
      .eq('id', userId)
      .maybeSingle()

    if (error) return res.status(500).json({ success: false, error: error.message })
    return res.status(200).json({ success: true, data: { language: data?.language ?? 'en' } })
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}

