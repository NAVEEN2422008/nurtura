# NURTURA — Production System Documentation

This document describes the full architecture, safety design, data flow, and operational details of the **NURTURA** AI-powered maternal healthcare web application. NURTURA is a **decision-support platform**, **not** a diagnostic tool.

---

## 1) Core Principles (Safety-First)

- **Never diagnose diseases**
- **Always provide safe, clear guidance**
- **Always include confirmation before advice**
- **Use structured input to avoid ambiguity**
- **Use multilingual-safe templates (no raw translation)**
- **Provide consistent outputs for same inputs**

---

## 2) System Overview

**Goal**: Provide trustworthy, multilingual, low-connectivity safe decision support for maternal care with structured symptom checks, a safe AI chat assistant, emergency handling, and voice interaction.

**High-level flow**

1. User selects symptoms and severity (structured input).
2. System confirms input.
3. Risk engine returns deterministic risk.
4. System provides safe action guidance.
5. High risk triggers emergency screen.
6. Optional AI chat provides structured empathy + explanation + action.
7. Voice interaction supports STT + confirmation + TTS.

---

## 3) Architecture

**Frontend**: Next.js + TailwindCSS (mobile-first UI)

**Backend**: Express (Node.js) for core services and AI logic

**Datastores**

- **MongoDB** (current backend) via Mongoose for core domain models.
- **Supabase/PostgreSQL** (frontend API) for user language preferences.
- Graceful fallback to in-memory/demo responses when DB is unavailable.

---

## 4) Frontend Structure

**Root**: `frontend/`

Key folders:
- `frontend/src/pages/` — page routes and API routes
- `frontend/src/components/` — reusable UI elements
- `frontend/src/hooks/` — voice, network, and store hooks
- `frontend/src/i18n/` — safe translation dictionaries and config
- `frontend/public/sw.js` — service worker for offline caching

### Key Pages

- `frontend/src/pages/index.tsx` — Landing
- `frontend/src/pages/dashboard.tsx` — Dashboard
- `frontend/src/pages/symptom-checker.tsx` — Structured symptom flow + confirmation
- `frontend/src/pages/ai-chat.tsx` — Safe AI chat UI with confirmation + TTS
- `frontend/src/pages/emergency.tsx` — Emergency screen (fallback)
- `frontend/src/pages/language.tsx` — Language selection

### Critical Components

- `frontend/src/components/ConfirmSheet.tsx`
  - Confirmation modal used before sending advice or chat.
- `frontend/src/components/EmergencyAlert.tsx`
  - High-risk overlay with emergency actions and safety guidance.

### Voice System

- `frontend/src/hooks/useVoice.ts`
  - Speech-to-text
  - Confirmation of recognized text
  - Text-to-speech for system responses
  - Locale mapping for EN/HI/TA

### Low-Connectivity Handling

- `frontend/src/hooks/useNetworkStatus.ts`
  - Detects offline / slow connections.
- Offline fallback path:
  - `frontend/src/pages/symptom-checker.tsx` calls `assessSymptomRisk` when offline.

### Internationalization (Safe Templates)

- `frontend/src/i18n/messages/en.json`
- `frontend/src/i18n/messages/hi.json`
- `frontend/src/i18n/messages/ta.json`

Translation keys are predefined and **safe**, **consistent**, and **non-diagnostic**.

### Intl Config

- `frontend/src/i18n/request.ts` — `next-intl` request config with locale fallback
- `frontend/next.config.js` — `next-intl` plugin configured for `./src/i18n/request.ts`
- `frontend/middleware.ts` — locale middleware for routing

---

## 5) Backend Structure

**Root**: `backend/`

Key folders:
- `backend/src/controllers/`
- `backend/src/routes/`
- `backend/src/models/`
- `backend/src/services/`
- `backend/src/middleware/`

### AI Safety Service

**File**: `backend/src/services/ai.ts`

Features:
- Deterministic caching for consistent output
- Language-enforced system prompt
- Strict response schema (empathy, explanation, action)
- Safety disclaimers and fallback logic
- Never diagnoses

### Risk Engine

