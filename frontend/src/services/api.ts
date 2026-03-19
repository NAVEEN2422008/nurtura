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
    return json(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/pregnancies`, {
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
    return json(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/pregnancies`)
  }

async getDashboard(): Promise<any> {
    // Proxy to backend
    return json(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard`)
  }

  // Pregnancy endpoints
  // Chat endpoints
  async sendMessage(pregnancyId: string, message: string): Promise<any> {
    return json('/api/ai/companion', {
      method: 'POST',
      body: JSON.stringify({ pregnancyId, message }),
    })
  }

  async getChatHistory(pregnancyId: string, limit: number = 50, offset: number = 0): Promise<any> {
    return json(`/api/ai/history?pregnancyId=${encodeURIComponent(pregnancyId)}&limit=${limit}&offset=${offset}`)
  }

  async logVitals(pregnancyId: string, vitals: any): Promise<any> {
    // v1: vitals are stored as wearable/manual metrics later; keep API placeholder
    return json('/api/wearables/manual', { method: 'POST', body: JSON.stringify({ pregnancyId, ...vitals }) })
  }

  async logSymptoms(pregnancyId: string, symptoms: Array<{name: string; severity: 'mild' | 'moderate' | 'severe'; notes?: string}>): Promise<any> {
    return json('/api/symptom-log', { method: 'POST', body: JSON.stringify({ pregnancyId, symptoms }) })
  }

  async getRecentSymptoms(pregnancyId: string): Promise<any> {
    return json(`/api/symptom-log?limit=10&pregnancyId=${encodeURIComponent(pregnancyId)}`)
  }

  async logMood(input: { pregnancyId?: string; mood: 'happy' | 'okay' | 'neutral' | 'sad' | 'very_sad'; notes?: string }): Promise<any> {
    return json('/api/mood-log', { method: 'POST', body: JSON.stringify(input) })
  }
}

export const apiClient = new ApiClient()
