import { OpenAI } from 'openai'

// Mock OpenAI client to prevent crash
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-') && process.env.OPENAI_API_KEY.length > 10) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.log('OpenAI API key not configured - using mock mode');
}

export interface ChatRequest {
  message: string
  pregnancyWeek: number
  recentSymptoms: string[]
  riskLevel: string
  conversationHistory: Array<{ role: string; content: string }>
}

export interface ChatResponse {
  response: string
  confidence: number
  flags: string[]
  recommendations: Array<{ type: string; text: string }>
}

const isOpenAIConfigured = (): boolean => {
  return !!openai;
};

const getFocusAreas = (week: number): string => {
  if (week <= 4) return 'early pregnancy, confirming pregnancy, initial prenatal care';
  if (week <= 13) return 'first trimester concerns, morning sickness, fatigue, miscarriage risk';
  if (week <= 20) return 'second trimester, showing, anatomy ultrasound, movement';
  if (week <= 27) return 'late second trimester, glucose screening, Braxton Hicks';
  if (week <= 35) return 'third trimester, position, labor prep, sleep comfort';
  return 'late pregnancy, labor signs, NST tests, delivery preparation';
};

const generateMockResponse = (request: ChatRequest): ChatResponse => {
  const week = request.pregnancyWeek;
  const symptoms = request.recentSymptoms;

  let mockResponse = `Hi! I'm Nurtura, your AI doula. Week ${week} is an exciting time! `;

  if (symptoms.length > 0) {
    mockResponse += symptoms.join(', ') + ' are common. Rest and stay hydrated. ';
  }

  mockResponse += `Always consult your doctor for personalized advice. You\\'re doing great! 💕`;

  return {
    response: mockResponse,
    confidence: 0.85,
    flags: [],
    recommendations: [],
  };
};

export const generateChatResponse = async (request: ChatRequest): Promise<ChatResponse> => {
  if (!isOpenAIConfigured()) {
    console.warn('OpenAI not configured - mock response');
    return generateMockResponse(request);
  }

  try {
    const response = await openai!.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are Nurtura AI doula. Be supportive for week ${request.pregnancyWeek}.` },
        ...request.conversationHistory.slice(-10),
        { role: 'user', content: request.message },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || 'Sorry, I could not process that.';

    return {
      response: content,
      confidence: 0.95,
      flags: [],
      recommendations: [],
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    return generateMockResponse(request);
  }
};

