# Phase 0 Implementation Plan

## 1. Current Repository State
- **Root Files:** Minimal `package.json`, `.env.local` (correct Phase 00 envs), `.agents/`.
- **Docs:** Full suite present EXCEPT `Deployment.md`.
- **Source:** A raw Next.js structure exists at `src/app/`, conflicting with the Turborepo requirement from the roadmap.

## 2. Target Architecture
- **Monorepo:** Turborepo root managing `apps/web` (Next.js) and `src/backend` (FastAPI).
- **Frontend:** Next.js 14.2+ (App Router), TypeScript, Tailwind CSS, Zod env validation.
- **Backend:** FastAPI 0.111+, Python 3.12, Hexagonal architecture, Pydantic Settings, Uvicorn.
- **Database:** Supabase PostgreSQL 16.2 with pg_cron.
- **Services:** Razorpay (MVP payments), OpenAI (GPT-4o inference), Resend (emails), Sentry (observability).

## 3. Exact Folder Structure
```
c:\fulldreamx\
├── .github/workflows/ci.yml
├── .env.local
├── .env.example
├── package.json (Turborepo workspace root)
├── turbo.json
├── apps/
│   └── web/ (Next.js frontend migrated from c:\fulldreamx\src)
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── src/app/
│       └── ...
└── src/
    └── backend/ (FastAPI backend)
        ├── Dockerfile
        ├── pyproject.toml / requirements.txt
        └── app/
            ├── main.py
            ├── config.py
            ├── ...
```

## 4. Files to Create
- `package.json` (Root Workspace)
- `turbo.json`
- `apps/web/package.json` and Next.js config files (`tsconfig.json`, `next.config.js`).
- `apps/web/tailwind.config.ts`, `apps/web/src/app/globals.css`.
- `apps/web/src/env.mjs` (Zod validation).
- `src/backend/requirements.txt` or `pyproject.toml`.
- `src/backend/app/main.py`, `src/backend/app/config.py` (Pydantic Settings).
- `src/backend/Dockerfile`.
- `.github/workflows/ci.yml`.
- `docs/phase-0/verification_report.md`.

## 5. Files to Modify
- `c:\fulldreamx\src` must be safely moved to `c:\fulldreamx\apps\web\src` without data loss.
- `package.json` (Root) to declare workspaces.

## 6. Files to Leave Untouched
- `docs/*`
- `.env.local`
- `.agents/*`

## 7. Dependencies
- **Root:** `turbo`, `npm` workspaces.
- **Frontend:** `next@14.2`, `react`, `react-dom`, `tailwindcss`, `zod`, `typescript`, `@supabase/ssr`.
- **Backend:** `fastapi[standard]>=0.111.0`, `pydantic-settings`, `uvicorn`, `structlog`, `sentry-sdk`.

## 8. Commands
- `mkdir apps`, `mv src apps/web/src`.
- `npm i -D turbo` at root.
- `npm init` for backend (if necessary) or Python virtual environment setup (`python -m venv venv`, `pip install`).

## 9. Environment Variables
- Ensure `.env.local` remains secure and mapped to `apps/web` (via `NEXT_PUBLIC_`) and backend (`config.py`).
- Define `.env.example` sanitizing all sensitive keys.

## 10. CI/CD Architecture
- GitHub Actions: `.github/workflows/ci.yml`
- Triggers on PR/main.
- Jobs:
  - **Frontend:** `npm ci`, `npm run lint`, `npm run build`.
  - **Backend:** `pip install`, `ruff check .`, `mypy --strict .`

## 11. Docker Architecture
- `src/backend/Dockerfile` multi-stage build.
- Stage 1: Builder with compile tools.
- Stage 2: Runtime, non-root user (UID 10001), runs `uvicorn app.main:app`.

## 12. Supabase Setup
- Connectivity via `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## 13. Frontend Setup
- App Router, strictly RSC where applicable.
- Tailwind tokens extracted from `Frontend.md`.

## 14. Backend Setup
- Minimal working `main.py` health endpoint.
- `config.py` using Pydantic Settings mapped to `.env.local`.

## 15. Design-Token Setup
- Convert `Frontend.md` tokens to Tailwind config format.

## 16. Testing Strategy
- Infrastructure checks: Backend health endpoint, frontend build validation, env script execution.

## 17. Security Considerations
- Non-root Docker.
- `.env.local` in `.gitignore`.
- Zod/Pydantic validation ensuring startup fails securely if misconfigured.

## 18. Verification Strategy
- Execute `turbo build`.
- Execute `docker build`.
- Verify Next.js and FastAPI run without syntax errors.

## 19. Risks & 20. Rollback Strategy
- **Risk:** Moving `src/` to `apps/web/src/` may break existing paths if deeply hardcoded.
- **Rollback:** `git reset --hard` since we perform `git diff/status` checks before confirming changes.

## 21. Definition of Done
- Root Turborepo config active.
- Frontend builds. Backend starts.
- Docker builds. CI passes.
- Verification report generated.
