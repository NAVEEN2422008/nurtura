import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  postId: z.string().uuid(),
  parentCommentId: z.string().uuid().optional(),
  body: z.string().min(1).max(2000),
  anonymous: z.boolean().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return

  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

  const supabase = getSupabaseAdmin()
  const userId = session.user.id

  const { data, error } = await supabase
    .from('community_comments')
    .insert({
      post_id: parsed.data.postId,
      parent_comment_id: parsed.data.parentCommentId ?? null,
      user_id: userId,
      body: parsed.data.body,
      anonymous: parsed.data.anonymous ?? false,
    })
    .select('id,post_id,parent_comment_id,body,anonymous,created_at')
    .single()

  if (error) return res.status(500).json({ success: false, error: error.message })
  return res.status(200).json({ success: true, data })
}

