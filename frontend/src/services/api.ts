async function json(input: RequestInfo, init?: RequestInit): Promise<any> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const data = await res.json()
  if (!res.ok) throw Object.assign(new Error(data?.error || 'Request failed'), { status: res.status, data })
  return data
}

class ApiClient {
  // Pregnancy endpoints
async createPregnancy(data: { lmp: string; edd: string; riskFactors?: string[]; chronicConditions?: string[] }): Promise<any> {
    // Proxy to backend pregnancy endpoint (Supabase disabled)
    return json(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/pregnancies`, {
      method: 'POST',
      body: JSON.stringify({
        lmp: data.lmp,
        edd: data.edd,
        riskFactors: data.riskFactors,
        chronicConditions: data.chronicConditions,
      }),
    })
  }

async getPregnancy(): Promise<any> {
    // Proxy to backend
    return json(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/pregnancies`)
  }

async getDashboard(): Promise<any> {
    // Proxy to backend
    return json(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/dashboard`)
  }

  // Pregnancy endpoints
  // Chat endpoints
  async sendMessage(pregnancyId: string, message: string, language?: string): Promise<any> {
    const body: { pregnancyId: string; message: string; language?: string } = { pregnancyId, message };
    if (language) body.language = language;
    return json('/api/ai/companion', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async getChatHistory(pregnancyId: string, limit: number = 50, offset: number = 0): Promise<any> {
    return json(`/api/ai/history?pregnancyId=${encodeURIComponent(pregnancyId)}&limit=${limit}&offset=${offset}`)
  }

async logVitals(pregnancyId: string, vitals: any): Promise<any> {
    // Mock validation - skip empty strings
    const cleanVitals = {
      pregnancyId,
      ...(parseInt(vitals.systolicBP) > 0 && { systolicBP: parseInt(vitals.systolicBP) }),
      ...(parseInt(vitals.diastolicBP) > 0 && { diastolicBP: parseInt(vitals.diastolicBP) }),
      ...(parseFloat(vitals.weight) > 0 && { weight: parseFloat(vitals.weight) }),
      ...(parseInt(vitals.heartRate) > 0 && { heartRate: parseInt(vitals.heartRate) }),
      ...(vitals.symptoms && vitals.symptoms.length > 0 && { symptoms: vitals.symptoms }),
    }
    if (Object.keys(cleanVitals).length === 1) throw new Error('No valid vitals provided')
    return json('/api/wearables/manual', { method: 'POST', body: JSON.stringify(cleanVitals) })
  }

async logSymptoms(pregnancyId: string, symptoms: Array<{name: string; severity: 'mild' | 'moderate' | 'severe'; notes?: string}>): Promise<any> {
    if (!symptoms || symptoms.length === 0) throw new Error('No symptoms provided')
    return json('/api/symptom-log', { method: 'POST', body: JSON.stringify({ pregnancyId, symptoms }) })
  }

  async getRecentSymptoms(pregnancyId: string): Promise<any> {
    return json(`/api/symptom-log?limit=10&pregnancyId=${encodeURIComponent(pregnancyId)}`)
  }

async logMood(input: { pregnancyId?: string; mood: 'happy' | 'okay' | 'neutral' | 'sad' | 'very_sad'; notes?: string }): Promise<any> {
    const { pregnancyId, mood, notes } = input
    return json('/api/mood-log', { method: 'POST', body: JSON.stringify({ pregnancyId, mood, notes }) })
  }
}

export const apiClient = new ApiClient()
