import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const querySchema = z.object({
  group: z.enum(['first_trimester', 'second_trimester', 'third_trimester', 'postpartum']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
  const session = await requireServerSession(req, res)
  if (!session) return

  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid query' })

  const supabase = getSupabaseAdmin()
  const { group, limit } = parsed.data

  let q = supabase
    .from('community_posts')
    .select('id,user_id,group_name,title,body,anonymous,moderation_status,misinformation_flags,created_at,updated_at')
    .in('moderation_status', ['approved', 'pending'])
    .order('created_at', { ascending: false })
    .limit(limit ?? 20)

  if (group) q = q.eq('group_name', group)

  const { data, error } = await q
  if (error) return res.status(500).json({ success: false, error: error.message })

  return res.status(200).json({ success: true, data })
}

