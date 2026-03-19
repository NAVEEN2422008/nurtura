import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🤖 AI Companion called:', req.body)

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { pregnancyId, message } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message is required' })
  }

  // Demo AI responses
  const demoResponses = {
    default: "Thanks for sharing! I'm here to support you through your pregnancy journey. What can I help with today? (Demo mode - local AI ready for Ollama integration)",
    symptoms: "I'm sorry you're experiencing symptoms. Track them in your Symptom Log. Watch for severe symptoms and contact your doctor. Want guidance on rest or hydration?",
    baby: "Your baby is growing beautifully! At your current week, baby development is on track. Would you like week-by-week updates?",
    emergency: "⚠️ Please seek immediate medical attention. Call emergency services if you experience bleeding, severe pain, vision changes, or swelling.",
  }

  const lowerMsg = message.toLowerCase()
  let response = demoResponses.default

  if (lowerMsg.includes('pain') || lowerMsg.includes('symptom')) response = demoResponses.symptoms
  if (lowerMsg.includes('baby') || lowerMsg.includes('size')) response = demoResponses.baby
  if (lowerMsg.includes('bleeding') || lowerMsg.includes('chest') || lowerMsg.includes('urgent')) response = demoResponses.emergency

  res.status(200).json({
    success: true,
    data: {
      response,
      flags: lowerMsg.includes('urgent') ? ['HIGH_PRIORITY'] : [],
      confidence: 0.8,
    },
  })
}

