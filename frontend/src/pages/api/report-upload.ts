import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import crypto from 'crypto'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const schema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(3).max(200),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return

  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

  const supabase = getSupabaseAdmin()
  const userId = session.user.id

  const safeName = parsed.data.filename.replace(/[^\w.\-]+/g, '_')
  const objectPath = `${userId}/${crypto.randomUUID()}-${safeName}`
  const bucket = process.env.SUPABASE_REPORTS_BUCKET || 'medical-reports'

  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath)

  if (signErr) return res.status(500).json({ success: false, error: signErr.message })

  const { data: row, error: insErr } = await supabase
    .from('medical_reports')
    .insert({
      user_id: userId,
      file_path: `${bucket}/${objectPath}`,
      file_type: parsed.data.contentType,
      status: 'uploaded',
    })
    .select('id,file_path,status,created_at')
    .single()

  if (insErr) return res.status(500).json({ success: false, error: insErr.message })

  return res.status(200).json({
    success: true,
    data: {
      reportId: row.id,
      filePath: row.file_path,
      status: row.status,
      uploadUrl: signed.signedUrl,
      token: signed.token,
      objectPath,
      bucket,
    },
  })
}

