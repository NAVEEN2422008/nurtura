import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
  const session = await requireServerSession(req, res)
  if (!session) return

  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid query' })

  // v1: mock facilities (pluggable integration later)
  const hospitals = [
    { name: 'City General Hospital', distanceKm: 2.3, rating: 4.3, phone: '911', emergency: true },
    { name: 'Maternal Care Center', distanceKm: 4.1, rating: 4.6, phone: '+1-555-0456', emergency: true },
    { name: "Women's Health Clinic", distanceKm: 1.8, rating: 4.1, phone: '+1-555-0789', emergency: false },
  ]

  return res.status(200).json({
    success: true,
    data: {
      location: parsed.data,
      hospitals,
      note: 'Mock data (replace with Google Places / OpenStreetMap provider).',
    },
  })
}

