# NURTURA Architecture & Data Flow

## System Overview

NURTURA is a full-stack, full-featured maternal health platform with:
- **Frontend:** Next.js SPA with real-time updates
- **Backend:** Node.js REST API with AI integration
- **Database:** MongoDB for flexible health records + Redis for session/cache
- **AI:** OpenAI GPT-4 with RAG knowledge retrieval
- **Task Queue:** Bull for background jobs (notifications, reminders)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         NURTURA System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────┐       ┌──────────────────────┐  │
│  │   Frontend (Next.js)     │       │  Mobile (Future)     │  │
│  ├──────────────────────────┤       └──────────────────────┘  │
│  │ • Dashboard              │                                  │
│  │ • Chat UI                │       ┌──────────────────────┐  │
│  │ • Risk Assessment        │       │  Partner Portal      │  │
│  │ • Appointments           │       │  (Family Mode)       │  │
│  │ • Settings               │       └──────────────────────┘  │
│  └──────┬───────────────────┘                                  │
│         │                                                      │
│         └──────────────┬─────────────────────┬────────────┐   │
│                        │                     │            │   │
│         ┌──────────────▼────────────────┐    │            │   │
│         │   API Gateway / Express       │    │            │   │
│         │   (Node.js Backend)           │    │            │   │
│         ├────────────────────────────┬──┘    │            │   │
│         │                            │       │            │   │
│    ┌────▼────────┐  ┌───────────┐   │   ┌───▼────────┐   │   │
│    │ Auth Routes │  │ Pregnancy │   │   │ Chat Route │   │   │
│    │             │  │  Routes   │   │   │ (AI)       │   │   │
│    └─────────────┘  └───────────┘   │   └───┬────────┘   │   │
│                                      │       │            │   │
│    ┌─────────────────┐  ┌────────┐  │   ┌───▼──────────┐ │   │
│    │ Risk Prediction │  │ Health │  │   │   OpenAI    │ │   │
│    │ Algorithm       │  │ Routes │  │   │   GPT-4     │ │   │
│    └─────────────────┘  └────────┘  │   └────────────┘ │   │
│                                      │                  │   │
│         ┌────────────────────────────┴──────────────────┘   │
│         │                                                    │
│    ┌────▼─────────────────────┐    ┌────────────────────┐  │
│    │     MongoDB Database      │    │  Redis Cache       │  │
│    ├────────────────────────────┤   └────────────────────┘  │
│    │ • Users                    │                            │
│    │ • Pregnancies              │    ┌────────────────────┐ │
│    │ • Health Records           │    │  Bull Job Queue    │ │
│    │ • Conversations            │    │ (Reminders, etc)   │ │
│    │ • Risk Assessments         │    └────────────────────┘ │
│    │ • Appointments             │                            │
│    └────────────────────────────┘    ┌────────────────────┐ │
│                                       │  Pinecone / Vector │ │
│                                       │  DB (RAG)          │ │
│                                       └────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Chat with Risk Context

```
User Types Message in Chat UI
         │
         ▼
Frontend sends POST /api/chat
     { message, pregnancyId, conversationHistory }
         │
         ▼
Backend Chat Controller
  1. Validate user & pregnancy context
  2. Fetch recent health records (vitals, symptoms)
  3. Retrieve pregnancy week, risk level
  4. Fetch conversation history
         │
         ▼
RAG Retrieval (Pinecone)
  - Search knowledge base for relevant pregnancy topics
  - Inject context into system prompt
         │
         ▼
AI Service (OpenAI)
  - Build prompt with:
    • System message (supportive doula persona)
    • User context (pregnancy week, risk level, history)
    • Retrieved knowledge base snippets
    • Current message
  - Call GPT-4 API
  - Parse response for safety flags/emergency keywords
         │
         ▼
Post-processing
  - Extract any emergency keywords (bleeding, severe pain, etc.)
  - Generate recommendations if applicable
  - Flag for escalation if needed
         │
         ▼
Save to MongoDB
  - Store message pair in conversations collection
  - Update conversation metadata
         │
         ▼
Return to Frontend
  { response, recommendations, flags, timestamp }
         │
         ▼
Frontend renders message with supportive styling
```

## Data Model Relationships

