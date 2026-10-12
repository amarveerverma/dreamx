# Phase 0 Architecture Decisions & Conflicts

## 1. Monorepo vs. Standalone Next.js Root
**Conflict:** The roadmap (Phase 0 Task List) and `Coding-Standards.md` mandate a Turborepo monorepo with `apps/web/` as the Next.js frontend and `src/backend/` as the FastAPI backend. However, the existing working code from Phase 00 contains the Next.js routing structure directly at `c:\fulldreamx\src\app`, and `Frontend.md` implies this structure by stating `src/app/`.
**Recommended Decision:** To comply with the explicit instruction to "Implement the exact monorepo structure defined by the authoritative Backend.md / Architecture.md documents", and to respect the roadmap's Turborepo requirement which represents the overall project setup, we must migrate `c:\fulldreamx\src` to `c:\fulldreamx\apps\web\src`.

## 2. Missing Deployment.md
**Conflict:** The prompt and roadmap repeatedly require following `Deployment.md` for CI/CD GitHub Actions and Docker architecture. This document is entirely missing from the repository.
**Recommended Decision:** We will use standard enterprise-grade best practices for Next.js (Turborepo) + FastAPI Dockerization and GitHub Actions that align with `Backend.md` and `Architecture.md` (e.g., multi-stage builds, UID 10001, Ruff, mypy strict, TS strict, and Turborepo caching) since the explicit source of truth is unavailable.

## 3. Phase 00 vs Phase 0 Services
**Conflict:** Various older Phase 0 references might mention Stripe, Redis/ARQ, WhatsApp, or Gemini.
**Resolution:** As dictated by Phase 00's latest trimmed-scope v1 architecture (and confirmed by the existing `.env.local`), we will exclusively configure and use:
- Supabase + pg_cron (No Upstash Redis/ARQ)
- Razorpay (No Stripe)
- OpenAI GPT-4o (No Gemini)
- Sentry
- Resend (No WhatsApp)

**USER OVERRIDE (Option B):** The user explicitly elected to abandon the Turborepo architecture. The root folder will serve as the standalone Next.js frontend, and the backend will be co-located at `src/backend`.

