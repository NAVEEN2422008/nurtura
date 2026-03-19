import type { NextApiRequest, NextApiResponse } from 'next'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const session = await requireServerSession(req, res)
  if (!session) return

  const supabase = getSupabaseAdmin()
  const userId = session.user.id
  // #region agent log
  fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H3',location:'src/pages/api/dashboard.ts:handler',message:'Dashboard API start',data:{hasUserId:!!userId,hasSupabaseEnv:!!process.env.SUPABASE_URL&&!!process.env.SUPABASE_SERVICE_ROLE_KEY},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log

  const { data: pregnancy, error: pErr } = await supabase
    .from('pregnancy_profiles')
    .select('id,current_week,trimester,due_date,status,risk_factors,medical_history,next_appointment_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (pErr) return res.status(500).json({ success: false, error: pErr.message })

  const pregnancyId = pregnancy?.id ?? null

  const [{ data: symptomLogs, error: sErr }, { data: moodLogs, error: mErr }] = await Promise.all([
    supabase
      .from('symptom_logs')
      .select('id,occurred_at,risk_score,risk_level,symptoms')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(30),
    supabase
      .from('mood_logs')
      .select('id,occurred_at,mood,ai_flags')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(30),
  ])

  if (sErr) return res.status(500).json({ success: false, error: sErr.message })
  if (mErr) return res.status(500).json({ success: false, error: mErr.message })

  // #region agent log
  fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H3',location:'src/pages/api/dashboard.ts:handler',message:'Dashboard API success',data:{hasPregnancy:!!pregnancyId,symptomCount:(symptomLogs??[]).length,moodCount:(moodLogs??[]).length},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: userId,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        language: session.user.language,
      },
      pregnancy: pregnancy
        ? {
            pregnancyId: pregnancy.id,
            currentWeek: pregnancy.current_week,
            trimester: pregnancy.trimester,
            expectedDeliveryDate: pregnancy.due_date,
            status: pregnancy.status,
            riskFactors: pregnancy.risk_factors ?? [],
            chronicConditions: pregnancy.medical_history ?? [],
            nextAppointmentAt: pregnancy.next_appointment_at,
          }
        : null,
      analytics: {
        recentSymptomLogs: symptomLogs ?? [],
        recentMoodLogs: moodLogs ?? [],
      },
      ids: { pregnancyId },
    },
  })
}

