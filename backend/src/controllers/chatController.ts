import { Request, Response } from 'express'
import { Conversation } from '@/models/Conversation'
import { Pregnancy } from '@/models/Pregnancy'
import { HealthRecord } from '@/models/HealthRecord'
import { RiskAssessment } from '@/models/RiskAssessment'
import { generateChatResponse, ChatRequest } from '@/services/ai'

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { pregnancyId, message } = req.body
    const userId = req.userId

    // Validate pregnancy exists
    const pregnancy = await Pregnancy.findById(pregnancyId)
    if (!pregnancy || pregnancy.userId.toString() !== userId) {
      return res.status(404).json({ success: false, error: 'Pregnancy not found' })
    }

    // Get or create conversation for this pregnancy
    let conversation = await Conversation.findOne({ pregnancyId })
    if (!conversation) {
      conversation = await Conversation.create({
        pregnancyId,
        userId,
        messages: [],
      })
    }

    // Fetch recent context
    const recentHealthRecords = await HealthRecord.find({ pregnancyId })
      .sort({ recordDate: -1 })
      .limit(5)

    const recentSymptoms = recentHealthRecords
      .filter((r) => r.symptoms)
      .flatMap((r) => r.symptoms || [])
      .slice(0, 5)

    const latestRiskAssessment = await RiskAssessment.findOne({ pregnancyId }).sort({ assessmentDate: -1 })

    // Build AI request
    const aiRequest: ChatRequest = {
      message,
      pregnancyWeek: pregnancy.currentWeek,
      recentSymptoms,
      riskLevel: latestRiskAssessment?.riskLevel || 'unknown',
      conversationHistory: conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }

    // Get AI response
    const aiResponse = await generateChatResponse(aiRequest)

    // Save message pair to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    })

    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.response,
      timestamp: new Date(),
      confidence: aiResponse.confidence,
      flags: aiResponse.flags,
    })

    // Update context snapshot
    conversation.contextSnapshot = {
      pregnancyWeek: pregnancy.currentWeek,
      trimester: pregnancy.trimester,
      recentSymptoms,
      riskLevel: latestRiskAssessment?.riskLevel || 'unknown',
    }

    await conversation.save()

    res.json({
      success: true,
      data: {
        messageId: conversation.messages[conversation.messages.length - 1]._id,
        response: aiResponse.response,
        confidence: aiResponse.confidence,
        recommendations: aiResponse.recommendations,
        flags: aiResponse.flags,
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
    const { pregnancyId } = req.params
    const { limit = 50, offset = 0 } = req.query

    const conversation = await Conversation.findOne({ pregnancyId })
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
