// Existing types...

export interface Symptom {
  name: string
  severity: 'mild' | 'moderate' | 'severe'
  notes?: string
}

export interface RiskCondition {
  name: string
  probability: number
  recommendation: string
}
