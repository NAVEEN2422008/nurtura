# NURTURA (Frontend + API)

Mobile-first maternal health platform built with **Next.js + TypeScript + Tailwind + Framer Motion**, using **Supabase Postgres/Storage** and **NextAuth (JWT sessions)**.

## What’s included
- Landing page (`/`)
- Auth: email/password (Credentials) + optional Google OAuth (`/login`, `/signup`)
- Pregnancy setup (`/setup-pregnancy`)
- Dashboard (`/dashboard`): AI companion chat, symptom logging + risk triage, mood logging, analytics charts
- Community feed (`/community`): trimester/postpartum groups, anonymous posting, basic misinformation moderation
- Emergency response modal: nearest hospitals (mock/provider stub) + breathing animation

## Local setup
1. Install deps:

```bash
cd frontend
npm install
```

2. Create `.env.local` from `.env.example`:
- **Supabase**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **NextAuth**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- **Encryption**: `NURTURA_ENCRYPTION_KEY_B64` (32 bytes base64)
- (Optional) **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

If `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing, most `/api/*` routes (including demo seeding) will return an error.

3. Apply database schema (Supabase):
- Run the SQL migration in `[supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)` using Supabase SQL editor, or with Supabase CLI migrations.
- Create a Storage bucket named `medical-reports` (or set `SUPABASE_REPORTS_BUCKET`).

4. Start dev server:

```bash
npm run dev
```

## Demo account (seed)
For local testing, you can seed a demo mother profile:

1. Start the dev server.
2. Call:
- `POST /api/demo/seed`

This creates the two demo accounts shown on the login screen and returns their credentials for `/login`.

## Key routes (API)
- `GET /api/dashboard`
- `POST /api/pregnancy`, `GET /api/pregnancy`
- `POST /api/symptom-log`, `GET /api/symptom-log`
- `POST /api/mood-log`, `GET /api/mood-log`
- `GET /api/community-feed`, `POST /api/community-post`
- `POST /api/report-upload`
- `GET /api/hospitals/nearby`
- `POST /api/ai/companion`, `GET /api/ai/history`, `POST /api/ai/moderate`

## Notes
- Sensitive fields are stored encrypted (AES-256-GCM) using `NURTURA_ENCRYPTION_KEY_B64`.
- Supabase RLS policies are included in the migration, but server-side usage via `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. If you later switch to per-user Supabase JWTs, policies will enforce isolation automatically.

