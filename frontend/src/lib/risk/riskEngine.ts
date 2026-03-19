export type SymptomSeverity = 'mild' | 'moderate' | 'severe'

export type SymptomInput = {
  name: string
  severity: SymptomSeverity
  notes?: string
}

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED'

export type RiskSignal = {
  name: string
  probability: number
  recommendation: string
}

export type RiskAssessment = {
  riskScore: number // 0-100
  riskLevel: RiskLevel
  suggestedActions: string[]
  conditionSignals: RiskSignal[]
}

export type RiskContext = {
  pregnancyWeek?: number
  age?: number
  vitals?: {
    systolicBP?: number
    diastolicBP?: number
    weightKg?: number
    heartRate?: number
  }
  medicalHistory?: string[]
  riskFactors?: string[]
}

const EMERGENCY_SYMPTOMS = new Set(['bleeding', 'chest_pain', 'shortness_breath'])

export function assessSymptomRisk(symptoms: SymptomInput[], ctx: RiskContext = {}): RiskAssessment {
  let score = 0
  const signals: RiskSignal[] = []

  const age = ctx.age
  if (typeof age === 'number' && age >= 35) score += 10

  const sys = ctx.vitals?.systolicBP
  const dia = ctx.vitals?.diastolicBP
  const has = (name: string) => symptoms.some((s) => s.name === name)
  const hasHeadache = has('headache')
  const hasSwelling = has('swelling')
  const hasBlurredVision = has('blurred_vision')

  if (typeof sys === 'number' && typeof dia === 'number') {
    if (sys >= 140 || dia >= 90) {
      score += 20
      signals.push({
        name: 'Hypertension/Preeclampsia_risk',
        probability: 0.8,
        recommendation: 'Recheck BP and contact your provider if it stays ≥140/90.',
      })
    } else if (sys >= 130 || dia >= 80) {
      score += 10
    }
  }

  // Spec example: headache + swelling + high BP => possible preeclampsia risk
  const highBp = typeof sys === 'number' && typeof dia === 'number' && (sys >= 140 || dia >= 90)
  if (highBp && hasHeadache && hasSwelling) {
    score += 25
    signals.unshift({
      name: 'Preeclampsia_possible',
      probability: hasBlurredVision ? 0.9 : 0.75,
      recommendation: 'Possible preeclampsia pattern (headache + swelling + high BP). Seek same-day clinical advice.',
    })
  }

  const history = new Set((ctx.medicalHistory ?? []).map((s) => s.toLowerCase()))
  if (history.has('hypertension')) {
    score += 15
    signals.push({
      name: 'Chronic_hypertension',
      probability: 0.7,
      recommendation: 'Keep regular prenatal visits; discuss BP targets with your provider.',
    })
  }
  if (history.has('diabetes')) {
    score += 20
    signals.push({
      name: 'Gestational_diabetes_risk',
      probability: 0.75,
      recommendation: 'Ask about glucose screening and diet guidance.',
    })
  }

  const rf = new Set((ctx.riskFactors ?? []).map((s) => s.toLowerCase()))
  if (rf.has('previous_preeclampsia')) {
    score += 25
    signals.push({
      name: 'Recurrent_preeclampsia_risk',
      probability: 0.85,
      recommendation: 'High-risk history: consider closer monitoring and discuss aspirin prophylaxis if appropriate.',
    })
  }

  // Symptom combination rules
  const symptomNames = symptoms.map((s) => s.name)
  const combos: Record<string, string[]> = {
    Preeclampsia_possible: ['headache', 'swelling', 'blurred_vision'],
    Gestational_hypertension_possible: ['headache', 'swelling'],
    Anemia_possible: ['fatigue', 'dizziness'],
  }

  for (const [condition, combo] of Object.entries(combos)) {
    const matching = symptomNames.filter((n) => combo.includes(n))
    if (matching.length >= 2) {
      const prob = matching.length / combo.length
      score += 25 * prob
      signals.push({
        name: condition,
        probability: prob,
        recommendation: 'Monitor closely and contact your provider if symptoms persist or worsen.',
      })
    }
  }

  const severeCount = symptoms.filter((s) => s.severity === 'severe').length
  score += severeCount * 15

  const emergency = symptoms.some((s) => EMERGENCY_SYMPTOMS.has(s.name) && s.severity === 'severe')
  if (emergency) {
    score = 100
    signals.unshift({
      name: 'EMERGENCY',
      probability: 1,
      recommendation: 'Seek immediate medical attention now. Call emergency services or go to the nearest hospital.',
    })
  }

  score = Math.min(100, Math.round(score))

  let riskLevel: RiskLevel = 'GREEN'
  if (score >= 70) riskLevel = 'RED'
  else if (score >= 40) riskLevel = 'YELLOW'

  const suggestedActions =
    riskLevel === 'RED'
      ? [
          'Seek medical attention now (call emergency services if needed).',
          'Do not drive yourself if you feel unwell—ask someone to accompany you.',
          'Bring your symptom timeline and any BP readings.',
        ]
      : riskLevel === 'YELLOW'
        ? [
            'Monitor symptoms and re-check in 2–4 hours.',
            'Contact your provider if symptoms persist or worsen.',
            'Log any new symptoms or BP readings.',
          ]
        : ['Keep tracking symptoms.', 'Rest, hydrate, and follow your care plan.']

  return {
    riskScore: score,
    riskLevel,
    suggestedActions,
    conditionSignals: signals,
  }
}

