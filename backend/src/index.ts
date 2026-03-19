import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRoutes from '@/routes/auth'
import pregnanciesRoutes from '@/routes/pregnancies'
import dashboardRoutes from '@/routes/dashboard'
import chatRoutes from '@/routes/chat'
import healthRoutes from '@/routes/health'
import appointmentsRoutes from '@/routes/appointments'
import symptomsRoutes from '@/routes/symptoms'
import { errorHandler } from '@/middleware/auth'

dotenv.config()

const app: Express = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection (optional)
const connectDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://root:password@localhost:27017/nurtura?authSource=admin'
    await mongoose.connect(dbUrl)
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    console.log('🚀 Server continuing without database (routes will use in-memory or fail gracefully)')
  }
}

// Health check (always available)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' },
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/pregnancies', pregnanciesRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/symptoms', symptomsRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404,
    timestamp: new Date().toISOString()
  })
})

// Error handler
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3002
connectDB()
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: GET http://localhost:${PORT}/health`)
  console.log(`🔐 API docs: See docs/API.md for endpoint reference`)
})

