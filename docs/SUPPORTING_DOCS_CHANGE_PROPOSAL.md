# DREAMX PLATFORM — SUPPORTING DOCUMENTS CHANGE PROPOSAL
**Document Reference:** `SUPPORTING_DOCS_CHANGE_PROPOSAL.md`  
**Date:** 2026-10-13  
**Status:** PROPOSAL ONLY — Awaiting User Approval Prior to Execution  
**Governing Document:** `PRD_CANONICAL_V1.md`  

---

## 1. EXECUTIVE SUMMARY & GOVERNANCE

Per the execution restrictions of the audit mandate, **no existing architecture or documentation files have been modified directly**. 

This document provides a line-by-line and section-by-section change proposal for:
1. `Architecture.md`
2. `Backend.md`
3. `Frontend.md`
4. `Database.md`
5. `API.md`
6. `Security.md`
7. `Testing.md` (Proposal to Author Missing File)
8. `dreamx-build-roadmap-interactive 2026.html` (Roadmap Reconciliation)

Every proposed modification is mapped to a specific requirement in `PRD_CANONICAL_V1.md` and resolves a documented contradiction.

---

## 2. PROPOSED AMENDMENTS TO `Architecture.md`

### Change Arch-01: Update Single Source of Truth
- **Current Text (Line 5):** `**Single Source of Truth:** V8.MD (PRD Version 8.0, Finalized)`
- **Conflict:** `V8.MD` does not exist in the repository.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §1.1 & §14.1
- **Proposed Amendment:** Replace reference with:
  ```markdown
  **Single Source of Truth:** `PRD_CANONICAL_V1.md` (Canonical PRD Version 1.0, October 2026)
  ```

### Change Arch-02: Backend Runtime Architecture Alignment
- **Current Text (§1.2 & §2.1):** Describes a dual-runtime where FastAPI handles AI and heavy compute while Next.js handles frontend edge routing.
- **Conflict:** All 48 production endpoints are already implemented and tested in Next.js TypeScript Route Handlers. `src/backend` is an abandoned 49-line skeleton.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §14.2 & DEC-04
- **Proposed Amendment:** Update architecture diagrams and text to declare a **Next.js 14+ App Router Modular Monolith (TypeScript)** as the unified application and API runtime. FastAPI is marked as an *optional offline microservice deferred to V2 for asynchronous deep ML batch training*.

### Change Arch-03: AI Provider & Vector Embedding Dimensions
- **Current Text (§1.2 & §5):** Mentions Gemini / OpenAI dual models with 1536-dimensional embeddings.
- **Conflict:** Database migration `0007_ai_embeddings_and_prompts.sql` specifies `extensions.vector(768)` for Google `text-embedding-004`.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §10.2 & DEC-05
- **Proposed Amendment:** Standardize provider architecture on **Google Gemini Ecosystem**:
  - LLM: Google `gemini-3.5-flash` (fast inference) & `gemini-1.5-pro` (deep resume parsing).
  - Embeddings: Google `text-embedding-004` (768 dimensions).
  - Vector DB: Supabase PostgreSQL 16 with `pgvector(768)`.

---

## 3. PROPOSED AMENDMENTS TO `Backend.md`

### Change Back-01: Deprecate Dual-Runtime Requirement for MVP
- **Current Text (Part 2 & Part 3):** Mandates Python 3.12, FastAPI 0.111+, Pydantic v2, and Celery for core operations.
- **Conflict:** Maintaining two distinct session managers and deployment stacks for MVP is redundant. Next.js Route Handlers already implement all domain services.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §14.2 & DEC-04
- **Proposed Amendment:** 
  - Restructure Part 2 to define the primary backend as **Next.js 14+ Server Actions & Route Handlers (Node.js 20 LTS / TypeScript 5+)**.
  - Re-scope FastAPI to an optional asynchronous worker for Phase 10 / V2 offline model fine-tuning.
  - Reconcile domain services (`BookingService`, `PaymentService`, `SmartMatchService`, `AIService`) to their TypeScript implementations in `src/lib/`.

### Change Back-02: Payment & Commission Tax Invariance
- **Current Text (Part 10):** Mentions hold-and-release payouts without specifying GST split mechanics.
- **Conflict:** Implementation `src/lib/payments/commission.ts` deducts 18% GST (₹36) from the mentor's gross earnings, leaving ₹764 on a ₹1,000 service, violating the promised 80% mentor payout.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §9.2 & DEC-03
- **Proposed Amendment:** Update backend financial ledger specifications to reflect **Invariant Mentor Base Payout**:
  - Gross Service: ₹1,000.
  - Platform Fee: ₹200 (inclusive of GST).
  - Net Mentor Settlement: ₹800.00 (80.0% fixed).
  - Indian TDS (1% u/s 194-O) deducted where statutory thresholds apply.

---

## 4. PROPOSED AMENDMENTS TO `Frontend.md`

### Change Front-01: Correct Dashboard Routing Structure
- **Current Text (Part 4 & Part 5):** References `/student` and `/mentor` in some tables and `/dashboard/student` in others.
- **Conflict:** Route group `src/app/(dashboard)` stripped `/dashboard` from the URL, causing 404 errors during `router.push('/dashboard/student')`.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §6.2 & §13.2
- **Proposed Amendment:** Standardize all navigation, breadcrumbs, and router pushes to explicit literal paths:
  - Student: `/dashboard/student`
  - Mentor: `/dashboard/mentor`
  - Admin: `/dashboard/admin`
  - Auth Pages: `/login`, `/signup`, `/onboard`

