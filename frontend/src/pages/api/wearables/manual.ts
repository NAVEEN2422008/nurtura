import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  pregnancyId: z.string().uuid().optional(),
  systolicBP: z.number().int().min(50).max(250).optional(),
  diastolicBP: z.number().int().min(30).max(200).optional(),
  weight: z.number().min(20).max(300).optional(),
  heartRate: z.number().int().min(30).max(240).optional(),
  symptoms: z.array(z.string()).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

  const supabase = getSupabaseAdmin()
  const userId = session.user.id

  const metrics: Record<string, any> = {}
  if (parsed.data.systolicBP) metrics.systolicBP = parsed.data.systolicBP
  if (parsed.data.diastolicBP) metrics.diastolicBP = parsed.data.diastolicBP
  if (parsed.data.weight) metrics.weightKg = parsed.data.weight
  if (parsed.data.heartRate) metrics.heartRate = parsed.data.heartRate
  if (parsed.data.symptoms) metrics.symptoms = parsed.data.symptoms

  const { error } = await supabase.from('wearable_data').insert({
    user_id: userId,
    source: 'manual',
    metrics,
    captured_at: new Date().toISOString(),
  })

  if (error) return res.status(500).json({ success: false, error: error.message })
  return res.status(200).json({ success: true })
}

