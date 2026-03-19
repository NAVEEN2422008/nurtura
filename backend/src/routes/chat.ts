import { Router } from 'express'
import { sendMessage, getConversationHistory } from '@/controllers/chatController'
import { authenticate } from '@/middleware/auth'

const router = Router()

router.post('/', authenticate, sendMessage)
router.get('/history/:pregnancyId', authenticate, getConversationHistory)

export default router
