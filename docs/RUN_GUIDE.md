# NURTURA — How To Run Locally

This guide explains how to run the NURTURA frontend and backend locally, and what to do before running.

---

## Prerequisites

- Node.js 18+
- npm
- MongoDB (optional; app runs in demo mode without it)
- Ollama (optional; AI chat uses safe mock responses if not running)

---

## 0) Before You Run (Quick Checklist)

- Ensure ports are free:
  - Frontend: `3000`
  - Backend: `3002`
- Decide your runtime mode:
  - **Demo mode** (no DB): skip MongoDB setup.
  - **Full mode** (DB): make sure MongoDB is running and reachable.
- Create environment files (recommended):
  - `frontend/.env.local`
  - `backend/.env`
- If using Ollama:
  - Start Ollama locally and confirm the model name exists.

---

## 1) Install Dependencies

```bash
npm --prefix frontend install
npm --prefix backend install
```

---

## 2) Environment Variables

Create `.env.local` in `frontend/` (optional but recommended):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_EMERGENCY_NUMBER=911
```

Create `.env` in `backend/` (optional but recommended):

```bash
DATABASE_URL=mongodb://root:password@localhost:27017/nurtura?authSource=admin
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
JWT_SECRET=dev_secret
FRONTEND_URL=http://localhost:3000
```

---

## 3) Run Frontend (Next.js)

```bash
npm --prefix frontend run dev
```

Open:
- `http://localhost:3000`

---

## 4) Run Backend (Express)

```bash
npm --prefix backend run dev
```

Open:
- `http://localhost:3002/health`

---

## 5) Optional: Production Build

```bash
npm --prefix frontend run build
npm --prefix backend run build
```

---

## Notes

- If MongoDB is not running, the backend falls back to demo-safe behavior.
- If Ollama is not running, AI chat returns a safe mock response.
- On some Windows setups, `next build` may require elevated permissions to spawn worker processes.
