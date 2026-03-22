import { Request, Response } from 'express'
import { Conversation } from '@/models/Conversation'
import { Pregnancy } from '@/models/Pregnancy'
import { HealthRecord } from '@/models/HealthRecord'
import { RiskAssessment } from '@/models/RiskAssessment'
import mongoose from 'mongoose'
import { generateChatResponse, ChatRequest } from '@/services/ai'

type PregnancyLike = {
  _id: string
  userId?: string
  currentWeek: number
  trimester: number
  expectedDeliveryDate: Date
  status: string
}

type ConversationMessage = {
  _id?: string
  role: string
  content: string
  timestamp?: Date
  metadata?: Record<string, unknown>
}

type ConversationLike = {
  _id?: string
  messages: ConversationMessage[]
  contextSnapshot?: Record<string, unknown>
  save?: () => Promise<void>
}

type HealthRecordLike = {
  symptoms?: Array<{ name?: string; severity?: string } | string>
}

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { pregnancyId, message, language } = req.body
    const userId = req.userId
    const allowedLanguages = new Set(['en', 'hi', 'ta'])
    const normalizedLanguage = allowedLanguages.has(language) ? language : 'en'
    const normalizedMessage = typeof message === 'string' ? message.trim().slice(0, 600) : ''

    if (!pregnancyId || typeof pregnancyId !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid pregnancyId' })
    }
    if (!normalizedMessage) {
      return res.status(400).json({ success: false, error: 'Message is required' })
    }

    let pregnancy: PregnancyLike | null = null
    if (!mongoose.Types.ObjectId.isValid(pregnancyId)) {
      // Demo mode - mock pregnancy for Ollama context
      pregnancy = {
        _id: pregnancyId,
        userId,
        currentWeek: 28,
        trimester: 3,
        expectedDeliveryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        status: 'active',
      }
    } else {
      try {
        const pregnancyDoc = await Pregnancy.findById(pregnancyId)
        pregnancy = pregnancyDoc as unknown as PregnancyLike | null
      } catch (e) {
        pregnancy = null
      }
      if (!pregnancy) {
        return res.status(404).json({ success: false, error: 'Pregnancy not found' })
      }
    }

    // Get or create conversation for this pregnancy
    let conversation: ConversationLike | null = null
    try {
      const conversationDoc = await Conversation.findOne({ pregnancyId })
      conversation = conversationDoc as unknown as ConversationLike | null
    } catch (e) {
      conversation = null
    }
    if (!conversation) {
      try {
        const conversationDoc = await Conversation.create({
          pregnancyId,
          userId,
          messages: [],
        })
        conversation = conversationDoc as unknown as ConversationLike
      } catch (e) {
        // No DB, skip saving, proceed with AI
        conversation = { messages: [] }
      }
    }
    if (!conversation) {
      conversation = { messages: [] }
    }

    // Fetch recent context - graceful for demo/no DB
    let recentHealthRecords: HealthRecordLike[] = []
    let latestRiskAssessment: { riskLevel?: string } | null = null
    try {
      recentHealthRecords = (await HealthRecord.find({ pregnancyId })
        .sort({ recordDate: -1 })
        .limit(5)) as unknown as HealthRecordLike[]
      latestRiskAssessment = (await RiskAssessment.findOne({ pregnancyId }).sort({ assessmentDate: -1 })) as unknown as {
        riskLevel?: string
      } | null
    } catch (e) {
      console.log('No DB records - using empty context')
    }
    const recentSymptoms = recentHealthRecords
      .flatMap((r) => r.symptoms || [])
      .map((s) => (typeof s === 'string' ? s : s.name || ''))
      .filter((s) => Boolean(s))
      .slice(0, 5)

    // Build AI request
    const aiRequest: ChatRequest = {
      message: normalizedMessage,
      pregnancyWeek: pregnancy.currentWeek,
      recentSymptoms,
      riskLevel: latestRiskAssessment?.riskLevel || 'unknown',
      conversationHistory: conversation.messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      language: normalizedLanguage,
    }

    // Get AI response
    const aiResponse = await generateChatResponse(aiRequest)

    // Save message pair to conversation if DB available
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    })

    conversation.messages.push({
      role: 'assistant',
      content: [aiResponse.empathy, aiResponse.explanation, aiResponse.action].filter(Boolean).join('\\n\\n'),
      metadata: {
        empathy: aiResponse.empathy,
        explanation: aiResponse.explanation,
        action: aiResponse.action,
        disclaimer: aiResponse.disclaimer,
        confidence: aiResponse.confidence,
        fallback: aiResponse.fallback,
      },
      timestamp: new Date(),
    })

    // Update context snapshot
    conversation.contextSnapshot = {
      pregnancyWeek: pregnancy.currentWeek,
      trimester: pregnancy.trimester,
      recentSymptoms,
      riskLevel: latestRiskAssessment?.riskLevel || 'unknown',
    }

    try {
      await conversation.save?.()
    } catch (e) {
      console.log('No DB - skipped saving conversation')
    }

    res.json({
      success: true,
      data: {
        messageId: conversation.messages[conversation.messages.length - 1]._id,
        empathy: aiResponse.empathy,
        explanation: aiResponse.explanation,
        action: aiResponse.action,
        disclaimer: aiResponse.disclaimer,
        confidence: aiResponse.confidence,
        fallback: aiResponse.fallback,
        recommendations: [],
        flags: [],
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ success: false, error: 'Failed to process chat message' })
  }
}

export const getConversationHistory = async (req: Request, res: Response) => {
  try {
    const pregnancyId = (req.params?.pregnancyId as string) || (req.query?.pregnancyId as string)
    if (typeof pregnancyId !== 'string' || !pregnancyId) {
      return res.status(400).json({ success: false, error: 'Invalid pregnancyId' })
    }
    if (!mongoose.Types.ObjectId.isValid(pregnancyId)) {
      // Demo mode - return empty for demo pregnancyId
      return res.json({
        success: true,
        data: {
          conversationId: null,
          messages: [],
          contextSnapshot: null,
        },
      })
    }
    const { limit = 50, offset = 0 } = req.query as { limit?: string | number; offset?: string | number }

    const conversation = await Conversation.findOne({ pregnancyId: pregnancyId })
      .select('messages contextSnapshot createdAt')
      .lean()

    if (!conversation) {
      return res.json({
        success: true,
        data: {
          conversationId: null,
          messages: [],
          contextSnapshot: null,
        },
      })
    }

    // Apply pagination
    const messages = conversation.messages.slice(
      Number(offset),
      Number(offset) + Number(limit)
    )

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        messageCount: conversation.messages.length,
        messages,
        contextSnapshot: conversation.contextSnapshot,
      },
    })
  } catch (error) {
    console.error('History fetch error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch conversation history' })
  }
}
