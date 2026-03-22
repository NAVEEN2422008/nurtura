import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireServerSession } from '@/lib/auth/serverSession'
import { assessSymptomRisk } from '@/lib/risk/riskEngine'
import { SymptomInput } from '@/lib/risk/riskEngine'

const inputSchema = z.object({
  symptoms: z.array(z.object({
    name: z.string().min(1),
    severity: z.enum(['mild', 'moderate', 'severe']),
    durationDays: z.number().optional(),
    notes: z.string().optional(),
  })).min(1),
  pregnancyWeek: z.number().optional(),
  age: z.number().optional(),
  vitals: z.object({
    systolicBP: z.number().optional(),
    diastolicBP: z.number().optional(),
  }).optional(),
}).refine(data => data.symptoms.length > 0, { message: 'At least one symptom required' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const session = await requireServerSession(req, res)
    if (!session) return

    const parsed = inputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.message })
    }

    const { symptoms, pregnancyWeek = 20, age = 28, vitals = {} } = parsed.data

    const ctx = {
      pregnancyWeek,
      age,
      vitals,
      medicalHistory: [],
      riskFactors: [],
    }

    const assessment = assessSymptomRisk(symptoms as SymptomInput[], ctx)

    return res.status(200).json({
      success: true,
      data: {
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        actionMessage: assessment.suggestedActions[0] || 'Monitor symptoms.',
        nextSteps: assessment.suggestedActions,
        suggestedActions: assessment.suggestedActions,
        conditions: assessment.conditionSignals,
        conditionSignals: assessment.conditionSignals,
      },
    })
  } catch (error) {
    console.error('Symptom check error:', error)
    res.status(500).json({ success: false, error: 'Internal error' })
  }
}

