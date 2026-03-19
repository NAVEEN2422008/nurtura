import { Request, Response } from 'express'
import { HealthRecord } from '@/models/HealthRecord'
import { Pregnancy } from '@/models/Pregnancy'
import { RiskAssessment } from '@/models/RiskAssessment'
import { calculateRiskScore, RiskInput } from '@/services/risk'

export const logVitals = async (req: Request, res: Response) => {
  try {
    const { pregnancyId, systolicBP, diastolicBP, weight, heartRate, notes } = req.body

    const healthRecord = await HealthRecord.create({
      pregnancyId,
      recordDate: new Date(),
      recordType: 'vitals',
      dataSource: 'user_entry',
      vitals: {
        systolicBP,
        diastolicBP,
        weight,
        heartRate,
      },
      notes,
    })

    // Trigger risk assessment
    const pregnancy = await Pregnancy.findById(pregnancyId)
    if (pregnancy) {
      const riskInput: RiskInput = {
        pregnancyWeek: pregnancy.currentWeek,
        age: 30, // TODO: Get from user profile
        vitals: { systolicBP, diastolicBP, weight },
        medicalHistory: pregnancy.chronicConditions || [],
        riskFactors: pregnancy.riskFactors || [],
        symptoms: [],
      }

      const riskResult = calculateRiskScore(riskInput)

      // Save risk assessment
      await RiskAssessment.create({
        pregnancyId,
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        conditions: riskResult.conditions,
        inputFactors: { vitals: true },
        recommendedAction: riskResult.conditions[0]?.recommendation || 'Continue routine monitoring',
        assessmentType: 'automated',
      })
    }

    res.status(201).json({
      success: true,
      data: {
        recordId: healthRecord._id,
        recordType: 'vitals',
        recordDate: healthRecord.recordDate,
        vitals: healthRecord.vitals,
      },
    })
  } catch (error) {
    console.error('Vitals log error:', error)
    res.status(500).json({ success: false, error: 'Failed to log vitals' })
  }
}

export const getHealthRecords = async (req: Request, res: Response) => {
  try {
    const { pregnancyId } = req.params
    const { recordType, limit = 20, days = 30 } = req.query

    const query: any = { pregnancyId }
    if (recordType) query.recordType = recordType

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))
    query.recordDate = { $gte: startDate }

    const records = await HealthRecord.find(query)
      .sort({ recordDate: -1 })
      .limit(Number(limit))
      .lean()

    res.json({
      success: true,
      data: {
        pregnancyId,
        recordCount: records.length,
        records,
        summary: {
          latestBP: records[0]?.vitals 
            ? `${records[0].vitals.systolicBP}/${records[0].vitals.diastolicBP}`
            : 'N/A',
          latestWeight: records[0]?.vitals?.weight || null,
        },
      },
    })
  } catch (error) {
    console.error('Health records fetch error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch health records' })
  }
}

export const triggerRiskAssessment = async (req: Request, res: Response) => {
  try {
    const { pregnancyId } = req.body

    // Fetch pregnancy & latest vitals
    const pregnancy = await Pregnancy.findById(pregnancyId)
    if (!pregnancy) {
      return res.status(404).json({ success: false, error: 'Pregnancy not found' })
    }

    const latestVitals = await HealthRecord.findOne({
      pregnancyId,
      recordType: 'vitals',
    }).sort({ recordDate: -1 })

    const riskInput: RiskInput = {
      pregnancyWeek: pregnancy.currentWeek,
      age: 30, // TODO: Get from user
      vitals: latestVitals?.vitals || { systolicBP: 0, diastolicBP: 0, weight: 0 },
      medicalHistory: pregnancy.chronicConditions || [],
      riskFactors: pregnancy.riskFactors || [],
      symptoms: [],
    }

    const riskResult = calculateRiskScore(riskInput)

    // Save assessment
    const assessment = await RiskAssessment.create({
      pregnancyId,
      riskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      conditions: riskResult.conditions,
      inputFactors: { vitals: !!latestVitals, medicalHistory: true },
      recommendedAction: riskResult.conditions[0]?.recommendation || 'No immediate action needed',
      assessmentType: 'automated',
    })

    res.json({
      success: true,
      data: {
        assessmentId: assessment._id,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        conditions: assessment.conditions,
        recommendedAction: assessment.recommendedAction,
        assessmentDate: assessment.assessmentDate,
      },
    })
  } catch (error) {
    console.error('Risk assessment error:', error)
    res.status(500).json({ success: false, error: 'Failed to calculate risk' })
  }
}
