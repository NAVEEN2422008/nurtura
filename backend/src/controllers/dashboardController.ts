import { Request, Response } from 'express'

export const getDashboard = async (req: Request, res: Response) => {
  console.log('📊 Dashboard data requested')
  res.json({
    success: true,
    data: {
      pregnancy: {
        pregnancyId: 'demo_pregnancy_001',
        currentWeek: 28,
        trimester: 3,
        expectedDeliveryDate: '2024-12-15',
        status: 'active',
        riskLevel: 'low',
        nextCheckup: '2024-07-15',
      },
      recentVitals: {
        bloodPressure: '118/76',
        heartRate: 72,
        weight: '68kg',
        temperature: '36.7°C',
      },
      recentSymptoms: [
        { name: 'Fatigue', severity: 'mild', date: '2024-07-10' },
        { name: 'Nausea', severity: 'moderate', date: '2024-07-09' },
      ],
      riskScore: 12,
      recommendations: [
        'Stay hydrated',
        'Light walking daily',
        'Monitor blood pressure',
      ],
      notifications: 2,
      chatMessages: 5,
    },
  })
}

