# DREAMX PLATFORM — CANONICAL PRD & ARCHITECTURE AUDIT REPORT
**Document Reference:** `PRD_AUDIT_REPORT.md`  
**Audit Date:** 2026-10-13  
**Auditor:** Principal Product Architect, Senior Full-Stack Architect, Supabase Security Specialist & Technical Documentation Auditor  
**Scope:** Complete repository audit of `docs/prd.MD` (Evolution Analysis & Blueprint), system architecture specifications, authentication implementation, database migrations, and operational test suites.  
**Target Canonical Document:** `PRD_CANONICAL_V1.md`  
**Status:** Audit Complete — Pending Product Owner Sign-Off  

---

## 1. EXECUTIVE AUDIT SUMMARY

An exhaustive audit of the DreamX documentation ecosystem and its corresponding technical codebase was conducted. The primary objective was to diagnose documentation contradictions, eliminate identity/authentication failure loops, establish strict authorization boundaries, and produce a single, internally consistent, implementation-ready **Canonical PRD (`PRD_CANONICAL_V1.md`)**.

### Key Findings at a Glance:
1. **Document Fragmentation & Ghost References:** The document `docs/prd.MD` (180 KB) is an **Evolution Analysis & Blueprint** comparing an uncommitted "v5 PRD" against a proposed "v6/v8" career success marketplace. The foundational predecessor ("v5 PRD") and the frequently referenced authoritative blueprint ("`V8.MD`", cited in `Architecture.md`, `Backend.md`, `Database.md`, and `API.md`) are **both missing from the repository**.
2. **Recurring Authentication Failures — Multi-Layer Root Cause:** The recurring authentication failures are caused by a combination of:
   - **Frontend Routing Mismatches:** Route group folder naming (`src/app/(dashboard)/...` vs literal `/dashboard/...`) leading to silent 404 navigation aborts.
   - **UI Loading State Freezes:** Missing reset logic on navigation failures in `login/page.tsx`.
   - **Middleware Session Cookie Truncation:** Returning a new `NextResponse.redirect()` within `@supabase/ssr` middleware discards refreshed session cookies.
   - **Severe Privilege Escalation Vulnerability:** The profile initialization trigger (`handle_new_user()`) blindly trusted client-supplied `raw_user_meta_data->>'role'`, and the RLS update policy on `public.profiles` lacked column-level protection, allowing any authenticated user to update their role to `'admin'` or `'mentor'`, which migration `0005_auth_metadata_sync.sql` automatically synced to `auth.users.raw_app_meta_data`.
3. **Severe Financial & Business Logic Contradictions:**
   - **Membership Pricing Contradiction:** §3.C specifies Pro at ₹149/mo (₹1,188/yr) and Elite at ₹299/mo (₹2,388/yr), while §3.C Financial Projections, §14.1, and §17.1 (Module 8) calculate platform revenue and feature gating using Pro at ₹399/mo (₹2,988/yr) and Elite at ₹799/mo (₹5,988/yr).
   - **Membership Discount Discrepancy:** §3.C defines service discounts as 5% (Pro) and 10% (Elite), whereas §14.1 and Module 8 define them as 15% (Pro) and 25% (Elite).
   - **Financial Incoherence:** The financial sustainability model breaks completely under the ₹149/₹299 pricing structure if discounts of 15%/25% or even 5%/10% are absorbed by the platform.
   - **Tax and Mentor Earnings Mismatch:** The PRD guarantees mentors receive "80% of listed price" for services, while the payment implementation (`commission.ts`) deducts 18% GST (₹36 on a ₹200 platform fee) from the mentor's gross payout, leaving the mentor with only ₹764 (76.4%).
4. **AI Architecture & Vector Dimension Mismatch:**
   - The PRD (§3.C) mandates `text-embedding-3-small` (OpenAI, 1536 dimensions) or Gemini Pro.
   - The actual database migration (`0007_ai_embeddings_and_prompts.sql`) provisions `extensions.vector(768)` for Google `text-embedding-004` (768 dimensions). Storing 1536-dimensional embeddings in this table will cause fatal PostgreSQL runtime errors.
5. **Backend Architectural Divergence:**
   - `Backend.md` specifies a dual-runtime "Hybrid Monolith" requiring a FastAPI (Python 3.12) backend alongside Next.js Server Actions.
   - In the actual codebase, `src/backend` is an abandoned 3-file skeleton (`main.py` only implements `/api/health`), while all 48 operational endpoints (bookings, payments, search, AI, reviews, notifications, admin) are implemented natively as Next.js 14 App Router TypeScript Route Handlers (`src/app/api/v1/...`).

