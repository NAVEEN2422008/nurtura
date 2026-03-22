// Ollama integration using fetch (no external deps needed)

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:3b';  // Free, fast, empathetic for mood-aware pregnancy chat
console.log(`Ollama: ${ollamaBaseUrl} model: ${ollamaModel}`);

const responseCache = new Map<string, ChatResponse>();

const MAX_MESSAGE_CHARS = 600;
const MAX_SECTION_CHARS = 420;
// Word limits for response brevity (no-confirmation policy)
const MAX_GENERAL_WORDS = 40;     // General queries: ~40 words (1-2 sentences)
const MAX_MEDICAL_WORDS = 30;     // Medical queries: ~30 words (with disclaimer)
const EMERGENCY_KEYWORDS = [
  'bleeding',
  'heavy bleeding',
  'soaking',
  'severe headache',
  'blurred vision',
  'swelling',
  'chest pain',
  'shortness of breath',
  'no movement',
  'reduced movement',
  'fainting',
  'seizure',
  'fits',
  'loss of consciousness',
  'water broke',
];

const MEDICAL_KEYWORDS = [
  'headache', 'swelling', 'dizziness', 'nausea', 'bleeding', 'fatigue',
  'blurred vision', 'chest pain', 'shortness of breath', 'movement',
  'pregnancy', 'symptom', 'pain', 'pressure', 'blood', 'vomit',
  'fever', 'contraction', 'leak', 'spotting', 'cramp', 'bp', 'sugar'
];

export const isMedicalQuery = (message: string): boolean => {
  const normalized = normalizeText(message).toLowerCase();
  return MEDICAL_KEYWORDS.some(keyword => normalized.includes(keyword));
};

const DIAGNOSIS_PATTERNS: RegExp[] = [
  /\byou have\b/i,
  /\bdiagnos(?:is|ed|e)\b/i,
  /\bthis is\b/i,
  /\byou are\b.*\b(preeclampsia|diabetes|hypertension|anemia|infection)\b/i,
];

const SAFE_TEMPLATES: Record<string, { disclaimer: string; fallbackAction: string; empathy: string; explanation: string; emergencyAction: string; emergencyExplanation: string }> = {
  en: {
    disclaimer: '⚠️ This is decision support ONLY - not medical diagnosis or treatment. Consult your healthcare provider immediately for personalized advice.',
    fallbackAction: 'Consult your healthcare provider for personalized advice.',
    empathy: 'I hear you, and I am here to help.',
    explanation: 'I can provide general guidance, but a clinician can best address your specific situation.',
    emergencyAction: '🚨 Seek urgent medical care NOW. Call emergency services or go to nearest hospital.',
    emergencyExplanation: 'Some symptoms are urgent in pregnancy. Safest to get checked immediately.',
  },
  hi: {
    disclaimer: '⚠️ यह निर्णय समर्थन है, चिकित्सा निदान/उपचार नहीं। व्यक्तिगत सलाह के लिए तुरंत अपने स्वास्थ्य प्रदाता से परामर्श करें।',
    fallbackAction: 'व्यक्तिगत सलाह के लिए अपने स्वास्थ्य प्रदाता से संपर्क करें।',
    empathy: 'मैं समझ सकती हूँ। मैं आपकी मदद के लिए यहाँ हूँ।',
    explanation: 'मैं सामान्य जानकारी दे सकती हूँ, लेकिन आपकी स्थिति के लिए डॉक्टर सबसे उपयुक्त हैं।',
    emergencyAction: '🚨 अभी चिकित्सा सहायता लें। आपातकालीन सेवाओं को कॉल करें या नज़दीकी अस्पताल जाएँ।',
    emergencyExplanation: 'गर्भावस्था में कुछ लक्षण आपातकालीन हो सकते हैं। तुरंत जाँच सबसे सुरक्षित है।',
  },
  ta: {
    disclaimer: '⚠️ இது முடிவெடுக்கும் ஆதரவு மட்டுமே - மருத்துவ நோயறிதல்/சிகிச்சை அல்ல. தனிப்பட்ட ஆலோசனைக்காக உங்கள் சுகாதார வழங்குநரை உடனடியாக அணுகவும்.',
    fallbackAction: 'தனிப்பட்ட ஆலோசனைக்காக உங்கள் சுகாதார வழங்குநரை அணுகவும்.',
    empathy: 'உங்கள் கவலை புரிகிறது. நான் உதவ இங்கே இருக்கிறேன்.',
    explanation: 'பொது வழிகாட்டுதலை வழங்க முடியும்; உங்கள் சூழ்நிலைக்கு மருத்துவர் சிறந்தவர்.',
    emergencyAction: '🚨 உடனடி மருத்துவ உதவி பெறுங்கள். அவசர சேவையை அழைக்கவும் அல்லது அருகிலுள்ள மருத்துவமனை செல்லவும்.',
    emergencyExplanation: 'கர்ப்பத்தில் சில அறிகுறிகள் அவசரமாக இருக்கலாம். உடனே சோதனை செய்வது பாதுகாப்பானது.',
  },
};

