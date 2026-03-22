import mongoose, { Document, Schema } from 'mongoose'

export interface ICommunityPost extends Document {
  pregnancyId?: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  userName: string
  content: string
  trimester: number
  anonymous: boolean
  likes: number
  likedBy: mongoose.Types.ObjectId[]
  commentsCount: number
  aiModerationScore: number
  approved: boolean
  timestamp: Date
}

const communityPostSchema = new Schema<ICommunityPost>({
  pregnancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pregnancy' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true, maxlength: 1000 },
  trimester: { type: Number, min: 1, max: 40 },
  anonymous: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentsCount: { type: Number, default: 0 },
  aiModerationScore: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
})

export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema)
