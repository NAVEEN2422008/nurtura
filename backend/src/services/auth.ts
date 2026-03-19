import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const JWT_EXPIRY = '1h'

export const generateToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

export const verifyToken = (token: string): { sub: string } => {
  return jwt.verify(token, JWT_SECRET) as { sub: string }
}
