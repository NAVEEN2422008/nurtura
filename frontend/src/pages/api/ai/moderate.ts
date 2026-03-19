import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'

const schema = z.object({
  text: z.string().min(1).max(5000),
})

function moderate(text: string) {
  const t = text.toLowerCase()
  const flags: string[] = []

  const patterns: Array<{ flag: string; re: RegExp }> = [
    { flag: 'DANGEROUS_ADVICE', re: /\b(ignore|don'?t)\b.*\b(bleeding|chest pain|shortness of breath)\b/ },
    { flag: 'SUBSTANCE_USE', re: /\b(alcohol|smoke|cigarette|vape)\b.*\b(pregnan|pregnancy)\b/ },
    { flag: 'MEDICATION_UNSAFE', re: /\b(take|use)\b.*\b(isotretinoin|accutane)\b/ },
    { flag: 'MIRACLE_CURE', re: /\b(cure|guaranteed)\b.*\b(preeclampsia|gestational diabetes|ppd|postpartum depression)\b/ },
  ]

  for (const p of patterns) if (p.re.test(t)) flags.push(p.flag)

  const misinformation = flags.length > 0
  return {
    misinformation,
    flags,
    moderationStatus: misinformation ? 'flagged' : 'approved',
    confidence: misinformation ? 0.7 : 0.6,
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

  return res.status(200).json({ success: true, data: moderate(parsed.data.text) })
}

