import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  pregnancyId?: mongoose.Types.ObjectId
  type: string
  title: string
  message: string
  actionUrl?: string
  data?: Record<string, unknown>
  status: 'pending' | 'sent' | 'failed' | 'read'
  deliveryChannels: string[]
  createdAt: Date
  scheduledFor?: Date
  sentAt?: Date
  readAt?: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pregnancyId: {
      type: Schema.Types.ObjectId,
      ref: 'Pregnancy',
    },
    type: {
      type: String,
      required: true,
    },
    title: String,
    message: String,
    actionUrl: String,
    data: Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'read'],
      default: 'pending',
    },
    deliveryChannels: {
      type: [String],
      default: ['in-app'],
    },
    scheduledFor: Date,
    sentAt: Date,
    readAt: Date,
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1 })
notificationSchema.index({ status: 1 })
notificationSchema.index({ createdAt: -1 })

export const Notification = mongoose.model<INotification>('Notification', notificationSchema)
