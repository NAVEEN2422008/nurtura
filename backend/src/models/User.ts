import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'mother' | 'partner' | 'provider'
  language: string
  ageGroup: string
  medicalHistory: string[]
  allergies: string[]
  notificationPreferences: {
    emailReminders: boolean
    smsReminders: boolean
    pushNotifications: boolean
    appointmentDaysAhead: number
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['mother', 'partner', 'provider'],
      default: 'mother',
    },
    language: {
      type: String,
      enum: ['en', 'es', 'ta', 'hi', 'te'],
      default: 'en',
    },
    ageGroup: String,
    medicalHistory: [String],
    allergies: [String],
    notificationPreferences: {
      emailReminders: { type: Boolean, default: true },
      smsReminders: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      appointmentDaysAhead: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
