import { Request, Response } from 'express'
import { SymptomLog } from '@/models/SymptomLog'
import { triggerRiskAssessment } from '@/controllers/healthController'

export const logSymptoms = async (req: Request, res: Response) => {
  try {
    const { pregnancyId, symptoms } = req.body
    const userId = req.userId

    if (!pregnancyId || !symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ success: false, error: 'Invalid input' })
    }

    const symptomLog = await SymptomLog.create({
      pregnancyId,
      userId,
      symptoms
    })

    // Check for emergency symptoms
    const emergencySymptoms = ['bleeding', 'chest_pain', 'shortness_breath']
    const severeSymptoms = symptoms.some(s => emergencySymptoms.includes(s.name) && s.severity === 'severe')
    
    // Trigger risk assessment
    const mockReq = { body: { pregnancyId } } as unknown as Request
    const mockRes = {
      status: () => mockRes as Response,
      json: () => mockRes as Response,
    } as unknown as Response
    await triggerRiskAssessment(mockReq, mockRes)

    res.json({
      success: true,
      data: {
        symptomLogId: symptomLog._id,
        symptoms: symptomLog.symptoms,
        riskTriggered: true,
        isEmergency: severeSymptoms
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Failed to log symptoms' })
  }
}

export const getRecentSymptoms = async (req: Request, res: Response) => {
  try {
    const { pregnancyId } = req.params
    const userId = req.userId

    const logs = await SymptomLog.find({ 
      pregnancyId, 
      userId 
    })
    .sort({ timestamp: -1 })
    .limit(10)

    res.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Failed to fetch symptoms' })
  }
}

