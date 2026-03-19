import mongoose, { Schema, Document } from 'mongoose'

export interface IPregnancy extends Document {
  userId: mongoose.Types.ObjectId
  lastMenstrualPeriod: Date
  expectedDeliveryDate: Date
  currentWeek: number
  trimester: number
  babySize: string
  status: 'planning' | 'active' | 'postpartum' | 'completed'
  riskFactors: string[]
  chronicConditions: string[]
  previousPregnancies: number
  postpartumWeek?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const pregnancySchema = new Schema<IPregnancy>(
  {
    userId: {
      type: String,
      required: true,
    },
    lastMenstrualPeriod: {
      type: Date,
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    currentWeek: {
      type: Number,
      min: 0,
      max: 42,
    },
    trimester: Number,
    babySize: String,
    status: {
      type: String,
      enum: ['planning', 'active', 'postpartum', 'completed'],
      default: 'planning',
    },
    riskFactors: [String],
    chronicConditions: [String],
    previousPregnancies: { type: Number, default: 0 },
    postpartumWeek: { type: Number, min: 0, max: 12 },
    notes: String,
  },
  { timestamps: true }
)

// Index for faster queries
pregnancySchema.index({ userId: 1 })
pregnancySchema.index({ status: 1, userId: 1 })

export const Pregnancy = mongoose.model<IPregnancy>('Pregnancy', pregnancySchema)
