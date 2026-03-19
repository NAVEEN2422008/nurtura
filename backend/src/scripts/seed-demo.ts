import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '@/models/User'
import { Pregnancy } from '@/models/Pregnancy'
import { HealthRecord } from '@/models/HealthRecord'
import { Appointment } from '@/models/Appointment'
import { Conversation } from '@/models/Conversation'
import demoData from '../../data/demo-scenarios.json'

dotenv.config()

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
    for (const scenario of demoData.demoScenarios) {
      console.log(`\n📝 Seeding scenario: ${scenario.name}`)

      // Create user
      const user = await User.create({
        email: scenario.user.email,
        password: scenario.user.password,
        name: scenario.user.name,
        role: scenario.user.role,
        language: scenario.user.language,
        ageGroup: scenario.user.ageGroup,
        medicalHistory: scenario.user.medicalHistory || [],
      })
      console.log(`  ✓ User created: ${user.name}`)

      // Create pregnancy
      const pregnancy = await Pregnancy.create({
        userId: user._id,
        lastMenstrualPeriod: new Date(scenario.pregnancy.lastMenstrualPeriod),
        expectedDeliveryDate: new Date(scenario.pregnancy.expectedDeliveryDate),
        currentWeek: scenario.pregnancy.currentWeek,
        trimester: Math.ceil(scenario.pregnancy.currentWeek / 13),
        babySize: scenario.pregnancy.babySize,
        status: scenario.pregnancy.status,
        riskFactors: scenario.pregnancy.riskFactors || [],
        postpartumWeek: scenario.pregnancy.postpartumWeek,
      })
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
            labs: record.labs,
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

      // Create conversation with history
      if (scenario.conversationHistory && scenario.conversationHistory.length > 0) {
        const conversation = await Conversation.create({
          pregnancyId: pregnancy._id,
          userId: user._id,
          messages: scenario.conversationHistory.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(),
          })),
          contextSnapshot: {
            pregnancyWeek: pregnancy.currentWeek,
            trimester: pregnancy.trimester,
            recentSymptoms: [],
            riskLevel: scenario.riskAssessment?.riskLevel || 'unknown',
          },
        })
        console.log(`  ✓ Conversation created with ${scenario.conversationHistory.length} messages`)
      }

      console.log(`  ✅ Scenario complete!`)
    }

    console.log('\n✨ Database seeding complete!')
    console.log(`\n📊 Summary:`)
    const userCount = await User.countDocuments()
    const pregnancyCount = await Pregnancy.countDocuments()
    const recordCount = await HealthRecord.countDocuments()
    const appointmentCount = await Appointment.countDocuments()
    console.log(`  Users: ${userCount}`)
    console.log(`  Pregnancies: ${pregnancyCount}`)
    console.log(`  Health Records: ${recordCount}`)
    console.log(`  Appointments: ${appointmentCount}`)

    console.log(`\n🧪 Test Accounts (password: DemoPassword123!)`)
    const users = await User.find({}, { email: 1 }).lean()
    users.forEach((u) => {
      console.log(`  - ${u.email}`)
    })
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n✅ Database connection closed')
  }
}

// Run seeding
connectDB().then(() => seedDatabase())
