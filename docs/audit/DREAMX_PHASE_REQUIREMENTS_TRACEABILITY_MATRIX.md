# DREAMX — PHASE REQUIREMENTS TRACEABILITY MATRIX (RTM)

**Document Version:** 1.0.0  
**Scope:** Bi-Directional Mapping from Canonical Requirements (Phases 0–10) to Code Artifacts and Test Proofs  
**Auditor:** QA Architect & Principal Systems Auditor  

---

## 1. Traceability Matrix Legend
- **Req ID:** Canonical requirement identifier from PRD / Phase Specifications.
- **Implementation Artifacts:** Concrete file paths in the codebase implementing the logic.
- **Database Objects:** Tables, migrations, triggers, indexes, and views enforcing data invariants.
- **Verification Proof:** Test scripts, assertions, or static commands confirming compliance.
- **Status:** `VERIFIED (Pass)` | `PARTIAL` | `BLOCKED`

---

## 2. Requirements Traceability Matrix (Phases 0–10)

| Phase | Req ID | Requirement Description | Implementation Artifacts | Database Objects | Verification Proof | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | **REQ-00-01** | Next.js 14 App Router monorepo foundation with TypeScript 5 strict mode | `package.json`, `tsconfig.json`, `next.config.mjs` | N/A | `npm run build`, `npm run typecheck` (0 errors) | **VERIFIED** ✅ |
| **0** | **REQ-00-02** | Supabase managed PostgreSQL connection with SSR cookie session orchestration | `src/middleware.ts`, `src/lib/supabase/*` | PostgreSQL 16 instance | Edge middleware execution, session refresh | **VERIFIED** ✅ |
| **1** | **REQ-01-01** | GoTrue email/password authentication & session tokens | `src/app/(auth)/login/page.tsx`, `signup/page.tsx` | `auth.users`, Migration 0001 | `test_phase0_3_auth_matrix.mjs` (Suite 1, 3) | **VERIFIED** ✅ |
| **1** | **REQ-01-02** | Auto-provisioning of `public.profiles` on user signup | Supabase auth webhook / trigger | `public.profiles`, trigger on `auth.users` | `test_phase0_3_auth_matrix.mjs` (Suite 9) | **VERIFIED** ✅ |
| **1** | **REQ-01-03** | RBAC role separation (`student`, `mentor`, `admin`) in JWT & DB | `src/middleware.ts`, `AdminShell.tsx` | `app_metadata.user_role`, `profiles.role` | `test_phase0_3_auth_matrix.mjs` (Suite 8) | **VERIFIED** ✅ |
| **1** | **REQ-01-04** | Anti-privilege escalation kernel guard blocking self-role updates | Supabase RLS / DB Trigger | `trg_prevent_role_self_update` | `test_phase0_3_auth_matrix.mjs` (Suite 10) | **VERIFIED** ✅ |
| **2** | **REQ-02-01** | 10 canonical standardized service types (S01–S10) seeded and active | `src/app/services/page.tsx`, `api/v1/services/route.ts` | `public.service_types`, Migration 0002 | `test_full_system_verification.mjs` (Phase 2) | **VERIFIED** ✅ |
| **2** | **REQ-02-02** | Mentor availability schedule and custom pricing management | `src/app/dashboard/mentor/services/page.tsx` | `mentor_services`, `mentor_schedules` | `test_full_system_verification.mjs` (Phase 2) | **VERIFIED** ✅ |
| **2** | **REQ-02-03** | Career market configuration locked to India (`CM-IN`) | `src/lib/ai/smart-match-service.ts` | `configuration.career_markets` | `verify_phase10_global_config.mjs` | **VERIFIED** ✅ |
| **3** | **REQ-03-01** | Structured multi-week programs catalog and detail rendering | `src/app/programs/page.tsx`, `programs/[id]/page.tsx` | `structured_programs`, Migration 0004 | `test_phase0_3_auth_matrix.mjs` (Suite 16) | **VERIFIED** ✅ |
| **3** | **REQ-03-02** | Multi-milestone curriculum breakdown with progress tracking | `src/app/dashboard/student/programs/[id]/milestones/page.tsx` | `program_milestones`, `milestone_submissions` | Static component compile & typecheck | **VERIFIED** ✅ |
| **3** | **REQ-03-03** | Program enrollment requiring authentication (HTTP 401 unauth guard) | `src/app/api/v1/programs/[id]/enroll/route.ts` | `program_enrollments` | `test_phase0_3_auth_matrix.mjs` (Suite 16) | **VERIFIED** ✅ |
| **4** | **REQ-04-01** | 8-stage marketplace bidding and negotiation state machine | `src/app/api/v1/marketplace/offers/*` | `service_requests`, `service_offers` | `test_full_system_verification.mjs` (Phase 4) | **VERIFIED** ✅ |
| **4** | **REQ-04-02** | 15-minute checkout TTL slot locking and double-booking defense | `src/app/api/v1/bookings/route.ts` | `uq_active_mentor_slot_lock` index | `test_full_system_verification.mjs` (Stage 5–6) | **VERIFIED** ✅ |
| **4** | **REQ-04-03** | Booking status transitions (`pending_payment -> confirmed -> completed`) | `src/app/api/v1/bookings/[id]/complete/route.ts` | `service_bookings` table | `test_full_system_verification.mjs` (Stage 7–8) | **VERIFIED** ✅ |
| **5** | **REQ-05-01** | PII regex redaction (Email, Phone, PAN, Aadhaar) | `src/lib/ai/scrubber.ts` | N/A | `test_ai_math_unit.ts`, `test_phase5_e2e.ts` | **VERIFIED** ✅ |
| **5** | **REQ-05-02** | Prompt injection XML delimiter sandboxing | `src/lib/ai/prompts.ts` | N/A | `test_phase5_e2e.ts` (Criterion 2) | **VERIFIED** ✅ |
| **5** | **REQ-05-03** | 14-dimension composite matching algorithm (Weights sum to 1.00) | `src/lib/ai/smart-match-service.ts` | N/A | `test_ai_math_unit.ts` (Weights test) | **VERIFIED** ✅ |
| **5** | **REQ-05-04** | pgvector 768-dim embeddings with HNSW cosine distance index | `src/lib/ai/smart-match-service.ts` | `ai.document_embeddings`, `idx_vector_hnsw` | `test_phase5_e2e.ts` (Criterion 4) | **VERIFIED** ✅ |
| **5** | **REQ-05-05** | 3000ms circuit breaker with deterministic heuristic fallback | `src/lib/ai/smart-match-service.ts` | N/A | `test_phase5_e2e.ts` (Criterion 5) | **VERIFIED** ✅ |
| **5** | **REQ-05-06** | Telemetry and prompt auditing in isolated `ai` schema | `src/lib/ai/smart-match-service.ts` | `ai.ai_prompt_logs` | `test_phase5_e2e.ts` (Criterion 8) | **VERIFIED** ✅ |
| **6** | **REQ-06-01** | Zero internal custody gateway hold-and-release model (PRD §13.6) | `src/lib/payments/payout-sweeper.ts` | `payout_schedules`, Migration 0008 | `test_phase6_payments_e2e.ts` (Criterion 1) | **VERIFIED** ✅ |
| **6** | **REQ-06-02** | Commission split (20% fee + 18% GST; 76.4% net mentor payout) | `src/lib/payments/commission-calculator.ts` | `payout_schedules.gst_amount` | `test_milestone2_payments.ts` (Suite 1) | **VERIFIED** ✅ |
| **6** | **REQ-06-03** | 3-day (service) / 14-day (program) gateway hold durations | `src/lib/payments/commission-calculator.ts` | `payout_schedules.hold_until` | `test_milestone2_payments.ts` (Suite 1) | **VERIFIED** ✅ |
| **6** | **REQ-06-04** | HMAC-SHA256 signature verification & webhook replay defense | `src/app/api/v1/webhooks/razorpay/route.ts` | `processed_webhook_events` table | `test_milestone3_orchestration.ts` | **VERIFIED** ✅ |
| **6** | **REQ-06-05** | Dispute payout freezing (`frozen=true`) and sweep exclusion | `src/lib/payments/payout-sweeper.ts` | `payout_schedules.frozen` | `test_milestone3_orchestration.ts` | **VERIFIED** ✅ |
| **6** | **REQ-06-06** | Admin force-release override with immutable audit trail | `src/app/api/v1/admin/payouts/[id]/action/route.ts` | `payout_logs` table | `test_milestone3_orchestration.ts` | **VERIFIED** ✅ |
| **6.5**| **REQ-65-01** | Student Membership tier matrix (Free, Pro, Elite) | PRD Part 34-35, Commission Engine | Pricing schemas | `test_milestone2_payments.ts` | **VERIFIED** ✅ |
| **7** | **REQ-07-01** | Realtime booking chat channels and participant isolation | `src/app/api/v1/bookings/[id]/messages/route.ts` | `public.messages`, Supabase Realtime | `test_phase7_notifications_e2e.ts` (Crit 1, 2)| **VERIFIED** ✅ |
| **7** | **REQ-07-02** | In-app notification center feed & read state transitions | `src/app/api/v1/notifications/*` | `public.notifications` | `test_phase7_notifications_e2e.ts` (Crit 7) | **VERIFIED** ✅ |
| **7** | **REQ-07-03** | Resend email adapter with sandbox capture mode | `src/lib/notifications/email-service.ts` | N/A | `test_phase7_notifications_e2e.ts` (Crit 3) | **VERIFIED** ✅ |
| **7** | **REQ-07-04** | 24-hour pre-session reminder sweep worker | `src/lib/notifications/notification-service.ts` | `notification_schedules` | `test_phase7_notifications_e2e.ts` (Crit 4) | **VERIFIED** ✅ |
| **7** | **REQ-07-05** | Post-session review submission & 5-star rating aggregation | `src/app/api/v1/reviews/route.ts` | `public.reviews` (CHECK 1–5 stars) | `test_phase7_notifications_e2e.ts` (Crit 5, 6)| **VERIFIED** ✅ |
| **8** | **REQ-08-01** | Career Readiness 8-dimension weighted model (0–1000 scale) | `src/lib/career/career-score-service.ts` | `career_scores`, Migration 0010 | `test_phase8_career_analytics_e2e.ts` (Crit 2) | **VERIFIED** ✅ |
| **8** | **REQ-08-02** | Monotonic career score progression & history snapshotting | `src/lib/career/career-score-service.ts` | `career_score_history` | `test_phase8_career_analytics_e2e.ts` (Crit 3) | **VERIFIED** ✅ |
| **8** | **REQ-08-03** | 10-stage guided journey DAG dependency enforcement | `src/lib/career/career-score-service.ts` | `career_journey_progress` | `test_phase8_career_analytics_e2e.ts` (Crit 4) | **VERIFIED** ✅ |
| **8** | **REQ-08-04** | Stage 7 manual applications tracker (10 application threshold) | `src/app/api/v1/students/me/journey/[stage]/track/route.ts`| `career_journey_progress` | `test_phase8_career_analytics_e2e.ts` (Crit 5) | **VERIFIED** ✅ |
| **8** | **REQ-08-05** | Deterministic recommendations engine with 14-day dismissal | `src/lib/career/recommendation-service.ts` | `ai_recommendations` | `test_phase8_career_analytics_e2e.ts` (Crit 6) | **VERIFIED** ✅ |
| **8** | **REQ-08-06** | Mentor analytics ledger with 76.4% net payout split | `src/lib/career/mentor-analytics-service.ts`| `service_bookings`, `reviews` | `test_phase8_career_analytics_e2e.ts` (Crit 7) | **VERIFIED** ✅ |
| **8** | **REQ-08-07** | 1-hour stale score recalculation sweep worker | `src/lib/career/career-score-service.ts` | `career_scores.calculated_at` | `test_phase8_career_analytics_e2e.ts` (Crit 8) | **VERIFIED** ✅ |
| **9** | **REQ-09-01** | Centralized AdminShell across 10 admin sub-routes | `src/components/admin/AdminShell.tsx` | N/A | Production build (all 10 pages compiled) | **VERIFIED** ✅ |
| **9** | **REQ-09-02** | Mentor KYC approval queue & state transition to 'active' | `src/app/api/v1/admin/mentors/[id]/action/route.ts` | `public.profiles.mentor_status` | `test_phase9_admin_e2e.mjs` (Suite 4) | **VERIFIED** ✅ |
| **9** | **REQ-09-03** | Dispute arbitration lifecycle and telemetry timeline | `src/app/api/v1/admin/disputes/*` | `disputes`, `dispute_telemetry_logs`| `test_phase9_admin_e2e.mjs` (Suite 5) | **VERIFIED** ✅ |
| **9** | **REQ-09-04** | WORM append-only audit trail in `audit.system_audit_logs` | Trigger `trg_no_audit_updates` | `audit.system_audit_logs` | `test_phase9_admin_e2e.mjs` (Suite 3) | **VERIFIED** ✅ |
| **9** | **REQ-09-05** | Platform KPI calculation and executive overview aggregation | `src/app/api/v1/admin/overview/route.ts` | Cross-table aggregates | `test_phase9_admin_e2e.mjs` (Suite 7) | **VERIFIED** ✅ |
| **10**| **REQ-10-01** | India MVP configuration lockdown (`IN`, `CM-IN`, `INR`, `en/hi`)| Seed scripts, configuration tables | `configuration.*` tables | `verify_phase10_global_config.mjs` | **VERIFIED** ✅ |
| **10**| **REQ-10-02** | DPDP Act 2023 `/privacy` portal and export/deletion controls | `src/app/privacy/page.tsx`, `api/v1/privacy/*` | `privacy.data_export_requests` | `test_phase10_privacy_e2e.mjs` (Suite 1, 2) | **VERIFIED** ✅ |
| **10**| **REQ-10-03** | 24-hour data export rate limit guard | `src/app/api/v1/privacy/export/route.ts` | `privacy.data_export_requests` | `test_phase10_privacy_e2e.mjs` (Suite 3) | **VERIFIED** ✅ |
| **10**| **REQ-10-04** | DPDP 30-day soft-delete grace period before purge | `src/app/api/v1/privacy/account/route.ts` | `profiles.is_deletion_requested` | `test_phase10_privacy_e2e.mjs` (Suite 4) | **VERIFIED** ✅ |
| **10**| **REQ-10-05** | Scope exclusion: Zero GDPR or multi-region sharding built | Repository architecture | Single region setup | Verified in Phase 10 audit | **VERIFIED** ✅ |
