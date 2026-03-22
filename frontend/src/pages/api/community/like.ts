import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  postId: z.string().uuid(),
  like: z.boolean().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return

  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return res.status(200).json({ success: true })
  const userId = session.user.id
  const postId = parsed.data.postId
  const like = parsed.data.like ?? true

  if (like) {
    const { error } = await supabase.from('post_likes').upsert({ post_id: postId, user_id: userId })
    if (error) return res.status(500).json({ success: false, error: error.message })
  } else {
    const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
    if (error) return res.status(500).json({ success: false, error: error.message })
  }

  return res.status(200).json({ success: true })
}

