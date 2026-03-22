import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string
    user?: Record<string, unknown>
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      req.userId = `demo_${Date.now()}`
      console.log('🆓 No auth header - mock userId')
      return next()
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as { sub: string }
    
    req.userId = decoded.sub
    next()
  } catch (error) {
    req.userId = `demo_${Date.now()}`
    console.log('🆓 Auth fail - mock userId')
    next()
  }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  void _next
  console.error(err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
}
