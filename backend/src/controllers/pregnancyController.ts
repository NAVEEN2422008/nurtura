import { Request, Response } from 'express'

export const createPregnancy = async (req: Request, res: Response) => {
  console.log('📝 createPregnancy called with:', req.body)
  try {
    const { expectedDeliveryDate, riskFactors = [], chronicConditions = [] } = req.body

    // Always return demo data for dev (no DB dependency)
    const demoData = {
      pregnancyId: 'demo_pregnancy_001',
      currentWeek: 28,
      trimester: 3,
      status: 'active',
      expectedDeliveryDate: expectedDeliveryDate || '2024-12-15T00:00:00.000Z',
      riskFactors,
      chronicConditions,
    }

    console.log('✅ Demo pregnancy created:', demoData)
    res.status(201).json({ success: true, data: demoData })
  } catch (error) {
    console.error('❌ createPregnancy error:', error)
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const getPregnancy = async (req: Request, res: Response) => {
  console.log('🔍 getPregnancy called')
  try {
    // Demo data for dev
    const demoData = {
      pregnancyId: 'demo_pregnancy_001',
      userId: 'demo_user',
      currentWeek: 28,
      trimester: 3,
      expectedDeliveryDate: '2024-12-15T00:00:00.000Z',
      status: 'active',
      riskFactors: [],
      chronicConditions: [],
    }

    res.json({ success: true, data: demoData })
  } catch (error) {
    console.error('❌ getPregnancy error:', error)
    res.status(500).json({ success: false, data: null })
  }
}