**File**: `frontend/src/lib/risk/riskEngine.ts` (client fallback)
**Backend risk**: `backend/src/services/risk.ts` (server)

Deterministic rules (example):
- Headache + swelling + high BP → `RED` (high risk)

### Auth

**Middleware**: `backend/src/middleware/auth.ts`
- Mock user IDs when missing auth (dev-safe)

---

## 6) API Endpoints

### Frontend (Next.js API Routes)

- `POST /api/symptom-check`
  - Input: structured symptoms
  - Output: risk level, score, actions, condition signals
- `POST /api/chat`
  - Input: message + language + pregnancy context
  - Output: empathy + explanation + action + disclaimer
- `GET /api/dashboard`
  - Summary metrics for dashboard cards
- `POST /api/user/preferences`
  - Language preference (Supabase)
- `GET /api/user/preferences`
  - Current language preference

### Backend (Express)

- `/api/auth` (signup/login/profile)
- `/api/pregnancies`
- `/api/dashboard`
- `/api/chat`
- `/api/health`
- `/api/appointments`
- `/api/symptoms`

---

## 7) Database Models (Current)

**MongoDB via Mongoose**

- Users
- Pregnancy
- HealthRecord
- RiskAssessment
- Conversation
- Appointment
- SymptomLog
- CommunityPost
- Notification

**Supabase (Postgres)**

- Language preference storage for user locale selection

---

## 8) Safety & Compliance

All user-facing advice:
- Requires **confirmation**
- Uses **simple language**
- Avoids **diagnosis**
- Adds **disclaimer**
- Falls back to **“Consult a doctor”** if unsure

Emergency flow always prioritizes immediate escalation and location sharing.

---

## 9) Build & Run

### Frontend

```
npm --prefix frontend install
npm --prefix frontend run lint
npm --prefix frontend run type-check
npm --prefix frontend run build
npm --prefix frontend run dev
```

### Backend

```
npm --prefix backend install
npm --prefix backend run lint
npm --prefix backend run build
npm --prefix backend run dev
```

Note: On Windows, `next build` may require elevated permissions to spawn workers.

---

## 10) Environment Variables

Frontend:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_EMERGENCY_NUMBER`

Backend:
- `DATABASE_URL`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`
- `JWT_SECRET`
- `FRONTEND_URL`

---

## 11) CI/CD Validation Loop (Self-Healing)

Every feature change runs:
1. Build
2. Analyze
3. Check for missing functions or flows
4. Simulate execution
5. Test (functional + safety + i18n + voice)
6. Detect issues
7. Auto-fix
8. Re-run
9. Re-test

System is considered valid only when **no errors** remain and **all flows pass**.

---

## 12) Quick Functional Checklist

- Symptom checker completes end-to-end ✅
- Deterministic risk output ✅
- Chatbot structured response ✅
- Emergency flow triggers on RED ✅
- Multilingual templates (EN/HI/TA) ✅
- Voice STT + confirmation + TTS ✅
- Offline fallback ✅
- No diagnostic language ✅

---

## 13) File Map (Key)

Frontend:
- `frontend/src/pages/symptom-checker.tsx`
- `frontend/src/pages/ai-chat.tsx`
- `frontend/src/components/ConfirmSheet.tsx`
- `frontend/src/components/EmergencyAlert.tsx`
- `frontend/src/hooks/useVoice.ts`
- `frontend/src/hooks/useNetworkStatus.ts`
- `frontend/src/i18n/messages/en.json`
- `frontend/src/i18n/messages/hi.json`
- `frontend/src/i18n/messages/ta.json`
- `frontend/public/sw.js`

Backend:
- `backend/src/services/ai.ts`
- `backend/src/services/risk.ts`
- `backend/src/controllers/chatController.ts`
- `backend/src/controllers/healthController.ts`
- `backend/src/controllers/symptomController.ts`
- `backend/src/middleware/auth.ts`

---

## 14) Non-Diagnostic Disclaimer (Required)

NURTURA provides **decision support only** and does **not** diagnose diseases. Users must consult licensed healthcare providers for medical advice.

