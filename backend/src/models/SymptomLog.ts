import mongoose, { Document, Schema } from 'mongoose'

export interface ISymptomLog extends Document {
  pregnancyId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  symptoms: Array<{
    name: string  // 'headache', 'swelling', 'dizziness', etc.
    severity: 'mild' | 'moderate' | 'severe'
    notes?: string
  }>
  timestamp: Date
  triggeredRiskAssessment?: boolean
}

const symptomSchema = new Schema<ISymptomLog>({
  pregnancyId: {
    type: Schema.Types.ObjectId,
    ref: 'Pregnancy',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: [{
    name: {
      type: String,
      required: true,
      enum: [
        'headache', 'swelling', 'dizziness', 'nausea', 'bleeding', 
        'fatigue', 'anxiety', 'blurred_vision', 'chest_pain', 'shortness_breath'
      ]
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    },
    notes: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  triggeredRiskAssessment: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

symptomSchema.index({ pregnancyId: 1, timestamp: -1 })
symptomSchema.index({ userId: 1 })

export const SymptomLog = mongoose.model<ISymptomLog>('SymptomLog', symptomSchema)