const languageName = (lang?: string) => {
  if (lang === 'hi') return 'Hindi';
  if (lang === 'ta') return 'Tamil';
  return 'English';
};

const normalizeText = (value: string) =>
  value.replace(/\s+/g, ' ').replace(/[^\S\r\n]+/g, ' ').trim();

const countWords = (text: string): number => {
  return normalizeText(text).split(/\s+/).filter(w => w.length > 0).length;
};

const limitToWords = (text: string, maxWords: number): string => {
  const words = normalizeText(text).split(/\s+/).filter(w => w.length > 0);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
};

const limitText = (value: string, max = MAX_SECTION_CHARS) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
};

const detectEmergency = (message: string, symptoms: string[]) => {
  const combined = `${message} ${symptoms.join(' ')}`.toLowerCase();
  return EMERGENCY_KEYWORDS.some((word) => combined.includes(word));
};

const containsDiagnosisLanguage = (value: string) =>
  DIAGNOSIS_PATTERNS.some((pattern) => pattern.test(value));

const normalizeResponse = (structured: Partial<ChatResponse>, safe: (typeof SAFE_TEMPLATES)[string], emergencyOverride: boolean, isMedical = false): ChatResponse => {
  // Determine max words based on query type and emergency status
  const maxWords = emergencyOverride ? 40 : (isMedical ? MAX_MEDICAL_WORDS : MAX_GENERAL_WORDS);
  
  const empathy = limitToWords(structured.empathy?.trim() || safe.empathy, 20);
  const explanationRaw = structured.explanation?.trim() || safe.explanation;
  const explanation = containsDiagnosisLanguage(explanationRaw) 
    ? limitToWords(safe.explanation, maxWords)
    : limitToWords(explanationRaw, maxWords);
  
  const actionRaw = structured.action?.trim() || safe.fallbackAction;
  const action = emergencyOverride 
    ? safe.emergencyAction 
    : limitToWords(actionRaw, 25);
  
  // Medical responses always include disclaimer; general responses do not
  const disclaimerText = isMedical ? safe.disclaimer : '';
  
  const confidence = Math.max(0.5, Math.min(1, structured.confidence || (emergencyOverride ? 0.9 : 0.82)));
  const fallback = structured.fallback === true || confidence < 0.6;

  return {
    empathy,
    explanation,
    action: emergencyOverride ? safe.emergencyAction : (fallback ? safe.fallbackAction : action),
    disclaimer: disclaimerText,
    confidence,
    fallback: emergencyOverride ? true : fallback,
  };
};

