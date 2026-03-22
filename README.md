# Nurtura - Maternal Health Platform
## Complete File Inventory

**Total Files: 124** (including configs, sources, docs). This README catalogs every file, its directory, type, and role/purpose.

### 📁 Root Directory (12 files)
| File | Type | Role/Purpose |
|------|------|--------------|
| `.gitignore` | Config | Ignores node_modules, env files, builds for Git |
| `1.code-workspace` | VSCode | Workspace config for multi-root development |
| `docker-compose.yml` | Docker | Orchestrates MongoDB, Redis, backend, frontend services |
| `info.md` | Docs | Frontend setup notes (Supabase migration, demo seed) |
| `package-lock.json` | Lockfile | NPM dependency lock (root-level, sparse) |
| `package.json` | Manifest | Root project metadata/partial deps (dev tools) |
| `start-dev.ps1` | Script | Windows PowerShell dev startup script |
| `backend/` | Directory | **Backend API source** |
| `data/` | Directory | Demo data JSON |
| `docs/` | Directory | Architecture/API/Database docs |
| `frontend/` | Directory | **Frontend Next.js app** |

### 🛠️ Backend (`backend/`, 35 files)
**Node.js/Express/TS API for health data, AI chat, risk assessment.**

#### Config/Build (5 files)
| File | Role |
|------|------|
| `backend/.gitignore` | Backend-specific ignores |
| `backend/Dockerfile` | Docker image for backend |
| `backend/package.json` | Backend deps (Express, Mongoose, OpenAI) |
| `backend/package-lock.json` | Backend NPM lock |
| `backend/tsconfig.json` | TypeScript compiler config |

#### Data/Scripts (2 files)
| File | Role |
|------|------|
| `backend/data/demo-scenarios.json` | Sample symptoms/conversations for seeding |
| `backend/src/scripts/seed-demo.ts` | Populates DB with demo users/pregnancies |

#### Core Server (1 file)
| File | Role |
|------|------|
| `backend/src/index.ts` | **Main Express server** - middleware, routes, Mongo connect, health endpoint |

#### Controllers (7 files)
| File | Role |
|------|------|
| `backend/src/controllers/appointmentController.ts` | CRUD appointments |
| `backend/src/controllers/authController.ts` | Signup/login/profile (JWT) |
| `backend/src/controllers/chatController.ts` | AI message handling/history |
| `backend/src/controllers/dashboardController.ts` | User dashboard aggregates |
| `backend/src/controllers/healthController.ts` | Vitals logging, risk triggers |
| `backend/src/controllers/pregnancyController.ts` | Pregnancy CRUD |
| `backend/src/controllers/symptomController.ts` | Symptom logging + risk trigger |

#### Middleware (1 file)
| File | Role |
|------|------|
| `backend/src/middleware/auth.ts` | JWT auth + global error handler |

#### Models/Schemas (8 files)
| File | Role |
|------|------|
| `backend/src/models/Appointment.ts` | Mongoose schema |
| `backend/src/models/CommunityPost.ts` | Community posts |
| `backend/src/models/Conversation.ts` | AI chat history |
| `backend/src/models/FamilyLink.ts` | Partner sharing links |
| `backend/src/models/HealthRecord.ts` | Vitals/labs/symptoms |
| `backend/src/models/Notification.ts` | Reminders/alerts |
| `backend/src/models/Pregnancy.ts` | Pregnancy tracking |
| `backend/src/models/RiskAssessment.ts` | AI risk scores |
| `backend/src/models/SymptomLog.ts` | Symptom entries |
| `backend/src/models/User.ts` | User profiles |

#### Routes (7 files)
| File | Role |
|------|------|
| `backend/src/routes/appointments.ts` | `/api/appointments` endpoints |
| `backend/src/routes/auth.ts` | `/api/auth` endpoints |
| `backend/src/routes/chat.ts` | `/api/chat` endpoints |
| `backend/src/routes/dashboard.ts` | `/api/dashboard` |
| `backend/src/routes/health.ts` | `/api/health` (vitals/risk) |
| `backend/src/routes/pregnancies.ts` | `/api/pregnancies` |
| `backend/src/routes/symptoms.ts` | `/api/symptoms` |

#### Services (3 files)
| File | Role |
|------|------|
| `backend/src/services/ai.ts` | OpenAI GPT-4 calls (chat/risk) |
| `backend/src/services/auth.ts` | JWT generate/verify |
| `backend/src/services/risk.ts` | Risk score calculation |

### 🌐 Frontend (`frontend/`, 70+ files)
**Next.js 14 SPA - Dashboard, AI chat, community.**

