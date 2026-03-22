import { Request, Response } from 'express'
import { Appointment } from '@/models/Appointment'

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { pregnancyId, appointmentDate, appointmentType, location, providerName, notes } = req.body

    const appointment = await Appointment.create({
      pregnancyId,
      appointmentDate: new Date(appointmentDate),
      appointmentType,
      location,
      providerName,
      notes,
      status: 'scheduled',
    })

    res.status(201).json({
      success: true,
      data: {
        appointmentId: appointment._id,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
        createdAt: appointment.createdAt,
      },
    })
  } catch (error) {
    console.error('Appointment creation error:', error)
    res.status(500).json({ success: false, error: 'Failed to create appointment' })
  }
}

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { pregnancyId } = req.params
    const { status, days = 180 } = req.query

    const query: Record<string, unknown> = { pregnancyId }
    if (status) query.status = status

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + Number(days))

    query.appointmentDate = { $gte: startDate, $lte: endDate }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1 })
      .lean()

    // Find next appointment
    const nextAppointment = appointments.find((a) => new Date(a.appointmentDate) > new Date())

    res.json({
      success: true,
      data: {
        pregnancyId,
        appointmentCount: appointments.length,
        appointments,
        nextAppointment: nextAppointment ? {
          appointmentId: nextAppointment._id,
          daysUntil: Math.floor(
            (new Date(nextAppointment.appointmentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          ),
        } : null,
      },
    })
  } catch (error) {
    console.error('Appointments fetch error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' })
  }
}

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, completionNotes, resultsUrl } = req.body

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status,
        completionNotes,
        resultsUrl,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
      { new: true }
    )

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' })
    }

    res.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    console.error('Appointment update error:', error)
    res.status(500).json({ success: false, error: 'Failed to update appointment' })
  }
}
