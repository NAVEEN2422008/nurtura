// Risk prediction algorithm - Enhanced with symptoms (Phase 1 complete)

export interface Symptom {
  name: string
  severity: 'mild' | 'moderate' | 'severe'
}

export interface RiskInput {
  pregnancyWeek: number
  age: number
  vitals: {
    systolicBP: number
    diastolicBP: number
    weight: number
  }
  medicalHistory: string[]
  riskFactors: string[]
  symptoms: Symptom[]
}

export interface RiskOutput {
  riskScore: number // 0-100
  riskLevel: 'low' | 'moderate' | 'high'
  conditions: Array<{
    name: string
    probability: number
    recommendation: string
  }>
}

export const calculateRiskScore = (input: RiskInput): RiskOutput => {
  let score = 0
  const conditions: Array<{
    name: string
    probability: number
    recommendation: string
  }> = []

  // Age factor: Advanced maternal age (35+) adds risk
  if (input.age >= 35) {
    score += 10
  }

  // Blood pressure factor
  if (input.vitals.systolicBP >= 140 || input.vitals.diastolicBP >= 90) {
    score += 20
    conditions.push({
      name: 'Hypertension/Preeclampsia risk',
      probability: 0.8,
      recommendation: 'Monitor BP closely - contact doctor if persists >140/90'
    })
  } else if (input.vitals.systolicBP >= 130 || input.vitals.diastolicBP >= 80) {
    score += 10
  }

  // Medical history factors
  if (input.medicalHistory.includes('hypertension')) {
    score += 15
    conditions.push({
      name: 'Chronic hypertension',
      probability: 0.7,
      recommendation: 'Ensure regular prenatal visits'
    })
  }
  if (input.medicalHistory.includes('diabetes')) {
    score += 20
    conditions.push({
      name: 'Gestational diabetes risk',
      probability: 0.75,
      recommendation: 'Schedule glucose screening test'
    })
  }
  if (input.riskFactors.includes('previous_preeclampsia')) {
    score += 25
    conditions.push({
      name: 'Recurrent preeclampsia',
      probability: 0.85,
      recommendation: 'High risk - specialist monitoring recommended'
    })
  }

  // Symptom combination rules (spec requirement: headache + swelling → preeclampsia)
  const symptomCombos = {
    preeclampsia: ['headache', 'swelling', 'blurred_vision'],
    gestational_htn: ['headache', 'swelling'],
    anemia_fatigue: ['fatigue', 'dizziness'],
    preterm_labor: ['chest_pain', 'shortness_breath']
  }

  for (const [condition, combo] of Object.entries(symptomCombos)) {
    const matching = input.symptoms.filter(s => combo.includes(s.name))
    if (matching.length >= 2) {
      const prob = matching.length / combo.length
      score += 25 * prob
      conditions.push({
        name: condition.replace('_', ' '),
        probability: prob,
        recommendation: `Monitor for ${condition}: consult doctor if worsens`
      })
    }
  }

  // Severity bonus
  const severeCount = input.symptoms.filter(s => s.severity === 'severe').length
  score += severeCount * 15

  // Emergency symptoms
  const emergencySymptoms = ['bleeding', 'chest_pain', 'shortness_breath']
  const emergencyMatch = input.symptoms.some(s => emergencySymptoms.includes(s.name) && s.severity === 'severe')
  if (emergencyMatch) {
    score = 100
    conditions.unshift({
      name: 'EMERGENCY',
      probability: 1.0,
      recommendation: 'Seek immediate medical attention - call emergency services'
    })
  }

  score = Math.min(score, 100)

  let riskLevel: 'low' | 'moderate' | 'high' = 'low'
  if (score >= 70) riskLevel = 'high'
  else if (score >= 40) riskLevel = 'moderate'

  return {
    riskScore: Math.round(score),
    riskLevel,
    conditions,
  }
}
