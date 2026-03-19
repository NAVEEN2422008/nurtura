import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📜 AI History API called:', req.query)

  // Demo chat history for dev
  const demoHistory = [
    {
      id: '1',
      role: 'user',
      content: 'How is my baby doing at 28 weeks?',
      timestamp: '2024-07-10T10:00:00Z',
    },
    {
      id: '2',
      role: 'assistant',
      content: 'At 28 weeks, your baby is about the size of an eggplant (14 inches, 2.2 lbs). Baby can now blink, turn head side to side, and has fat deposits forming for temperature regulation. You may notice Braxton Hicks contractions.',
      timestamp: '2024-07-10T10:01:30Z',
    },
    {
      id: '3',
      role: 'user',
      content: 'What should I watch for?',
      timestamp: '2024-07-10T10:02:00Z',
    },
    {
      id: '4',
      role: 'assistant',
      content: 'Watch for decreased fetal movement, severe headache, vision changes, sudden swelling, or upper abdominal pain. These could indicate preeclampsia. Normal: fatigue, Braxton Hicks (irregular). Call doctor if concerned.',
      timestamp: '2024-07-10T10:02:45Z',
    },
  ]

  res.status(200).json({
    success: true,
    data: demoHistory,
    total: demoHistory.length,
  })
}

