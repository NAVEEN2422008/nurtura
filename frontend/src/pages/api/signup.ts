import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
  language: z.string().min(2).max(10).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

  const { name, email, password, language } = parsed.data
  const supabase = getSupabaseAdmin()
  if (!supabase) return res.status(500).json({ success: false, error: 'Service unavailable' })

  const passwordHash = await bcrypt.hash(password, 12)

  const { error } = await supabase.from('users').insert({
    email: email.toLowerCase(),
    name,
    role: 'mother',
    language: language ?? 'en',
    password_hash: passwordHash,
  })

  if (error) {
    const isUnique = typeof error.message === 'string' && error.message.toLowerCase().includes('duplicate')
    return res.status(isUnique ? 409 : 500).json({ success: false, error: isUnique ? 'Email already in use' : error.message })
  }

  return res.status(200).json({ success: true })
}
