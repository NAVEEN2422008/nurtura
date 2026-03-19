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

const communityPostSchema
