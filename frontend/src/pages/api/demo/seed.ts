import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const DEMO_PASSWORD = 'DemoPassword123!'

type DemoAccountSpec = {
  email: string
  name: string
  pregnancy: {
    week: number
    trimester: 1 | 2 | 3
    medicalHistory: string[]
    riskFactors: string[]
  }
  symptoms: Array<{
    daysAgo: number
    symptoms: Array<{ name: string; severity: 'mild' | 'moderate' | 'severe'; notes?: string }>
    riskScore: number
    riskLevel: 'GREEN' | 'YELLOW' | 'RED'
    conditionSignals: Array<{ name: string; probability: number; recommendation: string }>
    suggestedActions: string[]
  }>
  moods: Array<{ daysAgo: number; mood: 'happy' | 'okay' | 'neutral' | 'sad' | 'very_sad'; aiFlags?: string[] }>
}

const DEMOS: DemoAccountSpec[] = [
  {
    email: 'sarah.normal@demo.nurtura.app',
    name: 'Sarah (Demo)',
    pregnancy: { week: 22, trimester: 2, medicalHistory: [], riskFactors: [] },
    symptoms: [
      {
        daysAgo: 7,
        symptoms: [{ name: 'nausea', severity: 'mild', notes: 'Morning nausea' }],
        riskScore: 10,
        riskLevel: 'GREEN',
        conditionSignals: [],
        suggestedActions: ['Keep tracking symptoms.', 'Rest, hydrate, and follow your care plan.'],
      },
      {
        daysAgo: 2,
        symptoms: [
          { name: 'headache', severity: 'moderate', notes: 'On and off' },
          { name: 'swelling', severity: 'moderate', notes: 'Feet swelling' },
        ],
        riskScore: 55,
        riskLevel: 'YELLOW',
        conditionSignals: [
          { name: 'Gestational_hypertension_possible', probability: 1, recommendation: 'Monitor closely and contact your provider if symptoms persist or worsen.' },
        ],
        suggestedActions: [
          'Monitor symptoms and re-check in 2–4 hours.',
          'Contact your provider if symptoms persist or worsen.',
          'Log any new symptoms or BP readings.',
        ],
      },
      {
        daysAgo: 0,
        symptoms: [{ name: 'bleeding', severity: 'severe', notes: 'Heavy bleeding' }],
        riskScore: 100,
        riskLevel: 'RED',
        conditionSignals: [{ name: 'EMERGENCY', probability: 1, recommendation: 'Seek immediate medical attention now. Call emergency services or go to the nearest hospital.' }],
        suggestedActions: [
          'Seek medical attention now (call emergency services if needed).',
          'Do not drive yourself if you feel unwell—ask someone to accompany you.',
          'Bring your symptom timeline and any BP readings.',
        ],
      },
    ],
    moods: [
      { daysAgo: 7, mood: 'happy' },
      { daysAgo: 6, mood: 'okay' },
      { daysAgo: 5, mood: 'neutral' },
      { daysAgo: 4, mood: 'okay' },
      { daysAgo: 3, mood: 'happy' },
    ],
  },
  {
    email: 'priya.gdm@demo.nurtura.app',
    name: 'Priya (Demo)',
    pregnancy: { week: 28, trimester: 3, medicalHistory: ['diabetes'], riskFactors: [] },
    symptoms: [
      {
        daysAgo: 6,
        symptoms: [{ name: 'fatigue', severity: 'moderate', notes: 'Tired most days' }],
        riskScore: 25,
        riskLevel: 'GREEN',
        conditionSignals: [],
        suggestedActions: ['Keep tracking symptoms.', 'Rest, hydrate, and follow your care plan.'],
      },
      {
        daysAgo: 3,
        symptoms: [
          { name: 'dizziness', severity: 'moderate', notes: 'Lightheaded at times' },
          { name: 'fatigue', severity: 'moderate', notes: 'Low energy' },
        ],
        riskScore: 45,
        riskLevel: 'YELLOW',
        conditionSignals: [{ name: 'Anemia_possible', probability: 1, recommendation: 'Monitor closely and contact your provider if symptoms persist or worsen.' }],
        suggestedActions: [
          'Monitor symptoms and re-check in 2–4 hours.',
          'Contact your provider if symptoms persist or worsen.',
          'Log any new symptoms or BP readings.',
        ],
      },
    ],
    moods: [
      { daysAgo: 7, mood: 'okay' },
      { daysAgo: 6, mood: 'neutral' },
      { daysAgo: 5, mood: 'sad' },
      { daysAgo: 4, mood: 'sad' },
      { daysAgo: 3, mood: 'very_sad', aiFlags: ['LOW_MOOD_TREND'] },
    ],
  },
]

