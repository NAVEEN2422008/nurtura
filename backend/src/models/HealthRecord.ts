import mongoose, { Schema, Document } from 'mongoose'

export interface IHealthRecord extends Document {
  pregnancyId: mongoose.Types.ObjectId
  recordDate: Date
  recordType: 'vitals' | 'lab' | 'ultrasound' | 'symptom_log'
  dataSource: 'user_entry' | 'provider_upload' | 'device_sync'
  vitals?: {
    systolicBP: number
    diastolicBP: number
    heartRate: number
    temperature?: number
    weight: number
    weightGain?: number
  }
  labs?: {
    glucoseFasting?: number
    glucoseRandom?: number
    hemoglobin?: number
    proteinUrine?: boolean
  }
  symptoms?: string[]
  symptomSeverity?: Record<string, number>
  notes?: string
  createdAt: Date
}

const healthRecordSchema = new Schema<IHealthRecord>(
  {
    pregnancyId: {
      type: Schema.Types.ObjectId,
      ref: 'Pregnancy',
      required: true,
    },
    recordDate: {
      type: Date,
      required: true,
    },
    recordType: {
      type: String,
      enum: ['vitals', 'lab', 'ultrasound', 'symptom_log'],
      required: true,
    },
    dataSource: {
      type: String,
      enum: ['user_entry', 'provider_upload', 'device_sync'],
      default: 'user_entry',
    },
    vitals: {
      systolicBP: Number,
      diastolicBP: Number,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      weightGain: Number,
    },
    labs: {
      glucoseFasting: Number,
      glucoseRandom: Number,
      hemoglobin: Number,
      proteinUrine: Boolean,
    },
    symptoms: [String],
    symptomSeverity: Schema.Types.Mixed,
    notes: String,
  },
  { timestamps: true }
)

healthRecordSchema.index({ pregnancyId: 1 })
healthRecordSchema.index({ pregnancyId: 1, recordDate: -1 })

export const HealthRecord = mongoose.model<IHealthRecord>('HealthRecord', healthRecordSchema)
