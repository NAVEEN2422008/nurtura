import mongoose, { Schema, Document } from 'mongoose'

export interface IRiskAssessment extends Document {
  pregnancyId: mongoose.Types.ObjectId
  assessmentDate: Date
  assessmentType: 'automated' | 'manual_review'
  riskScore: number
  riskLevel: 'low' | 'moderate' | 'high'
  conditions: Array<{
    name: string
    probability: number
    severity: string
    symptoms: string[]
    recommendation: string
    referralUrgency: 'routine' | 'urgent' | 'emergency'
  }>
  inputFactors: Record<string, boolean>
  modelVersion?: string
  confidenceScore?: number
  recommendedAction: string
  escalatedToProvider: boolean
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
}

const riskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    pregnancyId: {
      type: Schema.Types.ObjectId,
      ref: 'Pregnancy',
      required: true,
    },
    assessmentDate: {
      type: Date,
      default: Date.now,
    },
    assessmentType: {
      type: String,
      enum: ['automated', 'manual_review'],
      default: 'automated',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true,
    },
    conditions: [
      {
        name: String,
        probability: Number,
        severity: String,
        symptoms: [String],
        recommendation: String,
        referralUrgency: { type: String, enum: ['routine', 'urgent', 'emergency'] },
      },
    ],
    inputFactors: Schema.Types.Mixed,
    modelVersion: String,
    confidenceScore: Number,
    recommendedAction: String,
    escalatedToProvider: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

riskAssessmentSchema.index({ pregnancyId: 1 })
riskAssessmentSchema.index({ pregnancyId: 1, assessmentDate: -1 })
riskAssessmentSchema.index({ riskLevel: 1 })

export const RiskAssessment = mongoose.model<IRiskAssessment>('RiskAssessment', riskAssessmentSchema)
