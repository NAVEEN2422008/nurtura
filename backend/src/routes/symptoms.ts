import { Router } from 'express'
import { logSymptoms, getRecentSymptoms } from '@/controllers/symptomController'
import { authenticate } from '@/middleware/auth'

const router = Router()

router.post('/', authenticate, logSymptoms)
router.get('/:pregnancyId', authenticate, getRecentSymptoms)

export default router