const safeParseJson = (payload: string) => {
  const cleaned = payload
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const makeCacheKey = (request: ChatRequest) => {
  const keyObj = {
    message: normalizeText(request.message).toLowerCase(),
    pregnancyWeek: request.pregnancyWeek,
    recentSymptoms: [...request.recentSymptoms].map((s) => s.toLowerCase()).sort(),
    riskLevel: request.riskLevel,
    language: request.language || 'en',
  };
  return JSON.stringify(keyObj);
};

export interface ChatRequest {
  message: string
  pregnancyWeek: number
  recentSymptoms: string[]
  riskLevel: string
  conversationHistory: Array<{ role: string; content: string }>;
  language?: string
}

export interface ChatResponse {
  empathy: string
  explanation: string
  action: string
  disclaimer: string
  confidence: number
  fallback?: boolean
}

const isOllamaConfigured = (): boolean => {
  return !!process.env.OLLAMA_MODEL;
};

const getFocusAreas = (week: number): string => {
  if (week <= 4) return 'early pregnancy: confirm pregnancy, nausea, fatigue, start prenatal vitamins, find doctor';
  if (week <= 13) return 'first trimester: morning sickness management, miscarriage education, healthy eating, emotional support';
  if (week <= 20) return 'second trimester: fetal movement, anatomy scan, energy boost, heartburn tips, travel safety';
  if (week <= 27) return 'viability scan period: glucose test, Braxton Hicks differentiation, baby shower planning, sleep positions';
  if (week <= 35) return 'third trimester: nesting, labor signs education, pelvic floor exercises, hospital bag prep';
  return 'late third: weekly checkups, induction discussions, birth plan review, postpartum planning';
};

const generateMockResponse = (request: ChatRequest): ChatResponse => {
  const lang = request.language || 'en';
  const safe = SAFE_TEMPLATES[lang] || SAFE_TEMPLATES.en;
  const week = request.pregnancyWeek;
  const symptoms = request.recentSymptoms;

  let mockResponse = `Hi! Week ${week} pregnancy. `;
  if (symptoms.length > 0) {
    mockResponse += `Rest for ${symptoms.join(', ')}. `;
  }
  mockResponse += `Consult doctor.`;

  return {
    empathy: safe.empathy,
    explanation: limitText(mockResponse),
    action: safe.fallbackAction,
    disclaimer: safe.disclaimer,
    confidence: 0.8,
  };
};

export const generateChatResponse = async (request: ChatRequest): Promise<ChatResponse> => {
  const lang = request.language || 'en';
  const safe = SAFE_TEMPLATES[lang] || SAFE_TEMPLATES.en;
  const normalizedMessage = normalizeText(request.message).slice(0, MAX_MESSAGE_CHARS);
  const cacheKey = makeCacheKey({ ...request, language: lang, message: normalizedMessage });
  const cached = responseCache.get(cacheKey);
  if (cached) return cached;

  const emergencyOverride = detectEmergency(normalizedMessage, request.recentSymptoms);

  if (!isOllamaConfigured()) {
    console.warn('Ollama not configured - using short mock');
    const mock = generateMockResponse({ ...request, language: lang, message: normalizedMessage });
    const isMedical = isMedicalQuery(normalizedMessage);
    const normalizedResp = normalizeResponse(mock, safe, emergencyOverride, isMedical);
    responseCache.set(cacheKey, normalizedResp);
    return normalizedResp;
  }

  try {
    const focus = getFocusAreas(request.pregnancyWeek);
    const historyStr = request.conversationHistory.slice(-10).map((m) => `${m.role.toUpperCase()}: ${normalizeText(m.content).slice(0, 200)}`).join('\\n');
    
    const systemPrompt = `You are Nurtura AI doula. MEDICAL CONTENT REQUIRES EXTRA CAUTION.

Respond ONLY with valid JSON: {
  "empathy": "1 empathetic sentence (max 15 words)",
  "explanation": "1-2 short evidence sentences, no jargon",
  "action": "1 clear actionable next step",
  "confidence": 0.5-1.0,
  "fallback": true if you are not confident
}

${languageName(lang)} ONLY. SIMPLE, SHORT LANGUAGE.

**RESPONSE LENGTH RULES (CRITICAL):**
- Medical queries (pregnancy, symptoms, vitals): max 30 words in explanation
- General non-medical queries: max 40 words in explanation
- ALWAYS include word count — no filler words
- Remove all questions, confirmations, and verification requests
- No diagnosis words. General information only.

Context: Week ${request.pregnancyWeek}: ${focus}. Symptoms: ${request.recentSymptoms.join(', ') || 'none'} Risk: ${request.riskLevel}

CRITICAL SAFETY:
- Red flags (bleeding, chest pain, severe headache, swelling) → IMMEDIATE ACTION only
- 0 diagnosis words. General info only
- NO questions, NO confirmations, NO verify requests
- Medical responses will get disclaimer added by system

Query: ${normalizedMessage}`;

    const ollamaRes = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: systemPrompt,
        options: {
          temperature: 0.1, // Lower for consistency/safety
          num_predict: 400,
          top_p: 0.85,
          format: 'json',
          top_k: 30
        }
      })
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      throw new Error(`Ollama ${ollamaRes.status}: ${errText}`);
    }

    const data = await ollamaRes.json() as { response?: string };
    const parsed = data.response ? safeParseJson(data.response) : null;
    const fallbackResponse: Partial<ChatResponse> = {
      empathy: safe.empathy,
      explanation: data.response?.trim() || safe.explanation,
      action: safe.fallbackAction,
      disclaimer: safe.disclaimer,
      confidence: 0.55,
      fallback: true,
    };

    const structured = (parsed || fallbackResponse) as Partial<ChatResponse>;
    const confidence = Math.max(0.5, Math.min(1, structured.confidence || 0.82));
    const isMedical = isMedicalQuery(normalizedMessage);
    const normalized = normalizeResponse({ ...structured, confidence }, safe, emergencyOverride, isMedical);
    responseCache.set(cacheKey, normalized);
    return normalized;
  } catch (error: unknown) {
    console.error('Ollama error:', error);
    const mock = generateMockResponse({ ...request, language: lang, message: normalizedMessage });
    const isMedical = isMedicalQuery(normalizedMessage);
    const normalized = normalizeResponse(mock, safe, emergencyOverride, isMedical);
    responseCache.set(cacheKey, normalized);
    return normalized;
  }
};