#### Config/Build (11 files)
| File | Role |
|------|------|
| `frontend/.eslintrc.json` | ESLint rules |
| `frontend/.gitignore` | Frontend ignores |
| `frontend/Dockerfile` | Prod Docker |
| `frontend/Dockerfile.dev` | Dev Docker |
| `frontend/middleware.ts` | Route protection (auth guard) |
| `frontend/next-env.d.ts` | Next.js types |
| `frontend/next.config.js` | Next.js config |
| `frontend/package.json` | Frontend deps (NextAuth, Supabase, Tailwind) |
| `frontend/package-lock.json` | Lockfile |
| `frontend/postcss.config.js` | PostCSS/Tailwind |
| `frontend/README.md` | Frontend-specific notes |
| `frontend/tailwind.config.js` | Tailwind theme |
| `frontend/tsconfig.json` | TS config |
| `frontend/tsconfig.node.json` | Node types |

#### Pages (Main UI, 6 files)
| File | Role |
|------|------|
| `frontend/src/pages/_app.tsx` | Root app wrapper (SessionProvider) |
| `frontend/src/pages/community.tsx` | Community feed/posts |
| `frontend/src/pages/dashboard.tsx` | Main health dashboard |
| `frontend/src/pages/index.tsx` | Landing/home |
| `frontend/src/pages/login.tsx` | Login form |
| `frontend/src/pages/setup-pregnancy.tsx` | Pregnancy onboarding |
| `frontend/src/pages/signup.tsx` | Signup form |

#### API Routes (~25 files)
**Next.js /api/* mirror backend + extras.**
- `frontend/src/pages/api/auth/[...nextauth].ts` - NextAuth config
- `frontend/src/pages/api/community/*` (feed, post, comment, like)
- `frontend/src/pages/api/dashboard.ts`, `/pregnancy.ts`, `/symptom-log.ts`, `/mood-log.ts`
- `frontend/src/pages/api/ai/*` (companion, history, moderate)
- `frontend/src/pages/api/hospitals/nearby.ts`, `/wearables/manual.ts`
- `frontend/src/pages/api/debug/*` (env, ping), `/demo/seed.ts`, `/dev/seed-demo.ts`
- `frontend/src/pages/api/report-upload.ts`, `/signup.ts`

#### Components (4 files)
| File | Role |
|------|------|
| `frontend/src/components/EmergencyAlert.tsx` | Crisis breathing/hospitals |
| `frontend/src/components/ErrorBoundary.tsx` | Error catching |
| `frontend/src/components/LoadingSkeleton.tsx` | UI skeletons |
| `frontend/src/components/SymptomForm.tsx` | Symptom input |

#### Lib/Utils/Hooks (7 files)
| File | Role |
|------|------|
| `frontend/src/hooks/useStore.ts` | Zustand global state |
| `frontend/src/lib/auth/serverSession.ts` | Server-side sessions |
| `frontend/src/lib/crypto/aesGcm.ts` | AES-256 encryption |
| `frontend/src/lib/risk/riskEngine.ts` | Symptom risk triage (rules) |
| `frontend/src/lib/supabase/admin.ts` | Supabase admin client |
| `frontend/src/services/api.ts` | API client wrapper |
| `frontend/src/types/index.ts` | TS interfaces (symptoms, risks) |
| `frontend/src/types/next-auth.d.ts` | NextAuth types |

#### Styles/Types (3 files)
| File | Role |
|------|------|
| `frontend/src/styles/globals.css` | Global Tailwind |
| `frontend/src/types/index.ts` | Core types |
| `frontend/src/types/next-auth.d.ts` | Auth types |

#### Supabase (1 file)
| File | Role |
|------|------|
| `frontend/supabase/migrations/0001_init.sql` | Postgres schema (RLS policies) |

### 📚 Docs (`docs/`, 3 files)
| File | Role |
|------|------|
| `docs/API.md` | **Full API spec** - Endpoints, JSON examples, errors |
| `docs/ARCHITECTURE.md` | **Architecture diagrams** - Data flow, deployment |
| `docs/DATABASE.md` | **Mongo schemas** - All models, indexes, queries |

### 💾 Data (1 file)
| File | Role |
|------|------|
| `data/demo-scenarios.json` | Shared demo data (symptoms, risks) |

## Quick Start
```bash
docker-compose up
npm run dev  # backend/frontend
```
**See docs/ for full setup/architecture.**

## Editor Note (Tailwind CSS)
If VS Code shows `Unknown at rule @tailwind` or `@apply` warnings in `frontend/src/styles/globals.css`, install the **Tailwind CSS IntelliSense** extension or use the workspace settings in `.vscode/settings.json` to suppress the false positives.

*Generated by BLACKBOXAI analysis.*