---

## 2. SOURCE DOCUMENTATION AUDIT & INVENTORY

| Document Name | File Path / Location | Size | Status in Repo | Quality & Integrity Assessment |
|---|---|---|---|---|
| **Original v5 PRD** | Referenced in `docs/prd.MD` | N/A | **MISSING** | Predecessor document cited in §1-§47 of `docs/prd.MD`. Never committed to repository. Requirements must be reconstructed from evolution diffs. |
| **V8.MD (PRD v8.0)** | Cited in `Architecture.md`, `Backend.md`, `Database.md`, `API.md` | N/A | **MISSING** | Cited as "Single Source of Truth" across enterprise architecture docs. File does not exist anywhere in the filesystem or Git tree. |
| **Implementation.md** | Cited in `dreamx-build-roadmap-interactive 2026.html` | N/A | **MISSING** | Referenced in Phases 9, 10, 11 of the interactive roadmap. Not committed. |
| **Testing.md** | Referenced in user prompt & roadmap | N/A | **MISSING** | Standalone file missing. Partially compensated by `docs/testing/test-accounts.md`, `Coding-Standards.md`, and test scripts in `scripts/`. |
| **PRD Evolution Blueprint** | `docs/prd.MD` | 180.5 KB | **PRESENT** | Comprehensive (2,943 lines) evolution analysis. Contains critical internal contradictions between early sections and later financial/architectural blueprints. |
| **Architecture Specification** | `docs/Architecture.md` | 73.3 KB | **PRESENT** | High quality (981 lines). Describes Next.js 14 modular monolith + Supabase PostgreSQL 16. Cites missing `V8.MD`. |
| **Backend Specification** | `docs/Backend.md` | 118.5 KB | **PRESENT** | Deeply detailed (1,267 lines) but describes a FastAPI + Next.js hybrid backend that was never fully realized in code. |
| **Frontend Specification** | `docs/Frontend.md` | 102.0 KB | **PRESENT** | Excellent design system and UI specifications (2,330 lines). Accurately matches shadcn/ui and Tailwind tokens. |
| **Database Specification** | `docs/Database.md` | 41.8 KB | **PRESENT** | Detailed schema specifications (657 lines). Aligns with migrations 0001–0006, but lacks Phase 7–10 table evolutions. |
| **API Specification** | `docs/API.md` | 82.5 KB | **PRESENT** | Comprehensive REST contract specifications (1,511 lines). Aligns with Next.js route handlers. |
| **AI Specification** | `docs/AI.md` | 86.3 KB | **PRESENT** | Highly detailed (908 lines). Describes dual Gemini/OpenAI strategy. Conflicts with 768-dim pgvector migration. |
| **Security Specification** | `docs/Security.md` | 70.1 KB | **PRESENT** | Enterprise security specification (642 lines). Outlines RLS, mTLS, PII redaction, and DPDP Act compliance. |
| **Deployment Specification** | `docs/Deployment.md` | 77.5 KB | **PRESENT** | Specifies AWS ECS/EKS + Cloudflare + Vercel deployment. Diverges from current pure Vercel/Supabase setup. |
| **Coding Standards** | `docs/Coding-Standards.md` | 40.9 KB | **PRESENT** | Strict engineering rules. Mandates test verification and prevents unauthorized scope expansion. |
| **Build Roadmap** | `docs/dreamx-build-roadmap-interactive 2026.html` | 297.5 KB | **PRESENT** | 11-phase delivery roadmap. References missing documents but provides clear milestone targets. |
| **Authentication Audit** | `docs/authentication-audit.md` | 6.0 KB | **PRESENT** | Audit report dated 2026-10-08 detailing login freeze, 404 route mismatches, and cookie drops. |
| **Auth Fix Plan** | `docs/auth_fix_implementation_plan.md` | 1.8 KB | **PRESENT** | Surgical 4-step remediation plan for auth defects. |

---

## 3. DEEP DIVE: AUTHENTICATION, IDENTITY & SECURITY AUDIT

### 3.1 Root Causes of Recurring Authentication Failures

