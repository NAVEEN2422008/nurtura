import { Router } from 'express'
import { logVitals, getHealthRecords, triggerRiskAssessment } from '@/controllers/healthController'
import { authenticate } from '@/middleware/auth'

const router = Router()

router.post('/vitals', authenticate, logVitals)
router.get('/:pregnancyId', authenticate, getHealthRecords)
router.post('/risk-assessment', authenticate, triggerRiskAssessment)

export default router