async function upsertUser(supabase: ReturnType<typeof getSupabaseAdmin>, email: string, name: string) {
  const { data: existing, error: findErr } = await supabase.from('users').select('id,email,password_hash').eq('email', email).maybeSingle()
  if (findErr) throw new Error(findErr.message)

  if (existing?.id) {
    // Ensure password_hash exists (in case it was created via OAuth or earlier seed).
    if (!existing.password_hash) {
      const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
      const { error: upErr } = await supabase.from('users').update({ password_hash: passwordHash, name }).eq('id', existing.id)
      if (upErr) throw new Error(upErr.message)
    }
    return { userId: existing.id, created: false }
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  const { data: created, error: createErr } = await supabase
    .from('users')
    .insert({ email, name, role: 'mother', language: 'en', password_hash: passwordHash })
    .select('id')
    .single()
  if (createErr) throw new Error(createErr.message)
  return { userId: created.id, created: true }
}

async function createPregnancy(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  week: number,
  trimester: 1 | 2 | 3,
  medicalHistory: string[],
  riskFactors: string[]
) {
  const lmp = new Date()
  lmp.setDate(lmp.getDate() - 7 * week)
  const edd = new Date(lmp.getTime())
  edd.setDate(edd.getDate() + 280)

  const { data: preg, error: pregErr } = await supabase
    .from('pregnancy_profiles')
    .insert({
      user_id: userId,
      start_date: lmp.toISOString().slice(0, 10),
      due_date: edd.toISOString().slice(0, 10),
      current_week: week,
      trimester,
      status: 'pregnant',
      medical_history: medicalHistory,
      risk_factors: riskFactors,
    })
    .select('id')
    .single()
  if (pregErr) throw new Error(pregErr.message)
  return preg.id as string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  let supabase: ReturnType<typeof getSupabaseAdmin>
  try {
    supabase = getSupabaseAdmin()
  } catch (e: any) {
    // #region agent log
    fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H7',location:'src/pages/api/demo/seed.ts:handler',message:'Demo seed failed: missing supabase env',data:{error:String(e?.message||e)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
    return res.status(500).json({ success: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local' })
  }

  // #region agent log
  fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H7',location:'src/pages/api/demo/seed.ts:handler',message:'Demo seed start (2 accounts)',data:{hasSupabaseEnv:!!process.env.SUPABASE_URL&&!!process.env.SUPABASE_SERVICE_ROLE_KEY,hasEncryptionKey:!!process.env.NURTURA_ENCRYPTION_KEY_B64,count:DEMOS.length},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log

  try {
    const now = Date.now()
    const results: Array<{ email: string; password: string; createdUser: boolean }> = []

    for (const demo of DEMOS) {
      const { userId, created } = await upsertUser(supabase, demo.email, demo.name)
      const pregnancyId = await createPregnancy(
        supabase,
        userId,
        demo.pregnancy.week,
        demo.pregnancy.trimester,
        demo.pregnancy.medicalHistory,
        demo.pregnancy.riskFactors
      )

      const { error: sErr } = await supabase.from('symptom_logs').insert(
        demo.symptoms.map((s) => ({
          user_id: userId,
          pregnancy_id: pregnancyId,
          symptoms: s.symptoms,
          risk_score: s.riskScore,
          risk_level: s.riskLevel,
          suggested_actions: s.suggestedActions,
          condition_signals: s.conditionSignals,
          occurred_at: new Date(now - 1000 * 60 * 60 * 24 * s.daysAgo).toISOString(),
        }))
      )
      if (sErr) throw new Error(sErr.message)

      const { error: mErr } = await supabase.from('mood_logs').insert(
        demo.moods.map((m) => ({
          user_id: userId,
          pregnancy_id: pregnancyId,
          mood: m.mood,
          ai_flags: m.aiFlags ?? [],
          occurred_at: new Date(now - 1000 * 60 * 60 * 24 * m.daysAgo).toISOString(),
        }))
      )
      if (mErr) throw new Error(mErr.message)

      results.push({ email: demo.email, password: DEMO_PASSWORD, createdUser: created })
    }

    // #region agent log
    fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H7',location:'src/pages/api/demo/seed.ts:handler',message:'Demo seed success (2 accounts)',data:{seeded:results.map(r=>({email:r.email,createdUser:r.createdUser}))},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    return res.status(200).json({
      success: true,
      data: {
        password: DEMO_PASSWORD,
        accounts: results.map((r) => ({ email: r.email, password: r.password })),
        note: 'Use these credentials on /login (Credentials).',
      },
    })
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Failed to seed demo data' })
  }
}