The recurring authentication issues reported in DreamX stem from four distinct architectural and implementation defects across the frontend, middleware, and database layers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. ROUTE GROUP MISMATCH                                                                │
│ File: src/app/(dashboard)/student/page.tsx                                             │
│ Issue: Folder has parenthesis `(dashboard)` -> Next.js maps URL to `/student`.         │
│ Effect: Code calls `router.push('/dashboard/student')` -> 404 NOT FOUND.               │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. UI STATE LOCK                                                                       │
│ File: src/app/(auth)/login/page.tsx                                                    │
│ Issue: `setLoading(true)` is never reset to `false` on success.                        │
│ Effect: When `/dashboard/student` 404s, page stays mounted and frozen on spinner.       │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. MIDDLEWARE COOKIE DROPPING                                                          │
│ File: src/lib/supabase/middleware.ts                                                   │
│ Issue: `NextResponse.redirect()` returns a fresh response without `supabaseResponse`   │
│        cookies containing refreshed JWT tokens.                                        │
│ Effect: Browser drops session cookies; subsequent page loads treat user as logged out. │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. CRITICAL PRIVILEGE ESCALATION & ROLE DESYNC                                         │
│ File: supabase/migrations/0001_initial_auth_profiles.sql & 0005_auth_metadata_sync.sql │
│ Issue A: `handle_new_user()` used `NEW.raw_user_meta_data->>'role'` (client-supplied). │
│ Issue B: `policy_profiles_update` allowed users to UPDATE their own `role` column.     │
│ Issue C: `on_profile_role_changed` automatically synced updated `role` to app_metadata!│
│ Effect: Any user can self-escalate to 'admin' via simple client-side update query!     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Single Authoritative Identity Architecture

To eliminate identity fragmentation, the platform must enforce one authoritative identity model:
1. **Cryptographic Identity Source:** Supabase Auth (`auth.users.id`, UUIDv4) is the sole identity authority. No entity exists without an active row in `auth.users`.
2. **Profile Entity:** `public.profiles` is a strict 1:1 relational extension (`id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`).
3. **Role Source of Truth:** 
   - The authoritative role MUST reside in `auth.users.raw_app_meta_data ->> 'user_role'`.
   - `app_metadata` can **only** be modified by the Supabase Service Role (backend server APIs / database triggers running `SECURITY DEFINER`). It is cryptographically signed into the JWT.
   - `public.profiles.role` is a read-synchronized mirror for relational queries and joins.
4. **Eliminating Privilege Escalation:**
   - Public signup MUST unconditionally assign `user_role = 'student'` in `app_metadata`. Any `user_role` or `role` passed in `raw_user_meta_data` must be ignored.
   - The RLS policy `policy_profiles_update` on `public.profiles` must be restricted to non-sensitive columns (`full_name`, `avatar_url`, `headline`, `bio`, `time_zone`, `target_career_market_id`, `languages_spoken`). Column `role` must **never** be updatable by regular authenticated users.
   - Mentor role assignment requires formal application and approval by an Admin.
   - Admin role assignment requires direct database administration or service-role CLI execution.

### 3.3 Auth User vs. Public Profile Lifecycle

| State | Condition | Frontend Behavior | Middleware Action | Database / Recovery Action |
|---|---|---|---|---|
| **P1: Fully Active** | `auth.users` exists + `profiles` exists + role matches | Loads dashboard (`/dashboard/student` or `/dashboard/mentor`) | Passes request (`NextResponse.next()`) | Normal operation. |
| **P2: New Registration** | `auth.users` created + trigger provisions initial profile | Redirects to `/onboard` | Allows `/onboard` route | Profile initialized with default values (`role = 'student'`). |
| **P3: Orphan Auth User** | `auth.users` exists, but `public.profiles` row missing | Displays loading / recovery splash | Redirects to `/onboard` | Onboarding API executes idempotent profile upsert using service role. |
| **P4: Unverified Mentor** | `profiles.role = 'mentor'`, but `verification_status = 'pending_review'` | Displays "Mentor Application Under Review" banner | Restricts access to public services and booking calendar | Mentor dashboard operates in read-only / draft mode until admin approves. |
| **P5: Session Expired** | Refresh token expired / revoked | Redirects to `/login?error=session_expired` | Clears cookies, redirects to `/login` | GoTrue rejects token exchange; client cleans local state. |

---

## 4. DETAILED PRD CONTRADICTIONS AUDIT (13 MANDATORY ITEMS)

