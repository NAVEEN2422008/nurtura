import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const createSchema = z.object({
  lmp: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  edd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  riskFactors: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
})

function calcWeeksSince(dateIso: string): number {
  const start = new Date(dateIso + 'T00:00:00Z').getTime()
  const now = Date.now()
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.min(42, Math.floor(days / 7)))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Database service unavailable - pregnancy data stored in backend only' })
  }
  const userId = session.user.id
  // #region agent log
  fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H2',location:'src/pages/api/pregnancy.ts:handler',message:'Pregnancy API request',data:{method:req.method,hasUserId:!!userId,hasSupabaseEnv:!!process.env.SUPABASE_URL&&!!process.env.SUPABASE_SERVICE_ROLE_KEY},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

    const { lmp, edd, riskFactors, chronicConditions } = parsed.data
    const currentWeek = calcWeeksSince(lmp)
    const trimester = currentWeek < 13 ? 1 : currentWeek < 28 ? 2 : 3

    const { data, error } = await supabase
      .from('pregnancy_profiles')
      .insert({
        user_id: userId,
        start_date: lmp,
        due_date: edd,
        current_week: currentWeek,
        trimester,
        medical_history: chronicConditions ?? [],
        risk_factors: riskFactors ?? [],
        status: 'pregnant',
      })
      .select('id,current_week,trimester,due_date,risk_factors,medical_history,status')
      .single()

    if (error) return res.status(500).json({ success: false, error: error.message })

    return res.status(200).json({
      success: true,
      data: {
        pregnancyId: data.id,
        currentWeek: data.current_week,
        trimester: data.trimester,
        expectedDeliveryDate: data.due_date,
        riskFactors: data.risk_factors ?? [],
        chronicConditions: data.medical_history ?? [],
        status: data.status,
      },
    })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('pregnancy_profiles')
      .select('id,current_week,trimester,due_date,risk_factors,medical_history,status,next_appointment_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return res.status(500).json({ success: false, error: error.message })
    if (!data) return res.status(200).json({ success: true, data: null })

    return res.status(200).json({
      success: true,
      data: {
        pregnancyId: data.id,
        currentWeek: data.current_week,
        trimester: data.trimester,
        expectedDeliveryDate: data.due_date,
        riskFactors: data.risk_factors ?? [],
        chronicConditions: data.medical_history ?? [],
        status: data.status,
        nextAppointmentAt: data.next_appointment_at,
      },
    })
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}

