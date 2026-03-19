import { Router } from 'express'
import { createAppointment, getAppointments, updateAppointment } from '@/controllers/appointmentController'
import { authenticate } from '@/middleware/auth'

const router = Router()

router.post('/', authenticate, createAppointment)
router.get('/:pregnancyId', authenticate, getAppointments)
router.patch('/:id', authenticate, updateAppointment)

export default router