Below is the definitive audit register resolving all conflicting statements, gaps, and ambiguities across `docs/prd.MD`, architecture specifications, and implementation artifacts.

### Issue Register Matrix

| Issue ID | Area / Subject | Conflicting Sections in PRD & Docs | Nature of Conflict & Evidence | Impact (Financial / Security / Eng) | Recommended Canonical Resolution | Decision Owner | Current Status |
|---|---|---|---|---|---|---|---|
| **AUDIT-01** | Membership Pricing | `prd.MD` §3.C (lines 312-315) vs §3.C Projections (lines 404, 417-420) vs §17.1 Module 8 (line 2218) | §3.C specifies Pro at ₹149/mo (₹1,188/yr) and Elite at ₹299/mo (₹2,388/yr).<br/>§3.C Projections and Module 8 calculate revenue at Pro ₹399/mo (₹2,988/yr) and Elite ₹799/mo (₹5,988/yr).<br/>§9.2 mentions Pro at ₹299/mo. | **CRITICAL (Financial):** At ₹149/mo, platform loses money on every subscriber after absorbing discounts and AI costs. Revenue model in §3.C collapses. | **Approve Pricing Model B:** Free: ₹0/mo; Pro: ₹399/mo (₹2,988/yr, effective ₹249/mo); Elite: ₹799/mo (₹5,988/yr, effective ₹499/mo). Retain ₹149 as promotional student launch rate or credit top-up price. | Product Owner | Confirmed Conflict (Pending Approval) |
| **AUDIT-02** | Membership Discounts | `prd.MD` §3.C (lines 317-318) vs §14.1 (line 1349) vs §17.1 Module 8 (line 2225) vs QG-Gap G2 (line 2744) | §3.C defines service discounts as 5% (Pro) and 10% (Elite).<br/>§14.1 and Module 8 define service discounts as 15% (Pro) and 25% (Elite).<br/>Program discounts are 5%/10% in §3.C vs 10%/20% in §14.1. | **HIGH (Financial / Legal):** 25% discount on a ₹1,000 service exceeds platform's 20% commission, causing negative gross margin unless mentor absorbs it (which violates §17.1 mentor protection). | **Standardize Discounts:**<br/>- Pro: 10% off services, 10% off first month of programs.<br/>- Elite: 20% off services, 20% off first month of programs.<br/>Platform absorbs discount from its commission pool; mentor payout remains invariant. | Product Owner | Confirmed Conflict (Pending Approval) |
| **AUDIT-03** | Revenue & AI Cost Models | `prd.MD` §3.C (lines 409-439) vs `.env.example` vs `AI.md` Part 15 | Monthly AI cost assumed at ₹3/user for Free, ₹35/user for Pro, ₹50/user for Elite.<br/>However, §3.C line 342 offers "Full AI-powered long-context Gemini 1.5 Pro OCR resume audit" (5 credits). At high token volume, un-cached 1.5 Pro audits cost ~₹15-25 each. | **HIGH (Financial):** If 250 Pro users execute 3 deep resume audits/month, actual AI costs are ₹15,000+, outstripping the ₹8,750 budget by 71%. | Enforce strict semantic caching (PostgreSQL), prompt compression, and route lightweight tasks to `gemini-3.5-flash` (or `gemini-1.5-flash`). Limit deep 1.5 Pro audits to Elite tier and paid credit packs. | AI Architect / FinOps | Confirmed Conflict (Resolved in PRD) |
| **AUDIT-04** | AI Provider & Vector Dimensions | `prd.MD` §3.C (line 341) & §24 vs `AI.md` Part 2 vs `0007_ai_embeddings_and_prompts.sql` | `prd.MD` specifies `text-embedding-3-small` (OpenAI, 1536 dims).<br/>`AI.md` lists OpenAI + Gemini.<br/>Migration 0007 provisions `extensions.vector(768)` for Google `text-embedding-004` (768 dims).<br/>`.env.example` lists `gemini-embedding-001`. | **CRITICAL (Engineering):** Inserting 1536-dimensional embeddings into a 768-dimensional pgvector column throws a fatal SQL error. Incompatible vector models break similarity search. | **Standardize Canonical Provider on Google Gemini:**<br/>- Primary Embedding: `text-embedding-004` (768 dimensions).<br/>- Chat & Scoring LLM: `gemini-3.5-flash` / `gemini-1.5-flash`.<br/>- Deep Audit LLM: `gemini-1.5-pro`.<br/>Align all docs and schemas to 768 dimensions. | AI Systems Architect | Confirmed Conflict (Resolved in PRD) |
| **AUDIT-05** | MVP vs. Later AI Scope | `prd.MD` §1.3 (C2) & §20 vs Part 6 / 9 / 17 vs Phase 5 in code | v5 PRD stated "AI Features: None for MVP".<br/>`prd.MD` Part 6 & 17 claim V1 is strictly rule-based (14-dimension SQL heuristic).<br/>Yet Part 3.C and Phase 5 code implement live LLM resume analysis and co-pilot chat. | **MEDIUM (Scope / Delivery):** Unclear whether launch MVP requires live LLM keys or can operate fully on deterministic fallbacks if APIs fail. | **Canonical Layering:**<br/>- Core MVP Matching: Deterministic SQL heuristic (14 dimensions) with zero LLM critical-path dependency.<br/>- MVP Value-Add AI: Async resume analysis and interview prep via Gemini Flash with graceful fallback to rule-based rubrics. | Technical Lead | Confirmed Conflict (Resolved in PRD) |
| **AUDIT-06** | Service & Program Pricing Models | `prd.MD` §3.A (lines 181-187) vs §3.B (lines 280-286) vs `0006_one_time_services_bookings.sql` | §3.A defines 10 standardized service types with strict floor and ceiling prices (e.g., S01 Resume Review: ₹499-999, floor ₹399, ceiling ₹1,499).<br/>In contrast, custom mentor pricing outside ceilings is ambiguous. | **MEDIUM (Marketplace Ops):** Mentors attempting to list services at ₹2,500 fail validation if ceiling is hard-coded in DB. | Enforce database validation constraints against `mentor_services.price` adhering to `service_types.price_floor` and `price_ceiling`. Mentors may set any price within the platform-defined bounds. | Product Owner | Missing Specification (Resolved) |
| **AUDIT-07** | Booking vs. Payment Confirmation | `prd.MD` §8.1 State Diagram vs §8.2 Sequence Diagram vs `offers/[id]/accept/route.ts` | §8.1 states booking is confirmed **only upon payment success**.<br/>§8.2 sequence diagram states "Offer accepted! Prepare for session" before payment order is even created.<br/>In code, accepting an offer immediately sets `service_bookings.status = 'pending_payment'` with a 15m checkout TTL. | **HIGH (Concurrency / UX):** If session is scheduled before payment, mentors reserve time slots that students subsequently abandon. | **Canonical State Machine:**<br/>1. Offer Accept -> Booking status `pending_payment` (15-min lock on mentor calendar).<br/>2. Payment Captured Webhook -> Booking status transitions to `confirmed`. Session and Google Meet links generated **only after** payment capture.<br/>3. TTL Expiry -> Booking transitions to `expired`; mentor calendar slot released. | Backend Architect | Confirmed Conflict (Resolved in PRD) |
| **AUDIT-08** | Sibling Offer Lifecycle on Acceptance | `prd.MD` §7.3 vs §8.2 vs `offers/[id]/accept/route.ts` | In `offers/[id]/accept/route.ts`, accepting offer A immediately marks all sibling offers (B, C) as `declined` and request as `booked`.<br/>If student abandons checkout during the 15-minute window, sibling offers are permanently lost. | **HIGH (Marketplace Liquidity):** Students cannot fallback to alternative offers if payment fails; mentors receive false "Declined" notifications. | **Soft Reservation Pattern:**<br/>When offer A is accepted, sibling offers are placed in `reserved_pending_checkout`. If checkout succeeds, they become `declined`. If checkout expires after 15m, sibling offers revert to `pending` and the request re-opens. | Marketplace Architect | Confirmed Conflict (Resolved in PRD) |
| **AUDIT-09** | Commission, Taxes & Payout Net Math | `prd.MD` §14.1 & §17.1 (line 2226) vs `commission.ts` & `0008_payments_and_payouts.sql` | PRD states "Mentor receives full 80% of listed price" (or 85% for programs).<br/>`commission.ts` calculates: Gross ₹1,000 -> 20% Platform Fee (₹200) -> 18% GST on fee (₹36) -> Net Mentor Payout = ₹764 (76.4%). | **CRITICAL (Financial / Legal):** Discrepancy between promised 80% mentor earnings and actual ₹764 payout creates mentor trust erosion and legal exposure under Indian contract law. | **Clarify Tax Invariance:**<br/>- Platform commission is 20% (₹200).<br/>- 18% GST (₹36) is statutory tax on the platform's service fee.<br/>- **Standard India Marketplace Model:** The student is charged ₹1,000 + GST or gross ₹1,000 inclusive of platform fee. To guarantee mentor receives 80% (₹800), platform fee is ₹200 inclusive of ₹30.51 GST, OR mentor gross is ₹800 and TDS (1% u/s 194-O) is deducted. PRD canonical specification must declare whether ₹1,000 is tax-inclusive. | Finance & Legal / Product Owner | Confirmed Conflict (Pending Business Decision) |
| **AUDIT-10** | Career Score & Journey Unlock Criteria | `prd.MD` §10.3 vs §11.1 vs QG-Gap G3 (line 2745) | §10 states journey stages unlock based on career score thresholds.<br/>§11.1 notes portfolio dimension is excluded for non-portfolio roles (e.g. SDE), but fails to define weight redistribution mechanism.<br/>Code implements hard-coded 4-dimension sum. | **MEDIUM (Engineering / UX):** Students in technical tracks without portfolios get penalized or blocked from advancing in journey stages. | Define dynamic weight redistribution in Career Score algorithm: if target role has `requires_portfolio = false`, the 25% portfolio weight is redistributed proportionally across Technical Readiness (50%) and Interview Readiness (25%). | Product Architect | Missing Specification (Resolved) |
| **AUDIT-11** | India-First MVP vs. Global Architecture | `prd.MD` Part 18 vs `Architecture.md` Part 1 vs `Database.md` Part 3 | Part 18 and `Architecture.md` introduce full multi-currency, multi-market registries (`career_markets`, `platform_countries`, `platform_currencies`), PayPal/Stripe adapters, and cross-border tax logic.<br/>Roadmap Phase 10 and prompt restrict MVP to India-first launch. | **MEDIUM (Architectural Bloat):** Risk of spending engineering resources building global tax withholding and Stripe adapters before India product-market fit. | **India-First Configuration MVP:** Maintain database schema columns for `currency`, `target_career_market_id`, and `country_code`, but lock default constants to `INR`, `CM-IN`, `IN`, `Asia/Kolkata`. Hide multi-currency UI in MVP. Defer PayPal/Stripe to Phase 10/V2. | Solution Architect | Confirmed Conflict (Resolved in PRD) |
| **AUDIT-12** | Dependencies Inherited from v5 PRD | `prd.MD` §1.3 (C1-C8) vs `0004_structured_programs.sql` | v5 PRD assumed cohort-based, 4-week program subscriptions with 14-day payout holds and 4-milestone completion.<br/>One-time services (1 deliverable, 3-day hold, direct booking) were retrofitted without deprecating conflicting program-only rules. | **MEDIUM (Product Clarity):** Ambiguity in how guarantee and completion policies apply to one-time services vs programs. | Formalize dual delivery models in Canonical PRD:<br/>1. **Structured Programs:** 2, 4, or 6 weeks; multi-milestone; 14-day hold; 60-day money-back guarantee.<br/>2. **One-Time Services:** Single deliverable; 3-day hold; deliverable rubric quality guarantee. | Product Owner | Confirmed Conflict (Resolved in PRD) |
| **AUDIT-13** | Unsupported Production Readiness Claims | `docs/Architecture.md` §1.4, `Security.md` Part 1, `Deployment.md` Part 19 | Documents assert "SOC 2 Type II compliant", "Zero EU-US Data Transfer", "Multi-AZ active-active failover", "10,000 CCU sustained".<br/>No pentest reports, load test scripts, or multi-region infrastructure exist in the repository. | **HIGH (Governance / Compliance):** Misleading enterprise claims create compliance vulnerabilities during investor or customer due diligence. | Downgrade claims in Canonical PRD to **"Target Architecture & Design Objectives for Series A / Phase 11 Hardening"**. Accurately reflect current state as "Pre-Launch MVP deployed on Vercel + Managed Supabase". | Security & DevOps Lead | Confirmed Conflict (Resolved in PRD) |

