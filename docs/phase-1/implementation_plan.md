# Phase 1 Implementation Plan: Authentication & Identity

## 1. Repository & Phase 0 Readiness Audit
- **Current State:** Phase 0 is marked as complete. The monorepo architecture was overridden via Option B to use a standalone Next.js root structure with `src/app/` and a nested `src/backend/` for FastAPI.
- **Dependencies Verified:** Next.js (14.2+), TypeScript (strict mode), Tailwind CSS, FastAPI (0.111+), Pydantic Settings, CI/CD pipeline (`.github/workflows/ci.yml`), Zod validations.
- **Environment:** `env.local` contains Supabase URL/keys, Resend keys, and AI keys.

## 2. Documentation Audit & Requirements
- **Database:** `Database.md` (Part 5 & 8) specifies the exact DDL for `public.profiles` and dependent enums (`user_role_enum`, `membership_tier_enum`, `verification_status_enum`), as well as the RLS access matrix.
- **Backend:** `Backend.md` (Part 10 & 11) specifies JWT signature verification, a `get_current_user` dependency, and a `require_role()` RBAC decorator.
- **Frontend:** `Frontend.md` (Part 9.2 & 10.2) specifies route protection rules for `/(dashboard)/*` and the structure for auth pages.
- **Testing:** `Testing.md` (Part 6) specifies tenant isolation integration tests.

## 3. Authentication Architecture (Supabase Gotrue)
- **Email OTP:** Magic link/OTP via Resend.
- **OAuth:** Google and LinkedIn OAuth configured via Supabase.
- **Session:** JWT access tokens (1h TTL) + Refresh tokens (30d TTL) utilizing HttpOnly cookies and refresh token rotation.
- **Logout:** Complete session termination terminating Supabase Gotrue sessions.

## 4. Database Architecture (Migrations & RLS)
**Migration `0001_initial_auth_profiles.sql`:**
- **Enums:** `user_role_enum`, `membership_tier_enum`, `verification_status_enum`.
- **Tables:** `public.profiles` with `auth.users(id)` foreign key and trigger.
- **Audit:** Session audit log table.
- **RLS:** `ENABLE ROW LEVEL SECURITY` on `public.profiles`.
- **Policies:** Match `Database.md` Part 8 (users can read/update own profiles, admin read all).

## 5. Backend Authentication (FastAPI)
- **Middleware:** JWT validation against Supabase JWKS.
- **Dependency:** `get_current_user(token: str = Depends(...))` to inject typed user context.
- **Authorization:** `@require_role(["student", "mentor", "admin"])` decorator per `Backend.md`.
- **Error Handling:** RFC 7807 structured JSON responses for 401/403 errors.

## 6. Frontend Authentication (Next.js)
- **Middleware:** `src/middleware.ts` to enforce `Frontend.md` route rules (`/dashboard/student/*` strictly for students, etc.). Unauthenticated users redirect to `/login`.
- **State:** React Context or Zustand store for user session.

## 7. UI/UX Implementation (Visual References)
- **References Found:** `src/app/(auth)/login/screen.png`, `signup/screen.png`, `forgot-password/screen.png`, `verify/screen.png`, `onboard/screen.png`.
- **Component Strategy:** As this is the first feature phase, foundational shadcn/ui-inspired primitives (Button, Input, Form, Card) will be extracted and built in `src/components/ui/` matching the visual reference fidelity exactly.
- **Layout:** Responsive auth layouts (`src/app/(auth)/layout.tsx`) wrapping the individual pages.
- **Flow:** `/signup` -> role selection -> `/verify` -> `/onboard` -> `/dashboard/...`.

## 8. Authorization Foundation
- Role-based Access Control (RBAC) established via Supabase `app_metadata` and `public.profiles.role`.

## 9. Environment Variables
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used on the frontend.
- Backend utilizes `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWT_SECRET` via `config.py`.

## 10. Security
- **Mitigations:** Do not log PII or tokens. Ensure RLS policies explicitly deny access by default unless matched. Use `HttpOnly` cookies via `@supabase/ssr` to prevent XSS exfiltration of refresh tokens.
- **Validation:** Zod parsing on frontend; Pydantic on backend.

## 11. Testing Strategy
- **Backend:** Test endpoints simulating different JWT roles (tenant isolation tests).
- **Database:** Ensure cross-tenant data requests fail at the PostgreSQL RLS level.
- **Frontend:** Visual and integration checks for Auth flows against `src/app/(auth)` mockups.

## 12. Exact Files to Change / Create
- `supabase/migrations/0001_initial_auth_profiles.sql`
- `src/backend/app/core/security.py`
- `src/backend/app/core/dependencies.py`
- `src/middleware.ts`
- `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- `src/components/ui/button.tsx`, `input.tsx`, `card.tsx`
- `src/app/(auth)/layout.tsx`, `login/page.tsx`, `signup/page.tsx`, `verify/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `onboard/page.tsx`
- `src/backend/tests/test_auth_isolation.py`

## 13. Out of Scope
- No Mentor Catalog/Discovery pages.
- No Payment integrations.
- No AI/LLM connections.
- No Booking workflows.

## 14. Verification Plan
1. Check Database applied migration correctly.
2. Verify Supabase JWT login returns valid token.
3. Assert Next.js middleware blocks `/dashboard/admin` from a `student` role.
4. Assert FastAPI endpoints reject invalid/expired JWTs with 401.
5. Visually compare `/login` and `/signup` against `.png` references.
