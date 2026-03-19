import mongoose, { Schema, Document } from 'mongoose'

export interface IConversation extends Document {
  pregnancyId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  title?: string
  messages: Array<{
    _id?: mongoose.Types.ObjectId
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    confidence?: number
    flags?: string[]
  }>
  contextSnapshot?: {
    pregnancyWeek: number
    trimester: number
    recentSymptoms: string[]
    riskLevel: string
  }
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

const conversationSchema = new Schema<IConversation>(
  {
    pregnancyId: {
      type: Schema.Types.ObjectId,
      ref: 'Pregnancy',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: String,
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        confidence: Number,
        flags: [String],
      },
    ],
    contextSnapshot: {
      pregnancyWeek: Number,
      trimester: Number,
      recentSymptoms: [String],
      riskLevel: String,
    },
    tags: [String],
  },
  { timestamps: true }
)

conversationSchema.index({ pregnancyId: 1 })
conversationSchema.index({ userId: 1 })
conversationSchema.index({ pregnancyId: 1, updatedAt: -1 })

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema)
