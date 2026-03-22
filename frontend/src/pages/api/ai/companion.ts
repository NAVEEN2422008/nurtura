import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

const SAFE_FALLBACK: Record<string, { empathy: string; explanation: string; action: string; disclaimer: string }> = {
  en: {
    empathy: 'I hear you, and I am here to help.',
    explanation: 'I can provide general guidance, but a clinician can best address your specific situation.',
    action: 'Please consult your healthcare provider for personalized advice.',
    disclaimer: 'This is decision support only - not a diagnosis. Please consult your healthcare provider.',
  },
  hi: {
    empathy: 'मैं समझ सकती हूँ। मैं आपकी मदद के लिए यहाँ हूँ।',
    explanation: 'मैं सामान्य जानकारी दे सकती हूँ, लेकिन आपकी स्थिति के लिए डॉक्टर सबसे उपयुक्त हैं।',
    action: 'कृपया व्यक्तिगत सलाह के लिए अपने स्वास्थ्य प्रदाता से संपर्क करें।',
    disclaimer: 'यह निर्णय समर्थन है, चिकित्सा निदान नहीं। कृपया अपने स्वास्थ्य प्रदाता से परामर्श करें।',
  },
  ta: {
    empathy: 'உங்கள் கவலை புரிகிறது. நான் உதவ இங்கே இருக்கிறேன்.',
    explanation: 'நான் பொது வழிகாட்டுதலை வழங்க முடியும்; உங்கள் சூழ்நிலைக்கு மருத்துவர் சிறந்தவர்.',
    action: 'தனிப்பட்ட ஆலோசனைக்காக உங்கள் சுகாதார வழங்குநரை அணுகவும்.',
    disclaimer: 'இது முடிவெடுக்கும் ஆதரவு மட்டுமே - மருத்துவ நோயறிதல் அல்ல. உங்கள் சுகாதார வழங்குநரை அணுகவும்.',
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { pregnancyId, message, language } = req.body || {}
  const normalizedMessage = typeof message === 'string' ? message.trim() : ''
  const lang = typeof language === 'string' ? language : 'en'
  const safe = SAFE_FALLBACK[lang] || SAFE_FALLBACK.en

  if (!pregnancyId || typeof pregnancyId !== 'string' || !normalizedMessage) {
    return res.status(400).json({ success: false, error: 'Invalid input' })
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pregnancyId, message: normalizedMessage, language: lang }),
    })

    if (!backendRes.ok) {
      const errorData = await backendRes.json()
      return res.status(backendRes.status).json({ success: false, error: errorData.error || 'Backend error' })
    }

    const data = await backendRes.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(200).json({
      success: true,
      data: {
        empathy: safe.empathy,
        explanation: safe.explanation,
        action: safe.action,
        disclaimer: safe.disclaimer,
        confidence: 0.55,
        fallback: true,
      },
    })
  }
}