### Change Front-02: Membership Tier Pricing & Discount Cards
- **Current Text (Part 8):** Shows Pro at ₹149/mo (5% discount) and Elite at ₹299/mo (10% discount).
- **Conflict:** Contradicts canonical pricing required for financial sustainability.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §4.3, §8.4, DEC-01 & DEC-02
- **Proposed Amendment:** Update all pricing tables and UI card mockups:
  - Free: ₹0/month (5 AI credits).
  - Pro: ₹399/month or ₹2,988/year (100 AI credits, 10% off services/programs).
  - Elite: ₹799/month or ₹5,988/year (300 AI credits, 20% off services/programs).

---

## 5. PROPOSED AMENDMENTS TO `Database.md`

### Change Data-01: Update Source of Truth & Add Migrations 0007–0010
- **Current Text (Line 5 & Part 2):** Cites missing `V8.MD` and covers migrations only up to `0006`.
- **Conflict:** Migrations `0007_ai_embeddings_and_prompts.sql`, `0008_payments_and_payouts.sql`, `0009_reviews_and_notifications.sql`, and `0010_career_score_and_analytics.sql` exist in code but are missing from documentation.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §15.1
- **Proposed Amendment:** Incorporate complete table schemas for:
  - `ai.document_embeddings` (vector dimension 768)
  - `public.payment_transactions` and `public.payout_logs`
  - `public.reviews` and `public.notifications`
  - `public.career_score_history` and `public.career_journey_progress`

### Change Data-02: Strict RLS Policy Against Privilege Escalation
- **Current Text (Part 5):** `CREATE POLICY "policy_profiles_update" ON public.profiles FOR UPDATE USING (id = auth.uid());`
- **Conflict:** Lacks column-level checks. Allows any user to update `role` to `'admin'`.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §6.4 & DEC-07
- **Proposed Amendment:** Add explicit database trigger and RLS restriction:
  ```sql
  -- Restrict user update trigger: Prevent role self-escalation
  CREATE OR REPLACE FUNCTION public.prevent_profile_role_self_update()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND (auth.jwt() -> 'app_metadata' ->> 'user_role') IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Users cannot modify their own role.';
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

---

## 6. PROPOSED AMENDMENTS TO `API.md`

### Change API-01: Sibling Offer Reservation Lifecycle
- **Current Text (§7.2):** `POST /api/v1/marketplace/offers/{id}/accept` immediately declines sibling offers.
- **Conflict:** Payment abandonment causes irreversible loss of competing offers.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §8.3 & DEC-06
- **Proposed Amendment:** Update endpoint contract:
  - Acceptance creates `service_bookings` with status `pending_payment` and `checkout_ttl = NOW() + 15 min`.
  - Sibling offers transition to `reserved_pending_checkout`.
  - Final `declined` status emitted only upon Razorpay `payment.captured` webhook.
  - If TTL expires, background sweep reverts sibling offers to `pending`.

---

## 7. PROPOSED AMENDMENTS TO `Security.md`

### Change Sec-01: Zero-Trust Public Registration & Role Invariance
- **Current Text (Part 3):** States that roles are assigned during onboarding.
- **Conflict:** Allows users to self-select `'mentor'` without vetting, bypassing admin approval.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §6.3 & DEC-07
- **Proposed Amendment:** Specify zero-trust signup:
  - All public signups default strictly to `user_role = 'student'`.
  - Mentor onboarding sets `verification_status = 'pending_review'`.
  - Upgrade to `user_role = 'mentor'` in `raw_app_meta_data` is strictly gated behind Admin approval (`POST /api/v1/admin/mentors/{id}/approve`).

### Change Sec-02: Reconcile Compliance Claims with MVP Reality
- **Current Text (Part 1):** Asserts "SOC 2 Type II compliant", "Zero EU-US data transfer", and "Multi-region AWS Karpenter".
- **Conflict:** Unsubstantiated claims for a pre-launch startup.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §12.3 & AUDIT-13
- **Proposed Amendment:** Re-frame section as **"Security Architecture Roadmap & Compliance Milestones"**, marking SOC 2 and multi-region sharding as target controls for Phase 11 / Series A.

---

## 8. PROPOSAL: AUTHOR MISSING `Testing.md`

- **Finding:** `Testing.md` is repeatedly cited across the roadmap and user prompt, but the file does not exist in the repository.
- **Canonical PRD Reference:** `PRD_CANONICAL_V1.md` §17.1 & §17.2
- **Proposed Action:** Create `docs/Testing.md` compiling:
  1. Automated test inventory (unit tests, RLS matrix tests, payment E2E tests).
  2. Test accounts registry (derived from `docs/testing/test-accounts.md`).
  3. Pre-flight verification scripts (`scripts/test_full_system_verification.mjs`, `scripts/diagnose_supabase_auth.mjs`).
  4. Definition of Done (DoD) criteria for every release phase.

---

## 9. PROPOSED AMENDMENTS TO ROADMAP (`dreamx-build-roadmap-interactive 2026.html`)

### Change Road-01: Remove Ghost Document References
- **Current Text:** Cites `Implementation.md` across Phases 9, 10, 11, and `Testing.md` across Phase 11.
- **Proposed Amendment:** Update links to point directly to `PRD_CANONICAL_V1.md` and the proposed `docs/Testing.md`.

### Change Road-02: Synchronize AI Milestones
- **Current Text:** Mentions OpenAI GPT-4o in Phase 0 and Gemini in Phase 5.
- **Proposed Amendment:** Harmonize across all phases to **Google Gemini 3.5 Flash** and **Google text-embedding-004 (768 dimensions)**.

---
*Proposal prepared by Principal Product Architect. Changes will only be executed upon explicit human authorization.*
