import React from 'react'

interface SymptomFormProps {
  onSubmit: (symptoms: Array<{name: string; severity: 'mild' | 'moderate' | 'severe'; notes?: string}>) => void
  loading: boolean
}

export const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit, loading }) => {
  const [symptoms, setSymptoms] = React.useState<Array<{name: string; severity: 'mild' | 'moderate' | 'severe'; notes: string}>>([])

  const availableSymptoms = [
    'headache', 'swelling', 'dizziness', 'nausea', 'bleeding', 
    'fatigue', 'anxiety', 'blurred_vision', 'chest_pain', 'shortness_breath'
  ]

  const severityOptions = ['mild', 'moderate', 'severe']

  const addSymptom = (name: string) => {
    setSymptoms([...symptoms, { name, severity: 'mild' as const, notes: '' }])
  }

  const updateSymptom = (index: number, field: 'severity' | 'notes', value: string) => {
    const newSymptoms = [...symptoms]
    newSymptoms[index] = { ...newSymptoms[index], [field]: value as any }
    setSymptoms(newSymptoms)
  }

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(symptoms)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-primary mb-3">Log Symptoms</h3>
        <p className="text-sm text-gray-600 mb-4">Select symptoms you&apos;re experiencing today</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {availableSymptoms.map(symptom => (
            <button
              key={symptom}
              type="button"
              onClick={() => addSymptom(symptom)}
              className="p-2 text-xs bg-gray-100 hover:bg-primary hover:text-white rounded transition text-left"
            >
              {symptom.replace('_', ' ')}
            </button>
          ))}
        </div>

        {symptoms.length > 0 && (
          <div className="space-y-2 mb-6">
            <h4 className="font-semibold text-gray-800">Selected ({symptoms.length})</h4>
            {symptoms.map((symptom, index) => (
              <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm capitalize">{symptom.name}</span>
                <select
                  value={symptom.severity}
                  onChange={(e) => updateSymptom(index, 'severity', e.target.value)}
                  className="px-2 py-1 text-xs border rounded focus:ring-primary"
                >
                  {severityOptions.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Notes..."
                  value={symptom.notes}
                  onChange={(e) => updateSymptom(index, 'notes', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border rounded focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => removeSymptom(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || symptoms.length === 0}
          className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Logging...' : `Log ${symptoms.length} Symptom${symptoms.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </form>
  )
}

