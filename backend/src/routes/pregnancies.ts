import { Router } from 'express'
import { createPregnancy, getPregnancy } from '@/controllers/pregnancyController'
import { authenticate } from '@/middleware/auth'

const router = Router()

router.post('/', createPregnancy) // Optional auth for dev
router.get('/', getPregnancy) // List by user (mock)
router.get('/:id', authenticate, getPregnancy)

export default router
