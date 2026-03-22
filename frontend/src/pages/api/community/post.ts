import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  group: z.enum(['first_trimester', 'second_trimester', 'third_trimester', 'postpartum']),
  title: z.string().max(120).optional(),
  body: z.string().min(1).max(4000),
  anonymous: z.boolean().optional(),
})

function moderate(text: string) {
  const t = text.toLowerCase()
  const flags: string[] = []
  if (/\b(ignore|don'?t)\b.*\b(bleeding|chest pain|shortness of breath)\b/.test(t)) flags.push('DANGEROUS_ADVICE')
  if (/\b(alcohol|smoke|cigarette|vape)\b.*\b(pregnan|pregnancy)\b/.test(t)) flags.push('SUBSTANCE_USE')
  if (/\b(cure|guaranteed)\b.*\b(preeclampsia|gestational diabetes|ppd|postpartum depression)\b/.test(t)) flags.push('MIRACLE_CURE')
  return { flags, status: flags.length ? 'flagged' : 'approved' }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return

  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(200).json({ success: true, data: { id: 'demo_' + Date.now(), group_name: parsed.data.group, moderation_status: 'approved' } })
  }
  const userId = session.user.id
  const { group, title, body, anonymous } = parsed.data

  // v1 moderation: lightweight keyword rules (upgradeable to model-based moderation later).
  const mod = moderate(`${title ?? ''}\n${body}`)
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: userId,
      group_name: group,
      title: title ?? null,
      body,
      anonymous: anonymous ?? false,
      moderation_status: mod.status,
      misinformation_flags: mod.flags,
    })
    .select('id,group_name,title,body,anonymous,moderation_status,created_at')
    .single()

  if (error) return res.status(500).json({ success: false, error: error.message })
  return res.status(200).json({ success: true, data })
}
