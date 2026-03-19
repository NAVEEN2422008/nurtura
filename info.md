Frontend (Next.js + TS + Tailwind + Framer Motion)
Landing page updated to spec headline + CTAs + required sections: frontend/src/pages/index.tsx
Auth screens: frontend/src/pages/login.tsx, frontend/src/pages/signup.tsx
Pregnancy setup: frontend/src/pages/setup-pregnancy.tsx
User dashboard (mobile-first): charts + AI chat + vitals + symptom tracker + mood tracker + emergency modal: frontend/src/pages/dashboard.tsx
Community platform (groups + anonymous posting + moderation status): frontend/src/pages/community.tsx
Emergency response panel with breathing animation + nearby hospitals fetch: frontend/src/components/EmergencyAlert.tsx
Backend (Next.js API routes) + Security
NextAuth (JWT sessions) with Credentials (email/password) + optional Google OAuth:
frontend/src/pages/api/auth/[...nextauth].ts
Route protection middleware: frontend/middleware.ts
Session/JWT typing: frontend/src/types/next-auth.d.ts
AES-256-GCM encryption helpers (used for chat + notes): frontend/src/lib/crypto/aesGcm.ts
Supabase admin client (service role): frontend/src/lib/supabase/admin.ts
Database schema (Supabase Postgres) + RLS
Full v1 schema + enums + triggers + starter RLS policies:
frontend/supabase/migrations/0001_init.sql
Core APIs (examples you requested included)
Dashboard: GET /api/dashboard → frontend/src/pages/api/dashboard.ts
Signup: POST /api/signup → frontend/src/pages/api/signup.ts
Pregnancy: POST/GET /api/pregnancy → frontend/src/pages/api/pregnancy.ts
Symptom logs + risk triage: POST/GET /api/symptom-log → frontend/src/pages/api/symptom-log.ts
Mood logs + pattern flags: POST/GET /api/mood-log → frontend/src/pages/api/mood-log.ts
Community:
GET /api/community-feed → frontend/src/pages/api/community-feed.ts
POST /api/community-post → frontend/src/pages/api/community-post.ts
(+ comment/like endpoints in frontend/src/pages/api/community/*)
Report uploads (Supabase Storage signed upload URL): POST /api/report-upload → frontend/src/pages/api/report-upload.ts
Hospital finder (mock/provider stub): GET /api/hospitals/nearby → frontend/src/pages/api/hospitals/nearby.ts
AI Companion (encrypted history + disclaimers + safety flags):
POST /api/ai/companion → frontend/src/pages/api/ai/companion.ts
GET /api/ai/history → frontend/src/pages/api/ai/history.ts
POST /api/ai/moderate → frontend/src/pages/api/ai/moderate.ts
AI Symptom Risk Engine (green/yellow/red)
Rule-based engine with the spec example (headache + swelling + high BP ⇒ preeclampsia signal):
frontend/src/lib/risk/riskEngine.ts
How to run locally
1) Configure env
Copy frontend/.env.example → frontend/.env.local
Fill:
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_SECRET
NURTURA_ENCRYPTION_KEY_B64 (32 bytes base64)
2) Apply DB schema + create Storage bucket
Run frontend/supabase/migrations/0001_init.sql in Supabase SQL editor
Create a Storage bucket named medical-reports (or set SUPABASE_REPORTS_BUCKET)
3) Start the app
cd frontend
npm install
npm run dev
Notes on existing backend/
Your old Express/Mongo backend is still present but the app is now wired to Next.js /api/* + Supabase (per the plan).

Demo account seeding
POST /api/demo/seed
Returns demo credentials for /login and seeds pregnancy + charts + emergency trigger data.