import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '@/models/User'
import { Pregnancy } from '@/models/Pregnancy'
import { HealthRecord } from '@/models/HealthRecord'
import { Appointment } from '@/models/Appointment'
import { Conversation } from '@/models/Conversation'
import demoData from '../../data/demo-scenarios.json'

dotenv.config()

type DemoScenario = {
  name: string
  user: {
    email: string
    password: string
    name?: string
    role: string
    language: string
    ageGroup?: string
    medicalHistory?: string[]
  }
  pregnancy: {
    lastMenstrualPeriod: string
    expectedDeliveryDate: string
    currentWeek: number
    babySize?: string
    status?: string
    riskFactors?: string[]
  }
  healthRecords?: Array<{
    recordDate: string
    recordType: string
    vitals?: Record<string, unknown>
    labs?: Record<string, unknown>
    symptoms?: Array<Record<string, unknown>>
  }>
  appointments?: Array<{
    appointmentDate: string
    appointmentType: string
    location?: string
    providerName?: string
    status?: string
  }>
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  riskAssessment?: { riskLevel?: string }
}

type DemoPayload = { demoScenarios: DemoScenario[] }

const connectDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://root:password@localhost:27017/nurtura?authSource=admin'
    await mongoose.connect(dbUrl)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ DB connection failed:', error)
    process.exit(1)
  }
}

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Pregnancy.deleteMany({})
    await HealthRecord.deleteMany({})
    await Appointment.deleteMany({})
    await Conversation.deleteMany({})

    // Seed each scenario
    const demoScenarios = (demoData as unknown as DemoPayload).demoScenarios
    for (const scenario of demoScenarios) {
      console.log(`\n📝 Seeding scenario: ${scenario.name}`)

      // Create user
      const user = await User.create({
        email: scenario.user.email,
        password: scenario.user.password,
        name: scenario.user.name || scenario.user.email.split('@')[0],
        role: scenario.user.role,
        language: scenario.user.language,
        ageGroup: scenario.user.ageGroup,
        medicalHistory: scenario.user.medicalHistory || [],
      })
      console.log(`  ✓ User created: ${user.name}`)

      // Create pregnancy
      const pregnancyData = {
        userId: user._id,
        lastMenstrualPeriod: new Date(scenario.pregnancy.lastMenstrualPeriod),
        expectedDeliveryDate: new Date(scenario.pregnancy.expectedDeliveryDate),
        currentWeek: scenario.pregnancy.currentWeek,
        trimester: Math.ceil(scenario.pregnancy.currentWeek / 13),
        babySize: scenario.pregnancy.babySize,
        status: scenario.pregnancy.status,
        riskFactors: scenario.pregnancy.riskFactors || [],
      }
// if ((scenario.pregnancy as any).postpartumWeek !== undefined) pregnancyData.postpartumWeek = (scenario.pregnancy as any).postpartumWeek
      const pregnancy = await Pregnancy.create(pregnancyData)
      console.log(`  ✓ Pregnancy created: Week ${pregnancy.currentWeek}`)

      // Create health records
      if (scenario.healthRecords && scenario.healthRecords.length > 0) {
        for (const record of scenario.healthRecords) {
          await HealthRecord.create({
            pregnancyId: pregnancy._id,
            recordDate: new Date(record.recordDate),
            recordType: record.recordType,
            dataSource: 'user_entry',
            vitals: record.vitals,
            labs: record.labs || {},
            symptoms: record.symptoms,
          })
        }
        console.log(`  ✓ Health records created: ${scenario.healthRecords.length}`)
      }

      // Create appointments
      if (scenario.appointments && scenario.appointments.length > 0) {
        for (const appt of scenario.appointments) {
          await Appointment.create({
            pregnancyId: pregnancy._id,
            appointmentDate: new Date(appt.appointmentDate),
            appointmentType: appt.appointmentType,
            location: appt.location,
            providerName: appt.providerName,
            status: appt.status,
          })
        }
        console.log(`  ✓ Appointments created: ${scenario.appointments.length}`)
      }

      // Create conversation
      const riskLevel = scenario.riskAssessment ? scenario.riskAssessment.riskLevel || 'unknown' : 'unknown'
      await Conversation.create({
        pregnancyId: pregnancy._id,
        userId: user._id,
        messages: (scenario.conversationHistory || []).map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(),
        })),
        contextSnapshot: {
          pregnancyWeek: pregnancy.currentWeek,
          trimester: pregnancy.trimester,
          recentSymptoms: [],
          riskLevel,
        },
      })
      console.log(`  ✓ Conversation created with ${(scenario.conversationHistory || []).length} messages`)

      console.log(`  ✅ Scenario complete!`)
    }

    console.log('\n✨ Database seeded!')
    console.log(`Test accounts: password DemoPassword123!`)
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n✅ DB closed')
  }
}

connectDB().then(seedDatabase)