---

## 5. ARCHITECTURAL CONSISTENCY & RUNTIME INVESTIGATION

### 5.1 Next.js Modular Monolith vs. FastAPI Backend

A critical architectural contradiction exists across the documentation suite:

```
DOCUMENTATION CLAIM (Backend.md):
┌─────────────────────────┐         ┌─────────────────────────┐
│ Next.js App Router (TS) │ <-----> │ FastAPI Service (Python)│
│ UI, Edge Auth, Routing  │         │ AI, Scheduling, Cron    │
└─────────────────────────┘         └─────────────────────────┘
                                                 │
                                                 ▼
                                    Managed Supabase DB (PostgreSQL 16)

ACTUAL RUNTIME IMPLEMENTATION (src/):
┌─────────────────────────────────────────────────────────────┐
│ Next.js 14 App Router (TypeScript Modular Monolith)         │
│ - UI Pages (SSR / Client Components)                        │
│ - Supabase Auth & Session Middleware                        │
│ - REST API Gateway (/api/v1/* - 48 Active Route Handlers)   │
│ - Payment Service (Razorpay + Payout Engine)                │
│ - AI Orchestration (Google Gemini 3.5 Flash Integration)    │
│ - Booking & Availability Math                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
              Managed Supabase DB (PostgreSQL 16)
              - 10 Sequential SQL Migrations (0001 - 0010)
              - Row-Level Security (RLS) Kernel Enforcement
              - pgvector (768 Dimensions)
              - pg_cron (Scheduled Sweeps)

ABANDONED ARTIFACT:
`src/backend/app/main.py` -> 49 lines, implements only `/api/health`.
```

