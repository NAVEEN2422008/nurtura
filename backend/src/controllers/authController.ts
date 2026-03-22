import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { User } from '@/models/User'
import { generateToken } from '@/services/auth'

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, language } = req.body

    if (mongoose.connection.readyState !== 1) {
      const mockUserId = 'demo_' + Date.now()
      const token = generateToken(mockUserId)
      return res.status(201).json({
        success: true,
        data: {
          userId: mockUserId,
          email,
          name: name || 'Demo User',
          role: role || 'mother',
          language: language || 'en',
          token,
          expiresIn: 3600,
        },
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' })
    }

    const user = await User.create({
      email,
      password,
      name,
      role: role || 'mother',
      language: language || 'en',
    })

    const token = generateToken(user._id.toString())

    res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
        token,
        expiresIn: 3600,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Signup failed' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    // Always use mock mode for dev (ignore DB)
    const mockUserId = `demo_user_${Date.now()}`
    const token = generateToken(mockUserId)
    return res.json({
      success: true,
      data: {
        userId: mockUserId,
        email,
        name: 'Demo User',
        role: 'mother',
        language: 'en',
        token,
        expiresIn: 3600,
      },
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: {
          userId,
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'mother',
          language: 'en',
          medicalHistory: {},
        },
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
        medicalHistory: user.medicalHistory,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Failed to fetch profile' })
  }
}