```
User (mother/partner/provider)
  └─── has many Pregnancies
         ├─── has one Pregnancy (active)
         ├─── has many Health Records
         ├─── has many Conversations
         ├─── has many Risk Assessments
         ├─── has many Appointments
         └─── has many Family Links (partners)

Pregnancy
  ├─── references User (userId)
  ├─── has many Health Records
  ├─── has many Risk Assessments
  ├─── has many Appointments
  ├─── has many Conversations
  └─── status: active | postpartum | completed

Health Record
  ├─── references Pregnancy (pregnancyId)
  ├─── types: vitals | lab | ultrasound | symptom_log
  └─── aggregated in dashboard

Risk Assessment
  ├─── references Pregnancy (pregnancyId)
  ├─── calculated from: vitals, symptoms, history, age
  ├─── outputs: riskScore (0-100), conditions, recommendations
  └─── triggered by: health entry OR manual risk check

Conversation
  ├─── references Pregnancy (pregnancyId)
  ├─── messages: [{ role, content, timestamp, embedding }]
  └─── contextSnapshot: { pregnancyWeek, recentSymptoms, riskLevel }

Family Link
  ├─── references Pregnancy (pregnancyId)
  ├─── references Partner User (partnerId)
  ├─── status: pending | accepted
  └─── shared permissions: [view_dashboard, view_mood, etc]
```

## API Layer Architecture

```
HTTP Request
     │
     ▼
Express Middleware Stack
  ├─ CORS & Helmet
  ├─ Body Parser
  ├─ Auth Middleware (JWT validation)
  ├─ Error Handler
     │
     ▼
Route Handler (e.g., POST /api/chat)
     │
     ▼
Controller (e.g., chatController.send)
     │
     ▼
Service Layer
  ├─ AI Service (OpenAI API calls)
  ├─ Risk Prediction Service
  ├─ Notification Service
  └─ Database Service
     │
     ▼
Data Access Layer (Mongoose Models)
     │
     ▼
MongoDB / Redis
```

## Authentication & Session Management

**Flow:**
1. User signs up: `POST /api/auth/signup` → hashed password stored
2. User logs in: `POST /api/auth/login` → JWT token issued
3. Frontend stores token in localStorage
4. Every request includes `Authorization: Bearer <token>`
5. Backend validates token in middleware → attaches user to request
6. Redis stores session cache for fast lookups

**JWT Structure:**
```json
{
  "sub": "userId",
  "role": "mother",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Real-time Updates (Future Enhancement)

**Current (Polling):** Frontend `react-query` refetches data on intervals
**Future (WebSockets / SSE):**
```javascript
// Could add: Socket.io for real-time notifications
socket.emit('health_update', data)
socket.on('risk_alert', payload => {
  // Immediately notify user of risk change
})
```

## Deployment Architecture

```
┌─────────────────────────────────────┐
│ User Devices (Browser / Mobile)     │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────────────┐
│ Vercel (Frontend CDN)                │
│ - Next.js hosting                    │
│ - Static asset delivery              │
│ - Auto-scaling                       │
└──────────────┬───────────────────────┘
               │ API calls to
               ▼
┌──────────────────────────────────────┐
│ Render / Railway (Backend)           │
│ - Node.js Express app                │
│ - Auto-scaling                       │
│ - Environment config                 │
└──────────────┬───────────────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
     ▼         ▼         ▼
┌────────┐ ┌──────┐ ┌──────────┐
│MongoDB │ │Redis │ │Pinecone  │
│ Atlas  │ │Cloud │ │(Vector)  │
└────────┘ └──────┘ └──────────┘
```

## Security Considerations

1. **Password:** bcryptjs hashing, never stored in plaintext
2. **JWT:** Short expiry (1h), refresh token rotation
3. **HTTPS:** All traffic encrypted in transit
4. **CORS:** Whitelist origin domains only
5. **Rate Limiting:** Prevent abuse on auth endpoints
6. **MongoDB Injection:** Use Mongoose (parameterized queries)
7. **Sensitive Data:** Don't log PHI (Protected Health Information)
8. **API Keys:** OpenAI key stored server-side only, never exposed to frontend

## Scalability Notes

**For 10k concurrent users:**
- MongoDB: Add sharding on userId
- Redis: Use Redis Cluster
- API: Add load balancer (Render/Railway handles auto-scaling)
- Pinecone: Scales automatically
- Bull Queue: May need dedicated Redis instance

**For production:**
- Add database replication & backups
- Implement caching strategy (Redis)
- Monitor with Sentry, DataDog
- Use CDN for assets
- Implement rate limiting per user/IP