### 5.2 Architectural Trade-Off Analysis

| Dimension | Option A: Next.js + FastAPI Hybrid (As Documented in Backend.md) | Option B: Next.js Modular Monolith (As Actually Built in Code) |
|---|---|---|
| **Operational Complexity** | **High:** Requires dual Docker builds, dual CI/CD pipelines, container orchestration (ECS/K8s), and inter-service networking. | **Low:** Single deployable artifact on Vercel Enterprise or standalone Node.js container. |
| **Authentication Consistency** | **High Risk:** Next.js uses `@supabase/ssr` cookies; FastAPI must validate Bearer JWTs via HS256/RS256. Risk of cookie/token desync and double session tracking. | **Zero Friction:** Unified `@supabase/ssr` session handling across all Server Components, Server Actions, and Route Handlers. |
| **Codebase Alignment** | **Extremely Low:** Would require rewriting 48 existing TypeScript API endpoints into Python Pydantic/FastAPI routes. | **100% Aligned:** All Phase 1–8 milestones are already implemented and tested in TypeScript Route Handlers. |
| **AI / ML Ecosystem** | **High Advantage:** Native Python integration with LangChain, PyTorch, NumPy, and Celery. | **Sufficient for MVP:** Google Gemini REST/SDK in Node.js handles LLM inference and embeddings with lower latency overhead. |
| **Recommendation** | **DEFER to V2 / Microservices Phase** if offline ML model training or complex clustering is required. | **APPROVED CANONICAL ARCHITECTURE FOR V1 MVP.** |

