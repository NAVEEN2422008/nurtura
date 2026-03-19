import mongoose, { Schema, Document } from 'mongoose'

export interface IFamilyLink extends Document {
  pregnancyId: mongoose.Types.ObjectId
  motherId: mongoose.Types.ObjectId
  familyMemberId: mongoose.Types.ObjectId
  relationship: string
  inviteToken: string
  inviteStatus: 'pending' | 'accepted' | 'rejected' | 'expired'
  invitedAt: Date
  acceptedAt?: Date
  permissionsShared: string[]
  notificationLevel: 'updates' | 'important_only' | 'none'
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

const familyLinkSchema = new Schema<IFamilyLink>(
  {
    pregnancyId: {
      type: Schema.Types.ObjectId,
      ref: 'Pregnancy',
      required: true,
    },
    motherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    familyMemberId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relationship: String,
    inviteToken: {
      type: String,
      unique: true,
    },
    inviteStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    permissionsShared: [String],
    notificationLevel: {
      type: String,
      enum: ['updates', 'important_only', 'none'],
      default: 'updates',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
)

familyLinkSchema.index({ pregnancyId: 1 })
familyLinkSchema.index({ inviteToken: 1 })

export const FamilyLink = mongoose.model<IFamilyLink>('FamilyLink', familyLinkSchema)
