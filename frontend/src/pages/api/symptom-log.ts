import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { assessSymptomRisk } from '@/lib/risk/riskEngine'
import { encryptString } from '@/lib/crypto/aesGcm'

const symptomSchema = z.object({
  name: z.string().min(1).max(64),
  severity: z.enum(['mild', 'moderate', 'severe']),
  notes: z.string().max(2000).optional(),
})

const createSchema = z.object({
  pregnancyId: z.string().uuid().optional(),
  symptoms: z.array(symptomSchema).min(1).max(20),
  occurredAt: z.string().datetime().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireServerSession(req, res)
  if (!session) return

  const supabase = getSupabaseAdmin()
  const userId = session.user.id
  // #region agent log
  fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H4',location:'src/pages/api/symptom-log.ts:handler',message:'Symptom API request',data:{method:req.method,hasUserId:!!userId},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input' })

    const { pregnancyId, symptoms, occurredAt } = parsed.data
    const notesJoined = symptoms.map((s) => (s.notes ? `${s.name}: ${s.notes}` : '')).filter(Boolean).join('\n')
    const notesEncrypted = notesJoined ? encryptString(notesJoined) : null

    // Pull pregnancy context if provided
    let ctx: any = {}
    if (pregnancyId) {
      const { data: preg } = await supabase
        .from('pregnancy_profiles')
        .select('current_week,medical_history,risk_factors')
        .eq('id', pregnancyId)
        .eq('user_id', userId)
        .maybeSingle()
      if (preg) {
        ctx = {
          pregnancyWeek: preg.current_week ?? undefined,
          medicalHistory: Array.isArray(preg.medical_history) ? preg.medical_history : [],
          riskFactors: Array.isArray(preg.risk_factors) ? preg.risk_factors : [],
        }
      }
    }

    const assessment = assessSymptomRisk(symptoms, ctx)
    // #region agent log
    fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H4',location:'src/pages/api/symptom-log.ts:handler',message:'Risk assessment computed',data:{symptomNames:symptoms.map(s=>s.name),severities:symptoms.map(s=>s.severity),riskLevel:assessment.riskLevel,riskScore:assessment.riskScore,signalCount:assessment.conditionSignals.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: userId,
        pregnancy_id: pregnancyId ?? null,
        symptoms,
        notes_encrypted: notesEncrypted,
        risk_score: assessment.riskScore,
        risk_level: assessment.riskLevel,
        suggested_actions: assessment.suggestedActions,
        condition_signals: assessment.conditionSignals,
        occurred_at: occurredAt ?? new Date().toISOString(),
      })
      .select('id,occurred_at,risk_score,risk_level,condition_signals,suggested_actions')
      .single()

    if (error) return res.status(500).json({ success: false, error: error.message })

    if (assessment.riskLevel === 'RED') {
      await supabase.from('audit_events').insert({
        user_id: userId,
        event_type: 'EMERGENCY_TRIGGERED',
        details: { symptomLogId: data.id, riskScore: assessment.riskScore },
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        symptomLogId: data.id,
        occurredAt: data.occurred_at,
        riskScore: data.risk_score,
        riskLevel: data.risk_level,
        conditionSignals: data.condition_signals,
        suggestedActions: data.suggested_actions,
      },
    })
  }

  if (req.method === 'GET') {
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? '20', 10)))
    const pregnancyId = typeof req.query.pregnancyId === 'string' ? req.query.pregnancyId : undefined
    let q = supabase
      .from('symptom_logs')
      .select('id,occurred_at,risk_score,risk_level,symptoms,condition_signals,suggested_actions')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(limit)
    if (pregnancyId) q = q.eq('pregnancy_id', pregnancyId)

    const { data, error } = await q

    if (error) return res.status(500).json({ success: false, error: error.message })
    return res.status(200).json({ success: true, data })
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}