---

## 6. READINESS ASSESSMENT & NEXT STEPS

### 6.1 Audit Verification Summary
- **Documentation Gaps:** Formally identified and isolated. Missing documents (`V8.MD`, `Implementation.md`, `Testing.md`, `v5 PRD`) accounted for in Canonical PRD.
- **Authentication Defects:** Multi-layer root causes established (404 routing, loading state leak, cookie loss, and critical privilege escalation in trigger/RLS).
- **Contradictions:** All 13 core contradictions recorded with unique IDs, exact evidence, and proposed resolutions.
- **Readiness:** The Canonical PRD (`PRD_CANONICAL_V1.md`) is ready for human approval.

### 6.2 Pre-Implementation Prerequisites (What Must Be Resolved Before Code Changes):
1. **Product Owner Approval on Decision Register:** Sign-off on Pricing Model B (₹399 / ₹799) and standardized discount rates (10% / 20%).
2. **Tax & Earnings Sign-Off:** Confirmation of whether ₹1,000 listed price is inclusive of GST or whether mentor payout is strictly invariant at ₹800.
3. **Execution Approval for Supporting Documents:** Approval to update `Architecture.md`, `Backend.md`, `Frontend.md`, `Database.md`, `API.md`, and `Security.md` as outlined in `SUPPORTING_DOCS_CHANGE_PROPOSAL.md`.

---
*Report certified by Principal Product Architect & Technical Documentation Auditor.*
