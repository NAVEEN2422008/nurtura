import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { encryptString } from '@/lib/crypto/aesGcm'

const createSchema = z.object({
  pregnancyId: z.string().uuid().optional(),
  mood: z.enum(['happy', 'okay', 'neutral', 'sad', 'very_sad']),
  notes: z.string().max(2000).optional(),
  occurredAt: z.string().datetime().optional(),
})

function moodScore(m: string) {
  if (m === 'happy') return 2
  if (m === 'okay') return 1
  if (m === 'neutral') return 0
  if (m === 'sad') return -1
  return -2
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return

  const supabase = getSupabaseAdmin()
  const userId = session.user.id

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

    const { pregnancyId, mood, notes, occurredAt } = parsed.data
    const notesEncrypted = notes ? encryptString(notes) : null

    // Lightweight pattern detection: last 7 logs average score
    const { data: recent } = await supabase
      .from('mood_logs')
      .select('mood,occurred_at')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(6)

    const series = [mood, ...(recent ?? []).map((r) => r.mood)]
    const avg = series.reduce((sum, m) => sum + moodScore(m), 0) / series.length
    const flags: string[] = []
    if (avg <= -1) flags.push('LOW_MOOD_TREND')
    if (series.slice(0, 3).every((m) => m === 'sad' || m === 'very_sad')) flags.push('PERSISTENT_SADNESS')

    const { data, error } = await supabase
      .from('mood_logs')
      .insert({
        user_id: userId,
        pregnancy_id: pregnancyId ?? null,
        mood,
        notes_encrypted: notesEncrypted,
        ai_flags: flags,
        occurred_at: occurredAt ?? new Date().toISOString(),
      })
      .select('id,occurred_at,mood,ai_flags')
      .single()

    if (error) return res.status(500).json({ success: false, error: error.message })

    const resources =
      flags.length > 0
        ? [
            { title: 'If you feel unsafe or in crisis', action: 'Call local emergency services now.' },
            { title: 'Talk to someone you trust', action: 'Consider reaching out to your support circle today.' },
            { title: 'Professional support', action: 'If feelings persist, contact your healthcare provider or a mental health professional.' },
          ]
        : []

    return res.status(200).json({ success: true, data: { ...data, resources } })
  }

  if (req.method === 'GET') {
    const limit = Math.min(180, Math.max(1, parseInt((req.query.limit as string) ?? '30', 10)))
    const { data, error } = await supabase
      .from('mood_logs')
      .select('id,occurred_at,mood,ai_flags')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(limit)

    if (error) return res.status(500).json({ success: false, error: error.message })
    return res.status(200).json({ success: true, data })
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}

