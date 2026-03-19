import mongoose, { Schema, Document } from 'mongoose'

export interface IAppointment extends Document {
  pregnancyId: mongoose.Types.ObjectId
  appointmentDate: Date
  appointmentType: string
  location: string
  providerName: string
  notes?: string
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled'
  completionNotes?: string
  resultsUrl?: string
  reminderSent: {
    oneWeekBefore: boolean
    oneDayBefore: boolean
    dayOfAppointment: boolean
  }
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const appointmentSchema = new Schema<IAppointment>(
  {
    pregnancyId: {
      type: Schema.Types.ObjectId,
      ref: 'Pregnancy',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentType: {
      type: String,
      required: true,
    },
    location: String,
    providerName: String,
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'missed', 'cancelled'],
      default: 'scheduled',
    },
    completionNotes: String,
    resultsUrl: String,
    reminderSent: {
      oneWeekBefore: { type: Boolean, default: false },
      oneDayBefore: { type: Boolean, default: false },
      dayOfAppointment: { type: Boolean, default: false },
    },
    completedAt: Date,
  },
  { timestamps: true }
)

appointmentSchema.index({ pregnancyId: 1 })
appointmentSchema.index({ appointmentDate: 1 })
appointmentSchema.index({ status: 1 })

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema)
